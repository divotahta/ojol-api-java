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
                                    <div class="flex justify-between items-start">
                                        <div class="flex-1">
                                            <h4 class="font-medium text-gray-800">${driver.name}</h4>
                                            <p class="text-sm text-gray-600">${driver.phone}</p>
                                            <div class="flex items-center space-x-2 mt-1 mb-2">
                                                <span class="px-2 py-1 rounded-full text-xs font-medium ${this.getStatusColor(driver.status)}">
                                                    ${this.getStatusText(driver.status)}
                                                </span>
                                            </div>
                                            <div class="text-xs text-gray-500 space-y-1">
                                                <div class="flex items-center space-x-1">
                                                    <i class="fas fa-motorcycle text-green-500"></i>
                                                    <span>${driver.vehicle_type || 'N/A'} - ${driver.vehicle_brand || 'N/A'} ${driver.vehicle_model || 'N/A'}</span>
                                                </div>
                                                <div class="flex items-center space-x-1">
                                                    <i class="fas fa-id-card text-blue-500"></i>
                                                    <span>${driver.plate_number || 'N/A'}</span>
                                                </div>
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
        const html = `
            <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                <i class="fas fa-user-plus text-blue-500"></i>Tambah User Baru
            </h2>
            <form id="create-user-form" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Nama</label>
                        <input type="text" id="user-name" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input type="email" id="user-email" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <input type="password" id="user-password" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Role</label>
                        <select id="user-role" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                            <option value="customer">Customer</option>
                            <option value="driver">Driver</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>
                <div class="flex justify-end space-x-3 pt-4">
                    <button type="button" onclick="adminDashboard.hideModal()" class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                        Batal
                    </button>
                    <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                        <i class="fas fa-save mr-1"></i>Simpan
                    </button>
                </div>
            </form>
        `;
        
        this.showModal(html);
        
        // Add form submit handler
        document.getElementById('create-user-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.submitCreateUser();
        });
    }

    async submitCreateUser() {
        try {
            ui.showLoading();
            const userData = {
                name: document.getElementById('user-name').value,
                email: document.getElementById('user-email').value,
                password: document.getElementById('user-password').value,
                role: document.getElementById('user-role').value
            };

            const result = await api.createUser(userData);
            if (result && result.success) {
                ui.showToast('User berhasil dibuat!');
                this.hideModal();
                await this.loadDashboard();
            } else {
                ui.showError('Gagal membuat user');
            }
        } catch (error) {
            console.error('Error creating user:', error);
            ui.showError('Gagal membuat user');
        } finally {
            ui.hideLoading();
        }
    }

    async editUser(userId) {
        try {
            ui.showLoading();
            const user = await api.getUserById(userId);
            
            const html = `
                <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                    <i class="fas fa-user-edit text-blue-500"></i>Edit User
                </h2>
                <form id="edit-user-form" class="space-y-4">
                    <input type="hidden" id="edit-user-id" value="${user.id}">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Nama</label>
                            <input type="text" id="edit-user-name" value="${user.name || ''}" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input type="email" id="edit-user-email" value="${user.email || ''}" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Password Baru (kosongkan jika tidak ingin mengubah)</label>
                            <input type="password" id="edit-user-password" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Role</label>
                            <select id="edit-user-role" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                <option value="customer" ${user.role === 'customer' ? 'selected' : ''}>Customer</option>
                                <option value="driver" ${user.role === 'driver' ? 'selected' : ''}>Driver</option>
                                <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                            </select>
                        </div>
                    </div>
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" onclick="adminDashboard.hideModal()" class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                            Batal
                        </button>
                        <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                            <i class="fas fa-save mr-1"></i>Update
                        </button>
                    </div>
                </form>
            `;
            
            this.showModal(html);
            
            // Add form submit handler
            document.getElementById('edit-user-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.submitEditUser();
            });
        } catch (error) {
            console.error('Error loading user for edit:', error);
            ui.showError('Gagal memuat data user');
        } finally {
            ui.hideLoading();
        }
    }

    async submitEditUser() {
        try {
            ui.showLoading();
            const userId = document.getElementById('edit-user-id').value;
            const userData = {
                name: document.getElementById('edit-user-name').value,
                email: document.getElementById('edit-user-email').value,
                role: document.getElementById('edit-user-role').value
            };

            // Hanya kirim password jika diisi
            const password = document.getElementById('edit-user-password').value;
            if (password) {
                userData.password = password;
            }

            const result = await api.updateUser(userId, userData);
            if (result && result.success) {
                ui.showToast('User berhasil diupdate!');
                this.hideModal();
                await this.loadDashboard();
            } else {
                ui.showError('Gagal mengupdate user');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            ui.showError('Gagal mengupdate user');
        } finally {
            ui.hideLoading();
        }
    }

    async deleteUser(userId) {
        if (confirm('Apakah Anda yakin ingin menghapus user ini?')) {
            try {
                ui.showLoading();
                const result = await api.deleteUser(userId);
                if (result && result.success) {
                    ui.showToast('User berhasil dihapus!');
                    await this.loadDashboard();
                } else {
                    ui.showError('Gagal menghapus user');
                }
            } catch (error) {
                console.error('Error deleting user:', error);
                ui.showError('Gagal menghapus user');
            } finally {
                ui.hideLoading();
            }
        }
    }

    async createDriver() {
        const html = `
            <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                <i class="fas fa-motorcycle text-green-500"></i>Tambah Driver Baru
            </h2>
            <form id="create-driver-form" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Nama</label>
                        <input type="text" id="driver-name" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input type="text" id="driver-phone" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select id="driver-status" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                            <option value="available">Available</option>
                            <option value="busy">Busy</option>
                            <option value="offline">Offline</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
                        <select id="driver-vehicle-type" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                            <option value="motorcycle">Motorcycle</option>
                            <option value="car">Car</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Vehicle Brand</label>
                        <input type="text" id="driver-vehicle-brand" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Vehicle Model</label>
                        <input type="text" id="driver-vehicle-model" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Plate Number</label>
                        <input type="text" id="driver-plate-number" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                    </div>
                </div>
                <div class="flex justify-end space-x-3 pt-4">
                    <button type="button" onclick="adminDashboard.hideModal()" class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                        Batal
                    </button>
                    <button type="submit" class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                        <i class="fas fa-save mr-1"></i>Simpan
                    </button>
                </div>
            </form>
        `;
        
        this.showModal(html);
        
        // Add form submit handler
        document.getElementById('create-driver-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.submitCreateDriver();
        });
    }

    async submitCreateDriver() {
        try {
            ui.showLoading();
            const driverData = {
                name: document.getElementById('driver-name').value,
                phone: document.getElementById('driver-phone').value,
                status: document.getElementById('driver-status').value,
                vehicle_type: document.getElementById('driver-vehicle-type').value,
                vehicle_brand: document.getElementById('driver-vehicle-brand').value,
                vehicle_model: document.getElementById('driver-vehicle-model').value,
                plate_number: document.getElementById('driver-plate-number').value
            };

            const result = await api.createDriver(driverData);
            if (result && result.success) {
                ui.showToast('Driver berhasil dibuat!');
                this.hideModal();
                await this.loadDashboard();
            } else {
                ui.showError('Gagal membuat driver');
            }
        } catch (error) {
            console.error('Error creating driver:', error);
            ui.showError('Gagal membuat driver');
        } finally {
            ui.hideLoading();
        }
    }

    async editDriver(driverId) {
        try {
            ui.showLoading();
            const driver = await api.getDriverById(driverId);
            
            const html = `
                <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                    <i class="fas fa-motorcycle text-green-500"></i>Edit Driver
                </h2>
                <form id="edit-driver-form" class="space-y-4">
                    <input type="hidden" id="edit-driver-id" value="${driver.id}">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Nama</label>
                            <input type="text" id="edit-driver-name" value="${driver.name || ''}" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                            <input type="text" id="edit-driver-phone" value="${driver.phone || ''}" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select id="edit-driver-status" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                                <option value="available" ${driver.status === 'available' ? 'selected' : ''}>Available</option>
                                <option value="busy" ${driver.status === 'busy' ? 'selected' : ''}>Busy</option>
                                <option value="offline" ${driver.status === 'offline' ? 'selected' : ''}>Offline</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
                            <select id="edit-driver-vehicle-type" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                                <option value="motorcycle" ${driver.vehicle_type === 'motorcycle' ? 'selected' : ''}>Motorcycle</option>
                                <option value="car" ${driver.vehicle_type === 'car' ? 'selected' : ''}>Car</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Vehicle Brand</label>
                            <input type="text" id="edit-driver-vehicle-brand" value="${driver.vehicle_brand || ''}" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Vehicle Model</label>
                            <input type="text" id="edit-driver-vehicle-model" value="${driver.vehicle_model || ''}" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Plate Number</label>
                            <input type="text" id="edit-driver-plate-number" value="${driver.plate_number || ''}" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                        </div>
                    </div>
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" onclick="adminDashboard.hideModal()" class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                            Batal
                        </button>
                        <button type="submit" class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                            <i class="fas fa-save mr-1"></i>Update
                        </button>
                    </div>
                </form>
            `;
            
            this.showModal(html);
            
            // Add form submit handler
            document.getElementById('edit-driver-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.submitEditDriver();
            });
        } catch (error) {
            console.error('Error loading driver for edit:', error);
            ui.showError('Gagal memuat data driver');
        } finally {
            ui.hideLoading();
        }
    }

    async submitEditDriver() {
        try {
            ui.showLoading();
            const driverId = document.getElementById('edit-driver-id').value;
            const driverData = {
                name: document.getElementById('edit-driver-name').value,
                phone: document.getElementById('edit-driver-phone').value,
                status: document.getElementById('edit-driver-status').value,
                vehicle_type: document.getElementById('edit-driver-vehicle-type').value,
                vehicle_brand: document.getElementById('edit-driver-vehicle-brand').value,
                vehicle_model: document.getElementById('edit-driver-vehicle-model').value,
                plate_number: document.getElementById('edit-driver-plate-number').value
            };

            const result = await api.updateDriver(driverId, driverData);
            if (result && result.success) {
                ui.showToast('Driver berhasil diupdate!');
                this.hideModal();
                await this.loadDashboard();
            } else {
                ui.showError('Gagal mengupdate driver');
            }
        } catch (error) {
            console.error('Error updating driver:', error);
            ui.showError('Gagal mengupdate driver');
        } finally {
            ui.hideLoading();
        }
    }

    async deleteDriver(driverId) {
        if (confirm('Apakah Anda yakin ingin menghapus driver ini?')) {
            try {
                ui.showLoading();
                const result = await api.deleteDriver(driverId);
                if (result && result.success) {
                    ui.showToast('Driver berhasil dihapus!');
                    await this.loadDashboard();
                } else {
                    ui.showError('Gagal menghapus driver');
                }
            } catch (error) {
                console.error('Error deleting driver:', error);
                ui.showError('Gagal menghapus driver');
            } finally {
                ui.hideLoading();
            }
        }
    }

    async viewOrder(orderId) {
        try {
            ui.showLoading();
            const order = await api.getOrderById(orderId);
            
            const html = `
                <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                    <i class="fas fa-list text-yellow-500"></i>Detail Order #${order.id}
                </h2>
                <div class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <span class="px-3 py-1 rounded-full text-sm font-medium ${this.getStatusColor(order.status)}">
                                ${this.getStatusText(order.status)}
                            </span>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Customer</label>
                            <p class="text-gray-800">${order.customerName || 'N/A'}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Origin</label>
                            <p class="text-gray-800">${order.origin}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Destination</label>
                            <p class="text-gray-800">${order.destination}</p>
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
                            <p class="text-gray-800">${new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Driver</label>
                            <p class="text-gray-800">${order.driver?.name || 'Belum ada driver'}</p>
                        </div>
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
            const order = await api.getOrderById(orderId);
            
            const html = `
                <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                    <i class="fas fa-edit text-yellow-500"></i>Update Status Order #${order.id}
                </h2>
                <form id="update-order-form" class="space-y-4">
                    <input type="hidden" id="update-order-id" value="${order.id}">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Status Saat Ini</label>
                        <span class="px-3 py-1 rounded-full text-sm font-medium ${this.getStatusColor(order.status)}">
                            ${this.getStatusText(order.status)}
                        </span>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Status Baru</label>
                        <select id="update-order-status" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500">
                            <option value="waiting" ${order.status === 'waiting' ? 'selected' : ''}>Waiting</option>
                            <option value="accepted" ${order.status === 'accepted' ? 'selected' : ''}>Accepted</option>
                            <option value="in_progress" ${order.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                            <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </div>
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" onclick="adminDashboard.hideModal()" class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                            Batal
                        </button>
                        <button type="submit" class="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
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

    async submitUpdateOrderStatus() {
        try {
            ui.showLoading();
            const orderId = document.getElementById('update-order-id').value;
            const newStatus = document.getElementById('update-order-status').value;

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
            ui.showError('Gagal mengupdate status order');
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
                            <p class="text-gray-800">${payment.paymentMethod || 'N/A'}</p>
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
                        <button onclick="adminDashboard.updatePaymentStatus(${payment.id})" class="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600">
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

            const result = await api.updatePaymentStatus(paymentId, { status: newStatus });
            if (result && result.success) {
                ui.showToast('Status payment berhasil diupdate!');
                this.hideModal();
                await this.loadDashboard();
            } else {
                ui.showError('Gagal mengupdate status payment');
            }
        } catch (error) {
            console.error('Error updating payment status:', error);
            ui.showError('Gagal mengupdate status payment');
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
}

// Initialize admin dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
}); 