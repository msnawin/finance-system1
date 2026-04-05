package com.finance.dashboard.config;

import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

@Configuration
public class DatabaseConfig {

    @Bean
    @Primary
    public DataSource dataSource() {
        String databaseUrl = System.getenv("DATABASE_URL");
        
        if (databaseUrl == null || databaseUrl.isEmpty()) {
            // Fallback for local development if DATABASE_URL is not set
            return DataSourceBuilder.create()
                    .url("jdbc:postgresql://localhost:5432/finance_db")
                    .username("postgres")
                    .password("postgres")
                    .driverClassName("org.postgresql.Driver")
                    .build();
        }

        try {
            // Render DATABASE_URL is usually: postgres://user:pass@host:port/dbname
            URI dbUri = new URI(databaseUrl);
            String username = dbUri.getUserInfo().split(":")[0];
            String password = dbUri.getUserInfo().split(":")[1];
            String dbUrl = "jdbc:postgresql://" + dbUri.getHost() + ':' + dbUri.getPort() + dbUri.getPath();

            return DataSourceBuilder.create()
                    .url(dbUrl)
                    .username(username)
                    .password(password)
                    .driverClassName("org.postgresql.Driver")
                    .build();
        } catch (URISyntaxException | ArrayIndexOutOfBoundsException e) {
            // If parsing fails, try to use it as a raw JDBC URL if it already starts with jdbc:
            if (databaseUrl.startsWith("jdbc:")) {
               return DataSourceBuilder.create()
                    .url(databaseUrl)
                    .driverClassName("org.postgresql.Driver")
                    .build();
            }
            throw new RuntimeException("Failed to parse DATABASE_URL: " + databaseUrl, e);
        }
    }
}
