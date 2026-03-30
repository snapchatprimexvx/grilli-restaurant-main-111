'use strict';

// Global variables
let currentMenuItem = null;
let orderItem = null;
let cart = [];
let cartTotal = 0;

// Menu Item Details Functions
window.showMenuItemDetails = async function(menuId) {
    try {
        console.log('Fetching details for menu item ID:', menuId);
        
        // Show loading state
        const modal = document.getElementById('menuItemModal');
        if (!modal) {
            console.error('Menu modal not found');
            return;
        }
        modal.style.display = 'flex';
        
        // Fetch menu item details from API
        const response = await fetch(`http://localhost:3000/api/menu/${menuId}`);
        const data = await response.json();
        
        if (data.success && data.menuItem) {
            currentMenuItem = data.menuItem;
            populateModal(data.menuItem);
        } else {
            console.error('Failed to fetch menu item details:', data.message);
            alert('Failed to load menu item details');
            closeMenuItemModal();
        }
    } catch (error) {
        console.error('Error fetching menu item details:', error);
        alert('Error loading menu item details. Please check your connection.');
        closeMenuItemModal();
    }
};

// Populate modal with menu item data
function populateModal(item) {
    try {
        document.getElementById('modalItemImage').src = item.image_url || './assets/images/menu-1.png';
        document.getElementById('modalItemImage').alt = item.name;
        document.getElementById('modalItemName').textContent = item.name;
        document.getElementById('modalItemCategory').textContent = item.category_name || 'Unknown';
        document.getElementById('modalItemPrice').textContent = `$${parseFloat(item.price).toFixed(2)}`;
        document.getElementById('modalItemDescription').textContent = item.description || 'No description available';
        document.getElementById('modalItemPrepTime').textContent = `${item.preparation_time || 15} minutes`;
        document.getElementById('modalItemSpiceLevel').textContent = item.spice_level || 'Mild';
        document.getElementById('modalItemVegetarian').textContent = item.is_vegetarian ? 'Yes' : 'No';
    } catch (error) {
        console.error('Error populating modal:', error);
    }
}

// Close menu item modal
window.closeMenuItemModal = function() {
    try {
        const modal = document.getElementById('menuItemModal');
        if (modal) {
            modal.style.display = 'none';
        }
        currentMenuItem = null;
    } catch (error) {
        console.error('Error closing modal:', error);
    }
};

