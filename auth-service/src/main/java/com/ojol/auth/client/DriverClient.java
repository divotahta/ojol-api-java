package com.ojol.auth.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "driver-service")
public interface DriverClient {

    @PostMapping("/drivers")
    Map<String, Object> createDriver(@RequestBody Map<String, Object> driverData);
} 