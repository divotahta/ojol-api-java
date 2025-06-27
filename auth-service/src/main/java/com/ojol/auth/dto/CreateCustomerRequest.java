package com.ojol.auth.dto;

public class CreateCustomerRequest {
    private Long userId;
    private String phone;
    private String address;
    private String gender;
    private String dateOfBirth; // Format ISO (yyyy-MM-dd)

    public CreateCustomerRequest() {}

    public CreateCustomerRequest(Long userId, String phone, String address, String gender, String dateOfBirth) {
        this.userId = userId;
        this.phone = phone;
        this.address = address;
        this.gender = gender;
        this.dateOfBirth = dateOfBirth;
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }
}