// Add to cart from modal
window.addToCartFromModal = function() {
    try {
        if (currentMenuItem) {
            // Simple add to cart functionality
            alert(`${currentMenuItem.name} added to cart!`);
            console.log('Added to cart:', currentMenuItem);
        } else {
            alert('No item selected');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
    }
};

// Show order form
window.showOrderForm = function() {
    try {
        if (currentMenuItem) {
            orderItem = currentMenuItem;
            populateOrderForm(currentMenuItem);
            closeMenuItemModal();
            
            const orderModal = document.getElementById('orderFormModal');
            if (orderModal) {
                orderModal.style.display = 'flex';
            }
        } else {
            alert('No item selected for order');
        }
    } catch (error) {
        console.error('Error showing order form:', error);
    }
};

// Populate order form with item data
function populateOrderForm(item) {
    try {
        document.getElementById('orderItemImage').src = item.image_url || './assets/images/menu-1.png';
        document.getElementById('orderItemImage').alt = item.name;
        document.getElementById('orderItemName').textContent = item.name;
        document.getElementById('orderItemDescription').textContent = item.description || 'No description available';
        document.getElementById('orderItemPrice').textContent = `$${parseFloat(item.price).toFixed(2)}`;
        
        // Update price displays
        updateOrderTotal();
        
        // Add event listener for quantity change
        const quantitySelect = document.getElementById('quantity');
        if (quantitySelect) {
            quantitySelect.addEventListener('change', updateOrderTotal);
        }
    } catch (error) {
        console.error('Error populating order form:', error);
    }
}

// Update order total when quantity changes
function updateOrderTotal() {
    try {
        if (!orderItem) return;
        
        const quantitySelect = document.getElementById('quantity');
        const quantity = quantitySelect ? parseInt(quantitySelect.value) : 1;
        const price = parseFloat(orderItem.price);
        const total = price * quantity;
        
        const itemPriceDisplay = document.getElementById('itemPriceDisplay');
        const quantityDisplay = document.getElementById('quantityDisplay');
        const totalAmountDisplay = document.getElementById('totalAmountDisplay');
        
        if (itemPriceDisplay) itemPriceDisplay.textContent = `$${price.toFixed(2)}`;
        if (quantityDisplay) quantityDisplay.textContent = quantity;
        if (totalAmountDisplay) totalAmountDisplay.textContent = `$${total.toFixed(2)}`;
    } catch (error) {
        console.error('Error updating order total:', error);
    }
}

// Close order form modal
window.closeOrderFormModal = function() {
    try {
        const modal = document.getElementById('orderFormModal');
        if (modal) {
            modal.style.display = 'none';
        }
        orderItem = null;
        
        const form = document.getElementById('orderForm');
        if (form) {
            form.reset();
        }
    } catch (error) {
        console.error('Error closing order form:', error);
    }
};

// Close order confirmation modal
window.closeOrderConfirmationModal = function() {
    try {
        const modal = document.getElementById('orderConfirmationModal');
        if (modal) {
            modal.style.display = 'none';
        }
    } catch (error) {
        console.error('Error closing confirmation modal:', error);
    }
};

// Handle order form submission
function initializeOrderForm() {
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            try {
                const formData = new FormData(e.target);
                let orderData;
                
                // Check if this is a cart order or single item order
                if (cart.length > 0 && orderItem === null) {
                    // Cart order
                    orderData = {
                        items: cart.map(item => ({
                            menuItemId: getMenuItemId(item.name),
                            quantity: item.quantity,
                            specialInstructions: formData.get('specialInstructions') || ''
                        })),
                        totalAmount: cartTotal,
                        paymentMethod: formData.get('paymentMethod'),
                        customerName: formData.get('customerName'),
                        customerEmail: formData.get('customerEmail'),
                        deliveryAddress: formData.get('deliveryAddress'),
                        specialInstructions: formData.get('specialInstructions') || ''
                    };
                } else if (orderItem) {
                    // Single item order
                    orderData = {
                        items: [{
                            menuItemId: orderItem.id,
                            quantity: parseInt(formData.get('quantity')),
                            specialInstructions: formData.get('specialInstructions') || ''
                        }],
                        totalAmount: parseFloat(orderItem.price) * parseInt(formData.get('quantity')),
                        paymentMethod: formData.get('paymentMethod'),
                        customerName: formData.get('customerName'),
                        customerEmail: formData.get('customerEmail'),
                        deliveryAddress: formData.get('deliveryAddress'),
                        specialInstructions: formData.get('specialInstructions') || ''
                    };
                } else {
                    alert('No items selected for order');
                    return;
                }
                
                console.log('Placing order:', orderData);
                
                // Show loading state
                const submitBtn = e.target.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<ion-icon name="hourglass-outline"></ion-icon> Placing Order...';
                submitBtn.disabled = true;
                
                // Submit order to API
                const response = await fetch('http://localhost:3000/api/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(orderData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // Show success confirmation
                    if (cart.length > 0) {
                        showOrderConfirmation(result.order, { name: `${cart.length} items`, price: cartTotal });
                        // Clear cart after successful order
                        cart = [];
                        updateCartDisplay();
                        updateCartItems();
                    } else {
                        showOrderConfirmation(result.order, orderItem);
                    }
                    closeOrderFormModal();
                } else {
                    throw new Error(result.message || 'Failed to place order');
                }
                
            } catch (error) {
                console.error('Error placing order:', error);
                alert('Failed to place order: ' + error.message);
                
                // Reset button
                const submitBtn = e.target.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            }
        });
    }
}

