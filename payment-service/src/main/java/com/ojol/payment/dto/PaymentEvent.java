package com.ojol.payment.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaymentEvent {
    private Long paymentId;
    private Long orderId;
    private Long customerId;
    private BigDecimal amount;
    private String paymentMethod;
    private String status; // PENDING, COMPLETED, FAILED, CANCELLED
    private LocalDateTime createdAt;
    private String eventType; // PAYMENT_CREATED, PAYMENT_COMPLETED, PAYMENT_FAILED

    public PaymentEvent() {}

    public PaymentEvent(Long paymentId, Long orderId, Long customerId, BigDecimal amount, 
                       String paymentMethod, String status, LocalDateTime createdAt, String eventType) {
        this.paymentId = paymentId;
        this.orderId = orderId;
        this.customerId = customerId;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
        this.status = status;
        this.createdAt = createdAt;
        this.eventType = eventType;
    }

    // Getters and Setters
    public Long getPaymentId() { return paymentId; }
    public void setPaymentId(Long paymentId) { this.paymentId = paymentId; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }
} 