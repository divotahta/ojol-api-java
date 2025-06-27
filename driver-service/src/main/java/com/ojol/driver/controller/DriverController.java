package com.ojol.driver.controller;

import com.ojol.driver.model.Driver;
import com.ojol.driver.repository.DriverRepository;
import com.ojol.driver.service.DriverService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/drivers")
public class DriverController {

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private DriverService driverService;

    @PostMapping
    public ResponseEntity<Driver> createDriver(@Valid @RequestBody Driver driver) {
        Driver savedDriver = driverRepository.save(driver);
        return ResponseEntity.ok(savedDriver);
    }

    @GetMapping
    public ResponseEntity<List<Driver>> getAllDrivers() {
        List<Driver> drivers = driverRepository.findAll();
        return ResponseEntity.ok(drivers);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Driver> getDriverById(@PathVariable Long id) {
        Optional<Driver> driver = driverRepository.findById(id);
        return driver.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Driver> getDriverByUserId(@PathVariable Long userId) {
        Optional<Driver> driver = driverRepository.findByUserId(userId);
        return driver.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/vehicle/{userId}")
    public ResponseEntity<Driver> getDriverVehicle(@PathVariable Long userId) {
        Optional<Driver> driver = driverRepository.findByUserId(userId);
        return driver.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/statistics/{driverId}")
    public ResponseEntity<Driver> getDriverStatistics(@PathVariable Long driverId) {
        Optional<Driver> driver = driverRepository.findById(driverId);
        return driver.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, String>> getDriverStatus(@RequestParam Long userId) {
        Optional<Driver> driver = driverRepository.findByUserId(userId);
        Map<String, String> status = new HashMap<>();
        
        if (driver.isPresent()) {
            String driverStatus = driver.get().getStatus();
            status.put("status", driverStatus);
        } else {
            status.put("status", "unavailable");
        }
        
        return ResponseEntity.ok(status);
    }

    @GetMapping("/available")
    public ResponseEntity<List<Driver>> getAvailableDrivers() {
        List<Driver> drivers = driverRepository.findByStatus("available");
        return ResponseEntity.ok(drivers);
    }

    @GetMapping("/vehicle-type/{vehicleType}")
    public ResponseEntity<List<Driver>> getDriversByVehicleType(@PathVariable String vehicleType) {
        List<Driver> drivers = driverRepository.findByVehicleType(vehicleType);
        return ResponseEntity.ok(drivers);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Driver> updateDriver(@PathVariable Long id, @Valid @RequestBody Driver driverDetails) {
        Optional<Driver> driver = driverRepository.findById(id);
        if (driver.isPresent()) {
            Driver existingDriver = driver.get();
            existingDriver.setName(driverDetails.getName());
            existingDriver.setPhone(driverDetails.getPhone());
            existingDriver.setStatus(driverDetails.getStatus());
            existingDriver.setVehicleType(driverDetails.getVehicleType());
            existingDriver.setVehicleBrand(driverDetails.getVehicleBrand());
            existingDriver.setVehicleModel(driverDetails.getVehicleModel());
            existingDriver.setPlateNumber(driverDetails.getPlateNumber());
            Driver updatedDriver = driverRepository.save(existingDriver);
            return ResponseEntity.ok(updatedDriver);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/vehicle")
    public ResponseEntity<Driver> updateDriverVehicle(@PathVariable Long id, @Valid @RequestBody Map<String, String> vehicleData) {
        Optional<Driver> driver = driverRepository.findById(id);
        if (driver.isPresent()) {
            Driver existingDriver = driver.get();
            existingDriver.setVehicleType(vehicleData.get("vehicleType"));
            existingDriver.setVehicleBrand(vehicleData.get("vehicleBrand"));
            existingDriver.setVehicleModel(vehicleData.get("vehicleModel"));
            existingDriver.setPlateNumber(vehicleData.get("plateNumber"));
            Driver updatedDriver = driverRepository.save(existingDriver);
            return ResponseEntity.ok(updatedDriver);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/status")
    public ResponseEntity<?> updateStatus(@RequestBody Map<String, Object> body) {
        Object userIdObj = body.get("userId");
        Object statusObj = body.get("status");

        if (userIdObj == null || statusObj == null) {
            return ResponseEntity.badRequest().body("userId dan status tidak boleh kosong");
        }

        Long userId = Long.valueOf(userIdObj.toString());
        String newStatus = statusObj.toString();

        // Validasi status yang valid
        if (!isValidStatus(newStatus)) {
            return ResponseEntity.badRequest().body("Status tidak valid. Status yang valid: available, unavailable, busy");
        }

        Optional<Driver> driver = driverRepository.findByUserId(userId);
        if (driver.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Driver d = driver.get();
        d.setStatus(newStatus);
        Driver savedDriver = driverRepository.save(d);
        
        return ResponseEntity.ok(Map.of("status", newStatus));
    }

    private boolean isValidStatus(String status) {
        return status != null && (status.equals("available") || status.equals("unavailable") || status.equals("busy"));
    }

    // Endpoint untuk mendapatkan order dengan status waiting
    @GetMapping("/orders/waiting")
    public ResponseEntity<?> getWaitingOrders() {
        try {
            List<Map<String, Object>> waitingOrders = driverService.getWaitingOrders();
            return ResponseEntity.ok(waitingOrders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: " + e.getMessage()));
        }
    }

    // Endpoint untuk mendapatkan order berdasarkan driver ID
    @GetMapping("/{driverId}/orders")
    public ResponseEntity<?> getDriverOrders(@PathVariable Long driverId) {
        try {
            List<Map<String, Object>> driverOrders = driverService.getDriverOrders(driverId);
            return ResponseEntity.ok(driverOrders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: " + e.getMessage()));
        }
    }

    // Endpoint untuk mendapatkan order berdasarkan status
    @GetMapping("/orders/status/{status}")
    public ResponseEntity<?> getOrdersByStatus(@PathVariable String status) {
        try {
            List<Map<String, Object>> orders = driverService.getOrdersByStatus(status);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDriver(@PathVariable Long id) {
        if (driverRepository.existsById(id)) {
            driverRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // Inner class for status update request
    public static class StatusUpdateRequest {
        private String status;

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }
}