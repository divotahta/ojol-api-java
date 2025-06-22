// Konfigurasi API
const API_BASE_URL = 'http://localhost:8080/api';

// State management
let currentTab = 'active';
let userId = null;

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadStatistics();
    loadData();
});

// Check if user is authenticated and has user role
function checkAuth() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userName = localStorage.getItem('userName');
    userId = localStorage.getItem('userId');
    
    if (!token || role !== 'user') {
        window.location.href = 'login.html';
        return;
    }
    
    // Display user name
    document.getElementById('userName').textContent = `Welcome, ${userName}`;
}

// Load statistics
async function loadStatistics() {
    try {
        const orders = await fetchData(`/orders/user/${userId}`);
        const payments = await fetchData(`/payments/user/${userId}`);
        
        const totalOrders = orders.length;
        const completedOrders = orders.filter(order => order.status === 'completed').length;
        const totalSpent = payments
            .filter(payment => payment.status === 'paid')
            .reduce((sum, payment) => sum + payment.amount, 0);
        
        document.getElementById('totalOrders').textContent = totalOrders;
        document.getElementById('completedOrders').textContent = completedOrders;
        document.getElementById('totalSpent').textContent = `Rp ${totalSpent.toLocaleString()}`;
        
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
        case 'active':
            loadActiveOrders();
            break;
        case 'history':
            loadOrderHistory();
            break;
        case 'payments':
            loadPaymentHistory();
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

// Create new order
async function createOrder() {
    const origin = document.getElementById('origin').value.trim();
    const destination = document.getElementById('destination').value.trim();
    
    if (!origin || !destination) {
        showNotification('Mohon isi lokasi asal dan tujuan', 'error');
        return;
    }
    
    try {
        const orderData = {
            userId: parseInt(userId),
            origin: origin,
            destination: destination,
            status: 'pending'
        };
        
        await fetchData('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
        
        showNotification('Order berhasil dibuat!');
        document.getElementById('origin').value = '';
        document.getElementById('destination').value = '';
        
        loadActiveOrders();
        loadStatistics();
    } catch (error) {
        showNotification('Gagal membuat order', 'error');
    }
}

// Load active orders
async function loadActiveOrders() {
    try {
        const orders = await fetchData(`/orders/user/${userId}`);
        const activeOrders = orders.filter(order => 
            order.status === 'pending' || order.status === 'assigned' || order.status === 'in_progress'
        );
        
        const container = document.getElementById('active-orders');
        container.innerHTML = '';
        
        if (activeOrders.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-gray-500">Tidak ada order aktif saat ini</p>
                </div>
            `;
            return;
        }
        
        activeOrders.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.className = 'border rounded-lg p-4 bg-gray-50';
            orderCard.innerHTML = `
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-lg font-semibold">Order #${order.id}</h3>
                        <p class="text-sm text-gray-600">${new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <span class="px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                    }">${order.status}</span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <p class="text-sm font-medium text-gray-700">Asal:</p>
                        <p class="text-sm text-gray-900">${order.origin}</p>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-gray-700">Tujuan:</p>
                        <p class="text-sm text-gray-900">${order.destination}</p>
                    </div>
                </div>
                ${order.driverId ? `
                    <div class="mb-4 p-3 bg-blue-50 rounded-lg">
                        <p class="text-sm font-medium text-blue-700">Driver Assigned:</p>
                        <p class="text-sm text-blue-900">Driver ID: ${order.driverId}</p>
                    </div>
                ` : ''}
                <div class="flex space-x-2">
                    <button onclick="cancelOrder(${order.id})" class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 text-sm">
                        Cancel Order
                    </button>
                    ${order.status === 'completed' ? `
                        <button onclick="rateOrder(${order.id})" class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 text-sm">
                            Rate Order
                        </button>
                    ` : ''}
                </div>
            `;
            container.appendChild(orderCard);
        });
    } catch (error) {
        showNotification('Gagal memuat active orders', 'error');
    }
}

// Load order history
async function loadOrderHistory() {
    try {
        const orders = await fetchData(`/orders/user/${userId}`);
        const tbody = document.getElementById('history-table');
        tbody.innerHTML = '';
        
        orders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${order.id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${order.origin}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${order.destination}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                    }">${order.status}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${new Date(order.createdAt).toLocaleDateString()}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="viewOrderDetails(${order.id})" class="text-indigo-600 hover:text-indigo-900">View</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        showNotification('Gagal memuat order history', 'error');
    }
}

// Load payment history
async function loadPaymentHistory() {
    try {
        const payments = await fetchData(`/payments/user/${userId}`);
        const tbody = document.getElementById('payments-table');
        tbody.innerHTML = '';
        
        payments.forEach(payment => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${payment.id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${payment.orderId}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rp ${payment.amount.toLocaleString()}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${payment.method}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        payment.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }">${payment.status}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${new Date(payment.createdAt).toLocaleDateString()}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        showNotification('Gagal memuat payment history', 'error');
    }
}

// Cancel order
async function cancelOrder(orderId) {
    if (confirm('Apakah Anda yakin ingin membatalkan order ini?')) {
        try {
            await fetchData(`/orders/${orderId}/cancel`, { method: 'PUT' });
            showNotification('Order berhasil dibatalkan!');
            loadActiveOrders();
            loadStatistics();
        } catch (error) {
            showNotification('Gagal membatalkan order', 'error');
        }
    }
}

// Rate order
function rateOrder(orderId) {
    const rating = prompt('Berikan rating (1-5):');
    if (rating && rating >= 1 && rating <= 5) {
        // Implementation for rating
        showNotification('Rating berhasil disimpan!');
    }
}

// View order details
function viewOrderDetails(orderId) {
    showNotification('Fitur view order details akan segera hadir!');
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