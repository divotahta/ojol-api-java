package com.ojol.customer.dto;

import java.time.LocalDate;

public class CustomerRequestDTO {
    private String userId;
    private String phone;
    private String address;
    private String gender;
    private String dateOfBirth;

    // Getters & Setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public String getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    // Convert to LocalDate
    public LocalDate getDateOfBirthAsLocalDate() {
        if (dateOfBirth != null && !dateOfBirth.isEmpty()) {
            return LocalDate.parse(dateOfBirth);
        }
        return null;
    }
} 