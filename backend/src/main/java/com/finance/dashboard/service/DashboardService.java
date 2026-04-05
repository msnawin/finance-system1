package com.finance.dashboard.service;

import com.finance.dashboard.dto.CategoryTotalDto;
import com.finance.dashboard.dto.DashboardSummaryDto;
import com.finance.dashboard.dto.MonthlyTrendDto;
import com.finance.dashboard.dto.TransactionDto;
import com.finance.dashboard.model.Role;
import com.finance.dashboard.model.TransactionType;
import com.finance.dashboard.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TransactionRepository transactionRepository;

    /**
     * ADMIN / ANALYST → sees aggregate data for ALL users (targetUserId = null).
     * VIEWER → sees only their own data (targetUserId = their ID).
     */
    public DashboardSummaryDto getDashboardSummary(Long userId, Role role) {
        Long targetUserId = (role == Role.VIEWER) ? userId : null;

        BigDecimal totalIncome = transactionRepository.sumAmountByType(TransactionType.INCOME, targetUserId);
        BigDecimal totalExpense = transactionRepository.sumAmountByType(TransactionType.EXPENSE, targetUserId);
        if (totalIncome == null) totalIncome = BigDecimal.ZERO;
        if (totalExpense == null) totalExpense = BigDecimal.ZERO;

        BigDecimal netBalance = totalIncome.subtract(totalExpense);

        // Category breakdown — expenses only
        List<Object[]> catRaw = transactionRepository.findCategoryTotals(TransactionType.EXPENSE, targetUserId);
        List<CategoryTotalDto> categoryTotals = catRaw.stream()
                .map(obj -> new CategoryTotalDto((String) obj[0], (BigDecimal) obj[1]))
                .collect(Collectors.toList());

        // 5 most recent transactions
        List<TransactionDto> recentDtos = transactionRepository
                .findRecentTransactions(targetUserId, PageRequest.of(0, 5))
                .stream()
                .map(t -> {
                    TransactionDto dto = new TransactionDto();
                    dto.setId(t.getId());
                    dto.setAmount(t.getAmount());
                    dto.setType(t.getType());
                    dto.setCategory(t.getCategory());
                    dto.setDate(t.getDate());
                    dto.setNotes(t.getNotes());
                    if (t.getCreatedBy() != null) {
                        dto.setCreatedById(t.getCreatedBy().getId());
                        dto.setCreatedByName(t.getCreatedBy().getName());
                    }
                    return dto;
                }).collect(Collectors.toList());

        // Monthly trends (last 12 months)
        List<Object[]> monthlyRaw = transactionRepository.findMonthlyTrends(targetUserId);
        List<MonthlyTrendDto> monthlyTrends = monthlyRaw.stream()
                .map(obj -> new MonthlyTrendDto(
                        (String) obj[0],
                        obj[1] != null ? (BigDecimal) obj[1] : BigDecimal.ZERO,
                        obj[2] != null ? (BigDecimal) obj[2] : BigDecimal.ZERO))
                .collect(Collectors.toList());

        return DashboardSummaryDto.builder()
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .netBalance(netBalance)
                .categoryTotals(categoryTotals)
                .recentTransactions(recentDtos)
                .monthlyTrends(monthlyTrends)
                .build();
    }
}
