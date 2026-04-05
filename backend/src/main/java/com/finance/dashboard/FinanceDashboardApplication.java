package com.finance.dashboard;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

@SpringBootApplication
@RestController
public class FinanceDashboardApplication {

    public static void main(String[] args) {
        try {
            SpringApplication.run(FinanceDashboardApplication.class, args);
        } catch (Exception e) {
            System.err.println("❌❌❌ CRITICAL STARTUP ERROR ❌❌❌");
            e.printStackTrace();
            System.out.flush();
            System.err.flush();
            System.exit(1);
        }
    }

    @GetMapping("/api/auth/health")
    public String health() {
        return "UP";
    }

    @Bean
    @Primary
    public DataSource dataSource() {
        String databaseUrl = System.getenv("DATABASE_URL");
        System.out.println("🔍 [STEP 1] Checking DATABASE_URL environment variable...");
        System.out.flush();

        if (databaseUrl == null || databaseUrl.isEmpty()) {
            System.out.println("⚠️ [WARN] No DATABASE_URL found. Using local fallback.");
            System.out.flush();
            return fallbackDataSource();
        }

        try {
            System.out.println("✅ [STEP 2] URL found. Start parsing...");
            System.out.flush();
            URI dbUri = new URI(databaseUrl);
            
            String userInfo = dbUri.getUserInfo();
            String username = (userInfo != null && userInfo.contains(":")) ? userInfo.split(":")[0] : userInfo;
            String password = (userInfo != null && userInfo.contains(":")) ? userInfo.split(":")[1] : "";
            
            // Fix: Handle cases where port is missing (-1)
            int port = dbUri.getPort();
            String host = dbUri.getHost();
            String path = dbUri.getPath();
            String jdbcPort = (port == -1) ? "5432" : String.valueOf(port);
            
            String dbUrl = "jdbc:postgresql://" + host + ":" + jdbcPort + path;
            
            System.out.println("✅ [STEP 3] JDBC URL generated: " + dbUrl);
            System.out.println("👤 [STEP 4] Using username: " + username);
            System.out.flush();

            HikariConfig config = new HikariConfig();
            config.setJdbcUrl(dbUrl);
            config.setUsername(username);
            config.setPassword(password);
            config.setDriverClassName("org.postgresql.Driver");
            
            // Stability Settings
            config.setMaximumPoolSize(4);
            config.setConnectionTimeout(10000); // 10 seconds
            config.setInitializationFailTimeout(1); // Fail fast if DB is down
            
            HikariDataSource ds = new HikariDataSource(config);
            System.out.println("🚀 [SUCCESS] Connection pool initialized!");
            System.out.flush();
            return ds;
            
        } catch (URISyntaxException | ArrayIndexOutOfBoundsException e) {
            System.err.println("❌ [ERROR] URL PARSING FAILED: " + e.getMessage());
            e.printStackTrace();
            System.err.flush();
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