// Show order confirmation
function showOrderConfirmation(order, item) {
    try {
        document.getElementById('orderNumber').textContent = order.orderNumber || order.order_number || 'ORD-' + Date.now();
        document.getElementById('confirmedItemName').textContent = item.name;
        document.getElementById('confirmedTotalAmount').textContent = `$${parseFloat(order.totalAmount || order.total_amount).toFixed(2)}`;
        document.getElementById('estimatedTime').textContent = `${item.preparation_time || 15} minutes`;
        
        const confirmationModal = document.getElementById('orderConfirmationModal');
        if (confirmationModal) {
            confirmationModal.style.display = 'flex';
        }
    } catch (error) {
        console.error('Error showing order confirmation:', error);
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const menuModal = document.getElementById('menuItemModal');
    const orderModal = document.getElementById('orderFormModal');
    const confirmationModal = document.getElementById('orderConfirmationModal');
    
    if (event.target === menuModal) {
        closeMenuItemModal();
    } else if (event.target === orderModal) {
        closeOrderFormModal();
    } else if (event.target === confirmationModal) {
        closeOrderConfirmationModal();
    }
};

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeMenuItemModal();
        closeOrderFormModal();
        closeOrderConfirmationModal();
    }
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Menu functions initialized');
    initializeOrderForm();
    initializeReservationForm();
    initializeMenu(); // Initialize menu items
    
    
    // Initialize cart display
    updateCartDisplay();
    
    // Set default date for reservation form
    const reservationDateField = document.getElementById('reservationDate');
    if (reservationDateField) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        reservationDateField.value = tomorrow.toISOString().split('T')[0];
        console.log('Default reservation date set to:', tomorrow.toISOString().split('T')[0]);
    }
    
    // Test cart count element
    const cartCount = document.getElementById('cartCount');
    const cartButton = document.getElementById('cartBtn');
    
    console.log('Cart elements check:', {
        cartCount: cartCount,
        cartButton: cartButton,
        cartCountExists: !!cartCount,
        cartButtonExists: !!cartButton
    });
    
    if (cartCount) {
        console.log('Cart count element found:', cartCount);
        console.log('Initial cart count display:', cartCount.style.display);
    } else {
        console.error('Cart count element not found during initialization!');
    }
    
    if (cartButton) {
        console.log('Cart button element found:', cartButton);
    } else {
        console.log('Cart button element not found during initialization - will be handled by script.js');
    }
    
    // Prevent feedback form from interfering with reservation
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', function(event) {
            event.preventDefault();
            event.stopPropagation();
            showNotification('Thank you for your feedback!', 'success');
        });
    }
});

// Cart Functions - DISABLED to avoid conflicts with script.js
// The main cart functionality is now handled in script.js

// Update cart display
function updateCartDisplay() {
    try {
        const cartCount = document.getElementById('cartCount');
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        console.log('Updating cart display:', { cartCount, totalItems, cart });
        
        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
            console.log('Cart count updated:', { textContent: cartCount.textContent, display: cartCount.style.display });
        } else {
            console.error('Cart count element not found!');
        }
        
        // Update cart total
        cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Update cart total in sidebar
        const cartTotalAmount = document.getElementById('cartTotalAmount');
        if (cartTotalAmount) {
            cartTotalAmount.textContent = cartTotal.toFixed(2);
        }
        
        console.log('Cart updated:', { totalItems, cartTotal });
    } catch (error) {
        console.error('Error updating cart display:', error);
    }
}

// Update cart items in sidebar
function updateCartItems() {
    try {
        const cartItemsContainer = document.getElementById('cartItems');
        if (!cartItemsContainer) {
            console.error('Cart items container not found!');
            return;
        }

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">Your cart is empty</div>';
            return;
        }

        let cartItemsHTML = '';
        cart.forEach((item, index) => {
            cartItemsHTML += `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                        <div class="cart-item-controls">
                            <button class="quantity-btn" onclick="updateCartQuantity(${index}, -1)">-</button>
                            <span class="quantity-display">${item.quantity}</span>
                            <button class="quantity-btn" onclick="updateCartQuantity(${index}, 1)">+</button>
                            <button class="remove-item" onclick="removeFromCart(${index})">Remove</button>
                        </div>
                    </div>
                </div>
            `;
        });

        cartItemsContainer.innerHTML = cartItemsHTML;
        updateCartDisplay();
    } catch (error) {
        console.error('Error updating cart items:', error);
    }
}

