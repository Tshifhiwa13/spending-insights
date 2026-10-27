package com.spendinginsights.transaction;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
public class TransactionController {

    static final int DEFAULT_RANGE_DAYS = 30;

    private final TransactionService service;
    private final Clock clock;

    public TransactionController(TransactionService service, Clock clock) {
        this.service = service;
        this.clock = clock;
    }

    @GetMapping("/transactions")
    public List<Transaction> transactions(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Category category) {
        DateRange range = resolve(from, to);
        return service.find(range.from(), range.to(), category);
    }

    @GetMapping("/insights/summary")
    public SpendingSummary summary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        DateRange range = resolve(from, to);
        return service.summarize(range.from(), range.to());
    }

    /** Defaults to the last 30 days ending today, and rejects reversed ranges. */
    private DateRange resolve(LocalDate from, LocalDate to) {
        LocalDate end = to != null ? to : LocalDate.now(clock);
        LocalDate start = from != null ? from : end.minusDays(DEFAULT_RANGE_DAYS - 1L);
        if (start.isAfter(end)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "'from' must be on or before 'to'");
        }
        return new DateRange(start, end);
    }

    private record DateRange(LocalDate from, LocalDate to) {
    }
}
