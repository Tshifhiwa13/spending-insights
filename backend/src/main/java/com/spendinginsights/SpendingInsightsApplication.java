package com.spendinginsights;

import java.time.Clock;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class SpendingInsightsApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpendingInsightsApplication.class, args);
    }

    /** Injected wherever "today" matters, so tests can control time. */
    @Bean
    Clock clock() {
        return Clock.systemDefaultZone();
    }
}
