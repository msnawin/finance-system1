package com.finance.dashboard;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.net.URI;
import java.net.URISyntaxException;

@SpringBootApplication
public class FinanceDashboardApplication {

    static {
        String databaseUrl = System.getenv("DATABASE_URL");
        if (databaseUrl != null && (databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://"))) {
            try {
                URI dbUri = new URI(databaseUrl);
                String userInfo = dbUri.getUserInfo();
                String username = userInfo.contains(":") ? userInfo.split(":")[0] : userInfo;
                String password = userInfo.contains(":") ? userInfo.split(":")[1] : "";
                
                String dbUrl = "jdbc:postgresql://" + dbUri.getHost() + ":" + dbUri.getPort() + dbUri.getPath();

                // Set multiple properties for maximum reliability across different Spring Boot versions
                System.setProperty("spring.datasource.url", dbUrl);
                System.setProperty("spring.datasource.username", username);
                System.setProperty("spring.datasource.password", password);
                System.setProperty("spring.datasource.driver-class-name", "org.postgresql.Driver");

                // Hibernate Dialect-specific aliases
                System.setProperty("jakarta.persistence.jdbc.url", dbUrl);
                System.setProperty("jakarta.persistence.jdbc.user", username);
                System.setProperty("jakarta.persistence.jdbc.password", password);
                
                System.out.println("✅ DATABASE_URL successfully converted to JDBC properties.");
            } catch (URISyntaxException | ArrayIndexOutOfBoundsException e) {
                System.err.println("❌ Critical Error parsing DATABASE_URL: " + e.getMessage());
            }
        }
    }

    public static void main(String[] args) {
        SpringApplication.run(FinanceDashboardApplication.class, args);
    }
}
