// API utilities for OjoL Frontend

class API {
  constructor() {
    this.baseURL = CONFIG.API.BASE_URL;
    this.timeout = CONFIG.API.TIMEOUT;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = auth.getToken();

    const defaultOptions = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      timeout: this.timeout,
    };

    const config = { ...defaultOptions, ...options };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse response body first
      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        // If response is not JSON, create a simple error object
        responseData = { message: `HTTP error! status: ${response.status}` };
      }

      if (!response.ok) {
        // Create error with response data
        const error = new Error(responseData.message || `HTTP error! status: ${response.status}`);
        error.status = response.status;
        error.responseData = responseData;
        throw error;
      }

      return responseData;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Authentication endpoints
  async login(credentials) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async register(userData) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async validateToken() {
    try {
      await this.request("/auth/validate");
      return true;
    } catch (error) {
      return false;
    }
  }

  // User endpoints
  async getUserProfile() {
    const userId = localStorage.getItem("ojol_userId");
    return this.request(`/users/${userId}`);
  }

  async getAdminProfile() {
    return this.request("/users/profile");
  }

  async getAllUsers() {
    return this.request("/users");
  }

  async getUserById(userId) {
    return this.request(`/users/${userId}`);
  }

  async updateUser(userId, userData) {
    return this.request(`/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId) {
    return this.request(`/users/${userId}`, {
      method: "DELETE",
    });
  }

  // Customer endpoints
  async getCustomerByUserId(userId) {
    return this.request(`/customers/user/${userId}`);
  }

  // Ambil semua order user, frontend yang filter statistik/aktif/history
  async getCustomerOrders(userId) {
    return this.request(`/orders/user/${userId}`);
  }

  async getCustomerStatistics() {
    return this.request("/customers/statistics");
  }

  async getCustomerActiveOrders() {
    return this.request("/customers/orders/active");
  }

  async getCustomerOrderHistory() {
    return this.request("/customers/orders/history");
  }

  // Driver endpoints
  async getDriverProfile() {
    const userId = localStorage.getItem("ojol_userId");
    return this.request(`/drivers/user/${userId}`);
  }

  async getDriverStatus() {
    return this.request("/drivers/status");
  }

  async updateDriverStatus(statusData) {
    return this.request("/drivers/status", {
      method: "PUT",
      body: JSON.stringify(statusData),
    });
  }

  async getDriverVehicle() {
    const userId = localStorage.getItem("ojol_userId");
    return this.request(`/drivers/vehicle/${userId}`);
  }

  async getDriverStatistics() {
    const driverId = localStorage.getItem("ojol_userId");
    return this.request(`/orders/driver/${driverId}`);
  }

  async getAllDrivers() {
    return this.request("/drivers");
  }

  async getDriverById(driverId) {
    return this.request(`/drivers/${driverId}`);
  }

  async updateDriver(driverId, driverData) {
    return this.request(`/drivers/${driverId}`, {
      method: "PUT",
      body: JSON.stringify(driverData),
    });
  }

  async deleteDriver(driverId) {
    return this.request(`/drivers/${driverId}`, {
      method: "DELETE",
    });
  }

  // Order endpoints
  async createOrder(orderData) {
    return this.request("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  }

  async getAvailableOrders() {
    return this.request("/orders/waiting");
  }

  async getDriverOrders() {
    const driverId = localStorage.getItem("ojol_userId");
    return this.request(`/orders/driver/${driverId}`);
  }

  async getOrderInProgress() {
    const driverId = localStorage.getItem("ojol_userId");
    return this.request(`/orders/driver/${driverId}/in-progress`);
  }

  async acceptOrder(orderId) {
    const driverId = localStorage.getItem("ojol_userId");
    return this.request(`/orders/${orderId}/accept?driverId=${driverId}`, {
      method: "PUT",
    });
  }

  async cancelOrder(orderId) {
    return this.request(`/orders/${orderId}/cancel`, {
      method: "PUT",
    });
  }

  async updateOrderStatus(orderId, statusData) {
    return this.request(`/orders/${orderId}/status`, {
      method: "PUT",
      body: JSON.stringify(statusData),
    });
  }

  async getAllOrders() {
    return this.request("/orders");
  }

  async getOrderById(orderId) {
    return this.request(`/orders/${orderId}`);
  }

  async getOrdersByStatus(status) {
    return this.request(`/orders?status=${status}`);
  }

  async completeOrder(orderId) {
    return this.request(`/orders/${orderId}/complete`, {
      method: "PUT",
    });
  }

  async deleteOrder(orderId) {
    return this.request(`/orders/${orderId}`, {
      method: "DELETE",
    });
  }

  // Payment endpoints
  async getAllPayments() {
    return this.request("/payments");
  }

  async updatePaymentStatusByOrderId(orderId, statusData) {
    return this.request(`/orders/${orderId}/payment`, {
      method: "PUT",
      body: JSON.stringify(statusData),
    });
  }

  async getPaymentByOrderId(orderId) {
    return this.request(`/orders/${orderId}/payment`);
  }

  async getPaymentById(paymentId) {
    return this.request(`/payments/${paymentId}`);
  }

  async createPayment(paymentData) {
    return this.request("/payments", {
      method: "POST",
      body: JSON.stringify(paymentData),
    });
  }

  async updatePayment(paymentId, paymentData) {
    return this.request(`/payments/${paymentId}`, {
      method: "PUT",
      body: JSON.stringify(paymentData),
    });
  }

  async deletePayment(paymentId) {
    return this.request(`/payments/${paymentId}`, {
      method: "DELETE",
    });
  }

  // System endpoints
  async getSystemStatistics() {
    return this.request("/system/statistics");
  }

  // Utility endpoints
  async getCoordinates(address) {
    // Mock coordinates for demo purposes
    // In real implementation, this would call a geocoding service
    return {
      lat: Math.random() * 0.1 + -6.2088, // Jakarta area
      lng: Math.random() * 0.1 + 106.8456,
    };
  }

  // Error handling
  handleError(error) {
    if (error.name === "AbortError") {
      throw new Error("Request timeout");
    }

    if (error.message.includes("401")) {
      auth.logout();
      window.location.href = "index.html";
      throw new Error("Unauthorized access");
    }

    if (error.message.includes("403")) {
      throw new Error("Access forbidden");
    }

    if (error.message.includes("404")) {
      throw new Error("Resource not found");
    }

    if (error.message.includes("500")) {
      throw new Error("Server error");
    }

    throw error;
  }
}

// Create global API instance
const api = new API();

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = API;
}
