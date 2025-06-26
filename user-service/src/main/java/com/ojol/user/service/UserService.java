package com.ojol.user.service;

import com.ojol.user.client.CustomerClient;
import com.ojol.user.dto.CustomerDto;
import com.ojol.user.dto.UserDto;
import com.ojol.user.model.User;
import com.ojol.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CustomerClient customerClient;
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
    
    public User createUser(User user) {
        return userRepository.save(user);
    }
    
    public User updateUser(Long id, User userDetails) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setName(userDetails.getName());
            user.setEmail(userDetails.getEmail());
            user.setRole(userDetails.getRole());
            if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
                user.setPassword(userDetails.getPassword());
            }
            return userRepository.save(user);
        }
        return null;
    }
    
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
    
    public Optional<CustomerDto> getUserCustomerData(Long userId) {
        try {
            CustomerDto customer = customerClient.getCustomerByUserId(userId.toString());
            return Optional.of(customer);
        } catch (Exception e) {
            return Optional.empty();
        }
    }
    
    public UserDto getUserWithCustomerData(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            UserDto userDto = new UserDto();
            userDto.setId(user.getId());
            userDto.setName(user.getName());
            userDto.setEmail(user.getEmail());
            userDto.setRole(user.getRole());
            
            // Get customer data if available
            Optional<CustomerDto> customerOpt = getUserCustomerData(userId);
            if (customerOpt.isPresent()) {
                CustomerDto customer = customerOpt.get();
                userDto.setPhone(customer.getPhone());
                userDto.setAddress(customer.getAddress());
                userDto.setGender(customer.getGender());
                userDto.setDateOfBirth(customer.getDateOfBirth());
                userDto.setCreatedAt(customer.getCreatedAt());
                System.out.println("Customer data found for user " + userId + ": " + customer.getPhone() + ", " + customer.getAddress());
            } else {
                System.out.println("No customer data found for user " + userId);
                // Set default values
                userDto.setPhone("N/A");
                userDto.setAddress("N/A");
                userDto.setGender("N/A");
                userDto.setCreatedAt(java.time.LocalDateTime.now());
            }
            
            return userDto;
        }
        System.out.println("User not found with ID: " + userId);
        return null;
    }
    
    public List<CustomerDto> getAllCustomers() {
        try {
            return customerClient.getAllCustomers();
        } catch (Exception e) {
            return List.of();
        }
    }
} 