// Konfigurasi API Gateway
const API_BASE_URL = 'http://localhost:8080/api';

// State management
let currentTab = 'users';
let editingId = null;

// Utility functions
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        showNotification(`Error: ${error.message}`, 'error');
        throw error;
    }
}

// Tab management
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('bg-primary', 'text-white');
        btn.classList.add('text-gray-500', 'hover:text-gray-700');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.remove('hidden');
    
    // Add active class to selected button
    event.target.classList.remove('text-gray-500', 'hover:text-gray-700');
    event.target.classList.add('bg-primary', 'text-white');
    
    currentTab = tabName;
    loadData();
}

// User management
function showUserForm() {
    document.getElementById('user-form').classList.remove('hidden');
    editingId = null;
    clearUserForm();
}

function cancelUserForm() {
    document.getElementById('user-form').classList.add('hidden');
    editingId = null;
    clearUserForm();
}

function clearUserForm() {
    document.getElementById('user-name').value = '';
    document.getElementById('user-email').value = '';
    document.getElementById('user-password').value = '';
    document.getElementById('user-role').value = 'user';
}

async function saveUser() {
    const userData = {
        name: document.getElementById('user-name').value,
        email: document.getElementById('user-email').value,
        password: document.getElementById('user-password').value,
        role: document.getElementById('user-role').value
    };
    
    try {
        if (editingId) {
            await apiCall(`/users/${editingId}`, {
                method: 'PUT',
                body: JSON.stringify(userData)
            });
            showNotification('User berhasil diupdate!');
        } else {
            await apiCall('/users', {
                method: 'POST',
                body: JSON.stringify(userData)
            });
            showNotification('User berhasil ditambahkan!');
        }
        
        cancelUserForm();
        loadUsers();
    } catch (error) {
        showNotification('Gagal menyimpan user', 'error');
    }
}

