package com.ojol.customer.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())               // Nonaktifkan CSRF
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()               // Semua request diizinkan tanpa login
            )
            .httpBasic(httpBasic -> httpBasic.disable()) // Nonaktifkan Basic Auth
            .formLogin(form -> form.disable());          // Nonaktifkan Form Login

        return http.build();
    }
}
