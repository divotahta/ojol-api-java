// Admin Dashboard for OjoL Frontend
class AdminDashboard {
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
            window.location.href = 'index.html';
            return;
        }

        const role = auth.getRole();
        if (role !== CONFIG.ROLES.ADMIN) {
            ui.showError('Akses ditolak. Anda bukan admin.');
            auth.logout();
            window.location.href = 'index.html';
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
                auth.logout();
                window.location.href = 'index.html';
            });
        }
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
            const adminData = await api.getAdminProfile();
            
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
            const stats = await api.getSystemStatistics();
            
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
        }
    }

    async loadUserManagement() {
        try {
            const users = await api.getAllUsers();
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
                            ${users.length === 0 ? `
                                <div class="text-center py-4 text-gray-500">
                                    <i class="fas fa-users text-2xl mb-2"></i>
                                    <p>Tidak ada user</p>
                                </div>
                            ` : users.map(user => `
                                <div class="border border-gray-200 rounded-lg p-3 mb-2 hover:shadow-sm transition-shadow">
                                    <div class="flex justify-between items-center">
                                        <div>
                                            <h4 class="font-medium text-gray-800">${user.name}</h4>
                                            <p class="text-sm text-gray-600">${user.email}</p>
                                            <span class="px-2 py-1 rounded-full text-xs font-medium ${this.getRoleColor(user.role)}">
                                                ${this.getRoleText(user.role)}
                                            </span>
                                        </div>
                                        <div class="flex space-x-2">
                                            <button onclick="adminDashboard.editUser(${user.id})" 
                                                    class="text-blue-600 hover:text-blue-800">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button onclick="adminDashboard.deleteUser(${user.id})" 
                                                    class="text-red-600 hover:text-red-800">
                                                <i class="fas fa-trash"></i>
                                            </button>
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
        }
    }

    async loadDriverManagement() {
        try {
            const drivers = await api.getAllDrivers();
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
                            ${drivers.length === 0 ? `
                                <div class="text-center py-4 text-gray-500">
                                    <i class="fas fa-motorcycle text-2xl mb-2"></i>
                                    <p>Tidak ada driver</p>
                                </div>
                            ` : drivers.map(driver => `
                                <div class="border border-gray-200 rounded-lg p-3 mb-2 hover:shadow-sm transition-shadow">
                                    <div class="flex justify-between items-center">
                                        <div>
                                            <h4 class="font-medium text-gray-800">${driver.name}</h4>
                                            <p class="text-sm text-gray-600">${driver.phone}</p>
                                            <div class="flex items-center space-x-2 mt-1">
                                                <span class="px-2 py-1 rounded-full text-xs font-medium ${this.getStatusColor(driver.status)}">
                                                    ${this.getStatusText(driver.status)}
                                                </span>
                                                <span class="text-xs text-gray-500">⭐ ${driver.rating || '0'}</span>
                                            </div>
                                        </div>
                                        <div class="flex space-x-2">
                                            <button onclick="adminDashboard.editDriver(${driver.id})" 
                                                    class="text-blue-600 hover:text-blue-800">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button onclick="adminDashboard.deleteDriver(${driver.id})" 
                                                    class="text-red-600 hover:text-red-800">
                                                <i class="fas fa-trash"></i>
                                            </button>
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
                                    <option value="PENDING">Menunggu</option>
                                    <option value="ACCEPTED">Diterima</option>
                                    <option value="IN_PROGRESS">Dalam Proses</option>
                                    <option value="COMPLETED">Selesai</option>
                                    <option value="CANCELLED">Dibatalkan</option>
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
                                                <span class="px-2 py-1 rounded-full text-xs font-medium ${this.getStatusColor(order.status)}">
                                                    ${this.getStatusText(order.status)}
                                                </span>
                                            </div>
                                            <p class="text-sm text-gray-600 mb-1">
                                                <i class="fas fa-map-marker-alt text-green-500 mr-1"></i>${order.origin}
                                            </p>
                                            <p class="text-sm text-gray-600 mb-1">
                                                <i class="fas fa-map-marker text-red-500 mr-1"></i>${order.destination}
                                            </p>
                                            <p class="text-sm text-gray-600">
                                                <i class="fas fa-money-bill text-blue-500 mr-1"></i>Rp ${order.fare?.toLocaleString() || '0'}
                                            </p>
                                        </div>
                                        <div class="flex space-x-2">
                                            <button onclick="adminDashboard.viewOrder(${order.id})" 
                                                    class="text-blue-600 hover:text-blue-800">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                            <button onclick="adminDashboard.updateOrderStatus(${order.id})" 
                                                    class="text-green-600 hover:text-green-800">
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
                                    <option value="PENDING">Menunggu</option>
                                    <option value="COMPLETED">Selesai</option>
                                    <option value="FAILED">Gagal</option>
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
            const stats = await api.getSystemStatistics();
            
            const todayOrders = document.getElementById('today-orders');
            const todayRevenue = document.getElementById('today-revenue');
            const onlineDrivers = document.getElementById('online-drivers');
            
            if (todayOrders) todayOrders.textContent = stats.todayOrders || 0;
            if (todayRevenue) todayRevenue.textContent = `Rp ${(stats.todayRevenue || 0).toLocaleString()}`;
            if (onlineDrivers) onlineDrivers.textContent = stats.onlineDrivers || 0;
            
        } catch (error) {
            console.error('Error loading system statistics:', error);
        }
    }

    // Management functions
    async createUser() {
        ui.showToast('Fitur tambah user akan segera hadir');
    }

    async editUser(userId) {
        ui.showToast('Fitur edit user akan segera hadir');
    }

    async deleteUser(userId) {
        ui.showConfirmation('Apakah Anda yakin ingin menghapus user ini?', async () => {
            try {
                ui.showLoading();
                await api.deleteUser(userId);
                ui.showToast('User berhasil dihapus');
                await this.loadUserManagement();
                await this.loadStatistics();
            } catch (error) {
                console.error('Error deleting user:', error);
                ui.showError('Gagal menghapus user');
            } finally {
                ui.hideLoading();
            }
        });
    }

    async createDriver() {
        ui.showToast('Fitur tambah driver akan segera hadir');
    }

    async editDriver(driverId) {
        ui.showToast('Fitur edit driver akan segera hadir');
    }

    async deleteDriver(driverId) {
        ui.showConfirmation('Apakah Anda yakin ingin menghapus driver ini?', async () => {
            try {
                ui.showLoading();
                await api.deleteDriver(driverId);
                ui.showToast('Driver berhasil dihapus');
                await this.loadDriverManagement();
                await this.loadStatistics();
            } catch (error) {
                console.error('Error deleting driver:', error);
                ui.showError('Gagal menghapus driver');
            } finally {
                ui.hideLoading();
            }
        });
    }

    async viewOrder(orderId) {
        ui.showToast('Fitur detail order akan segera hadir');
    }

    async updateOrderStatus(orderId) {
        ui.showToast('Fitur update status order akan segera hadir');
    }

    async viewPayment(paymentId) {
        ui.showToast('Fitur detail payment akan segera hadir');
    }

    async filterOrders(status) {
        ui.showToast('Fitur filter order akan segera hadir');
    }

    async filterPayments(status) {
        ui.showToast('Fitur filter payment akan segera hadir');
    }

    // Helper functions
    getRoleColor(role) {
        const colors = {
            'ADMIN': 'bg-red-100 text-red-800',
            'CUSTOMER': 'bg-blue-100 text-blue-800',
            'DRIVER': 'bg-green-100 text-green-800'
        };
        return colors[role] || 'bg-gray-100 text-gray-800';
    }

    getRoleText(role) {
        const texts = {
            'ADMIN': 'Admin',
            'CUSTOMER': 'Customer',
            'DRIVER': 'Driver'
        };
        return texts[role] || role;
    }

    getStatusColor(status) {
        const colors = {
            'ONLINE': 'bg-green-100 text-green-800',
            'OFFLINE': 'bg-red-100 text-red-800',
            'BUSY': 'bg-yellow-100 text-yellow-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    }

    getStatusText(status) {
        const texts = {
            'ONLINE': 'Online',
            'OFFLINE': 'Offline',
            'BUSY': 'Sibuk'
        };
        return texts[status] || status;
    }

    getPaymentStatusColor(status) {
        const colors = {
            'PENDING': 'bg-yellow-100 text-yellow-800',
            'COMPLETED': 'bg-green-100 text-green-800',
            'FAILED': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    }

    getPaymentStatusText(status) {
        const texts = {
            'PENDING': 'Menunggu',
            'COMPLETED': 'Selesai',
            'FAILED': 'Gagal'
        };
        return texts[status] || status;
    }
}

// Initialize admin dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdminDashboard();
}); 