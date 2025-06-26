// Implementasi loadAvailableOrders yang diperbaiki
class LoadAvailableOrdersFixed {
  async loadAvailableOrders() {
    try {
      const orders = await api.getAvailableOrders();
      const container = document.getElementById("available-orders");

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

        // Ambil data customer untuk setiap order secara paralel
        const ordersWithCustomerData = await Promise.all(
          orders.map(async (order) => {
            let customerData = null;
            let userData = null;
            
            try {
              // Coba ambil data customer terlebih dahulu
              customerData = await api.getCustomerByUserId(order.userId);
              console.log(`Customer data for order ${order.id}:`, customerData);
            } catch (e) {
              console.warn(`Gagal mengambil data customer untuk order ${order.id}:`, e);
              try {
                // Fallback ke data user
                userData = await api.getUserById(order.userId);
                console.log(`User data for order ${order.id}:`, userData);
              } catch (e2) {
                console.warn(`Gagal mengambil data user untuk order ${order.id}:`, e2);
              }
            }
            
            return {
              ...order,
              customerName: customerData?.name || userData?.name || order.customerName || "N/A",
              customerPhone: customerData?.phone || userData?.phone || "N/A"
            };
          })
        );

        container.innerHTML = ordersWithCustomerData
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
                    <i class="fas fa-user text-purple-500"></i>
                    <span>Customer: ${order.customerName}</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <i class="fas fa-phone text-purple-500"></i>
                    <span>Phone: ${order.customerPhone}</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <i class="fas fa-route text-blue-500"></i>
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
} 