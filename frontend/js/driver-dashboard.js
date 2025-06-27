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
      // Redirect ke halaman yang sesuai dengan role, bukan logout
      if (role === CONFIG.ROLES.ADMIN) {
        window.location.href = "admin-dashboard.html";
      } else if (role === CONFIG.ROLES.CUSTOMER) {
        window.location.href = "customer-dashboard.html";
      } else {
        // Jika role tidak dikenal, baru logout
        ui.showError("Role tidak valid.");
        auth.logout();
        window.location.href = "index.html";
      }
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
        this.showLogoutConfirmation();
      });
    }
  }

  showLogoutConfirmation() {
    this.showModal(`
            <div class="p-6 text-center">
                <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-sign-out-alt text-red-600 text-2xl"></i>
                </div>
                <h3 class="text-lg font-bold text-gray-800 mb-2">Konfirmasi Logout</h3>
                <p class="text-gray-600 mb-6">Apakah Anda yakin ingin keluar dari sistem?</p>
                <div class="flex space-x-3">
                    <button onclick="driverDashboard.hideModal()" 
                            class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors">
                        Batal
                    </button>
                    <button onclick="driverDashboard.confirmLogout()" 
                            class="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
                        <i class="fas fa-sign-out-alt mr-2"></i>Logout
                    </button>
                </div>
            </div>
        `);
  }

  confirmLogout() {
    this.hideModal();
    auth.logout();
    window.location.href = "index.html";
  }

  async loadDashboard() {
    try {
      ui.showLoading();

      // Load driver profile
      await this.loadDriverProfile();

      // Load driver status (dengan auto-update berdasarkan order aktif)
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

      // Set up auto-refresh untuk status driver setiap 30 detik
      this.setupStatusAutoRefresh();

      // Tampilkan status driver di navigation
      await this.updateNavigationStatus();
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

      // Simpan nama driver ke localStorage untuk digunakan di navigation status
      localStorage.setItem("ojol_driverName", driverData.name || "Driver");
    } catch (error) {
      console.error("Error loading driver profile:", error);
    }
  }

  async loadVehicleInfo() {
    try {
      const vehicleData = await api.getDriverVehicle();
      const vehicleContainer = document.getElementById("vehicle-info");

      if (vehicleContainer) {
        vehicleContainer.innerHTML = `
                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
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
                            <button onclick="driverDashboard.editVehicleInfo()" 
                                    class="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                                <i class="fas fa-edit"></i>
                            </button>
                        </div>
                        <div class="border-t pt-3">
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Brand:</span>
                                    <span class="font-medium">${
                                      vehicleData.vehicleBrand || "N/A"
                                    }</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Type:</span>
                                    <span class="font-medium">${
                                      vehicleData.vehicleType || "N/A"
                                    }</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Plate Number:</span>
                                    <span class="font-medium">${
                                      vehicleData.plateNumber || "N/A"
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

  async editVehicleInfo() {
    try {
      ui.showLoading();
      const vehicleData = await api.getDriverVehicle();

      const html = `
                <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                    <i class="fas fa-edit text-blue-500"></i>Edit Informasi Kendaraan
                </h2>
                <form id="edit-vehicle-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Jenis Kendaraan</label>
                        <select id="edit-vehicle-type" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" required>
                            <option value="motor" ${
                              vehicleData.vehicleType === "motor"
                                ? "selected"
                                : ""
                            }>Motor</option>
                            <option value="mobil" ${
                              vehicleData.vehicleType === "mobil"
                                ? "selected"
                                : ""
                            }>Mobil</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Merek Kendaraan</label>
                        <input type="text" id="edit-vehicle-brand" 
                               class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" 
                               value="${vehicleData.vehicleBrand || ""}" 
                               placeholder="Honda, Yamaha, dll" required />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Model Kendaraan</label>
                        <input type="text" id="edit-vehicle-model" 
                               class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" 
                               value="${vehicleData.vehicleModel || ""}" 
                               placeholder="Vario, NMAX, dll" required />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Nomor Plat</label>
                        <input type="text" id="edit-plate-number" 
                               class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" 
                               value="${vehicleData.plateNumber || ""}" 
                               placeholder="B 1234 ABC" required />
                    </div>
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" onclick="driverDashboard.hideModal()" 
                                class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                            Batal
                        </button>
                        <button type="submit" 
                                class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                            <i class="fas fa-save mr-1"></i>Simpan
                        </button>
                    </div>
                </form>
            `;

      this.showModal(html);

      // Add form submit handler
      document
        .getElementById("edit-vehicle-form")
        .addEventListener("submit", async (e) => {
          e.preventDefault();
          await this.submitEditVehicleInfo();
        });
    } catch (error) {
      console.error("Error loading vehicle data for edit:", error);
      ui.showError("Gagal memuat data kendaraan");
    } finally {
      ui.hideLoading();
    }
  }

  async submitEditVehicleInfo() {
    try {
      ui.showLoading();

      const vehicleType = document.getElementById("edit-vehicle-type").value;
      const vehicleBrand = document
        .getElementById("edit-vehicle-brand")
        .value.trim();
      const vehicleModel = document
        .getElementById("edit-vehicle-model")
        .value.trim();
      const plateNumber = document
        .getElementById("edit-plate-number")
        .value.trim();

      // Validasi form
      if (!vehicleType || !vehicleBrand || !vehicleModel || !plateNumber) {
        ui.showError("Semua field wajib diisi!");
        return;
      }

      // Validasi format nomor plat (sederhana)
      const plateRegex = /^[A-Z]\s\d{1,4}\s[A-Z]{1,3}$/;
      if (!plateRegex.test(plateNumber)) {
        ui.showError("Format nomor plat tidak valid! Contoh: B 1234 ABC");
        return;
      }

      const vehicleData = {
        vehicleType,
        vehicleBrand,
        vehicleModel,
        plateNumber,
      };

      await api.updateDriverVehicle(vehicleData);
      ui.showToast("Informasi kendaraan berhasil diperbarui");
      this.hideModal();
      await this.loadVehicleInfo();
    } catch (error) {
      console.error("Error updating vehicle info:", error);

      // Handle specific error messages from backend
      if (error.responseData && error.responseData.message) {
        ui.showError(error.responseData.message);
      } else {
        ui.showError("Gagal memperbarui informasi kendaraan: " + error.message);
      }
    } finally {
      ui.hideLoading();
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

      // Cek status driver untuk menentukan apakah bisa menerima order
      const statusData = await api.getDriverStatus();
      const currentStatus = statusData.status || "unavailable";
      const hasActiveOrder = await this.checkActiveOrder();

      const canAcceptOrders = currentStatus === "available" && !hasActiveOrder;

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
                                Menunggu Driver
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
                            <div class="flex items-center space-x-2">
                                <i class="fas fa-road text-blue-500"></i>
                                <span>${
                                  order.distance?.toLocaleString() || "0"
                                } km</span>
                            </div>
                        </div>
                        <div class="flex flex-wrap gap-2 mt-4">
                            <button class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-xs" onclick="driverDashboard.showOrderDetail(${
                              order.id
                            })">
                                <i class="fas fa-eye mr-1"></i>Detail
                            </button>
                            <button class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs ${
                              canAcceptOrders
                                ? ""
                                : "opacity-50 cursor-not-allowed"
                            }" onclick="${
              canAcceptOrders
                ? `driverDashboard.acceptOrder(${order.id})`
                : "return false"
            }">
                                <i class="fas fa-check mr-1"></i>${
                                  canAcceptOrders
                                    ? "Terima Order"
                                    : "Tidak Bisa Terima"
                                }
                            </button>
                        </div>
                    </div>
                `
          )
          .join("");

        // Tambahkan event listener untuk setiap tombol detail
        container
          .querySelectorAll("[onclick*='showOrderDetail']")
          .forEach((button) => {
            button.addEventListener("click", async (e) => {
              const orderId = button.getAttribute("onclick").match(/\d+/)[0];
              await this.showOrderDetail(orderId);
            });
          });
      }
    } catch (error) {
      console.error("Error loading available orders:", error);
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
                                : order.status === "in_progress" ||
                                  order.status === "cancel_requested"
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
                                    : order.status === "in_progress" ||
                                      order.status === "cancel_requested"
                                    ? "Pesanan Dalam Proses"
                                    : order.status === "accepted"
                                    ? "Diterima"
                                    : order.status === "pending"
                                    ? "Menunggu"
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
                    <div class="flex flex-wrap gap-2 mt-4">
                        <button class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs" onclick="driverDashboard.updatePaymentStatus(${order.id})">
                            <i class='fas fa-money-check-alt mr-1'></i>Ubah Status Pembayaran
                        </button>
                        <button class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs ${
                          order.paymentStatus === "paid" ? "" : "opacity-50 cursor-not-allowed"
                        }" onclick="${
                          order.paymentStatus === "paid" 
                            ? `driverDashboard.showCompleteOrderModal(${order.id})`
                            : "return false"
                        }">
                            <i class='fas fa-check mr-1'></i>Complete Order
                        </button>
                    </div>
                    ${
                      order.paymentStatus !== "paid" 
                        ? '<div class="mt-2 text-xs text-red-600"><i class="fas fa-exclamation-triangle mr-1"></i>Order tidak dapat diselesaikan karena pembayaran belum lunas</div>'
                        : ""
                    }
                `;
      case "cancel_requested":
        return `
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3 mt-3">
                        <div class="flex items-center gap-2 mb-2">
                            <i class="fas fa-exclamation-triangle text-yellow-600"></i>
                            <span class="text-yellow-800 font-medium">Customer meminta pembatalan</span>
                        </div>
                        <p class="text-sm text-yellow-700 mb-3">Customer ingin membatalkan pesanan ini. Pesanan masih dalam proses sampai Anda memutuskan.</p>
                        <div class="flex space-x-2">
                            <button onclick="driverDashboard.approveCancellation(${order.id})" 
                                    class="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
                                <i class="fas fa-check mr-2"></i>Setujui Pembatalan
                            </button>
                            <button onclick="driverDashboard.rejectCancellation(${order.id})" 
                                    class="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                                <i class="fas fa-times mr-2"></i>Tolak Pembatalan
                            </button>
                        </div>
                    </div>
                `;
      default:
        return "";
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

  async approveCancellation(orderId) {
    try {
      ui.showLoading();

      const confirmApprove = confirm(
        "Yakin ingin menyetujui pembatalan pesanan ini? Pesanan akan dibatalkan."
      );
      if (!confirmApprove) {
        ui.hideLoading();
        return;
      }

      await api.approveCancellation(orderId);
      ui.showToast("Pembatalan pesanan berhasil disetujui!");

      // Update status driver menjadi available setelah order dibatalkan
      await this.updateDriverStatusAutomatically("available");

      // Reload data
      await this.loadDriverOrders();
      await this.loadInProgressOrders();
      await this.loadDriverStatus();
      await this.loadStatistics();
    } catch (error) {
      console.error("Error approving cancellation:", error);
      ui.showError("Gagal menyetujui pembatalan pesanan");
    } finally {
      ui.hideLoading();
    }
  }

  async rejectCancellation(orderId) {
    try {
      ui.showLoading();

      const confirmReject = confirm(
        "Yakin ingin menolak pembatalan dan melanjutkan pesanan ini? Pesanan akan dilanjutkan."
      );
      if (!confirmReject) {
        ui.hideLoading();
        return;
      }

      await api.rejectCancellation(orderId);
      ui.showToast("Pembatalan ditolak, pesanan dilanjutkan!");

      // Reload data
      await this.loadDriverOrders();
      await this.loadInProgressOrders();
      await this.loadDriverStatus();
      await this.loadStatistics();
    } catch (error) {
      console.error("Error rejecting cancellation:", error);
      ui.showError("Gagal menolak pembatalan pesanan");
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
      cancel_requested: "bg-purple-100 text-purple-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  }

  getStatusText(status) {
    const texts = {
      waiting: "Menunggu",
      accepted: "Diterima",
      in_progress: "Pesanan Dalam Proses",
      completed: "Selesai",
      cancelled: "Dibatalkan",
      cancel_requested: "Pesanan Dalam Proses",
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
                          order.status === "in_progress" ||
                          order.status === "cancel_requested"
                            ? "bg-purple-100 text-purple-600"
                            : "bg-gray-100 text-gray-600"
                        }">${
              order.status === "in_progress" ||
              order.status === "cancel_requested"
                ? "Pesanan Dalam Proses"
                : order.status
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
                    </div>
                    ${this.getOrderActions(order)}
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
      console.error("Error loading in-progress orders:", error);
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
        <h2 class='text-lg font-bold mb-4 flex items-center gap-2'><i class="fas fa-money-check-alt text-yellow-500"></i>Ubah Status Pembayaran</h2>
        <div class='mb-4 grid grid-cols-1 gap-2'>
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
      
      // Update status driver menjadi available setelah order selesai
      await this.updateDriverStatusAutomatically("available");
      
      // Reload data
      await this.loadInProgressOrders();
      await this.loadDriverStatus();
      await this.loadStatistics();
    } catch (error) {
      ui.showError("Gagal menyelesaikan order");
    } finally {
      ui.hideLoading();
    }
  }

  async showCompleteOrderModal(orderId) {
    try {
      ui.showLoading();
      
      // Ambil detail order untuk ditampilkan di modal
      const orderResponse = await api.getOrderById(orderId);
      const paymentData = await api.getPaymentByOrderId(orderId);
      
      ui.hideLoading();

      // Handle struktur data order yang mungkin berbeda
      const order = orderResponse.order || orderResponse;
      
      // Debug: log struktur data
      console.log("Order Response:", orderResponse);
      console.log("Order Data:", order);
      console.log("Payment Data:", paymentData);

      const html = `
        <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
          <i class="fas fa-check-circle text-green-500"></i>Konfirmasi Selesaikan Order
        </h2>
        <div class="mb-6">
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 class="font-semibold text-blue-800 mb-2">Detail Order #${orderId}</h3>
            <div class="space-y-2 text-sm">
              <div class="flex flex-col">
                <span class="text-blue-700 font-medium mb-1">Asal:</span>
                <span class="text-gray-800 break-words leading-relaxed">${order.origin || order.originAddress || "N/A"}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-blue-700 font-medium mb-1">Tujuan:</span>
                <span class="text-gray-800 break-words leading-relaxed">${order.destination || order.destinationAddress || "N/A"}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-blue-700">Harga:</span>
                <span class="font-bold text-green-600">Rp ${(order.price || order.totalPrice || 0).toLocaleString()}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-blue-700">Jarak:</span>
                <span class="font-medium">${(order.distance || 0).toLocaleString()} km</span>
              </div>
              <div class="flex justify-between">
                <span class="text-blue-700">Status Pembayaran:</span>
                <span class="px-2 py-1 rounded-full text-xs font-semibold ${
                  paymentData?.status === "paid" 
                    ? "bg-green-100 text-green-600" 
                    : "bg-yellow-100 text-yellow-600"
                }">
                  ${paymentData?.status === "paid" ? "Lunas" : "Belum Lunas"}
                </span>
              </div>
            </div>
          </div>
          
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div class="flex items-start space-x-2">
              <i class="fas fa-exclamation-triangle text-yellow-600 mt-1"></i>
              <div class="text-sm text-yellow-800">
                <p class="font-medium mb-1">Penting:</p>
                <ul class="space-y-1 text-xs">
                  <li>• Pastikan customer sudah sampai di tujuan</li>
                  <li>• Pastikan pembayaran sudah lunas</li>
                  <li>• Order akan ditandai sebagai selesai</li>
                  <li>• Status driver akan otomatis menjadi "Available"</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end space-x-3">
          <button onclick="driverDashboard.hideModal()" 
                  class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
            Batal
          </button>
          <button onclick="driverDashboard.confirmCompleteOrder(${orderId})" 
                  class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <i class="fas fa-check mr-2"></i>Ya, Selesaikan Order
          </button>
        </div>
      `;

      this.showModal(html);
    } catch (error) {
      ui.hideLoading();
      ui.showError("Gagal memuat detail order");
      console.error("Error loading order detail for complete modal:", error);
    }
  }

  async confirmCompleteOrder(orderId) {
    try {
      this.hideModal();
      await this.completeOrder(orderId);
    } catch (error) {
      console.error("Error confirming complete order:", error);
    }
  }

  async loadDriverStatus() {
    try {
      const statusData = await api.getDriverStatus();
      const statusContainer = document.getElementById("driver-status-control");

      if (statusContainer) {
        const currentStatus = statusData.status || "unavailable";

        // Cek apakah driver memiliki order aktif
        const hasActiveOrder = await this.checkActiveOrder();

        // Jika ada order aktif, status otomatis menjadi "busy"
        let displayStatus = currentStatus;
        let isStatusLocked = false;

        if (hasActiveOrder && currentStatus !== "busy") {
          displayStatus = "busy";
          isStatusLocked = true;
          // Update status di backend jika berbeda
          await this.updateDriverStatusAutomatically("busy");
        } else if (!hasActiveOrder && currentStatus === "busy") {
          displayStatus = "available";
          // Update status di backend jika berbeda
          await this.updateDriverStatusAutomatically("available");
        }

        const statusConfig = this.getStatusConfig(displayStatus);

        statusContainer.innerHTML = `
          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center space-x-3">
                <div class="w-12 h-12 ${
                  statusConfig.bgColor
                } rounded-full flex items-center justify-center">
                  <i class="${statusConfig.icon} text-xl ${
          statusConfig.textColor
        }"></i>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-800">Status Saat Ini</h3>
                  <p class="text-sm text-gray-600">${statusConfig.label}</p>
                  ${
                    isStatusLocked
                      ? '<p class="text-xs text-orange-600 mt-1"><i class="fas fa-lock mr-1"></i>Status terkunci (ada order aktif)</p>'
                      : ""
                  }
                </div>
              </div>
              <span class="px-3 py-1 rounded-full text-sm font-medium ${
                statusConfig.badgeClass
              }">
                ${statusConfig.badgeText}
              </span>
            </div>
            
            <div class="border-t pt-4">
              <button onclick="driverDashboard.showEditStatusModal()" 
                      class="w-full ${
                        isStatusLocked
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      } text-white py-3 px-4 rounded-lg transition-colors font-medium"
                      ${isStatusLocked ? "disabled" : ""}>
                <i class="fas fa-edit mr-2"></i>${
                  isStatusLocked ? "Status Terkunci" : "Ubah Status"
                }
              </button>
            </div>
            
            <div class="text-sm text-gray-600 space-y-2">
              <div class="flex items-center space-x-2">
                <i class="fas fa-info-circle text-blue-500"></i>
                <span>Available: Siap menerima pesanan</span>
              </div>
              <div class="flex items-center space-x-2">
                <i class="fas fa-info-circle text-yellow-500"></i>
                <span>Busy: Sedang dalam perjalanan (otomatis)</span>
              </div>
              <div class="flex items-center space-x-2">
                <i class="fas fa-info-circle text-red-500"></i>
                <span>Unavailable: Tidak tersedia</span>
              </div>
              ${
                isStatusLocked
                  ? `
              <div class="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div class="flex items-center space-x-2">
                  <i class="fas fa-exclamation-triangle text-orange-500"></i>
                  <span class="text-orange-700 font-medium">Status terkunci karena ada order aktif</span>
                </div>
                <p class="text-xs text-orange-600 mt-1">Status akan otomatis berubah menjadi "Available" setelah order selesai</p>
              </div>
              `
                  : ""
              }
            </div>
          </div>
        `;
      }

      // Update navigation status juga
      await this.updateNavigationStatus();
    } catch (error) {
      console.error("Error loading driver status:", error);
    }
  }

  async checkActiveOrder() {
    try {
      const driverId = localStorage.getItem("ojol_userId");
      const orders = await api.request(
        `/orders/driver/${driverId}/in-progress`
      );
      return Array.isArray(orders) && orders.length > 0;
    } catch (error) {
      console.error("Error checking active order:", error);
      return false;
    }
  }

  async updateDriverStatusAutomatically(newStatus) {
    try {
      const userId = localStorage.getItem("ojol_userId");
      const statusData = {
        userId: parseInt(userId),
        status: newStatus,
      };
      await api.updateDriverStatus(statusData);
    } catch (error) {
      console.error("Error updating driver status automatically:", error);
    }
  }

  getStatusConfig(status) {
    const configs = {
      available: {
        label: "Tersedia",
        badgeText: "Available",
        badgeClass: "bg-green-100 text-green-800",
        bgColor: "bg-green-100",
        textColor: "text-green-600",
        icon: "fas fa-check-circle",
      },
      busy: {
        label: "Sibuk",
        badgeText: "Busy",
        badgeClass: "bg-yellow-100 text-yellow-800",
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-600",
        icon: "fas fa-clock",
      },
      unavailable: {
        label: "Tidak Tersedia",
        badgeText: "Unavailable",
        badgeClass: "bg-red-100 text-red-800",
        bgColor: "bg-red-100",
        textColor: "text-red-600",
        icon: "fas fa-times-circle",
      },
    };

    return configs[status] || configs.unavailable;
  }

  showEditStatusModal() {
    // Cek apakah ada order aktif
    this.checkActiveOrder().then((hasActiveOrder) => {
      if (hasActiveOrder) {
        ui.showError(
          "Tidak dapat mengubah status karena ada order yang sedang aktif. Selesaikan order terlebih dahulu."
        );
        return;
      }

      this.showEditStatusForm();
    });
  }

  showEditStatusForm() {
    const html = `
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
        <i class="fas fa-edit text-blue-500"></i>Ubah Status Driver
      </h2>
      <form id="edit-status-form" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Pilih Status</label>
          <select id="edit-driver-status" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" required>
            <option value="available">Available - Siap menerima pesanan</option>
            
            <option value="unavailable">Unavailable - Tidak tersedia</option>
          </select>
        </div>
        
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div class="flex items-start space-x-2">
            <i class="fas fa-info-circle text-blue-500 mt-1"></i>
            <div class="text-sm text-blue-800">
              <p class="font-medium mb-1">Keterangan Status:</p>
              <ul class="space-y-1 text-xs">
                <li><strong>Available:</strong> Driver siap menerima pesanan baru</li>
                <li><strong>Busy:</strong> Driver sedang dalam perjalanan dengan pesanan (otomatis saat ada order aktif)</li>
                <li><strong>Unavailable:</strong> Driver tidak tersedia untuk sementara</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div class="flex items-start space-x-2">
            <i class="fas fa-exclamation-triangle text-yellow-500 mt-1"></i>
            <div class="text-sm text-yellow-800">
              <p class="font-medium mb-1">Penting:</p>
              <ul class="space-y-1 text-xs">
                <li>Status akan otomatis menjadi "Busy" ketika ada order aktif</li>
                <li>Status akan otomatis menjadi "Available" setelah order selesai</li>
                <li>Status "Unavailable" hanya untuk kondisi darurat atau istirahat</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end space-x-3 pt-4">
          <button type="button" onclick="driverDashboard.hideModal()" 
                  class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
            Batal
          </button>
          <button type="submit" 
                  class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            <i class="fas fa-save mr-1"></i>Simpan Status
          </button>
        </div>
      </form>
    `;

    this.showModal(html);

    // Add form submit handler
    document
      .getElementById("edit-status-form")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        await this.submitEditStatus();
      });
  }

  async submitEditStatus() {
    try {
      ui.showLoading();

      const newStatus = document.getElementById("edit-driver-status").value;
      const userId = localStorage.getItem("ojol_userId");

      if (!newStatus || !userId) {
        ui.showError("Data status tidak lengkap!");
        return;
      }

      const statusData = {
        userId: parseInt(userId),
        status: newStatus,
      };

      await api.updateDriverStatus(statusData);
      ui.showToast("Status driver berhasil diperbarui!");
      this.hideModal();

      // Reload status setelah update
      await this.loadDriverStatus();

      // Reload juga data lain yang mungkin terpengaruh
      await this.loadDriverProfile();
      await this.loadStatistics();
    } catch (error) {
      console.error("Error updating driver status:", error);

      // Handle specific error messages from backend
      if (error.responseData && error.responseData.message) {
        ui.showError(error.responseData.message);
      } else {
        ui.showError("Gagal memperbarui status driver: " + error.message);
      }
    } finally {
      ui.hideLoading();
    }
  }

  async acceptOrder(orderId) {
    try {
      ui.showLoading();

      // Cek status driver terlebih dahulu
      const statusData = await api.getDriverStatus();
      const currentStatus = statusData.status || "unavailable";

      // Validasi status driver
      if (currentStatus === "unavailable") {
        ui.showError(
          "Tidak dapat menerima order karena status driver 'Unavailable'. Ubah status menjadi 'Available' terlebih dahulu."
        );
        return;
      }

      if (currentStatus === "busy") {
        ui.showError(
          "Tidak dapat menerima order karena driver sedang dalam perjalanan. Selesaikan order yang sedang berlangsung terlebih dahulu."
        );
        return;
      }

      // Cek apakah sudah ada order aktif
      const hasActiveOrder = await this.checkActiveOrder();
      if (hasActiveOrder) {
        ui.showError(
          "Tidak dapat menerima order karena masih ada order yang sedang aktif. Selesaikan order tersebut terlebih dahulu."
        );
        return;
      }

      await api.acceptOrder(orderId);
      ui.showToast("Pesanan berhasil diterima!");

      // Update status driver menjadi busy setelah menerima order
      await this.updateDriverStatusAutomatically("busy");

      // Reload data
      await this.loadAvailableOrders();
      await this.loadInProgressOrders();
      await this.loadDriverStatus();
      await this.loadStatistics();
    } catch (error) {
      console.error("Error accepting order:", error);

      // Handle specific error messages from backend
      if (error.responseData && error.responseData.message) {
        ui.showError(error.responseData.message);
      } else {
        ui.showError("Gagal menerima pesanan: " + error.message);
      }
    } finally {
      ui.hideLoading();
    }
  }

  setupStatusAutoRefresh() {
    // Clear existing interval if any
    if (this.statusRefreshInterval) {
      clearInterval(this.statusRefreshInterval);
    }

    // Set up new interval untuk refresh status setiap 30 detik
    this.statusRefreshInterval = setInterval(async () => {
      try {
        await this.loadDriverStatus();
      } catch (error) {
        console.error("Error in status auto-refresh:", error);
      }
    }, 30000); // 30 detik
  }

  async updateNavigationStatus() {
    try {
      const statusData = await api.getDriverStatus();
      const currentStatus = statusData.status || "unavailable";
      const statusConfig = this.getStatusConfig(currentStatus);

      // Update status di navigation bar
      const driverNameElement = document.getElementById("driver-name");
      if (driverNameElement) {
        // Ambil nama driver dari localStorage atau dari elemen yang sudah ada
        const driverName = localStorage.getItem("ojol_driverName") || "Driver";

        driverNameElement.innerHTML = `
          ${driverName}
          <span class="ml-2 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.badgeClass}">
            ${statusConfig.badgeText}
          </span>
        `;
      }
    } catch (error) {
      console.error("Error updating navigation status:", error);
    }
  }
}

// Initialize driver dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.driverDashboard = new DriverDashboard();
});

// Cleanup when page is unloaded
window.addEventListener("beforeunload", () => {
  if (window.driverDashboard && window.driverDashboard.statusRefreshInterval) {
    clearInterval(window.driverDashboard.statusRefreshInterval);
  }
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
      // console.log(customerData);
    } catch (e) {
      console.warn(
        "Gagal mengambil data customer dari getCustomerByUserId:",
        e
      );
    }
    try {
      // Fallback ke data user
      userData = await api.getUserById(order.userId);
    } catch (e) {
      console.warn("Gagal mengambil data user dari getUserById:", e);
    }

    // Ambil data customer dengan fallback yang lebih baik
    const customerName = userData?.name;
    const customerPhone = customerData?.phone || userData?.phone;

    let html = `
      <h2 class='text-lg font-bold mb-4 flex items-center gap-2'><i class="fas fa-info-circle text-blue-500"></i>Detail Order #${
        order.id
      }</h2>
      <div class='mb-4 grid grid-cols-1 gap-2'>
        <div><span class='font-semibold text-gray-700'>Status:</span> <span class='ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
          order.status === "in_progress" || order.status === "cancel_requested"
            ? "bg-purple-100 text-purple-800"
            : order.status === "completed"
            ? "bg-green-100 text-green-800"
            : order.status === "cancelled"
            ? "bg-red-100 text-red-800"
            : "bg-yellow-100 text-yellow-800"
        }'>${
      order.status === "in_progress" || order.status === "cancel_requested"
        ? "Pesanan Dalam Proses"
        : order.status === "completed"
        ? "Selesai"
        : order.status === "cancelled"
        ? "Dibatalkan"
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
          order.destinationLng
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
