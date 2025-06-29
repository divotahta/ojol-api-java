package com.ojol.order.controller;

import com.ojol.order.model.Order;
import com.ojol.order.repository.OrderRepository;
import com.ojol.order.service.OrderService;
import com.ojol.order.client.DriverClient;
import com.ojol.order.client.PaymentClient;
import com.ojol.order.dto.DriverDto;
import com.ojol.order.dto.PaymentDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import feign.FeignException;
import java.util.HashMap;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private static final Logger log = LoggerFactory.getLogger(OrderController.class);

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderService orderService;

    @Autowired
    private DiscoveryClient discoveryClient;

    @Autowired
    private DriverClient driverClient;

    @Autowired
    private PaymentClient paymentClient;

    @PostMapping
    public ResponseEntity<?> createOrder(@Valid @RequestBody Order order) {
        try {
        // 🔍 Validasi: cek apakah user masih punya order yang belum selesai
        List<Order> userOrders = orderRepository.findByUserId(order.getUserId());
        boolean hasUnfinishedOrder = userOrders.stream()
                .anyMatch(existingOrder -> {
                    String status = existingOrder.getStatus();
                    return !"completed".equalsIgnoreCase(status)
                            && !"cancelled".equalsIgnoreCase(status)
                            && !"rejected".equalsIgnoreCase(status);
                });

        if (hasUnfinishedOrder) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Anda masih memiliki pesanan yang belum selesai. Selesaikan pesanan sebelumnya terlebih dahulu.",
                            "success", false,
                            "error", "UNFINISHED_ORDER_EXISTS"));
        }

        // 📝 Set nilai default order
        order.setStatus(order.getStatus() != null ? order.getStatus() : "waiting");
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());

            // ✅ Simpan order menggunakan OrderService yang sudah terintegrasi Kafka
            Order savedOrder = orderService.createOrder(order);

        return ResponseEntity.ok(Map.of(
                "message", "Order berhasil dibuat",
                "success", true,
                "data", savedOrder));
                    
        } catch (Exception e) {
            log.error("Error creating order: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "message", "Gagal membuat order: " + e.getMessage(),
                            "success", false,
                            "error", "ORDER_CREATION_FAILED"));
        }
    }

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Order order = orderOpt.get();
        String paymentStatus = "-";

        try {
            PaymentDto payment = paymentClient.getPaymentByOrderId(order.getId());
            if (payment != null && payment.getStatus() != null) {
                paymentStatus = payment.getStatus();
            }
        } catch (FeignException.NotFound e) {
            // Tidak ada payment untuk order ini, biarkan paymentStatus "-"
            log.warn("Payment untuk order {} tidak ditemukan", order.getId());
        } catch (Exception e) {
            log.error("Gagal mengambil data payment dari PaymentService untuk order {}", order.getId(), e);
            // Tidak melempar ke user, tapi bisa simpan log internal
        }

        Map<String, Object> result = new HashMap<>();
        result.put("order", order);
        result.put("paymentStatus", paymentStatus);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getOrdersByUserId(@PathVariable Long userId) {
        List<Order> orders = orderRepository.findByUserId(userId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<Order>> getOrdersByDriverId(@PathVariable Long driverId) {
        List<Order> orders = orderRepository.findByDriverId(driverId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Order>> getOrdersByStatus(@PathVariable String status) {
        List<Order> orders = orderRepository.findByStatus(status);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/waiting")
    public ResponseEntity<List<Order>> getWaitingOrders() {
        List<Order> orders = orderRepository.findByStatus("waiting");
        return ResponseEntity.ok(orders);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Order> updateOrder(@PathVariable Long id, @Valid @RequestBody Order orderDetails) {
        Optional<Order> order = orderRepository.findById(id);
        if (order.isPresent()) {
            Order existingOrder = order.get();
            existingOrder.setOrigin(orderDetails.getOrigin());
            existingOrder.setDestination(orderDetails.getDestination());
            existingOrder.setStatus(orderDetails.getStatus());
            existingOrder.setDriverId(orderDetails.getDriverId());
            existingOrder.setPrice(orderDetails.getPrice());
            existingOrder.setDistance(orderDetails.getDistance());
            existingOrder.setOriginLat(orderDetails.getOriginLat());
            existingOrder.setOriginLng(orderDetails.getOriginLng());
            existingOrder.setDestinationLat(orderDetails.getDestinationLat());
            existingOrder.setDestinationLng(orderDetails.getDestinationLng());

            Order updatedOrder = orderRepository.save(existingOrder);
            return ResponseEntity.ok(updatedOrder);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<?> acceptOrder(@PathVariable Long id, @RequestParam Long driverId) {
        try {
        // 1. Cek apakah driver punya order in_progress
        List<Order> driverOrders = orderRepository.findByDriverId(driverId);
        boolean hasInProgress = driverOrders.stream().anyMatch(o -> "in_progress".equalsIgnoreCase(o.getStatus()));
        if (hasInProgress) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Driver masih memiliki order yang sedang berjalan!"));
        }
            
        // 2. Cek status driver
        DriverDto driver = null;
        try {
            driver = driverClient.getDriverById(driverId);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Gagal mengambil data driver", "error", e.getMessage()));
        }

        if (driver == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Driver tidak ditemukan"));
        }

        // Validasi status driver yang lebih ketat
        String driverStatus = driver.getStatus();
        if ("unavailable".equalsIgnoreCase(driverStatus)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Driver sedang tidak tersedia. Ubah status menjadi 'Available' terlebih dahulu."));
        }
        
        if ("busy".equalsIgnoreCase(driverStatus)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Driver sedang dalam perjalanan. Selesaikan order yang sedang berlangsung terlebih dahulu."));
        }
        
        if (!"available".equalsIgnoreCase(driverStatus) && !"online".equalsIgnoreCase(driverStatus)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Driver sedang tidak available. Status saat ini: " + driverStatus));
        }
        
            // 3. Proses assign order menggunakan OrderService yang terintegrasi Kafka
            Order updatedOrder = orderService.assignDriverToOrder(id, driverId);
            return ResponseEntity.ok(Map.of("message", "Order berhasil diterima driver", "success", true, "data", updatedOrder));
            
        } catch (Exception e) {
            log.error("Error accepting order {} by driver {}: {}", id, driverId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Gagal menerima order", "error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<?> completeOrder(@PathVariable Long id) {
        try {
            Order updatedOrder = orderService.updateOrderStatus(id, "completed");
            return ResponseEntity.ok(Map.of("message", "Order completed", "success", true, "data", updatedOrder));
        } catch (Exception e) {
            log.error("Error completing order {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Gagal menyelesaikan order", "error", e.getMessage()));
        }
    }

    @GetMapping("/driver/{driverId}/in-progress")
    public ResponseEntity<List<Order>> getOrderInProgress(@PathVariable Long driverId) {
        List<Order> orders = orderRepository.findByDriverId(driverId);
        List<Order> inProgressOrders = orders.stream()
                .filter(order -> "in_progress".equalsIgnoreCase(order.getStatus()) || "cancel_requested".equalsIgnoreCase(order.getStatus()))
                .toList();
        return ResponseEntity.ok(inProgressOrders);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Order> cancelOrder(@PathVariable Long id) {
        Optional<Order> order = orderRepository.findById(id);
        if (order.isPresent()) {
            Order existingOrder = order.get();
            
            // Jika order sudah dalam proses (in_progress), ubah status menjadi cancel_requested
            if ("in_progress".equalsIgnoreCase(existingOrder.getStatus())) {
                existingOrder.setStatus("cancel_requested");
            } else {
                // Jika masih waiting, langsung cancel
                existingOrder.setStatus("cancelled");
            }

            Order updatedOrder = orderRepository.save(existingOrder);
            return ResponseEntity.ok(updatedOrder);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/approve-cancellation")
    public ResponseEntity<?> approveCancellation(@PathVariable Long id, @RequestParam Long driverId) {
        Optional<Order> order = orderRepository.findById(id);
        if (order.isPresent()) {
            Order existingOrder = order.get();
            
            // Validasi bahwa driver yang approve adalah driver yang sedang menangani order
            if (!driverId.equals(existingOrder.getDriverId())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Hanya driver yang menangani order yang dapat menyetujui pembatalan"));
            }
            
            // Validasi status order
            if (!"cancel_requested".equalsIgnoreCase(existingOrder.getStatus())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Order tidak dalam status request pembatalan"));
            }
            
            existingOrder.setStatus("cancelled");
            existingOrder.setUpdatedAt(LocalDateTime.now());
            Order updatedOrder = orderRepository.save(existingOrder);
            
            return ResponseEntity.ok(Map.of(
                "message", "Pembatalan order berhasil disetujui",
                "success", true,
                "data", updatedOrder
            ));
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/reject-cancellation")
    public ResponseEntity<?> rejectCancellation(@PathVariable Long id, @RequestParam Long driverId) {
        Optional<Order> order = orderRepository.findById(id);
        if (order.isPresent()) {
            Order existingOrder = order.get();
            
            // Validasi bahwa driver yang reject adalah driver yang sedang menangani order
            if (!driverId.equals(existingOrder.getDriverId())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Hanya driver yang menangani order yang dapat menolak pembatalan"));
            }
            
            // Validasi status order
            if (!"cancel_requested".equalsIgnoreCase(existingOrder.getStatus())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Order tidak dalam status request pembatalan"));
            }
            
            existingOrder.setStatus("in_progress");
            existingOrder.setUpdatedAt(LocalDateTime.now());
            Order updatedOrder = orderRepository.save(existingOrder);
            
            return ResponseEntity.ok(Map.of(
                "message", "Pembatalan order ditolak, order dilanjutkan",
                "success", true,
                "data", updatedOrder
            ));
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/payment")
    public ResponseEntity<?> getPaymentStatus(@PathVariable Long id) {
        log.info("Fetching order with id: {}", id);
        Optional<Order> order = orderRepository.findById(id);
        if (order.isPresent()) {
            log.info("Found order: {}", order.get());

            try {
                PaymentDto payment = paymentClient.getPaymentByOrderId(order.get().getId());
                log.info("Received payment info: {}", payment);
                return ResponseEntity.ok(payment);
            } catch (Exception e) {
                log.error("Error fetching payment info", e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("message", "Gagal mengambil data pembayaran"));
            }
        }
        log.warn("Order not found: {}", id);
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/payments/{paymentId}/status")
    public ResponseEntity<PaymentDto> updatePaymentStatusByAdmin(@PathVariable Long paymentId, @RequestBody Map<String, String> request) {
        PaymentDto payment = paymentClient.updatePaymentStatusByAdmin(paymentId, request);
        return ResponseEntity.ok(payment);
    }

    @PutMapping("/{id}/payment")
    public ResponseEntity<?> updatePaymentStatus(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isEmpty())
            return ResponseEntity.notFound().build();

        Order order = orderOpt.get();
        String newStatus = (String) request.get("status");

        try {
            PaymentDto payment = paymentClient.getPaymentByOrderId(order.getId());
            if (payment == null)
                return ResponseEntity.notFound().build();

            // Buat Map request untuk update status
            Map<String, String> updateRequest = new HashMap<>();
            updateRequest.put("status", newStatus);

            // Kirim request ke payment-service
            paymentClient.updatePaymentStatusByOrderId(order.getId(), updateRequest);

            return ResponseEntity.ok(Map.of(
                    "message", "Status pembayaran berhasil diupdate",
                    "success", true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "message", "Gagal update status pembayaran",
                    "error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<Order> rejectOrder(@PathVariable Long id) {
        Optional<Order> order = orderRepository.findById(id);
        if (order.isPresent()) {
            Order existingOrder = order.get();
            existingOrder.setDriverId(null);
            existingOrder.setStatus("waiting");

            Order updatedOrder = orderRepository.save(existingOrder);
            return ResponseEntity.ok(updatedOrder);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        if (orderRepository.existsById(id)) {
            orderRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        try {
            Optional<Order> orderOpt = orderRepository.findById(id);
            if (!orderOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Order order = orderOpt.get();
            String newStatus = (String) request.get("status");
            Long driverId = request.get("driverId") != null ? Long.valueOf(request.get("driverId").toString()) : null;

            // Validasi status transition
            if (!isValidStatusTransition(order.getStatus(), newStatus)) {
                return ResponseEntity.badRequest().body(Map.of(
                        "message", "Status transition tidak valid",
                        "success", false));
            }

            // Update order
            order.setStatus(newStatus);
            if (driverId != null) {
                order.setDriverId(driverId);
            }

            Order updatedOrder = orderRepository.save(order);
            return ResponseEntity.ok(Map.of(
                    "message", "Order berhasil diupdate",
                    "success", true,
                    "data", updatedOrder));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Error: " + e.getMessage(),
                    "success", false));
        }
    }

    @GetMapping("/driver/{driverId}/statistics")
    public ResponseEntity<?> getDriverStatistics(@PathVariable Long driverId) {
        try {
            // Ambil semua order driver
            List<Order> driverOrders = orderRepository.findByDriverId(driverId);
            
            // Hitung statistik
            long activeOrders = driverOrders.stream()
                    .filter(order -> "in_progress".equalsIgnoreCase(order.getStatus()) || 
                                   "on_trip".equalsIgnoreCase(order.getStatus()) ||
                                   "cancel_requested".equalsIgnoreCase(order.getStatus()))
                    .count();
            
            long completedOrders = driverOrders.stream()
                    .filter(order -> "completed".equalsIgnoreCase(order.getStatus()))
                    .count();
            
            // Hitung pendapatan hari ini
            LocalDateTime today = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
            double todayEarnings = driverOrders.stream()
                    .filter(order -> "completed".equalsIgnoreCase(order.getStatus()) &&
                                   order.getUpdatedAt() != null &&
                                   order.getUpdatedAt().isAfter(today))
                    .mapToDouble(order -> order.getPrice().doubleValue())
                    .sum();
            
            Map<String, Object> statistics = new HashMap<>();
            statistics.put("activeOrders", activeOrders);
            statistics.put("completedOrders", completedOrders);
            statistics.put("todayEarnings", todayEarnings);
            statistics.put("totalOrders", driverOrders.size());
            
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            log.error("Error getting driver statistics for driverId: {}", driverId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Gagal mengambil statistik driver", "error", e.getMessage()));
        }
    }

    private boolean isValidStatusTransition(String currentStatus, String newStatus) {
        Map<String, List<String>> validTransitions = Map.of(
                "waiting", List.of("in_progress", "cancelled"),
                "in_progress", List.of("on_trip", "cancelled"),
                "on_trip", List.of("completed", "cancelled"),
                "completed", List.of(),
                "cancelled", List.of());

        List<String> allowedTransitions = validTransitions.getOrDefault(currentStatus, List.of());
        return allowedTransitions.contains(newStatus);
    }
}
