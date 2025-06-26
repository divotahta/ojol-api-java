package com.ojol.user.client;

import com.ojol.user.dto.CustomerDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "customer-service")
public interface CustomerClient {
    
    @GetMapping("/customers")
    List<CustomerDto> getAllCustomers();
    
    @GetMapping("/customers/{id}")
    CustomerDto getCustomerById(@PathVariable("id") Long id);
    
    @GetMapping("/customers/user/{userId}")
    CustomerDto getCustomerByUserId(@PathVariable("userId") String userId);
    
    @PostMapping("/customers")
    CustomerDto createCustomer(@RequestBody CustomerDto customer);
    
    @PutMapping("/customers/{id}")
    CustomerDto updateCustomer(@PathVariable("id") Long id, @RequestBody CustomerDto customer);
    
    @DeleteMapping("/customers/{id}")
    void deleteCustomer(@PathVariable("id") Long id);
} 