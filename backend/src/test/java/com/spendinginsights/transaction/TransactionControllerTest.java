package com.spendinginsights.transaction;

import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class TransactionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void summaryReturnsTotalsForDefaultRange() throws Exception {
        mockMvc.perform(get("/api/insights/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalSpent", notNullValue()))
                .andExpect(jsonPath("$.totalIncome", notNullValue()))
                .andExpect(jsonPath("$.byCategory", notNullValue()));
    }

    @Test
    void transactionsCanBeFilteredByCategory() throws Exception {
        mockMvc.perform(get("/api/transactions").param("category", "GROCERIES"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].category", everyItem(is("GROCERIES"))));
    }

    @Test
    void reversedDateRangeIsRejected() throws Exception {
        mockMvc.perform(get("/api/transactions").param("from", "2026-02-01").param("to", "2026-01-01"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void unknownCategoryIsRejected() throws Exception {
        mockMvc.perform(get("/api/transactions").param("category", "NOT_A_CATEGORY"))
                .andExpect(status().isBadRequest());
    }
}