async function loadUsers() {
    try {
        const users = await apiCall('/users');
        const tbody = document.getElementById('users-table');
        tbody.innerHTML = '';
        
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${user.id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${user.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${user.email}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${user.role}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="editUser(${user.id})" class="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                    <button onclick="deleteUser(${user.id})" class="text-red-600 hover:text-red-900">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        showNotification('Gagal memuat data users', 'error');
    }
}

async function editUser(id) {
    try {
        const user = await apiCall(`/users/${id}`);
        document.getElementById('user-name').value = user.name;
        document.getElementById('user-email').value = user.email;
        document.getElementById('user-role').value = user.role;
        document.getElementById('user-password').value = '';
        editingId = id;
        document.getElementById('user-form').classList.remove('hidden');
    } catch (error) {
        showNotification('Gagal memuat data user', 'error');
    }
}

async function deleteUser(id) {
    if (confirm('Apakah Anda yakin ingin menghapus user ini?')) {
        try {
            await apiCall(`/users/${id}`, { method: 'DELETE' });
            showNotification('User berhasil dihapus!');
            loadUsers();
        } catch (error) {
            showNotification('Gagal menghapus user', 'error');
        }
    }
}

// Driver management
function showDriverForm() {
    document.getElementById('driver-form').classList.remove('hidden');
    editingId = null;
    clearDriverForm();
}

function cancelDriverForm() {
    document.getElementById('driver-form').classList.add('hidden');
    editingId = null;
    clearDriverForm();
}

function clearDriverForm() {
    document.getElementById('driver-user-id').value = '';
    document.getElementById('driver-name').value = '';
    document.getElementById('driver-phone').value = '';
    document.getElementById('driver-status').value = 'available';
    document.getElementById('driver-vehicle-type').value = '';
    document.getElementById('driver-vehicle-brand').value = '';
    document.getElementById('driver-vehicle-model').value = '';
    document.getElementById('driver-plate-number').value = '';
}

async function saveDriver() {
    const driverData = {
        userId: parseInt(document.getElementById('driver-user-id').value),
        name: document.getElementById('driver-name').value,
        phone: document.getElementById('driver-phone').value,
        status: document.getElementById('driver-status').value,
        vehicleType: document.getElementById('driver-vehicle-type').value,
        vehicleBrand: document.getElementById('driver-vehicle-brand').value,
        vehicleModel: document.getElementById('driver-vehicle-model').value,
        plateNumber: document.getElementById('driver-plate-number').value
    };
    
    try {
        if (editingId) {
            await apiCall(`/drivers/${editingId}`, {
                method: 'PUT',
                body: JSON.stringify(driverData)
            });
            showNotification('Driver berhasil diupdate!');
        } else {
            await apiCall('/drivers', {
                method: 'POST',
                body: JSON.stringify(driverData)
            });
            showNotification('Driver berhasil ditambahkan!');
        }
        
        cancelDriverForm();
        loadDrivers();
    } catch (error) {
        showNotification('Gagal menyimpan driver', 'error');
    }
}

async function loadDrivers() {
    try {
        const drivers = await apiCall('/drivers');
        const tbody = document.getElementById('drivers-table');
        tbody.innerHTML = '';
        
        drivers.forEach(driver => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${driver.id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${driver.name}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        driver.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }">${driver.status}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${driver.vehicleType} - ${driver.plateNumber}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="editDriver(${driver.id})" class="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                    <button onclick="deleteDriver(${driver.id})" class="text-red-600 hover:text-red-900">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        showNotification('Gagal memuat data drivers', 'error');
    }
}

async function editDriver(id) {
    try {
        const driver = await apiCall(`/drivers/${id}`);
        document.getElementById('driver-user-id').value = driver.userId;
        document.getElementById('driver-name').value = driver.name;
        document.getElementById('driver-phone').value = driver.phone;
        document.getElementById('driver-status').value = driver.status;
        document.getElementById('driver-vehicle-type').value = driver.vehicleType;
        document.getElementById('driver-vehicle-brand').value = driver.vehicleBrand;
        document.getElementById('driver-vehicle-model').value = driver.vehicleModel;
        document.getElementById('driver-plate-number').value = driver.plateNumber;
        editingId = id;
        document.getElementById('driver-form').classList.remove('hidden');
    } catch (error) {
        showNotification('Gagal memuat data driver', 'error');
    }
}

async function deleteDriver(id) {
    if (confirm('Apakah Anda yakin ingin menghapus driver ini?')) {
        try {
            await apiCall(`/drivers/${id}`, { method: 'DELETE' });
            showNotification('Driver berhasil dihapus!');
            loadDrivers();
        } catch (error) {
            showNotification('Gagal menghapus driver', 'error');
        }
    }
}

// Order management
function showOrderForm() {
    document.getElementById('order-form').classList.remove('hidden');
    editingId = null;
    clearOrderForm();
}

function cancelOrderForm() {
    document.getElementById('order-form').classList.add('hidden');
    editingId = null;
    clearOrderForm();
}

function clearOrderForm() {
    document.getElementById('order-user-id').value = '';
    document.getElementById('order-origin').value = '';
    document.getElementById('order-origin-lat').value = '';
    document.getElementById('order-origin-lng').value = '';
    document.getElementById('order-destination').value = '';
    document.getElementById('order-dest-lat').value = '';
    document.getElementById('order-dest-lng').value = '';
    document.getElementById('order-status').value = 'waiting';
}

async function saveOrder() {
    const orderData = {
        userId: parseInt(document.getElementById('order-user-id').value),
        origin: document.getElementById('order-origin').value,
        originLat: parseFloat(document.getElementById('order-origin-lat').value) || null,
        originLng: parseFloat(document.getElementById('order-origin-lng').value) || null,
        destination: document.getElementById('order-destination').value,
        destinationLat: parseFloat(document.getElementById('order-dest-lat').value) || null,
        destinationLng: parseFloat(document.getElementById('order-dest-lng').value) || null,
        status: document.getElementById('order-status').value
    };
    
    try {
        if (editingId) {
            await apiCall(`/orders/${editingId}`, {
                method: 'PUT',
                body: JSON.stringify(orderData)
            });
            showNotification('Order berhasil diupdate!');
        } else {
            await apiCall('/orders', {
                method: 'POST',
                body: JSON.stringify(orderData)
            });
            showNotification('Order berhasil dibuat!');
        }
        
        cancelOrderForm();
        loadOrders();
    } catch (error) {
        showNotification('Gagal menyimpan order', 'error');
    }
}

async function loadOrders() {
    try {
        const orders = await apiCall('/orders');
        const tbody = document.getElementById('orders-table');
        tbody.innerHTML = '';
        
        orders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${order.id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${order.userId}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${order.origin}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${order.destination}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                    }">${order.status}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="editOrder(${order.id})" class="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                    <button onclick="deleteOrder(${order.id})" class="text-red-600 hover:text-red-900">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        showNotification('Gagal memuat data orders', 'error');
    }
}

async function editOrder(id) {
    try {
        const order = await apiCall(`/orders/${id}`);
        document.getElementById('order-user-id').value = order.userId;
        document.getElementById('order-origin').value = order.origin;
        document.getElementById('order-origin-lat').value = order.originLat;
        document.getElementById('order-origin-lng').value = order.originLng;
        document.getElementById('order-destination').value = order.destination;
        document.getElementById('order-dest-lat').value = order.destinationLat;
        document.getElementById('order-dest-lng').value = order.destinationLng;
        document.getElementById('order-status').value = order.status;
        editingId = id;
        document.getElementById('order-form').classList.remove('hidden');
    } catch (error) {
        showNotification('Gagal memuat data order', 'error');
    }
}

async function deleteOrder(id) {
    if (confirm('Apakah Anda yakin ingin menghapus order ini?')) {
        try {
            await apiCall(`/orders/${id}`, { method: 'DELETE' });
            showNotification('Order berhasil dihapus!');
            loadOrders();
        } catch (error) {
            showNotification('Gagal menghapus order', 'error');
        }
    }
}

// Payment management
function showPaymentForm() {
    document.getElementById('payment-form').classList.remove('hidden');
    editingId = null;
    clearPaymentForm();
}

function cancelPaymentForm() {
    document.getElementById('payment-form').classList.add('hidden');
    editingId = null;
    clearPaymentForm();
}

function clearPaymentForm() {
    document.getElementById('payment-order-id').value = '';
    document.getElementById('payment-amount').value = '';
    document.getElementById('payment-method').value = 'cash';
    document.getElementById('payment-status').value = 'pending';
}

async function savePayment() {
    const paymentData = {
        orderId: parseInt(document.getElementById('payment-order-id').value),
        amount: parseFloat(document.getElementById('payment-amount').value),
        method: document.getElementById('payment-method').value,
        status: document.getElementById('payment-status').value,
        paidAt: document.getElementById('payment-status').value === 'paid' ? new Date().toISOString() : null
    };
    
    try {
        if (editingId) {
            await apiCall(`/payments/${editingId}`, {
                method: 'PUT',
                body: JSON.stringify(paymentData)
            });
            showNotification('Payment berhasil diupdate!');
        } else {
            await apiCall('/payments', {
                method: 'POST',
                body: JSON.stringify(paymentData)
            });
            showNotification('Payment berhasil dibuat!');
        }
        
        cancelPaymentForm();
        loadPayments();
    } catch (error) {
        showNotification('Gagal menyimpan payment', 'error');
    }
}

async function loadPayments() {
    try {
        const payments = await apiCall('/payments');
        const tbody = document.getElementById('payments-table');
        tbody.innerHTML = '';
        
        payments.forEach(payment => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${payment.id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${payment.orderId}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rp ${payment.amount}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${payment.method}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        payment.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }">${payment.status}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="editPayment(${payment.id})" class="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                    <button onclick="deletePayment(${payment.id})" class="text-red-600 hover:text-red-900">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        showNotification('Gagal memuat data payments', 'error');
    }
}

async function editPayment(id) {
    try {
        const payment = await apiCall(`/payments/${id}`);
        document.getElementById('payment-order-id').value = payment.orderId;
        document.getElementById('payment-amount').value = payment.amount;
        document.getElementById('payment-method').value = payment.method;
        document.getElementById('payment-status').value = payment.status;
        editingId = id;
        document.getElementById('payment-form').classList.remove('hidden');
    } catch (error) {
        showNotification('Gagal memuat data payment', 'error');
    }
}

async function deletePayment(id) {
    if (confirm('Apakah Anda yakin ingin menghapus payment ini?')) {
        try {
            await apiCall(`/payments/${id}`, { method: 'DELETE' });
            showNotification('Payment berhasil dihapus!');
            loadPayments();
        } catch (error) {
            showNotification('Gagal menghapus payment', 'error');
        }
    }
}

// Load data based on current tab
function loadData() {
    switch (currentTab) {
        case 'users':
            loadUsers();
            break;
        case 'drivers':
            loadDrivers();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'payments':
            loadPayments();
            break;
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    
    // Check API connection
    apiCall('/users')
        .then(() => {
            document.getElementById('status').textContent = 'Connected';
            document.getElementById('status').className = 'px-2 py-1 bg-green-100 text-green-800 rounded';
        })
        .catch(() => {
            document.getElementById('status').textContent = 'Disconnected';
            document.getElementById('status').className = 'px-2 py-1 bg-red-100 text-red-800 rounded';
        });
}); 