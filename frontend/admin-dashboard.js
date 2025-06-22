// Konfigurasi API
const API_BASE_URL = 'http://localhost:8080/api';

// State management
let currentTab = 'users';
let editingId = null;

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadStatistics();
    loadData();
});

// Check if user is authenticated and has admin role
function checkAuth() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userName = localStorage.getItem('userName');
    
    if (!token || role !== 'admin') {
        window.location.href = 'login.html';
        return;
    }
    
    // Display user name
    document.getElementById('userName').textContent = `Welcome, ${userName}`;
}

// Load statistics
async function loadStatistics() {
    try {
        const [users, drivers, orders, payments] = await Promise.all([
            fetchData('/users'),
            fetchData('/drivers'),
            fetchData('/orders'),
            fetchData('/payments')
        ]);
        
        document.getElementById('totalUsers').textContent = users.length || 0;
        document.getElementById('totalDrivers').textContent = drivers.length || 0;
        document.getElementById('totalOrders').textContent = orders.length || 0;
        document.getElementById('totalPayments').textContent = payments.length || 0;
        
    } catch (error) {
        console.error('Error loading statistics:', error);
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

// Utility functions
async function fetchData(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
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
            await fetchData(`/users/${editingId}`, {
                method: 'PUT',
                body: JSON.stringify(userData)
            });
            showNotification('User berhasil diupdate!');
        } else {
            await fetchData('/users', {
                method: 'POST',
                body: JSON.stringify(userData)
            });
            showNotification('User berhasil ditambahkan!');
        }
        
        cancelUserForm();
        loadUsers();
        loadStatistics();
    } catch (error) {
        showNotification('Gagal menyimpan user', 'error');
    }
}

async function loadUsers() {
    try {
        const users = await fetchData('/users');
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
        const user = await fetchData(`/users/${id}`);
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
            await fetchData(`/users/${id}`, { method: 'DELETE' });
            showNotification('User berhasil dihapus!');
            loadUsers();
            loadStatistics();
        } catch (error) {
            showNotification('Gagal menghapus user', 'error');
        }
    }
}

// Driver management
function showDriverForm() {
    // Implementation for driver form
    showNotification('Fitur driver form akan segera hadir!');
}

async function loadDrivers() {
    try {
        const drivers = await fetchData('/drivers');
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
    showNotification('Fitur edit driver akan segera hadir!');
}

async function deleteDriver(id) {
    if (confirm('Apakah Anda yakin ingin menghapus driver ini?')) {
        try {
            await fetchData(`/drivers/${id}`, { method: 'DELETE' });
            showNotification('Driver berhasil dihapus!');
            loadDrivers();
            loadStatistics();
        } catch (error) {
            showNotification('Gagal menghapus driver', 'error');
        }
    }
}

// Order management
async function loadOrders() {
    try {
        const orders = await fetchData('/orders');
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
                    <button onclick="viewOrder(${order.id})" class="text-indigo-600 hover:text-indigo-900">View</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        showNotification('Gagal memuat data orders', 'error');
    }
}

async function viewOrder(id) {
    showNotification('Fitur view order akan segera hadir!');
}

// Payment management
async function loadPayments() {
    try {
        const payments = await fetchData('/payments');
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
                    <button onclick="viewPayment(${payment.id})" class="text-indigo-600 hover:text-indigo-900">View</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        showNotification('Gagal memuat data payments', 'error');
    }
}

async function viewPayment(id) {
    showNotification('Fitur view payment akan segera hadir!');
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    window.location.href = 'login.html';
} 