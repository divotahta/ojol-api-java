package com.ojol.auth.service;

import com.ojol.auth.dto.LoginRequest;
import com.ojol.auth.dto.LoginResponse;
import com.ojol.auth.model.User;
import com.ojol.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    public LoginResponse login(LoginRequest loginRequest) {
        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());
        
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            
            // Simple password check (in production, use password encoder)
            if (user.getPassword().equals(loginRequest.getPassword())) {
                String token = jwtService.generateToken(user.getEmail(), user.getRole(), user.getId());
                return new LoginResponse(token, user.getRole(), user.getId(), user.getName(), user.getEmail());
            }
        }
        
        throw new RuntimeException("Invalid email or password");
    }

    public boolean validateToken(String token) {
        try {
            String email = jwtService.extractUsername(token);
            return jwtService.isTokenValid(token, email);
        } catch (Exception e) {
            return false;
        }
    }

    public String getRoleFromToken(String token) {
        try {
            return jwtService.extractClaim(token, claims -> claims.get("role", String.class));
        } catch (Exception e) {
            return null;
        }
    }

    public Long getUserIdFromToken(String token) {
        try {
            return jwtService.extractClaim(token, claims -> claims.get("userId", Long.class));
        } catch (Exception e) {
            return null;
        }
    }
} 