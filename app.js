/* =============================================
   BEIGE COFFEE — Oak Earth Application Script
   ============================================= */

// ===== CART STATE =====
let cart = {};

function getCartItems() {
  return Object.values(cart);
}

function getCartTotal() {
  return getCartItems().reduce((sum, item) => sum + item.price * item.qty, 0);
}

function renderCart() {
  const cartItemsEl = document.getElementById('cartItems');
  const cartEmpty = document.getElementById('cartEmpty');
  const cartFooter = document.getElementById('cartFooter');
  const cartCount = document.getElementById('cartCount');
  const items = getCartItems();
  const totalQty = items.reduce((s, i) => s + i.qty, 0);

  if (cartCount) {
    if (totalQty > 0) {
      cartCount.textContent = totalQty;
      cartCount.style.display = 'flex';
    } else {
      cartCount.style.display = 'none';
    }
  }

  Array.from(cartItemsEl.children).forEach(child => {
    if (child.id !== 'cartEmpty') child.remove();
  });

  if (items.length === 0) {
    if (cartEmpty) cartEmpty.style.display = 'block';
    if (cartFooter) cartFooter.style.display = 'none';
    return;
  }

  if (cartEmpty) cartEmpty.style.display = 'none';
  if (cartFooter) cartFooter.style.display = 'block';

  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₹${item.price} × ${item.qty} = ₹${item.price * item.qty}</div>
      </div>
      <div class="qty-controls">
        <button class="qty-btn" data-action="dec" data-key="${item.key}"><iconify-icon icon="lucide:minus"></iconify-icon></button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" data-action="inc" data-key="${item.key}"><iconify-icon icon="lucide:plus"></iconify-icon></button>
      </div>
    `;
    cartItemsEl.appendChild(div);
  });

  const subtotal = getCartTotal();
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;
  const subtotalEl = document.getElementById('cartSubtotal');
  const taxEl = document.getElementById('cartTax');
  const totalEl = document.getElementById('cartTotal');
  if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
  if (taxEl) taxEl.textContent = `₹${tax}`;
  if (totalEl) totalEl.textContent = `₹${total}`;
}

const cartItemsEl = document.getElementById('cartItems');
if (cartItemsEl) {
  cartItemsEl.addEventListener('click', e => {
    const btn = e.target.closest('.qty-btn');
    if (!btn) return;
    const key = btn.dataset.key;
    const action = btn.dataset.action;
    if (!cart[key]) return;
    if (action === 'inc') {
      cart[key].qty++;
    } else {
      cart[key].qty--;
      if (cart[key].qty <= 0) delete cart[key];
    }
    renderCart();
  });
}

const menuGrid = document.getElementById('menuGrid');
if (menuGrid) {
  menuGrid.addEventListener('click', e => {
    const btn = e.target.closest('.add-btn');
    if (!btn) return;
    const name = btn.dataset.name;
    const price = parseInt(btn.dataset.price);
    const key = name.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
    if (cart[key]) {
      cart[key].qty++;
    } else {
      cart[key] = { key, name, price, qty: 1 };
    }
    btn.classList.add('added');
    btn.innerHTML = '<iconify-icon icon="lucide:check"></iconify-icon>';
    setTimeout(() => {
      btn.classList.remove('added');
      btn.innerHTML = '<iconify-icon icon="lucide:plus"></iconify-icon>';
    }, 500);
    renderCart();
  });
}

// Cart open/close (Oak Earth uses .open class)
const cartOverlay = document.getElementById('cartOverlay');
const cartDrawer = document.getElementById('cartDrawer');

function openCart() {
  if (cartDrawer) cartDrawer.classList.add('open');
  if (cartOverlay) cartOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  if (cartDrawer) cartDrawer.classList.remove('open');
  if (cartOverlay) cartOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

const cartOpenBtn = document.getElementById('cartOpenBtn');
if (cartOpenBtn) cartOpenBtn.addEventListener('click', openCart);

const cartCloseBtn = document.getElementById('cartCloseBtn');
if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);

if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

// Checkout: Plattr (POS) or WhatsApp fallback
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutBtnText = document.getElementById('checkoutBtnText');
const checkoutModal = document.getElementById('checkoutModal');
const checkoutForm = document.getElementById('checkoutForm');
const checkoutName = document.getElementById('checkoutName');
const checkoutPhone = document.getElementById('checkoutPhone');
const checkoutCancel = document.getElementById('checkoutCancel');
const checkoutSubmit = document.getElementById('checkoutSubmit');

function fallbackWhatsApp() {
  const items = getCartItems();
  const lines = items.map(i => `• ${i.name} ×${i.qty} = ₹${i.price * i.qty}`).join('%0A');
  const total = getCartTotal() + Math.round(getCartTotal() * 0.05);
  const msg = `Hi Beige Coffee!%0A%0AI'd like to place an order:%0A${lines}%0A%0A*Total: ₹${total}*`;
  window.open(`https://wa.me/919211741666?text=${msg}`, '_blank');
}

