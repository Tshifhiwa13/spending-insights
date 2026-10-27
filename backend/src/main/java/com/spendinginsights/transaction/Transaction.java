package com.spendinginsights.transaction;

import java.math.BigDecimal;
import java.time.LocalDate;

public record Transaction(
        String id,
        LocalDate date,
        String merchant,
        Category category,
        TransactionType type,
        BigDecimal amount) {
}
