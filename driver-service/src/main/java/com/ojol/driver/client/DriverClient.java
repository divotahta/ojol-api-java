package com.ojol.driver.client;

import com.ojol.driver.dto.DriverDto;
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

    @GetMapping("/drivers/available")
    List<DriverDto> getAvailableDrivers();
    
    @GetMapping("/drivers/status")
    DriverDto getDriverStatus();

    @GetMapping("/drivers/user/{userId}")
    DriverDto getDriverByUserId(@PathVariable("userId") Long userId);

    @GetMapping("/drivers/vehicle/{userId}")
    DriverDto getDriverVehicle(@PathVariable("userId") Long userId);
    
    @GetMapping("/drivers/statistics/{driverId}")
    DriverDto getDriverStatistics(@PathVariable("driverId") Long driverId);
    
    @GetMapping("/orders/driver/{driverId}")
    List<DriverDto> getDriverOrders(@PathVariable("driverId") Long driverId);
    
    @PutMapping("/drivers/{id}/status")
    DriverDto updateDriverStatus(@PathVariable("id") Long id, @RequestParam("status") String status);
    
} 