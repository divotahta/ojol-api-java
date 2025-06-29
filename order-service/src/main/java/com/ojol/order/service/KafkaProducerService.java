package com.ojol.order.service;

import com.ojol.order.dto.OrderEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
public class KafkaProducerService {

    private static final Logger logger = LoggerFactory.getLogger(KafkaProducerService.class);

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    public void sendOrderEvent(OrderEvent orderEvent) {
        try {
            logger.debug("Preparing to send order event: {}", orderEvent);
            logger.info("Sending order event to Kafka - Order ID: {}, Event Type: {}", 
                orderEvent.getOrderId(), orderEvent.getEventType());
            
            CompletableFuture<SendResult<String, Object>> future = 
                kafkaTemplate.send("order-events", orderEvent.getOrderId().toString(), orderEvent);
            
            future.whenComplete((result, ex) -> {
                if (ex == null) {
                    logger.info("Order event sent successfully: {} to topic: {} partition: {} offset: {}", 
                        orderEvent.getEventType(), 
                        result.getRecordMetadata().topic(),
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset());
                } else {
                    logger.error("Failed to send order event: {}", ex.getMessage(), ex);
                }
            });
            
            logger.debug("Order event send request completed for Order ID: {}", orderEvent.getOrderId());
        } catch (Exception e) {
            logger.error("Error sending order event for Order ID {}: {}", orderEvent.getOrderId(), e.getMessage(), e);
            throw new RuntimeException("Failed to send Kafka event", e);
        }
    }

    public void sendOrderCreatedEvent(OrderEvent orderEvent) {
        logger.info("Preparing ORDER_CREATED event for Order ID: {}", orderEvent.getOrderId());
        orderEvent.setEventType("ORDER_CREATED");
        sendOrderEvent(orderEvent);
    }

    public void sendOrderAcceptedEvent(OrderEvent orderEvent) {
        logger.info("Preparing ORDER_ACCEPTED event for Order ID: {}", orderEvent.getOrderId());
        orderEvent.setEventType("ORDER_ACCEPTED");
        sendOrderEvent(orderEvent);
    }

    public void sendOrderCompletedEvent(OrderEvent orderEvent) {
        logger.info("Preparing ORDER_COMPLETED event for Order ID: {}", orderEvent.getOrderId());
        orderEvent.setEventType("ORDER_COMPLETED");
        sendOrderEvent(orderEvent);
    }

    public void sendOrderCancelledEvent(OrderEvent orderEvent) {
        logger.info("Preparing ORDER_CANCELLED event for Order ID: {}", orderEvent.getOrderId());
        orderEvent.setEventType("ORDER_CANCELLED");
        sendOrderEvent(orderEvent);
    }
} 