// Cart functions disabled - handled by script.js

// Show order form for cart items
function showCartOrderForm() {
    try {
        const orderFormModal = document.getElementById('orderFormModal');
        if (!orderFormModal) {
            console.error('Order form modal not found!');
            return;
        }

        // Populate order form with cart summary
        const orderSummary = document.getElementById('orderSummary');
        if (orderSummary) {
            let summaryHTML = '<h4>Order Summary</h4>';
            cart.forEach(item => {
                summaryHTML += `
                    <div style="display: flex; justify-content: space-between; margin: 10px 0;">
                        <span>${item.name} x${item.quantity}</span>
                        <span>$${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `;
            });
            summaryHTML += `
                <div style="border-top: 1px solid #eee; margin-top: 10px; padding-top: 10px; font-weight: bold; display: flex; justify-content: space-between;">
                    <span>Total:</span>
                    <span>$${cartTotal.toFixed(2)}</span>
                </div>
            `;
            orderSummary.innerHTML = summaryHTML;
        }

        // Update quantity field to show total items
        const quantityField = document.getElementById('quantity');
        if (quantityField) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            quantityField.value = totalItems;
            quantityField.readOnly = true;
        }

        // Show the modal
        orderFormModal.style.display = 'flex';
    } catch (error) {
        console.error('Error showing cart order form:', error);
    }
}

// Toggle cart sidebar disabled - handled by script.js

// Create cart sidebar disabled - handled by script.js

// Update cart items display disabled - handled by script.js

// Duplicate cart functions disabled - handled by script.js

// Show order form for cart items
function showCartOrderForm() {
    try {
        // Create a combined order for all cart items
        const orderData = {
            items: cart.map(item => ({
                menuItemId: getMenuItemId(item.name),
                quantity: item.quantity,
                specialInstructions: ''
            })),
            totalAmount: cartTotal,
            paymentMethod: 'cash_on_delivery',
            customerName: '',
            customerEmail: '',
            deliveryAddress: '',
            specialInstructions: ''
        };
        
        // Show order form modal
        const orderModal = document.getElementById('orderFormModal');
        if (orderModal) {
            // Populate with cart summary
            document.getElementById('orderItemName').textContent = `${cart.length} items in cart`;
            document.getElementById('orderItemDescription').textContent = `Total: $${cartTotal.toFixed(2)}`;
            document.getElementById('orderItemPrice').textContent = `$${cartTotal.toFixed(2)}`;
            
            orderModal.style.display = 'flex';
        }
    } catch (error) {
        console.error('Error showing cart order form:', error);
    }
}

// Get menu item ID from name
function getMenuItemId(itemName) {
    // Find the item in the loaded menu items
    const item = allMenuItems.find(menuItem => menuItem.name === itemName);
    return item ? item.id : 1;
}

// Show notification
function showNotification(message, type = 'info') {
    try {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    } catch (error) {
        console.error('Error showing notification:', error);
    }
}

// Test function for debugging
window.testCartCount = function() {
    console.log('Testing cart count...');
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.textContent = '5';
        cartCount.style.display = 'flex';
        console.log('Cart count set to 5 and displayed');
    } else {
        console.error('Cart count element not found!');
    }
};

// Test reservation form
window.testReservationForm = function() {
    console.log('Testing reservation form...');
    const reservationForm = document.getElementById('reservationForm');
    const feedbackForm = document.getElementById('feedbackForm');
    
    console.log('Reservation form:', reservationForm);
    console.log('Feedback form:', feedbackForm);
    
    if (reservationForm) {
        console.log('Reservation form found with ID:', reservationForm.id);
        console.log('Reservation form class:', reservationForm.className);
    } else {
        console.error('Reservation form not found!');
    }
    
    if (feedbackForm) {
        console.log('Feedback form found with ID:', feedbackForm.id);
        console.log('Feedback form class:', feedbackForm.className);
    } else {
        console.error('Feedback form not found!');
    }
};

