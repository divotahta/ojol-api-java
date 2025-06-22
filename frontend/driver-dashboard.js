// Konfigurasi API
const API_BASE_URL = 'http://localhost:8080/api';

// State management
let currentTab = 'current';
let driverId = null;
let currentStatus = 'available';

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadDriverStatus();
    loadStatistics();
    loadData();
});

// Check if user is authenticated and has driver role
function checkAuth() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userName = localStorage.getItem('userName');
    driverId = localStorage.getItem('userId');
    
    if (!token || role !== 'driver') {
        window.location.href = 'login.html';
        return;
    }
    
    // Display user name
    document.getElementById('userName').textContent = `Welcome, ${userName}`;
}

// Load driver status
async function loadDriverStatus() {
    try {
        const driver = await fetchData(`/drivers/${driverId}`);
        currentStatus = driver.status;
        updateStatusDisplay();
    } catch (error) {
        console.error('Error loading driver status:', error);
    }
}

// Update status display
function updateStatusDisplay() {
    const statusElement = document.getElementById('currentStatus');
    const toggleButton = document.getElementById('toggleStatus');
    
    if (currentStatus === 'available') {
        statusElement.className = 'px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800';
        statusElement.textContent = 'Available';
        toggleButton.textContent = 'Set Unavailable';
        toggleButton.className = 'bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600';
    } else {
        statusElement.className = 'px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800';
        statusElement.textContent = 'Unavailable';
        toggleButton.textContent = 'Set Available';
        toggleButton.className = 'bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600';
    }
}

// Toggle driver status
async function toggleStatus() {
    try {
        const newStatus = currentStatus === 'available' ? 'unavailable' : 'available';
        await fetchData(`/drivers/${driverId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status: newStatus })
        });
        
        currentStatus = newStatus;
        updateStatusDisplay();
        showNotification(`Status berhasil diubah menjadi ${newStatus}`);
        
        // Reload available orders if status changed to available
        if (newStatus === 'available') {
            loadAvailableOrders();
        }
    } catch (error) {
        showNotification('Gagal mengubah status', 'error');
    }
}

// Load statistics
async function loadStatistics() {
    try {
        const orders = await fetchData(`/orders/driver/${driverId}`);
        const payments = await fetchData(`/payments/driver/${driverId}`);
        
        const totalOrders = orders.length;
        const completedOrders = orders.filter(order => order.status === 'completed').length;
        const totalEarnings = payments
            .filter(payment => payment.status === 'paid')
            .reduce((sum, payment) => sum + (payment.amount * 0.8), 0); // 80% for driver, 20% commission
        
        document.getElementById('totalOrders').textContent = totalOrders;
        document.getElementById('completedOrders').textContent = completedOrders;
        document.getElementById('totalEarnings').textContent = `Rp ${totalEarnings.toLocaleString()}`;
        document.getElementById('averageRating').textContent = '4.5'; // Placeholder
        
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
        case 'current':
            loadCurrentOrder();
            break;
        case 'available':
            loadAvailableOrders();
            break;
        case 'history':
            loadOrderHistory();
            break;
        case 'earnings':
            loadEarningsHistory();
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

// Load current order
async function loadCurrentOrder() {
    try {
        const orders = await fetchData(`/orders/driver/${driverId}`);
        const currentOrder = orders.find(order => 
            order.status === 'assigned' || order.status === 'in_progress'
        );
        
        const container = document.getElementById('current-order');
        container.innerHTML = '';
        
        if (!currentOrder) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-gray-500">Tidak ada order aktif saat ini</p>
                    <p class="text-sm text-gray-400 mt-2">Pastikan status Anda "Available" untuk menerima order</p>
                </div>
            `;
            return;
        }
        
        const orderCard = document.createElement('div');
        orderCard.className = 'border rounded-lg p-6 bg-blue-50';
        orderCard.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-lg font-semibold">Order #${currentOrder.id}</h3>
                    <p class="text-sm text-gray-600">${new Date(currentOrder.createdAt).toLocaleString()}</p>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-semibold ${
                    currentOrder.status === 'assigned' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }">${currentOrder.status}</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <p class="text-sm font-medium text-gray-700">Asal:</p>
                    <p class="text-sm text-gray-900">${currentOrder.origin}</p>
                </div>
                <div>
                    <p class="text-sm font-medium text-gray-700">Tujuan:</p>
                    <p class="text-sm text-gray-900">${currentOrder.destination}</p>
                </div>
            </div>
            <div class="flex space-x-2">
                ${currentOrder.status === 'assigned' ? `
                    <button onclick="acceptOrder(${currentOrder.id})" class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
                        Accept Order
                    </button>
                    <button onclick="rejectOrder(${currentOrder.id})" class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
                        Reject Order
                    </button>
                ` : `
                    <button onclick="startTrip(${currentOrder.id})" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                        Start Trip
                    </button>
                    <button onclick="completeOrder(${currentOrder.id})" class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
                        Complete Order
                    </button>
                `}
            </div>
        `;
        container.appendChild(orderCard);
    } catch (error) {
        showNotification('Gagal memuat current order', 'error');
    }
}

// Load available orders
async function loadAvailableOrders() {
    try {
        const orders = await fetchData('/orders/available');
        const container = document.getElementById('available-orders');
        container.innerHTML = '';
        
        if (orders.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-gray-500">Tidak ada order yang tersedia saat ini</p>
                </div>
            `;
            return;
        }
        
        orders.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.className = 'border rounded-lg p-4 bg-gray-50';
            orderCard.innerHTML = `
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-lg font-semibold">Order #${order.id}</h3>
                        <p class="text-sm text-gray-600">${new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <span class="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">Available</span>
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
                <div class="flex space-x-2">
                    <button onclick="acceptOrder(${order.id})" class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
                        Accept Order
                    </button>
                </div>
            `;
            container.appendChild(orderCard);
        });
    } catch (error) {
        showNotification('Gagal memuat available orders', 'error');
    }
}

