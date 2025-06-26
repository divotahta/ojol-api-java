package com.ojol.user.controller;

import com.ojol.user.client.CustomerClient;
import com.ojol.user.dto.CustomerDto;
import com.ojol.user.dto.UserDto;
import com.ojol.user.dto.UserUpdateRequest;
import com.ojol.user.model.User;
import com.ojol.user.repository.UserRepository;
import com.ojol.user.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerClient customerClient;

    @Autowired
    private UserService userService;

    // User endpoints
    @PostMapping
    public ResponseEntity<User> createUser(@Valid @RequestBody User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().build();
        }
        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(savedUser);
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        Optional<User> user = userRepository.findById(id);
        return user.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/customer")
    public ResponseEntity<CustomerDto> getUserCustomerData(@PathVariable Long id) {
        Optional<User> user = userRepository.findById(id);
        if (user.isPresent()) {
            try {
                CustomerDto customer = customerClient.getCustomerByUserId(id.toString());
                return ResponseEntity.ok(customer);
            } catch (Exception e) {
                return ResponseEntity.notFound().build();
            }
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/with-customer")
    public ResponseEntity<UserDto> getUserWithCustomerData(@PathVariable Long id) {
        UserDto userWithCustomer = userService.getUserWithCustomerData(id);
        if (userWithCustomer != null) {
            return ResponseEntity.ok(userWithCustomer);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/customers")
    public ResponseEntity<List<CustomerDto>> getAllCustomers() {
        List<CustomerDto> customers = userService.getAllCustomers();
        return ResponseEntity.ok(customers);
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody UserUpdateRequest userDetails) {
        // Manual validation
        if (userDetails.getName() == null || userDetails.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        if (userDetails.getEmail() == null || userDetails.getEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        if (userDetails.getRole() == null || userDetails.getRole().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        Optional<User> user = userRepository.findById(id);
        if (user.isPresent()) {
            User existingUser = user.get();
            existingUser.setName(userDetails.getName().trim());
            existingUser.setEmail(userDetails.getEmail().trim());
            existingUser.setRole(userDetails.getRole().trim());
            
            // Only update password if it's not empty
            if (userDetails.getPassword() != null && !userDetails.getPassword().trim().isEmpty()) {
                existingUser.setPassword(userDetails.getPassword().trim());
            }
            
            User updatedUser = userRepository.save(existingUser);
            return ResponseEntity.ok(updatedUser);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
} 