// Reservation Functions
window.initializeReservationForm = function() {
    try {
        const reservationForm = document.getElementById('reservationForm');
        console.log('Looking for reservation form:', reservationForm);
        
        if (reservationForm) {
            // Remove any existing event listeners
            const newForm = reservationForm.cloneNode(true);
            reservationForm.parentNode.replaceChild(newForm, reservationForm);
            
            // Add event listener to the new form
            newForm.addEventListener('submit', handleReservationSubmit);
            console.log('Reservation form initialized successfully');
        } else {
            console.error('Reservation form not found!');
        }
    } catch (error) {
        console.error('Error initializing reservation form:', error);
    }
};

// Handle reservation form submission
async function handleReservationSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('Reservation form submitted!', event.target);
    console.log('Form ID:', event.target.id);
    
    // Double check this is the reservation form
    if (event.target.id !== 'reservationForm') {
        console.error('Wrong form submitted! Expected reservationForm, got:', event.target.id);
        return;
    }
    
    try {
        const formData = new FormData(event.target);
        
        // Validate required fields
        const name = formData.get('name');
        const email = formData.get('email');
        const phone = formData.get('phone');
        const date = formData.get('date');
        const time = formData.get('time');
        const partySize = formData.get('partySize');
        
        console.log('Form data:', { name, email, phone, date, time, partySize });
        
        if (!name || !email || !phone || !date || !time || !partySize) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        // Validate name length
        if (name.length < 2) {
            showNotification('Name must be at least 2 characters', 'error');
            return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        // Validate phone number
        const phoneRegex = /^[0-9]{10,15}$/;
        if (!phoneRegex.test(phone)) {
            showNotification('Please enter a valid phone number (10-15 digits)', 'error');
            return;
        }
        
        // Validate date (must be today or future)
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            showNotification('Please select a future date', 'error');
            return;
        }
        
        // Prepare reservation data
        const reservationData = {
            name: name,
            email: email,
            phone: phone,
            date: date,
            time: time,
            partySize: parseInt(partySize),
            specialRequests: formData.get('specialRequests') || ''
        };
        
        console.log('Submitting reservation:', reservationData);
        
        // Submit to API
        const response = await fetch('http://localhost:3000/api/reservations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reservationData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Show confirmation modal
            showReservationConfirmation(result.data);
            
            // Reset form
            event.target.reset();
            
            // Set tomorrow's date as default
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            document.getElementById('reservationDate').value = tomorrow.toISOString().split('T')[0];
            
            console.log('Reservation submitted successfully:', result);
        } else {
            showNotification(result.message || 'Failed to submit reservation', 'error');
            console.error('Reservation submission failed:', result);
        }
        
    } catch (error) {
        console.error('Error submitting reservation:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

// Show reservation confirmation
function showReservationConfirmation(reservationData) {
    try {
        const modal = document.getElementById('reservationConfirmationModal');
        if (!modal) {
            console.error('Reservation confirmation modal not found!');
            return;
        }
        
        // Populate confirmation details
        document.getElementById('reservationId').textContent = reservationData.reservationId;
        document.getElementById('reservationConfirmName').textContent = reservationData.name;
        document.getElementById('reservationConfirmDate').textContent = formatDate(reservationData.date);
        document.getElementById('reservationConfirmTime').textContent = formatTime(reservationData.time);
        document.getElementById('reservationConfirmPartySize').textContent = reservationData.partySize + ' people';
        
        // Show modal
        modal.style.display = 'flex';
        
        // Show success notification
        showNotification('Reservation submitted successfully!', 'success');
        
    } catch (error) {
        console.error('Error showing reservation confirmation:', error);
    }
}

// Close reservation confirmation
window.closeReservationConfirmation = function() {
    try {
        const modal = document.getElementById('reservationConfirmationModal');
        if (modal) {
            modal.style.display = 'none';
        }
    } catch (error) {
        console.error('Error closing reservation confirmation:', error);
    }
};

// Format date for display
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        return dateString;
    }
}

