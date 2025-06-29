package com.ojol.order.service;

import com.ojol.order.client.DriverClient;
import com.ojol.order.dto.DriverDto;
import com.ojol.order.model.Order;
import com.ojol.order.repository.OrderRepository;
import com.ojol.order.client.UserClient;
import com.ojol.order.dto.UserDto;
import com.ojol.order.dto.OrderEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;
import com.ojol.order.client.PaymentClient;
import com.ojol.order.dto.PaymentDto;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.Set;

@Service
@Slf4j
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private UserClient userClient;
    
    @Autowired
    private DriverClient driverClient;
    
    @Autowired
    private PaymentClient paymentClient;
    
    @Autowired
    private KafkaProducerService kafkaProducerService;
    
    // public List<Order> getAllOrders() {
    //     log.info("Mengambil semua order dari database lokal");
    //     List<Order> orders = orderRepository.findAll();
        
    //     // Check payment status for each order
    //     orders.forEach(order -> {
    //         try {
    //             boolean isPaid = isOrderPaid(order.getId());
    //             order.setPaid(isPaid);
    //         } catch (Exception e) {
    //             log.error("Gagal mengecek status pembayaran order {}: {}", order.getId(), e.getMessage());
    //         }
    //     });
        
    //     return orders;
    // }
    
    // public Optional<Order> getOrderById(Long id) {
    //     log.info("Mengambil order dengan ID: {}", id);
    //     Optional<Order> orderOpt = orderRepository.findById(id);
        
    //     if (orderOpt.isPresent()) {
    //         Order order = orderOpt.get();
    //         try {
    //             boolean isPaid = isOrderPaid(id);
    //             order.setPaid(isPaid); // Tambahkan field paid di Order model
    //             log.info("Order {} status pembayaran: {}", id, isPaid ? "Lunas" : "Belum Lunas");
    //         } catch (Exception e) {
    //             log.error("Gagal mengecek status pembayaran order {}: {}", id, e.getMessage());
    //         }
    //     }
        
    //     return orderOpt;
    // }
    
    private boolean hasWaitingOrder(Long userId) {
        log.info("Mengecek order dengan status waiting untuk user ID: {}", userId);
        List<Order> waitingOrders = orderRepository.findByUserIdAndStatus(userId, "waiting");
        return !waitingOrders.isEmpty();
    }
    
    public Order createOrder(Order order) {
        log.info("Membuat order baru untuk user ID: {}", order.getUserId());
        
        // Check if user has waiting order
        if (hasWaitingOrder(order.getUserId())) {
            log.error("User {} masih memiliki order dengan status waiting", order.getUserId());
            throw new RuntimeException("Tidak dapat membuat order baru karena masih ada order yang menunggu driver");
        }
        
        // Set default values
        order.setStatus("waiting");
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());
        
        // Calculate distance and price
        BigDecimal distance = calculateDistance(
            order.getOriginLat(), 
            order.getOriginLng(), 
            order.getDestinationLat(), 
            order.getDestinationLng()
        );
        order.setDistance(distance);
        
        BigDecimal price = calculatePrice(distance);
        order.setPrice(price);
        
        Order savedOrder = orderRepository.save(order);
        log.info("Order berhasil dibuat dengan ID: {}, harga: {}, jarak: {} km", 
            savedOrder.getId(), 
            savedOrder.getPrice(), 
            savedOrder.getDistance()
        );
        
        // Buat pembayaran otomatis saat order dibuat
        try {
            createPayment(savedOrder);
            log.info("Pembayaran otomatis berhasil dibuat untuk order ID: {}", savedOrder.getId());
        } catch (Exception e) {
            log.error("Gagal membuat pembayaran otomatis untuk order {}: {}", savedOrder.getId(), e.getMessage());
            // Jangan throw exception karena order sudah berhasil dibuat
        }
        
        // Send Kafka event
        try {
            OrderEvent orderEvent = new OrderEvent();
            orderEvent.setOrderId(savedOrder.getId());
            orderEvent.setCustomerId(savedOrder.getUserId());
            orderEvent.setPickupLocation(savedOrder.getOrigin());
            orderEvent.setDestinationLocation(savedOrder.getDestination());
            orderEvent.setTotalPrice(savedOrder.getPrice());
            orderEvent.setStatus(savedOrder.getStatus());
            orderEvent.setCreatedAt(savedOrder.getCreatedAt());
            
            log.info("Attempting to send order created event to Kafka for order ID: {}", savedOrder.getId());
            kafkaProducerService.sendOrderCreatedEvent(orderEvent);
            log.info("Order created event sent to Kafka for order ID: {}", savedOrder.getId());
        } catch (Exception e) {
            log.error("Failed to send order created event to Kafka for order ID {}: {}", savedOrder.getId(), e.getMessage());
            log.error("Stack trace:", e);
            // Don't throw exception to avoid breaking order creation
        }
        
        return savedOrder;
    }
    
    // public Order updateOrder(Long id, Order orderDetails) {
    //     log.info("Update order dengan ID: {}", id);
        
    //     Optional<Order> orderOpt = orderRepository.findById(id);
    //     if (orderOpt.isPresent()) {
    //         Order order = orderOpt.get();
            
    //         // Update fields
    //         order.setOrigin(orderDetails.getOrigin());
    //         order.setOriginLat(orderDetails.getOriginLat());
    //         order.setOriginLng(orderDetails.getOriginLng());
    //         order.setDestination(orderDetails.getDestination());
    //         order.setDestinationLat(orderDetails.getDestinationLat());
    //         order.setDestinationLng(orderDetails.getDestinationLng());
    //         order.setStatus(orderDetails.getStatus());
    //         order.setUpdatedAt(LocalDateTime.now());
            
    //         // Recalculate price if location changed
    //         order.setPrice(calculatePrice(calculateDistance(
    //             order.getOriginLat(), 
    //             order.getOriginLng(), 
    //             order.getDestinationLat(), 
    //             order.getDestinationLng()
    //         )));
            
    //         Order updatedOrder = orderRepository.save(order);
    //         log.info("Order berhasil diupdate: {}", updatedOrder.getId());
    //         return updatedOrder;
    //     } else {
    //         log.error("Order dengan ID {} tidak ditemukan", id);
    //         throw new RuntimeException("Order tidak ditemukan: " + id);
    //     }
    // }
    
    public Order assignDriverToOrder(Long orderId, Long driverId) {
        log.info("Mengassign driver {} ke order {}", driverId, orderId);
        
        // Validasi driver exists dan available
        try {
            DriverDto driver = driverClient.getDriverById(driverId);
            log.info("Driver ditemukan: {} (ID: {})", driver.getName(), driver.getId());
            
            // Check if driver is available
            if (!"available".equals(driver.getStatus())) {
                log.error("Driver {} tidak available, status: {}", driverId, driver.getStatus());
                throw new RuntimeException("Driver tidak available");
            }
        } catch (Exception e) {
            log.error("Driver dengan ID {} tidak ditemukan di Driver Service", driverId);
            throw new RuntimeException("Driver tidak ditemukan: " + driverId);
        }
        
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            
            // Validasi order status
            if (!"waiting".equals(order.getStatus())) {
                log.error("Order {} tidak dalam status waiting, current status: {}", orderId, order.getStatus());
                throw new RuntimeException("Order tidak dalam status waiting");
            }
            
            // Update order dengan driver dan status in_progress
            order.setDriverId(driverId);
            order.setStatus("in_progress");
            order.setUpdatedAt(LocalDateTime.now());
            
            Order updatedOrder = orderRepository.save(order);
            log.info("Driver {} berhasil diassign ke order {} dengan status in_progress", driverId, orderId);
            
            // Update driver status to unavailable
            try {
                driverClient.updateDriverStatus(driverId, "unavailable");
                log.info("Status driver {} diupdate menjadi unavailable", driverId);
            } catch (Exception e) {
                log.error("Gagal update status driver: {}", e.getMessage());
            }
            
            // Send Kafka event ORDER_ACCEPTED
            try {
                OrderEvent orderEvent = new OrderEvent();
                orderEvent.setOrderId(updatedOrder.getId());
                orderEvent.setCustomerId(updatedOrder.getUserId());
                orderEvent.setDriverId(updatedOrder.getDriverId());
                orderEvent.setPickupLocation(updatedOrder.getOrigin());
                orderEvent.setDestinationLocation(updatedOrder.getDestination());
                orderEvent.setTotalPrice(updatedOrder.getPrice());
                orderEvent.setStatus(updatedOrder.getStatus());
                orderEvent.setCreatedAt(updatedOrder.getCreatedAt());
                
                kafkaProducerService.sendOrderAcceptedEvent(orderEvent);
                log.info("Order accepted event sent to Kafka for order ID: {} - Status: in_progress", updatedOrder.getId());
            } catch (Exception e) {
                log.error("Failed to send order accepted event to Kafka: {}", e.getMessage());
                // Jangan throw exception karena order sudah berhasil diupdate
            }
            
            return updatedOrder;
        } else {
            log.error("Order dengan ID {} tidak ditemukan", orderId);
            throw new RuntimeException("Order tidak ditemukan: " + orderId);
        }
    }
    
    public Order updateOrderStatus(Long orderId, String status) {
        log.info("Mengupdate status order {} menjadi {}", orderId, status);
        
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order tidak ditemukan"));

        // Validasi transisi status
        validateStatusTransition(order.getStatus(), status);
        
        // Update status
        order.setStatus(status);
        order.setUpdatedAt(LocalDateTime.now());
        
        Order updatedOrder = orderRepository.save(order);
        
        // Send Kafka event based on status
        try {
            OrderEvent orderEvent = new OrderEvent();
            orderEvent.setOrderId(updatedOrder.getId());
            orderEvent.setCustomerId(updatedOrder.getUserId());
            orderEvent.setDriverId(updatedOrder.getDriverId());
            orderEvent.setPickupLocation(updatedOrder.getOrigin());
            orderEvent.setDestinationLocation(updatedOrder.getDestination());
            orderEvent.setTotalPrice(updatedOrder.getPrice());
            orderEvent.setStatus(updatedOrder.getStatus());
            orderEvent.setCreatedAt(updatedOrder.getCreatedAt());
            
            switch (status) {
                case "completed":
                    kafkaProducerService.sendOrderCompletedEvent(orderEvent);
                    log.info("Order completed event sent to Kafka for order ID: {}", orderId);
                    break;
                case "cancelled":
                    kafkaProducerService.sendOrderCancelledEvent(orderEvent);
                    log.info("Order cancelled event sent to Kafka for order ID: {}", orderId);
                    break;
            }
        } catch (Exception e) {
            log.error("Failed to send order status event to Kafka: {}", e.getMessage());
        }
        
        return updatedOrder;
    }
    
    private void createPayment(Order order) {
        try {
            log.info("Membuat pembayaran untuk order ID: {} dengan method: {} dan amount: {}", 
                    order.getId(), order.getPaymentMethod(), order.getPrice());
            
            PaymentDto paymentDto = new PaymentDto();
            paymentDto.setOrderId(order.getId());
            paymentDto.setAmount(order.getPrice());
            paymentDto.setMethod(order.getPaymentMethod() != null ? order.getPaymentMethod() : "cash");
            paymentDto.setStatus("pending");
            
            log.info("PaymentDto yang akan dikirim: orderId={}, amount={}, method={}, status={}", 
                    paymentDto.getOrderId(), paymentDto.getAmount(), paymentDto.getMethod(), paymentDto.getStatus());
            
            PaymentDto createdPayment = paymentClient.createPayment(paymentDto);
            
            log.info("Pembayaran berhasil dibuat dengan ID: {} untuk order ID: {}", 
                    createdPayment.getId(), order.getId());
                    
        } catch (Exception e) {
            log.error("Gagal membuat pembayaran untuk order ID {}: {}", order.getId(), e.getMessage());
            log.error("Stack trace:", e);
            // Jangan throw exception karena order sudah berhasil dibuat
        }
    }

    private void validateStatusTransition(String currentStatus, String newStatus) {
        // Definisi status yang valid untuk setiap status saat ini
        Map<String, Set<String>> validTransitions = Map.of(
            "waiting", Set.of("in_progress", "cancelled"),
            "in_progress", Set.of("in_progress", "cancelled"),
            "in_progress", Set.of("completed", "cancelled"),
            "completed", Set.of(),
            "cancelled", Set.of()
        );

        Set<String> validNextStatus = validTransitions.get(currentStatus);
        if (validNextStatus == null || !validNextStatus.contains(newStatus)) {
            throw new RuntimeException(
                String.format("Tidak dapat mengubah status dari '%s' ke '%s'", currentStatus, newStatus)
            );
        }
    }
    
    private BigDecimal calculateDistance(BigDecimal originLat, BigDecimal originLng, 
                                       BigDecimal destLat, BigDecimal destLng) {
        if (originLat == null || originLng == null || destLat == null || destLng == null) {
            return BigDecimal.ZERO;
        }

        // Haversine formula
        double lat1 = Math.toRadians(originLat.doubleValue());
        double lat2 = Math.toRadians(destLat.doubleValue());
        double deltaLat = Math.toRadians(destLat.subtract(originLat).doubleValue());
        double deltaLng = Math.toRadians(destLng.subtract(originLng).doubleValue());

        double a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                   Math.cos(lat1) * Math.cos(lat2) *
                   Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        // Earth radius in kilometers
        double earthRadius = 6371;
        double distance = earthRadius * c;

        // Round to 2 decimal places
        return new BigDecimal(distance).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculatePrice(BigDecimal distance) {
        // Base price
        BigDecimal basePrice = new BigDecimal("10000");
        
        // Price per kilometer
        BigDecimal pricePerKm = new BigDecimal("5000");
        
        // Calculate total price
        BigDecimal distancePrice = distance.multiply(pricePerKm);
        BigDecimal totalPrice = basePrice.add(distancePrice);
        
        // Round to nearest thousand
        return totalPrice.setScale(-3, RoundingMode.CEILING);
    }
    
    // public List<Order> getOrdersByUserId(Long userId) {
    //     log.info("Mengambil semua order untuk user ID: {}", userId);
        
    //     // Validasi user exists
    //     try {
    //         UserDto user = userClient.getUserById(userId);
    //         log.info("User ditemukan: {} (ID: {})", user.getName(), user.getId());
    //     } catch (Exception e) {
    //         log.error("User dengan ID {} tidak ditemukan di User Service", userId);
    //         throw new RuntimeException("User tidak ditemukan: " + userId);
    //     }
        
    //     return orderRepository.findByUserId(userId);
    // }
    
    // public List<Order> getOrdersByDriverId(Long driverId) {
    //     log.info("Mengambil semua order untuk driver ID: {}", driverId);
        
    //     // Validasi driver exists
    //     try {
    //         DriverDto driver = driverClient.getDriverById(driverId);
    //         log.info("Driver ditemukan: {} (ID: {})", driver.getName(), driver.getId());
    //     } catch (Exception e) {
    //         log.error("Driver dengan ID {} tidak ditemukan di Driver Service", driverId);
    //         throw new RuntimeException("Driver tidak ditemukan: " + driverId);
    //     }
        
    //     return orderRepository.findByDriverId(driverId);
    // }
    
    // public void deleteOrder(Long id) {
    //     log.info("Menghapus order dengan ID: {}", id);
        
    //     Optional<Order> orderOpt = orderRepository.findById(id);
    //     if (orderOpt.isPresent()) {
    //         Order order = orderOpt.get();
            
    //         // If order has driver in_progress, make driver available again
    //         if (order.getDriverId() != null && !"completed".equals(order.getStatus())) {
    //             try {
    //                 driverClient.updateDriverStatus(order.getDriverId(), "available");
    //                 log.info("Driver {} diupdate menjadi available setelah order dihapus", order.getDriverId());
    //             } catch (Exception e) {
    //                 log.error("Gagal update status driver: {}", e.getMessage());
    //             }
    //         }
            
    //         orderRepository.deleteById(id);
    //         log.info("Order {} berhasil dihapus", id);
    //     } else {
    //         log.error("Order dengan ID {} tidak ditemukan", id);
    //         throw new RuntimeException("Order tidak ditemukan: " + id);
    //     }
    // }

    // public boolean isOrderPaid(Long orderId) {
    //     try {
    //         PaymentDto payment = paymentClient.getPaymentByOrderId(orderId);
    //         return payment != null && "completed".equals(payment.getStatus());
    //     } catch (Exception e) {
    //         log.error("Error checking payment status for order {}: {}", orderId, e.getMessage());
    //         return false;
    //     }
    // }
} 