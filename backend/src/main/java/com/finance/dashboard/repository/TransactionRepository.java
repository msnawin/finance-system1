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
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // For logical deletion
    Page<Transaction> findByDeletedFalse(Pageable pageable);

    // Filtering active transactions
    @Query("SELECT t FROM Transaction t WHERE t.deleted = false AND t.createdBy.id = :userId AND " +
           "(:type IS NULL OR t.type = :type) AND " +
           "(:category IS NULL OR t.category = :category) AND " +
           "(:startDate IS NULL OR t.date >= :startDate) AND " +
           "(:endDate IS NULL OR t.date <= :endDate) AND " +
           "(:search IS NULL OR LOWER(t.notes) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(t.category) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Transaction> findAllFiltered(
            @Param("type") TransactionType type,
            @Param("category") String category,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("search") String search,
            @Param("userId") Long userId,
            Pageable pageable);

    // Dashboard Queries
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.deleted = false AND t.type = :type AND (:userId IS NULL OR t.createdBy.id = :userId)")
    BigDecimal sumAmountByType(@Param("type") TransactionType type, @Param("userId") Long userId);

    @Query("SELECT t.category as category, SUM(t.amount) as totalAmount FROM Transaction t WHERE t.deleted = false AND t.type = :type AND (:userId IS NULL OR t.createdBy.id = :userId) GROUP BY t.category")
    List<Object[]> findCategoryTotals(@Param("type") TransactionType type, @Param("userId") Long userId);

    List<Transaction> findTop5ByDeletedFalseAndCreatedByIdOrderByDateDesc(Long userId);
    List<Transaction> findTop5ByDeletedFalseOrderByDateDesc();

    // For Monthly Trends
    @Query(value = "SELECT DATE_FORMAT(date, '%Y-%m') as monthStr, " +
            "SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END) as income, " +
            "SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) as expense " +
            "FROM transactions WHERE deleted = false AND (:userId IS NULL OR created_by_id = :userId) " +
            "GROUP BY DATE_FORMAT(date, '%Y-%m') ORDER BY monthStr DESC LIMIT 12", nativeQuery = true)
    List<Object[]> findMonthlyTrends(@Param("userId") Long userId);
}
