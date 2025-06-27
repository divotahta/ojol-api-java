package com.ojol.auth.client;

import org.springframework.cloud.openfeign.FeignClient;
import com.ojol.auth.dto.CreateCustomerRequest;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "customer-service")
public interface CustomerClient {

    @PostMapping("/customers")
    Map<String, Object> createCustomer(@RequestBody CreateCustomerRequest request);
}

