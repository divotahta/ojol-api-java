package com.ojol.order.repository;

import com.ojol.order.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);
    List<Order> findByDriverId(Long driverId);
    List<Order> findByStatus(String status);
    List<Order> findByUserIdAndStatus(Long userId, String status);
} 