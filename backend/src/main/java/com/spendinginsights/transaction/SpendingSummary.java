package com.spendinginsights.transaction;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record SpendingSummary(
        LocalDate from,
        LocalDate to,
        BigDecimal totalSpent,
        BigDecimal totalIncome,
        List<CategoryTotal> byCategory) {
}
