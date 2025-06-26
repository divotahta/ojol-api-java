// Driver Dashboard for OjoL Frontend
class DriverDashboard {
  constructor() {
    this.init();
  }

  init() {
    this.checkAuth();
    this.setupEventListeners();
    this.loadDashboard();
  }

  async checkAuth() {
    if (!auth.isAuthenticated()) {
      window.location.href = "index.html";
      return;
    }

    const role = auth.getRole();
    if (role !== CONFIG.ROLES.DRIVER) {
      ui.showError("Akses ditolak. Anda bukan driver.");
      auth.logout();
      window.location.href = "index.html";
      return;
    }

    const isValid = await auth.validateToken();
    if (!isValid) {
      auth.logout();
      window.location.href = "index.html";
      return;
    }
  }

  setupEventListeners() {
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        auth.logout();
        window.location.href = "index.html";
      });
    }
  }

  async loadDashboard() {
    try {
      ui.showLoading();

      // Load driver profile
      await this.loadDriverProfile();

      // Load driver status
      await this.loadDriverStatus();

      // Load vehicle information
      await this.loadVehicleInfo();

      // Load statistics
      await this.loadStatistics();

      // Load available orders
      await this.loadAvailableOrders();

      // Load driver orders
      await this.loadDriverOrders();

      // Load in progress orders
      await this.loadInProgressOrders();
    } catch (error) {
      console.error("Error loading dashboard:", error);
      ui.showError("Gagal memuat dashboard");
    } finally {
      ui.hideLoading();
    }
  }

  async loadDriverProfile() {
    try {
      const driverData = await api.getDriverProfile();
      const profileContainer = document.getElementById("driver-profile");

      if (profileContainer) {
        profileContainer.innerHTML = `
                    <div class="space-y-3">
                        <div class="flex items-center space-x-3">
                            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <i class="fas fa-motorcycle text-green-600 text-xl"></i>
                            </div>
                            <div>
                                <h3 class="font-semibold text-gray-800">${
                                  driverData.name || "N/A"
                                }</h3>
                                <p class="text-sm text-gray-600">${
                                  driverData.email || "N/A"
                                }</p>
                            </div>
                        </div>
                        <div class="border-t pt-3">
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Phone:</span>
                                    <span class="font-medium">${
                                      driverData.phone || "N/A"
                                    }</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">License:</span>
                                    <span class="font-medium">${
                                      driverData.licenseNumber || "N/A"
                                    }</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Rating:</span>
                                    <span class="font-medium">${
                                      driverData.rating || "0"
                                    } ⭐</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
      }

      // Update navigation
      const driverName = document.getElementById("driver-name");
      const driverEmail = document.getElementById("driver-email");
      if (driverName) driverName.textContent = driverData.name || "Driver";
      if (driverEmail) driverEmail.textContent = driverData.email || "";
    } catch (error) {
      console.error("Error loading driver profile:", error);
    }
  }

  async loadDriverStatus() {
    try {
      const statusData = await api.getDriverStatus();
      const statusContainer = document.getElementById("driver-status-control");
      const statusDisplay = document.getElementById("driver-status");

      if (statusContainer) {
        const isOnline = statusData.status === "available";
        statusContainer.innerHTML = `
                    <div class="space-y-4">
                        <div class="flex items-center justify-between">
                            <span class="text-sm font-medium text-gray-700">Status Driver:</span>
                            <span class="px-3 py-1 rounded-full text-sm font-medium ${
                              isOnline
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }">
                                ${isOnline ? "Online" : "Offline"}
                            </span>
                        </div>
                        <button id="toggle-status-btn" 
                                class="w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                                  isOnline
                                    ? "bg-red-500 hover:bg-red-600 text-white"
                                    : "bg-green-500 hover:bg-green-600 text-white"
                                }">
                            <i class="fas ${
                              isOnline ? "fa-toggle-off" : "fa-toggle-on"
                            } mr-2"></i>
                            ${isOnline ? "Go Offline" : "Go Online"}
                        </button>
                        <div class="text-xs text-gray-500 text-center">
                            ${
                              isOnline
                                ? "Anda sedang online dan dapat menerima pesanan"
                                : "Anda sedang offline dan tidak dapat menerima pesanan"
                            }
                        </div>
                    </div>
                `;

        // Add event listener for toggle button
        const toggleBtn = document.getElementById("toggle-status-btn");
        if (toggleBtn) {
          toggleBtn.addEventListener("click", () => this.toggleStatus());
        }
      }

      if (statusDisplay) {
        statusDisplay.textContent =
          statusData.status === "available" ? "Online" : "Offline";
        statusDisplay.className = `text-lg font-bold ${
          statusData.status === "available" ? "text-green-600" : "text-red-600"
        }`;
      }
    } catch (error) {
      console.error("Error loading driver status:", error);
    }
  }

  async loadVehicleInfo() {
    try {
      const vehicleData = await api.getDriverVehicle();
      const vehicleContainer = document.getElementById("vehicle-info");

      if (vehicleContainer) {
        vehicleContainer.innerHTML = `
                    <div class="space-y-3">
                        <div class="flex items-center space-x-3">
                            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <i class="fas fa-motorcycle text-blue-600 text-xl"></i>
                            </div>
                            <div>
                                <h3 class="font-semibold text-gray-800">${
                                  vehicleData.vehicleModel || "N/A"
                                }</h3>
                                <p class="text-sm text-gray-600">${
                                  vehicleData.plateNumber || "N/A"
                                }</p>
                            </div>
                        </div>
                        <div class="border-t pt-3">
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Brand:</span>
                                    <span class="font-medium">${
                                      vehicleData.vehicleBrand
                                    }</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Type:</span>
                                    <span class="font-medium">${
                                      vehicleData.vehicleType || "N/A"
                                    }</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
      }
    } catch (error) {
      console.error("Error loading vehicle info:", error);
    }
  }

  async loadStatistics() {
    try {
      const stats = await api.getDriverStatistics();

      const activeOrdersCount = document.getElementById("active-orders-count");
      const completedOrdersCount = document.getElementById(
        "completed-orders-count"
      );
      const todayEarnings = document.getElementById("today-earnings");

      if (activeOrdersCount)
        activeOrdersCount.textContent = stats.activeOrders || 0;
      if (completedOrdersCount)
        completedOrdersCount.textContent = stats.completedOrders || 0;
      if (todayEarnings)
        todayEarnings.textContent = `Rp ${(
          stats.todayEarnings || 0
        ).toLocaleString()}`;
    } catch (error) {
      console.error("Error loading statistics:", error);
    }
  }

  async loadAvailableOrders() {
    try {
      const orders = await api.getAvailableOrders();
      const container = document.getElementById("available-orders");
      const customerName = document.getElementById("customer-name");
      const customerPhone = document.getElementById("customer-phone");

      if (container) {
        if (orders.length === 0) {
          container.innerHTML = `
                        <div class="text-center py-8 text-gray-500">
                            <i class="fas fa-inbox text-4xl mb-4"></i>
                            <p>Tidak ada pesanan tersedia</p>
                        </div>
                    `;
          return;
        }

        container.innerHTML = orders
          .map(
            (order) => `
                    <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div class="flex justify-between items-start mb-3">
                            <div>
                                <h3 class="font-semibold text-gray-800">Order #${
                                  order.id
                                }</h3>
                                <p class="text-sm text-gray-600">${new Date(
                                  order.createdAt
                                ).toLocaleString()}</p>
                            </div>
                            <span class="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                Tersedia
                            </span>
                        </div>
                        <div class="space-y-2 text-sm mb-4">
                            <div class="flex items-center space-x-2">
                                <i class="fas fa-map-marker-alt text-green-500"></i>
                                <span>${order.origin}</span>
                            </div>
                            <div class="flex items-center space-x-2">
                                <i class="fas fa-map-marker text-red-500"></i>
                                <span>${order.destination}</span>
                            </div>
                            
                            <div class="flex items-center space-x-2">
                                <i class="fas fa-phone text-purple-500"></i>
                                <span>Distance: ${
                                  order.distance?.toLocaleString() || "0"
                                } km</span>
                            </div>
                            <div class="flex items-center space-x-2">
                                <i class="fas fa-money-bill text-blue-500"></i>
                                <span>Rp ${
                                  order.price?.toLocaleString() || "0"
                                }</span>
                            </div>
                        </div>
                        <div class="flex items-center space-x-2">
                          <button class="accept-btn w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium mt-2" data-order-id="${
                            order.id
                          }">
                            <i class="fas fa-check mr-2"></i>Terima Pesanan
                        </button>
                      </div>
                    </div>
                `
          )
          .join("");
      }
      const acceptBtn = document.querySelectorAll(".accept-btn");
      acceptBtn.forEach((btn) => {
        btn.addEventListener("click", () =>
          this.acceptOrder(btn.dataset.orderId)
        );
      });
    } catch (error) {
      console.error("Error loading available orders:", error);
    }
  }

  async loadOrderInProgress() {
    try {
      const orders = await api.getOrderInProgress();
      const container = document.getElementById("order-in-progress");

      if (container) {
        container.innerHTML = orders
          .map(
            (order) =>
              `<div class="border border-yellow-200 rounded-lg p-4 hover:shadow-md transition-shadow"><div class="flex justify-between items-start mb-3"><div><h3 class="font-semibold text-gray-800">Order #${
                order.id
              }</h3><p class="text-sm text-gray-600">${new Date(
                order.createdAt
              ).toLocaleString()}</p></div><span class="px-3 py-1 rounded-full text-sm font-medium">${
                order.status
              }</span></div><div class="space-y-2 text-sm"><div class="flex items-center space-x-2"><i class="fas fa-map-marker-alt text-green-500"></i><span>${
                order.origin
              }</span></div><div class="flex items-center space-x-2"><i class="fas fa-map-marker text-red-500"></i><span>${
                order.destination
              }</span></div><div class="flex items-center space-x-2"><i class="fas fa-money-bill text-blue-500"></i><span>Rp ${
                order.price?.toLocaleString() || "0"
              }</span></div><div class="flex items-center space-x-2"><i class="fas fa-route text-blue-500"></i><span>${
                order.distance?.toLocaleString() || "0"
              } km</span></div></div>
              <div class="flex flex-wrap gap-2 mt-4">
                <button class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-xs" onclick="driverDashboard.showOrderDetail(${
                  order.id
                })"><i class='fas fa-info-circle mr-1'></i>Detail</button>
                <button class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs" onclick="driverDashboard.updatePaymentStatus(${
                  order.id
                })"><i class='fas fa-money-check-alt mr-1'></i>Ubah Status Pembayaran</button>
                <button class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs" onclick="driverDashboard.completeOrder(${
                  order.id
                })"><i class='fas fa-check mr-1'></i>Complete Order</button>
              </div>
              </div>`
          )
          .join("");
      }
    } catch (error) {
      console.error("Error loading order in progress:", error);
    }
  }

  async loadDriverOrders() {
    try {
      const orders = await api.getDriverOrders();
      const container = document.getElementById("driver-orders");
      const customerName = document.getElementById("customer-name");

      if (container) {
        if (orders.length === 0) {
          container.innerHTML = `
                        <div class="text-center py-8 text-gray-500">
                            <i class="fas fa-route text-4xl mb-4"></i>
                            <p>Belum ada pesanan</p>
                        </div>
                    `;
          return;
        }

        container.innerHTML = orders
          .map(
            (order) => `
                    <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div class="flex justify-between items-start mb-3">
                            <div>
                                <h3 class="font-semibold text-gray-800">Order #${
                                  order.id
                                }</h3>
                                <p class="text-sm text-gray-600">${new Date(
                                  order.createdAt
                                ).toLocaleString()}</p>
                            </div>
                            <span class="px-3 py-1 rounded-full text-sm font-medium ${
                              order.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : order.status === "in_progress"
                                ? "bg-purple-100 text-purple-800"
                                : order.status === "accepted"
                                ? "bg-blue-100 text-blue-800"
                                : order.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }">
                                ${
                                  order.status === "completed"
                                    ? "Selesai"
                                    : order.status
                                }
                            </span>
                        </div>
                        <div class="space-y-2 text-sm mb-4">
                            <div class="flex items-center space-x-2">
                                <i class="fas fa-map-marker-alt text-green-500"></i>
                                <span>${order.origin}</span>
                            </div>
                            <div class="flex items-center space-x-2">
                                <i class="fas fa-map-marker text-red-500"></i>
                                <span>${order.destination}</span>
                            </div>
                            <div class="flex items-center space-x-2">
                                <i class="fas fa-money-bill text-blue-500"></i>
                                <span>Rp ${
                                  order.price?.toLocaleString() || "0"
                                }</span>
                            </div>
                        </div>
                        <div class="flex flex-wrap gap-2 mt-4">
                          <button class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-xs" onclick="driverDashboard.showOrderDetail(${
                            order.id
                          })"><i class='fas fa-info-circle mr-1'></i>Detail</button>
                        </div>
                    </div>
                `
          )
          .join("");
      }
    } catch (error) {
      console.error("Error loading driver orders:", error);
    }
  }

  getOrderActions(order) {
    switch (order.status) {
      case "accepted":
        return `
                    <div class="flex space-x-2">
                        <button onclick="driverDashboard.updateOrderStatus(${order.id}, 'in_progress')" 
                                class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                            <i class="fas fa-play mr-2"></i>Mulai Perjalanan
                        </button>
                    </div>
                `;
      case "in_progress":
        return `
                    <div class="flex space-x-2">
                        <button onclick="driverDashboard.updateOrderStatus(${order.id}, 'completed')" 
                                class="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                            <i class="fas fa-check mr-2"></i>Selesai
                        </button>
                    </div>
                `;
      default:
        return "";
    }
  }

  async toggleStatus() {
    try {
      ui.showLoading();

      const currentStatus = await api.getDriverStatus();
      const newStatus =
        currentStatus.status === "available" ? "unavailable" : "available";
      await api.updateDriverStatus({
        userId: localStorage.getItem("ojol_userId"),
        status: newStatus,
      });

      ui.showToast(
        `Status berhasil diubah menjadi ${
          newStatus === "available" ? "Online" : "Offline"
        }`
      );

      // Reload status and available orders
      await this.loadDriverStatus();
      await this.loadAvailableOrders();
    } catch (error) {
      console.error("Error toggling status:", error);
      ui.showError("Gagal mengubah status");
    } finally {
      ui.hideLoading();
    }
  }

  async acceptOrder(orderId) {
    try {
      ui.showLoading();

      await api.acceptOrder(orderId);

      ui.showToast("Pesanan berhasil diterima!");

      // Reload orders
      await this.loadAvailableOrders();
      await this.loadDriverOrders();
      await this.loadStatistics();
      await this.loadDashboard();
    } catch (error) {
      console.error("Error accepting order:", error);

      ui.showError("Gagal menerima pesanan");
    } finally {
      ui.hideLoading();
    }
  }

  async updateOrderStatus(orderId, status) {
    try {
      ui.showLoading();

      await api.updateOrderStatus(orderId, { status: status });

      ui.showToast("Status pesanan berhasil diperbarui!");

      // Reload orders
      await this.loadDriverOrders();
      await this.loadStatistics();
    } catch (error) {
      console.error("Error updating order status:", error);
      ui.showError("Gagal memperbarui status pesanan");
    } finally {
      ui.hideLoading();
    }
  }

  getStatusColor(status) {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-blue-100 text-blue-800",
      in_progress: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  }

  getStatusText(status) {
    const texts = {
      waiting: "Menunggu",
      accepted: "Diterima",
      in_progress: "Dalam Proses",
      completed: "Selesai",
      cancelled: "Dibatalkan",
    };
    return texts[status] || status;
  }

  async loadInProgressOrders() {
    try {
      const driverId = localStorage.getItem("ojol_userId");
      const orders = await api.request(
        `/orders/driver/${driverId}/in-progress`
      );
      const container = document.getElementById("in-progress-orders");

      if (container) {
        if (!Array.isArray(orders) || orders.length === 0) {
          container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                  <i class="fas fa-spinner text-4xl mb-4"></i>
                  <p>Tidak ada pesanan dalam proses</p>
                </div>`;
          return;
        }

        // Ambil payment status secara paralel untuk setiap order
        const ordersWithPayment = await Promise.all(
          orders.map(async (order) => {
            try {
              const paymentData = await api.request(
                `/orders/${order.id}/payment`
              );
              return { ...order, paymentStatus: paymentData?.status || "-" };
            } catch (e) {
              console.warn(`Gagal ambil payment untuk order ${order.id}`, e);
              return { ...order, paymentStatus: "-" };
            }
          })
        );

        // Render tampilan dengan payment status
        container.innerHTML = ordersWithPayment
          .map(
            (order) => `
                  <div class="border border-yellow-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div class="flex justify-between items-start mb-3">
                      <div>
                        <h3 class="font-semibold text-gray-800">Order #${
                          order.id
                        }</h3>
                        <p class="text-sm text-gray-600">${new Date(
                          order.createdAt
                        ).toLocaleString()}</p>
                      </div>
                      <div class="text-right">
                        <span class="px-3 py-1 rounded-full text-sm font-medium ${
                          order.status === "in_progress"
                            ? "bg-purple-100 text-purple-600"
                            : "bg-gray-100 text-gray-600"
                        }">${
              order.status === "in_progress" ? "Dalam Proses" : order.status
            }</span>
                        <p class="text-sm text-gray-500 rounded-full px-2 py-1"> <strong class="px-2 py-1 rounded-full ${
                          order.paymentStatus === "paid"
                            ? "bg-green-100 text-green-600"
                            : "bg-yellow-100 text-yellow-600"
                        }">${
              order.paymentStatus === "paid" ? "Lunas" : "Belum Lunas"
            }</strong></p>
                      </div>
                    </div>
                    <div class="space-y-2 text-sm">
                      <div class="flex items-center space-x-2"><i class="fas fa-map-marker-alt text-green-500"></i><span>${
                        order.origin
                      }</span></div>
                      <div class="flex items-center space-x-2"><i class="fas fa-map-marker text-red-500"></i><span>${
                        order.destination
                      }</span></div>
                      <div class="flex items-center space-x-2"><i class="fas fa-money-bill text-blue-500"></i><span>Rp ${
                        order.price?.toLocaleString() || "0"
                      }</span></div>
                      <div class="flex items-center space-x-2"><i class="fas fa-route text-blue-500"></i><span>${
                        order.distance?.toLocaleString() || "0"
                      } km</span></div>
                    </div>
                    <div class="flex flex-wrap gap-2 mt-4">
                      <button class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-xs" onclick="driverDashboard.showOrderDetail(${
                        order.id
                      })"><i class='fas fa-info-circle mr-1'></i>Detail</button>
                      <button class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs" onclick="driverDashboard.updatePaymentStatus(${
                        order.id
                      })"><i class='fas fa-money-check-alt mr-1'></i>Ubah Status Pembayaran</button>
                      <button class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs" onclick="driverDashboard.completeOrder(${
                        order.id
                      })"><i class='fas fa-check mr-1'></i>Selesai</button>
                    </div>
                  </div>`
          )
          .join("");
      }
    } catch (error) {
      console.error("Error loading in progress orders:", error);
    }
  }

  showOrderDetail(orderId) {
    // Implementasi modal/detail popup sesuai kebutuhan
    alert(
      "Detail order #" + orderId + " (implementasi detail bisa disesuaikan)"
    );
  }

  async updatePaymentStatus(orderId) {
    try {
      ui.showLoading();
      const payment = await api.getPaymentByOrderId(orderId); // Pastikan API ini tersedia
      ui.hideLoading();

      let badgeClass =
        payment.status === "paid"
          ? "bg-green-100 text-green-800"
          : "bg-yellow-100 text-yellow-800";
      let badgeText =
        payment.status === "paid" ? "Lunas" : "Menunggu Pembayaran";

      let html = `
        <h2 class='text-lg font-bold mb-4 flex items-center gap-2'>
          <i class="fas fa-money-check-alt text-yellow-500"></i>Ubah Status Pembayaran
        </h2>
        <div class='mb-4 grid grid-cols-1 gap-2 text-sm'>
          <div><span class='font-semibold text-gray-700'>Metode:</span> <span class='ml-2'>${
            payment.method || "-"
          }</span></div>
          <div><span class='font-semibold text-gray-700'>Jumlah:</span> <span class='ml-2 text-blue-700 font-bold'>Rp ${
            payment.amount?.toLocaleString() || "0"
          }</span></div>
          <div><span class='font-semibold text-gray-700'>Tanggal Bayar:</span> <span class='ml-2'>${
            payment.paidAt ? new Date(payment.paidAt).toLocaleString() : "-"
          }</span></div>
          <div><span class='font-semibold text-gray-700'>Status Saat Ini:</span> <span class='ml-2 px-2 py-1 rounded-full text-xs font-semibold ${badgeClass}'>${badgeText}</span></div>
        </div>
        <div class='mb-4'>
          <label for='payment-status-select' class='block font-semibold text-gray-700 mb-1'>Pilih status pembayaran untuk order #${orderId}:</label>
          <select id='payment-status-select' class='w-full border rounded px-2 py-2 mb-2 focus:ring-2 focus:ring-yellow-400'>
            <option value='pending' ${
              payment.status === "pending" ? "selected" : ""
            }>Menunggu Pembayaran</option>
            <option value='paid' ${
              payment.status === "paid" ? "selected" : ""
            }>Lunas</option>
          </select>
        </div>
        <button id='btn-update-payment-status' class='w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg shadow transition-all text-base flex items-center justify-center gap-2'>
          <i class="fas fa-save"></i> Update Status
        </button>
      `;

      this.showModal(html);

      document.getElementById("btn-update-payment-status").onclick =
        async () => {
          const status = document.getElementById("payment-status-select").value;
          try {
            ui.showLoading();
            await api.updatePaymentStatusByOrderId(orderId, { status });
            ui.showToast("Status pembayaran berhasil diubah!");
            this.hideModal();
            await this.loadInProgressOrders();
          } catch (e) {
            ui.showError("Gagal mengubah status pembayaran");
          } finally {
            ui.hideLoading();
          }
        };
    } catch (error) {
      ui.hideLoading();
      ui.showError("Gagal mengambil detail pembayaran");
      console.error("Error loading payment detail:", error);
    }
  }

  async completeOrder(orderId) {
    try {
      ui.showLoading();
      await api.completeOrder(orderId);
      ui.showToast("Order berhasil diselesaikan!");
      await this.loadInProgressOrders();
    } catch (error) {
      ui.showError("Gagal menyelesaikan order");
    } finally {
      ui.hideLoading();
    }
  }
}

// Initialize driver dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.driverDashboard = new DriverDashboard();
});

// Modal HTML (sekali saja di body)
if (!document.getElementById("modal-driver-dashboard")) {
  const modalHtml = `
    <div id="modal-driver-dashboard" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 hidden">
      <div class="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
        <button id="modal-close-btn" class="absolute top-2 right-2 text-gray-500 hover:text-gray-700"><i class="fas fa-times"></i></button>
        <div id="modal-driver-dashboard-content"></div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHtml);
  document.getElementById("modal-close-btn").onclick = () =>
    window.driverDashboard.hideModal();
}

