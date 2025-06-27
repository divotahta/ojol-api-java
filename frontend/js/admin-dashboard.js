// Admin Dashboard for OjoL Frontend
class AdminDashboard {
    constructor() {
        this.init();
        this.setupAutoRefresh();
    }

    init() {
        this.checkAuth();
        this.setupEventListeners();
        this.loadDashboard();
    }

    setupAutoRefresh() {
        // Auto refresh statistik setiap 30 detik
        setInterval(() => {
            this.loadSystemStatistics();
        }, 30000); // 30 detik
    }

    async checkAuth() {
        if (!auth.isAuthenticated()) {
            window.location.href = 'index.html';
            return;
        }

        const role = auth.getRole();
        if (role !== CONFIG.ROLES.ADMIN) {
            // Redirect ke halaman yang sesuai dengan role, bukan logout
            if (role === CONFIG.ROLES.CUSTOMER) {
                window.location.href = 'customer-dashboard.html';
            } else if (role === CONFIG.ROLES.DRIVER) {
                window.location.href = 'driver-dashboard.html';
            } else {
                // Jika role tidak dikenal, baru logout
                ui.showError('Role tidak valid.');
                auth.logout();
                window.location.href = 'index.html';
            }
            return;
        }

        const isValid = await auth.validateToken();
        if (!isValid) {
            auth.logout();
            window.location.href = 'index.html';
            return;
        }
    }

