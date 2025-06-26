package com.ojol.user.client;

import com.ojol.user.dto.UserDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-service")
public interface UserClient {
    
    @GetMapping("/users/{id}")
    UserDto getUserById(@PathVariable("id") Long id);
    
    @GetMapping("/users/email/{email}")
    UserDto getUserByEmail(@PathVariable("email") String email);
} 