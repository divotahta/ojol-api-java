package com.ojol.payment.service;

import com.ojol.payment.model.Payment;
import com.ojol.payment.repository.PaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Service
public class OrderEventConsumer {

    private static final Logger logger = LoggerFactory.getLogger(OrderEventConsumer.class);

    @Autowired
    private PaymentRepository paymentRepository;

    @KafkaListener(topics = "order-events", groupId = "payment-service-group")
    public void handleOrderEvent(Map<String, Object> orderEvent) {
        try {
            String eventType = (String) orderEvent.get("eventType");
            Long orderId = Long.valueOf(orderEvent.get("orderId").toString());
            
            logger.info("Payment service received order event: {} for order ID: {}", eventType, orderId);
            
            switch (eventType) {
                case "ORDER_CREATED":
                    handleOrderCreated(orderEvent);
                    break;
                case "ORDER_ACCEPTED":
                    handleOrderAccepted(orderEvent);
                    break;
                case "ORDER_COMPLETED":
                    handleOrderCompleted(orderEvent);
                    break;
                case "ORDER_CANCELLED":
                    handleOrderCancelled(orderEvent);
                    break;
                default:
                    logger.warn("Unknown event type: {}", eventType);
            }
        } catch (Exception e) {
            logger.error("Error processing order event in payment service: {}", e.getMessage());
        }
    }

    private void handleOrderCreated(Map<String, Object> orderEvent) {
        // Logic untuk membuat payment record ketika order dibuat
        Long orderId = Long.valueOf(orderEvent.get("orderId").toString());
        Long customerId = Long.valueOf(orderEvent.get("customerId").toString());
        Double totalPrice = Double.valueOf(orderEvent.get("totalPrice").toString());
        
        logger.info("Creating payment record for order ID: {}, customer ID: {}, amount: {}", 
                   orderId, customerId, totalPrice);
        // TODO: Implementasi pembuatan payment record
        Payment payment = new Payment();
        payment.setOrderId(orderId);
        payment.setAmount(BigDecimal.valueOf(totalPrice));
        payment.setMethod("cash"); // Default payment method
        payment.setStatus("pending");
        payment.setCreatedAt(LocalDateTime.now());
        payment.setUpdatedAt(LocalDateTime.now());
        paymentRepository.save(payment);
        logger.info("Payment record created successfully for order ID: {}, payment ID: {}", 
                   orderId, payment.getId());
    }

    private void handleOrderAccepted(Map<String, Object> orderEvent) {
        // Logic untuk membuat pembayaran otomatis ketika order diterima driver
        Long orderId = Long.valueOf(orderEvent.get("orderId").toString());
        Long customerId = Long.valueOf(orderEvent.get("customerId").toString());
        Double totalPrice = Double.valueOf(orderEvent.get("totalPrice").toString());
        
        logger.info("Order accepted by driver - Creating automatic payment for order ID: {}, customer ID: {}, amount: {}", 
                   orderId, customerId, totalPrice);
        
        try {
            // Cek apakah sudah ada payment untuk order ini
            Payment existingPayment = paymentRepository.findFirstByOrderId(orderId).orElse(null);
            
            if (existingPayment != null) {
                logger.info("Payment already exists for order ID: {}, updating status to pending", orderId);
                existingPayment.setStatus("pending");
                existingPayment.setUpdatedAt(LocalDateTime.now());
                paymentRepository.save(existingPayment);
            } else {
                // Buat payment baru
                Payment payment = new Payment();
                payment.setOrderId(orderId);
                payment.setAmount(BigDecimal.valueOf(totalPrice));
                payment.setMethod("cash"); // Default payment method
                payment.setStatus("pending");
                payment.setCreatedAt(LocalDateTime.now());
                payment.setUpdatedAt(LocalDateTime.now());
                
                Payment savedPayment = paymentRepository.save(payment);
                logger.info("Automatic payment created successfully for order ID: {}, payment ID: {}", 
                           orderId, savedPayment.getId());
            }
        } catch (Exception e) {
            logger.error("Failed to create automatic payment for order ID: {}, error: {}", orderId, e.getMessage());
        }
    }

    private void handleOrderCompleted(Map<String, Object> orderEvent) {
        // Logic untuk update payment status ketika order selesai
        Long orderId = Long.valueOf(orderEvent.get("orderId").toString());
        logger.info("Updating payment status for completed order ID: {}", orderId);
        
        try {
            Payment payment = paymentRepository.findFirstByOrderId(orderId).orElse(null);
            if (payment != null) {
                payment.setStatus("completed");
                payment.setPaidAt(LocalDateTime.now());
                payment.setUpdatedAt(LocalDateTime.now());
                paymentRepository.save(payment);
                logger.info("Payment status updated to completed for order ID: {}", orderId);
            } else {
                logger.warn("No payment found for completed order ID: {}", orderId);
            }
        } catch (Exception e) {
            logger.error("Failed to update payment status for order ID: {}, error: {}", orderId, e.getMessage());
        }
    }

    private void handleOrderCancelled(Map<String, Object> orderEvent) {
        // Logic untuk refund atau cancel payment
        Long orderId = Long.valueOf(orderEvent.get("orderId").toString());
        logger.info("Processing payment cancellation for order ID: {}", orderId);
        
        try {
            Payment payment = paymentRepository.findFirstByOrderId(orderId).orElse(null);
            if (payment != null) {
                payment.setStatus("cancelled");
                payment.setUpdatedAt(LocalDateTime.now());
                paymentRepository.save(payment);
                logger.info("Payment status updated to cancelled for order ID: {}", orderId);
            } else {
                logger.warn("No payment found for cancelled order ID: {}", orderId);
            }
        } catch (Exception e) {
            logger.error("Failed to cancel payment for order ID: {}, error: {}", orderId, e.getMessage());
        }
    }
} 