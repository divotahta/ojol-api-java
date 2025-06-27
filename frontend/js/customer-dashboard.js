// Customer Dashboard for OjoL Frontend
class CustomerDashboard {
  constructor() {
    this.init();
  }

  init() {
    this.checkAuth();
    this.setupEventListeners();
    this.loadDashboard();
    this.loadUserProfile();
  }

  async checkAuth() {
    if (!auth.isAuthenticated()) {
      window.location.href = "index.html";
      return;
    }

    const role = auth.getRole();
    if (role !== CONFIG.ROLES.CUSTOMER) {
      // Redirect ke halaman yang sesuai dengan role, bukan logout
      if (role === CONFIG.ROLES.ADMIN) {
        window.location.href = "admin-dashboard.html";
      } else if (role === CONFIG.ROLES.DRIVER) {
        window.location.href = "driver-dashboard.html";
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

    const orderForm = document.getElementById("order-form");
    if (orderForm && !orderForm.dataset.listenerAdded) {
      orderForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.createOrder();
      });
      orderForm.dataset.listenerAdded = "true";
    }

    // Update payment amount when price changes
    const priceInput = document.getElementById("price");
    const paymentAmountInput = document.getElementById("payment_amount");
    if (priceInput && paymentAmountInput) {
      priceInput.addEventListener("input", (e) => {
        paymentAmountInput.value = e.target.value;
      });
    }
  }

  async loadDashboard() {
    try {
      ui.showLoading();
      const userId = localStorage.getItem("ojol_userId");
      this.orders = await api.getCustomerOrders(userId);
      await this.loadStatistics();
      await this.loadActiveOrders();
      await this.loadOrderHistory();
    } catch (error) {
      console.error("Error loading dashboard:", error);
      ui.showError("Gagal memuat dashboard");
    } finally {
      ui.hideLoading();
    }
  }


