package com.finance.dashboard;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

@SpringBootApplication
public class FinanceDashboardApplication {

    public static void main(String[] args) {
        try {
            SpringApplication.run(FinanceDashboardApplication.class, args);
        } catch (Exception e) {
            System.err.println("❌ CRITICAL STARTUP ERROR:");
            e.printStackTrace();
            System.exit(1);
        }
    }

    @Bean
    @Primary
    public DataSource dataSource() {
        String databaseUrl = System.getenv("DATABASE_URL");
        System.out.println("🔍 [DEBUG] Looking for DATABASE_URL...");

        if (databaseUrl == null || databaseUrl.isEmpty()) {
            System.out.println("⚠️ [DEBUG] DATABASE_URL not found, using localhost fallback.");
            return fallbackDataSource();
        }

        try {
            System.out.println("✅ [DEBUG] DATABASE_URL found. Parsing...");
            URI dbUri = new URI(databaseUrl);
            
            String userInfo = dbUri.getUserInfo();
            String username = userInfo.contains(":") ? userInfo.split(":")[0] : userInfo;
            String password = userInfo.contains(":") ? userInfo.split(":")[1] : "";
            
            String dbUrl = "jdbc:postgresql://" + dbUri.getHost() + ":" + dbUri.getPort() + dbUri.getPath();

            HikariConfig config = new HikariConfig();
            config.setJdbcUrl(dbUrl);
            config.setUsername(username);
            config.setPassword(password);
            config.setDriverClassName("org.postgresql.Driver");
            
            // Render stability settings
            config.setMaximumPoolSize(5);
            config.setConnectionTimeout(30000);
            
            System.out.println("🚀 [DEBUG] Manual DataSource created successfully for: " + dbUrl);
            return new HikariDataSource(config);
        } catch (URISyntaxException | ArrayIndexOutOfBoundsException e) {
            System.err.println("❌ [DEBUG] Failed to parse URL: " + e.getMessage());
            return fallbackDataSource();
        }
    }

    private DataSource fallbackDataSource() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl("jdbc:postgresql://localhost:5432/finance_db");
        config.setUsername("postgres");
        config.setPassword("postgres");
        config.setDriverClassName("org.postgresql.Driver");
        return new HikariDataSource(config);
    }
}