// Load order history
async function loadOrderHistory() {
    try {
        const orders = await fetchData(`/orders/driver/${driverId}`);
        const tbody = document.getElementById('history-table');
        tbody.innerHTML = '';
        
        orders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${order.id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Customer #${order.userId}</td>
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
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rp ${(order.amount * 0.8).toLocaleString()}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${new Date(order.createdAt).toLocaleDateString()}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        showNotification('Gagal memuat order history', 'error');
    }
}

// Load earnings history
async function loadEarningsHistory() {
    try {
        const payments = await fetchData(`/payments/driver/${driverId}`);
        const tbody = document.getElementById('earnings-table');
        tbody.innerHTML = '';
        
        payments.forEach(payment => {
            const commission = payment.amount * 0.2;
            const netEarnings = payment.amount * 0.8;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${payment.id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${payment.orderId}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Customer #${payment.userId}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rp ${payment.amount.toLocaleString()}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rp ${commission.toLocaleString()}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rp ${netEarnings.toLocaleString()}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${new Date(payment.createdAt).toLocaleDateString()}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        showNotification('Gagal memuat earnings history', 'error');
    }
}

// Accept order
async function acceptOrder(orderId) {
    try {
        await fetchData(`/orders/${orderId}/assign`, {
            method: 'PUT',
            body: JSON.stringify({ driverId: parseInt(driverId) })
        });
        showNotification('Order berhasil diterima!');
        loadCurrentOrder();
        loadAvailableOrders();
        loadStatistics();
    } catch (error) {
        showNotification('Gagal menerima order', 'error');
    }
}

// Reject order
async function rejectOrder(orderId) {
    if (confirm('Apakah Anda yakin ingin menolak order ini?')) {
        try {
            await fetchData(`/orders/${orderId}/reject`, { method: 'PUT' });
            showNotification('Order berhasil ditolak!');
            loadCurrentOrder();
            loadStatistics();
        } catch (error) {
            showNotification('Gagal menolak order', 'error');
        }
    }
}

// Start trip
async function startTrip(orderId) {
    try {
        await fetchData(`/orders/${orderId}/start`, { method: 'PUT' });
        showNotification('Trip berhasil dimulai!');
        loadCurrentOrder();
    } catch (error) {
        showNotification('Gagal memulai trip', 'error');
    }
}

// Complete order
async function completeOrder(orderId) {
    try {
        await fetchData(`/orders/${orderId}/complete`, { method: 'PUT' });
        showNotification('Order berhasil diselesaikan!');
        loadCurrentOrder();
        loadStatistics();
    } catch (error) {
        showNotification('Gagal menyelesaikan order', 'error');
    }
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