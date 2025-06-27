// UI utilities for OjoL Frontend
class UI {
    constructor() {
        this.toastTimeout = 3000;
        this.confirmationCallbacks = new Map();
    }

    // Loading indicators
    showLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.remove('hidden');
        }
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.add('hidden');
        }
    }

    // Toast notifications
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const errorToast = document.getElementById('error-toast');
        const toastMessage = document.getElementById('toast-message');
        const errorMessage = document.getElementById('error-message');

        if (type === 'error') {
            if (errorToast && errorMessage) {
                errorMessage.textContent = message;
                errorToast.classList.remove('hidden');
                
                setTimeout(() => {
                    errorToast.classList.add('hidden');
                }, this.toastTimeout);
            }
        } else {
            if (toast && toastMessage) {
                toastMessage.textContent = message;
                toast.classList.remove('hidden');
                
                setTimeout(() => {
                    toast.classList.add('hidden');
                }, this.toastTimeout);
            }
        }
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    // Confirmation dialogs
    showConfirmation(message, onConfirm, onCancel = null) {
        const confirmationId = Date.now().toString();
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.id = `confirmation-${confirmationId}`;
        
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md mx-4">
                <div class="flex items-center mb-4">
                    <div class="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                        <i class="fas fa-exclamation-triangle text-yellow-600"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-800">Konfirmasi</h3>
                </div>
                <p class="text-gray-600 mb-6">${message}</p>
                <div class="flex justify-end space-x-3">
                    <button id="cancel-${confirmationId}" 
                            class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                        Batal
                    </button>
                    <button id="confirm-${confirmationId}" 
                            class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                        Ya, Lanjutkan
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Store callbacks
        this.confirmationCallbacks.set(confirmationId, { onConfirm, onCancel });

        // Add event listeners
        document.getElementById(`confirm-${confirmationId}`).addEventListener('click', () => {
            this.hideConfirmation(confirmationId);
            if (onConfirm) onConfirm();
        });

        document.getElementById(`cancel-${confirmationId}`).addEventListener('click', () => {
            this.hideConfirmation(confirmationId);
            if (onCancel) onCancel();
        });

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideConfirmation(confirmationId);
                if (onCancel) onCancel();
            }
        });
    }

    hideConfirmation(confirmationId) {
        const modal = document.getElementById(`confirmation-${confirmationId}`);
        if (modal) {
            modal.remove();
            this.confirmationCallbacks.delete(confirmationId);
        }
    }

    // Form validation
    validateForm(formData, rules) {
        const errors = {};

        for (const [field, rule] of Object.entries(rules)) {
            const value = formData[field];
            
            if (rule.required && (!value || value.trim() === '')) {
                errors[field] = `${rule.label} wajib diisi`;
                continue;
            }

            if (value && rule.minLength && value.length < rule.minLength) {
                errors[field] = `${rule.label} minimal ${rule.minLength} karakter`;
                continue;
            }

            if (value && rule.maxLength && value.length > rule.maxLength) {
                errors[field] = `${rule.label} maksimal ${rule.maxLength} karakter`;
                continue;
            }

            if (value && rule.pattern && !rule.pattern.test(value)) {
                errors[field] = rule.message || `${rule.label} tidak valid`;
                continue;
            }

            if (value && rule.custom) {
                const customError = rule.custom(value, formData);
                if (customError) {
                    errors[field] = customError;
                }
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    showFormErrors(errors) {
        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        document.querySelectorAll('.border-red-500').forEach(el => {
            el.classList.remove('border-red-500');
            el.classList.add('border-gray-300');
        });

        // Show new errors
        for (const [field, message] of Object.entries(errors)) {
            const input = document.getElementById(field);
            if (input) {
                input.classList.remove('border-gray-300');
                input.classList.add('border-red-500');

                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message text-red-500 text-sm mt-1';
                errorDiv.textContent = message;
                input.parentNode.appendChild(errorDiv);
            }
        }
    }

    clearFormErrors() {
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        document.querySelectorAll('.border-red-500').forEach(el => {
            el.classList.remove('border-red-500');
            el.classList.add('border-gray-300');
        });
    }

    // Data formatting
    formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    formatRelativeTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) {
            return 'Baru saja';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} menit yang lalu`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} jam yang lalu`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} hari yang lalu`;
        }
    }

    // Status badges
    getStatusBadge(status, type = 'order') {
        const statusConfig = {
            order: {
                'pending': { color: 'yellow', text: 'Menunggu' },
                'accepted': { color: 'blue', text: 'Diterima' },
                'in_progress': { color: 'purple', text: 'Dalam Proses' },
                'completed': { color: 'green', text: 'Selesai' },
                'cancelled': { color: 'red', text: 'Dibatalkan' }
            },
            driver: {
                'available': { color: 'green', text: 'Available' },
                'unavailable': { color: 'red', text: 'Unavailable' },
                'busy': { color: 'yellow', text: 'Sibuk' }
            },
            payment: {
                'pending': { color: 'yellow', text: 'Menunggu' },
                'paid': { color: 'green', text: 'Selesai' },
                'failed': { color: 'red', text: 'Gagal' }
            }
        };

        const config = statusConfig[type]?.[status] || { color: 'gray', text: status };
        
        return `
            <span class="px-2 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800">
                ${config.text}
            </span>
        `;
    }

    getRoleBadge(role) {
        const roleConfig = {
            'admin': { color: 'red', text: 'Admin' },
            'customer': { color: 'blue', text: 'Customer' },
            'driver': { color: 'green', text: 'Driver' }
        };

        const config = roleConfig[role] || { color: 'gray', text: role };
        
        return `
            <span class="px-2 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800">
                ${config.text}
            </span>
        `;
    }

    // Empty states
    createEmptyState(message, icon = 'fas fa-inbox') {
        return `
            <div class="text-center py-8 text-gray-500">
                <i class="${icon} text-4xl mb-4"></i>
                <p>${message}</p>
            </div>
        `;
    }

    // Order cards
    createOrderCard(order) {
        const statusBadge = this.getStatusBadge(order.status, 'order');
        const formattedDate = this.formatDate(order.createdAt);
        const formattedPrice = this.formatCurrency(order.fare || 0);

        return `
            <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <h3 class="font-semibold text-gray-800">Order #${order.id}</h3>
                        <p class="text-sm text-gray-600">${formattedDate}</p>
                    </div>
                    ${statusBadge}
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
                        <i class="fas fa-money-bill text-blue-500"></i>
                        <span>${formattedPrice}</span>
                    </div>
                </div>
                ${order.driver ? `
                    <div class="mt-3 pt-3 border-t border-gray-100">
                        <p class="text-sm text-gray-600">Driver: ${order.driver.name}</p>
                        <p class="text-sm text-gray-600">Phone: ${order.driver.phone}</p>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // Modal utilities
    showModal(content, options = {}) {
        const modalId = `modal-${Date.now()}`;
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.id = modalId;
        
        modal.innerHTML = `
            <div class="bg-white rounded-lg max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                <div class="p-6">
                    ${content}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideModal(modalId);
            }
        });

        // Close on escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                this.hideModal(modalId);
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);

        return modalId;
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.remove();
        }
    }

    // Table utilities
    createTable(headers, data, options = {}) {
        const tableClass = options.className || 'min-w-full divide-y divide-gray-200';
        const rowClass = options.rowClass || 'hover:bg-gray-50';
        
        let tableHTML = `
            <table class="${tableClass}">
                <thead class="bg-gray-50">
                    <tr>
        `;

        headers.forEach(header => {
            tableHTML += `
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ${header.label}
                </th>
            `;
        });

        tableHTML += `
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
        `;

        data.forEach(row => {
            tableHTML += `<tr class="${rowClass}">`;
            headers.forEach(header => {
                const value = header.render ? header.render(row[header.key], row) : row[header.key];
                tableHTML += `
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${value}
                    </td>
                `;
            });
            tableHTML += '</tr>';
        });

        tableHTML += `
                </tbody>
            </table>
        `;

        return tableHTML;
    }

    // Pagination
    createPagination(currentPage, totalPages, onPageChange) {
        if (totalPages <= 1) return '';

        let paginationHTML = `
            <div class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                <div class="flex justify-between flex-1 sm:hidden">
        `;

        if (currentPage > 1) {
            paginationHTML += `
                <button onclick="ui.goToPage(${currentPage - 1})" 
                        class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                    Sebelumnya
                </button>
            `;
        }

        if (currentPage < totalPages) {
            paginationHTML += `
                <button onclick="ui.goToPage(${currentPage + 1})" 
                        class="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                    Selanjutnya
                </button>
            `;
        }

        paginationHTML += `
                </div>
                <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p class="text-sm text-gray-700">
                            Menampilkan halaman <span class="font-medium">${currentPage}</span> dari <span class="font-medium">${totalPages}</span>
                        </p>
                    </div>
                    <div>
                        <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
        `;

        // Previous button
        if (currentPage > 1) {
            paginationHTML += `
                <button onclick="ui.goToPage(${currentPage - 1})" 
                        class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <i class="fas fa-chevron-left"></i>
                </button>
            `;
        }

        // Page numbers
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            const isActive = i === currentPage;
            paginationHTML += `
                <button onclick="ui.goToPage(${i})" 
                        class="relative inline-flex items-center px-4 py-2 border text-sm font-medium ${isActive ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}">
                    ${i}
                </button>
            `;
        }

        // Next button
        if (currentPage < totalPages) {
            paginationHTML += `
                <button onclick="ui.goToPage(${currentPage + 1})" 
                        class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <i class="fas fa-chevron-right"></i>
                </button>
            `;
        }

        paginationHTML += `
                        </nav>
                    </div>
                </div>
            </div>
        `;

        return paginationHTML;
    }

    goToPage(page) {
        // This should be implemented by the specific component that uses pagination
        console.log('Navigate to page:', page);
    }
}

// Create global UI instance
const ui = new UI();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UI;
} 