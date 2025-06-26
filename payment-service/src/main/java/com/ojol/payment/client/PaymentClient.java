package com.ojol.payment.client;

import com.ojol.payment.dto.PaymentDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;


@FeignClient(name = "payment-service")
public interface PaymentClient {
    
    @GetMapping("/payments/{id}")
    PaymentDto getPaymentById(@PathVariable("id") Long id);
    
    @GetMapping("/payments/order/{orderId}")
    PaymentDto getPaymentByOrderId(@PathVariable("orderId") Long orderId);
    
    @PutMapping("/payments/{id}/status")
    PaymentDto updatePaymentStatus(@PathVariable("id") Long id, @RequestParam("status") String status);
} 