// Register Page JavaScript
class RegisterPage {
    constructor() {
        this.selectedRole = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupRoleSelection();
    }

    setupEventListeners() {
        // Role selection
        document.getElementById('customer-role').addEventListener('click', () => this.selectRole('customer'));
        document.getElementById('driver-role').addEventListener('click', () => this.selectRole('driver'));

        // Form submissions
        document.getElementById('customer-form').addEventListener('submit', (e) => this.handleCustomerRegister(e));
        document.getElementById('driver-form').addEventListener('submit', (e) => this.handleDriverRegister(e));
    }

    setupRoleSelection() {
        // Add click handlers for role selection
        const customerRole = document.getElementById('customer-role');
        const driverRole = document.getElementById('driver-role');

        customerRole.addEventListener('click', () => {
            this.selectRole('customer');
        });

        driverRole.addEventListener('click', () => {
            this.selectRole('driver');
        });
    }

    selectRole(role) {
        this.selectedRole = role;
        
        // Update UI
        const customerRole = document.getElementById('customer-role');
        const driverRole = document.getElementById('driver-role');
        const customerForm = document.getElementById('customer-form');
        const driverForm = document.getElementById('driver-form');

        // Reset all selections
        customerRole.classList.remove('border-green-500', 'bg-green-50');
        driverRole.classList.remove('border-green-500', 'bg-green-50');
        customerForm.classList.add('hidden');
        driverForm.classList.add('hidden');

        // Select the chosen role
        if (role === 'customer') {
            customerRole.classList.add('border-green-500', 'bg-green-50');
            customerForm.classList.remove('hidden');
        } else if (role === 'driver') {
            driverRole.classList.add('border-green-500', 'bg-green-50');
            driverForm.classList.remove('hidden');
        }
    }

    async handleCustomerRegister(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        // Validation
        if (!this.validateCustomerData(data)) {
            return;
        }

        try {
            ui.showLoading();
            
            // Register customer using new endpoint
            const customerData = {
                name: data.name,
                email: data.email,
                password: data.password,
                phone: data.phone,
                address: data.address,
                gender: data.gender,
                dateOfBirth: data.dateOfBirth
            };

            console.log('Sending customer data:', customerData); // Debug log

            const response = await api.registerCustomer(customerData);
            
            if (response.success) {
                ui.showToast('Registrasi customer berhasil! Silakan login.');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            }
        } catch (error) {
            console.error('Error registering customer:', error);
            ui.showError('Gagal mendaftarkan customer. ' + (error.message || ''));
        } finally {
            ui.hideLoading();
        }
    }

    async handleDriverRegister(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        // Validation
        if (!this.validateDriverData(data)) {
            return;
        }

        try {
            ui.showLoading();
            
            // Register driver using new endpoint
            const driverData = {
                name: data.name,
                email: data.email,
                password: data.password,
                phone: data.phone,
                vehicleType: data.vehicleType,
                vehicleBrand: data.vehicleBrand,
                vehicleModel: data.vehicleModel,
                plateNumber: data.plateNumber
            };

            const response = await api.registerDriver(driverData);
            
            if (response.success) {
                ui.showToast('Registrasi driver berhasil! Silakan login.');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            }
        } catch (error) {
            console.error('Error registering driver:', error);
            ui.showError('Gagal mendaftarkan driver. ' + (error.message || ''));
        } finally {
            ui.hideLoading();
        }
    }

    validateCustomerData(data) {
        // Check required fields
        if (!data.name || !data.email || !data.password || !data.confirmPassword || 
            !data.phone || !data.dateOfBirth || !data.gender || !data.address) {
            ui.showError('Semua field harus diisi');
            return false;
        }

        // Check password confirmation
        if (data.password !== data.confirmPassword) {
            ui.showError('Konfirmasi password tidak cocok');
            return false;
        }

        // Check password length
        if (data.password.length < 6) {
            ui.showError('Password minimal 6 karakter');
            return false;
        }

        // Check email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            ui.showError('Format email tidak valid');
            return false;
        }

        // Check phone format
        const phoneRegex = /^[0-9]{10,13}$/;
        if (!phoneRegex.test(data.phone.replace(/\D/g, ''))) {
            ui.showError('Format nomor telepon tidak valid');
            return false;
        }

        return true;
    }

    validateDriverData(data) {
        // Check required fields
        if (!data.name || !data.email || !data.password || !data.confirmPassword || 
            !data.phone || !data.vehicleType || !data.vehicleBrand || 
            !data.vehicleModel || !data.plateNumber) {
            ui.showError('Semua field harus diisi');
            return false;
        }

        // Check password confirmation
        if (data.password !== data.confirmPassword) {
            ui.showError('Konfirmasi password tidak cocok');
            return false;
        }

        // Check password length
        if (data.password.length < 6) {
            ui.showError('Password minimal 6 karakter');
            return false;
        }

        // Check email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            ui.showError('Format email tidak valid');
            return false;
        }

        // Check phone format
        const phoneRegex = /^[0-9]{10,13}$/;
        if (!phoneRegex.test(data.phone.replace(/\D/g, ''))) {
            ui.showError('Format nomor telepon tidak valid');
            return false;
        }

        // Check plate number format
        const plateRegex = /^[A-Z]{1,2}\s[0-9]{1,4}\s[A-Z]{1,3}$/;
        if (!plateRegex.test(data.plateNumber.toUpperCase())) {
            ui.showError('Format nomor plat tidak valid (contoh: B 1234 ABC)');
            return false;
        }

        return true;
    }
}

// Initialize register page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.registerPage = new RegisterPage();
}); 