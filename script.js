const products = [
    { id: 1, name: "Lámpara Smart LED RGB 9W (Google Home)", price: 15900, category: "smart", image: "https://images.unsplash.com/photo-1550985616-10810253b84d?w=500", rating: 4.8 },
    { id: 2, name: "Tira LED Neón Flex RGB 5m Wi-Fi", price: 28500, category: "tiras", image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500", rating: 4.9 },
    { id: 3, name: "Panel LED Embutir 24W Luz Neutra", price: 19990, category: "comercial", image: "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=500", rating: 4.6 },
    { id: 4, name: "Spot AR111 Proyector para Vidrieras", price: 23900, category: "comercial", image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500", rating: 4.7 },
    { id: 5, name: "Lámpara Inteligente Filament Vintage Smart", price: 21500, category: "smart", image: "https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?w=500", rating: 4.5 },
    { id: 6, name: "Tira LED RGBIC 3M USB para TV / Monitor", price: 18000, category: "tiras", image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500", rating: 4.4 }
];

let cart = JSON.parse(localStorage.getItem('cart')) || [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let selectedCategory = 'todos';
let discountApplied = false;

const productsGrid = document.getElementById('products-grid');
const cartCount = document.getElementById('cart-count');
const cartModal = document.getElementById('cart-modal');
const overlay = document.getElementById('overlay');
const cartItemsContainer = document.getElementById('cart-items');
const cartSubtotalEl = document.getElementById('cart-subtotal');
const cartDiscountEl = document.getElementById('cart-discount');
const cartTotalEl = document.getElementById('cart-total');
const searchInput = document.getElementById('search-input');
const priceRange = document.getElementById('price-range');
const priceValue = document.getElementById('price-value');

document.addEventListener('DOMContentLoaded', () => {
    renderProducts(products);
    updateCartUI();
    setupEventListeners();
});

function renderProducts(productList) {
    productsGrid.innerHTML = '';
    
    if (productList.length === 0) {
        productsGrid.innerHTML = '<p>No se encontraron productos de iluminación que coincidan.</p>';
        return;
    }

    productList.forEach(product => {
        const isFav = favorites.includes(product.id);
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <button class="fav-btn ${isFav ? 'active' : ''}" onclick="toggleFavorite(${product.id})">
                <i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i>
            </button>
            <img src="${product.image}" alt="${product.name}">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-price">$${product.price.toLocaleString()}</p>
                <p>⭐ ${product.rating}</p>
                <button class="btn-primary" onclick="addToCart(${product.id})">Agregar al Carrito</button>
            </div>
        `;
        productsGrid.appendChild(card);
    });
}

function addToCart(id) {
    const product = products.find(p => p.id === id);
    const existingIndex = cart.findIndex(item => item.id === id);

    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveAndRefreshCart();
    showToast(`Se agregó "${product.name}" al carrito.`);
}

function updateCartQuantity(id, delta) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== id);
        }
    }
    saveAndRefreshCart();
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveAndRefreshCart();
    showToast("Producto eliminado del carrito.");
}

function saveAndRefreshCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
}

function updateCartUI() {
    const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartCount.textContent = totalCount;

    cartItemsContainer.innerHTML = '';
    let subtotal = 0;

    cart.forEach(item => {
        subtotal += item.price * item.quantity;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <div>
                <h4>${item.name}</h4>
                <p>$${item.price.toLocaleString()}</p>
            </div>
            <div class="cart-item-controls">
                <button onclick="updateCartQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateCartQuantity(${item.id}, 1)">+</button>
                <button onclick="removeFromCart(${item.id})"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        cartItemsContainer.appendChild(itemDiv);
    });

    const discount = discountApplied ? subtotal * 0.10 : 0;
    const total = subtotal - discount;

    cartSubtotalEl.textContent = subtotal.toLocaleString();
    cartDiscountEl.textContent = discount.toLocaleString();
    cartTotalEl.textContent = total.toLocaleString();
}

function filterProducts() {
    const query = searchInput.value.toLowerCase();
    const maxPrice = Number(priceRange.value);

    const filtered = products.filter(p => {
        const matchesCategory = selectedCategory === 'todos' || p.category === selectedCategory;
        const matchesSearch = p.name.toLowerCase().includes(query);
        const matchesPrice = p.price <= maxPrice;
        return matchesCategory && matchesSearch && matchesPrice;
    });

    renderProducts(filtered);
}

function toggleFavorite(id) {
    if (favorites.includes(id)) {
        favorites = favorites.filter(favId => favId !== id);
    } else {
        favorites.push(id);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    filterProducts();
}

function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
}

function setupEventListeners() {
    document.getElementById('cart-toggle').addEventListener('click', () => {
        cartModal.classList.add('open');
        overlay.classList.add('active');
    });

    document.getElementById('close-cart').addEventListener('click', closeCart);
    overlay.addEventListener('click', closeCart);

    function closeCart() {
        cartModal.classList.remove('open');
        overlay.classList.remove('active');
    }

    document.getElementById('theme-toggle').addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });

    document.querySelectorAll('.btn-filter').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            selectedCategory = e.target.dataset.category;
            filterProducts();
        });
    });

    priceRange.addEventListener('input', (e) => {
        priceValue.textContent = e.target.value;
        filterProducts();
    });

    searchInput.addEventListener('input', filterProducts);

    document.getElementById('apply-discount').addEventListener('click', () => {
        const code = document.getElementById('discount-code').value.trim();
        if (code === 'GOOGLELED10') {
            discountApplied = true;
            showToast("¡10% de descuento aplicado con éxito!");
            updateCartUI();
        } else {
            showToast("Código de descuento no válido.");
        }
    });

    document.getElementById('checkout-btn').addEventListener('click', () => {
        if (cart.length === 0) {
            showToast("Tu carrito está vacío.");
            return;
        }
        alert("¡Muchas gracias por tu compra en Google LED! Tu pedido fue procesado correctamente.");
        cart = [];
        discountApplied = false;
        saveAndRefreshCart();
        closeCart();
    });
}
