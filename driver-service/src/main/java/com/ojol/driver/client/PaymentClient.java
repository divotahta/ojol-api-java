package com.ojol.driver.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.Map;

@FeignClient(name = "payment-service")
public interface PaymentClient {
    
    @PostMapping("/payments")
    Map<String, Object> createPayment(@RequestBody Map<String, Object> paymentRequest);
} 