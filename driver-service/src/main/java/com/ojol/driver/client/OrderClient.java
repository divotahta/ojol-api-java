package com.ojol.driver.client;

import com.ojol.driver.dto.OrderDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "order-service")
public interface OrderClient {
    
    @GetMapping("orders/{id}")
    OrderDto getOrderById(@PathVariable("id") Long id);
    
    @GetMapping("/orders/user/{userId}")
    List<OrderDto> getOrdersByUserId(@PathVariable("userId") Long userId);
    
    @GetMapping("/orders/driver/{driverId}")
    List<OrderDto> getOrdersByDriverId(@PathVariable("driverId") Long driverId);
    
    @PutMapping("/orders/{id}/status")
    OrderDto updateOrderStatus(@PathVariable("id") Long id, @RequestParam("status") String status);
    
    @PutMapping("/orders/{id}/accept-order/{driverId}")
    OrderDto acceptOrder(@PathVariable("id") Long id, @PathVariable("driverId") Long driverId);
} 