// Format time for display
function formatTime(timeString) {
    try {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    } catch (error) {
        return timeString;
    }
}

// Global variables for menu management
let allMenuItems = [];

// Load all menu items from database
async function loadAllMenuItems() {
    console.log('Loading menu items...');
    
    // Show loading state
    const loading = document.getElementById('menuLoading');
    if (loading) {
        loading.innerHTML = '<p class="label-1">Loading menu items...</p>';
    }
    
    try {
        console.log('Fetching from API: http://localhost:3000/api/menu');
        const response = await fetch('http://localhost:3000/api/menu');
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Menu API response:', data);
        
        if (data.success && data.menuItems && data.menuItems.length > 0) {
            allMenuItems = data.menuItems;
            console.log('Successfully loaded', allMenuItems.length, 'menu items');
            console.log('First few items:', allMenuItems.slice(0, 3));
            
            // Hide loading and show menu
            if (loading) {
                loading.style.display = 'none';
            }
            
            displayMenuItems(allMenuItems);
        } else {
            throw new Error('No menu items received from server');
        }
    } catch (error) {
        console.error('Error loading menu items:', error);
        
        // Show error message
        if (loading) {
            loading.innerHTML = `
                <p class="label-1" style="color: #f44336;">Error loading menu items</p>
                <button onclick="loadAllMenuItems()" class="btn btn-primary" style="margin-top: 10px;">
                    Try Again
                </button>
            `;
        }
    }
}

// Display menu items in the grid
function displayMenuItems(menuItems) {
    console.log('displayMenuItems called with:', menuItems);
    const menuList = document.getElementById('menuItemsList');
    console.log('Menu list element:', menuList);
    
    if (!menuList) {
        console.error('Menu list element not found!');
        return;
    }
    
    // Clear existing content
    menuList.innerHTML = '';
    
    if (!menuItems || menuItems.length === 0) {
        console.log('No menu items to display');
        menuList.innerHTML = '<li class="text-center"><p class="label-1">No menu items found</p></li>';
        return;
    }
    
    console.log('Displaying', menuItems.length, 'menu items');
    
    // Create a simple fallback display if createMenuItemElement fails
    menuItems.forEach((item, index) => {
        console.log(`Creating element for item ${index}:`, item.name);
        
        try {
            const menuItem = createMenuItemElement(item);
            menuList.appendChild(menuItem);
            console.log(`Appended item ${index} to menu list`);
        } catch (error) {
            console.error(`Error creating element for item ${index}:`, error);
            // Create a simple fallback element
            const fallbackItem = document.createElement('li');
            fallbackItem.innerHTML = `
                <div style="border: 1px solid #ccc; padding: 15px; margin: 10px; background: #f9f9f9; border-radius: 8px;">
                    <h3>${item.name}</h3>
                    <p>${item.description || 'Delicious food item'}</p>
                    <p><strong>Price: $${item.price}</strong></p>
                    <button onclick="showMenuItemDetails(${item.id})" style="background: #3498db; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; margin: 5px;">
                        View Details
                    </button>
                    <button onclick="addToCart('${item.name}', '${getCategoryName(item.category_id)}', ${item.price}, '${item.image_url || './assets/images/menu-1.png'}')" style="background: #27ae60; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; margin: 5px;">
                        Add to Cart
                    </button>
                </div>
            `;
            menuList.appendChild(fallbackItem);
        }
    });
    
    console.log('Menu items displayed successfully');
    console.log('Menu list children count:', menuList.children.length);
    console.log('Menu list innerHTML length:', menuList.innerHTML.length);
}

