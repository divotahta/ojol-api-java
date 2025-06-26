// Main application file for OjoL Frontend
class OjoLApp {
    constructor() {
        this.currentDashboard = null;
        this.init();
    }

    async init() {
        // Check authentication on page load
        if (auth.isAuthenticated()) {
            const isValid = await auth.validateToken();
            if (isValid) {
                this.showDashboard();
            } else {
                this.showLogin();
            }
        } else {
            this.showLogin();
        }

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Login form submission
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }
    }

    async handleLogin() {
        try {
            ui.showLoading();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            if (!email || !password) {
                ui.showError('Mohon isi email dan password');
                return;
            }

            await auth.login(email, password);
            ui.showToast('Login berhasil!');
            this.showDashboard();
        } catch (error) {
            console.error('Login error:', error);
            ui.showError('Email atau password salah');
        } finally {
            ui.hideLoading();
        }
    }

    handleLogout() {
        ui.showConfirmation('Apakah Anda yakin ingin logout?', () => {
            auth.logout();
            this.showLogin();
        });
    }

    showLogin() {
        // Hide dashboard sections
        document.getElementById('dashboard-sections').classList.add('hidden');
        document.getElementById('nav-links').classList.add('hidden');
        
        // Show login section
        document.getElementById('login-section').classList.remove('hidden');
    }

    showDashboard() {
        // Hide login section
        document.getElementById('login-section').classList.add('hidden');
        
        // Show navigation
        document.getElementById('nav-links').classList.remove('hidden');
        
        // Show dashboard sections
        document.getElementById('dashboard-sections').classList.remove('hidden');
        
        // Show appropriate dashboard based on user role
        const role = auth.getRole();
        
        // Hide all dashboards first
        document.getElementById('customer-dashboard').classList.add('hidden');
        document.getElementById('driver-dashboard').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.add('hidden');
        
        // Show appropriate dashboard
        if (role === CONFIG.ROLES.CUSTOMER) {
            document.getElementById('customer-dashboard').classList.remove('hidden');
            this.initializeCustomerDashboard();
        } else if (role === CONFIG.ROLES.DRIVER) {
            document.getElementById('driver-dashboard').classList.remove('hidden');
            this.initializeDriverDashboard();
        } else if (role === CONFIG.ROLES.ADMIN) {
            document.getElementById('admin-dashboard').classList.remove('hidden');
            this.initializeAdminDashboard();
        }
    }

    initializeCustomerDashboard() {
        // Destroy previous dashboard if exists
        if (this.currentDashboard && this.currentDashboard.destroy) {
            this.currentDashboard.destroy();
        }
        
        // Initialize customer dashboard
        this.currentDashboard = new CustomerDashboard();
    }

    initializeDriverDashboard() {
        // Destroy previous dashboard if exists
        if (this.currentDashboard && this.currentDashboard.destroy) {
            this.currentDashboard.destroy();
        }
        
        // Initialize driver dashboard
        this.currentDashboard = new DriverDashboard();
    }

    initializeAdminDashboard() {
        // Destroy previous dashboard if exists
        if (this.currentDashboard && this.currentDashboard.destroy) {
            this.currentDashboard.destroy();
        }
        
        // Initialize admin dashboard
        this.currentDashboard = new AdminDashboard();
    }

    // Utility functions
    showLoading() {
        ui.showLoading();
    }

    hideLoading() {
        ui.hideLoading();
    }

    showToast(message) {
        ui.showToast(message);
    }

    showError(message) {
        ui.showError(message);
    }

    // Navigation functions
    navigateToDashboard() {
        this.showDashboard();
    }

    // Error handling
    handleError(error) {
        console.error('Application error:', error);
        ui.showError('Terjadi kesalahan dalam aplikasi');
    }

    // Global error handler
    setupGlobalErrorHandler() {
        window.addEventListener('error', (event) => {
            this.handleError(event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason);
        });
    }

    // Initialize global error handling
    initErrorHandling() {
        this.setupGlobalErrorHandler();
    }

    // Application lifecycle
    start() {
        this.initErrorHandling();
        console.log('OjoL Application started');
    }

    stop() {
        if (this.currentDashboard && this.currentDashboard.destroy) {
            this.currentDashboard.destroy();
        }
        console.log('OjoL Application stopped');
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.ojolApp = new OjoLApp();
    window.ojolApp.start();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OjoLApp;
} 