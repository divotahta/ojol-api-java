package com.ojol.driver.service;

import com.ojol.driver.model.Driver;
import com.ojol.driver.repository.DriverRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.HashMap;
import java.math.BigDecimal;

@Service
public class DriverService {

    private static final Logger log = LoggerFactory.getLogger(DriverService.class);

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private DiscoveryClient discoveryClient;

    private String getOrderServiceUrl() {
        List<ServiceInstance> instances = discoveryClient.getInstances("order-service");
        if (instances != null && !instances.isEmpty()) {
            return instances.get(0).getUri().toString();
        }
        throw new RuntimeException("Order service tidak ditemukan");
    }

    public boolean acceptOrder(Long driverId, Long orderId) {
        try {
            // Cek apakah driver memiliki order aktif
            if (hasActiveOrder(driverId)) {
                throw new RuntimeException("Driver masih memiliki order yang belum selesai");
            }

            // Update status driver menjadi busy
            Optional<Driver> driverOptional = driverRepository.findById(driverId);
            if (driverOptional.isPresent()) {
                Driver driver = driverOptional.get();
                driver.setStatus("busy");
                driverRepository.save(driver);

                // Gunakan endpoint yang benar untuk accept order (yang mengirim event Kafka)
                // Event ORDER_ACCEPTED akan otomatis membuat pembayaran di Payment Service
                String orderUrl = getOrderServiceUrl() + "/orders/" + orderId + "/accept?driverId=" + driverId;
                
                ResponseEntity<Map> response = restTemplate.exchange(orderUrl, HttpMethod.PUT, null, Map.class);
                
                if (response.getStatusCode().is2xxSuccessful()) {
                    log.info("Driver {} berhasil menerima order {} - pembayaran sudah dibuat otomatis saat order dibuat", driverId, orderId);
                    return true;
                } else {
                    log.error("Gagal menerima order {} oleh driver {}", orderId, driverId);
                    return false;
                }
            }
            return false;
        } catch (Exception e) {
            log.error("Error saat driver {} menerima order {}: {}", driverId, orderId, e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    public boolean rejectOrder(Long driverId, Long orderId) {
        try {
            String orderUrl = getOrderServiceUrl() + "/orders/" + orderId + "/status";
            Map<String, Object> request = Map.of(
                "status", "waiting",
                "driverId", null
            );
            
            ResponseEntity<Map> response = restTemplate.postForEntity(orderUrl, request, Map.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean completeOrder(Long driverId, Long orderId) {
        try {
            // Update status driver menjadi available
            Optional<Driver> driverOptional = driverRepository.findById(driverId);
            if (driverOptional.isPresent()) {
                Driver driver = driverOptional.get();
                driver.setStatus("available");
                driverRepository.save(driver);

                // Gunakan endpoint yang benar untuk complete order (yang mengirim event Kafka)
                String orderUrl = getOrderServiceUrl() + "/orders/" + orderId + "/complete";
                
                ResponseEntity<Map> response = restTemplate.exchange(orderUrl, HttpMethod.PUT, null, Map.class);
                return response.getStatusCode().is2xxSuccessful();
            }
            return false;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public Driver updateDriverStatus(Long driverId, String status) {
        Optional<Driver> driverOpt = driverRepository.findById(driverId);
        if (driverOpt.isPresent()) {
            Driver driver = driverOpt.get();
            driver.setStatus(status);
            return driverRepository.save(driver);
        }
        return null;
    }

    public boolean isDriverAvailable(Long driverId) {
        Optional<Driver> driverOpt = driverRepository.findById(driverId);
        return driverOpt.isPresent() && "available".equals(driverOpt.get().getStatus());
    }

    // Get waiting orders
    public List<Map<String, Object>> getWaitingOrders() {
        try {
            String url = getOrderServiceUrl() + "/orders/status/waiting";
            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            );
            return response.getBody();
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    // Get driver orders
    public List<Map<String, Object>> getDriverOrders(Long driverId) {
        try {
            String url = getOrderServiceUrl() + "/orders/driver/" + driverId;
            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            );
            return response.getBody();
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    // Get orders by status
    public List<Map<String, Object>> getOrdersByStatus(String status) {
        try {
            String url = getOrderServiceUrl() + "/orders/status/" + status;
            List<Map<String, Object>> orders = restTemplate.getForObject(url, List.class);
            return orders != null ? orders : List.of();
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    public boolean hasActiveOrder(Long driverId) {
        try {
            List<Map<String, Object>> driverOrders = getDriverOrders(driverId);
            return driverOrders.stream()
                .anyMatch(order -> {
                    String status = (String) order.get("status");
                    return "in_progress".equals(status) || "in_progress".equals(status);
                });
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
} 