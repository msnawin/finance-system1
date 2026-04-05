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
                // Support both postgres:// and postgresql:// prefixes
                String protocol = databaseUrl.startsWith("postgresql://") ? "postgresql://" : "postgres://";
                URI dbUri = new URI(databaseUrl);
                
                String userInfo = dbUri.getUserInfo();
                String username = userInfo.contains(":") ? userInfo.split(":")[0] : userInfo;
                String password = userInfo.contains(":") ? userInfo.split(":")[1] : "";
                
                String dbUrl = "jdbc:postgresql://" + dbUri.getHost() + ':' + dbUri.getPort() + dbUri.getPath();

                System.setProperty("spring.datasource.url", dbUrl);
                System.setProperty("spring.datasource.username", username);
                System.setProperty("spring.datasource.password", password);
                System.setProperty("spring.datasource.driver-class-name", "org.postgresql.Driver");
                
                System.out.println("✅ DATABASE_URL successfully parsed and converted to JDBC.");
            } catch (URISyntaxException | ArrayIndexOutOfBoundsException e) {
                System.err.println("❌ Failed to parse DATABASE_URL: " + e.getMessage());
            }
        }
    }

    public static void main(String[] args) {
        SpringApplication.run(FinanceDashboardApplication.class, args);
    }
}
