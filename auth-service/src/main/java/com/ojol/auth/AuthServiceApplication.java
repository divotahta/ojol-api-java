package com.ojol.auth;

import com.ojol.auth.model.User;
import com.ojol.auth.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EnableDiscoveryClient
public class AuthServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthServiceApplication.class, args);
    }

    @Bean
    public CommandLineRunner initData(UserRepository userRepository) {
        return args -> {
            // Create default users if they don't exist
            if (!userRepository.existsByEmail("admin@example.com")) {
                User admin = new User("Admin", "admin@example.com", "admin123", "admin");
                userRepository.save(admin);
                System.out.println("Default admin user created");
            }
            
            if (!userRepository.existsByEmail("john@example.com")) {
                User customer = new User("John Doe", "john@example.com", "password123", "customer");
                userRepository.save(customer);
                System.out.println("Default customer user created");
            }
            
            if (!userRepository.existsByEmail("driver@example.com")) {
                User driver = new User("Driver", "driver@example.com", "driver123", "driver");
                userRepository.save(driver);
                System.out.println("Default driver user created");
            }
        };
    }
} 