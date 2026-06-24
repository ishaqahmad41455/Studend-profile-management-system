// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const token = localStorage.getItem('token');

// Headers
const headers = {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
};

// API Helper Functions
const api = {
    async get(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: headers
            });
            return await response.json();
        } catch (error) {
            console.error('GET Error:', error);
            throw error;
        }
    },

    async post(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('POST Error:', error);
            throw error;
        }
    },

    async put(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('PUT Error:', error);
            throw error;
        }
    },

    async delete(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'DELETE',
                headers: headers
            });
            return await response.json();
        } catch (error) {
            console.error('DELETE Error:', error);
            throw error;
        }
    }
};

// Auth Functions
const auth = {
    isLoggedIn() {
        return !!localStorage.getItem('token');
    },

    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login.html';
    },

    checkAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = '/auth/login.html';
        }
    }
};

// Toast Notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Check authentication on protected pages (exclude public register/login pages)
(function() {
    const path = window.location.pathname || '';
    // Exempt the public registration page so students can register
    const isStudentRegister = path.endsWith('/student/register.html') || path.endsWith('/register.html');

    const needsAuth = path.includes('dashboard') ||
        path.includes('/admin/') ||
        path.includes('/teacher/') ||
        (path.includes('/student/') && !isStudentRegister);

    if (needsAuth) {
        auth.checkAuth();
    }
})();