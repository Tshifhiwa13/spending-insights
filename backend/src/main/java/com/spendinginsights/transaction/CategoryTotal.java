package com.spendinginsights.transaction;

import java.math.BigDecimal;

public record CategoryTotal(Category category, BigDecimal total, long count) {
}
