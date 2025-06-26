// Login handler for OjoL Frontend
class LoginHandler {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkExistingSession();
    }

    setupEventListeners() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
    }

    async checkExistingSession() {
        if (auth.isAuthenticated()) {
            const isValid = await auth.validateToken();
            if (isValid) {
                this.redirectToDashboard();
            } else {
                auth.logout();
            }
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
            
            // Redirect to appropriate dashboard
            setTimeout(() => {
                this.redirectToDashboard();
            }, 1000);
            
        } catch (error) {
            console.error('Login error:', error);
            ui.showError('Email atau password salah');
        } finally {
            ui.hideLoading();
        }
    }

    redirectToDashboard() {
        const role = auth.getRole();
        let dashboardUrl = '';

        switch (role) {
            case CONFIG.ROLES.CUSTOMER:
                dashboardUrl = 'customer-dashboard.html';
                break;
            case CONFIG.ROLES.DRIVER:
                dashboardUrl = 'driver-dashboard.html';
                break;
            case CONFIG.ROLES.ADMIN:
                dashboardUrl = 'admin-dashboard.html';
                break;
            default:
                ui.showError('Role tidak valid');
                return;
        }

        window.location.href = dashboardUrl;
    }
}

// Initialize login handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LoginHandler();
}); 