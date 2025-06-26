package com.ojol.payment.service;

import com.ojol.payment.client.OrderClient;
import com.ojol.payment.client.UserClient;
import com.ojol.payment.dto.OrderDto;
import com.ojol.payment.dto.UserDto;
import com.ojol.payment.model.Payment;
import com.ojol.payment.repository.PaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class PaymentService {
    
    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private UserClient userClient;
    
    @Autowired
    private OrderClient orderClient;
    
    public List<Payment> getAllPayments() {
        log.info("Mengambil semua payment dari database lokal");
        return paymentRepository.findAll();
    }
    
    public Optional<Payment> getPaymentById(Long id) {
        log.info("Mengambil payment dengan ID: {}", id);
        return paymentRepository.findById(id);
    }
    
    public Payment createPayment(Payment payment) {
        log.info("Membuat payment baru untuk order ID: {}", payment.getOrderId());
        
        
        
        // Validasi order exists di Order Service
        try {
            OrderDto order = orderClient.getOrderById(payment.getOrderId());
            log.info("Order ditemukan: {} (ID: {})", order.getOrigin(), order.getId());
            
            // Set amount from order price if not provided
            if (payment.getAmount() == null) {
                payment.setAmount(order.getPrice());
                log.info("Amount diambil dari order: {}", order.getPrice());
            }
            
            // Validate amount matches order price
            if (payment.getAmount().compareTo(order.getPrice()) != 0) {
                log.error("Amount payment ({}) tidak sesuai dengan harga order ({})", 
                         payment.getAmount(), order.getPrice());
                throw new RuntimeException("Amount tidak sesuai dengan harga order");
            }
            
        } catch (Exception e) {
            log.error("Order dengan ID {} tidak ditemukan di Order Service", payment.getOrderId());
            throw new RuntimeException("Order tidak ditemukan: " + payment.getOrderId());
        }
        
        // Set default values
        payment.setStatus("pending");
        payment.setCreatedAt(LocalDateTime.now());
        payment.setUpdatedAt(LocalDateTime.now());
        
        Payment savedPayment = paymentRepository.save(payment);
        log.info("Payment berhasil dibuat dengan ID: {}", savedPayment.getId());
        
        return savedPayment;
    }
    
    public Payment updatePayment(Long id, Payment paymentDetails) {
        log.info("Update payment dengan ID: {}", id);
        
        Optional<Payment> paymentOpt = paymentRepository.findById(id);
        if (paymentOpt.isPresent()) {
            Payment payment = paymentOpt.get();
            
            // Update fields
            if (paymentDetails.getMethod() != null) {
                payment.setMethod(paymentDetails.getMethod());
            }
            if (paymentDetails.getStatus() != null) {
            payment.setStatus(paymentDetails.getStatus());
            }
            if (paymentDetails.getPaidAt() != null) {
                payment.setPaidAt(paymentDetails.getPaidAt());
            }
            if (paymentDetails.getAmount() != null) {
                payment.setAmount(paymentDetails.getAmount());
            }
            
            payment.setUpdatedAt(LocalDateTime.now());
            
            Payment updatedPayment = paymentRepository.save(payment);
            log.info("Payment berhasil diupdate: {}", updatedPayment.getId());
            return updatedPayment;
        } else {
            log.error("Payment dengan ID {} tidak ditemukan", id);
            throw new RuntimeException("Payment tidak ditemukan: " + id);
        }
    }
    
    public Payment processPayment(Long paymentId) {
        log.info("Memproses payment dengan ID: {}", paymentId);
        
        Optional<Payment> paymentOpt = paymentRepository.findById(paymentId);
        if (paymentOpt.isPresent()) {
            Payment payment = paymentOpt.get();
            
            // Simulate payment processing
            if ("pending".equals(payment.getStatus())) {
                payment.setStatus("processing");
                payment.setUpdatedAt(LocalDateTime.now());
                
                paymentRepository.save(payment);
                log.info("Payment {} sedang diproses", paymentId);
                
                // Simulate successful payment after 2 seconds
                try {
                    Thread.sleep(2000);
                    payment.setStatus("completed");
                    payment.setPaidAt(LocalDateTime.now());
                    payment.setUpdatedAt(LocalDateTime.now());
                    
                    Payment completedPayment = paymentRepository.save(payment);
                    log.info("Payment {} berhasil diproses", paymentId);
                    
                    // Update order status to completed
                    try {
                        orderClient.updateOrderStatus(payment.getOrderId(), "completed");
                        log.info("Order {} diupdate menjadi completed setelah payment berhasil", payment.getOrderId());
                    } catch (Exception e) {
                        log.error("Gagal update status order: {}", e.getMessage());
                    }
                    
                    return completedPayment;
                } catch (InterruptedException e) {
                    log.error("Payment processing interrupted: {}", e.getMessage());
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("Payment processing interrupted");
                }
            } else {
                log.error("Payment {} tidak dalam status pending", paymentId);
                throw new RuntimeException("Payment tidak dalam status pending");
            }
        } else {
            log.error("Payment dengan ID {} tidak ditemukan", paymentId);
            throw new RuntimeException("Payment tidak ditemukan: " + paymentId);
        }
    }
    
    public Payment updatePaymentStatus(Long id, String status) {
        log.info("Update status payment {} menjadi: {}", id, status);
        
        Optional<Payment> paymentOpt = paymentRepository.findById(id);
        if (paymentOpt.isPresent()) {
            Payment payment = paymentOpt.get();
            payment.setStatus(status);
            payment.setUpdatedAt(LocalDateTime.now());
            
            Payment updatedPayment = paymentRepository.save(payment);
            log.info("Status payment {} berhasil diupdate menjadi: {}", id, status);
            return updatedPayment;
        } else {
            log.error("Payment dengan ID {} tidak ditemukan", id);
            throw new RuntimeException("Payment tidak ditemukan: " + id);
        }
    }
    
    public List<Payment> getPaymentsByUserId(Long userId) {
        log.info("Mengambil semua payment untuk user ID: {}", userId);
        
        // Ambil data dari database terlebih dahulu
        List<Payment> payments = paymentRepository.findAll();
        
        if (payments.isEmpty()) {
            log.info("Tidak ada payment untuk user ID: {}", userId);
            return payments;
        }
        
        // Validasi user exists (optional, untuk logging saja)
        try {
            UserDto user = userClient.getUserById(userId);
            log.info("User ditemukan: {} (ID: {})", user.getName(), user.getId());
        } catch (Exception e) {
            log.warn("User dengan ID {} tidak ditemukan di User Service, tapi tetap mengembalikan data payment", userId);
        }
        
        log.info("Ditemukan {} payment untuk user ID: {}", payments.size(), userId);
        return payments;
    }
    
    public Payment getPaymentByOrderId(Long orderId) {
        log.info("Mengambil payment untuk order ID: {}", orderId);

        Optional<Payment> paymentOpt = paymentRepository.findFirstByOrderId(orderId);
        if (paymentOpt.isPresent()) {
            return paymentOpt.get();
        } else {
            log.error("Payment untuk order ID {} tidak ditemukan", orderId);
            throw new RuntimeException("Payment tidak ditemukan untuk order: " + orderId);
        }
    }
    
    public void deletePayment(Long id) {
        log.info("Menghapus payment dengan ID: {}", id);
        
        Optional<Payment> paymentOpt = paymentRepository.findById(id);
        if (paymentOpt.isPresent()) {
            Payment payment = paymentOpt.get();
            
            // Check if payment is already completed
            if ("completed".equals(payment.getStatus())) {
                log.error("Tidak dapat menghapus payment yang sudah completed");
                throw new RuntimeException("Tidak dapat menghapus payment yang sudah completed");
            }
            
            paymentRepository.deleteById(id);
            log.info("Payment {} berhasil dihapus", id);
        } else {
            log.error("Payment dengan ID {} tidak ditemukan", id);
            throw new RuntimeException("Payment tidak ditemukan: " + id);
        }
    }
} 