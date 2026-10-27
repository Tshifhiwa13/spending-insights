package com.spendinginsights.transaction;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class TransactionService {

    private final MockTransactionRepository repository;

    public TransactionService(MockTransactionRepository repository) {
        this.repository = repository;
    }

    /** Transactions in the inclusive date range, newest first, optionally filtered by category. */
    public List<Transaction> find(LocalDate from, LocalDate to, Category category) {
        return repository.findAll().stream()
                .filter(t -> !t.date().isBefore(from) && !t.date().isAfter(to))
                .filter(t -> category == null || t.category() == category)
                .sorted(Comparator.comparing(Transaction::date).reversed()
                        .thenComparing(Transaction::id, Comparator.reverseOrder()))
                .toList();
    }

    public SpendingSummary summarize(LocalDate from, LocalDate to) {
        List<Transaction> inRange = find(from, to, null);

        BigDecimal totalSpent = sum(inRange, TransactionType.DEBIT);
        BigDecimal totalIncome = sum(inRange, TransactionType.CREDIT);

        Map<Category, BigDecimal> totals = new EnumMap<>(Category.class);
        Map<Category, Long> counts = new EnumMap<>(Category.class);
        inRange.stream()
                .filter(t -> t.type() == TransactionType.DEBIT)
                .forEach(t -> {
                    totals.merge(t.category(), t.amount(), BigDecimal::add);
                    counts.merge(t.category(), 1L, Long::sum);
                });

        List<CategoryTotal> byCategory = totals.entrySet().stream()
                .map(e -> new CategoryTotal(e.getKey(), e.getValue(), counts.get(e.getKey())))
                .sorted(Comparator.comparing(CategoryTotal::total).reversed())
                .toList();

        return new SpendingSummary(from, to, totalSpent, totalIncome, byCategory);
    }

    private static BigDecimal sum(List<Transaction> transactions, TransactionType type) {
        return transactions.stream()
                .filter(t -> t.type() == type)
                .map(Transaction::amount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
