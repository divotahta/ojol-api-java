// Konfigurasi API
const API_BASE_URL = 'http://localhost:8080/api';

// DOM elements
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const loginButtonText = document.getElementById('loginButtonText');
const loadingSpinner = document.getElementById('loadingSpinner');

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (token && role) {
        // Validate token
        validateToken(token).then(isValid => {
            if (isValid) {
                redirectToDashboard(role);
            } else {
                // Clear invalid token
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                localStorage.removeItem('userId');
                localStorage.removeItem('userName');
            }
        });
    }
});

// Login form submission
loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    if (!email || !password) {
        showError('Mohon isi email dan password');
        return;
    }
    
    setLoading(true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Store user data
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('userName', data.name);
            localStorage.setItem('userEmail', data.email);
            
            // Redirect to appropriate dashboard
            redirectToDashboard(data.role);
            
        } else {
            const errorData = await response.json();
            showError('Email atau password salah');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        showError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
        setLoading(false);
    }
});

// Validate token
async function validateToken(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/validate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.valid;
        }
        
        return false;
    } catch (error) {
        console.error('Token validation error:', error);
        return false;
    }
}

// Redirect to appropriate dashboard
function redirectToDashboard(role) {
    switch (role) {
        case 'admin':
            window.location.href = 'admin-dashboard.html';
            break;
        case 'user':
            window.location.href = 'customer-dashboard.html';
            break;
        case 'driver':
            window.location.href = 'driver-dashboard.html';
            break;
        default:
            showError('Role tidak valid');
    }
}

// Fill demo account
function fillDemoAccount(email, password) {
    emailInput.value = email;
    passwordInput.value = password;
    hideError();
}

// Show error message
function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.remove('hidden');
}

// Hide error message
function hideError() {
    errorMessage.classList.add('hidden');
}

// Set loading state
function setLoading(loading) {
    if (loading) {
        loginButtonText.classList.add('hidden');
        loadingSpinner.classList.remove('hidden');
        loginForm.querySelector('button').disabled = true;
    } else {
        loginButtonText.classList.remove('hidden');
        loadingSpinner.classList.add('hidden');
        loginForm.querySelector('button').disabled = false;
    }
} 