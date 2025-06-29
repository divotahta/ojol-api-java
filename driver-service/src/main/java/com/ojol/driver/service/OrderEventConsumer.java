package com.ojol.driver.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class OrderEventConsumer {

    private static final Logger logger = LoggerFactory.getLogger(OrderEventConsumer.class);

    @KafkaListener(topics = "order-events", groupId = "driver-service-group")
    public void handleOrderEvent(Map<String, Object> orderEvent) {
        try {
            String eventType = (String) orderEvent.get("eventType");
            Long orderId = Long.valueOf(orderEvent.get("orderId").toString());
            
            logger.info("Received order event: {} for order ID: {}", eventType, orderId);
            
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
            logger.error("Error processing order event: {}", e.getMessage());
        }
    }

    private void handleOrderCreated(Map<String, Object> orderEvent) {
        // Logic untuk notifikasi driver tentang order baru
        logger.info("New order created - notifying available drivers");
        // TODO: Implementasi notifikasi ke driver yang tersedia
    }

    private void handleOrderAccepted(Map<String, Object> orderEvent) {
        Long driverId = Long.valueOf(orderEvent.get("driverId").toString());
        logger.info("Order accepted by driver ID: {}", driverId);
        // TODO: Implementasi update status driver
    }

    private void handleOrderCompleted(Map<String, Object> orderEvent) {
        Long driverId = Long.valueOf(orderEvent.get("driverId").toString());
        logger.info("Order completed by driver ID: {}", driverId);
        // TODO: Implementasi update statistik driver
    }

    private void handleOrderCancelled(Map<String, Object> orderEvent) {
        logger.info("Order cancelled");
        // TODO: Implementasi notifikasi pembatalan
    }
} 