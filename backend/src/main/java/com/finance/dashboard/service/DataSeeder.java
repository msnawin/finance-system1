package com.finance.dashboard.service;

import com.finance.dashboard.model.Role;
import com.finance.dashboard.model.Transaction;
import com.finance.dashboard.model.TransactionType;
import com.finance.dashboard.model.User;
import com.finance.dashboard.model.UserStatus;
import com.finance.dashboard.repository.TransactionRepository;
import com.finance.dashboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        boolean needsReset = userRepository.findAll().stream()
                .anyMatch(u -> u.getPassword() == null || !u.getPassword().startsWith("$2a$"));

        if (needsReset) {
            transactionRepository.deleteAll();
            userRepository.deleteAll();
            System.out.println("DataSeeder: Cleared existing tables because legacy users (without passwords) were detected.");
        }

        if (userRepository.count() == 0) {
            String defaultPassword = passwordEncoder.encode("admin123");
            User admin = User.builder().name("Admin User").email("admin@finance.com").password(defaultPassword).role(Role.ADMIN).status(UserStatus.ACTIVE).build();
            User analyst = User.builder().name("Analyst User").email("analyst@finance.com").password(defaultPassword).role(Role.ANALYST).status(UserStatus.ACTIVE).build();
            User viewer = User.builder().name("Viewer User").email("viewer@finance.com").password(defaultPassword).role(Role.VIEWER).status(UserStatus.ACTIVE).build();

            userRepository.saveAll(Arrays.asList(admin, analyst, viewer));

            // Seed some default transactions for Analyst
            if (transactionRepository.count() == 0) {
                List<Transaction> transactions = Arrays.asList(
                        Transaction.builder().amount(new BigDecimal("5000")).type(TransactionType.INCOME).category("Salary").date(LocalDate.now().minusDays(10)).createdBy(admin).build(),
                        Transaction.builder().amount(new BigDecimal("1200")).type(TransactionType.EXPENSE).category("Rent").date(LocalDate.now().minusDays(9)).createdBy(admin).build(),
                        Transaction.builder().amount(new BigDecimal("300")).type(TransactionType.EXPENSE).category("Groceries").date(LocalDate.now().minusDays(5)).createdBy(analyst).build(),
                        Transaction.builder().amount(new BigDecimal("150")).type(TransactionType.EXPENSE).category("Utilities").date(LocalDate.now().minusDays(2)).createdBy(analyst).build(),
                        Transaction.builder().amount(new BigDecimal("2000")).type(TransactionType.INCOME).category("Freelance").date(LocalDate.now().minusDays(1)).createdBy(analyst).build()
                );
                transactionRepository.saveAll(transactions);
            }
        }
    }
}
