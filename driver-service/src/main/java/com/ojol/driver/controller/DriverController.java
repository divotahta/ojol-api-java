package com.ojol.driver.controller;

import com.ojol.driver.model.Driver;
import com.ojol.driver.repository.DriverRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/drivers")
public class DriverController {

    @Autowired
    private DriverRepository driverRepository;

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

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Driver>> getDriversByStatus(@PathVariable String status) {
        List<Driver> drivers = driverRepository.findByStatus(status);
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

    @PutMapping("/{id}/status")
    public ResponseEntity<Driver> updateDriverStatus(@PathVariable Long id, @RequestBody String status) {
        Optional<Driver> driver = driverRepository.findById(id);
        if (driver.isPresent()) {
            Driver existingDriver = driver.get();
            existingDriver.setStatus(status);
            Driver updatedDriver = driverRepository.save(existingDriver);
            return ResponseEntity.ok(updatedDriver);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDriver(@PathVariable Long id) {
        if (driverRepository.existsById(id)) {
            driverRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
} 