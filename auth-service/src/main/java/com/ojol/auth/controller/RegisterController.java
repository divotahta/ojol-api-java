package com.ojol.auth.controller;

import com.ojol.auth.client.CustomerClient;
import com.ojol.auth.client.DriverClient;
import com.ojol.auth.dto.CreateCustomerRequest;
import com.ojol.auth.model.User;
import com.ojol.auth.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/register")
public class RegisterController {
    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("Register Service is alive");
    }

    @Autowired
    private AuthService authService;

    @Autowired
    private CustomerClient customerClient;

    @Autowired
    private DriverClient driverClient;

    @PostMapping("/customer")
    public ResponseEntity<?> registerCustomer(@RequestBody Map<String, Object> request) {
        try {
            if (request.get("name") == null || request.get("email") == null ||
                    request.get("password") == null || request.get("phone") == null ||
                    request.get("address") == null || request.get("dateOfBirth") == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("message", "Semua field harus diisi");
                errorResponse.put("success", false);
                return ResponseEntity.badRequest().body(errorResponse);
            }

            String name = (String) request.get("name");
            String email = (String) request.get("email");
            String password = (String) request.get("password");
            String phone = (String) request.get("phone");
            String address = (String) request.get("address");
            String gender = (String) request.get("gender");
            LocalDate dateOfBirth = LocalDate.parse((String) request.get("dateOfBirth"));
            System.out.println("Tanggal yang dikirim: " + dateOfBirth);

            User user = new User(name, email, password, "customer");
            User savedUser = authService.register(user);

            CreateCustomerRequest customerRequest = new CreateCustomerRequest(
                    savedUser.getId(),
                    phone,
                    address,
                    gender,
                    dateOfBirth.toString());

            Map<String, Object> customerResponse = customerClient.createCustomer(customerRequest);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Registrasi customer berhasil");
            response.put("success", true);
            response.put("userId", savedUser.getId());
            response.put("userData", savedUser);
            response.put("customerData", customerResponse);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Register customer error: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            errorResponse.put("success", false);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/driver")
    public ResponseEntity<?> registerDriver(@RequestBody Map<String, Object> request) {
        try {
            // Validate required fields
            if (request.get("name") == null || request.get("email") == null ||
                    request.get("password") == null || request.get("phone") == null ||
                    request.get("vehicleType") == null || request.get("vehicleBrand") == null ||
                    request.get("vehicleModel") == null || request.get("plateNumber") == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("message", "Semua field harus diisi");
                errorResponse.put("success", false);
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Extract user data
            String name = (String) request.get("name");
            String email = (String) request.get("email");
            String password = (String) request.get("password");
            String phone = (String) request.get("phone");
            String vehicleType = (String) request.get("vehicleType");
            String vehicleBrand = (String) request.get("vehicleBrand");
            String vehicleModel = (String) request.get("vehicleModel");
            String plateNumber = (String) request.get("plateNumber");

            // Create user
            User user = new User(name, email, password, "driver");
            User savedUser = authService.register(user);

            // Create driver data
            Map<String, Object> driverData = new HashMap<>();
            driverData.put("userId", savedUser.getId());
            driverData.put("name", name);
            driverData.put("phone", phone);
            driverData.put("status", "unavailable");
            driverData.put("vehicleType", vehicleType);
            driverData.put("vehicleBrand", vehicleBrand);
            driverData.put("vehicleModel", vehicleModel);
            driverData.put("plateNumber", plateNumber);

            // Call driver service using Feign Client
            Map<String, Object> driverResponse = driverClient.createDriver(driverData);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Registrasi driver berhasil");
            response.put("success", true);
            response.put("userId", savedUser.getId());
            response.put("userData", savedUser);
            response.put("driverData", driverResponse);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Register driver error: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            errorResponse.put("success", false);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}