if (checkoutBtn) {
  checkoutBtn.addEventListener('click', function(e) {
    e.preventDefault();
    const items = getCartItems();
    if (items.length === 0) return;
    if (window.plattrIsReady && window.plattrIsReady()) {
      checkoutModal.style.display = 'flex';
      checkoutName.value = '';
      checkoutPhone.value = '';
      checkoutName.focus();
    } else {
      fallbackWhatsApp();
    }
  });
}

function updateCheckoutButton() {
  if (!checkoutBtnText) return;
  if (window.plattrIsReady && window.plattrIsReady()) {
    checkoutBtnText.textContent = 'Place Order';
  } else {
    checkoutBtnText.textContent = 'Order via WhatsApp';
  }
}
updateCheckoutButton();
window.addEventListener('plattr:ready', updateCheckoutButton);

function closeCheckoutModal() {
  if (checkoutModal) checkoutModal.style.display = 'none';
}

if (checkoutCancel) checkoutCancel.addEventListener('click', closeCheckoutModal);
if (checkoutModal) {
  const backdrop = checkoutModal.querySelector('.checkout-modal-backdrop');
  if (backdrop) backdrop.addEventListener('click', closeCheckoutModal);
}

if (checkoutForm) {
  checkoutForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = checkoutName?.value?.trim();
    const phone = checkoutPhone?.value?.trim();
    if (!name || !phone) return;
    if (!window.plattrPlaceOrder) { fallbackWhatsApp(); closeCheckoutModal(); return; }
    checkoutSubmit.disabled = true;
    checkoutSubmit.textContent = 'Placing...';
    try {
      const items = getCartItems();
      const data = await window.plattrPlaceOrder(items, name, phone);
      const orderNum = data?.order_number || 'order';
      alert('Order placed! Order #' + orderNum + '. We will have it ready soon.');
      cart = {};
      renderCart();
      closeCart();
      closeCheckoutModal();
    } catch (err) {
      alert('Order failed: ' + (err.message || 'Please try WhatsApp.'));
    } finally {
      checkoutSubmit.disabled = false;
      checkoutSubmit.textContent = 'Place Order';
    }
  });
}

// ===== MENU FILTER + LOAD MORE =====
const ITEMS_PER_PAGE = 12;
let visibleCount = ITEMS_PER_PAGE;
let currentCat = 'all';

function updateMenuVisibility() {
  const cards = Array.from(document.querySelectorAll('.menu-card'));
  let shown = 0;
  cards.forEach(card => {
    const matches = currentCat === 'all' || card.dataset.cat === currentCat;
    if (!matches) {
      card.style.display = 'none';
      return;
    }
    const shouldShow = shown < visibleCount;
    card.style.display = shouldShow ? '' : 'none';
    if (shouldShow) shown++;
  });
  const totalVisible = cards.filter(c => currentCat === 'all' || c.dataset.cat === currentCat).length;
  const loadMoreWrap = document.getElementById('loadMoreWrap');
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  if (loadMoreWrap && loadMoreBtn) {
    if (shown >= totalVisible || totalVisible <= ITEMS_PER_PAGE) {
      loadMoreWrap.style.display = 'none';
    } else {
      loadMoreWrap.style.display = 'block';
      loadMoreBtn.textContent = `Load more (${totalVisible - shown} remaining)`;
    }
  }
}

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCat = btn.dataset.cat;
    visibleCount = ITEMS_PER_PAGE;
    updateMenuVisibility();
  });
});

const loadMoreBtn = document.getElementById('loadMoreBtn');
if (loadMoreBtn) {
  loadMoreBtn.addEventListener('click', () => {
    visibleCount += ITEMS_PER_PAGE;
    updateMenuVisibility();
  });
}

updateMenuVisibility();

// ===== NEWSLETTER =====
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', e => {
    e.preventDefault();
    const input = newsletterForm.querySelector('input[type="email"]');
    if (input && input.value.trim()) {
      newsletterForm.innerHTML = '<p style="color: #C5E02E; font-weight: 600;">✓ You\'re subscribed! Welcome to the Beige family.</p>';
    }
  });
}

// ===== MOBILE MENU (Oak Earth uses .open class) =====
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenuClose = document.getElementById('mobileMenuClose');
const mobileMenu = document.getElementById('mobileMenu');
const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

function openMobileMenu() {
  if (mobileMenu) mobileMenu.classList.add('open');
  if (mobileMenuOverlay) mobileMenuOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  if (mobileMenuBtn) mobileMenuBtn.classList.add('open');
}

function closeMobileMenu() {
  if (mobileMenu) mobileMenu.classList.remove('open');
  if (mobileMenuOverlay) mobileMenuOverlay.classList.remove('open');
  document.body.style.overflow = '';
  if (mobileMenuBtn) mobileMenuBtn.classList.remove('open');
}

if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileMenu);
if (mobileMenuClose) mobileMenuClose.addEventListener('click', closeMobileMenu);
if (mobileMenuOverlay) mobileMenuOverlay.addEventListener('click', closeMobileMenu);
mobileNavLinks.forEach(link => link.addEventListener('click', closeMobileMenu));

document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (cartDrawer && cartDrawer.classList.contains('open')) closeCart();
  else if (mobileMenu && mobileMenu.classList.contains('open')) closeMobileMenu();
});

// ===== NAV SCROLL =====
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  });
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
