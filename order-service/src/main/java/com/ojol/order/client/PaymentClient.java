package com.ojol.order.client;

import com.ojol.order.dto.PaymentDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "payment-service")
public interface PaymentClient {
    
    @GetMapping("/payments/order/{orderId}/dto")
    PaymentDto getPaymentByOrderId(@PathVariable("orderId") Long orderId);

    @PostMapping("/payments")
    PaymentDto createPayment(@RequestBody PaymentDto paymentDto);
    
    @PutMapping("/payments/order/{orderId}")
    PaymentDto updatePaymentStatusByOrderId(@PathVariable("orderId") Long orderId, @RequestBody java.util.Map<String, String> request);

    @PutMapping("/payments/{paymentId}/status")
    PaymentDto updatePaymentStatusByAdmin(@PathVariable("paymentId") Long paymentId, @RequestBody java.util.Map<String, String> request);

} 