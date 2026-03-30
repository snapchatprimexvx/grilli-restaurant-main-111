'use strict';



/**
 * PRELOAD
 * 
 * loading will be end after document is loaded
 */

const preloader = document.querySelector("[data-preaload]");

// Hide on full load
window.addEventListener("load", function () {
  if (preloader) preloader.classList.add("loaded");
  document.body.classList.add("loaded");
});

// Fallback: hide even if some assets are slow
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    if (!document.body.classList.contains("loaded")) {
      if (preloader) preloader.classList.add("loaded");
      document.body.classList.add("loaded");
    }
  }, 4000);
});



/**
 * add event listener on multiple elements
 */

const addEventOnElements = function (elements, eventType, callback) {
  for (let i = 0, len = elements.length; i < len; i++) {
    elements[i].addEventListener(eventType, callback);
  }
}



/**
 * NAVBAR
 */

const navbar = document.querySelector("[data-navbar]");
const navTogglers = document.querySelectorAll("[data-nav-toggler]");
const overlay = document.querySelector("[data-overlay]");

const toggleNavbar = function () {
  navbar.classList.toggle("active");
  overlay.classList.toggle("active");
  document.body.classList.toggle("nav-active");
}

addEventOnElements(navTogglers, "click", toggleNavbar);



/**
 * HEADER & BACK TOP BTN
 */

const header = document.querySelector("[data-header]");
const backTopBtn = document.querySelector("[data-back-top-btn]");

let lastScrollPos = 0;

const hideHeader = function () {
  const isScrollBottom = lastScrollPos < window.scrollY;
  if (isScrollBottom) {
    header.classList.add("hide");
  } else {
    header.classList.remove("hide");
  }

  lastScrollPos = window.scrollY;
}

window.addEventListener("scroll", function () {
  if (window.scrollY >= 50) {
    header.classList.add("active");
    backTopBtn.classList.add("active");
    hideHeader();
  } else {
    header.classList.remove("active");
    backTopBtn.classList.remove("active");
  }
});



/**
 * HERO SLIDER
 */

const heroSlider = document.querySelector("[data-hero-slider]");
const heroSliderItems = document.querySelectorAll("[data-hero-slider-item]");
const heroSliderPrevBtn = document.querySelector("[data-prev-btn]");
const heroSliderNextBtn = document.querySelector("[data-next-btn]");

let currentSlidePos = 0;
let lastActiveSliderItem = heroSliderItems[0];

const updateSliderPos = function () {
  lastActiveSliderItem.classList.remove("active");
  heroSliderItems[currentSlidePos].classList.add("active");
  lastActiveSliderItem = heroSliderItems[currentSlidePos];
}

const slideNext = function () {
  if (currentSlidePos >= heroSliderItems.length - 1) {
    currentSlidePos = 0;
  } else {
    currentSlidePos++;
  }

  updateSliderPos();
}

heroSliderNextBtn.addEventListener("click", slideNext);

const slidePrev = function () {
  if (currentSlidePos <= 0) {
    currentSlidePos = heroSliderItems.length - 1;
  } else {
    currentSlidePos--;
  }

  updateSliderPos();
}

heroSliderPrevBtn.addEventListener("click", slidePrev);

/**
 * auto slide
 */

let autoSlideInterval;

const autoSlide = function () {
  autoSlideInterval = setInterval(function () {
    slideNext();
  }, 7000);
}

addEventOnElements([heroSliderNextBtn, heroSliderPrevBtn], "mouseover", function () {
  clearInterval(autoSlideInterval);
});

addEventOnElements([heroSliderNextBtn, heroSliderPrevBtn], "mouseout", autoSlide);

window.addEventListener("load", autoSlide);



/**
 * PARALLAX EFFECT
 */

const parallaxItems = document.querySelectorAll("[data-parallax-item]");

let x, y;

window.addEventListener("mousemove", function (event) {

  x = (event.clientX / window.innerWidth * 10) - 5;
  y = (event.clientY / window.innerHeight * 10) - 5;

  // reverse the number eg. 20 -> -20, -5 -> 5
  x = x - (x * 2);
  y = y - (y * 2);

  for (let i = 0, len = parallaxItems.length; i < len; i++) {
    x = x * Number(parallaxItems[i].dataset.parallaxSpeed);
    y = y * Number(parallaxItems[i].dataset.parallaxSpeed);
    parallaxItems[i].style.transform = `translate3d(${x}px, ${y}px, 0px)`;
  }

});



/**
 * SHOPPING CART & PAYMENT SYSTEM
 */

// User authentication state
window.isLoggedIn = !!localStorage.getItem('grilli_token');
window.currentUser = JSON.parse(localStorage.getItem('grilli_user') || 'null');

// Cart data - make globally accessible with persistence
window.cart = JSON.parse(localStorage.getItem('grilli_cart') || '[]');
let cart = window.cart; // Keep local reference for backward compatibility
let cartTotal = 0;

// Save cart to localStorage
window.saveCart = () => {
  localStorage.setItem('grilli_cart', JSON.stringify(window.cart));
  cart = window.cart; // Keep sync
};

// Update authentication state
window.updateAuthState = (token, user) => {
  if (token && user) {
    window.isLoggedIn = true;
    window.currentUser = user;
    localStorage.setItem('grilli_token', token);
    localStorage.setItem('grilli_user', JSON.stringify(user));
    grilliAPI.setToken(token);
  } else {
    window.isLoggedIn = false;
    window.currentUser = null;
    localStorage.removeItem('grilli_token');
    localStorage.removeItem('grilli_user');
    localStorage.removeItem('grilli_cart');
    window.cart = [];
    cart = [];
    grilliAPI.clearToken();
  }
  updateLoginButton();
};

// Update login button display
window.updateLoginButton = () => {
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    if (window.isLoggedIn && window.currentUser) {
      loginBtn.innerHTML = `
        <span class="login-icon">👤</span>
        <span class="login-text">${window.currentUser.first_name || 'User'}</span>
      `;
    } else {
      loginBtn.innerHTML = `
        <span class="login-icon">👤</span>
        <span class="login-text">Login</span>
      `;
    }
  }
};

// Categories configuration
const categories = {
  'appetizers': {
    name: 'Appetizers',
    icon: '🥗',
    color: '#FF6B6B'
  },
  'main-course': {
    name: 'Main Course',
    icon: '🍖',
    color: '#4ECDC4'
  },
  'vegetarian': {
    name: 'Vegetarian',
    icon: '🥬',
    color: '#95E1D3'
  },
  'desserts': {
    name: 'Desserts',
    icon: '🍰',
    color: '#F38BA8'
  },
  'beverages': {
    name: 'Beverages',
    icon: '🍹',
    color: '#A8DADC'
  }
};

// Menu items data organized by categories (will be updated from API)
window.menuItems = {
  'appetizers': {
    'Greek Salad': { price: 25.50, image: './assets/images/menu-1.png', description: 'Tomatoes, cucumber, olives, feta' },
    'Olivas Rellenas': { price: 25.00, image: './assets/images/menu-5.png', description: 'Avocados with crab meat, red onion, crab salad stuffed red bell pepper and green bell pepper.' },
    'Caesar Salad': { price: 22.00, image: './assets/images/menu-1.png', description: 'Fresh romaine lettuce, parmesan cheese, croutons, and our signature Caesar dressing.' },
    'Bruschetta': { price: 18.00, image: './assets/images/menu-1.png', description: 'Grilled bread topped with fresh tomatoes, basil, and mozzarella cheese.' },
    'Chicken Wings': { price: 28.00, image: './assets/images/menu-1.png', description: 'Crispy chicken wings with your choice of buffalo, BBQ, or honey garlic sauce.' }
  },
  'main-course': {
    'Lasagne': { price: 40.00, image: './assets/images/menu-2.png', description: 'Vegetables, cheeses, ground meats, tomato sauce, seasonings and spices' },
    'Tokusen Wagyu': { price: 39.00, image: './assets/images/menu-4.png', description: 'Vegetables, cheeses, ground meats, tomato sauce, seasonings and spices.' },
    'Opu Fish': { price: 49.00, image: './assets/images/menu-6.png', description: 'Vegetables, cheeses, ground meats, tomato sauce, seasonings and spices' },
    'Grilled Salmon': { price: 45.00, image: './assets/images/menu-6.png', description: 'Fresh Atlantic salmon grilled to perfection with lemon herb butter.' },
    'Beef Steak': { price: 55.00, image: './assets/images/menu-4.png', description: 'Premium ribeye steak cooked to your preference with roasted vegetables.' },
    'Chicken Parmesan': { price: 35.00, image: './assets/images/menu-2.png', description: 'Breaded chicken breast topped with marinara sauce and melted mozzarella.' }
  },
  'vegetarian': {
    'Butternut Pumpkin': { price: 10.00, image: './assets/images/menu-3.png', description: 'Typesetting industry lorem Lorem Ipsum is simply dummy text of the priand.' },
    'Vegetable Stir Fry': { price: 24.00, image: './assets/images/menu-3.png', description: 'Fresh seasonal vegetables stir-fried with garlic and soy sauce.' },
    'Mushroom Risotto': { price: 32.00, image: './assets/images/menu-3.png', description: 'Creamy arborio rice with wild mushrooms and parmesan cheese.' },
    'Quinoa Bowl': { price: 26.00, image: './assets/images/menu-3.png', description: 'Nutritious quinoa with roasted vegetables, chickpeas, and tahini dressing.' }
  },
  'desserts': {
    'Chocolate Lava Cake': { price: 18.00, image: './assets/images/menu-1.png', description: 'Warm chocolate cake with molten center, served with vanilla ice cream.' },
    'Tiramisu': { price: 16.00, image: './assets/images/menu-1.png', description: 'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone.' },
    'Cheesecake': { price: 14.00, image: './assets/images/menu-1.png', description: 'New York style cheesecake with berry compote.' },
    'Ice Cream Sundae': { price: 12.00, image: './assets/images/menu-1.png', description: 'Three scoops of premium ice cream with your choice of toppings.' }
  },
  'beverages': {
    'Fresh Orange Juice': { price: 8.00, image: './assets/images/menu-1.png', description: 'Freshly squeezed orange juice, served chilled.' },
    'Iced Coffee': { price: 6.00, image: './assets/images/menu-1.png', description: 'Cold brew coffee with ice and your choice of milk.' },
    'Green Tea': { price: 4.00, image: './assets/images/menu-1.png', description: 'Premium green tea, served hot or iced.' },
    'Sparkling Water': { price: 3.00, image: './assets/images/menu-1.png', description: 'Refreshing sparkling water with lemon slice.' }
  }
};

// Category information (removed duplicate declaration)

