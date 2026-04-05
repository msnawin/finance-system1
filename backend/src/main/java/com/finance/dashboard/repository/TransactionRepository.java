package com.finance.dashboard.repository;

import com.finance.dashboard.model.Transaction;
import com.finance.dashboard.model.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    /**
     * Filtered query. If userId is NULL (admin), returns all transactions.
     * If userId is provided, returns only that user's transactions.
     */
    @Query(value = "SELECT * FROM transactions t WHERE t.deleted = false AND " +
                   "(:userId IS NULL OR t.created_by_id = :userId) AND " +
                   "(:type IS NULL OR t.type = :type) AND " +
                   "(:category IS NULL OR t.category = :category) AND " +
                   "(:startDate IS NULL OR t.date >= :startDate) AND " +
                   "(:endDate IS NULL OR t.date <= :endDate) AND " +
                   "(:search IS NULL OR LOWER(CAST(t.notes AS TEXT)) LIKE LOWER(CONCAT('%', :search, '%')) " +
                   "   OR LOWER(CAST(t.category AS TEXT)) LIKE LOWER(CONCAT('%', :search, '%')))",
           countQuery = "SELECT count(*) FROM transactions t WHERE t.deleted = false AND " +
                        "(:userId IS NULL OR t.created_by_id = :userId) AND " +
                        "(:type IS NULL OR t.type = :type) AND " +
                        "(:category IS NULL OR t.category = :category) AND " +
                        "(:startDate IS NULL OR t.date >= :startDate) AND " +
                        "(:endDate IS NULL OR t.date <= :endDate) AND " +
                        "(:search IS NULL OR LOWER(CAST(t.notes AS TEXT)) LIKE LOWER(CONCAT('%', :search, '%')) " +
                        "   OR LOWER(CAST(t.category AS TEXT)) LIKE LOWER(CONCAT('%', :search, '%')))",
           nativeQuery = true)
    Page<Transaction> findAllFiltered(
            @Param("userId") Long userId,
            @Param("type") String type, // String for native
            @Param("category") String category,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("search") String search,
            Pageable pageable);

    // Dashboard: sum by type, optionally scoped to a user
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.deleted = false AND t.type = :type AND (:userId IS NULL OR t.createdBy.id = :userId)")
    BigDecimal sumAmountByType(@Param("type") TransactionType type, @Param("userId") Long userId);

    // Category breakdown (for pie chart)
    @Query("SELECT t.category as category, SUM(t.amount) as totalAmount FROM Transaction t " +
           "WHERE t.deleted = false AND t.type = :type AND (:userId IS NULL OR t.createdBy.id = :userId) " +
           "GROUP BY t.category")
    List<Object[]> findCategoryTotals(@Param("type") TransactionType type, @Param("userId") Long userId);

    // Recent transactions (user-scoped or all)
    @Query("SELECT t FROM Transaction t WHERE t.deleted = false AND (:userId IS NULL OR t.createdBy.id = :userId) " +
           "ORDER BY t.date DESC")
    List<Transaction> findRecentTransactions(@Param("userId") Long userId, Pageable pageable);

    // Monthly trends (last 12 months) — PostgreSQL compatible
    @Query(value = "SELECT TO_CHAR(date, 'YYYY-MM') as monthStr, " +
            "SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END) as income, " +
            "SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) as expense " +
            "FROM transactions WHERE deleted = false AND (:userId IS NULL OR created_by_id = :userId) " +
            "GROUP BY TO_CHAR(date, 'YYYY-MM') ORDER BY monthStr DESC LIMIT 12", nativeQuery = true)
    List<Object[]> findMonthlyTrends(@Param("userId") Long userId);
}
