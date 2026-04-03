package com.finance.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyTrendDto {
    private String month; // e.g. "2024-01"
    private BigDecimal income;
    private BigDecimal expense;
}