    setupEventListeners() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.showLogoutConfirmation();
            });
        }

        // Refresh stats button
        const refreshStatsBtn = document.getElementById('refresh-stats-btn');
        if (refreshStatsBtn) {
            refreshStatsBtn.addEventListener('click', async () => {
                refreshStatsBtn.disabled = true;
                refreshStatsBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Loading...';
                
                try {
                    await this.loadSystemStatistics();
                    ui.showToast('Statistik berhasil diperbarui');
                } catch (error) {
                    ui.showError('Gagal memperbarui statistik');
                } finally {
                    refreshStatsBtn.disabled = false;
                    refreshStatsBtn.innerHTML = '<i class="fas fa-sync-alt mr-2"></i>Refresh';
                }
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
                    <button onclick="adminDashboard.hideModal()" 
                            class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors">
                        Batal
                    </button>
                    <button onclick="adminDashboard.confirmLogout()" 
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
        window.location.href = 'index.html';
    }

    async loadDashboard() {
        try {
            ui.showLoading();
            
            // Load admin profile
            await this.loadAdminProfile();
            
            // Load statistics
            await this.loadStatistics();
            
            // Load management sections
            await this.loadUserManagement();
            await this.loadDriverManagement();
            await this.loadOrderManagement();
            await this.loadPaymentManagement();
            
            // Load system statistics
            await this.loadSystemStatistics();
            
        } catch (error) {
            console.error('Error loading dashboard:', error);
            ui.showError('Gagal memuat dashboard');
        } finally {
            ui.hideLoading();
        }
    }

    async loadAdminProfile() {
        try {
            const adminData = await api.getUserProfile();
            
            // Update navigation
            const adminName = document.getElementById('admin-name');
            const adminEmail = document.getElementById('admin-email');
            if (adminName) adminName.textContent = adminData.name || 'Admin';
            if (adminEmail) adminEmail.textContent = adminData.email || '';

        } catch (error) {
            console.error('Error loading admin profile:', error);
        }
    }

    async loadStatistics() {
        try {
            // Hitung statistik manual karena endpoint system/statistics tidak ada
            const [users, drivers, orders, payments] = await Promise.all([
                api.getAllUsers(),
                api.getAllDrivers(),
                api.getAllOrders(),
                api.getAllPayments()
            ]);
            
            const stats = {
                totalUsers: users.length,
                totalDrivers: drivers.length,
                totalOrders: orders.length,
                totalPayments: payments.length
            };
            
            const totalUsers = document.getElementById('total-users');
            const totalDrivers = document.getElementById('total-drivers');
            const totalOrders = document.getElementById('total-orders');
            const totalPayments = document.getElementById('total-payments');
            if (totalUsers) totalUsers.textContent = stats.totalUsers || 0;
            if (totalDrivers) totalDrivers.textContent = stats.totalDrivers || 0;
            if (totalOrders) totalOrders.textContent = stats.totalOrders || 0;
            if (totalPayments) totalPayments.textContent = stats.totalPayments || 0;
        } catch (error) {
            console.error('Error loading statistics:', error);
            ui.showError('Gagal memuat statistik');
        }
    }

    async loadUserManagement() {
        try {
            ui.showLoading();
            const users = await api.getAllUsers();
            
            // Cek order history untuk setiap user
            const usersWithOrderInfo = await Promise.all(
                users.map(async (user) => {
                    try {
                        const userOrders = await api.getOrdersByUserId(user.id);
                        const hasActiveOrders = userOrders.some(order => 
                            order.status === 'waiting' || 
                            order.status === 'accepted' || 
                            order.status === 'in_progress'
                        );
                        const hasOrderHistory = userOrders.length > 0;
                        
                        return {
                            ...user,
                            hasActiveOrders,
                            hasOrderHistory,
                            orderCount: userOrders.length
                        };
                    } catch (error) {
                        console.error(`Error checking orders for user ${user.id}:`, error);
                        return {
                            ...user,
                            hasActiveOrders: false,
                            hasOrderHistory: false,
                            orderCount: 0
                        };
                    }
                })
            );
            
            const container = document.getElementById('user-management');
            
            if (container) {
                container.innerHTML = `
                    <div class="space-y-4">
                        <div class="flex justify-between items-center">
                            <h3 class="text-lg font-semibold text-gray-800">Daftar User</h3>
                            <button onclick="adminDashboard.createUser()" 
                                    class="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors text-sm">
                                <i class="fas fa-plus mr-1"></i>Tambah User
                            </button>
                        </div>
                        <div class="max-h-64 overflow-y-auto">
                            ${usersWithOrderInfo.length === 0 ? `
                                <div class="text-center py-4 text-gray-500">
                                    <i class="fas fa-users text-2xl mb-2"></i>
                                    <p>Tidak ada user</p>
                                </div>
                            ` : usersWithOrderInfo.map(user => `
                                <div class="border border-gray-200 rounded-lg p-3 mb-2 hover:shadow-sm transition-shadow">
                                    <div class="flex justify-between items-center">
                                        <div>
                                            <h4 class="font-medium text-gray-800">${user.name}</h4>
                                            <p class="text-sm text-gray-600">${user.email}</p>
                                            <div class="flex items-center space-x-2 mt-1">
                                                <span class="px-2 py-1 rounded-full text-xs font-medium ${this.getRoleColor(user.role)}">
                                                    ${this.getRoleText(user.role)}
                                                </span>
                                                ${user.hasOrderHistory ? `
                                                    <span class="px-2 py-1 rounded-full text-xs font-medium ${user.hasActiveOrders ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}">
                                                        <i class="fas fa-shopping-cart mr-1"></i>${user.orderCount} orders
                                                    </span>
                                                ` : ''}
                                            </div>
                                        </div>
                                        <div class="flex space-x-2">
                                            <button onclick="adminDashboard.editUser(${user.id})" 
                                                    class="text-blue-600 hover:text-blue-800">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            ${user.role !== 'admin' && !user.hasOrderHistory ? `
                                                <button onclick="adminDashboard.deleteUser(${user.id})" 
                                                        class="text-red-600 hover:text-red-800">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            ` : user.role === 'admin' ? `
                                                <button disabled 
                                                        class="text-gray-400 cursor-not-allowed" 
                                                        title="Akun admin tidak dapat dihapus">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            ` : `
                                                <button disabled 
                                                        class="text-gray-400 cursor-not-allowed" 
                                                        title="Tidak dapat dihapus karena memiliki riwayat pesanan">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            `}
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading user management:', error);
            ui.showError('Gagal memuat data user');
        } finally {
            ui.hideLoading();
        }
    }

    async loadDriverManagement() {
        try {
            ui.showLoading();
            const drivers = await api.getAllDrivers();
            
            // Cek order history untuk setiap driver
            const driversWithOrderInfo = await Promise.all(
                drivers.map(async (driver) => {
                    try {
                        const driverOrders = await api.getOrdersByDriverId(driver.userId);
                        const hasActiveOrders = driverOrders.some(order => 
                            order.status === 'waiting' || 
                            order.status === 'accepted' || 
                            order.status === 'in_progress'
                        );
                        const hasOrderHistory = driverOrders.length > 0;
                        
                        return {
                            ...driver,
                            hasActiveOrders,
                            hasOrderHistory,
                            orderCount: driverOrders.length
                        };
                    } catch (error) {
                        console.error(`Error checking orders for driver ${driver.id}:`, error);
                        return {
                            ...driver,
                            hasActiveOrders: false,
                            hasOrderHistory: false,
                            orderCount: 0
                        };
                    }
                })
            );
            
            const container = document.getElementById('driver-management');
            
            if (container) {
                container.innerHTML = `
                    <div class="space-y-4">
                        <div class="flex justify-between items-center">
                            <h3 class="text-lg font-semibold text-gray-800">Daftar Driver</h3>
                            <button onclick="adminDashboard.createDriver()" 
                                    class="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-colors text-sm">
                                <i class="fas fa-plus mr-1"></i>Tambah Driver
                            </button>
                        </div>
                        <div class="max-h-64 overflow-y-auto">
                            ${driversWithOrderInfo.length === 0 ? `
                                <div class="text-center py-4 text-gray-500">
                                    <i class="fas fa-motorcycle text-2xl mb-2"></i>
                                    <p>Tidak ada driver</p>
                                </div>
                            ` : driversWithOrderInfo.map(driver => `
                                <div class="border border-gray-200 rounded-lg p-3 mb-2 hover:shadow-sm transition-shadow">
                                    <div class="flex justify-between items-start">
                                        <div class="flex-1">
                                            <h4 class="font-medium text-gray-800">${driver.name}</h4>
                                            <p class="text-sm text-gray-600">${driver.phone}</p>
                                            <div class="flex items-center space-x-2 mt-1 mb-2">
                                                <span class="px-2 py-1 rounded-full text-xs font-medium ${this.getStatusColor(driver.status)}">
                                                    ${this.getStatusText(driver.status)}
                                                </span>
                                                ${driver.hasOrderHistory ? `
                                                    <span class="px-2 py-1 rounded-full text-xs font-medium ${driver.hasActiveOrders ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}">
                                                        <i class="fas fa-shopping-cart mr-1"></i>${driver.orderCount} orders
                                                    </span>
                                                ` : ''}
                                            </div>
                                            <div class="text-xs text-gray-500 space-y-1">
                                                <div class="flex items-center space-x-1">
                                                    <i class="fas fa-motorcycle text-green-500"></i>
                                                    <span>${driver.vehicleType || 'N/A'} - ${driver.vehicleBrand || 'N/A'} ${driver.vehicleModel || 'N/A'}</span>
                                                </div>
                                                <div class="flex items-center space-x-1">
                                                    <i class="fas fa-id-card text-blue-500"></i>
                                                    <span>${driver.plateNumber || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="flex space-x-2">
                                            <button onclick="adminDashboard.editDriver(${driver.id})" 
                                                    class="text-blue-600 hover:text-blue-800">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            ${!driver.hasOrderHistory ? `
                                                <button onclick="adminDashboard.deleteDriver(${driver.id})" 
                                                        class="text-red-600 hover:text-red-800">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            ` : `
                                                <button disabled 
                                                        class="text-gray-400 cursor-not-allowed" 
                                                        title="Tidak dapat dihapus karena memiliki riwayat pesanan">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            `}
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading driver management:', error);
            ui.showError('Gagal memuat data driver');
        } finally {
            ui.hideLoading();
        }
    }

    async loadOrderManagement() {
        try {
            const orders = await api.getAllOrders();
            const container = document.getElementById('order-management');
            
            if (container) {
                container.innerHTML = `
                    <div class="space-y-4">
                        <div class="flex justify-between items-center">
                            <h3 class="text-lg font-semibold text-gray-800">Daftar Pesanan</h3>
                            <div class="flex space-x-2">
                                <select id="order-filter" class="border border-gray-300 rounded-lg px-3 py-1 text-sm">
                                    <option value="">Semua Status</option>
                                    <option value="pending">Menunggu</option>
                                    <option value="accepted">Diterima</option>
                                    <option value="in_progress">Dalam Proses</option>
                                    <option value="completed">Selesai</option>
                                    <option value="cancelled">Dibatalkan</option>
                                </select>
                            </div>
                        </div>
                        <div class="max-h-64 overflow-y-auto">
                            ${orders.length === 0 ? `
                                <div class="text-center py-4 text-gray-500">
                                    <i class="fas fa-list text-2xl mb-2"></i>
                                    <p>Tidak ada pesanan</p>
                                </div>
                            ` : orders.map(order => `
                                <div class="border border-gray-200 rounded-lg p-3 mb-2 hover:shadow-sm transition-shadow">
                                    <div class="flex justify-between items-start">
                                        <div class="flex-1">
                                            <div class="flex items-center space-x-2 mb-1">
                                                <h4 class="font-medium text-gray-800">Order #${order.id}</h4>
                                                <span class="px-2 py-1 rounded-full text-xs font-medium ${this.getOrderStatusColor(order.status)}">
                                                    ${this.getOrderStatusText(order.status)}
                                                </span>
                                            </div>
                                            <p class="text-sm text-gray-600 mb-1">
                                                <i class="fas fa-map-marker-alt text-green-500 mr-1"></i>${order.origin}
                                            </p>
                                            <p class="text-sm text-gray-600 mb-1">
                                                <i class="fas fa-map-marker text-red-500 mr-1"></i>${order.destination}
                                            </p>
                                            <p class="text-sm text-gray-600">
                                                <i class="fas fa-money-bill text-blue-500 mr-1"></i>Rp ${order.price?.toLocaleString() || '0'}
                                            </p>
                                        </div>
                                        <div class="flex space-x-2">
                                            <button onclick="adminDashboard.viewOrder(${order.id})" 
                                                    class="text-blue-600 hover:text-blue-800">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                            <button onclick="adminDashboard.updateOrderStatus(${order.id})" 
                                                    class="text-green-600 hover:text-green-800 hidden">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;

                // Add filter functionality
                const filterSelect = document.getElementById('order-filter');
                if (filterSelect) {
                    filterSelect.addEventListener('change', (e) => {
                        this.filterOrders(e.target.value);
                    });
                }
            }
        } catch (error) {
            console.error('Error loading order management:', error);
        }
    }

    async loadPaymentManagement() {
        try {
            const payments = await api.getAllPayments();
            const container = document.getElementById('payment-management');
            
            if (container) {
                container.innerHTML = `
                    <div class="space-y-4">
                        <div class="flex justify-between items-center">
                            <h3 class="text-lg font-semibold text-gray-800">Daftar Pembayaran</h3>
                            <div class="flex space-x-2">
                                <select id="payment-filter" class="border border-gray-300 rounded-lg px-3 py-1 text-sm">
                                    <option value="">Semua Status</option>
                                    <option value="pending">Menunggu</option>
                                    <option value="paid">Selesai</option>
                                    <option value="failed">Gagal</option>
                                </select>
                            </div>
                        </div>
                        <div class="max-h-64 overflow-y-auto">
                            ${payments.length === 0 ? `
                                <div class="text-center py-4 text-gray-500">
                                    <i class="fas fa-credit-card text-2xl mb-2"></i>
                                    <p>Tidak ada pembayaran</p>
                                </div>
                            ` : payments.map(payment => `
                                <div class="border border-gray-200 rounded-lg p-3 mb-2 hover:shadow-sm transition-shadow">
                                    <div class="flex justify-between items-center">
                                        <div>
                                            <h4 class="font-medium text-gray-800">Payment #${payment.id}</h4>
                                            <p class="text-sm text-gray-600">Order #${payment.orderId}</p>
                                            <div class="flex items-center space-x-2 mt-1">
                                                <span class="px-2 py-1 rounded-full text-xs font-medium ${this.getPaymentStatusColor(payment.status)}">
                                                    ${this.getPaymentStatusText(payment.status)}
                                                </span>
                                                <span class="text-sm font-medium text-gray-800">
                                                    Rp ${payment.amount?.toLocaleString() || '0'}
                                                </span>
                                            </div>
                                        </div>
                                        <div class="flex space-x-2">
                                            <button onclick="adminDashboard.viewPayment(${payment.id})" 
                                                    class="text-blue-600 hover:text-blue-800">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;

                // Add filter functionality
                const filterSelect = document.getElementById('payment-filter');
                if (filterSelect) {
                    filterSelect.addEventListener('change', (e) => {
                        this.filterPayments(e.target.value);
                    });
                }
            }
        } catch (error) {
            console.error('Error loading payment management:', error);
        }
    }

    async loadSystemStatistics() {
        try {
            // Ambil semua data yang diperlukan
            const [orders, payments, drivers] = await Promise.all([
                api.getAllOrders(),
                api.getAllPayments(),
                api.getAllDrivers()
            ]);

            // Hitung statistik hari ini
            const today = new Date();
            const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

            // Pesanan hari ini
            const todayOrders = orders.filter(order => {
                const orderDate = new Date(order.createdAt);
                return orderDate >= todayStart && orderDate < todayEnd;
            });

            // Pendapatan hari ini (dari payment yang completed hari ini)
            const todayPayments = payments.filter(payment => {
                if (payment.status !== 'paid') return false;
                const paymentDate = new Date(payment.paidAt || payment.updatedAt);
                return paymentDate >= todayStart && paymentDate < todayEnd;
            });
            const todayRevenue = todayPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

            // Driver online (available)
            const onlineDrivers = drivers.filter(driver => driver.status === 'available');

            // Statistik bulan ini
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            const monthOrders = orders.filter(order => {
                const orderDate = new Date(order.createdAt);
                return orderDate >= monthStart;
            });

            // Pesanan berdasarkan status
            const pendingOrders = orders.filter(order => order.status === 'waiting' || order.status === 'pending');
            const completedToday = todayOrders.filter(order => order.status === 'completed');
            const cancelledToday = todayOrders.filter(order => order.status === 'cancelled');

            // Update UI
            const todayOrdersEl = document.getElementById('today-orders');
            const todayRevenueEl = document.getElementById('today-revenue');
            const onlineDriversEl = document.getElementById('online-drivers');

            if (todayOrdersEl) todayOrdersEl.textContent = todayOrders.length;
            if (todayRevenueEl) todayRevenueEl.textContent = `Rp ${todayRevenue.toLocaleString()}`;
            if (onlineDriversEl) onlineDriversEl.textContent = onlineDrivers.length;

            // Tambahkan statistik tambahan
            const statsContainer = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-3');
            if (statsContainer) {
                // Tambahkan card statistik tambahan
                const additionalStats = `
                    <div class="text-center p-4 bg-gray-50 rounded-lg">
                        <h3 class="text-lg font-semibold text-gray-800 mb-2">Pesanan Bulan Ini</h3>
                        <p class="text-3xl font-bold text-purple-600">${monthOrders.length}</p>
                    </div>
                    <div class="text-center p-4 bg-gray-50 rounded-lg">
                        <h3 class="text-lg font-semibold text-gray-800 mb-2">Pesanan Pending</h3>
                        <p class="text-3xl font-bold text-orange-600">${pendingOrders.length}</p>
                    </div>
                    <div class="text-center p-4 bg-gray-50 rounded-lg">
                        <h3 class="text-lg font-semibold text-gray-800 mb-2">Selesai Hari Ini</h3>
                        <p class="text-3xl font-bold text-green-600">${completedToday.length}</p>
                    </div>
                    <div class="text-center p-4 bg-gray-50 rounded-lg">
                        <h3 class="text-lg font-semibold text-gray-800 mb-2">Dibatalkan Hari Ini</h3>
                        <p class="text-3xl font-bold text-red-600">${cancelledToday.length}</p>
                    </div>
                    <div class="text-center p-4 bg-gray-50 rounded-lg">
                        <h3 class="text-lg font-semibold text-gray-800 mb-2">Total Driver</h3>
                        <p class="text-3xl font-bold text-indigo-600">${drivers.length}</p>
                    </div>
                    <div class="text-center p-4 bg-gray-50 rounded-lg">
                        <h3 class="text-lg font-semibold text-gray-800 mb-2">Total Pesanan</h3>
                        <p class="text-3xl font-bold text-blue-600">${orders.length}</p>
                    </div>
                `;
                
                // Ganti grid menjadi 6 kolom untuk statistik tambahan
                statsContainer.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4';
                statsContainer.innerHTML += additionalStats;
            }

            // Tambahkan chart sederhana
            // this.createStatusChart(orders);

        } catch (error) {
            console.error('Error loading system statistics:', error);
            ui.showError('Gagal memuat statistik sistem');
        }
    }

    // createStatusChart(orders) {
    //     // Hitung status order
    //     const statusCounts = {
    //         waiting: orders.filter(o => o.status === 'waiting').length,
    //         in_progress: orders.filter(o => o.status === 'in_progress').length,
    //         completed: orders.filter(o => o.status === 'completed').length,
    //         cancelled: orders.filter(o => o.status === 'cancelled').length
    //     };

    //     // Cari container untuk chart
    //     let chartContainer = document.getElementById('status-chart');
    //     if (!chartContainer) {
    //         // Buat container jika belum ada
    //         const statsSection = document.querySelector('.mt-8.bg-white.rounded-lg.shadow-lg.p-6');
    //         if (statsSection) {
    //             const chartSection = document.createElement('div');
    //             chartSection.className = 'mt-6';
    //             chartSection.innerHTML = `
    //                 <h3 class="text-lg font-semibold text-gray-800 mb-4">Status Pesanan</h3>
    //                 <div id="status-chart" class="grid grid-cols-2 md:grid-cols-4 gap-4"></div>
    //             `;
    //             statsSection.appendChild(chartSection);
    //             chartContainer = document.getElementById('status-chart');
    //         }
    //     }

    //     if (chartContainer) {
    //         chartContainer.innerHTML = `
    //             <div class="text-center p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
    //                 <h4 class="font-medium text-yellow-800">Menunggu</h4>
    //                 <p class="text-2xl font-bold text-yellow-600">${statusCounts.waiting}</p>
    //             </div>
    //             <div class="text-center p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
    //                 <h4 class="font-medium text-blue-800">Dalam Proses</h4>
    //                 <p class="text-2xl font-bold text-blue-600">${statusCounts.in_progress}</p>
    //             </div>
    //             <div class="text-center p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
    //                 <h4 class="font-medium text-green-800">Selesai</h4>
    //                 <p class="text-2xl font-bold text-green-600">${statusCounts.completed}</p>
    //             </div>
    //             <div class="text-center p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
    //                 <h4 class="font-medium text-red-800">Dibatalkan</h4>
    //                 <p class="text-2xl font-bold text-red-600">${statusCounts.cancelled}</p>
    //             </div>
    //         `;
    //     }
    // }

    // Management functions
    async createUser() {
        this.showModal(`
            <div class="p-4">
                <h3 class="text-lg font-bold mb-4">Tambah User</h3>
                <form id="create-user-form" class="space-y-4">
                    <input type="text" id="user-name" class="w-full border rounded px-3 py-2" placeholder="Nama" required />
                    <input type="email" id="user-email" class="w-full border rounded px-3 py-2" placeholder="Email" required />
                    <input type="password" id="user-password" class="w-full border rounded px-3 py-2" placeholder="Password (min 6 karakter)" required minlength="6" />
                    <select id="user-role" class="w-full border rounded px-3 py-2" required>
                        <option value="">Pilih Role</option>
                        <option value="admin">Admin</option>
                        <option value="customer">Customer</option>
                        <option value="driver">Driver</option>
                    </select>
                    <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded">Simpan</button>
                </form>
            </div>
        `);
        document.getElementById('create-user-form').onsubmit = (e) => {
            e.preventDefault();
            this.submitCreateUser();
        };
    }

    async submitCreateUser() {
        try {
            const name = document.getElementById('user-name').value.trim();
            const email = document.getElementById('user-email').value.trim();
            const password = document.getElementById('user-password').value;
            const role = document.getElementById('user-role').value;
            if (!name || !email || !password || !role) {
                ui.showError('Semua field wajib diisi!');
                return;
            }
            if (password.length < 6) {
                ui.showError('Password minimal 6 karakter!');
                return;
            }
            await api.createUser({ name, email, password, role });
            ui.showToast('User berhasil ditambahkan');
            this.hideModal();
            await this.loadUserManagement();
            await this.loadStatistics();
        } catch (err) {
            ui.showError('Gagal menambah user: ' + (err.responseData?.message || err.message));
        }
    }

    async editUser(userId) {
        try {
            const user = await api.getUserById(userId);
            this.showModal(`
                <div class="p-4">
                    <h3 class="text-lg font-bold mb-4">Edit User</h3>
                    <form id="edit-user-form" class="space-y-4">
                        <input type="text" id="edit-user-name" class="w-full border rounded px-3 py-2" value="${user.name}" required />
                        <input type="email" id="edit-user-email" class="w-full border rounded px-3 py-2" value="${user.email}" required />
                        <input type="password" id="edit-user-password" class="w-full border rounded px-3 py-2" placeholder="Password baru (opsional)" minlength="6" />
                        <select id="edit-user-role" class="w-full border rounded px-3 py-2" required>
                            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                            <option value="customer" ${user.role === 'customer' ? 'selected' : ''}>Customer</option>
                            <option value="driver" ${user.role === 'driver' ? 'selected' : ''}>Driver</option>
                        </select>
                        <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded">Simpan</button>
                    </form>
                </div>
            `);
            document.getElementById('edit-user-form').onsubmit = (e) => {
                e.preventDefault();
                this.submitEditUser(userId);
            };
        } catch (err) {
            ui.showError('Gagal memuat data user');
        }
    }

    async submitEditUser(userId) {
        try {
            const name = document.getElementById('edit-user-name').value.trim();
            const email = document.getElementById('edit-user-email').value.trim();
            const password = document.getElementById('edit-user-password').value;
            const role = document.getElementById('edit-user-role').value;
            if (!name || !email || !role) {
                ui.showError('Semua field wajib diisi!');
                return;
            }
            const data = { name, email, role };
            if (password && password.length > 0) {
                if (password.length < 6) {
                    ui.showError('Password minimal 6 karakter!');
                    return;
                }
                data.password = password;
            }
            await api.updateUser(userId, data);
            ui.showToast('User berhasil diupdate');
            this.hideModal();
            await this.loadUserManagement();
            await this.loadStatistics();
        } catch (err) {
            ui.showError('Gagal update user: ' + (err.responseData?.message || err.message));
        }
    }

    async deleteUser(userId) {
        try {
            ui.showLoading();
            
            // Ambil data user untuk validasi
            const user = await api.getUserById(userId);
            
            // Cek apakah user adalah admin
            if (user.role === 'admin') {
                ui.showError('Akun admin tidak dapat dihapus');
                ui.hideLoading();
                return;
            }
            
            // Cek apakah user memiliki order history
            const userOrders = await api.getOrdersByUserId(userId);
            const hasActiveOrders = userOrders.some(order => 
                order.status === 'waiting' || 
                order.status === 'accepted' || 
                order.status === 'in_progress'
            );
            
            if (userOrders.length > 0) {
                if (hasActiveOrders) {
                    ui.showError('User tidak dapat dihapus karena memiliki pesanan yang sedang berjalan');
                } else {
                    ui.showError('User tidak dapat dihapus karena memiliki riwayat pesanan');
                }
                ui.hideLoading();
                return;
            }
            
            // Tampilkan modal konfirmasi
            this.showDeleteConfirmation('user', user.name, async () => {
                try {
                    await api.deleteUser(userId);
                    ui.showToast('User berhasil dihapus');
                    await this.loadUserManagement();
                    await this.loadStatistics();
                } catch (err) {
                    ui.showError('Gagal hapus user: ' + (err.responseData?.message || err.message));
                }
            });
            
        } catch (err) {
            ui.showError('Gagal hapus user: ' + (err.responseData?.message || err.message));
        } finally {
            ui.hideLoading();
        }
    }

    async createDriver() {
        try {
            // Ambil semua user dengan role driver
            const users = await api.getAllUsers();
            const driverUsers = users.filter(user => user.role === 'driver');
            
            // Ambil semua driver yang sudah ada untuk validasi
            const existingDrivers = await api.getAllDrivers();
            const existingUserIds = existingDrivers.map(driver => driver.userId);
            
            // Filter user driver yang belum memiliki data driver
            const availableDriverUsers = driverUsers.filter(user => !existingUserIds.includes(user.id));
            
            if (availableDriverUsers.length === 0) {
                ui.showError('Tidak ada user driver yang tersedia untuk ditambahkan sebagai driver');
                return;
            }
            
            this.showModal(`
                <div class="p-4">
                    <h3 class="text-lg font-bold mb-4">Tambah Driver</h3>
                    <form id="create-driver-form" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Pilih User Driver</label>
                            <select id="driver-user-id" class="w-full border rounded px-3 py-2" required>
                                <option value="">Pilih User Driver</option>
                                ${availableDriverUsers.map(user => `
                                    <option value="${user.id}">${user.name} (${user.email})</option>
                                `).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                            <input type="text" id="driver-name" class="w-full border rounded px-3 py-2" placeholder="Nama lengkap driver" required />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Nomor Telepon</label>
                            <input type="tel" id="driver-phone" class="w-full border rounded px-3 py-2" placeholder="08123456789" required />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Jenis Kendaraan</label>
                            <select id="driver-vehicle-type" class="w-full border rounded px-3 py-2" required>
                                <option value="">Pilih Jenis Kendaraan</option>
                                <option value="motor">Motor</option>
                                <option value="mobil">Mobil</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Merek Kendaraan</label>
                            <input type="text" id="driver-vehicle-brand" class="w-full border rounded px-3 py-2" placeholder="Honda, Yamaha, dll" required />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Model Kendaraan</label>
                            <input type="text" id="driver-vehicle-model" class="w-full border rounded px-3 py-2" placeholder="Vario, NMAX, dll" required />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Nomor Plat</label>
                            <input type="text" id="driver-plate-number" class="w-full border rounded px-3 py-2" placeholder="B 1234 ABC" required />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select id="driver-status" class="w-full border rounded px-3 py-2" required>
                                <option value="">Pilih Status</option>
                                <option value="available">Available</option>
                                <option value="unavailable">Unavailable</option>
                                <option value="busy">Busy</option>
                            </select>
                        </div>
                        <button type="submit" class="w-full bg-green-600 text-white py-2 rounded">Simpan Driver</button>
                    </form>
                </div>
            `);
            
            document.getElementById('create-driver-form').onsubmit = (e) => {
                e.preventDefault();
                this.submitCreateDriver();
            };
            
        } catch (error) {
            console.error('Error loading driver users:', error);
            ui.showError('Gagal memuat data user driver');
        }
    }

    async submitCreateDriver() {
        try {
            const userId = document.getElementById('driver-user-id').value;
            const name = document.getElementById('driver-name').value.trim();
            const phone = document.getElementById('driver-phone').value.trim();
            const vehicleType = document.getElementById('driver-vehicle-type').value;
            const vehicleBrand = document.getElementById('driver-vehicle-brand').value.trim();
            const vehicleModel = document.getElementById('driver-vehicle-model').value.trim();
            const plateNumber = document.getElementById('driver-plate-number').value.trim();
            const status = document.getElementById('driver-status').value;
            
            // Validasi form
            if (!userId || !name || !phone || !vehicleType || !vehicleBrand || !vehicleModel || !plateNumber || !status) {
                ui.showError('Semua field wajib diisi!');
                return;
            }
            
            // Validasi format nomor telepon
            if (!/^[0-9]{10,13}$/.test(phone.replace(/\s/g, ''))) {
                ui.showError('Format nomor telepon tidak valid!');
                return;
            }
            
            const driverData = {
                userId: parseInt(userId),
                name,
                phone,
                vehicleType,
                vehicleBrand,
                vehicleModel,
                plateNumber,
                status
            };
            
            await api.createDriver(driverData);
            ui.showToast('Driver berhasil ditambahkan');
            this.hideModal();
            await this.loadDriverManagement();
            await this.loadStatistics();
            
        } catch (err) {
            ui.showError('Gagal menambah driver: ' + (err.responseData?.message || err.message));
        }
    }

    async editDriver(driverId) {
        try {
            const driver = await api.getDriverById(driverId);
            this.showModal(`
                <div class="p-4">
                    <h3 class="text-lg font-bold mb-4">Edit Driver</h3>
                    <form id="edit-driver-form" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                            <input type="text" id="edit-driver-name" class="w-full border rounded px-3 py-2" value="${driver.name || ''}" required />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Nomor Telepon</label>
                            <input type="tel" id="edit-driver-phone" class="w-full border rounded px-3 py-2" value="${driver.phone || ''}" required />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Jenis Kendaraan</label>
                            <select id="edit-driver-vehicle-type" class="w-full border rounded px-3 py-2" required>
                                <option value="motor" ${driver.vehicleType === 'motor' ? 'selected' : ''}>Motor</option>
                                <option value="mobil" ${driver.vehicleType === 'mobil' ? 'selected' : ''}>Mobil</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Merek Kendaraan</label>
                            <input type="text" id="edit-driver-vehicle-brand" class="w-full border rounded px-3 py-2" value="${driver.vehicleBrand || ''}" required />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Model Kendaraan</label>
                            <input type="text" id="edit-driver-vehicle-model" class="w-full border rounded px-3 py-2" value="${driver.vehicleModel || ''}" required />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Nomor Plat</label>
                            <input type="text" id="edit-driver-plate-number" class="w-full border rounded px-3 py-2" value="${driver.plateNumber || ''}" required />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select id="edit-driver-status" class="w-full border rounded px-3 py-2" required>
                                <option value="available" ${driver.status === 'available' ? 'selected' : ''}>Available</option>
                                <option value="unavailable" ${driver.status === 'unavailable' ? 'selected' : ''}>Unavailable</option>
                                <option value="busy" ${driver.status === 'busy' ? 'selected' : ''}>Busy</option>
                            </select>
                        </div>
                        <button type="submit" class="w-full bg-green-600 text-white py-2 rounded">Update Driver</button>
                    </form>
                </div>
            `);
            
            document.getElementById('edit-driver-form').onsubmit = (e) => {
                e.preventDefault();
                this.submitEditDriver(driverId);
            };
            
        } catch (err) {
            ui.showError('Gagal memuat data driver');
        }
    }

    async submitEditDriver(driverId) {
        try {
            const name = document.getElementById('edit-driver-name').value.trim();
            const phone = document.getElementById('edit-driver-phone').value.trim();
            const vehicleType = document.getElementById('edit-driver-vehicle-type').value;
            const vehicleBrand = document.getElementById('edit-driver-vehicle-brand').value.trim();
            const vehicleModel = document.getElementById('edit-driver-vehicle-model').value.trim();
            const plateNumber = document.getElementById('edit-driver-plate-number').value.trim();
            const status = document.getElementById('edit-driver-status').value;
            
            // Validasi form
            if (!name || !phone || !vehicleType || !vehicleBrand || !vehicleModel || !plateNumber || !status) {
                ui.showError('Semua field wajib diisi!');
                return;
            }
            
            // Validasi format nomor telepon
            if (!/^[0-9]{10,13}$/.test(phone.replace(/\s/g, ''))) {
                ui.showError('Format nomor telepon tidak valid!');
                return;
            }
            
            const driverData = {
                name,
                phone,
                vehicleType,
                vehicleBrand,
                vehicleModel,
                plateNumber,
                status
            };
            
            await api.updateDriver(driverId, driverData);
            ui.showToast('Driver berhasil diupdate');
            this.hideModal();
            await this.loadDriverManagement();
            await this.loadStatistics();
            
        } catch (err) {
            ui.showError('Gagal update driver: ' + (err.responseData?.message || err.message));
        }
    }

    async deleteDriver(driverId) {
        try {
            ui.showLoading();
            
            // Ambil data driver untuk mendapatkan userId
            const driver = await api.getDriverById(driverId);
            
            // Cek apakah driver memiliki order history
            const driverOrders = await api.getOrdersByDriverId(driver.userId);
            const hasActiveOrders = driverOrders.some(order => 
                order.status === 'waiting' || 
                order.status === 'accepted' || 
                order.status === 'in_progress'
            );
            
            if (driverOrders.length > 0) {
                if (hasActiveOrders) {
                    ui.showError('Driver tidak dapat dihapus karena memiliki pesanan yang sedang berjalan');
                } else {
                    ui.showError('Driver tidak dapat dihapus karena memiliki riwayat pesanan');
                }
                ui.hideLoading();
                return;
            }
            
            // Tampilkan modal konfirmasi
            this.showDeleteConfirmation('driver', driver.name, async () => {
                try {
                    await api.deleteDriver(driverId);
                    ui.showToast('Driver berhasil dihapus');
                    await this.loadDriverManagement();
                    await this.loadStatistics();
                } catch (err) {
                    ui.showError('Gagal hapus driver: ' + (err.responseData?.message || err.message));
                }
            });
            
        } catch (err) {
            ui.showError('Gagal hapus driver: ' + (err.responseData?.message || err.message));
        } finally {
            ui.hideLoading();
        }
    }

    async viewOrder(orderId) {
        try {
            ui.showLoading();
            const response = await api.getOrderById(orderId);
            console.log('Order response:', response);
            
            // API mengembalikan { order: {...}, paymentStatus: "..." }
            const order = response.order || response;
            
            if (!order || !order.id) {
                ui.showError('Data order tidak valid');
                return;
            }
            
            const html = `
                <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                    <i class="fas fa-list text-yellow-500"></i>Detail Order #${order.id}
                </h2>
                <div class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <span class="px-3 py-1 rounded-full text-sm font-medium ${this.getOrderStatusColor(order.status)}">
                                ${this.getOrderStatusText(order.status)}
                            </span>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Customer ID</label>
                            <p class="text-gray-800">${order.userId || 'N/A'}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Origin</label>
                            <p class="text-gray-800">${order.origin || 'N/A'}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Destination</label>
                            <p class="text-gray-800">${order.destination || 'N/A'}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Price</label>
                            <p class="text-gray-800 font-bold">Rp ${order.price?.toLocaleString() || '0'}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Distance</label>
                            <p class="text-gray-800">${order.distance?.toLocaleString() || '0'} km</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Created At</label>
                            <p class="text-gray-800">${order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Driver ID</label>
                            <p class="text-gray-800">${order.driverId || 'Belum ada driver'}</p>
                        </div>
                        ${response.paymentStatus ? `
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                            <span class="px-3 py-1 rounded-full text-sm font-medium ${this.getPaymentStatusColor(response.paymentStatus)}">
                                ${this.getPaymentStatusText(response.paymentStatus)}
                            </span>
                        </div>
                        ` : ''}
                    </div>
                    <div class="flex justify-end space-x-3 pt-4">
                        <button onclick="adminDashboard.hideModal()" class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                            Tutup
                        </button>
                        <button onclick="adminDashboard.updateOrderStatus(${order.id})" class="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
                            <i class="fas fa-edit mr-1"></i>Update Status
                        </button>
                    </div>
                </div>
            `;
            
            this.showModal(html);
        } catch (error) {
            console.error('Error loading order details:', error);
            ui.showError('Gagal memuat detail order');
        } finally {
            ui.hideLoading();
        }
    }

    async updateOrderStatus(orderId) {
        try {
            ui.showLoading();
            const response = await api.getOrderById(orderId);
            
            // API mengembalikan { order: {...}, paymentStatus: "..." }
            const order = response.order || response;
            
            if (!order || !order.id) {
                ui.showError('Data order tidak valid');
                return;
            }
            
            // Dapatkan opsi status yang valid berdasarkan status saat ini
            const validStatusOptions = this.getValidStatusOptions(order.status);
            
            const html = `
                <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                    <i class="fas fa-edit text-yellow-500"></i>Update Status Order #${order.id}
                </h2>
                <form id="update-order-form" class="space-y-4">
                    <input type="hidden" id="update-order-id" value="${order.id}">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Status Saat Ini</label>
                        <span class="px-3 py-1 rounded-full text-sm font-medium ${this.getOrderStatusColor(order.status)}">
                            ${this.getOrderStatusText(order.status)}
                        </span>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Status Baru</label>
                        <select id="update-order-status" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500">
                            <option value="">Pilih Status Baru</option>
                            ${validStatusOptions.map(status => `
                                <option value="${status.value}">
                                    ${status.label}
                                </option>
                            `).join('')}
                        </select>
                        ${validStatusOptions.length === 0 ? `
                            <p class="text-sm text-red-600 mt-1">
                                Status "${this.getOrderStatusText(order.status)}" tidak dapat diubah lagi
                            </p>
                        ` : ''}
                    </div>
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" onclick="adminDashboard.hideModal()" class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                            Batal
                        </button>
                        <button type="submit" class="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600" ${validStatusOptions.length === 0 ? 'disabled' : ''}>
                            <i class="fas fa-save mr-1"></i>Update
                        </button>
                    </div>
                </form>
            `;
            
            this.showModal(html);
            
            // Add form submit handler
            document.getElementById('update-order-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.submitUpdateOrderStatus();
            });
        } catch (error) {
            console.error('Error loading order for status update:', error);
            ui.showError('Gagal memuat data order');
        } finally {
            ui.hideLoading();
        }
    }

    getValidStatusOptions(currentStatus) {
        // Sesuai dengan validasi backend di OrderController.isValidStatusTransition()
        const validTransitions = {
            'waiting': [
                { value: 'in_progress', label: 'Dalam Proses' },
                { value: 'cancelled', label: 'Dibatalkan' }
            ],
            'in_progress': [
                { value: 'on_trip', label: 'Dalam Perjalanan' },
                { value: 'cancelled', label: 'Dibatalkan' }
            ],
            'on_trip': [
                { value: 'completed', label: 'Selesai' },
                { value: 'cancelled', label: 'Dibatalkan' }
            ],
            'completed': [], // Tidak bisa diubah lagi
            'cancelled': []  // Tidak bisa diubah lagi
        };
        
        return validTransitions[currentStatus] || [];
    }

    async submitUpdateOrderStatus() {
        try {
            ui.showLoading();
            const orderId = document.getElementById('update-order-id').value;
            const newStatus = document.getElementById('update-order-status').value;

            if (!newStatus) {
                ui.showError('Pilih status baru terlebih dahulu');
                return;
            }

            const result = await api.updateOrderStatus(orderId, { status: newStatus });
            if (result && result.success) {
                ui.showToast('Status order berhasil diupdate!');
                this.hideModal();
                await this.loadDashboard();
            } else {
                ui.showError('Gagal mengupdate status order');
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            
            // Handle specific error messages from backend
            if (error.responseData && error.responseData.message) {
                ui.showError(error.responseData.message);
            } else {
                ui.showError('Gagal mengupdate status order: ' + error.message);
            }
        } finally {
            ui.hideLoading();
        }
    }

    async viewPayment(paymentId) {
        try {
            ui.showLoading();
            const payment = await api.getPaymentById(paymentId);
            
            const html = `
                <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                    <i class="fas fa-credit-card text-purple-500"></i>Detail Payment #${payment.id}
                </h2>
                <div class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <span class="px-3 py-1 rounded-full text-sm font-medium ${this.getPaymentStatusColor(payment.status)}">
                                ${this.getPaymentStatusText(payment.status)}
                            </span>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Order ID</label>
                            <p class="text-gray-800">#${payment.orderId}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                            <p class="text-gray-800 font-bold">Rp ${payment.amount?.toLocaleString() || '0'}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                            <p class="text-gray-800">${payment.method || 'N/A'}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Created At</label>
                            <p class="text-gray-800">${new Date(payment.createdAt).toLocaleString()}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Updated At</label>
                            <p class="text-gray-800">${new Date(payment.updatedAt).toLocaleString()}</p>
                        </div>
                    </div>
                    <div class="flex justify-end space-x-3 pt-4">
                        <button onclick="adminDashboard.hideModal()" class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                            Tutup
                        </button>
                        <button onclick="adminDashboard.updatePaymentStatus(${payment.id})" class="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 hidden">
                            <i class="fas fa-edit mr-1"></i>Update Status
                        </button>
                    </div>
                </div>
            `;
            
            this.showModal(html);
        } catch (error) {
            console.error('Error loading payment details:', error);
            ui.showError('Gagal memuat detail payment');
        } finally {
            ui.hideLoading();
        }
    }

    async updatePaymentStatus(paymentId) {
        try {
            ui.showLoading();
            const payment = await api.getPaymentById(paymentId);
            
            const html = `
                <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                    <i class="fas fa-edit text-purple-500"></i>Update Status Payment #${payment.id}
                </h2>
                <form id="update-payment-form" class="space-y-4">
                    <input type="hidden" id="update-payment-id" value="${payment.id}">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Status Saat Ini</label>
                        <span class="px-3 py-1 rounded-full text-sm font-medium ${this.getPaymentStatusColor(payment.status)}">
                            ${this.getPaymentStatusText(payment.status)}
                        </span>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Status Baru</label>
                        <select id="update-payment-status" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                            <option value="pending" ${payment.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="paid" ${payment.status === 'paid' ? 'selected' : ''}>Paid</option>
                            <option value="failed" ${payment.status === 'failed' ? 'selected' : ''}>Failed</option>
                            <option value="cancelled" ${payment.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </div>
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" onclick="adminDashboard.hideModal()" class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                            Batal
                        </button>
                        <button type="submit" class="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600">
                            <i class="fas fa-save mr-1"></i>Update
                        </button>
                    </div>
                </form>
            `;
            
            this.showModal(html);
            
            // Add form submit handler
            document.getElementById('update-payment-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.submitUpdatePaymentStatus();
            });
        } catch (error) {
            console.error('Error loading payment for status update:', error);
            ui.showError('Gagal memuat data payment');
        } finally {
            ui.hideLoading();
        }
    }

    async submitUpdatePaymentStatus() {
        try {
            ui.showLoading();
            const paymentId = document.getElementById('update-payment-id').value;
            const newStatus = document.getElementById('update-payment-status').value;

            if (!newStatus) {
                ui.showError('Pilih status baru terlebih dahulu');
                return;
            }

            // Gunakan endpoint yang benar untuk update payment status
            const result = await api.updatePaymentStatusByAdmin(paymentId, { status: newStatus });
            if (result) {
                ui.showToast('Status payment berhasil diupdate!');
                this.hideModal();
                await this.loadDashboard();
            } else {
                ui.showError('Gagal mengupdate status payment');
            }
        } catch (error) {
            console.error('Error updating payment status:', error);
            
            // Handle specific error messages from backend
            if (error.responseData && error.responseData.message) {
                ui.showError(error.responseData.message);
            } else {
                ui.showError('Gagal mengupdate status payment: ' + error.message);
            }
        } finally {
            ui.hideLoading();
        }
    }

    // Helper functions
    getRoleColor(role) {
        const colors = {
            'admin': 'bg-red-100 text-red-800',
            'customer': 'bg-blue-100 text-blue-800',
            'driver': 'bg-green-100 text-green-800'
        };
        return colors[role] || 'bg-gray-100 text-gray-800';
    }

    getRoleText(role) {
        const texts = {
            'admin': 'Admin',
            'customer': 'Customer',
            'driver': 'Driver'
        };
        return texts[role] || role;
    }

    getStatusColor(status) {
        const colors = {
            'available': 'bg-green-100 text-green-800',
            'unavailable': 'bg-red-100 text-red-800',
            'busy': 'bg-yellow-100 text-yellow-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    }

    getStatusText(status) {
        const texts = {
            'available': 'Available',
            'unavailable': 'Unavailable',
            'busy': 'Sibuk'
        };
        return texts[status] || status;
    }

    getOrderStatusColor(status) {
        const colors = {
            'waiting': 'bg-yellow-100 text-yellow-800',
            'accepted': 'bg-blue-100 text-blue-800',
            'in_progress': 'bg-orange-100 text-orange-800',
            'on_trip': 'bg-purple-100 text-purple-800',
            'completed': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    }

    getOrderStatusText(status) {
        const texts = {
            'waiting': 'Menunggu',
            'accepted': 'Diterima',
            'in_progress': 'Dalam Proses',
            'on_trip': 'Dalam Perjalanan',
            'completed': 'Selesai',
            'cancelled': 'Dibatalkan'
        };
        return texts[status] || status;
    }

    getPaymentStatusColor(status) {
        const colors = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'paid': 'bg-green-100 text-green-800',
            'failed': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    }

    getPaymentStatusText(status) {
        const texts = {
            pending: 'Menunggu',
            paid: 'Lunas',
            failed: 'Gagal',
            cancelled: 'Dibatalkan'
        };
        return texts[status] || status;
    }

    // Method untuk menampilkan modal
    showModal(html) {
        // Buat modal jika belum ada
        if (!document.getElementById('modal-admin-dashboard')) {
            const modalHtml = `
                <div id="modal-admin-dashboard" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 hidden">
                    <div class="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
                        <button id="modal-close-btn" class="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times"></i>
                        </button>
                        <div id="modal-admin-dashboard-content"></div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            
            // Add event listener untuk tombol close
            document.getElementById('modal-close-btn').onclick = () => {
                this.hideModal();
            };
        }

        // Tampilkan modal
        document.getElementById('modal-admin-dashboard-content').innerHTML = html;
        document.getElementById('modal-admin-dashboard').classList.remove('hidden');
    }

    // Method untuk menyembunyikan modal
    hideModal() {
        const modal = document.getElementById('modal-admin-dashboard');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    async filterOrders(status) {
        ui.showToast('Fitur filter order akan segera hadir');
    }

    async filterPayments(status) {
        ui.showToast('Fitur filter payment akan segera hadir');
    }

    showDeleteConfirmation(type, name, callback) {
        this.showModal(`
            <div class="p-6 text-center">
                <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-trash text-red-600 text-2xl"></i>
                </div>
                <h3 class="text-lg font-bold text-gray-800 mb-2">Konfirmasi Penghapusan</h3>
                <p class="text-gray-600 mb-6">Apakah Anda yakin ingin menghapus ${type} "${name}"?</p>
                <div class="flex space-x-3">
                    <button onclick="adminDashboard.hideModal()" 
                            class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors">
                        Batal
                    </button>
                    <button onclick="adminDashboard.executeDelete()" 
                            class="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
                        <i class="fas fa-trash mr-2"></i>Hapus
                    </button>
                </div>
            </div>
        `);
        
        // Simpan callback untuk eksekusi nanti
        this.pendingDeleteCallback = callback;
    }

    executeDelete() {
        this.hideModal();
        if (this.pendingDeleteCallback) {
            this.pendingDeleteCallback();
            this.pendingDeleteCallback = null;
        }
    }
}

// Initialize admin dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
}); 