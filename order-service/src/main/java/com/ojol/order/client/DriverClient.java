package com.ojol.order.client;

import com.ojol.order.dto.DriverDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "driver-service")
public interface DriverClient {
    
    @GetMapping("/drivers/{id}")
    DriverDto getDriverById(@PathVariable("id") Long id);
    
    @GetMapping("/drivers/user/{userId}")
    DriverDto getDriverByUserId(@PathVariable("userId") Long userId);
    
    @GetMapping("/drivers/vehicle/{userId}")
    DriverDto getDriverVehicle(@PathVariable("userId") Long userId);
    
    @GetMapping("/orders/waiting")
    List<DriverDto> getAvailableOrders();
    
    @PutMapping("/drivers/{id}/status")
    DriverDto updateDriverStatus(@PathVariable("id") Long id, @RequestParam("status") String status);
} 