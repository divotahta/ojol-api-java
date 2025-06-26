// Authentication utilities for OjoL Frontend
class AuthManager {
    constructor() {
        this.token = localStorage.getItem('ojol_token');
        this.user = JSON.parse(localStorage.getItem('ojol_user') || '{}');
        this.role = localStorage.getItem('ojol_role');
        this.userId = localStorage.getItem('ojol_userId');
    }

    // Login user
    async login(email, password) {
        try {
            const response = await fetch(`${CONFIG.API.BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const data = await response.json();
            
            // Store authentication data
            this.token = data.token;
            this.user = {
                id: data.userId,
                name: data.name,
                email: data.email
            };
            this.role = data.role;
            this.userId = data.userId;

            // Save to localStorage
            localStorage.setItem('ojol_token', this.token);
            localStorage.setItem('ojol_user', JSON.stringify(this.user));
            localStorage.setItem('ojol_role', this.role);
            localStorage.setItem('ojol_userId', this.userId);

            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    // Validate token
    async validateToken() {
        if (!this.token) {
            return false;
        }

        try {
            const response = await fetch(`${CONFIG.API.BASE_URL}/auth/validate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) {
                this.logout();
                return false;
            }

            const data = await response.json();
            return data.valid;
        } catch (error) {
            console.error('Token validation error:', error);
            this.logout();
            return false;
        }
    }

    // Logout user
    logout() {
        this.token = null;
        this.user = {};
        this.role = null;
        this.userId = null;

        localStorage.removeItem('ojol_token');
        localStorage.removeItem('ojol_user');
        localStorage.removeItem('ojol_role');
        localStorage.removeItem('ojol_userId');

        // Redirect to login
        window.location.href = 'index.html';
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.token;
    }

    // Get current user role
    getRole() {
        return this.role;
    }

    // Get current user ID
    getUserId() {
        return this.userId;
    }

    // Get current user data
    getUser() {
        return this.user;
    }

    // Get current token
    getToken() {
        return this.token;
    }

    // Get authorization header
    getAuthHeader() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }

    // Check if user has specific role
    hasRole(role) {
        return this.role === role;
    }

    // Check if user is admin
    isAdmin() {
        return this.hasRole(CONFIG.ROLES.ADMIN);
    }

    // Check if user is customer
    isCustomer() {
        return this.hasRole(CONFIG.ROLES.CUSTOMER);
    }

    // Check if user is driver
    isDriver() {
        return this.hasRole(CONFIG.ROLES.DRIVER);
    }
}

// Create global auth instance
const auth = new AuthManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
} 