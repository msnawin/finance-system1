package com.finance.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDto {
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal netBalance;
    private List<CategoryTotalDto> categoryTotals; // Only for expanses usually, but can be both
    private List<TransactionDto> recentTransactions;
    private List<MonthlyTrendDto> monthlyTrends;
}