// Create a menu item element
function createMenuItemElement(item) {
    const li = document.createElement('li');
    
    // Get category name from category_id
    const categoryName = getCategoryName(item.category_id);
    
    // Create badges
    const badges = createMenuBadges(item);
    
    // Format price
    const price = parseFloat(item.price).toFixed(2);
    
    // Default image if none provided
    const imageUrl = item.image_url || './assets/images/menu-1.png';
    
    li.innerHTML = `
        <div class="menu-card hover:card" data-menu-id="${item.id}" onclick="showMenuItemDetails(${item.id})">
            <figure class="card-banner img-holder" style="--width: 100; --height: 100;">
                <img src="${imageUrl}" width="100" height="100" loading="lazy" alt="${item.name}" class="img-cover">
            </figure>
            <div>
                <div class="title-wrapper">
                    <h3 class="title-3">
                        <a href="#" class="card-title">${item.name}</a>
                    </h3>
                    ${badges}
                    <span class="span title-2">₹${price}</span>
                </div>
                <p class="card-text label-1">${item.description || 'Delicious food item'}</p>
                <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart('${item.name}', '${categoryName}', ${price}, '${imageUrl}')">
                    <ion-icon name="add-outline"></ion-icon>
                    Add to Cart
                </button>
            </div>
        </div>
    `;
    
    return li;
}

// Create badges for menu items
function createMenuBadges(item) {
    let badges = '';
    
    // Vegetarian/Non-vegetarian badge
    if (item.is_vegetarian) {
        badges += '<span class="menu-badge badge-veg">Veg</span>';
    } else {
        badges += '<span class="menu-badge badge-nonveg">Non-Veg</span>';
    }
    
    // Spice level badge
    if (item.spice_level === 'hot' || item.spice_level === 'extra_hot') {
        badges += '<span class="menu-badge badge-hot">Hot</span>';
    }
    
    // New item badge (if created recently)
    const createdDate = new Date(item.created_at);
    const now = new Date();
    const daysDiff = (now - createdDate) / (1000 * 60 * 60 * 24);
    if (daysDiff < 30) {
        badges += '<span class="menu-badge badge-new">New</span>';
    }
    
    return badges;
}

// Get category name from category_id
function getCategoryName(categoryId) {
    const categories = {
        6: 'appetizers',
        7: 'main-course', 
        8: 'desserts',
        9: 'salads',
        10: 'beverages'
    };
    return categories[categoryId] || 'main-course';
}

// Filter functionality removed - showing all items directly

// Hide loading indicator
function hideMenuLoading() {
    const loading = document.getElementById('menuLoading');
    if (loading) {
        loading.style.display = 'none';
    }
}

// Show error message
function showMenuError(message) {
    const menuList = document.getElementById('menuItemsList');
    if (menuList) {
        menuList.innerHTML = `<li class="text-center"><p class="label-1" style="color: #f44336;">${message}</p></li>`;
    }
    hideMenuLoading();
}

// Initialize menu functionality
function initializeMenu() {
    console.log('Initializing menu...');
    // Load all menu items immediately
    loadAllMenuItems();
    
    // Also try to load menu after a short delay as backup
    setTimeout(() => {
        if (allMenuItems.length === 0) {
            console.log('Backup: Loading menu items after delay...');
            loadAllMenuItems();
        }
    }, 2000);
}

// Filter functionality removed - showing all items directly

// Duplicate DOMContentLoaded listener removed - functionality moved to main listener above

// Global function for manual menu reload
window.loadMenuManually = function() {
    loadAllMenuItems();
};

// Test menu API function
window.testMenuAPI = async function() {
    console.log('Testing menu API...');
    try {
        const response = await fetch('http://localhost:3000/api/menu');
        console.log('API Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response data:', data);
        
        if (data.success && data.menuItems && data.menuItems.length > 0) {
            alert(`✅ API Working! Found ${data.menuItems.length} menu items.\nFirst item: ${data.menuItems[0].name}`);
            console.log('First few items:', data.menuItems.slice(0, 3));
        } else {
            alert('❌ API returned no menu items');
        }
    } catch (error) {
        console.error('API Test Error:', error);
        alert(`❌ API Error: ${error.message}`);
    }
};

// Fallback: try to load menu after a delay if not loaded
setTimeout(() => {
    if (allMenuItems.length === 0) {
        console.log('Fallback: Loading menu items...');
        loadAllMenuItems();
    }
}, 3000);

console.log('Menu functions script loaded successfully');
