package com.finance.dashboard.service;

import com.finance.dashboard.dto.CategoryTotalDto;
import com.finance.dashboard.dto.DashboardSummaryDto;
import com.finance.dashboard.dto.MonthlyTrendDto;
import com.finance.dashboard.dto.TransactionDto;
import com.finance.dashboard.model.Role;
import com.finance.dashboard.model.TransactionType;
import com.finance.dashboard.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TransactionRepository transactionRepository;

    public DashboardSummaryDto getDashboardSummary(Long userId, Role role) {
        // As per strictly user-specific requirements: everything must be isolated to logged-in user.
        Long targetUserId = userId;

        BigDecimal totalIncome = transactionRepository.sumAmountByType(TransactionType.INCOME, targetUserId);
        BigDecimal totalExpense = transactionRepository.sumAmountByType(TransactionType.EXPENSE, targetUserId);
        
        if(totalIncome == null) totalIncome = BigDecimal.ZERO;
        if(totalExpense == null) totalExpense = BigDecimal.ZERO;

        BigDecimal netBalance = totalIncome.subtract(totalExpense);

        List<Object[]> catTotals = transactionRepository.findCategoryTotals(TransactionType.EXPENSE, targetUserId);
        List<CategoryTotalDto> categoryTotals = catTotals.stream()
                .map(obj -> new CategoryTotalDto((String) obj[0], (BigDecimal) obj[1]))
                .collect(Collectors.toList());

        var recentTransactions = transactionRepository.findTop5ByDeletedFalseAndCreatedByIdOrderByDateDesc(userId);

        List<TransactionDto> recentDtos = recentTransactions.stream()
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

        List<Object[]> monthlyData = transactionRepository.findMonthlyTrends(targetUserId);
        List<MonthlyTrendDto> monthlyTrends = monthlyData.stream()
                .map(obj -> new MonthlyTrendDto((String) obj[0], (BigDecimal) obj[1], (BigDecimal) obj[2]))
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
