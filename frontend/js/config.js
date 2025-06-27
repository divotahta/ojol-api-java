// Configuration file for OjoL Frontend
const CONFIG = {
    // API Configuration
    API: {
        BASE_URL: 'http://localhost:8080/api',
        TIMEOUT: 10000
    },
    
    // Service Endpoints
    ENDPOINTS: {
        // Auth Service
        AUTH: {
            LOGIN: '/auth/login',
            VALIDATE: '/auth/validate'
        },
        
        // User Service
        USERS: {
            BASE: '/users',
            CUSTOMERS: '/users/customers',
            NOTIFICATIONS: '/users/notifications'
        },
        
        // Driver Service
        DRIVERS: {
            BASE: '/drivers',
            STATUS: '/drivers/status',
            AVAILABLE: '/drivers/available',
            ORDERS: '/drivers/orders'
        },
        
        // Order Service
        ORDERS: {
            BASE: '/orders',
            USER: '/orders/user',
            DRIVER: '/orders/driver',
            STATUS: '/orders/status',
            WAITING: '/orders/waiting'
        },
        
        // Payment Service
        PAYMENTS: {
            BASE: '/payments',
            ORDER: '/payments/order',
            USER: '/payments/user',
            PROCESS: '/payments/process'
        }
    },
    
    // Order Status
    ORDER_STATUS: {
        PENDING: 'pending',
        ACCEPTED: 'accepted',
        IN_PROGRESS: 'in_progress',
        COMPLETED: 'completed',
        CANCELLED: 'cancelled'
    },
    
    // Driver Status
    DRIVER_STATUS: {
        ONLINE: 'available',
        OFFLINE: 'unavailable',
        BUSY: 'busy'
    },
    
    // Payment Status
    PAYMENT_STATUS: {
        PENDING: 'pending',
        PROCESSING: 'processing',
        COMPLETED: 'completed',
        FAILED: 'failed'
    },
    
    // User Roles
    ROLES: {
        ADMIN: 'admin',
        CUSTOMER: 'customer',
        DRIVER: 'driver'
    },
    
    // UI Configuration
    UI: {
        TOAST_DURATION: 3000,
        REFRESH_INTERVAL: 5000,
        MAP_ZOOM: 15
    },
    
    // Default Coordinates (Jakarta)
    DEFAULT_LOCATION: {
        lat: -6.2088,
        lng: 106.8456
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} 