// Create payment modal HTML
const createPaymentModal = () => {
  const modalHTML = `
    <div id="paymentModal" class="payment-modal" style="display: none;">
      <div class="payment-modal-content">
        <div class="payment-header">
          <h2>Order Summary</h2>
          <span class="close-payment-modal">&times;</span>
        </div>
        <div class="cart-items" id="cartItems">
          <!-- Cart items will be populated here -->
        </div>
        <div class="cart-total">
          <h3>Total: $<span id="cartTotal">0.00</span></h3>
        </div>
        <div class="payment-options">
          <h3>Payment Method</h3>
          <div class="payment-methods">
            <label class="payment-method">
              <input type="radio" name="payment" value="credit" checked>
              <span class="payment-icon">💳</span>
              Credit Card
            </label>
            <label class="payment-method">
              <input type="radio" name="payment" value="paypal">
              <span class="payment-icon">🅿️</span>
              PayPal
            </label>
            <label class="payment-method">
              <input type="radio" name="payment" value="cash">
              <span class="payment-icon">💵</span>
              Cash on Delivery
            </label>
            <label class="payment-method">
              <input type="radio" name="payment" value="qr">
              <span class="payment-icon">📱</span>
              PhonePe QR Code
            </label>
          </div>
        </div>
        <div class="payment-form" id="paymentForm">
          <div class="form-group">
            <label>Card Number</label>
            <input type="text" placeholder="1234 5678 9012 3456" maxlength="19">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Expiry Date</label>
              <input type="text" placeholder="MM/YY" maxlength="5">
            </div>
            <div class="form-group">
              <label>CVV</label>
              <input type="text" placeholder="123" maxlength="3">
            </div>
          </div>
          <div class="form-group">
            <label>Cardholder Name</label>
            <input type="text" placeholder="John Doe">
          </div>
        </div>
        <div class="qr-payment-section" id="qrPaymentSection" style="display: none;">
          <div class="qr-container">
            <h3>Scan QR Code to Pay</h3>
            <div class="qr-code-container">
              <div class="qr-code-display">
                <div class="qr-placeholder-text">
                  <div class="phonepe-logo">📱</div>
                  <h4>Your PhonePe QR Code</h4>
                  <p>Scan to pay with PhonePe</p>
                  <div class="qr-amount-display">Amount: $<span id="qrAmountDisplay">0.00</span></div>
                </div>
              </div>
            </div>
            <div class="qr-instructions">
              <p><strong>How to pay:</strong></p>
              <ol>
                <li>Open PhonePe app on your phone</li>
                <li>Tap on "Scan & Pay"</li>
                <li>Scan this QR code</li>
                <li>Enter amount: <span class="qr-amount">$<span id="qrTotal">0.00</span></span></li>
                <li>Complete the payment</li>
              </ol>
            </div>
          </div>
        </div>
        <div class="payment-actions">
          <button class="btn btn-secondary" id="cancelPayment">Cancel</button>
          <button class="btn btn-primary" id="confirmPayment">Pay Now</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
};

// Add CSS styles for payment modal
const addPaymentStyles = () => {
  const styles = `
    <style>
      .payment-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      
      .payment-modal-content {
        background: white;
        border-radius: 15px;
        max-width: 500px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      }
      
      .payment-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid #eee;
      }
      
      .payment-header h2 {
        margin: 0;
        color: #333;
        font-size: 24px;
      }
      
      .close-payment-modal {
        font-size: 30px;
        cursor: pointer;
        color: #999;
        line-height: 1;
      }
      
      .close-payment-modal:hover {
        color: #333;
      }
      
      .cart-items {
        padding: 20px;
        max-height: 200px;
        overflow-y: auto;
      }
      
      .cart-item {
        display: flex;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid #f0f0f0;
      }
      
      .cart-item:last-child {
        border-bottom: none;
      }
      
      .cart-item img {
        width: 50px;
        height: 50px;
        border-radius: 8px;
        margin-right: 15px;
        object-fit: cover;
      }
      
      .cart-item-info {
        flex: 1;
      }
      
      .cart-item-name {
        font-weight: bold;
        margin: 0 0 5px 0;
        color: #333;
      }
      
      .cart-item-price {
        color: #e74c3c;
        font-weight: bold;
      }
      
      .cart-total {
        padding: 20px;
        background: #f8f9fa;
        text-align: center;
        border-top: 1px solid #eee;
      }
      
      .cart-total h3 {
        margin: 0;
        font-size: 20px;
        color: #333;
      }
      
      .payment-options {
        padding: 20px;
        border-top: 1px solid #eee;
      }
      
      .payment-options h3 {
        margin: 0 0 15px 0;
        color: #333;
      }
      
      .payment-methods {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      
      .payment-method {
        display: flex;
        align-items: center;
        padding: 12px;
        border: 2px solid #eee;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .payment-method:hover {
        border-color: #e74c3c;
      }
      
      .payment-method input[type="radio"] {
        margin-right: 10px;
      }
      
      .payment-method input[type="radio"]:checked + .payment-icon {
        color: #e74c3c;
      }
      
      .payment-icon {
        font-size: 20px;
        margin-right: 10px;
      }
      
      .payment-form {
        padding: 20px;
        border-top: 1px solid #eee;
      }
      
      .form-group {
        margin-bottom: 15px;
      }
      
      .form-row {
        display: flex;
        gap: 15px;
      }
      
      .form-row .form-group {
        flex: 1;
      }
      
      .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
        color: #333;
      }
      
      .form-group input {
        width: 100%;
        padding: 12px;
        border: 2px solid #eee;
        border-radius: 8px;
        font-size: 16px;
        transition: border-color 0.3s ease;
      }
      
      .form-group input:focus {
        outline: none;
        border-color: #e74c3c;
      }
      
      .payment-actions {
        padding: 20px;
        display: flex;
        gap: 15px;
        border-top: 1px solid #eee;
      }
      
      .payment-actions .btn {
        flex: 1;
        padding: 15px;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .btn-secondary {
        background: #6c757d;
        color: white;
      }
      
      .btn-secondary:hover {
        background: #5a6268;
      }
      
      .btn-primary {
        background: #e74c3c;
        color: white;
      }
      
      .btn-primary:hover {
        background: #c0392b;
      }
      
      .menu-card {
        cursor: pointer;
        transition: transform 0.3s ease;
      }
      
      .menu-card:hover {
        transform: translateY(-5px);
      }
      
      .add-to-cart-btn {
        background: #e74c3c;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
        margin-top: 10px;
        transition: background 0.3s ease;
      }
      
      .add-to-cart-btn:hover {
        background: #c0392b;
      }
      
      .qr-payment-section {
        padding: 20px;
        border-top: 1px solid #eee;
        text-align: center;
      }
      
      .qr-container h3 {
        margin: 0 0 20px 0;
        color: #333;
        font-size: 18px;
      }
      
      .qr-code-container {
        background: white;
        border: 2px solid #eee;
        border-radius: 12px;
        padding: 20px;
        margin: 0 auto 20px;
        display: inline-block;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      
      .qr-code {
        width: 200px;
        height: 200px;
        border-radius: 8px;
        display: block;
      }
      
      .qr-instructions {
        text-align: left;
        max-width: 300px;
        margin: 0 auto;
      }
      
      .qr-instructions p {
        margin: 0 0 10px 0;
        color: #333;
        font-weight: bold;
      }
      
      .qr-instructions ol {
        margin: 0;
        padding-left: 20px;
        color: #666;
        line-height: 1.6;
      }
      
      .qr-instructions li {
        margin-bottom: 8px;
      }
      
      .qr-amount {
        color: #e74c3c;
        font-weight: bold;
        font-size: 16px;
      }
      
      .qr-code-display {
        width: 200px;
        height: 200px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        text-align: center;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        position: relative;
        overflow: hidden;
      }
      
      .qr-code-display::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: repeating-linear-gradient(
          45deg,
          transparent,
          transparent 10px,
          rgba(255, 255, 255, 0.1) 10px,
          rgba(255, 255, 255, 0.1) 20px
        );
        animation: qr-shimmer 3s linear infinite;
      }
      
      @keyframes qr-shimmer {
        0% { transform: translateX(-100%) translateY(-100%); }
        100% { transform: translateX(100%) translateY(100%); }
      }
      
      .qr-placeholder-text {
        position: relative;
        z-index: 1;
      }
      
      .phonepe-logo {
        font-size: 48px;
        margin-bottom: 10px;
        animation: pulse 2s ease-in-out infinite;
      }
      
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
      
      .qr-placeholder-text h4 {
        margin: 0 0 8px 0;
        font-size: 16px;
        font-weight: bold;
      }
      
      .qr-placeholder-text p {
        margin: 0 0 12px 0;
        font-size: 14px;
        opacity: 0.9;
      }
      
      .qr-amount-display {
        background: rgba(255, 255, 255, 0.2);
        padding: 8px 12px;
        border-radius: 20px;
        font-weight: bold;
        font-size: 14px;
        backdrop-filter: blur(10px);
      }
      
      /* Category System Styles */
      .category-tabs {
        margin-bottom: 30px;
        text-align: center;
      }
      
      .category-tabs-container {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 15px;
        max-width: 800px;
        margin: 0 auto;
      }
      
      .category-tab {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        background: #f8f9fa;
        border: 2px solid transparent;
        border-radius: 25px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 500;
        color: #666;
        min-width: 120px;
        justify-content: center;
      }
      
      .category-tab:hover {
        background: #e9ecef;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      
      .category-tab.active {
        background: #e74c3c;
        color: white;
        border-color: #c0392b;
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(231, 76, 60, 0.3);
      }
      
      .category-icon {
        font-size: 18px;
      }
      
      .category-name {
        font-size: 14px;
        font-weight: 600;
      }
      
      .category-badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 12px;
        color: white;
        font-size: 10px;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-left: 8px;
      }
      
      .menu-items-container {
        min-height: 400px;
      }
      
      .menu-item {
        transition: all 0.3s ease;
      }
      
      .menu-item:hover {
        transform: translateY(-5px);
      }
      
      /* Responsive category tabs */
      @media (max-width: 768px) {
        .category-tabs-container {
          flex-direction: column;
          align-items: center;
        }
        
        .category-tab {
          width: 200px;
        }
      }
      
      /* Enhanced Reservation System Styles */
      .reservation-form .input-field {
        transition: all 0.3s ease;
      }
      
      .reservation-form .input-field:focus {
        border-color: #e74c3c;
        box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
      }
      
      .reservation-form .input-field.error {
        border-color: #e74c3c;
        background-color: #fdf2f2;
      }
      
      .table-availability {
        margin-top: 10px;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.3s ease;
      }
      
      .table-availability .available {
        color: #27ae60;
        background-color: #d5f4e6;
        padding: 4px 8px;
        border-radius: 4px;
        display: inline-block;
      }
      
      .table-availability .unavailable {
        color: #e74c3c;
        background-color: #fdf2f2;
        padding: 4px 8px;
        border-radius: 4px;
        display: inline-block;
      }
      
      .reservation-confirmation-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      
      .reservation-confirmation {
        background: white;
        border-radius: 15px;
        max-width: 500px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        animation: slideInUp 0.3s ease;
      }
      
      @keyframes slideInUp {
        from {
          transform: translateY(50px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
      
      .confirmation-header {
        text-align: center;
        padding: 30px 20px 20px;
        border-bottom: 1px solid #eee;
      }
      
      .confirmation-header h3 {
        margin: 0 0 10px 0;
        color: #27ae60;
        font-size: 24px;
      }
      
      .confirmation-header p {
        margin: 0;
        color: #666;
        font-size: 14px;
      }
      
      .confirmation-details {
        padding: 20px;
      }
      
      .detail-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;
      }
      
      .detail-row:last-child {
        border-bottom: none;
      }
      
      .detail-row .label {
        font-weight: 600;
        color: #333;
        min-width: 80px;
      }
      
      .detail-row .value {
        color: #666;
        text-align: right;
        flex: 1;
        margin-left: 20px;
      }
      
      .confirmation-actions {
        padding: 20px;
        display: flex;
        gap: 15px;
        border-top: 1px solid #eee;
      }
      
      .confirmation-actions .btn {
        flex: 1;
        padding: 15px;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .btn-secondary {
        background: #6c757d;
        color: white;
      }
      
      .btn-secondary:hover {
        background: #5a6268;
      }
      
      .btn-primary {
        background: #e74c3c;
        color: white;
      }
      
      .btn-primary:hover {
        background: #c0392b;
      }
      
      /* Form validation styles */
      .field-error {
        color: #e74c3c;
        font-size: 12px;
        margin-top: 4px;
        font-weight: 500;
        animation: fadeIn 0.3s ease;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      /* Enhanced form styling */
      .reservation-form .icon-wrapper {
        position: relative;
      }
      
      .reservation-form .icon-wrapper .input-field {
        padding-left: 45px;
      }
      
      .reservation-form .icon-wrapper ion-icon:first-child {
        position: absolute;
        left: 15px;
        top: 50%;
        transform: translateY(-50%);
        color: #999;
        z-index: 1;
      }
      
      /* Enhanced Find A Table System Styles */
      .find-table-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      
      .find-table-content {
        background: white;
        border-radius: 15px;
        max-width: 800px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        animation: slideInUp 0.3s ease;
      }
      
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 25px 30px;
        border-bottom: 1px solid #eee;
        background: linear-gradient(135deg, #e74c3c, #c0392b);
        color: white;
        border-radius: 15px 15px 0 0;
      }
      
      .modal-header h2 {
        margin: 0;
        font-size: 24px;
        font-weight: bold;
      }
      
      .close-find-table-modal {
        font-size: 30px;
        cursor: pointer;
        color: white;
        line-height: 1;
        opacity: 0.8;
        transition: opacity 0.3s ease;
      }
      
      .close-find-table-modal:hover {
        opacity: 1;
      }
      
      .table-search-section {
        padding: 30px;
      }
      
      .search-filters {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-bottom: 25px;
      }
      
      .filter-group {
        display: flex;
        flex-direction: column;
      }
      
      .filter-group label {
        font-weight: 600;
        color: #333;
        margin-bottom: 8px;
        font-size: 14px;
      }
      
      .filter-select,
      .filter-input {
        padding: 12px 15px;
        border: 2px solid #eee;
        border-radius: 8px;
        font-size: 14px;
        transition: all 0.3s ease;
        background: white;
      }
      
      .filter-select:focus,
      .filter-input:focus {
        outline: none;
        border-color: #e74c3c;
        box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
      }
      
      .search-btn {
        width: 100%;
        padding: 15px 25px;
        background: linear-gradient(135deg, #e74c3c, #c0392b);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      .search-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(231, 76, 60, 0.3);
      }
      
      .search-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
      }
      
      .table-results {
        padding: 0 30px 30px;
        border-top: 1px solid #eee;
      }
      
      .table-results h3 {
        margin: 25px 0 20px 0;
        color: #333;
        font-size: 20px;
        text-align: center;
      }
      
      .results-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
      }
      
      .table-card {
        background: white;
        border: 2px solid #f0f0f0;
        border-radius: 12px;
        padding: 20px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }
      
      .table-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #e74c3c, #f39c12);
      }
      
      .table-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        border-color: #e74c3c;
      }
      
      .table-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
      }
      
      .table-header h4 {
        margin: 0;
        color: #333;
        font-size: 18px;
        font-weight: bold;
      }
      
      .table-capacity {
        background: #e74c3c;
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: bold;
      }
      
      .table-location {
        color: #666;
        margin: 0 0 15px 0;
        font-size: 14px;
      }
      
      .table-features {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 15px;
      }
      
      .feature-tag {
        background: #f8f9fa;
        color: #666;
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 500;
        border: 1px solid #e9ecef;
      }
      
      .table-price {
        color: #e74c3c;
        font-weight: bold;
        font-size: 14px;
        margin-bottom: 15px;
      }
      
      .select-table-btn {
        width: 100%;
        padding: 12px;
        background: #27ae60;
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .select-table-btn:hover {
        background: #229954;
        transform: translateY(-2px);
      }
      
      .no-results {
        text-align: center;
        padding: 40px 20px;
        color: #666;
      }
      
      .no-results h4 {
        color: #e74c3c;
        margin-bottom: 15px;
      }
      
      .no-results ul {
        text-align: left;
        max-width: 300px;
        margin: 20px auto;
      }
      
      .quick-booking {
        padding: 30px;
        border-top: 1px solid #eee;
        background: #f8f9fa;
      }
      
      .quick-booking h3 {
        margin: 0 0 20px 0;
        color: #333;
        text-align: center;
      }
      
      .selected-table-info {
        background: white;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 20px;
        border-left: 4px solid #e74c3c;
      }
      
      .selected-table h4 {
        margin: 0 0 5px 0;
        color: #e74c3c;
      }
      
      .selected-table p {
        margin: 0;
        color: #666;
        font-size: 14px;
      }
      
      .booking-form {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }
      
      .booking-input,
      .booking-textarea {
        padding: 12px 15px;
        border: 2px solid #ddd;
        border-radius: 8px;
        font-size: 14px;
        transition: all 0.3s ease;
      }
      
      .booking-input:focus,
      .booking-textarea:focus {
        outline: none;
        border-color: #e74c3c;
        box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
      }
      
      .booking-textarea {
        resize: vertical;
        min-height: 80px;
      }
      
      .confirm-btn {
        padding: 15px 25px;
        background: linear-gradient(135deg, #27ae60, #229954);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      .confirm-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(39, 174, 96, 0.3);
      }
      
      /* Responsive design */
      @media (max-width: 768px) {
        .find-table-content {
          margin: 10px;
          max-height: 95vh;
        }
        
        .search-filters {
          grid-template-columns: 1fr;
        }
        
        .results-container {
          grid-template-columns: 1fr;
        }
        
        .modal-header {
          padding: 20px;
        }
        
        .modal-header h2 {
          font-size: 20px;
        }
        
        .table-search-section {
          padding: 20px;
        }
      }
      
      /* Enhanced Cart System Styles */
      .cart-toggle-btn {
        position: relative;
        background: #e74c3c;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 12px 16px;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-right: 15px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: bold;
      }
      
      .cart-toggle-btn:hover {
        background: #c0392b;
        transform: translateY(-2px);
      }
      
      .cart-icon {
        font-size: 18px;
      }
      
      .cart-count {
        background: #fff;
        color: #e74c3c;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        position: absolute;
        top: -5px;
        right: -5px;
        min-width: 20px;
      }
      
      .cart-sidebar {
        position: fixed;
        top: 0;
        right: -400px;
        width: 400px;
        height: 100vh;
        background: white;
        box-shadow: -5px 0 20px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        transition: right 0.3s ease;
        display: flex;
        flex-direction: column;
      }
      
      .cart-sidebar.open {
        right: 0;
      }
      
      .cart-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 9999;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
      }
      
      .cart-overlay.open {
        opacity: 1;
        visibility: visible;
      }
      
      .cart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        background: linear-gradient(135deg, #e74c3c, #c0392b);
        color: white;
      }
      
      .cart-header h3 {
        margin: 0;
        font-size: 20px;
      }
      
      .close-cart-btn {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background 0.3s ease;
      }
      
      .close-cart-btn:hover {
        background: rgba(255, 255, 255, 0.2);
      }
      
      .cart-items {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
      }
      
      .empty-cart {
        text-align: center;
        padding: 40px 20px;
        color: #666;
      }
      
      .empty-cart-icon {
        font-size: 48px;
        margin-bottom: 15px;
        opacity: 0.5;
      }
      
      .empty-cart p {
        margin: 0 0 10px 0;
        font-size: 16px;
        font-weight: 500;
      }
      
      .empty-cart-text {
        font-size: 14px;
        color: #999;
      }
      
      .cart-item {
        display: flex;
        gap: 15px;
        padding: 15px 0;
        border-bottom: 1px solid #f0f0f0;
        align-items: flex-start;
      }
      
      .cart-item:last-child {
        border-bottom: none;
      }
      
      .item-image {
        flex-shrink: 0;
      }
      
      .item-image img {
        width: 60px;
        height: 60px;
        border-radius: 8px;
        object-fit: cover;
      }
      
      .item-details {
        flex: 1;
        min-width: 0;
      }
      
      .item-name {
        margin: 0 0 5px 0;
        font-size: 14px;
        font-weight: bold;
        color: #333;
        line-height: 1.3;
      }
      
      .item-description {
        margin: 0 0 5px 0;
        font-size: 12px;
        color: #666;
        line-height: 1.3;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      
      .item-category {
        font-size: 10px;
        color: #e74c3c;
        font-weight: bold;
        text-transform: uppercase;
        margin-bottom: 5px;
      }
      
      .item-price {
        font-size: 12px;
        color: #666;
      }
      
      .item-controls {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 8px;
      }
      
      .quantity-controls {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #f8f9fa;
        border-radius: 6px;
        padding: 4px;
      }
      
      .qty-btn {
        background: #e74c3c;
        color: white;
        border: none;
        border-radius: 4px;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
        transition: background 0.3s ease;
      }
      
      .qty-btn:hover {
        background: #c0392b;
      }
      
      .quantity {
        font-weight: bold;
        color: #333;
        min-width: 20px;
        text-align: center;
      }
      
      .item-total {
        font-weight: bold;
        color: #e74c3c;
        font-size: 14px;
      }
      
      .remove-item {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 16px;
        opacity: 0.6;
        transition: opacity 0.3s ease;
        padding: 4px;
      }
      
      .remove-item:hover {
        opacity: 1;
      }
      
      .cart-summary {
        border-top: 1px solid #eee;
        padding: 20px;
        background: #f8f9fa;
      }
      
      .cart-totals {
        margin-bottom: 20px;
      }
      
      .cart-totals > div {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 14px;
      }
      
      .subtotal {
        color: #666;
      }
      
      .tax {
        color: #666;
      }
      
      .total {
        font-weight: bold;
        font-size: 16px;
        color: #333;
        border-top: 1px solid #ddd;
        padding-top: 8px;
        margin-top: 8px;
      }
      
      .cart-actions {
        display: flex;
        gap: 10px;
      }
      
      .cart-actions .btn {
        flex: 1;
        padding: 12px;
        border: none;
        border-radius: 8px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .cart-actions .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      /* Payment modal cart items */
      .cart-totals-breakdown {
        border-top: 1px solid #eee;
        padding-top: 15px;
        margin-top: 15px;
      }
      
      .total-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 14px;
      }
      
      .final-total {
        font-weight: bold;
        font-size: 16px;
        color: #e74c3c;
        border-top: 1px solid #ddd;
        padding-top: 8px;
        margin-top: 8px;
      }
      
      .cart-item-category {
        font-size: 10px;
        color: #e74c3c;
        font-weight: bold;
        text-transform: uppercase;
        margin-bottom: 5px;
      }
      
      /* Responsive cart */
      @media (max-width: 768px) {
        .cart-sidebar {
          width: 100%;
          right: -100%;
        }
        
        .cart-toggle-btn {
          padding: 10px 12px;
          margin-right: 10px;
        }
        
        .cart-item {
          flex-direction: column;
          gap: 10px;
        }
        
        .item-controls {
          flex-direction: row;
          justify-content: space-between;
          width: 100%;
        }
      }
      
      /* Dish Details Modal Styles */
      .dish-details-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      
      .dish-details-content {
        background: white;
        border-radius: 20px;
        max-width: 900px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
        animation: slideInUp 0.4s ease;
        display: flex;
        flex-direction: column;
      }
      
      .dish-details-header {
        display: flex;
        justify-content: flex-end;
        padding: 20px 25px 0;
      }
      
      .close-dish-details {
        background: #e74c3c;
        color: white;
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        font-size: 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
      }
      
      .close-dish-details:hover {
        background: #c0392b;
        transform: scale(1.1);
      }
      
      .dish-details-body {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 30px;
        padding: 20px 30px;
        flex: 1;
      }
      
      .dish-image-section {
        position: relative;
      }
      
      .dish-detail-image {
        width: 100%;
        height: 300px;
        object-fit: cover;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      }
      
      .dish-badge {
        position: absolute;
        top: 15px;
        left: 15px;
        background: linear-gradient(135deg, #e74c3c, #c0392b);
        color: white;
        padding: 8px 15px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      .dish-info-section {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      
      .dish-detail-title {
        margin: 0;
        font-size: 28px;
        color: #333;
        font-weight: bold;
        line-height: 1.2;
      }
      
      .dish-detail-description {
        margin: 0;
        color: #666;
        font-size: 16px;
        line-height: 1.6;
      }
      
      .dish-details-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
        background: #f8f9fa;
        padding: 20px;
        border-radius: 12px;
      }
      
      .detail-item {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      
      .detail-label {
        font-size: 12px;
        color: #666;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .detail-value {
        font-size: 14px;
        color: #333;
        font-weight: 500;
      }
      
      .price-highlight {
        color: #e74c3c;
        font-weight: bold;
        font-size: 18px;
      }
      
      .ingredients-section,
      .nutrition-section,
      .customization-section {
        background: white;
        border: 1px solid #eee;
        border-radius: 12px;
        padding: 20px;
      }
      
      .ingredients-section h3,
      .nutrition-section h3,
      .customization-section h3 {
        margin: 0 0 15px 0;
        font-size: 18px;
        color: #333;
        font-weight: bold;
      }
      
      .ingredients-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      
      .ingredient-tag {
        background: #e8f5e8;
        color: #2d5a2d;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
        border: 1px solid #c3e6c3;
      }
      
      .nutrition-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      
      .nutrition-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid #f0f0f0;
      }
      
      .nutrition-item:last-child {
        border-bottom: none;
      }
      
      .nutrition-label {
        font-size: 13px;
        color: #666;
        font-weight: 500;
      }
      
      .nutrition-value {
        font-size: 13px;
        color: #333;
        font-weight: bold;
      }
      
      .customization-options {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }
      
      .option-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .option-group label {
        font-size: 14px;
        color: #333;
        font-weight: 600;
      }
      
      .customization-select {
        padding: 10px 12px;
        border: 2px solid #eee;
        border-radius: 8px;
        font-size: 14px;
        background: white;
        transition: all 0.3s ease;
      }
      
      .customization-select:focus {
        outline: none;
        border-color: #e74c3c;
        box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
      }
      
      .customization-textarea {
        padding: 10px 12px;
        border: 2px solid #eee;
        border-radius: 8px;
        font-size: 14px;
        background: white;
        resize: vertical;
        min-height: 60px;
        font-family: inherit;
        transition: all 0.3s ease;
      }
      
      .customization-textarea:focus {
        outline: none;
        border-color: #e74c3c;
        box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
      }
      
      .dish-details-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 25px 30px;
        background: #f8f9fa;
        border-radius: 0 0 20px 20px;
        border-top: 1px solid #eee;
      }
      
      .quantity-selector {
        display: flex;
        align-items: center;
        gap: 15px;
      }
      
      .quantity-selector label {
        font-weight: 600;
        color: #333;
        font-size: 14px;
      }
      
      .dish-actions {
        display: flex;
        gap: 15px;
        align-items: center;
      }
      
      .dish-actions .btn {
        padding: 12px 25px;
        border: none;
        border-radius: 8px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .dish-actions .btn-primary {
        background: linear-gradient(135deg, #e74c3c, #c0392b);
        color: white;
      }
      
      .dish-actions .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(231, 76, 60, 0.3);
      }
      
      .dish-actions .btn-secondary {
        background: #6c757d;
        color: white;
      }
      
      .dish-actions .btn-secondary:hover {
        background: #5a6268;
        transform: translateY(-2px);
      }
      
      .btn-icon {
        font-size: 16px;
      }
      
      /* Cart customization tags */
      .item-customizations {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        margin: 8px 0;
      }
      
      .customization-tag {
        background: #fff3cd;
        color: #856404;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 500;
        border: 1px solid #ffeaa7;
      }
      
      /* Responsive design */
      @media (max-width: 768px) {
        .dish-details-content {
          margin: 10px;
          max-height: 95vh;
        }
        
        .dish-details-body {
          grid-template-columns: 1fr;
          gap: 20px;
          padding: 15px 20px;
        }
        
        .dish-detail-image {
          height: 250px;
        }
        
        .dish-details-grid {
          grid-template-columns: 1fr;
        }
        
        .nutrition-grid {
          grid-template-columns: 1fr;
        }
        
        .dish-details-footer {
          flex-direction: column;
          gap: 20px;
          padding: 20px;
        }
        
        .dish-actions {
          width: 100%;
          justify-content: space-between;
        }
        
        .dish-actions .btn {
          flex: 1;
          justify-content: center;
        }
      }
      
      /* Order Tracking System Styles */
      .track-orders-btn {
        background: #27ae60;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 12px 16px;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-right: 15px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: bold;
        font-size: 14px;
      }
      
      .track-orders-btn:hover {
        background: #229954;
        transform: translateY(-2px);
      }
      
      .track-icon {
        font-size: 16px;
      }
      
      .track-text {
        font-size: 14px;
      }
      
      /* Order Tracking Modal */
      .order-tracking-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      
      .tracking-content {
        background: white;
        border-radius: 20px;
        max-width: 600px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
        animation: slideInUp 0.4s ease;
      }
      
      .tracking-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 25px 30px;
        background: linear-gradient(135deg, #e74c3c, #c0392b);
        color: white;
        border-radius: 20px 20px 0 0;
      }
      
      .tracking-header h2 {
        margin: 0;
        font-size: 24px;
        font-weight: bold;
      }
      
      .close-tracking {
        background: none;
        border: none;
        color: white;
        font-size: 30px;
        cursor: pointer;
        padding: 0;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background 0.3s ease;
      }
      
      .close-tracking:hover {
        background: rgba(255, 255, 255, 0.2);
      }
      
      .order-info {
        padding: 20px 30px;
        background: #f8f9fa;
        border-bottom: 1px solid #eee;
      }
      
      .order-info > div {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 14px;
      }
      
      .order-info .label {
        color: #666;
        font-weight: 600;
      }
      
      .order-info .value {
        color: #333;
        font-weight: bold;
      }
      
      .tracking-stages {
        padding: 30px;
      }
      
      .stage {
        display: flex;
        align-items: flex-start;
        gap: 20px;
        margin-bottom: 25px;
        padding: 20px;
        border-radius: 12px;
        transition: all 0.3s ease;
        position: relative;
      }
      
      .stage::before {
        content: '';
        position: absolute;
        left: 25px;
        top: 50px;
        bottom: -25px;
        width: 2px;
        background: #e0e0e0;
      }
      
      .stage:last-child::before {
        display: none;
      }
      
      .stage.completed {
        background: #e8f5e8;
        border: 2px solid #4caf50;
      }
      
      .stage.current {
        background: #fff3cd;
        border: 2px solid #ffc107;
        animation: pulse 2s infinite;
      }
      
      .stage.pending {
        background: #f8f9fa;
        border: 2px solid #e0e0e0;
        opacity: 0.6;
      }
      
      .stage-icon {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        flex-shrink: 0;
        position: relative;
        z-index: 1;
      }
      
      .stage.completed .stage-icon {
        background: #4caf50;
        color: white;
      }
      
      .stage.current .stage-icon {
        background: #ffc107;
        color: white;
      }
      
      .stage.pending .stage-icon {
        background: #e0e0e0;
        color: #999;
      }
      
      .stage-content {
        flex: 1;
      }
      
      .stage-content h3 {
        margin: 0 0 8px 0;
        font-size: 18px;
        color: #333;
        font-weight: bold;
      }
      
      .stage-content p {
        margin: 0 0 8px 0;
        color: #666;
        font-size: 14px;
        line-height: 1.4;
      }
      
      .stage-time {
        font-size: 12px;
        color: #999;
        font-weight: 500;
      }
      
      .tracking-actions {
        padding: 20px 30px;
        background: #f8f9fa;
        border-radius: 0 0 20px 20px;
        display: flex;
        gap: 15px;
        justify-content: flex-end;
      }
      
      .tracking-actions .btn {
        padding: 12px 25px;
        border: none;
        border-radius: 8px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      /* Order History Modal */
      .order-history-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      
      .history-content {
        background: white;
        border-radius: 20px;
        max-width: 800px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
        animation: slideInUp 0.4s ease;
      }
      
      .history-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 25px 30px;
        background: linear-gradient(135deg, #27ae60, #229954);
        color: white;
        border-radius: 20px 20px 0 0;
      }
      
      .history-header h2 {
        margin: 0;
        font-size: 24px;
        font-weight: bold;
      }
      
      .close-history {
        background: none;
        border: none;
        color: white;
        font-size: 30px;
        cursor: pointer;
        padding: 0;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background 0.3s ease;
      }
      
      .close-history:hover {
        background: rgba(255, 255, 255, 0.2);
      }
      
      .orders-list {
        padding: 30px;
      }
      
      .order-card {
        background: white;
        border: 2px solid #f0f0f0;
        border-radius: 15px;
        padding: 20px;
        margin-bottom: 20px;
        transition: all 0.3s ease;
      }
      
      .order-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        border-color: #e74c3c;
      }
      
      .order-card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 15px;
      }
      
      .order-info h3 {
        margin: 0 0 5px 0;
        color: #333;
        font-size: 18px;
        font-weight: bold;
      }
      
      .order-date {
        margin: 0;
        color: #666;
        font-size: 14px;
      }
      
      .order-status {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 8px;
      }
      
      .status-badge {
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .status-badge.received {
        background: #e3f2fd;
        color: #1976d2;
      }
      
      .status-badge.preparing {
        background: #fff3e0;
        color: #f57c00;
      }
      
      .status-badge.ready {
        background: #e8f5e8;
        color: #388e3c;
      }
      
      .status-badge.outForDelivery {
        background: #f3e5f5;
        color: #7b1fa2;
      }
      
      .status-badge.delivered {
        background: #e8f5e8;
        color: #2e7d32;
      }
      
      .order-total {
        font-size: 16px;
        font-weight: bold;
        color: #e74c3c;
      }
      
      .order-items {
        margin-bottom: 15px;
      }
      
      .order-items h4 {
        margin: 0 0 10px 0;
        color: #333;
        font-size: 14px;
        font-weight: bold;
      }
      
      .items-list {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      
      .order-item {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      
      .item-name {
        font-size: 14px;
        color: #333;
        font-weight: 500;
      }
      
      .order-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
      }
      
      .order-actions .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 8px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 5px;
      }
      
      .history-actions {
        padding: 20px 30px;
        background: #f8f9fa;
        border-radius: 0 0 20px 20px;
        display: flex;
        justify-content: flex-end;
      }
      
      /* Animations */
      @keyframes pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.7);
        }
        70% {
          box-shadow: 0 0 0 10px rgba(255, 193, 7, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(255, 193, 7, 0);
        }
      }
      
      /* Responsive design */
      @media (max-width: 768px) {
        .track-orders-btn {
          padding: 10px 12px;
          margin-right: 10px;
        }
        
        .track-text {
          display: none;
        }
        
        .tracking-content,
        .history-content {
          margin: 10px;
          max-height: 95vh;
        }
        
        .stage {
          flex-direction: column;
          text-align: center;
          gap: 15px;
        }
        
        .stage::before {
          display: none;
        }
        
        .order-card-header {
          flex-direction: column;
          gap: 15px;
        }
        
        .order-status {
          align-items: flex-start;
        }
        
        .order-actions {
          justify-content: center;
        }
      }
      
      /* Login System Styles */
      .login-btn {
        background: #3498db;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 12px 16px;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-right: 15px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: bold;
        font-size: 14px;
      }
      
      .login-btn:hover {
        background: #2980b9;
        transform: translateY(-2px);
      }
      
      .login-icon {
        font-size: 16px;
      }
      
      .login-text {
        font-size: 14px;
      }
      
      /* Login Modal */
      .login-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      
      .login-content {
        background: white;
        border-radius: 20px;
        max-width: 500px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
        animation: slideInUp 0.4s ease;
      }
      
      .login-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 25px 30px;
        background: linear-gradient(135deg, #3498db, #2980b9);
        color: white;
        border-radius: 20px 20px 0 0;
      }
      
      .login-header h2 {
        margin: 0;
        font-size: 24px;
        font-weight: bold;
      }
      
      .close-login {
        background: none;
        border: none;
        color: white;
        font-size: 30px;
        cursor: pointer;
        padding: 0;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background 0.3s ease;
      }
      
      .close-login:hover {
        background: rgba(255, 255, 255, 0.2);
      }
      
      .login-tabs {
        display: flex;
        background: #f8f9fa;
        border-bottom: 1px solid #eee;
      }
      
      .tab-btn {
        flex: 1;
        padding: 15px 20px;
        border: none;
        background: transparent;
        cursor: pointer;
        font-weight: bold;
        font-size: 16px;
        color: #666;
        transition: all 0.3s ease;
        position: relative;
      }
      
      .tab-btn.active {
        color: #3498db;
        background: white;
      }
      
      .tab-btn.active::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: #3498db;
      }
      
      .login-form-container {
        padding: 30px;
      }
      
      .auth-form {
        display: none;
      }
      
      .auth-form.active {
        display: block;
      }
      
      .form-group {
        margin-bottom: 20px;
      }
      
      .form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        color: #333;
        font-size: 14px;
      }
      
      .form-group input {
        width: 100%;
        padding: 12px 15px;
        border: 2px solid #eee;
        border-radius: 8px;
        font-size: 14px;
        transition: all 0.3s ease;
        box-sizing: border-box;
      }
      
      .form-group input:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
      }
      
      .form-group input.error {
        border-color: #e74c3c;
      }
      
      .error-message {
        color: #e74c3c;
        font-size: 12px;
        margin-top: 5px;
        display: block;
      }
      
      .form-options {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 25px;
      }
      
      .checkbox-container {
        display: flex;
        align-items: center;
        cursor: pointer;
        font-size: 14px;
        color: #666;
      }
      
      .checkbox-container input {
        margin-right: 8px;
      }
      
      .forgot-password {
        color: #3498db;
        text-decoration: none;
        font-size: 14px;
        font-weight: 500;
      }
      
      .forgot-password:hover {
        text-decoration: underline;
      }
      
      .auth-btn {
        width: 100%;
        padding: 15px 25px;
        background: linear-gradient(135deg, #3498db, #2980b9);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 1px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      
      .auth-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(52, 152, 219, 0.3);
      }
      
      .auth-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
      }
      
      .btn-icon {
        font-size: 16px;
      }
      
      .login-footer {
        padding: 20px 30px;
        background: #f8f9fa;
        border-radius: 0 0 20px 20px;
        text-align: center;
      }
      
      .login-footer p {
        margin: 0 0 15px 0;
        color: #666;
        font-size: 14px;
      }
      
      .social-login {
        display: flex;
        gap: 10px;
      }
      
      .social-btn {
        flex: 1;
        padding: 12px;
        border: 2px solid #eee;
        border-radius: 8px;
        background: white;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-weight: 500;
        font-size: 14px;
      }
      
      .social-btn:hover {
        border-color: #3498db;
        transform: translateY(-2px);
      }
      
      .social-btn.google:hover {
        border-color: #db4437;
        color: #db4437;
      }
      
      .social-btn.facebook:hover {
        border-color: #4267B2;
        color: #4267B2;
      }
      
      .social-icon {
        font-size: 16px;
      }
      
      /* User Menu */
      .user-menu {
        position: fixed;
        top: 80px;
        right: 20px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        min-width: 250px;
        animation: slideInDown 0.3s ease;
      }
      
      .user-menu-content {
        padding: 20px;
      }
      
      .user-info {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid #eee;
      }
      
      .user-avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, #3498db, #2980b9);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        font-weight: bold;
      }
      
      .user-details h3 {
        margin: 0 0 5px 0;
        color: #333;
        font-size: 16px;
        font-weight: bold;
      }
      
      .user-details p {
        margin: 0;
        color: #666;
        font-size: 12px;
      }
      
      .user-menu-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .menu-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 15px;
        border: none;
        background: transparent;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 14px;
        color: #333;
        text-align: left;
        width: 100%;
      }
      
      .menu-item:hover {
        background: #f8f9fa;
        color: #3498db;
      }
      
      .menu-icon {
        font-size: 16px;
      }
      
      /* Animations */
      @keyframes slideInDown {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      /* Responsive design */
      @media (max-width: 768px) {
        .login-btn {
          padding: 10px 12px;
          margin-right: 10px;
        }
        
        .login-text {
          display: none;
        }
        
        .login-content {
          margin: 10px;
          max-height: 95vh;
        }
        
        .login-header {
          padding: 20px;
        }
        
        .login-header h2 {
          font-size: 20px;
        }
        
        .login-form-container {
          padding: 20px;
        }
        
        .form-options {
          flex-direction: column;
          gap: 15px;
          align-items: flex-start;
        }
        
        .social-login {
          flex-direction: column;
        }
        
        .user-menu {
          right: 10px;
          left: 10px;
          min-width: auto;
        }
      }

    </style>
  `;
  
  document.head.insertAdjacentHTML('beforeend', styles);
};

// Initialize payment system
const initPaymentSystem = () => {
  createPaymentModal();
  addPaymentStyles();
  
  // Add click handlers to menu items (require login first)
  const menuCards = document.querySelectorAll('.menu-card');
  console.log('Found menu cards:', menuCards.length);
  menuCards.forEach(card => {
    const titleElement = card.querySelector('.card-title');
    const menuItem = card.closest('.menu-item');
    const category = menuItem ? menuItem.dataset.category : undefined;
    if (titleElement) {
      const dishName = titleElement.textContent.trim();
      console.log('Adding click handler for:', dishName);
      card.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Menu card clicked:', dishName);
        showDishDetails(dishName, category);
      });
      card.style.cursor = 'pointer';
      
      // Also add a simple "Add to Cart" button directly on each card
      if (!card.querySelector('.quick-add-btn')) {
        const quickAddBtn = document.createElement('button');
        quickAddBtn.className = 'quick-add-btn';
        quickAddBtn.innerHTML = 'Add to Cart';
        quickAddBtn.style.cssText = 'position: absolute; top: 10px; right: 10px; background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 12px; z-index: 10;';
        quickAddBtn.onclick = (e) => {
          e.stopPropagation();
          console.log('Quick add clicked for:', dishName);
          if (typeof addToCart === 'function') {
            addToCart(dishName, category);
          } else {
            console.error('addToCart function not found');
          }
        };
        card.style.position = 'relative';
        card.appendChild(quickAddBtn);
      }
    }
  });
  
  // Payment modal event handlers
  const modal = document.getElementById('paymentModal');
  const closeBtn = document.querySelector('.close-payment-modal');
  const cancelBtn = document.getElementById('cancelPayment');
  const confirmBtn = document.getElementById('confirmPayment');
  
  closeBtn.addEventListener('click', closePaymentModal);
  cancelBtn.addEventListener('click', closePaymentModal);
  
  confirmBtn.addEventListener('click', processPayment);
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closePaymentModal();
    }
  });
  
  // Payment method change handler
  const paymentMethods = document.querySelectorAll('input[name="payment"]');
  const paymentForm = document.getElementById('paymentForm');
  
  paymentMethods.forEach(method => {
    method.addEventListener('change', (e) => {
      const qrSection = document.getElementById('qrPaymentSection');
      const qrTotal = document.getElementById('qrTotal');
      const qrAmountDisplay = document.getElementById('qrAmountDisplay');
      
      if (e.target.value === 'cash') {
        paymentForm.style.display = 'none';
        qrSection.style.display = 'none';
      } else if (e.target.value === 'qr') {
        paymentForm.style.display = 'none';
        qrSection.style.display = 'block';
        qrTotal.textContent = cartTotal.toFixed(2);
        qrAmountDisplay.textContent = cartTotal.toFixed(2);
      } else {
        paymentForm.style.display = 'block';
        qrSection.style.display = 'none';
      }
    });
  });
};

// Quick add to cart function - make globally accessible
window.quickAddToCart = (dishName, category) => {
  console.log('Quick add to cart:', dishName, category);
  
  // Add item to cart (login not required for basic cart functionality)
  window.addToCart(dishName, category);
  
  // Show cart sidebar
  if (typeof window.toggleCartSidebar === 'function') {
    window.toggleCartSidebar();
  }
};

// Add item to cart - make globally accessible
window.addToCart = (dishName, category) => {
  console.log('addToCart called with:', dishName, category);
  let item = null;
  
  // Find the item in the category structure
  if (category && window.menuItems[category] && window.menuItems[category][dishName]) {
    item = window.menuItems[category][dishName];
  } else {
    // Fallback: search through all categories
    for (const cat in window.menuItems) {
      if (window.menuItems[cat][dishName]) {
        item = window.menuItems[cat][dishName];
        break;
      }
    }
  }
  
  if (item) {
    const existingItem = window.cart.find(cartItem => cartItem.name === dishName);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      window.cart.push({
        id: window.generateItemId ? window.generateItemId() : 'item_' + Date.now(),
        name: dishName,
        price: item.price,
        image: item.image,
        description: item.description,
        category: category || 'unknown',
        quantity: 1
      });
    }
    
    // Save cart to localStorage
    if (typeof window.saveCart === 'function') {
      window.saveCart();
    }
    
    // Use window functions or fallback to local references
    if (typeof window.updateCartTotal === 'function') {
      window.updateCartTotal();
    } else {
    cartTotal = window.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    
    if (typeof window.updateCartDisplay === 'function') {
      window.updateCartDisplay();
    }
    
    // Show success message
    if (typeof window.showNotification === 'function') {
      window.showNotification(`${dishName} added to cart! (${existingItem ? existingItem.quantity + 1 : 1} in cart)`, 'success');
    } else {
      console.log(`${dishName} added to cart!`);
    }
  }
};

// Generate unique item ID - make globally accessible
window.generateItemId = () => {
  return 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Get menu item ID from name (mapping for database)
const getMenuItemId = (itemName) => {
  const menuItemMapping = {
    'Greek Salad': 1,
    'Chicken Wings': 2,
    'Caesar Salad': 3,
    'Lasagne': 4,
    'Tokusen Wagyu': 5,
    'Opu Fish': 6,
    'Grilled Salmon': 7,
    'Beef Steak': 8,
    'Chicken Parmesan': 9,
    'Butternut Pumpkin': 10,
    'Vegetable Stir Fry': 11,
    'Mushroom Risotto': 12,
    'Quinoa Bowl': 13,
    'Chocolate Lava Cake': 14,
    'Tiramisu': 15,
    'Cheesecake': 16,
    'Ice Cream Sundae': 17,
    'Fresh Orange Juice': 18,
    'Iced Coffee': 19,
    'Green Tea': 20,
    'Sparkling Water': 21,
    // Add more mappings as needed
    'Olivas Rellenas': 22,
    'Bruschetta': 23,
    'Vegetable Pasta': 24
  };
  
  return menuItemMapping[itemName] || 1; // Default to 1 if not found
};

// Show dish details modal
const showDishDetails = (dishName, category) => {
  let item = null;
  
  // Find the item in the category structure
  if (category && window.menuItems[category] && window.menuItems[category][dishName]) {
    item = window.menuItems[category][dishName];
  } else {
    // Fallback: search through all categories
    for (const cat in window.menuItems) {
      if (window.menuItems[cat][dishName]) {
        item = window.menuItems[cat][dishName];
        break;
      }
    }
  }
  
  if (!item) {
    showNotification('Dish not found', 'error');
    return;
  }
  
  // Create dish details modal
  createDishDetailsModal(item, dishName, category);
};

// Create dish details modal
const createDishDetailsModal = (item, dishName, category) => {
  const modalHTML = `
    <div id="dishDetailsModal" class="dish-details-modal" style="display: none;">
      <div class="dish-details-content">
        <div class="dish-details-header">
          <button class="close-dish-details" onclick="closeDishDetails()">&times;</button>
        </div>
        
        <div class="dish-details-body">
          <div class="dish-image-section">
            <img src="${item.image}" alt="${dishName}" class="dish-detail-image">
            <div class="dish-badge">${categories[category]?.name || 'Special'}</div>
          </div>
          
          <div class="dish-info-section">
            <h2 class="dish-detail-title">${dishName}</h2>
            <p class="dish-detail-description">${item.description}</p>
            
            <div class="dish-details-grid">
              <div class="detail-item">
                <span class="detail-label">🍽️ Category:</span>
                <span class="detail-value">${categories[category]?.name || 'Special'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">💰 Price:</span>
                <span class="detail-value price-highlight">$${item.price.toFixed(2)}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">⏱️ Prep Time:</span>
                <span class="detail-value">${item.prepTime || '15-20 mins'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">🌶️ Spice Level:</span>
                <span class="detail-value">${item.spiceLevel || 'Medium'}</span>
              </div>
            </div>
            
            <div class="ingredients-section">
              <h3>🥘 Ingredients</h3>
              <div class="ingredients-list">
                ${(item.ingredients || [
                  'Fresh ingredients',
                  'Premium spices',
                  'Authentic recipe',
                  'Quality meat/seafood',
                  'Fresh vegetables'
                ]).map(ingredient => `<span class="ingredient-tag">${ingredient}</span>`).join('')}
              </div>
            </div>
            
            <div class="nutrition-section">
              <h3>📊 Nutrition Info</h3>
              <div class="nutrition-grid">
                <div class="nutrition-item">
                  <span class="nutrition-label">Calories:</span>
                  <span class="nutrition-value">${item.calories || '350-450'}</span>
                </div>
                <div class="nutrition-item">
                  <span class="nutrition-label">Protein:</span>
                  <span class="nutrition-value">${item.protein || '25-30g'}</span>
                </div>
                <div class="nutrition-item">
                  <span class="nutrition-label">Carbs:</span>
                  <span class="nutrition-value">${item.carbs || '15-20g'}</span>
                </div>
                <div class="nutrition-item">
                  <span class="nutrition-label">Fat:</span>
                  <span class="nutrition-value">${item.fat || '12-18g'}</span>
                </div>
              </div>
            </div>
            
            <div class="customization-section">
              <h3>⚙️ Customization Options</h3>
              <div class="customization-options">
                <div class="option-group">
                  <label>🌶️ Spice Level:</label>
                  <select id="spiceLevel" class="customization-select">
                    <option value="mild">Mild</option>
                    <option value="medium" selected>Medium</option>
                    <option value="hot">Hot</option>
                    <option value="extra-hot">Extra Hot</option>
                  </select>
                </div>
                
                <div class="option-group">
                  <label>🍽️ Portion Size:</label>
                  <select id="portionSize" class="customization-select">
                    <option value="regular" selected>Regular</option>
                    <option value="large">Large (+$3.00)</option>
                    <option value="family">Family Size (+$8.00)</option>
                  </select>
                </div>
                
                <div class="option-group">
                  <label>🥗 Special Requests:</label>
                  <textarea id="specialRequests" class="customization-textarea" placeholder="Any special dietary requirements or modifications..."></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="dish-details-footer">
          <div class="quantity-selector">
            <label>Quantity:</label>
            <div class="quantity-controls">
              <button class="qty-btn" onclick="updateDishQuantity(-1)">−</button>
              <span class="quantity" id="dishQuantity">1</span>
              <button class="qty-btn" onclick="updateDishQuantity(1)">+</button>
            </div>
          </div>
          
          <div class="dish-actions">
            <button class="btn btn-secondary" onclick="closeDishDetails()">Cancel</button>
            <button class="btn btn-primary" onclick="addDishToCart('${dishName}', '${category}')">
              <span class="btn-icon">🛒</span>
              Add to Cart - $<span id="dishTotalPrice">${item.price.toFixed(2)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Remove existing modal if any
  const existingModal = document.getElementById('dishDetailsModal');
  if (existingModal) {
    existingModal.remove();
  }
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Show modal
  const modal = document.getElementById('dishDetailsModal');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  
  // Store current dish info for cart addition
  window.currentDishInfo = { item, dishName, category };
  
  // Add event listeners
  setupDishDetailsEventListeners();
};

// Setup event listeners for dish details modal
const setupDishDetailsEventListeners = () => {
  const modal = document.getElementById('dishDetailsModal');
  const closeBtn = document.querySelector('.close-dish-details');
  
  // Close modal
  closeBtn.addEventListener('click', closeDishDetails);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeDishDetails();
  });
  
  // Update price when options change
  const spiceSelect = document.getElementById('spiceLevel');
  const portionSelect = document.getElementById('portionSize');
  
  if (spiceSelect) spiceSelect.addEventListener('change', updateDishPrice);
  if (portionSelect) portionSelect.addEventListener('change', updateDishPrice);
};

// Close dish details modal
window.closeDishDetails = () => {
  const modal = document.getElementById('dishDetailsModal');
  if (modal) {
    modal.remove();
    document.body.style.overflow = 'auto';
  }
  delete window.currentDishInfo;
};

// Update dish quantity
window.updateDishQuantity = (change) => {
  const quantityElement = document.getElementById('dishQuantity');
  if (!quantityElement) return;
  
  const currentQuantity = parseInt(quantityElement.textContent);
  const newQuantity = Math.max(1, currentQuantity + change);
  quantityElement.textContent = newQuantity;
  
  updateDishPrice();
};

// Update dish price based on quantity and options
const updateDishPrice = () => {
  if (!window.currentDishInfo) return;
  
  const { item } = window.currentDishInfo;
  const quantity = parseInt(document.getElementById('dishQuantity').textContent);
  const portionSize = document.getElementById('portionSize').value;
  
  let basePrice = item.price;
  
  // Add portion size pricing
  if (portionSize === 'large') {
    basePrice += 3.00;
  } else if (portionSize === 'family') {
    basePrice += 8.00;
  }
  
  const totalPrice = basePrice * quantity;
  const totalPriceElement = document.getElementById('dishTotalPrice');
  if (totalPriceElement) {
    totalPriceElement.textContent = totalPrice.toFixed(2);
  }
};

// Add dish to cart with customizations
window.addDishToCart = (dishName, category) => {
  if (!window.currentDishInfo) return;
  
  const { item } = window.currentDishInfo;
  const quantity = parseInt(document.getElementById('dishQuantity').textContent);
  const spiceLevel = document.getElementById('spiceLevel').value;
  const portionSize = document.getElementById('portionSize').value;
  const specialRequests = document.getElementById('specialRequests').value.trim();
  
  // Calculate final price
  let finalPrice = item.price;
  if (portionSize === 'large') finalPrice += 3.00;
  if (portionSize === 'family') finalPrice += 8.00;
  
  // Create cart item with customizations
  const cartItem = {
    id: generateItemId(),
    name: dishName,
    price: finalPrice,
    image: item.image,
    description: item.description,
    category: category || 'unknown',
    quantity: quantity,
    customizations: {
      spiceLevel,
      portionSize,
      specialRequests
    }
  };
  
  // Add to cart
  window.cart.push(cartItem);
  cart = window.cart; // Keep sync
  window.saveCart(); // Persist cart
  updateCartTotal();
  updateCartDisplay();
  
  // Close modal
  closeDishDetails();
  
  // Show success message
  const customizationText = portionSize !== 'regular' ? ` (${portionSize})` : '';
  showNotification(`${dishName}${customizationText} x${quantity} added to cart!`);
};

// Update cart total - make globally accessible
window.updateCartTotal = () => {
  cartTotal = window.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
};

// Create persistent cart sidebar
const createCartSidebar = () => {
  const cartHTML = `
    <div id="cartSidebar" class="cart-sidebar">
      <div class="cart-header">
        <h3>🛒 Your Order</h3>
        <button class="close-cart-btn" onclick="toggleCartSidebar()">×</button>
      </div>
      <div class="cart-items" id="cartItemsList">
        <!-- Cart items will be populated here -->
      </div>
      <div class="cart-summary">
        <div class="cart-totals">
          <div class="subtotal">
            <span>Subtotal:</span>
            <span id="cartSubtotal">$0.00</span>
          </div>
          <div class="tax">
            <span>Tax (10%):</span>
            <span id="cartTax">$0.00</span>
          </div>
          <div class="total">
            <span>Total:</span>
            <span id="cartTotalDisplay">$0.00</span>
          </div>
        </div>
        <div class="cart-actions">
          <button class="btn btn-secondary" onclick="clearCart()">Clear Cart</button>
          <button class="btn btn-primary" onclick="proceedToCheckout()" id="checkoutBtn" disabled>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
    <div class="cart-overlay" id="cartOverlay" onclick="toggleCartSidebar()"></div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', cartHTML);
  
  // Add cart toggle button to header
  addCartToggleButton();
};

// Add cart toggle button to header
const addCartToggleButton = () => {
  const header = document.querySelector('.header .container');
  if (!header) return;
  
  const cartToggle = document.createElement('button');
  cartToggle.className = 'cart-toggle-btn';
  cartToggle.innerHTML = `
    <span class="cart-icon">🛒</span>
    <span class="cart-count" id="cartCount">0</span>
  `;
  cartToggle.onclick = toggleCartSidebar;
  
  // Add track orders button
  const trackOrdersBtn = document.createElement('button');
  trackOrdersBtn.className = 'track-orders-btn';
  trackOrdersBtn.innerHTML = `
    <span class="track-icon">📦</span>
    <span class="track-text">Track Orders</span>
  `;
  trackOrdersBtn.onclick = showOrderHistory;
  
  // Add login button
  const loginBtn = document.createElement('button');
  loginBtn.className = 'login-btn';
  loginBtn.id = 'loginBtn';
  loginBtn.innerHTML = `
    <span class="login-icon">👤</span>
    <span class="login-text">Login</span>
  `;
  loginBtn.onclick = showLoginModal;
  
  // Insert buttons before the Find A Table button
  const findTableBtn = header.querySelector('.btn-secondary');
  if (findTableBtn) {
    header.insertBefore(loginBtn, findTableBtn);
    header.insertBefore(trackOrdersBtn, loginBtn);
    header.insertBefore(cartToggle, trackOrdersBtn);
  } else {
    header.appendChild(cartToggle);
    header.appendChild(trackOrdersBtn);
    header.appendChild(loginBtn);
  }
};

// Toggle cart sidebar
window.toggleCartSidebar = () => {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  
  if (sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = 'auto';
  } else {
    sidebar.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    updateCartDisplay();
  }
};

// Show cart sidebar - alias for existing function
window.showCartSidebar = () => {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  
  if (!sidebar.classList.contains('open')) {
    sidebar.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    updateCartDisplay();
  }
};

// Update cart display - make globally accessible
window.updateCartDisplay = () => {
  const cartItemsList = document.getElementById('cartItemsList');
  const cartCount = document.getElementById('cartCount');
  const cartSubtotal = document.getElementById('cartSubtotal');
  const cartTax = document.getElementById('cartTax');
  const cartTotalDisplay = document.getElementById('cartTotalDisplay');
  const checkoutBtn = document.getElementById('checkoutBtn');
  
  if (!cartItemsList) return;
  
  // Update cart count
  const totalItems = window.cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartCount) {
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'block' : 'none';
  }
  
  // Update cart items
  if (window.cart.length === 0) {
    cartItemsList.innerHTML = `
      <div class="empty-cart">
        <div class="empty-cart-icon">🛒</div>
        <p>Your cart is empty</p>
        <p class="empty-cart-text">Add some delicious items to get started!</p>
      </div>
    `;
  } else {
    cartItemsList.innerHTML = window.cart.map(item => `
      <div class="cart-item" data-item-id="${item.id}">
        <div class="item-image">
          <img src="${item.image}" alt="${item.name}" loading="lazy">
        </div>
        <div class="item-details">
          <h4 class="item-name">${item.name}</h4>
          <p class="item-description">${item.description}</p>
          <div class="item-category">${categories[item.category]?.name || 'Other'}</div>
          ${item.customizations ? `
            <div class="item-customizations">
              ${item.customizations.portionSize !== 'regular' ? `<span class="customization-tag">${item.customizations.portionSize}</span>` : ''}
              ${item.customizations.spiceLevel !== 'medium' ? `<span class="customization-tag">${item.customizations.spiceLevel} spice</span>` : ''}
              ${item.customizations.specialRequests ? `<span class="customization-tag">Special requests</span>` : ''}
            </div>
          ` : ''}
          <div class="item-price">$${item.price.toFixed(2)} each</div>
        </div>
        <div class="item-controls">
          <div class="quantity-controls">
            <button class="qty-btn" onclick="updateQuantity('${item.id}', -1)">−</button>
            <span class="quantity">${item.quantity}</span>
            <button class="qty-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
          </div>
          <div class="item-total">$${(item.price * item.quantity).toFixed(2)}</div>
          <button class="remove-item" onclick="removeFromCart('${item.id}')" title="Remove item">
            🗑️
          </button>
        </div>
      </div>
    `).join('');
  }
  
  // Update totals
  const subtotal = window.cartTotal;
  const tax = subtotal * 0.10; // 10% tax
  const total = subtotal + tax;
  
  if (cartSubtotal) cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
  if (cartTax) cartTax.textContent = `$${tax.toFixed(2)}`;
  if (cartTotalDisplay) cartTotalDisplay.textContent = `$${total.toFixed(2)}`;
  
  // Enable/disable checkout button
  if (checkoutBtn) {
    checkoutBtn.disabled = window.cart.length === 0;
  }
};

// Update item quantity
window.updateQuantity = (itemId, change) => {
  const item = window.cart.find(cartItem => cartItem.id === itemId);
  if (!item) return;
  
  const newQuantity = item.quantity + change;
  if (newQuantity <= 0) {
    removeFromCart(itemId);
    return;
  }
  
  item.quantity = newQuantity;
  window.saveCart();
  updateCartTotal();
  updateCartDisplay();
  
  showNotification(`${item.name} quantity updated to ${newQuantity}`);
};

// Remove item from cart
window.removeFromCart = (itemId) => {
  const itemIndex = window.cart.findIndex(cartItem => cartItem.id === itemId);
  if (itemIndex === -1) return;
  
  const item = window.cart[itemIndex];
  window.cart.splice(itemIndex, 1);
  cart = window.cart; // Keep sync
  window.saveCart();
  updateCartTotal();
  updateCartDisplay();
  
  showNotification(`${item.name} removed from cart`);
};

// Clear entire cart
window.clearCart = () => {
  if (window.cart.length === 0) return;
  
  if (confirm('Are you sure you want to clear your cart?')) {
    window.cart = [];
    cart = [];
    cartTotal = 0;
    window.saveCart();
    updateCartDisplay();
    showNotification('Cart cleared');
  }
};

// Proceed to checkout
window.proceedToCheckout = () => {
  if (typeof window.ensureLoggedIn === 'function' && !window.ensureLoggedIn()) return;
  if (window.cart.length === 0) {
    showNotification('Your cart is empty', 'error');
    return;
  }
  
  // Close cart sidebar
  toggleCartSidebar();
  
  // Show payment modal
  showPaymentModal();
};

// Show payment modal
const showPaymentModal = () => {
  const modal = document.getElementById('paymentModal');
  const cartItemsContainer = document.getElementById('cartItems');
  const cartTotalElement = document.getElementById('cartTotal');
  const qrTotalElement = document.getElementById('qrTotal');
  const qrAmountDisplay = document.getElementById('qrAmountDisplay');
  
  // Calculate totals with tax
  const subtotal = cartTotal;
  const tax = subtotal * 0.10; // 10% tax
  const total = subtotal + tax;
  
  // Populate cart items
  cartItemsContainer.innerHTML = '';
  window.cart.forEach(item => {
    const itemHTML = `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name} x${item.quantity}</div>
          <div class="cart-item-category">${categories[item.category]?.name || 'Other'}</div>
          <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
        </div>
      </div>
    `;
    cartItemsContainer.insertAdjacentHTML('beforeend', itemHTML);
  });
  
  // Add tax and total rows
  const totalsHTML = `
    <div class="cart-totals-breakdown">
      <div class="total-row">
        <span>Subtotal:</span>
        <span>$${subtotal.toFixed(2)}</span>
      </div>
      <div class="total-row">
        <span>Tax (10%):</span>
        <span>$${tax.toFixed(2)}</span>
      </div>
      <div class="total-row final-total">
        <span>Total:</span>
        <span>$${total.toFixed(2)}</span>
      </div>
    </div>
  `;
  cartItemsContainer.insertAdjacentHTML('beforeend', totalsHTML);
  
  // Update total displays
  if (cartTotalElement) cartTotalElement.textContent = total.toFixed(2);
  if (qrTotalElement) qrTotalElement.textContent = total.toFixed(2);
  if (qrAmountDisplay) qrAmountDisplay.textContent = total.toFixed(2);
  
  // Show modal
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
};

// Close payment modal
const closePaymentModal = () => {
  const modal = document.getElementById('paymentModal');
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
};

// Process payment with demo API integration
const processPayment = async () => {
  if (typeof window.ensureLoggedIn === 'function' && !window.ensureLoggedIn()) return;
  
  const selectedPayment = document.querySelector('input[name="payment"]:checked').value;
  const confirmBtn = document.getElementById('confirmPayment');
  
  // Show loading state
  const originalText = confirmBtn.innerHTML;
  confirmBtn.innerHTML = '⏳ Processing...';
  confirmBtn.disabled = true;
  
  try {
    // Calculate totals
    const subtotal = cartTotal;
    const tax = subtotal * 0.10;
    const totalAmount = subtotal + tax;
    
    // Prepare order data for database API
    const orderData = {
      items: window.cart.map(item => ({
        menuItemId: getMenuItemId(item.name) || 1, // Get actual menu item ID from database
        quantity: item.quantity,
        specialInstructions: item.customizations?.specialRequests || ''
      })),
      paymentMethod: selectedPayment === 'credit' ? 'credit_card' :
                    selectedPayment === 'paypal' ? 'paypal' :
                    selectedPayment === 'cash' ? 'cash_on_delivery' : 'qr_code',
      deliveryAddress: 'Website Order - Home Delivery',
      specialInstructions: 'Order placed from main website'
    };
    
    console.log('Placing order via demo API:', orderData);
    
    // Submit order to backend - try database first, fallback to demo
    let response;
    try {
      response = await grilliAPI.createOrder(orderData);
    } catch (error) {
      console.log('Database order failed, trying demo API...', error);
      // Fallback to demo API if database is not available
      const demoData = {
        items: window.cart.map(item => ({
          id: item.id || Date.now(),
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity
        })),
        total_amount: totalAmount,
        payment_method: selectedPayment === 'credit' ? 'credit_card' :
                       selectedPayment === 'paypal' ? 'paypal' :
                       selectedPayment === 'cash' ? 'cash_on_delivery' : 'qr_code',
        customer_name: window.currentUser?.firstName + ' ' + window.currentUser?.lastName || 'Website Customer',
        customer_email: window.currentUser?.email || 'customer@grilli.com',
        delivery_address: 'Website Order - Home Delivery',
        special_instructions: 'Order placed from main website (Demo Mode)'
      };
      response = await grilliAPI.placeDemoOrder(demoData);
    }
    
    if (response && response.success) {
      // Clear cart
      window.cart = [];
      cart = [];
      cartTotal = 0;
      window.saveCart();
      updateCartDisplay();
      
      // Close payment modal
      closePaymentModal();
      
      // Show success message
      showNotification(`🎉 Order placed successfully! Order Number: ${response.order.orderNumber}`, 'success');
      
      // Show additional info after a delay
      setTimeout(() => {
        showNotification(`📊 Check the admin panel to view and manage your order`, 'info');
      }, 2000);
      
      console.log('Order placed successfully:', response.order);
    } else {
      throw new Error(response?.message || 'Failed to place order');
    }
    
  } catch (error) {
    console.error('Payment processing failed:', error);
    showNotification('Failed to process payment: ' + error.message, 'error');
    
    // Restore button state
    confirmBtn.innerHTML = originalText;
    confirmBtn.disabled = false;
    return;
  }
  
  // Restore button state on success
  confirmBtn.innerHTML = originalText;
  confirmBtn.disabled = false;
};

// Show QR payment instructions
const showQRPaymentInstructions = () => {
  closePaymentModal();
  
  // Show QR payment notification
  showNotification('Please scan the QR code with PhonePe app to complete payment. Your order will be confirmed once payment is received.', 'info');
  
  // You could keep the cart for QR payments or clear it based on your preference
  // For now, we'll keep it so they can try again if needed
};

// Show success message
const showSuccessMessage = async () => {
  closePaymentModal();
  
  try {
    // Check if user is logged in
    if (!isLoggedIn) {
      showNotification('Please login to place an order', 'warning');
      openLoginModal();
      return;
    }

    // Prepare order data for API
    // Resolve item names to real backend IDs (fallback to ID map if available)
    // Resolve menu IDs reliably (always refresh mapping at payment time)
    await preloadBackendMenuMap();
    const finalItems = cart.map(item => ({
      menuItemId: getMenuIdByName(item.name),
      quantity: item.quantity,
      specialInstructions: item.specialInstructions ?? ""
    }));

    const missing = finalItems.filter(i => !i.menuItemId);
    if (missing.length) {
      showNotification('Some menu items are not available in the backend menu. Please remove and re-add them.', 'error');
      return;
    }

    let orderData = {
      items: finalItems,
      paymentMethod: (document.querySelector('input[name="payment"]:checked')?.value === 'credit') ? 'credit_card'
                     : (document.querySelector('input[name="payment"]:checked')?.value === 'paypal') ? 'paypal'
                     : (document.querySelector('input[name="payment"]:checked')?.value === 'cash') ? 'cash_on_delivery'
                     : 'qr_code',
      deliveryAddress: document.getElementById('deliveryAddress')?.value ?? "",
      specialInstructions: document.getElementById('orderNotes')?.value ?? ""
    };

    // Submit order to API
    const response = await grilliAPI.createOrder(orderData);
    
    if (response.success) {
      // Create local order for tracking
      const order = createOrderFromAPI(response.order);
      
      // Clear cart
      cart = [];
      cartTotal = 0;
      updateCartDisplay();
      
      // Show success notification
      showNotification('Order placed successfully! Thank you for your order.', 'success');
      
      // Show order tracking modal
      setTimeout(() => {
        showOrderTracking(order);
      }, 1500);
    } else {
      showNotification('Failed to place order. Please try again.', 'error');
    }
  } catch (error) {
    console.error('Order submission error:', error);
    showNotification('Failed to place order. Please try again.', 'error');
  }
};

// Create order from API response
const createOrderFromAPI = (apiOrder) => {
  const now = new Date();
  
  // Calculate estimated times
  const prepTime = calculatePrepTime();
  const deliveryTime = calculateDeliveryTime();
  
  const order = {
    id: apiOrder.id,
    orderNumber: apiOrder.orderNumber,
    items: [...cart], // Keep cart items for display
    total: apiOrder.totalAmount,
    status: apiOrder.status,
    createdAt: now.toISOString(),
    estimatedPrepTime: prepTime,
    estimatedDeliveryTime: deliveryTime,
    currentStage: 'received',
    stages: {
      received: {
        status: 'completed',
        timestamp: now.toISOString(),
        message: 'Order received and confirmed'
      },
      preparing: {
        status: 'pending',
        timestamp: null,
        message: 'Chef is preparing your delicious meal',
        estimatedTime: new Date(now.getTime() + (prepTime * 60 * 1000)).toISOString()
      },
      ready: {
        status: 'pending',
        timestamp: null,
        message: 'Your order is ready for pickup/delivery',
        estimatedTime: new Date(now.getTime() + (prepTime * 60 * 1000)).toISOString()
      },
      outForDelivery: {
        status: 'pending',
        timestamp: null,
        message: 'Your order is out for delivery',
        estimatedTime: new Date(now.getTime() + (deliveryTime * 60 * 1000)).toISOString()
      },
      delivered: {
        status: 'pending',
        timestamp: null,
        message: 'Order delivered successfully!',
        estimatedTime: new Date(now.getTime() + (deliveryTime * 60 * 1000)).toISOString()
      }
    }
  };
  
  // Save order to localStorage for tracking
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  orders.push(order);
  localStorage.setItem('orders', JSON.stringify(orders));
  
  // Start order tracking simulation
  startOrderTracking(order);
  
  return order;
};

// Create order with tracking information (fallback for localStorage)
const createOrder = () => {
  const orderId = generateOrderId();
  const now = new Date();
  
  // Calculate estimated times
  const prepTime = calculatePrepTime();
  const deliveryTime = calculateDeliveryTime();
  
  const order = {
    id: orderId,
    items: [...cart],
    total: cartTotal + (cartTotal * 0.10), // Include tax
    status: 'received',
    createdAt: now.toISOString(),
    estimatedPrepTime: prepTime,
    estimatedDeliveryTime: deliveryTime,
    currentStage: 'received',
    stages: {
      received: {
        status: 'completed',
        timestamp: now.toISOString(),
        message: 'Order received and confirmed'
      },
      preparing: {
        status: 'pending',
        timestamp: null,
        message: 'Chef is preparing your delicious meal',
        estimatedTime: new Date(now.getTime() + (prepTime * 60 * 1000)).toISOString()
      },
      ready: {
        status: 'pending',
        timestamp: null,
        message: 'Your order is ready for pickup/delivery',
        estimatedTime: new Date(now.getTime() + (prepTime * 60 * 1000)).toISOString()
      },
      outForDelivery: {
        status: 'pending',
        timestamp: null,
        message: 'Your order is out for delivery',
        estimatedTime: new Date(now.getTime() + (deliveryTime * 60 * 1000)).toISOString()
      },
      delivered: {
        status: 'pending',
        timestamp: null,
        message: 'Order delivered successfully!',
        estimatedTime: new Date(now.getTime() + (deliveryTime * 60 * 1000)).toISOString()
      }
    }
  };
  
  // Save order to localStorage
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  orders.push(order);
  localStorage.setItem('orders', JSON.stringify(orders));
  
  // Start order tracking simulation
  startOrderTracking(order);
  
  return order;
};

// Generate unique order ID
const generateOrderId = () => {
  return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
};

// Calculate preparation time based on order complexity
const calculatePrepTime = () => {
  let totalPrepTime = 15; // Base prep time
  
  cart.forEach(item => {
    // Add time based on item complexity
    if (item.category === 'mains') totalPrepTime += 8;
    else if (item.category === 'appetizers') totalPrepTime += 5;
    else if (item.category === 'desserts') totalPrepTime += 3;
    else totalPrepTime += 6;
    
    // Add time for customizations
    if (item.customizations) {
      if (item.customizations.portionSize === 'large') totalPrepTime += 3;
      if (item.customizations.portionSize === 'family') totalPrepTime += 8;
      if (item.customizations.specialRequests) totalPrepTime += 2;
    }
    
    // Add time for quantity
    totalPrepTime += (item.quantity - 1) * 2;
  });
  
  return Math.min(totalPrepTime, 45); // Max 45 minutes
};

// Calculate delivery time
const calculateDeliveryTime = () => {
  // Simulate delivery time based on location (15-30 minutes)
  return 20 + Math.floor(Math.random() * 15);
};

// Start order tracking simulation
const startOrderTracking = (order) => {
  const stages = ['received', 'preparing', 'ready', 'outForDelivery', 'delivered'];
  let currentStageIndex = 0;
  
  const updateOrderStage = () => {
    if (currentStageIndex >= stages.length) return;
    
    const currentStage = stages[currentStageIndex];
    const now = new Date();
    
    // Update order status
    order.currentStage = currentStage;
    order.stages[currentStage].status = 'completed';
    order.stages[currentStage].timestamp = now.toISOString();
    
    // Update next stage to current
    if (currentStageIndex < stages.length - 1) {
      const nextStage = stages[currentStageIndex + 1];
      order.stages[nextStage].status = 'current';
    }
    
    // Save updated order
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const orderIndex = orders.findIndex(o => o.id === order.id);
    if (orderIndex !== -1) {
      orders[orderIndex] = order;
      localStorage.setItem('orders', JSON.stringify(orders));
    }
    
    // Update tracking display if modal is open
    updateTrackingDisplay(order);
    
    // Show notification for important stages
    if (currentStage === 'preparing') {
      showNotification('👨‍🍳 Your order is being prepared!', 'info');
    } else if (currentStage === 'ready') {
      showNotification('✅ Your order is ready!', 'success');
    } else if (currentStage === 'outForDelivery') {
      showNotification('🚚 Your order is out for delivery!', 'info');
    } else if (currentStage === 'delivered') {
      showNotification('🎉 Order delivered! Enjoy your meal!', 'success');
    }
    
    currentStageIndex++;
    
    // Schedule next update
    if (currentStageIndex < stages.length) {
      const nextStage = stages[currentStageIndex];
      const timeUntilNext = getTimeUntilNextStage(currentStage, nextStage);
      setTimeout(updateOrderStage, timeUntilNext);
    }
  };
  
  // Start the tracking process
  setTimeout(updateOrderStage, 2000); // Start preparing after 2 seconds
};

// Get time until next stage
const getTimeUntilNextStage = (currentStage, nextStage) => {
  const stageTimes = {
    'received': 2000, // 2 seconds
    'preparing': 30000, // 30 seconds (simulated)
    'ready': 5000, // 5 seconds
    'outForDelivery': 20000, // 20 seconds (simulated)
    'delivered': 0
  };
  
  return stageTimes[currentStage] || 10000;
};

// Show order tracking modal
const showOrderTracking = (order) => {
  const trackingHTML = `
    <div id="orderTrackingModal" class="order-tracking-modal" style="display: none;">
      <div class="tracking-content">
        <div class="tracking-header">
          <h2>📦 Order Tracking</h2>
          <button class="close-tracking" onclick="closeOrderTracking()">&times;</button>
        </div>
        
        <div class="order-info">
          <div class="order-id">
            <span class="label">Order ID:</span>
            <span class="value">${order.id}</span>
          </div>
          <div class="order-total">
            <span class="label">Total:</span>
            <span class="value">$${order.total.toFixed(2)}</span>
          </div>
          <div class="order-time">
            <span class="label">Ordered at:</span>
            <span class="value">${formatOrderTime(new Date(order.createdAt))}</span>
          </div>
        </div>
        
        <div class="tracking-stages">
          <div class="stage received ${order.stages.received.status}" data-stage="received">
            <div class="stage-icon">📋</div>
            <div class="stage-content">
              <h3>Order Received</h3>
              <p>${order.stages.received.message}</p>
              <span class="stage-time">${formatOrderTime(new Date(order.stages.received.timestamp))}</span>
            </div>
          </div>
          
          <div class="stage preparing ${order.stages.preparing.status}" data-stage="preparing">
            <div class="stage-icon">👨‍🍳</div>
            <div class="stage-content">
              <h3>Preparing</h3>
              <p>${order.stages.preparing.message}</p>
              <span class="stage-time">${order.stages.preparing.timestamp ? formatOrderTime(new Date(order.stages.preparing.timestamp)) : 'Estimated: ' + formatOrderTime(new Date(order.stages.preparing.estimatedTime))}</span>
            </div>
          </div>
          
          <div class="stage ready ${order.stages.ready.status}" data-stage="ready">
            <div class="stage-icon">✅</div>
            <div class="stage-content">
              <h3>Ready</h3>
              <p>${order.stages.ready.message}</p>
              <span class="stage-time">${order.stages.ready.timestamp ? formatOrderTime(new Date(order.stages.ready.timestamp)) : 'Estimated: ' + formatOrderTime(new Date(order.stages.ready.estimatedTime))}</span>
            </div>
          </div>
          
          <div class="stage delivery ${order.stages.outForDelivery.status}" data-stage="outForDelivery">
            <div class="stage-icon">🚚</div>
            <div class="stage-content">
              <h3>Out for Delivery</h3>
              <p>${order.stages.outForDelivery.message}</p>
              <span class="stage-time">${order.stages.outForDelivery.timestamp ? formatOrderTime(new Date(order.stages.outForDelivery.timestamp)) : 'Estimated: ' + formatOrderTime(new Date(order.stages.outForDelivery.estimatedTime))}</span>
            </div>
          </div>
          
          <div class="stage delivered ${order.stages.delivered.status}" data-stage="delivered">
            <div class="stage-icon">🎉</div>
            <div class="stage-content">
              <h3>Delivered</h3>
              <p>${order.stages.delivered.message}</p>
              <span class="stage-time">${order.stages.delivered.timestamp ? formatOrderTime(new Date(order.stages.delivered.timestamp)) : 'Estimated: ' + formatOrderTime(new Date(order.stages.delivered.estimatedTime))}</span>
            </div>
          </div>
        </div>
        
        <div class="tracking-actions">
          <button class="btn btn-secondary" onclick="closeOrderTracking()">Close</button>
          <button class="btn btn-primary" onclick="refreshTracking('${order.id}')">Refresh</button>
        </div>
      </div>
    </div>
  `;
  
  // Remove existing modal if any
  const existingModal = document.getElementById('orderTrackingModal');
  if (existingModal) {
    existingModal.remove();
  }
  
  document.body.insertAdjacentHTML('beforeend', trackingHTML);
  
  // Show modal
  const modal = document.getElementById('orderTrackingModal');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  
  // Store current order for updates
  window.currentTrackingOrder = order;
};

// Update tracking display
const updateTrackingDisplay = (order) => {
  const modal = document.getElementById('orderTrackingModal');
  if (!modal) return;
  
  // Update stage statuses
  Object.keys(order.stages).forEach(stageKey => {
    const stageElement = modal.querySelector(`[data-stage="${stageKey}"]`);
    if (stageElement) {
      stageElement.className = `stage ${stageKey} ${order.stages[stageKey].status}`;
      
      const timeElement = stageElement.querySelector('.stage-time');
      if (timeElement) {
        if (order.stages[stageKey].timestamp) {
          timeElement.textContent = formatOrderTime(new Date(order.stages[stageKey].timestamp));
        } else {
          timeElement.textContent = 'Estimated: ' + formatOrderTime(new Date(order.stages[stageKey].estimatedTime));
        }
      }
    }
  });
};

// Close order tracking modal
window.closeOrderTracking = () => {
  const modal = document.getElementById('orderTrackingModal');
  if (modal) {
    modal.remove();
    document.body.style.overflow = 'auto';
  }
  delete window.currentTrackingOrder;
};

// Refresh tracking
window.refreshTracking = (orderId) => {
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  const order = orders.find(o => o.id === orderId);
  if (order) {
    updateTrackingDisplay(order);
    showNotification('Tracking updated!', 'success');
  }
};

// Format time for display (reservation system)
const formatReservationTime = (date) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

// Format time for display (order tracking system)
const formatOrderTime = (date) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

// Format date for display (order tracking system)
const formatOrderDate = (date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Show order history
const showOrderHistory = () => {
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  
  if (orders.length === 0) {
    showNotification('No orders found. Place an order to see tracking!', 'info');
    return;
  }
  
  // Sort orders by creation date (newest first)
  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  const historyHTML = `
    <div id="orderHistoryModal" class="order-history-modal" style="display: none;">
      <div class="history-content">
        <div class="history-header">
          <h2>📦 Order History</h2>
          <button class="close-history" onclick="closeOrderHistory()">&times;</button>
        </div>
        
        <div class="orders-list">
          ${orders.map(order => `
            <div class="order-card" data-order-id="${order.id}">
              <div class="order-card-header">
                <div class="order-info">
                  <h3>Order #${order.id}</h3>
                  <p class="order-date">${formatOrderDate(new Date(order.createdAt))} at ${formatOrderTime(new Date(order.createdAt))}</p>
                </div>
                <div class="order-status">
                  <span class="status-badge ${order.currentStage}">${getStatusText(order.currentStage)}</span>
                  <span class="order-total">$${order.total.toFixed(2)}</span>
                </div>
              </div>
              
              <div class="order-items">
                <h4>Items:</h4>
                <div class="items-list">
                  ${order.items.map(item => `
                    <div class="order-item">
                      <span class="item-name">${item.name} x${item.quantity}</span>
                      ${item.customizations ? `
                        <div class="item-customizations">
                          ${item.customizations.portionSize !== 'regular' ? `<span class="customization-tag">${item.customizations.portionSize}</span>` : ''}
                          ${item.customizations.spiceLevel !== 'medium' ? `<span class="customization-tag">${item.customizations.spiceLevel} spice</span>` : ''}
                        </div>
                      ` : ''}
                    </div>
                  `).join('')}
                </div>
              </div>
              
              <div class="order-actions">
                <button class="btn btn-primary" onclick="trackOrder('${order.id}')">
                  <span class="btn-icon">👁️</span>
                  Track Order
                </button>
                ${order.currentStage === 'delivered' ? `
                  <button class="btn btn-secondary" onclick="reorderItems('${order.id}')">
                    <span class="btn-icon">🔄</span>
                    Reorder
                  </button>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="history-actions">
          <button class="btn btn-secondary" onclick="closeOrderHistory()">Close</button>
        </div>
      </div>
    </div>
  `;
  
  // Remove existing modal if any
  const existingModal = document.getElementById('orderHistoryModal');
  if (existingModal) {
    existingModal.remove();
  }
  
  document.body.insertAdjacentHTML('beforeend', historyHTML);
  
  // Show modal
  const modal = document.getElementById('orderHistoryModal');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
};

// Get status text
const getStatusText = (stage) => {
  const statusTexts = {
    'received': 'Received',
    'preparing': 'Preparing',
    'ready': 'Ready',
    'outForDelivery': 'Out for Delivery',
    'delivered': 'Delivered'
  };
  return statusTexts[stage] || 'Unknown';
};

// Track specific order
window.trackOrder = (orderId) => {
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  const order = orders.find(o => o.id === orderId);
  
  if (order) {
    closeOrderHistory();
    showOrderTracking(order);
  }
};

// Reorder items
window.reorderItems = (orderId) => {
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  const order = orders.find(o => o.id === orderId);
  
  if (order) {
    // Add items to cart
    order.items.forEach(item => {
      cart.push({
        ...item,
        id: generateItemId() // Generate new ID
      });
    });
    
    updateCartTotal();
    updateCartDisplay();
    closeOrderHistory();
    
    showNotification('Items added to cart! Review and checkout.', 'success');
  }
};

// Close order history
window.closeOrderHistory = () => {
  const modal = document.getElementById('orderHistoryModal');
  if (modal) {
    modal.remove();
    document.body.style.overflow = 'auto';
  }
};

// Format date for display (reservation system)
const formatReservationDate = (date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Show notification - make globally accessible
window.showNotification = (message, type = 'info') => {
  console.log('Notification:', message, type);
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    z-index: 10001;
    font-weight: bold;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
};

// Generate categorized menu HTML
const generateCategorizedMenu = () => {
  const menuSection = document.querySelector('#menu .grid-list');
  if (!menuSection) return;
  
  // We'll only clear and replace after we have valid content ready
  
  // Create category tabs with styling
  const categoryTabs = document.createElement('div');
  categoryTabs.className = 'category-tabs';
  
  // Add CSS styles for category tabs
  const tabsStyle = document.createElement('style');
  tabsStyle.textContent = `
    .category-tabs {
      margin: 30px 0;
      display: flex;
      justify-content: center;
      background: var(--eerie-black-3);
      border-radius: 15px;
      padding: 10px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }
    .category-tabs-container {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: center;
    }
    .category-tab {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border: none;
      background: transparent;
      color: var(--quick-silver);
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: var(--fontFamily-dm_sans);
      font-size: var(--fontSize-label-1);
      font-weight: var(--weight-medium);
    }
    .category-tab:hover {
      background: var(--gold-crayola);
      color: var(--eerie-black-1);
      transform: translateY(-2px);
    }
    .category-tab.active {
      background: var(--gold-crayola);
      color: var(--eerie-black-1);
      box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
    }
    .category-icon {
      font-size: 18px;
    }
    .category-name {
      font-weight: var(--weight-bold);
    }
    @media (max-width: 768px) {
      .category-tab {
        padding: 8px 12px;
        font-size: var(--fontSize-label-2);
      }
      .category-icon {
        font-size: 16px;
      }
    }
    .no-items {
      text-align: center;
      padding: 40px 20px;
      color: var(--quick-silver);
    }
  `;
  
  if (!document.querySelector('#category-tabs-style')) {
    tabsStyle.id = 'category-tabs-style';
    document.head.appendChild(tabsStyle);
  }
  
  categoryTabs.innerHTML = `
    <div class="category-tabs-container">
      ${Object.keys(categories).map(categoryKey => `
        <button class="category-tab ${categoryKey === 'appetizers' ? 'active' : ''}" 
                data-category="${categoryKey}">
          <span class="category-icon">${categories[categoryKey].icon}</span>
          <span class="category-name">${categories[categoryKey].name}</span>
        </button>
      `).join('')}
    </div>
  `;
  
  // Insert category tabs before the menu grid (only if not already present)
  if (!menuSection.parentNode.querySelector('.category-tabs')) {
    menuSection.parentNode.insertBefore(categoryTabs, menuSection);
  }
  
  // Use the existing UL as the render target to avoid layout/CSS issues
  // that can occur if we inject an extra wrapper before it.
  
  // Generate menu items for each category
  const generateMenuItems = (categoryKey) => {
    const category = categories[categoryKey];
    const items = window.menuItems[categoryKey] || {};
    
    if (Object.keys(items).length === 0) {
      return `<li class="no-items"><div class="menu-card"><div class="card-text label-1">No items available in this category</div></div></li>`;
    }
    
    return Object.keys(items).map(itemName => {
      const item = items[itemName];
      return `
        <li class="menu-item" data-category="${categoryKey}">
          <div class="menu-card hover:card">
            <figure class="card-banner img-holder" style="--width: 100; --height: 100;">
              <img src="${item.image}" width="100" height="100" loading="lazy" alt="${itemName}" class="img-cover">
            </figure>
            <div>
              <div class="title-wrapper">
                <h3 class="title-3">
                  <a href="#" class="card-title">${itemName}</a>
                </h3>
                <span class="category-badge" style="background-color: ${category.color}">${category.name}</span>
                <span class="span title-2">$${item.price.toFixed(2)}</span>
              </div>
              <p class="card-text label-1">${item.description}</p>
              <div class="card-actions" style="margin-top: 15px; display: flex; gap: 10px; align-items: center;">
                <button class="btn btn-secondary quick-add-btn" 
                        onclick="quickAddToCart('${itemName}', '${categoryKey}')" 
                        style="background: var(--gold-crayola); color: var(--eerie-black-1); border: none; padding: 8px 16px; border-radius: 25px; font-weight: bold; cursor: pointer; transition: all 0.3s ease;">
                  <span class="text text-1">🛒 Add to Cart</span>
                </button>
                <button class="btn btn-primary view-details-btn" 
                        onclick="showDishDetails('${itemName}', '${categoryKey}')" 
                        style="background: transparent; color: var(--gold-crayola); border: 2px solid var(--gold-crayola); padding: 8px 16px; border-radius: 25px; cursor: pointer; transition: all 0.3s ease;">
                  <span class="text text-1">👁️ View Details</span>
                </button>
              </div>
            </div>
          </div>
        </li>
      `;
    }).join('');
  };
  
  // Generate initial category HTML first, then swap into DOM
  const initialHtml = generateMenuItems('appetizers');
  if (initialHtml && typeof initialHtml === 'string' && initialHtml.trim().length > 0) {
    // Clear existing menu items and render the first category
    menuSection.innerHTML = initialHtml;
  }
  
  // Add click handlers to category tabs
  const tabs = categoryTabs.querySelectorAll('.category-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs
      tabs.forEach(t => t.classList.remove('active'));
      // Add active class to clicked tab
      tab.classList.add('active');
      
      // Get category
      const categoryKey = tab.dataset.category;
      
      // Update menu items in-place on the existing list
      menuSection.innerHTML = generateMenuItems(categoryKey);
      
      // Add click handlers to new menu items
      addMenuClickHandlers();
    });
  });
  
  // Add click handlers to initial menu items
  addMenuClickHandlers();
};

// Add click handlers to menu items
const addMenuClickHandlers = () => {
  const menuCards = document.querySelectorAll('.menu-card');
  menuCards.forEach(card => {
    const menuItem = card.closest('.menu-item');
    const category = menuItem ? menuItem.dataset.category : null;
    const titleElement = card.querySelector('.card-title');
    
    if (titleElement) {
      const dishName = titleElement.textContent.trim();
      
      // Add click handler to the entire card
      card.addEventListener('click', (e) => {
        e.preventDefault();
        // Require login if auth system present; queue action to resume
        if (typeof window.ensureLoggedIn === 'function') {
          if (!window.ensureLoggedIn(() => showDishDetails(dishName, category))) return;
        }
        showDishDetails(dishName, category);
      });
      
      // Add visual feedback
      card.style.cursor = 'pointer';
    }
  });
};

// Enhanced Reservation System
const initReservationSystem = () => {
  const reservationForm = document.querySelector('.reservation-form form');
  if (!reservationForm) return;
  
  // Set minimum date to today
  const dateInput = reservationForm.querySelector('input[name="reservation-date"]');
  if (dateInput) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.min = tomorrow.toISOString().split('T')[0];
    dateInput.max = new Date(today.getTime() + (90 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]; // 90 days from now
  }
  
  // Enhanced time slots based on restaurant hours
  const timeSelect = reservationForm.querySelector('select[name="person"]:last-of-type');
  if (timeSelect) {
    timeSelect.name = 'reservation-time';
    timeSelect.innerHTML = generateTimeSlots();
  }
  
  // Add form validation and submission
  reservationForm.addEventListener('submit', handleReservationSubmission);
  
  // Add real-time validation
  addReservationValidation();
  
  // Add table availability checking
  addTableAvailabilityCheck();
};

// Generate realistic time slots
const generateTimeSlots = () => {
  const slots = [];
  const lunchStart = 11; // 11:00 AM
  const lunchEnd = 14;   // 2:00 PM
  const dinnerStart = 17; // 5:00 PM
  const dinnerEnd = 21;   // 9:00 PM
  
  // Lunch slots
  for (let hour = lunchStart; hour <= lunchEnd; hour++) {
    for (let minutes = 0; minutes < 60; minutes += 30) {
      if (hour === lunchEnd && minutes > 0) break;
      const timeString = formatReservationTimeSlot(hour, minutes);
      slots.push(`<option value="${timeString}">${timeString}</option>`);
    }
  }
  
  // Dinner slots
  for (let hour = dinnerStart; hour <= dinnerEnd; hour++) {
    for (let minutes = 0; minutes < 60; minutes += 30) {
      if (hour === dinnerEnd && minutes > 0) break;
      const timeString = formatReservationTimeSlot(hour, minutes);
      slots.push(`<option value="${timeString}">${timeString}</option>`);
    }
  }
  
  return slots.join('');
};

// Format time helper (reservation system)
const formatReservationTimeSlot = (hour, minutes) => {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const displayMinutes = minutes.toString().padStart(2, '0');
  return `${displayHour}:${displayMinutes} ${period}`;
};

// Add reservation validation
const addReservationValidation = () => {
  const form = document.querySelector('.reservation-form form');
  const inputs = form.querySelectorAll('input, select, textarea');
  
  inputs.forEach(input => {
    input.addEventListener('blur', validateReservationField);
    input.addEventListener('input', clearFieldError);
  });
};

// Validate individual field
const validateReservationField = (e) => {
  const field = e.target;
  const value = field.value.trim();
  let isValid = true;
  let errorMessage = '';
  
  switch (field.name) {
    case 'name':
      if (!value) {
        errorMessage = 'Name is required';
        isValid = false;
      } else if (value.length < 2) {
        errorMessage = 'Name must be at least 2 characters';
        isValid = false;
      }
      break;
      
    case 'phone':
      if (!value) {
        errorMessage = 'Phone number is required';
        isValid = false;
      } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, ''))) {
        errorMessage = 'Please enter a valid phone number';
        isValid = false;
      }
      break;
      
    case 'reservation-date':
      if (!value) {
        errorMessage = 'Please select a date';
        isValid = false;
      } else {
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate <= today) {
          errorMessage = 'Please select a future date';
          isValid = false;
        }
      }
      break;
      
    case 'reservation-time':
      if (!value) {
        errorMessage = 'Please select a time';
        isValid = false;
      }
      break;
      
    case 'person':
      if (!value) {
        errorMessage = 'Please select number of guests';
        isValid = false;
      }
      break;
  }
  
  if (!isValid) {
    showFieldError(field, errorMessage);
  } else {
    clearFieldError(field);
  }
  
  return isValid;
};

// Show field error
const showFieldError = (field, message) => {
  clearFieldError(field);
  
  field.style.borderColor = '#e74c3c';
  const errorDiv = document.createElement('div');
  errorDiv.className = 'field-error';
  errorDiv.textContent = message;
  errorDiv.style.cssText = `
    color: #e74c3c;
    font-size: 12px;
    margin-top: 4px;
    font-weight: 500;
  `;
  
  field.parentNode.appendChild(errorDiv);
};

// Clear field error
const clearFieldError = (field) => {
  field.style.borderColor = '';
  const existingError = field.parentNode.querySelector('.field-error');
  if (existingError) {
    existingError.remove();
  }
};

// Add table availability checking
const addTableAvailabilityCheck = () => {
  const dateInput = document.querySelector('input[name="reservation-date"]');
  const timeSelect = document.querySelector('select[name="reservation-time"]');
  const personSelect = document.querySelector('select[name="person"]');
  
  if (dateInput && timeSelect && personSelect) {
    [dateInput, timeSelect, personSelect].forEach(input => {
      input.addEventListener('change', checkTableAvailability);
    });
  }
};

// Check table availability
const checkTableAvailability = () => {
  const dateInput = document.querySelector('input[name="reservation-date"]');
  const timeSelect = document.querySelector('select[name="reservation-time"]');
  const personSelect = document.querySelector('select[name="person"]');
  
  if (!dateInput.value || !timeSelect.value || !personSelect.value) return;
  
  // Simulate table availability check
  const guestCount = parseInt(personSelect.value);
  const isAvailable = checkAvailability(dateInput.value, timeSelect.value, guestCount);
  
  const availabilityDiv = document.querySelector('.table-availability') || createAvailabilityDiv();
  availabilityDiv.innerHTML = isAvailable 
    ? `<span class="available">✅ Table available for ${guestCount} guests</span>`
    : `<span class="unavailable">❌ No tables available for ${guestCount} guests at this time</span>`;
};

// Create availability div
const createAvailabilityDiv = () => {
  const div = document.createElement('div');
  div.className = 'table-availability';
  div.style.cssText = `
    margin-top: 10px;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
  `;
  
  const timeSelect = document.querySelector('select[name="reservation-time"]');
  timeSelect.parentNode.appendChild(div);
  return div;
};

// Simulate availability check
const checkAvailability = (date, time, guests) => {
  // Simulate some unavailable slots for demo
  const unavailableSlots = [
    '2024-12-25 19:00', // Christmas dinner
    '2024-12-31 20:00', // New Year's Eve
  ];
  
  const slotKey = `${date} ${time}`;
  if (unavailableSlots.includes(slotKey)) return false;
  
  // Simulate high demand for large groups
  if (guests > 6) {
    return Math.random() > 0.3; // 70% chance of availability
  }
  
  return Math.random() > 0.1; // 90% chance of availability
};

// Handle reservation submission
const handleReservationSubmission = (e) => {
  e.preventDefault();
  
  const form = e.target;
  const formData = new FormData(form);
  
  // Validate all fields
  const inputs = form.querySelectorAll('input, select, textarea');
  let isFormValid = true;
  
  inputs.forEach(input => {
    if (!validateReservationField({ target: input })) {
      isFormValid = false;
    }
  });
  
  if (!isFormValid) {
    showNotification('Please fix the errors in the form', 'error');
    return;
  }
  
  // Check table availability one more time
  const date = formData.get('reservation-date');
  const time = formData.get('reservation-time');
  const guests = formData.get('person');
  
  if (!checkAvailability(date, time, parseInt(guests))) {
    showNotification('Sorry, no tables are available for your selected time. Please choose a different time.', 'error');
    return;
  }
  
  // Process reservation
  processReservation(formData);
};

// Process reservation
const processReservation = (formData) => {
  const reservationData = {
    name: formData.get('name'),
    phone: formData.get('phone'),
    guests: formData.get('person'),
    date: formData.get('reservation-date'),
    time: formData.get('reservation-time'),
    message: formData.get('message') || '',
    timestamp: new Date().toISOString(),
    id: generateReservationId()
  };
  
  // Save to localStorage (in real app, this would go to server)
  const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
  reservations.push(reservationData);
  localStorage.setItem('reservations', JSON.stringify(reservations));
  
  // Show confirmation
  showReservationConfirmation(reservationData);
  
  // Reset form
  document.querySelector('.reservation-form form').reset();
  document.querySelectorAll('.table-availability').forEach(el => el.remove());
};

// Generate reservation ID
const generateReservationId = () => {
  return 'RES-' + Date.now().toString(36).toUpperCase();
};

// Show reservation confirmation
const showReservationConfirmation = (reservation) => {
  const confirmationHTML = `
    <div class="reservation-confirmation">
      <div class="confirmation-header">
        <h3>🎉 Reservation Confirmed!</h3>
        <p>Reservation ID: <strong>${reservation.id}</strong></p>
      </div>
      <div class="confirmation-details">
        <div class="detail-row">
          <span class="label">Name:</span>
          <span class="value">${reservation.name}</span>
        </div>
        <div class="detail-row">
          <span class="label">Phone:</span>
          <span class="value">${reservation.phone}</span>
        </div>
        <div class="detail-row">
          <span class="label">Date:</span>
          <span class="value">${formatReservationDateString(reservation.date)}</span>
        </div>
        <div class="detail-row">
          <span class="label">Time:</span>
          <span class="value">${reservation.time}</span>
        </div>
        <div class="detail-row">
          <span class="label">Guests:</span>
          <span class="value">${reservation.guests}</span>
        </div>
        ${reservation.message ? `
        <div class="detail-row">
          <span class="label">Message:</span>
          <span class="value">${reservation.message}</span>
        </div>
        ` : ''}
      </div>
      <div class="confirmation-actions">
        <button class="btn btn-primary" onclick="closeReservationConfirmation()">Close</button>
        <button class="btn btn-secondary" onclick="printReservation()">Print</button>
      </div>
    </div>
  `;
  
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'reservation-confirmation-modal';
  modal.innerHTML = confirmationHTML;
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  `;
  
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
  
  // Add global functions
  window.closeReservationConfirmation = () => {
    document.body.removeChild(modal);
    document.body.style.overflow = 'auto';
    delete window.closeReservationConfirmation;
    delete window.printReservation;
  };
  
  window.printReservation = () => {
    window.print();
  };
};

// Format date helper (reservation system)
const formatReservationDateString = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Enhanced Find A Table System
const initFindTableSystem = () => {
  const findTableBtn = document.querySelector('.btn-secondary');
  if (!findTableBtn) return;
  
  // Update the Find A Table button
  findTableBtn.innerHTML = `
    <span class="text text-1">Find A Table</span>
    <span class="text text-2" aria-hidden="true">Find A Table</span>
  `;
  
  // Add click handler
  findTableBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showFindTableModal();
  });
  
  // Create the Find Table modal
  createFindTableModal();
};

