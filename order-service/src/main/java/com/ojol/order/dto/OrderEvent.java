package com.ojol.order.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderEvent {
    private Long orderId;
    private Long customerId;
    private Long driverId;
    private String pickupLocation;
    private String destinationLocation;
    private BigDecimal totalPrice;
    private String status;
    private LocalDateTime createdAt;
    private String eventType; // ORDER_CREATED, ORDER_ACCEPTED, ORDER_COMPLETED, ORDER_CANCELLED
} 