  async loadUserProfile() {
  
    try {
      console.log("Loading user profile...");
      const userData = await api.getUserProfile();
      console.log("User data received:", userData);
      
      const profileContainer = document.getElementById(
        "customer-profile-detail"
      );
      console.log("Profile container:", profileContainer);

      if (profileContainer) {
        profileContainer.innerHTML = `
          <div class="space-y-3">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex items-center space-x-3">
                <i class="fas fa-phone text-blue-500 w-5"></i>
                <div>
                  <p class="text-sm text-gray-600">Phone</p>
                  <p class="font-medium" id="profile-phone">${userData.phone || "N/A"}</p>
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <i class="fas fa-map-marker-alt text-green-500 w-5"></i>
                <div>
                  <p class="text-sm text-gray-600">Address</p>
                  <p class="font-medium" id="profile-address">${userData.address || "N/A"}</p>
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <i class="fas fa-venus-mars text-purple-500 w-5"></i>
                <div>
                  <p class="text-sm text-gray-600">Gender</p>
                  <p class="font-medium" id="profile-gender">${this.getGenderText(userData.gender)}</p>
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <i class="fas fa-birthday-cake text-pink-500 w-5"></i>
                <div>
                  <p class="text-sm text-gray-600">Date of Birth</p>
                  <p class="font-medium" id="profile-dob">${userData.dateOfBirth ? new Date(userData.dateOfBirth).toLocaleDateString("id-ID") : "N/A"}</p>
                </div>
              </div>
            </div>
            <div class="pt-3 border-t border-gray-100">
              <div class="flex items-center space-x-3">
                <i class="fas fa-calendar-plus text-gray-500 w-5"></i>
                <div>
                  <p class="text-sm text-gray-600">Member Since</p>
                  <p class="font-medium" id="profile-created">${userData.createdAt ? new Date(userData.createdAt).toLocaleDateString("id-ID") : "N/A"}</p>
                </div>
              </div>
            </div>
          </div>
        `;
        console.log("Profile HTML updated");
      }

      // Update navigation
      const userName = document.getElementById("user-name");
      const userEmail = document.getElementById("user-email");
      if (userName) userName.textContent = userData.name || "Customer";
      if (userEmail) userEmail.textContent = userData.email || "";
      console.log("Navigation updated");
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  }


  async editProfile() {
    try {
      ui.showLoading();
      const userData = await api.getUserProfile();
      
      // Ambil customer data berdasarkan user ID
      const customerData = await api.getCustomerByUserId(userData.id);

      const html = `
        <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
          <i class="fas fa-user-edit text-red-500"></i>Edit Profile
        </h2>
        <form id="edit-profile-form" class="space-y-4">
          <input type="hidden" id="edit-profile-user-id" value="${userData.id}">
          <input type="hidden" id="edit-profile-customer-id" value="${customerData.id}">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input type="text" id="edit-profile-phone" value="${
                customerData.phone || ""
              }" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <select id="edit-profile-gender" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500">
                <option value="male" ${
                  customerData.gender === "male" ? "selected" : ""
                }>Male</option>
                <option value="female" ${
                  customerData.gender === "female" ? "selected" : ""
                }>Female</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
              <input type="date" id="edit-profile-dob" value="${
                customerData.dateOfBirth || ""
              }" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500">
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea id="edit-profile-address" rows="3" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500">${
                customerData.address || ""
              }</textarea>
            </div>
          </div>
          <div class="flex justify-end space-x-3 pt-4">
            <button type="button" onclick="customerDashboard.hideModal()" class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
              Batal
            </button>
            <button type="submit" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
              <i class="fas fa-save mr-1"></i>Update Profile
            </button>
          </div>
        </form>
      `;

      this.showModal(html);

      // Add form submit handler
      document
        .getElementById("edit-profile-form")
        .addEventListener("submit", async (e) => {
          e.preventDefault();
          await this.submitEditProfile();
        });
    } catch (error) {
      console.error("Error loading customer profile for edit:", error);
      ui.showError("Gagal memuat data profil");
    } finally {
      ui.hideLoading();
    }
  }

  async submitEditProfile() {
    try {
      ui.showLoading();
      const customerId = document.getElementById("edit-profile-customer-id").value;
      const userId = document.getElementById("edit-profile-user-id").value;
      
      const profileData = {
        userId: userId,
        phone: document.getElementById("edit-profile-phone").value,
        address: document.getElementById("edit-profile-address").value,
        gender: document.getElementById("edit-profile-gender").value,
        dateOfBirth: document.getElementById("edit-profile-dob").value, // Format: YYYY-MM-DD
      };

      console.log("Updating customer profile:", { customerId, profileData });

      const result = await api.updateCustomerProfile(customerId, profileData);
      if (result) {
        ui.showToast("Profile berhasil diupdate!");
        this.hideModal();
        await this.loadUserProfile();
      } else {
        ui.showError("Gagal mengupdate profile");
      }
    } catch (error) {
      console.error("Error updating customer profile:", error);
      ui.showError("Gagal mengupdate profile: " + error.message);
    } finally {
      ui.hideLoading();
    }
  }

  getGenderText(gender) {
    const texts = {
      male: "Laki-laki",
      female: "Perempuan",
    };
    return texts[gender] || gender || "N/A";
  }

  async loadStatistics() {
    try {
      const orders = this.orders || [];
      const activeOrdersCount = document.getElementById("active-orders-count");
      const completedOrdersCount = document.getElementById(
        "completed-orders-count"
      );
      const totalPayments = document.getElementById("total-payments");
      const todayPayments = document.getElementById("today-payments");

      const activeOrders = orders.filter(
        (order) => order.status === "in_progress" || order.status === "cancel_requested" || order.status === "waiting"
      );
      const completedOrders = orders.filter(
        (order) => order.status === "completed"
      );

      // Hitung total pembayaran semua waktu
      const totalPaymentValue = completedOrders.reduce(
        (sum, order) => sum + (order.price || 100),
        0
      );

      // Hitung total pembayaran hari ini
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set ke awal hari

      const todayCompletedOrders = completedOrders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      });

      const todayPaymentValue = todayCompletedOrders.reduce(
        (sum, order) => sum + (order.price || 100),
        0
      );

      if (activeOrdersCount)
        activeOrdersCount.textContent = activeOrders.length;
      if (completedOrdersCount)
        completedOrdersCount.textContent = completedOrders.length;
      if (totalPayments)
        totalPayments.textContent = `Rp ${totalPaymentValue.toLocaleString()}`;
      if (todayPayments)
        todayPayments.textContent = `Rp ${todayPaymentValue.toLocaleString()}`;
    } catch (error) {
      console.error("Error loading statistics:", error);
    }
  }

  async loadActiveOrders() {
    try {
      const orders = this.orders || [];
      const activeOrders = orders.filter(
        (order) => order.status === "in_progress" || order.status === "cancel_requested" || order.status === "waiting"
      );
      const container = document.getElementById("active-orders");

      if (container) {
        if (activeOrders.length === 0) {
          container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-inbox text-4xl mb-4"></i>
                <p>Tidak ada pesanan aktif</p>
            </div>
          `;
          return;
        }

        container.innerHTML = activeOrders
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
                      <span class="px-3 py-1 rounded-full text-sm font-medium ${this.getStatusColor(
                        order.status
                      )}">
                          ${this.getStatusText(order.status)}
                      </span>
                  </div>
                  <div class="space-y-2 text-sm">
                      <div class="flex items-center space-x-2">
                          <i class="fas fa-map-marker-alt text-green-500"></i>
                          <span>${order.origin}</span>
                      </div>
                      <div class="flex items-center space-x-2">
                          <i class="fas fa-map-marker text-red-500"></i>
                          <span>${order.destination}</span>
                      </div>
                      <div class="flex items-center space-x-2">
                          <i class="fas fa-road text-blue-500"></i>
                          <span>${
                            order.distance?.toLocaleString() || "0"
                          } km</span>
                      </div>
                      <div class="flex items-center space-x-2">
                          <i class="fas fa-money-bill text-blue-500"></i>
                          <span>Rp ${
                            order.price?.toLocaleString() || "0"
                          }</span>
                      </div>
                      <div class="flex items-center space-x-2">
                          <button class="cancel-btn w-full ${
                            order.status === "cancel_requested" 
                              ? "bg-orange-500 hover:bg-orange-600" 
                              : "bg-red-500 hover:bg-red-600"
                          } text-white py-2 px-4 rounded-lg transition-colors font-medium mt-2" data-order-id="${
                            order.id
                          }">
                              <i class="fas fa-times mr-2"></i>${
                                order.status === "cancel_requested" 
                                  ? "Menunggu Persetujuan Driver" 
                                  : "Batalkan Pesanan"
                              }
                          </button>
                      </div>
                  </div>
                  ${
                    order.driver
                      ? `
                  <div class="mt-3 pt-3 border-t border-gray-100">
                      <p class="text-sm text-gray-600">Driver: ${order.driver.name}</p>
                      <p class="text-sm text-gray-600">Phone: ${order.driver.phone}</p>
                  </div>
                  `
                      : ""
                  }
              </div>
            `
          )
          .join("");

        // Tambahkan event listener untuk setiap tombol batal
        container.querySelectorAll(".cancel-btn").forEach((button) => {
          button.addEventListener("click", async (e) => {
            const orderId = button.getAttribute("data-order-id");
            const order = orders.find(o => o.id == orderId);
            
            // Jika status sudah cancel_requested, tidak bisa dibatalkan lagi
            if (order && order.status === "cancel_requested") {
              ui.showError("Pembatalan sudah diajukan dan sedang menunggu persetujuan driver. Pesanan masih dalam proses.");
              return;
            }
            
            const confirmCancel = confirm("Yakin ingin membatalkan pesanan?");
            if (confirmCancel) {
              await this.cancelOrder(orderId);
            }
          });
        });
      }
    } catch (error) {
      console.error("Error loading active orders:", error);
    }
  }

  async cancelOrder(orderId) {
    try {
      const result = await api.cancelOrder(orderId);
      
      // Cek apakah order langsung dibatalkan atau menunggu persetujuan
      if (result.status === "cancelled") {
        ui.showToast("Pesanan berhasil dibatalkan!");
      } else if (result.status === "cancel_requested") {
        ui.showToast("Permintaan pembatalan telah dikirim ke driver. Pesanan masih dalam proses sampai driver menyetujui pembatalan.");
      }
      
      await this.loadActiveOrders();
      await this.loadDashboard();
    } catch (error) {
      console.error("Error canceling order:", error);
      ui.showError("Gagal membatalkan pesanan");
    }
  }

  async loadOrderHistory() {
    try {
      const orders = this.orders || [];
      const completedOrders = orders.filter(
        (order) => order.status === "completed" || order.status === "cancelled"
      );
      const container = document.getElementById("order-history");
      if (container) {
        if (completedOrders.length === 0) {
          container.innerHTML = `
                        <div class="text-center py-8 text-gray-500">
                            <i class="fas fa-history text-4xl mb-4"></i>
                            <p>Belum ada riwayat pesanan</p>
                        </div>
                    `;
          return;
        }
        container.innerHTML = completedOrders
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
                                : order.status === "in_progress" || order.status === "cancel_requested"
                                ? "bg-purple-100 text-purple-800"
                                : order.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }">
                                ${
                                  order.status === "completed"
                                    ? "Selesai"
                                    : order.status === "in_progress" || order.status === "cancel_requested"
                                    ? "Pesanan Dalam Proses"
                                    : order.status === "cancelled"
                                    ? "Dibatalkan"
                                    : order.status
                                }
                            </span>
                        </div>
                        <div class="space-y-2 text-sm">
                            <div class="flex items-center space-x-2">
                                <i class="fas fa-map-marker-alt text-green-500"></i>
                                <span>${order.origin}</span>
                            </div>
                            <div class="flex items-center space-x-2">
                                <i class="fas fa-map-marker text-red-500"></i>
                                <span>${order.destination}</span>
                            </div>
                             <div class="flex items-center space-x-2">
                                <i class="fas fa-road text-blue-500"></i>
                                <span>${
                                  order.distance?.toLocaleString() || "0"
                                } km</span>
                            </div>
                            <div class="flex items-center space-x-2">
                                <i class="fas fa-money-bill text-blue-500"></i>
                                <span>Rp ${
                                  order.price?.toLocaleString() || "0"
                                }</span>
                            </div>
                            <div class="flex flex-wrap gap-2 mt-4">
                                <button class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-xs" onclick="customerDashboard.showOrderDetail(${
                                  order.id
                                })"><i class='fas fa-info-circle mr-1'></i>Detail</button>
                            </div>
                        </div>
                        ${
                          order.driver
                            ? `
                            <div class="mt-3 pt-3 border-t border-gray-100">
                                <p class="text-sm text-gray-600">Driver: ${order.driver.name}</p>
                                <p class="text-sm text-gray-600">Phone: ${order.driver.phone}</p>
                            </div>
                        `
                            : ""
                        }
                    </div>
                `
          )
          .join("");
      }
    } catch (error) {
      console.error("Error loading order history:", error);
    }
  }

  async createOrder() {
    try {
      ui.showLoading();

      // Ambil data form dengan validasi element
      const originElement = document.getElementById("origin");
      const originLatElement = document.getElementById("origin_lat");
      const originLngElement = document.getElementById("origin_lng");
      const destinationElement = document.getElementById("destination");
      const destinationLatElement = document.getElementById("destination_lat");
      const destinationLngElement = document.getElementById("destination_lng");
      const priceElement = document.getElementById("price");
      const distanceElement = document.getElementById("distance");
      const paymentMethodElement = document.getElementById("payment_method");

      if (!paymentMethodElement) {
        ui.showError("Form tidak lengkap. Silakan refresh halaman.");
        return;
      }

      // Validasi element ada
      if (
        !originElement ||
        !destinationElement ||
        !priceElement ||
        !distanceElement
      ) {
        ui.showError("Form tidak lengkap. Silakan refresh halaman.");
        return;
      }

      const origin = originElement.value;
      const originLat = originLatElement ? originLatElement.value : "";
      const originLng = originLngElement ? originLngElement.value : "";
      const destination = destinationElement.value;
      const destinationLat = destinationLatElement
        ? destinationLatElement.value
        : "";
      const destinationLng = destinationLngElement
        ? destinationLngElement.value
        : "";
      const userId = localStorage.getItem("ojol_userId");
      const price = priceElement.value;
      const distance = distanceElement.value;
      const paymentMethod = paymentMethodElement.value;
      console.log("Form values:", {
        origin,
        originLat,
        originLng,
        destination,
        destinationLat,
        destinationLng,
        userId,
        price,
        distance,
        paymentMethod,
      });

      // Validasi dasar
      if (!origin || !destination || !price || !distance) {
        ui.showError("Semua field harus diisi.");
        return;
      }

      // Data order minimal
      const orderData = {
        userId: parseInt(userId),
        origin: origin,
        originLat: parseFloat(originLat) || 0,
        originLng: parseFloat(originLng) || 0,
        destination: destination,
        destinationLat: parseFloat(destinationLat) || 0,
        destinationLng: parseFloat(destinationLng) || 0,
        price: parseFloat(price),
        distance: parseFloat(distance),
        status: "waiting",
        paymentMethod: paymentMethod,
      };

      console.log("Submitting order data:", orderData);

      // Create order
      const result = await api.createOrder(orderData);
      console.log("Order response:", result);

      if (result && result.success && result.data) {
        ui.showToast("Pesanan berhasil dibuat!");

        // Reset form dengan validasi element
        const orderForm = document.getElementById("order-form");
        if (orderForm) {
          orderForm.reset();
        }

        // Reset hidden fields dengan validasi
        const fieldsToReset = [
          "origin_lat",
          "origin_lng",
          "destination_lat",
          "destination_lng",
          "distance",
          "price",
          "payment_amount",
        ];

        fieldsToReset.forEach((fieldId) => {
          const element = document.getElementById(fieldId);
          if (element) {
            element.value = "";
          }
        });

        // Refresh dashboard
        await this.loadDashboard();
      } else {
        ui.showError("Gagal membuat pesanan");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      console.error("Error details:", {
        message: error.message,
        status: error.status,
        responseData: error.responseData,
        stack: error.stack,
      });

      // Handle specific validation errors from backend
      if (
        error.responseData &&
        error.responseData.error === "UNFINISHED_ORDER_EXISTS"
      ) {
        ui.showError(
          "Anda masih memiliki pesanan yang belum selesai. Selesaikan pesanan sebelumnya terlebih dahulu."
        );
        // Refresh dashboard untuk menampilkan order yang masih aktif
        await this.loadDashboard();
      } else if (error.responseData && error.responseData.message) {
        ui.showError(error.responseData.message);
      } else {
        ui.showError("Gagal membuat pesanan: " + error.message);
      }
    } finally {
      ui.hideLoading();
    }
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

  getStatusColor(status) {
    const colors = {
      waiting: "bg-yellow-100 text-yellow-800",
      accepted: "bg-blue-100 text-blue-800",
      in_progress: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      cancel_requested: "bg-purple-100 text-purple-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  }

  // Method untuk menampilkan modal
  showModal(html) {
    // Buat modal jika belum ada
    if (!document.getElementById("modal-customer-dashboard")) {
      const modalHtml = `
        <div id="modal-customer-dashboard" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 hidden">
          <div class="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
            <button id="modal-close-btn" class="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
              <i class="fas fa-times"></i>
            </button>
            <div id="modal-customer-dashboard-content"></div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML("beforeend", modalHtml);

      // Add event listener untuk tombol close
      document.getElementById("modal-close-btn").onclick = () => {
        this.hideModal();
      };
    }

    // Tampilkan modal
    document.getElementById("modal-customer-dashboard-content").innerHTML =
      html;
    document
      .getElementById("modal-customer-dashboard")
      .classList.remove("hidden");
  }

  // Method untuk menyembunyikan modal
  hideModal() {
    const modal = document.getElementById("modal-customer-dashboard");
    if (modal) {
      modal.classList.add("hidden");
    }
  }

  // Method untuk menampilkan detail order
  async showOrderDetail(orderId) {
    try {
      ui.showLoading();
      const result = await api.getOrderById(orderId);
      const order = result.order || result; // fallback jika backend belum update
      const paymentStatus = result.paymentStatus || order.paymentStatus || "-";

      let html = `
        <h2 class='text-lg font-bold mb-4 flex items-center gap-2'>
          <i class="fas fa-info-circle text-blue-500"></i>Detail Order #${
            order.id
          }
        </h2>
        <div class='mb-4 grid grid-cols-1 gap-2'>
          <div class="flex justify-between items-center">
            <span class='font-semibold text-gray-700'>Status:</span>
            <span class='px-2 py-1 rounded-full text-xs font-semibold ${this.getStatusColor(
              order.status
            )}'>
              ${this.getStatusText(order.status)}
            </span>
          </div>
          ${
            order.status === "cancel_requested"
              ? '<div class="mt-2 text-sm text-orange-600"><i class="fas fa-info-circle mr-1"></i>Pembatalan sedang menunggu persetujuan driver. Pesanan masih dalam proses.</div>'
              : ""
          }
          <div class="flex justify-between items-center">
            <span class='font-semibold text-gray-700'>Pembayaran:</span>
            <span class='px-2 py-1 rounded-full text-xs font-semibold ${
              paymentStatus === "paid"
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-600"
            }'>
              ${paymentStatus === "paid" ? "Lunas" : "Dibatalkan"}
            </span>
          </div>
          <div class='font-semibold text-gray-700 mt-3 flex items-center gap-2'>
            <i class="fas fa-map-marker-alt text-green-500"></i> Lokasi Pickup
          </div>
          <div class='ml-4 text-sm text-gray-700'>${order.origin}</div>
          <div class='ml-4 text-xs text-gray-500'>Lat: ${
            order.originLat
          } | Lng: ${order.originLng}</div>
          
          <div class='font-semibold text-gray-700 mt-3 flex items-center gap-2'>
            <i class="fas fa-map-marker text-red-500"></i> Tujuan
          </div>
          <div class='ml-4 text-sm text-gray-700'>${order.destination}</div>
          <div class='ml-4 text-xs text-gray-500'>Lat: ${
            order.destinationLat
          } | Lng: ${order.destinationLng}</div>
          
          <div class="mt-3 pt-3 border-t border-gray-100">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class='font-semibold text-gray-700'>Harga:</span>
                <div class="text-blue-700 font-bold">Rp ${
                  order.price?.toLocaleString() || "0"
                }</div>
              </div>
              <div>
                <span class='font-semibold text-gray-700'>Jarak:</span>
                <div class="text-gray-700">${
                  order.distance?.toLocaleString() || "0"
                } km</div>
              </div>
              <div>
                <span class='font-semibold text-gray-700'>Tanggal Order:</span>
                <div class="text-gray-700">${new Date(
                  order.createdAt
                ).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      `;

      // Tambahkan informasi driver jika ada
      if (order.driver) {
        html += `
          <div class="mt-3 pt-3 border-t border-gray-100">
            <h3 class="font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <i class="fas fa-motorcycle text-green-500"></i> Informasi Driver
            </h3>
            <div class="grid grid-cols-1 gap-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Nama:</span>
                <span class="font-medium">${order.driver.name || "-"}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Telepon:</span>
                <span class="font-medium">${order.driver.phone || "-"}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Rating:</span>
                <span class="font-medium">${
                  order.driver.rating || "0"
                } ⭐</span>
              </div>
            </div>
          </div>
        `;
      }

      this.showModal(html);
    } catch (error) {
      console.error("Error loading order detail:", error);
      ui.showError("Gagal memuat detail order");
    } finally {
      ui.hideLoading();
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
          <button onclick="customerDashboard.hideModal()" 
                  class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors">
            Batal
          </button>
          <button onclick="customerDashboard.confirmLogout()" 
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
}

// Initialize customer dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.customerDashboard = new CustomerDashboard();
});

// Fallback initialization
if (!window.customerDashboard) {
  window.customerDashboard = new CustomerDashboard();
  window.customerDashboard.init();
}