// Create Find Table Modal
const createFindTableModal = () => {
  const modalHTML = `
    <div id="findTableModal" class="find-table-modal" style="display: none;">
      <div class="find-table-content">
        <div class="modal-header">
          <h2>🍽️ Find Your Perfect Table</h2>
          <span class="close-find-table-modal">&times;</span>
        </div>
        
        <div class="table-search-section">
          <div class="search-filters">
            <div class="filter-group">
              <label>👥 Number of Guests</label>
              <select id="guestCount" class="filter-select">
                <option value="">Select guests</option>
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4 Guests</option>
                <option value="5">5 Guests</option>
                <option value="6">6 Guests</option>
                <option value="7">7 Guests</option>
                <option value="8">8 Guests</option>
                <option value="9+">9+ Guests (Private Dining)</option>
              </select>
            </div>
            
            <div class="filter-group">
              <label>📅 Preferred Date</label>
              <input type="date" id="preferredDate" class="filter-input" min="">
            </div>
            
            <div class="filter-group">
              <label>🕐 Preferred Time</label>
              <select id="preferredTime" class="filter-select">
                <option value="">Select time</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="11:30 AM">11:30 AM</option>
                <option value="12:00 PM">12:00 PM</option>
                <option value="12:30 PM">12:30 PM</option>
                <option value="1:00 PM">1:00 PM</option>
                <option value="1:30 PM">1:30 PM</option>
                <option value="2:00 PM">2:00 PM</option>
                <option value="5:00 PM">5:00 PM</option>
                <option value="5:30 PM">5:30 PM</option>
                <option value="6:00 PM">6:00 PM</option>
                <option value="6:30 PM">6:30 PM</option>
                <option value="7:00 PM">7:00 PM</option>
                <option value="7:30 PM">7:30 PM</option>
                <option value="8:00 PM">8:00 PM</option>
                <option value="8:30 PM">8:30 PM</option>
                <option value="9:00 PM">9:00 PM</option>
              </select>
            </div>
            
            <div class="filter-group">
              <label>🪑 Table Type</label>
              <select id="tableType" class="filter-select">
                <option value="">Any table</option>
                <option value="window">🪟 Window Table</option>
                <option value="booth">🛋️ Booth Seating</option>
                <option value="outdoor">🌿 Outdoor Patio</option>
                <option value="private">🏛️ Private Dining</option>
                <option value="bar">🍸 Bar Seating</option>
              </select>
            </div>
          </div>
          
          <button id="searchTables" class="search-btn">
            <span>🔍 Search Available Tables</span>
          </button>
        </div>
        
        <div class="table-results" id="tableResults" style="display: none;">
          <h3>Available Tables</h3>
          <div class="results-container" id="resultsContainer">
            <!-- Results will be populated here -->
          </div>
        </div>
        
        <div class="quick-booking" id="quickBooking" style="display: none;">
          <h3>Quick Book</h3>
          <div class="booking-form">
            <input type="text" id="customerName" placeholder="Your Name" class="booking-input">
            <input type="tel" id="customerPhone" placeholder="Phone Number" class="booking-input">
            <textarea id="specialRequests" placeholder="Special requests (optional)" class="booking-textarea"></textarea>
            <button id="confirmBooking" class="confirm-btn">Confirm Booking</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Set minimum date
  const dateInput = document.getElementById('preferredDate');
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.min = tomorrow.toISOString().split('T')[0];
    dateInput.max = new Date(tomorrow.getTime() + (90 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
  }
  
  // Add event listeners
  setupFindTableEventListeners();
};

// Setup event listeners for Find Table modal
const setupFindTableEventListeners = () => {
  const modal = document.getElementById('findTableModal');
  const closeBtn = document.querySelector('.close-find-table-modal');
  const searchBtn = document.getElementById('searchTables');
  const confirmBtn = document.getElementById('confirmBooking');
  
  // Close modal
  closeBtn.addEventListener('click', closeFindTableModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeFindTableModal();
  });
  
  // Search tables
  searchBtn.addEventListener('click', searchAvailableTables);
  
  // Confirm booking
  confirmBtn.addEventListener('click', confirmTableBooking);
  
  // Real-time search as filters change
  const filters = document.querySelectorAll('#findTableModal select, #findTableModal input');
  filters.forEach(filter => {
    filter.addEventListener('change', () => {
      const guestCount = document.getElementById('guestCount').value;
      const date = document.getElementById('preferredDate').value;
      const time = document.getElementById('preferredTime').value;
      
      if (guestCount && date && time) {
        searchAvailableTables();
      }
    });
  });
};

// Show Find Table Modal
const showFindTableModal = () => {
  const modal = document.getElementById('findTableModal');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  
  // Reset form
  document.getElementById('findTableModal').querySelectorAll('input, select, textarea').forEach(field => {
    field.value = '';
  });
  document.getElementById('tableResults').style.display = 'none';
  document.getElementById('quickBooking').style.display = 'none';
};

// Close Find Table Modal
const closeFindTableModal = () => {
  const modal = document.getElementById('findTableModal');
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
};

// Search available tables
const searchAvailableTables = () => {
  const guestCount = document.getElementById('guestCount').value;
  const date = document.getElementById('preferredDate').value;
  const time = document.getElementById('preferredTime').value;
  const tableType = document.getElementById('tableType').value;
  
  if (!guestCount || !date || !time) {
    showNotification('Please fill in all required fields', 'error');
    return;
  }
  
  // Simulate API call delay
  const searchBtn = document.getElementById('searchTables');
  searchBtn.innerHTML = '<span>🔍 Searching...</span>';
  searchBtn.disabled = true;
  
  setTimeout(() => {
    const availableTables = findAvailableTables(guestCount, date, time, tableType);
    displayTableResults(availableTables, { guestCount, date, time, tableType });
    
    searchBtn.innerHTML = '<span>🔍 Search Available Tables</span>';
    searchBtn.disabled = false;
  }, 1500);
};

// Find available tables based on criteria
const findAvailableTables = (guestCount, date, time, tableType) => {
  const tables = [
    {
      id: 'T001',
      name: 'Window Table 1',
      type: 'window',
      capacity: 2,
      location: 'Near window with city view',
      features: ['City view', 'Natural light', 'Quiet'],
      price: 0,
      available: true
    },
    {
      id: 'T002',
      name: 'Window Table 2',
      type: 'window',
      capacity: 4,
      location: 'Corner window table',
      features: ['City view', 'Natural light', 'Spacious'],
      price: 0,
      available: true
    },
    {
      id: 'T003',
      name: 'Booth 1',
      type: 'booth',
      capacity: 4,
      location: 'Cozy corner booth',
      features: ['Private', 'Comfortable', 'Intimate'],
      price: 0,
      available: true
    },
    {
      id: 'T004',
      name: 'Booth 2',
      type: 'booth',
      capacity: 6,
      location: 'Large family booth',
      features: ['Spacious', 'Family-friendly', 'Private'],
      price: 0,
      available: true
    },
    {
      id: 'T005',
      name: 'Outdoor Table 1',
      type: 'outdoor',
      capacity: 2,
      location: 'Garden patio',
      features: ['Fresh air', 'Garden view', 'Romantic'],
      price: 0,
      available: true
    },
    {
      id: 'T006',
      name: 'Outdoor Table 2',
      type: 'outdoor',
      capacity: 4,
      location: 'Terrace seating',
      features: ['Fresh air', 'City view', 'Spacious'],
      price: 0,
      available: true
    },
    {
      id: 'T007',
      name: 'Private Dining Room',
      type: 'private',
      capacity: 12,
      location: 'Private dining room',
      features: ['Exclusive', 'Large group', 'Business meetings'],
      price: 50,
      available: true
    },
    {
      id: 'T008',
      name: 'Bar Table 1',
      type: 'bar',
      capacity: 2,
      location: 'At the bar counter',
      features: ['Bar view', 'Casual', 'Quick service'],
      price: 0,
      available: true
    }
  ];
  
  // Filter tables based on criteria
  let filteredTables = tables.filter(table => {
    // Check capacity
    if (guestCount === '9+') {
      if (table.capacity < 9) return false;
    } else {
      if (table.capacity < parseInt(guestCount)) return false;
    }
    
    // Check table type if specified
    if (tableType && table.type !== tableType) return false;
    
    // Simulate availability (in real app, this would check actual bookings)
    return table.available && Math.random() > 0.2; // 80% availability
  });
  
  // Sort by preference
  filteredTables.sort((a, b) => {
    // Prioritize exact capacity matches
    const aExactMatch = a.capacity === parseInt(guestCount);
    const bExactMatch = b.capacity === parseInt(guestCount);
    if (aExactMatch && !bExactMatch) return -1;
    if (!aExactMatch && bExactMatch) return 1;
    
    // Then by capacity (closest to requested)
    return Math.abs(a.capacity - parseInt(guestCount)) - Math.abs(b.capacity - parseInt(guestCount));
  });
  
  return filteredTables.slice(0, 6); // Return top 6 results
};

// Display table results
const displayTableResults = (tables, searchCriteria) => {
  const resultsContainer = document.getElementById('resultsContainer');
  const tableResults = document.getElementById('tableResults');
  
  if (tables.length === 0) {
    resultsContainer.innerHTML = `
      <div class="no-results">
        <h4>😔 No tables available</h4>
        <p>Sorry, no tables match your criteria. Try adjusting your search:</p>
        <ul>
          <li>Different time slot</li>
          <li>Different date</li>
          <li>Different table type</li>
          <li>Fewer guests</li>
        </ul>
        <button class="btn btn-secondary" onclick="closeFindTableModal()">Try Again</button>
      </div>
    `;
  } else {
    resultsContainer.innerHTML = tables.map(table => `
      <div class="table-card" data-table-id="${table.id}">
        <div class="table-header">
          <h4>${table.name}</h4>
          <span class="table-capacity">👥 ${table.capacity} guests</span>
        </div>
        <div class="table-details">
          <p class="table-location">📍 ${table.location}</p>
          <div class="table-features">
            ${table.features.map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
          </div>
          ${table.price > 0 ? `<div class="table-price">💰 $${table.price} booking fee</div>` : ''}
        </div>
        <button class="select-table-btn" onclick="selectTable('${table.id}', '${table.name}', ${table.capacity}, ${table.price})">
          Select This Table
        </button>
      </div>
    `).join('');
  }
  
  tableResults.style.display = 'block';
  
  // Store search criteria for booking
  window.currentSearchCriteria = searchCriteria;
};

// Select table
window.selectTable = (tableId, tableName, capacity, price) => {
  // Store selected table info
  window.selectedTable = { id: tableId, name: tableName, capacity, price };
  
  // Show quick booking form
  document.getElementById('quickBooking').style.display = 'block';
  document.getElementById('quickBooking').scrollIntoView({ behavior: 'smooth' });
  
  // Update booking form with table info
  const bookingForm = document.querySelector('.booking-form');
  const tableInfo = document.createElement('div');
  tableInfo.className = 'selected-table-info';
  tableInfo.innerHTML = `
    <div class="selected-table">
      <h4>Selected: ${tableName}</h4>
      <p>Capacity: ${capacity} guests | ${price > 0 ? `Fee: $${price}` : 'No additional fee'}</p>
    </div>
  `;
  
  // Remove existing table info if any
  const existingInfo = bookingForm.querySelector('.selected-table-info');
  if (existingInfo) existingInfo.remove();
  
  bookingForm.insertBefore(tableInfo, bookingForm.firstChild);
};

// Confirm table booking
const confirmTableBooking = () => {
  const name = document.getElementById('customerName').value.trim();
  const phone = document.getElementById('customerPhone').value.trim();
  const requests = document.getElementById('specialRequests').value.trim();
  
  if (!name || !phone) {
    showNotification('Please fill in your name and phone number', 'error');
    return;
  }
  
  if (!window.selectedTable) {
    showNotification('Please select a table first', 'error');
    return;
  }
  
  // Create booking data
  const bookingData = {
    id: generateReservationId(),
    tableId: window.selectedTable.id,
    tableName: window.selectedTable.name,
    customerName: name,
    customerPhone: phone,
    guestCount: window.currentSearchCriteria.guestCount,
    date: window.currentSearchCriteria.date,
    time: window.currentSearchCriteria.time,
    specialRequests: requests,
    bookingFee: window.selectedTable.price,
    timestamp: new Date().toISOString()
  };
  
  // Save booking
  const bookings = JSON.parse(localStorage.getItem('tableBookings') || '[]');
  bookings.push(bookingData);
  localStorage.setItem('tableBookings', JSON.stringify(bookings));
  
  // Show confirmation
  showTableBookingConfirmation(bookingData);
  
  // Reset form
  closeFindTableModal();
};

// Show table booking confirmation
const showTableBookingConfirmation = (booking) => {
  const confirmationHTML = `
    <div class="table-booking-confirmation">
      <div class="confirmation-header">
        <h3>🎉 Table Booked Successfully!</h3>
        <p>Booking ID: <strong>${booking.id}</strong></p>
      </div>
      <div class="confirmation-details">
        <div class="detail-row">
          <span class="label">Table:</span>
          <span class="value">${booking.tableName}</span>
        </div>
        <div class="detail-row">
          <span class="label">Name:</span>
          <span class="value">${booking.customerName}</span>
        </div>
        <div class="detail-row">
          <span class="label">Phone:</span>
          <span class="value">${booking.customerPhone}</span>
        </div>
        <div class="detail-row">
          <span class="label">Date:</span>
          <span class="value">${formatReservationDateString(booking.date)}</span>
        </div>
        <div class="detail-row">
          <span class="label">Time:</span>
          <span class="value">${booking.time}</span>
        </div>
        <div class="detail-row">
          <span class="label">Guests:</span>
          <span class="value">${booking.guestCount}</span>
        </div>
        ${booking.bookingFee > 0 ? `
        <div class="detail-row">
          <span class="label">Booking Fee:</span>
          <span class="value">$${booking.bookingFee}</span>
        </div>
        ` : ''}
        ${booking.specialRequests ? `
        <div class="detail-row">
          <span class="label">Special Requests:</span>
          <span class="value">${booking.specialRequests}</span>
        </div>
        ` : ''}
      </div>
      <div class="confirmation-actions">
        <button class="btn btn-primary" onclick="closeTableBookingConfirmation()">Close</button>
        <button class="btn btn-secondary" onclick="printTableBooking()">Print</button>
      </div>
    </div>
  `;
  
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'table-booking-confirmation-modal';
  modal.innerHTML = confirmationHTML;
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  `;
  
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
  
  // Add global functions
  window.closeTableBookingConfirmation = () => {
    document.body.removeChild(modal);
    document.body.style.overflow = 'auto';
    delete window.closeTableBookingConfirmation;
    delete window.printTableBooking;
  };
  
  window.printTableBooking = () => {
    window.print();
  };
};

// Authentication System (tolerant of prior declarations)
if (typeof currentUser === 'undefined') var currentUser = null;
if (typeof isLoggedIn === 'undefined') var isLoggedIn = false;

// Initialize authentication system
const initAuthSystem = () => {
  // Respect 'Remember me' only; otherwise require login every refresh
  const remembered = localStorage.getItem('rememberMe') === 'true';
  const savedUser = remembered ? localStorage.getItem('currentUser') : null;
  if (remembered && savedUser) {
    currentUser = JSON.parse(savedUser);
    isLoggedIn = true;
    updateLoginButton();
  } else {
    // Ensure no stale auto-login
    isLoggedIn = false;
    currentUser = null;
    localStorage.removeItem('currentUser');
  }
  
  // Create login modal
  createLoginModal();
};

// Create login modal
const createLoginModal = () => {
  const modalHTML = `
    <div id="loginModal" class="login-modal" style="display: none;">
      <div class="login-content">
        <div class="login-header">
          <h2>🍽️ Welcome to Grilli</h2>
          <button class="close-login" onclick="closeLoginModal()">&times;</button>
        </div>
        
        <div class="login-tabs">
          <button class="tab-btn active" onclick="switchTab('login')">Login</button>
          <button class="tab-btn" onclick="switchTab('register')">Register</button>
        </div>
        
        <div class="login-form-container">
          <!-- Login Form -->
          <form id="loginForm" class="auth-form active">
            <div class="form-group">
              <label for="loginEmail">📧 Email Address</label>
              <input type="email" id="loginEmail" name="email" required>
              <span class="error-message" id="loginEmailError"></span>
            </div>
            
            <div class="form-group">
              <label for="loginPassword">🔒 Password</label>
              <input type="password" id="loginPassword" name="password" required>
              <span class="error-message" id="loginPasswordError"></span>
            </div>
            
            <div class="form-options">
              <label class="checkbox-container">
                <input type="checkbox" id="rememberMe">
                <span class="checkmark"></span>
                Remember me
              </label>
              <a href="#" class="forgot-password" onclick="showForgotPassword()">Forgot Password?</a>
            </div>
            
            <button type="submit" class="auth-btn">
              <span class="btn-icon">🚀</span>
              Login to Order
            </button>
          </form>
          
          <!-- Register Form -->
          <form id="registerForm" class="auth-form">
            <div class="form-group">
              <label for="registerName">👤 Full Name</label>
              <input type="text" id="registerName" name="name" required>
              <span class="error-message" id="registerNameError"></span>
            </div>
            
            <div class="form-group">
              <label for="registerEmail">📧 Email Address</label>
              <input type="email" id="registerEmail" name="email" required>
              <span class="error-message" id="registerEmailError"></span>
            </div>
            
            <div class="form-group">
              <label for="registerPhone">📱 Phone Number</label>
              <input type="tel" id="registerPhone" name="phone" required>
              <span class="error-message" id="registerPhoneError"></span>
            </div>
            
            <div class="form-group">
              <label for="registerPassword">🔒 Password</label>
              <input type="password" id="registerPassword" name="password" required>
              <span class="error-message" id="registerPasswordError"></span>
            </div>
            
            <div class="form-group">
              <label for="confirmPassword">🔒 Confirm Password</label>
              <input type="password" id="confirmPassword" name="confirmPassword" required>
              <span class="error-message" id="confirmPasswordError"></span>
            </div>
            
            <div class="form-options">
              <label class="checkbox-container">
                <input type="checkbox" id="agreeTerms" required>
                <span class="checkmark"></span>
                I agree to the <a href="#" onclick="showTerms()">Terms & Conditions</a>
              </label>
            </div>
            
            <button type="submit" class="auth-btn">
              <span class="btn-icon">✨</span>
              Create Account
            </button>
          </form>
        </div>
        
        <div class="login-footer">
          <p>Or continue with</p>
          <div class="social-login">
            <button class="social-btn google" onclick="socialLogin('google')">
              <span class="social-icon">🔍</span>
              Google
            </button>
            <button class="social-btn facebook" onclick="socialLogin('facebook')">
              <span class="social-icon">📘</span>
              Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Add event listeners
  setupLoginEventListeners();
};

// Setup login event listeners
const setupLoginEventListeners = () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  
  // Login form submission
  loginForm.addEventListener('submit', handleLogin);
  
  // Register form submission
  registerForm.addEventListener('submit', handleRegister);
  
  // Real-time validation
  addRealTimeValidation();
};

// Handle login
const handleLogin = async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const rememberMe = document.getElementById('rememberMe').checked;
  
  // Clear previous errors
  clearLoginErrors();
  
  // Validate inputs
  if (!validateEmail(email)) {
    showLoginError('loginEmailError', 'Please enter a valid email address');
    return;
  }
  
  if (password.length < 6) {
    showLoginError('loginPasswordError', 'Password must be at least 6 characters');
    return;
  }
  
  // Show loading state
  const submitBtn = loginForm.querySelector('.auth-btn');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<span class="btn-icon">⏳</span> Logging in...';
  submitBtn.disabled = true;
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Check credentials
    const user = authenticateUser(email, password);
    
    if (user) {
      // Login successful
      currentUser = user;
      isLoggedIn = true;
      
      // Save to localStorage if remember me is checked
      if (rememberMe) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('currentUser');
      }
      
      // Update UI
      updateLoginButton();
      closeLoginModal();
      
      // Show success message
      showNotification(`Welcome back, ${user.name}! 🎉`, 'success');
      
      // Clear form
      loginForm.reset();
    } else {
      // Login failed
      showLoginError('loginPasswordError', 'Invalid email or password');
    }
  } catch (error) {
    showLoginError('loginPasswordError', 'Login failed. Please try again.');
  } finally {
    // Reset button
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
};

// Handle registration
const handleRegister = async (e) => {
  e.preventDefault();
  
  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const phone = document.getElementById('registerPhone').value.trim();
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const agreeTerms = document.getElementById('agreeTerms').checked;
  
  // Clear previous errors
  clearRegisterErrors();
  
  // Validate inputs
  let hasErrors = false;
  
  if (name.length < 2) {
    showLoginError('registerNameError', 'Name must be at least 2 characters');
    hasErrors = true;
  }
  
  if (!validateEmail(email)) {
    showLoginError('registerEmailError', 'Please enter a valid email address');
    hasErrors = true;
  }
  
  if (!validatePhone(phone)) {
    showLoginError('registerPhoneError', 'Please enter a valid phone number');
    hasErrors = true;
  }
  
  if (password.length < 6) {
    showLoginError('registerPasswordError', 'Password must be at least 6 characters');
    hasErrors = true;
  }
  
  if (password !== confirmPassword) {
    showLoginError('confirmPasswordError', 'Passwords do not match');
    hasErrors = true;
  }
  
  if (!agreeTerms) {
    showLoginError('confirmPasswordError', 'Please agree to the terms and conditions');
    hasErrors = true;
  }
  
  if (hasErrors) return;
  
  // Check if user already exists
  if (userExists(email)) {
    showLoginError('registerEmailError', 'An account with this email already exists');
    return;
  }
  
  // Show loading state
  const submitBtn = registerForm.querySelector('.auth-btn');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<span class="btn-icon">⏳</span> Creating Account...';
  submitBtn.disabled = true;
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create new user
    const newUser = createUser(name, email, phone, password);
    
    // Auto login after registration
    currentUser = newUser;
    isLoggedIn = true;
    // Do not persist registration by default; user can choose Remember me on login later
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('currentUser');
    
    // Update UI
    updateLoginButton();
    closeLoginModal();
    
    // Show success message
    showNotification(`Welcome to Grilli, ${name}! 🎉`, 'success');
    
    // Clear form
    registerForm.reset();
    
    // Switch to login tab
    switchTab('login');
    
    // If user came here from a protected action, resume it
    if (typeof window.afterLoginAction === 'function') {
      const next = window.afterLoginAction;
      delete window.afterLoginAction;
      setTimeout(() => { try { next(); } catch(_){} }, 0);
    }
    
  } catch (error) {
    showLoginError('registerEmailError', 'Registration failed. Please try again.');
  } finally {
    // Reset button
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
};

// Authentication Helper Functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

const authenticateUser = (email, password) => {
  // Get users from localStorage
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  
  // Add some demo users if none exist
  if (users.length === 0) {
    const demoUsers = [
      {
        id: 'user_1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'password123',
        createdAt: new Date().toISOString(),
        isDemo: true
      },
      {
        id: 'user_2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+0987654321',
        password: 'password123',
        createdAt: new Date().toISOString(),
        isDemo: true
      }
    ];
    localStorage.setItem('users', JSON.stringify(demoUsers));
    users.push(...demoUsers);
  }
  
  // Find user by email and password
  return users.find(user => user.email === email && user.password === password);
};

const userExists = (email) => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  return users.some(user => user.email === email);
};

const createUser = (name, email, phone, password) => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  
  const newUser = {
    id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    name,
    email,
    phone,
    password,
    createdAt: new Date().toISOString(),
    isDemo: false
  };
  
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  
  return newUser;
};

const updateLoginButton = () => {
  const loginBtn = document.getElementById('loginBtn');
  if (!loginBtn) return;
  
  if (isLoggedIn && currentUser) {
    loginBtn.innerHTML = `
      <span class="login-icon">👤</span>
      <span class="login-text">${currentUser.name.split(' ')[0]}</span>
    `;
    loginBtn.onclick = showUserMenu;
  } else {
    loginBtn.innerHTML = `
      <span class="login-icon">👤</span>
      <span class="login-text">Login</span>
    `;
    loginBtn.onclick = showLoginModal;
  }
};

const showUserMenu = () => {
  const menuHTML = `
    <div id="userMenu" class="user-menu" style="display: none;">
      <div class="user-menu-content">
        <div class="user-info">
          <div class="user-avatar">${currentUser.name.charAt(0).toUpperCase()}</div>
          <div class="user-details">
            <h3>${currentUser.name}</h3>
            <p>${currentUser.email}</p>
          </div>
        </div>
        <div class="user-menu-actions">
          <button class="menu-item" onclick="showOrderHistory()">
            <span class="menu-icon">📦</span>
            My Orders
          </button>
          <button class="menu-item" onclick="showProfile()">
            <span class="menu-icon">⚙️</span>
            Profile Settings
          </button>
          <button class="menu-item" onclick="logout()">
            <span class="menu-icon">🚪</span>
            Logout
          </button>
        </div>
      </div>
    </div>
  `;
  
  // Remove existing menu
  const existingMenu = document.getElementById('userMenu');
  if (existingMenu) {
    existingMenu.remove();
  }
  
  document.body.insertAdjacentHTML('beforeend', menuHTML);
  
  const menu = document.getElementById('userMenu');
  menu.style.display = 'block';
  
  // Close menu when clicking outside
  setTimeout(() => {
    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target) && !document.getElementById('loginBtn').contains(e.target)) {
        menu.remove();
      }
    });
  }, 100);
};

const logout = () => {
  currentUser = null;
  isLoggedIn = false;
  localStorage.removeItem('currentUser');
  updateLoginButton();
  showNotification('Logged out successfully', 'success');
  
  // Clear cart
  cart = [];
  cartTotal = 0;
  updateCartDisplay();
};

// Login Modal Functions
window.showLoginModal = () => {
  const modal = document.getElementById('loginModal');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
};

window.closeLoginModal = () => {
  const modal = document.getElementById('loginModal');
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
};

window.switchTab = (tab) => {
  const tabs = document.querySelectorAll('.tab-btn');
  const forms = document.querySelectorAll('.auth-form');
  
  tabs.forEach(t => t.classList.remove('active'));
  forms.forEach(f => f.classList.remove('active'));
  
  if (tab === 'login') {
    document.querySelector('.tab-btn[onclick="switchTab(\'login\')"]').classList.add('active');
    document.getElementById('loginForm').classList.add('active');
  } else {
    document.querySelector('.tab-btn[onclick="switchTab(\'register\')"]').classList.add('active');
    document.getElementById('registerForm').classList.add('active');
  }
};

const clearLoginErrors = () => {
  document.getElementById('loginEmailError').textContent = '';
  document.getElementById('loginPasswordError').textContent = '';
};

const clearRegisterErrors = () => {
  document.getElementById('registerNameError').textContent = '';
  document.getElementById('registerEmailError').textContent = '';
  document.getElementById('registerPhoneError').textContent = '';
  document.getElementById('registerPasswordError').textContent = '';
  document.getElementById('confirmPasswordError').textContent = '';
};

const showLoginError = (elementId, message) => {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.textContent = message;
  }
};

const addRealTimeValidation = () => {
  // Email validation
  const emailInputs = document.querySelectorAll('input[type="email"]');
  emailInputs.forEach(input => {
    input.addEventListener('blur', () => {
      if (input.value && !validateEmail(input.value)) {
        const errorId = input.id + 'Error';
        showLoginError(errorId, 'Please enter a valid email address');
      }
    });
  });
  
  // Password validation
  const passwordInputs = document.querySelectorAll('input[type="password"]');
  passwordInputs.forEach(input => {
    input.addEventListener('blur', () => {
      if (input.value && input.value.length < 6) {
        const errorId = input.id + 'Error';
        showLoginError(errorId, 'Password must be at least 6 characters');
      }
    });
  });
  
  // Phone validation
  const phoneInput = document.getElementById('registerPhone');
  if (phoneInput) {
    phoneInput.addEventListener('blur', () => {
      if (phoneInput.value && !validatePhone(phoneInput.value)) {
        showLoginError('registerPhoneError', 'Please enter a valid phone number');
      }
    });
  }
  
  // Confirm password validation
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const passwordInput = document.getElementById('registerPassword');
  if (confirmPasswordInput && passwordInput) {
    confirmPasswordInput.addEventListener('blur', () => {
      if (confirmPasswordInput.value && confirmPasswordInput.value !== passwordInput.value) {
        showLoginError('confirmPasswordError', 'Passwords do not match');
      }
    });
  }
};

window.socialLogin = (provider) => {
  showNotification(`${provider} login coming soon!`, 'info');
};

window.showForgotPassword = () => {
  showNotification('Password reset feature coming soon!', 'info');
};

window.showTerms = () => {
  showNotification('Terms & Conditions coming soon!', 'info');
};

window.showProfile = () => {
  showNotification('Profile settings coming soon!', 'info');
};

// Initialize payment system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded - Initializing systems...');
  initAuthSystem();
  
  // Load dynamic menu from API first
  console.log('Starting menu load process...');
  loadDynamicMenu().then((success) => {
    console.log('Dynamic menu load result:', success);
    console.log('Current menu items:', window.menuItems);
    initPaymentSystem();
    generateCategorizedMenu();
    console.log('Menu initialization complete');
  }).catch(error => {
    console.error('Failed to load dynamic menu:', error);
    // Fallback to static menu
    console.log('Using fallback static menu');
    initPaymentSystem();
    generateCategorizedMenu();
  });
  
  initReservationSystem();
  initFindTableSystem();
  createCartSidebar();
  initFeedbackSystem();
  // Preload backend menu map for reliable ID mapping
  preloadBackendMenuMap();
  
  // Add a fallback to reinitialize payment system after a short delay
  // in case the menu items weren't ready immediately
  setTimeout(() => {
    console.log('Reinitializing payment system for any new menu items...');
    initPaymentSystem();
  }, 2000);
  
  // Replace deprecated DOM mutation listeners with MutationObserver if any legacy listeners exist
  try {
    const legacyEvents = ['DOMNodeInserted', 'DOMNodeInsertedIntoDocument', 'DOMSubtreeModified'];
    const hasLegacy = legacyEvents.some(evt => {
      // Best-effort detection: browsers do not expose a direct API to list listeners
      // We guard by setting capturing no-op listeners to deter future additions
      document.addEventListener(evt, function noop() {}, true);
      document.removeEventListener(evt, function noop() {}, true);
      return false;
    });
    if (hasLegacy || typeof window.__grilliObserverInitialized === 'undefined') {
      window.__grilliObserverInitialized = true;
      const observer = new MutationObserver(() => {
        // Call lightweight updates that previously relied on legacy events
        try { if (typeof updateLoginButton === 'function') updateLoginButton(); } catch(_){}
      });
      observer.observe(document.documentElement || document.body, { childList: true, subtree: true });
    }
  } catch (_) {}
});

/**
 * FEEDBACK SYSTEM
 */

// Feedback data storage
let feedbackData = JSON.parse(localStorage.getItem('restaurantFeedback')) || [];

// Backend menu cache
window.backendMenuMap = new Map();
async function preloadBackendMenuMap() {
  try {
    const res = await grilliAPI.getMenu();
    const list = (res && res.menuItems) ? res.menuItems : [];
    window.backendMenuMap = new Map(list.map(m => [String(m.name).toLowerCase().trim(), m.id]));
  } catch (_) {
    window.backendMenuMap = new Map();
  }
}

// Load dynamic menu from API
async function loadDynamicMenu() {
  try {
    console.log('Loading menu from API...');
    const response = await grilliAPI.getMenu();
    
    if (response && response.success && response.menuItems) {
      console.log('Menu loaded successfully:', response.menuItems.length + ' items');
      
      // Clear existing menu items and rebuild
      window.menuItems = {
        'appetizers': {},
        'main-course': {},
        'vegetarian': {},
        'desserts': {},
        'beverages': {}
      };
      
      // Map API categories to frontend categories
      const categoryMapping = {
        'Appetizers': 'appetizers',
        'Main Course': 'main-course',
        'Vegetarian': 'vegetarian',
        'Desserts': 'desserts',
        'Beverages': 'beverages'
      };
      
      // Populate menu items from API
      response.menuItems.forEach(item => {
        const frontendCategory = categoryMapping[item.category_name] || 'appetizers';
        
        window.menuItems[frontendCategory][item.name] = {
          price: parseFloat(item.price),
          image: item.image_url,
          description: item.description,
          id: item.id,
          available: item.is_available,
          prepTime: item.preparation_time + ' mins'
        };
      });
      
      console.log('Menu items updated:', window.menuItems);
      return true;
    } else {
      console.warn('Invalid menu response from API');
      return false;
    }
  } catch (error) {
    console.error('Failed to load menu from API:', error);
    return false;
  }
}
function getMenuIdByName(name) {
  if (!name) return 0;
  const id = window.backendMenuMap.get(String(name).toLowerCase().trim());
  return id || 0;
}

// Initialize feedback system
function initFeedbackSystem() {
  setupStarRatings();
  setupFeedbackForm();
  loadFeedbackDisplay();
  updateFeedbackStats();
}

// Setup star rating functionality
function setupStarRatings() {
  const starRatings = document.querySelectorAll('.star-rating');
  
  starRatings.forEach(rating => {
    const stars = rating.querySelectorAll('.star');
    
    stars.forEach((star, index) => {
      star.addEventListener('click', () => {
        const ratingType = rating.getAttribute('data-rating');
        const ratingValue = index + 1;
        
        // Update visual state
        stars.forEach((s, i) => {
          s.classList.toggle('active', i < ratingValue);
        });
        
        // Store rating value
        rating.setAttribute('data-value', ratingValue);
      });
      
      star.addEventListener('mouseenter', () => {
        const ratingValue = index + 1;
        stars.forEach((s, i) => {
          s.classList.toggle('active', i < ratingValue);
        });
      });
    });
    
    rating.addEventListener('mouseleave', () => {
      const currentRating = rating.getAttribute('data-value') || 0;
      stars.forEach((s, i) => {
        s.classList.toggle('active', i < currentRating);
      });
    });
  });
}

// Setup feedback form submission
function setupFeedbackForm() {
  const feedbackForm = document.getElementById('feedbackForm');
  
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', handleFeedbackSubmission);
  }
}

// Handle feedback form submission
async function handleFeedbackSubmission(e) {
  e.preventDefault();
  
  // Check if user is logged in
  if (!isLoggedIn) {
    showNotification('Please login to submit feedback', 'warning');
    openLoginModal();
    return;
  }
  
  const formData = new FormData(e.target);
  const feedback = {
    customerName: formData.get('customerName'),
    customerEmail: formData.get('customerEmail'),
    feedbackText: formData.get('feedbackText'),
    wouldRecommend: formData.get('recommend') === 'on',
    foodRating: parseInt(document.querySelector('[data-rating="food"]').getAttribute('data-value')) || 0,
    serviceRating: parseInt(document.querySelector('[data-rating="service"]').getAttribute('data-value')) || 0,
    ambianceRating: parseInt(document.querySelector('[data-rating="ambiance"]').getAttribute('data-value')) || 0
  };
  
  // Validate ratings
  if (feedback.foodRating === 0 || feedback.serviceRating === 0 || feedback.ambianceRating === 0) {
    showNotification('Please rate all categories', 'warning');
    return;
  }
  
  try {
    // Submit feedback to API
    const response = await grilliAPI.submitFeedback(feedback);
    
    if (response.success) {
      // Reset form
      e.target.reset();
      resetStarRatings();
      
      // Reload feedback display
      await loadFeedbackDisplay();
      await updateFeedbackStats();
      
      showNotification('Thank you for your feedback!', 'success');
    } else {
      showNotification('Failed to submit feedback. Please try again.', 'error');
    }
  } catch (error) {
    console.error('Feedback submission error:', error);
    showNotification('Failed to submit feedback. Please try again.', 'error');
  }
}

// Reset star ratings
function resetStarRatings() {
  const starRatings = document.querySelectorAll('.star-rating');
  starRatings.forEach(rating => {
    rating.removeAttribute('data-value');
    const stars = rating.querySelectorAll('.star');
    stars.forEach(star => star.classList.remove('active'));
  });
}

// Load feedback display
async function loadFeedbackDisplay() {
  const reviewsContainer = document.getElementById('reviewsContainer');
  
  if (!reviewsContainer) return;
  
  try {
    // Show loading state
    reviewsContainer.innerHTML = '<div class="no-reviews">Loading reviews...</div>';
    
    // Fetch feedback from API
    const response = await grilliAPI.getPublicFeedback(1, 10);
    
    if (response.success && response.data.feedback.length > 0) {
      const reviewsHTML = response.data.feedback.map(feedback => {
        const date = new Date(feedback.created_at).toLocaleDateString();
        const averageRating = (feedback.food_rating + feedback.service_rating + feedback.ambiance_rating) / 3;
        
        return `
          <div class="review-item">
            <div class="review-header">
              <span class="reviewer-name">${feedback.customer_name}</span>
              <span class="review-date">${date}</span>
            </div>
            
            <div class="review-ratings">
              <div class="rating-item">
                <span class="rating-type">Food:</span>
                <span class="rating-stars">${'★'.repeat(feedback.food_rating)}${'☆'.repeat(5 - feedback.food_rating)}</span>
              </div>
              <div class="rating-item">
                <span class="rating-type">Service:</span>
                <span class="rating-stars">${'★'.repeat(feedback.service_rating)}${'☆'.repeat(5 - feedback.service_rating)}</span>
              </div>
              <div class="rating-item">
                <span class="rating-type">Ambiance:</span>
                <span class="rating-stars">${'★'.repeat(feedback.ambiance_rating)}${'☆'.repeat(5 - feedback.ambiance_rating)}</span>
              </div>
            </div>
            
            <div class="review-text">${feedback.feedback_text}</div>
            
            ${feedback.would_recommend ? '<div class="recommendation">✓ Would recommend</div>' : ''}
          </div>
        `;
      }).join('');
      
      reviewsContainer.innerHTML = reviewsHTML;
    } else {
      reviewsContainer.innerHTML = '<div class="no-reviews">No reviews yet. Be the first to share your experience!</div>';
    }
  } catch (error) {
    console.error('Error loading feedback:', error);
    reviewsContainer.innerHTML = '<div class="no-reviews">Error loading reviews. Please try again later.</div>';
  }
}

// Update feedback statistics
async function updateFeedbackStats() {
  const totalReviews = document.getElementById('totalReviews');
  const averageRating = document.getElementById('averageRating');
  const recommendationRate = document.getElementById('recommendationRate');
  
  if (!totalReviews || !averageRating || !recommendationRate) return;
  
  try {
    // Fetch statistics from API
    const response = await grilliAPI.getPublicFeedback(1, 1);
    
    if (response.success && response.data.statistics) {
      const stats = response.data.statistics;
      totalReviews.textContent = stats.totalReviews;
      averageRating.textContent = stats.averageRating;
      recommendationRate.textContent = `${stats.recommendationRate}%`;
    } else {
      // Fallback to default values
      totalReviews.textContent = '0';
      averageRating.textContent = '0.0';
      recommendationRate.textContent = '0%';
    }
  } catch (error) {
    console.error('Error loading feedback statistics:', error);
    // Fallback to default values
    totalReviews.textContent = '0';
    averageRating.textContent = '0.0';
    recommendationRate.textContent = '0%';
  }
}

// Add some sample feedback data if none exists
function addSampleFeedback() {
  if (feedbackData.length === 0) {
    const sampleFeedback = [
      {
        id: 1,
        customerName: 'Sarah Johnson',
        customerEmail: 'sarah@example.com',
        feedbackText: 'Amazing food and excellent service! The ambiance was perfect for a romantic dinner. Highly recommend the grilled salmon.',
        recommend: true,
        ratings: { food: 5, service: 5, ambiance: 4 },
        date: new Date(Date.now() - 86400000).toISOString(),
        timestamp: Date.now() - 86400000
      },
      {
        id: 2,
        customerName: 'Mike Chen',
        customerEmail: 'mike@example.com',
        feedbackText: 'Great restaurant with delicious food. The staff was friendly and attentive. Will definitely come back!',
        recommend: true,
        ratings: { food: 4, service: 5, ambiance: 5 },
        date: new Date(Date.now() - 172800000).toISOString(),
        timestamp: Date.now() - 172800000
      },
      {
        id: 3,
        customerName: 'Emily Davis',
        customerEmail: 'emily@example.com',
        feedbackText: 'Good food but the service was a bit slow. The atmosphere is nice though.',
        recommend: false,
        ratings: { food: 4, service: 3, ambiance: 4 },
        date: new Date(Date.now() - 259200000).toISOString(),
        timestamp: Date.now() - 259200000
      }
    ];
    
    feedbackData = sampleFeedback;
    localStorage.setItem('restaurantFeedback', JSON.stringify(feedbackData));
  }
}

// Initialize with sample data if needed
addSampleFeedback();

// Authentication state (avoid redeclaration if already defined earlier in file)
if (typeof window.isLoggedIn === 'undefined') window.isLoggedIn = false;
if (typeof window.currentUser === 'undefined') window.currentUser = null;

if (typeof window.ensureLoggedIn !== 'function') {
  window.ensureLoggedIn = function ensureLoggedIn(afterLogin) {
    try {
      // If already logged in for this session, allow
      if (window.isLoggedIn && window.currentUser) return true;
      // Otherwise check persisted user
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        window.currentUser = JSON.parse(stored);
        window.isLoggedIn = true;
        return true;
      }
    } catch (_) {}
    window.isLoggedIn = false;
    // Remember post-login action (e.g., open dish modal, add to cart)
    if (typeof afterLogin === 'function') {
      window.afterLoginAction = afterLogin;
    }
    if (typeof showLoginModal === 'function') showLoginModal();
    return false;
  };
}

// Ensure login before adding to cart
const originalAddToCart = typeof addToCart === 'function' ? addToCart : null;
window.addToCart = (dishName, category) => {
  if (!window.ensureLoggedIn(() => window.addToCart(dishName, category))) return;
  if (originalAddToCart) return originalAddToCart(dishName, category);
};

// Wrap proceedToCheckout
const originalProceed = typeof window.proceedToCheckout === 'function' ? window.proceedToCheckout : null;
window.proceedToCheckout = () => {
  if (!window.ensureLoggedIn(() => window.proceedToCheckout())) return;
  if (originalProceed) return originalProceed();
};

// Ensure Pay Now requires login
const originalProcessPayment = typeof window.processPayment === 'function' ? window.processPayment : null;
window.processPayment = async () => {
  if (!window.ensureLoggedIn(() => window.processPayment())) return;
  if (originalProcessPayment) return originalProcessPayment();
};

// Patch createOrder to send empty strings for optional fields
const originalCreateOrder = typeof window.createOrder === 'function' ? window.createOrder : null;
window.createOrder = async () => {
  if (!originalCreateOrder) return;
  // Monkey-patch grilliAPI.createOrder to enforce optional fields
  const origApiCreate = window.grilliAPI && window.grilliAPI.createOrder ? window.grilliAPI.createOrder.bind(window.grilliAPI) : null;
  if (origApiCreate) {
    window.grilliAPI.createOrder = (orderData) => {
      const safeData = {
        ...orderData,
        deliveryAddress: orderData.deliveryAddress ?? "",
        specialInstructions: orderData.specialInstructions ?? ""
      };
      return origApiCreate(safeData);
    };
  }
  return originalCreateOrder();
};

// Add a simple test function to verify cart functionality
window.testAddToCartFunction = (itemName = 'Greek Salad', category = 'appetizers') => {
  console.log('Testing addToCart function...');
  console.log('Cart before:', window.cart);
  console.log('Available functions:');
  console.log('- addToCart:', typeof window.addToCart);
  console.log('- showNotification:', typeof window.showNotification);
  console.log('- generateItemId:', typeof window.generateItemId);
  
  if (typeof window.addToCart === 'function') {
    window.addToCart(itemName, category);
    console.log('Cart after:', window.cart);
  } else {
    console.error('addToCart function not found!');
  }
};

// Menu Item Details Functions
let currentMenuItem = null;

// Show menu item details modal
window.showMenuItemDetails = async function(menuId) {
  try {
    console.log('Fetching details for menu item ID:', menuId);
    
    // Show loading state
    const modal = document.getElementById('menuItemModal');
    modal.style.display = 'flex';
    
    // Fetch menu item details from API
    const response = await fetch(`http://localhost:3000/api/menu/${menuId}`);
    const data = await response.json();
    
    if (data.success && data.menuItem) {
      currentMenuItem = data.menuItem;
      populateModal(data.menuItem);
    } else {
      console.error('Failed to fetch menu item details:', data.message);
      alert('Failed to load menu item details. Please try again.');
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
  document.getElementById('modalItemImage').src = item.image_url || './assets/images/menu-1.png';
  document.getElementById('modalItemImage').alt = item.name;
  document.getElementById('modalItemName').textContent = item.name;
  document.getElementById('modalItemCategory').textContent = item.category_name || 'Unknown';
  document.getElementById('modalItemPrice').textContent = `$${parseFloat(item.price).toFixed(2)}`;
  document.getElementById('modalItemDescription').textContent = item.description || 'No description available';
  document.getElementById('modalItemPrepTime').textContent = `${item.preparation_time || 15} minutes`;
  document.getElementById('modalItemSpiceLevel').textContent = item.spice_level || 'Mild';
  document.getElementById('modalItemVegetarian').textContent = item.is_vegetarian ? 'Yes' : 'No';
}

// Close menu item modal
window.closeMenuItemModal = function() {
  const modal = document.getElementById('menuItemModal');
  modal.style.display = 'none';
  currentMenuItem = null;
};

// Add to cart from modal
window.addToCartFromModal = function() {
  if (currentMenuItem) {
    // Use the existing addToCart function
    if (typeof window.addToCart === 'function') {
      window.addToCart(
        currentMenuItem.name, 
        currentMenuItem.category_name?.toLowerCase().replace(' ', '-') || 'main-course',
        parseFloat(currentMenuItem.price),
        currentMenuItem.image_url || './assets/images/menu-1.png'
      );
      
      // Show success message
      alert(`${currentMenuItem.name} added to cart!`);
      
      // Close modal
      closeMenuItemModal();
    } else {
      console.error('addToCart function not found!');
      alert('Error adding item to cart. Please try again.');
    }
  }
};

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('menuItemModal');
  if (event.target === modal) {
    closeMenuItemModal();
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

// Order Form Functions
let orderItem = null;

// Show order form
window.showOrderForm = function() {
  if (currentMenuItem) {
    orderItem = currentMenuItem;
    populateOrderForm(currentMenuItem);
    closeMenuItemModal();
    document.getElementById('orderFormModal').style.display = 'flex';
  }
};

// Populate order form with item data
function populateOrderForm(item) {
  document.getElementById('orderItemImage').src = item.image_url || './assets/images/menu-1.png';
  document.getElementById('orderItemImage').alt = item.name;
  document.getElementById('orderItemName').textContent = item.name;
  document.getElementById('orderItemDescription').textContent = item.description || 'No description available';
  document.getElementById('orderItemPrice').textContent = `$${parseFloat(item.price).toFixed(2)}`;
  
  // Update price displays
  updateOrderTotal();
  
  // Add event listener for quantity change
  document.getElementById('quantity').addEventListener('change', updateOrderTotal);
}

// Update order total when quantity changes
function updateOrderTotal() {
  const quantity = parseInt(document.getElementById('quantity').value);
  const price = parseFloat(orderItem.price);
  const total = price * quantity;
  
  document.getElementById('itemPriceDisplay').textContent = `$${price.toFixed(2)}`;
  document.getElementById('quantityDisplay').textContent = quantity;
  document.getElementById('totalAmountDisplay').textContent = `$${total.toFixed(2)}`;
}

// Close order form modal
window.closeOrderFormModal = function() {
  document.getElementById('orderFormModal').style.display = 'none';
  orderItem = null;
  document.getElementById('orderForm').reset();
};

// Handle order form submission
document.getElementById('orderForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  if (!orderItem) {
    alert('No item selected for order');
    return;
  }
  
  const formData = new FormData(e.target);
  const orderData = {
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
  
  try {
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
      showOrderConfirmation(result.order, orderItem);
      closeOrderFormModal();
    } else {
      throw new Error(result.message || 'Failed to place order');
    }
    
  } catch (error) {
    console.error('Error placing order:', error);
    alert('Failed to place order: ' + error.message);
    
    // Reset button
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
});

// Show order confirmation
function showOrderConfirmation(order, item) {
  document.getElementById('orderNumber').textContent = order.orderNumber || order.order_number || 'ORD-' + Date.now();
  document.getElementById('confirmedItemName').textContent = item.name;
  document.getElementById('confirmedTotalAmount').textContent = `$${parseFloat(order.totalAmount || order.total_amount).toFixed(2)}`;
  document.getElementById('estimatedTime').textContent = `${item.preparation_time || 15} minutes`;
  
  document.getElementById('orderConfirmationModal').style.display = 'flex';
}

// Close order confirmation modal
window.closeOrderConfirmationModal = function() {
  document.getElementById('orderConfirmationModal').style.display = 'none';
};