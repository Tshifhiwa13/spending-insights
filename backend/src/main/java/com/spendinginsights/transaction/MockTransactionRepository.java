package com.spendinginsights.transaction;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;
import org.springframework.stereotype.Repository;

/**
 * Generates ~6 months of realistic, deterministic mock transactions in memory.
 * The fixed random seed means the same data on every start, which keeps demos and tests stable.
 */
@Repository
public class MockTransactionRepository {

    static final int DAYS_OF_HISTORY = 180;
    static final BigDecimal MONTHLY_SALARY = new BigDecimal("28500.00");

    private static final Map<Category, List<String>> MERCHANTS = Map.of(
            Category.GROCERIES, List.of("Checkers", "Pick n Pay", "Woolworths Food", "Spar"),
            Category.TRANSPORT, List.of("Engen", "Shell", "Uber", "Gautrain"),
            Category.DINING, List.of("Nando's", "Ocean Basket", "Mugg & Bean", "Wimpy"),
            Category.ENTERTAINMENT, List.of("Netflix", "Showmax", "Ster-Kinekor", "Spotify"),
            Category.UTILITIES, List.of("Municipality Electricity", "Vodacom", "MTN", "Telkom Fibre"),
            Category.SHOPPING, List.of("Takealot", "Mr Price", "Game", "Edgars"),
            Category.HEALTH, List.of("Clicks", "Dis-Chem", "Virgin Active"));

    private static final Map<Category, int[]> AMOUNT_RANGES = Map.of(
            Category.GROCERIES, new int[] {150, 1800},
            Category.TRANSPORT, new int[] {60, 1200},
            Category.DINING, new int[] {90, 650},
            Category.ENTERTAINMENT, new int[] {60, 400},
            Category.UTILITIES, new int[] {300, 1500},
            Category.SHOPPING, new int[] {120, 2500},
            Category.HEALTH, new int[] {80, 900});

    private static final List<Category> SPEND_CATEGORIES = List.of(
            Category.GROCERIES, Category.TRANSPORT, Category.DINING, Category.ENTERTAINMENT,
            Category.UTILITIES, Category.SHOPPING, Category.HEALTH);

    private final List<Transaction> transactions;

    public MockTransactionRepository(Clock clock) {
        this.transactions = List.copyOf(generate(LocalDate.now(clock)));
    }

    public List<Transaction> findAll() {
        return transactions;
    }

    private static List<Transaction> generate(LocalDate today) {
        Random random = new Random(42);
        List<Transaction> result = new ArrayList<>();
        int sequence = 1;

        for (int offset = DAYS_OF_HISTORY - 1; offset >= 0; offset--) {
            LocalDate date = today.minusDays(offset);

            if (date.getDayOfMonth() == 25) {
                result.add(new Transaction(id(sequence++), date, "Employer Salary",
                        Category.INCOME, TransactionType.CREDIT, MONTHLY_SALARY));
            }

            int purchasesToday = random.nextInt(4);
            for (int i = 0; i < purchasesToday; i++) {
                Category category = SPEND_CATEGORIES.get(random.nextInt(SPEND_CATEGORIES.size()));
                List<String> merchants = MERCHANTS.get(category);
                int[] range = AMOUNT_RANGES.get(category);
                BigDecimal amount = BigDecimal
                        .valueOf(range[0] + random.nextDouble() * (range[1] - range[0]))
                        .setScale(2, RoundingMode.HALF_UP);

                result.add(new Transaction(id(sequence++), date,
                        merchants.get(random.nextInt(merchants.size())),
                        category, TransactionType.DEBIT, amount));
            }
        }
        return result;
    }

    private static String id(int sequence) {
        return "txn-%05d".formatted(sequence);
    }
}
