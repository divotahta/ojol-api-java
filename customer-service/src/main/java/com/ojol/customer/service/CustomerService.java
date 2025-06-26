package com.ojol.customer.service;

import com.ojol.customer.model.Customer;
import com.ojol.customer.repository.CustomerRepository;
import com.ojol.customer.client.UserClient;
import com.ojol.customer.dto.UserDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CustomerService {
    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private UserClient userClient;

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Optional<Customer> getCustomerById(Long id) {
        return customerRepository.findById(id);
    }

    public Optional<Customer> getCustomerByUserId(String userId) {
        return customerRepository.findByUserId(userId);
    }

    public Customer createCustomer(Customer customer) {
        return customerRepository.save(customer);
    }

    public Customer updateCustomer(Long id, Customer customerDetails) {
        Optional<Customer> customerOpt = customerRepository.findById(id);
        if (customerOpt.isPresent()) {
            Customer customer = customerOpt.get();
            customer.setUserId(customerDetails.getUserId());
            customer.setPhone(customerDetails.getPhone());
            customer.setAddress(customerDetails.getAddress());
            customer.setGender(customerDetails.getGender());
            customer.setDateOfBirth(customerDetails.getDateOfBirth());
            customer.setUpdatedAt(java.time.LocalDateTime.now());
            return customerRepository.save(customer);
        }
        return null;
    }

    public void deleteCustomer(Long id) {
        customerRepository.deleteById(id);
    }

    public UserDto getUserDetail(Long userId) {
        return userClient.getUserById(userId);
    }
} 