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
      console.warn("Gagal mengambil data customer dari getCustomerByUserId:", e);
      try {
        // Fallback ke data user
        userData = await api.getUserById(order.userId);
        console.log("User data from getUserById:", userData); // Debug log
      } catch (e2) {
        console.warn("Gagal mengambil data user dari getUserById:", e2);
      }
    }
    
    // Ambil data customer dengan fallback yang lebih baik
    const customerName = customerData?.name || userData?.name || result.customerName || order.customerName || "N/A";
    const customerPhone = customerData?.phone || userData?.phone || "N/A";
    
    console.log("Final customer data - Name:", customerName, "Phone:", customerPhone); // Debug log
    
    let html = `
      <h2 class='text-lg font-bold mb-4 flex items-center gap-2'><i class="fas fa-info-circle text-blue-500"></i>Detail Order #${
        order.id
      }</h2>
      <div class='mb-4 grid grid-cols-1 gap-2'>
        <div><span class='font-semibold text-gray-700'>Status:</span> <span class='ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
          order.status === "in_progress" ? "bg-purple-100 text-purple-800" : 
          order.status === "completed" ? "bg-green-100 text-green-800" : 
          "bg-yellow-100 text-yellow-800"
        }'>${
          order.status === "in_progress" ? "Dalam Proses" : 
          order.status === "completed" ? "Selesai" : 
          order.status
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
          paymentStatus === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
        }'>${
          paymentStatus === "paid" ? "Lunas" : "Belum Lunas"
        }</span></div>
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