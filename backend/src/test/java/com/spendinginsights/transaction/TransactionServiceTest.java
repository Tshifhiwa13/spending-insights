package com.spendinginsights.transaction;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import org.junit.jupiter.api.Test;

class TransactionServiceTest {

    private static final LocalDate TODAY = LocalDate.of(2026, 6, 30);
    private final Clock clock = Clock.fixed(
            TODAY.atStartOfDay(ZoneId.systemDefault()).toInstant(), ZoneId.systemDefault());
    private final TransactionService service = new TransactionService(new MockTransactionRepository(clock));

    @Test
    void categoryTotalsAddUpToTotalSpent() {
        SpendingSummary summary = service.summarize(TODAY.minusDays(89), TODAY);

        BigDecimal categorySum = summary.byCategory().stream()
                .map(CategoryTotal::total)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        assertThat(categorySum).isEqualByComparingTo(summary.totalSpent());
    }

    @Test
    void salaryIsCountedAsIncomeOncePerMonth() {
        SpendingSummary june = service.summarize(LocalDate.of(2026, 6, 1), TODAY);

        assertThat(june.totalIncome()).isEqualByComparingTo(MockTransactionRepository.MONTHLY_SALARY);
    }

    @Test
    void resultsAreNewestFirstAndWithinRange() {
        LocalDate from = TODAY.minusDays(13);
        var results = service.find(from, TODAY, null);

        assertThat(results).isNotEmpty();
        assertThat(results).allSatisfy(t -> assertThat(t.date()).isBetween(from, TODAY));
        assertThat(results.get(0).date()).isAfterOrEqualTo(results.get(results.size() - 1).date());
    }
}