DriverDashboard.prototype.showModal = function (html) {
  document.getElementById("modal-driver-dashboard-content").innerHTML = html;
  document.getElementById("modal-driver-dashboard").classList.remove("hidden");
};
DriverDashboard.prototype.hideModal = function () {
  document.getElementById("modal-driver-dashboard").classList.add("hidden");
};

// Implementasi showOrderDetail yang diperbaiki
DriverDashboard.prototype.showOrderDetail = async function (orderId) {
  try {
    ui.showLoading();
    const result = await api.getOrderById(orderId);
    const order = result.order || result; // fallback jika backend belum update
    const paymentStatus = result.paymentStatus || order.paymentStatus;

    // Ambil data customer dari user service dengan endpoint yang benar
    let customerData = null;
    let userData = null;

    try {
      // Coba ambil data customer terlebih dahulu
      customerData = await api.getCustomerByUserId(order.userId);
      console.log("Customer data from getCustomerByUserId:", customerData); // Debug log
    } catch (e) {
      console.warn(
        "Gagal mengambil data customer dari getCustomerByUserId:",
        e
      );
    }
    try {
      // Fallback ke data user
      userData = await api.getUserById(order.userId);
      console.log("User data from getUserById:", userData); // Debug log
    } catch (e) {
      console.warn("Gagal mengambil data user dari getUserById:", e);
    }

    // Ambil data customer dengan fallback yang lebih baik
    const customerName = userData?.name;
    const customerPhone = customerData?.phone || userData?.phone || "N/A";

    console.log(
      "Final customer data - Name:",
      customerName,
      "Phone:",
      customerPhone
    ); // Debug log

    let html = `
      <h2 class='text-lg font-bold mb-4 flex items-center gap-2'><i class="fas fa-info-circle text-blue-500"></i>Detail Order #${
        order.id
      }</h2>
      <div class='mb-4 grid grid-cols-1 gap-2'>
        <div><span class='font-semibold text-gray-700'>Status:</span> <span class='ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
          order.status === "in_progress"
            ? "bg-purple-100 text-purple-800"
            : order.status === "completed"
            ? "bg-green-100 text-green-800"
            : "bg-yellow-100 text-yellow-800"
        }'>${
      order.status === "in_progress"
        ? "Dalam Proses"
        : order.status === "completed"
        ? "Selesai"
        : order.status
    }</span></div>
        <div class='font-semibold text-gray-700 mt-2 flex items-center gap-2'><i class="fas fa-map-marker-alt text-green-500"></i> Asal</div>
        <div class='ml-4 text-sm text-gray-700'>${order.origin}</div>
        <div class='ml-4 text-xs text-gray-500'>Lat: ${
          order.originLat
        } | Lng: ${order.originLng}</div>
        <div class='font-semibold text-gray-700 mt-2 flex items-center gap-2'><i class="fas fa-map-marker text-red-500"></i> Tujuan</div>
        <div class='ml-4 text-sm text-gray-700'>${order.destination}</div>
        <div class='ml-4 text-xs text-gray-500'>Lat: ${
          order.destinationLat
        } | Lng: ${order.destinationLng}</div>
        <div class='mt-2'><span class='font-semibold text-gray-700'>Harga:</span> <span class='ml-2 text-blue-700 font-bold'>Rp ${
          order.price?.toLocaleString() || "0"
        }</span></div>
        <div><span class='font-semibold text-gray-700'>Jarak:</span> <span class='ml-2'>${
          order.distance?.toLocaleString() || "0"
        } km</span></div>
        <div><span class='font-semibold text-gray-700'>Pembayaran:</span> <span class='ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
          paymentStatus === "paid"
            ? "bg-green-100 text-green-800"
            : "bg-yellow-100 text-yellow-800"
        }'>${paymentStatus === "paid" ? "Lunas" : "Belum Lunas"}</span></div>
        <div class='font-semibold text-gray-700 mt-2 flex items-center gap-2'><i class="fas fa-user text-purple-500"></i> Data Customer</div>
        <div class='ml-4 text-sm text-gray-700'>Nama: ${customerName}</div>
        <div class='ml-4 text-sm text-gray-700'>Phone: ${customerPhone}</div>
        <div class='ml-4 text-xs text-gray-500'>ID: ${order.userId}</div>
      </div>
    `;
    this.showModal(html);
  } catch (e) {
    console.error("Error loading order detail:", e);
    ui.showError("Gagal memuat detail order");
  } finally {
    ui.hideLoading();
  }
};
