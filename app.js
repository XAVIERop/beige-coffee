/* =============================================
   BEIGE COFFEE — Mallow-style Application Script
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

  // Update badge
  if (cartCount) {
    if (totalQty > 0) {
      cartCount.textContent = totalQty;
      cartCount.style.display = 'flex';
    } else {
      cartCount.style.display = 'none';
    }
  }

  // Clear existing items (keep empty div)
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
    div.className = 'bg-white border-4 border-[#1A3D44] asym-border p-4 mb-4 flex items-center gap-4';
    div.innerHTML = `
      <div class="flex-1">
        <div class="font-bold text-lg">${item.name}</div>
        <div class="text-[#D67D4C] font-bold">₹${item.price} × ${item.qty} = ₹${item.price * item.qty}</div>
      </div>
      <div class="flex items-center gap-2 bg-[#FDF9F3] border-2 border-[#1A3D44] rounded-2xl px-3 py-1">
        <button class="qty-btn text-xl hover:text-[#D67D4C] transition-colors" data-action="dec" data-key="${item.key}"><iconify-icon icon="lucide:minus"></iconify-icon></button>
        <span class="font-bold w-6 text-center">${item.qty}</span>
        <button class="qty-btn text-xl hover:text-[#408F9E] transition-colors" data-action="inc" data-key="${item.key}"><iconify-icon icon="lucide:plus"></iconify-icon></button>
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

// Qty button delegation
document.getElementById('cartItems').addEventListener('click', e => {
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

// Add to cart
const menuGrid = document.getElementById('menuGrid');
if (menuGrid) {
  menuGrid.addEventListener('click', e => {
    const btn = e.target.closest('.add-btn');
    if (!btn) return;
    const name = btn.dataset.name;
    const price = parseInt(btn.dataset.price);
    const key = name.toLowerCase().replace(/\s+/g, '-');
    if (cart[key]) {
      cart[key].qty++;
    } else {
      cart[key] = { key, name, price, qty: 1 };
    }
    btn.classList.add('scale-110');
    btn.innerHTML = '<iconify-icon icon="lucide:check"></iconify-icon>';
    setTimeout(() => {
      btn.classList.remove('scale-110');
      btn.innerHTML = '<iconify-icon icon="lucide:plus"></iconify-icon>';
    }, 600);
    renderCart();
  });
}

// Cart open/close
const cartOverlay = document.getElementById('cartOverlay');
const cartDrawer = document.getElementById('cartDrawer');

function openCart() {
  if (cartDrawer) {
    cartDrawer.classList.remove('translate-x-full');
    cartDrawer.classList.add('translate-x-0');
  }
  if (cartOverlay) {
    cartOverlay.classList.remove('opacity-0', 'pointer-events-none');
    cartOverlay.classList.add('opacity-100');
  }
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  if (cartDrawer) {
    cartDrawer.classList.add('translate-x-full');
    cartDrawer.classList.remove('translate-x-0');
  }
  if (cartOverlay) {
    cartOverlay.classList.add('opacity-0', 'pointer-events-none');
    cartOverlay.classList.remove('opacity-100');
  }
  document.body.style.overflow = '';
}

const cartOpenBtn = document.getElementById('cartOpenBtn');
if (cartOpenBtn) cartOpenBtn.addEventListener('click', openCart);

const cartCloseBtn = document.getElementById('cartCloseBtn');
if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);

if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (cartDrawer && cartDrawer.classList.contains('translate-x-0')) closeCart();
  else if (mobileMenu && !mobileMenu.classList.contains('translate-x-full')) closeMobileMenu();
});

// WhatsApp checkout - update link with cart items when cart has items
const checkoutBtn = document.getElementById('checkoutBtn');
if (checkoutBtn) {
  checkoutBtn.addEventListener('click', (e) => {
    const items = getCartItems();
    if (items.length === 0) {
      e.preventDefault();
      return;
    }
    const lines = items.map(i => `• ${i.name} ×${i.qty} = ₹${i.price * i.qty}`).join('%0A');
    const total = getCartTotal() + Math.round(getCartTotal() * 0.05);
    const msg = `Hi Beige Coffee!%0A%0AI'd like to place an order:%0A${lines}%0A%0A*Total: ₹${total}*`;
    window.open(`https://wa.me/919211741666?text=${msg}`, '_blank');
    e.preventDefault();
  });
}

// ===== MENU FILTER + LOAD MORE =====
const ITEMS_PER_PAGE = 12;
let visibleCount = ITEMS_PER_PAGE;
let currentCat = 'all';

function updateMenuVisibility() {
  const cards = Array.from(document.querySelectorAll('.menu-card'));
  let shown = 0;
  cards.forEach((card, i) => {
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
    document.querySelectorAll('.filter-btn').forEach(b => {
      b.classList.remove('active', 'bg-[#1A3D44]', 'text-white');
      b.classList.add('bg-white', 'border-2', 'border-[#1A3D44]', 'text-[#1A3D44]');
    });
    btn.classList.add('active', 'bg-[#1A3D44]', 'text-white');
    btn.classList.remove('bg-white', 'border-2', 'border-[#1A3D44]', 'text-[#1A3D44]');
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

// Initial state: show first ITEMS_PER_PAGE items
visibleCount = ITEMS_PER_PAGE;
updateMenuVisibility();

// ===== NEWSLETTER =====
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = newsletterForm.querySelector('input[type="email"]');
    if (input && input.value.trim()) {
      newsletterForm.innerHTML = '<p class="text-[#408F9E] font-bold">✓ You\'re subscribed! Welcome to the Beige family.</p>';
    }
  });
}

// ===== MOBILE MENU =====
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenuClose = document.getElementById('mobileMenuClose');
const mobileMenu = document.getElementById('mobileMenu');
const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

function openMobileMenu() {
  if (mobileMenu) mobileMenu.classList.remove('translate-x-full');
  if (mobileMenuOverlay) {
    mobileMenuOverlay.classList.remove('opacity-0', 'pointer-events-none');
    mobileMenuOverlay.classList.add('opacity-100');
  }
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  if (mobileMenu) mobileMenu.classList.add('translate-x-full');
  if (mobileMenuOverlay) {
    mobileMenuOverlay.classList.add('opacity-0', 'pointer-events-none');
    mobileMenuOverlay.classList.remove('opacity-100');
  }
  document.body.style.overflow = '';
}

if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileMenu);
if (mobileMenuClose) mobileMenuClose.addEventListener('click', closeMobileMenu);
if (mobileMenuOverlay) mobileMenuOverlay.addEventListener('click', closeMobileMenu);
mobileNavLinks.forEach(link => link.addEventListener('click', closeMobileMenu));

// ===== MENU NAV BUTTONS (scroll filter pills) =====
const filterPills = document.getElementById('filterPills');
document.querySelectorAll('.menu-nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (!filterPills) return;
    const dir = btn.dataset.dir;
    const scrollAmount = 200;
    filterPills.scrollBy({ left: dir === 'next' ? scrollAmount : -scrollAmount, behavior: 'smooth' });
  });
});

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
