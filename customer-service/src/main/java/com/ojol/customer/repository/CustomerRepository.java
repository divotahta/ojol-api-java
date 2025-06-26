package com.ojol.customer.repository;

import com.ojol.customer.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Customer findById(long id);
    Optional<Customer> findByUserId(String userId);
} 