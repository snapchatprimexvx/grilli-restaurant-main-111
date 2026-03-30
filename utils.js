/**
 * Utility functions for the Grilli Restaurant frontend
 */

// Error handling utilities
class ErrorHandler {
    static showError(message, duration = 5000) {
        // Create or get error toast container
        let container = document.getElementById('error-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'error-toast-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                max-width: 400px;
            `;
            document.body.appendChild(container);
        }

        // Create error toast
        const toast = document.createElement('div');
        toast.className = 'error-toast';
        toast.style.cssText = `
            background: #dc3545;
            color: white;
            padding: 12px 20px;
            margin-bottom: 10px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 14px;
            line-height: 1.4;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        toast.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: none;
                    border: none;
                    color: white;
                    font-size: 18px;
                    cursor: pointer;
                    margin-left: 10px;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">&times;</button>
            </div>
        `;

        container.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                this.removeToast(toast);
            }, duration);
        }

        return toast;
    }

    static showSuccess(message, duration = 3000) {
        // Create or get success toast container
        let container = document.getElementById('success-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'success-toast-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                max-width: 400px;
            `;
            document.body.appendChild(container);
        }

        // Create success toast
        const toast = document.createElement('div');
        toast.className = 'success-toast';
        toast.style.cssText = `
            background: #28a745;
            color: white;
            padding: 12px 20px;
            margin-bottom: 10px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 14px;
            line-height: 1.4;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        toast.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: none;
                    border: none;
                    color: white;
                    font-size: 18px;
                    cursor: pointer;
                    margin-left: 10px;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">&times;</button>
            </div>
        `;

        container.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                this.removeToast(toast);
            }, duration);
        }

        return toast;
    }

    static removeToast(toast) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentElement) {
                toast.parentElement.removeChild(toast);
            }
        }, 300);
    }

    static handleApiError(error, customMessage = null) {
        console.error('API Error:', error);
        
        const message = customMessage || error.message || 'An unexpected error occurred';
        this.showError(message);

        // Handle authentication errors by redirecting to login
        if (error.message && error.message.includes('Authentication failed')) {
            setTimeout(() => {
                // You might want to redirect to login page or show login modal
                console.log('Authentication failed - consider redirecting to login');
            }, 1000);
        }
    }
}

// Loading indicator utilities
class LoadingHandler {
    static show(message = 'Loading...') {
        // Remove existing loader
        this.hide();
        
        const loader = document.createElement('div');
        loader.id = 'global-loader';
        loader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        `;
        
        loader.innerHTML = `
            <div style="
                background: white;
                padding: 20px 30px;
                border-radius: 8px;
                text-align: center;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            ">
                <div style="
                    width: 40px;
                    height: 40px;
                    border: 3px solid #f3f3f3;
                    border-top: 3px solid #667eea;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 15px;
                "></div>
                <p style="margin: 0; color: #333; font-size: 14px;">${message}</p>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        
        document.body.appendChild(loader);
        return loader;
    }

    static hide() {
        const loader = document.getElementById('global-loader');
        if (loader) {
            loader.remove();
        }
    }
}

// Form validation utilities
class FormValidator {
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static validatePhone(phone) {
        const re = /^[\+]?[1-9][\d]{0,15}$/;
        return re.test(phone.replace(/\s/g, ''));
    }

    static validatePassword(password) {
        return password && password.length >= 6;
    }

    static validateRequired(value) {
        return value && value.trim().length > 0;
    }

    static showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        // Remove existing error
        this.clearFieldError(fieldId);

        // Add error class to field
        field.classList.add('is-invalid');

        // Create error message
        const error = document.createElement('div');
        error.className = 'invalid-feedback';
        error.style.display = 'block';
        error.textContent = message;
        
        field.parentNode.appendChild(error);
    }

    static clearFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        field.classList.remove('is-invalid');
        
        const existingError = field.parentNode.querySelector('.invalid-feedback');
        if (existingError) {
            existingError.remove();
        }
    }

    static clearAllErrors(formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        const fields = form.querySelectorAll('.is-invalid');
        fields.forEach(field => {
            field.classList.remove('is-invalid');
        });

        const errors = form.querySelectorAll('.invalid-feedback');
        errors.forEach(error => error.remove());
    }
}

// Date and time utilities
class DateUtils {
    static formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString();
    }

    static formatDateTime(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleString();
    }

    static formatTime(time) {
        if (!time) return '';
        return time;
    }

    static isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }

    static isFutureDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        return date > now;
    }
}

// Make utilities available globally
window.ErrorHandler = ErrorHandler;
window.LoadingHandler = LoadingHandler;
window.FormValidator = FormValidator;
window.DateUtils = DateUtils;
