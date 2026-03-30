/**
 * API Client for Grilli Restaurant
 * Handles all communication with the backend API
 */

class GrilliAPI {
    constructor() {
        // Use localhost for better compatibility
        this.baseURL = 'http://localhost:3000/api';
        this.token = localStorage.getItem('grilli_token');
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        localStorage.setItem('grilli_token', token);
    }

    // Clear authentication token
    clearToken() {
        this.token = null;
        localStorage.removeItem('grilli_token');
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.token;
    }

    // Check server health
    async checkHealth() {
        try {
            const response = await fetch(`${this.baseURL.replace('/api', '')}/health`);
            return response.ok;
        } catch (error) {
            console.error('Health check failed:', error);
            return false;
        }
    }

    // Retry mechanism for failed requests
    async requestWithRetry(endpoint, options = {}, maxRetries = 3) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await this.request(endpoint, options);
            } catch (error) {
                lastError = error;
                
                // Don't retry for client errors (4xx)
                if (error.message.includes('Authentication failed') || 
                    error.message.includes('Access denied') || 
                    error.message.includes('Resource not found')) {
                    throw error;
                }
                
                // Wait before retrying (exponential backoff)
                if (attempt < maxRetries) {
                    const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
                    await new Promise(resolve => setTimeout(resolve, delay));
                    console.log(`Retrying request (attempt ${attempt + 1}/${maxRetries}) after ${delay}ms...`);
                }
            }
        }
        
        throw lastError;
    }

    // Make HTTP request
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Add authorization header if token exists
        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            
            // Handle network errors
            if (!response) {
                throw new Error('Network error - no response received');
            }

            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                console.error('Failed to parse response as JSON:', parseError);
                throw new Error('Invalid server response format');
            }

            // Handle HTTP errors
            if (!response.ok) {
                // Handle specific error cases
                if (response.status === 401) {
                    this.clearToken();
                    throw new Error(data.message || 'Authentication failed. Please log in again.');
                } else if (response.status === 403) {
                    throw new Error(data.message || 'Access denied. Insufficient permissions.');
                } else if (response.status === 404) {
                    throw new Error(data.message || 'Resource not found.');
                } else if (response.status === 429) {
                    throw new Error('Too many requests. Please try again later.');
                } else if (response.status >= 500) {
                    throw new Error('Server error. Please try again later.');
                }
                
                throw new Error(data.message || `Request failed with status ${response.status}`);
            }

            return data;
        } catch (error) {
            // Handle fetch errors (network issues, CORS, etc.)
            if (error instanceof TypeError && error.message.includes('fetch')) {
                console.error('Network connection error:', error);
                throw new Error('Unable to connect to server. Please check your internet connection.');
            }
            
            console.error('API Request Error:', {
                endpoint,
                error: error.message,
                stack: error.stack
            });
            
            throw error;
        }
    }

    // Authentication methods
    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async login(email, password) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (response.success && response.data.token) {
            this.setToken(response.data.token);
        }

        return response;
    }

    async getProfile() {
        return this.request('/auth/profile');
    }

    async updateProfile(profileData) {
        return this.request('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    // Admin authentication methods
    async adminLogin(email, password) {
        const response = await this.request('/auth/admin/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (response.success && response.data.token) {
            this.setToken(response.data.token);
        }

        return response;
    }

    async getAdminProfile() {
        return this.request('/auth/admin/profile');
    }

    // Demo Menu methods (for when database is not available)
    async getDemoMenu() {
        return this.request('/menu/demo');
    }

    // Demo Order methods (for when database is not available)
    async placeDemoOrder(orderData) {
        return this.request('/orders/demo', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }

    async getDemoOrdersAdmin() {
        return this.request('/orders/demo/admin');
    }

    async updateDemoOrderStatus(orderId, status) {
        return this.request(`/orders/demo/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    // Feedback methods
    async submitFeedback(feedbackData) {
        return this.request('/feedback/submit', {
            method: 'POST',
            body: JSON.stringify(feedbackData)
        });
    }

    async getPublicFeedback(page = 1, limit = 10) {
        return this.request(`/feedback/public?page=${page}&limit=${limit}`);
    }

    // Admin feedback methods
    async getAdminFeedback(page = 1, limit = 20, status = 'all', sort = 'newest') {
        return this.request(`/feedback/admin?page=${page}&limit=${limit}&status=${status}&sort=${sort}`);
    }

    async updateFeedbackApproval(feedbackId, isApproved) {
        return this.request(`/feedback/admin/${feedbackId}/approve`, {
            method: 'PUT',
            body: JSON.stringify({ isApproved })
        });
    }

    async deleteFeedback(feedbackId) {
        return this.request(`/feedback/admin/${feedbackId}`, {
            method: 'DELETE'
        });
    }

    async getFeedbackStatistics() {
        return this.request('/feedback/admin/statistics');
    }

    // Order methods
    async createOrder(orderData) {
        return this.request('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }

    async getUserOrders() {
        return this.request('/orders');
    }

    async getOrderDetails(orderId) {
        return this.request(`/orders/${orderId}`);
    }

    // Admin order methods
    async getAllOrders() {
        return this.request('/orders/admin/all');
    }

    async updateOrderStatus(orderId, status) {
        return this.request(`/orders/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    async getOrderStatistics() {
        return this.request('/orders/admin/statistics');
    }

    // Menu methods
    async getMenu() {
        return this.request('/menu');
    }

    async getCategories() {
        return this.request('/menu/categories');
    }

    // Admin menu methods
    async getAllMenuItems() {
        return this.request('/menu/admin/all');
    }

    async createMenuItem(menuData) {
        return this.request('/menu', {
            method: 'POST',
            body: JSON.stringify(menuData)
        });
    }

    async updateMenuItem(menuId, menuData) {
        return this.request(`/menu/${menuId}`, {
            method: 'PUT',
            body: JSON.stringify(menuData)
        });
    }

    async deleteMenuItem(menuId) {
        return this.request(`/menu/${menuId}`, {
            method: 'DELETE'
        });
    }

    async updateMenuItemAvailability(menuId, isAvailable) {
        return this.request(`/menu/${menuId}/availability`, {
            method: 'PUT',
            body: JSON.stringify({ is_available: isAvailable })
        });
    }

    // Reservations methods
    async createReservation(reservationData) {
        return this.request('/reservations', {
            method: 'POST',
            body: JSON.stringify(reservationData)
        });
    }

    async getUserReservations() {
        return this.request('/reservations');
    }

    async getAllReservations() {
        return this.request('/reservations/admin/all');
    }

    async updateReservationStatus(reservationId, status) {
        return this.request(`/reservations/${reservationId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }
}

// Create global API instance
window.grilliAPI = new GrilliAPI();

// Add test function for debugging
window.testGrilliApp = () => {
  console.log('=== Grilli App Test ===');
  console.log('grilliAPI exists:', !!window.grilliAPI);
  console.log('API base URL:', window.grilliAPI?.baseURL);
  console.log('Menu cards found:', document.querySelectorAll('.menu-card').length);
  console.log('Cart items:', window.cart?.length || 0);
  console.log('Is logged in:', window.isLoggedIn);
  
  // Test API connection
  if (window.grilliAPI) {
    window.grilliAPI.checkHealth().then(healthy => {
      console.log('Backend API health:', healthy ? 'OK' : 'Failed');
    }).catch(err => {
      console.log('Backend API error:', err.message);
    });
  }
  
  // Test notification
  if (typeof showNotification === 'function') {
    showNotification('Test notification - everything is working!', 'success');
  } else {
    console.error('showNotification function not found');
  }
};
