const CART_KEY = 'meu_carrinho_loja';

function getCart() {
  const cartJSON = localStorage.getItem(CART_KEY);
  return cartJSON ? JSON.parse(cartJSON) : [];
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(product) {
  const cart = getCart();
  const index = cart.findIndex(item => item.id === product.id && item.size === product.size);
  if (index !== -1) {
    cart[index].quantity += product.quantity;
  } else {
    cart.push(product);
  }
  saveCart(cart);
  alert(`Produto "${product.name}" adicionado ao carrinho!`);
}

function renderCart() {
  const cart = getCart();
  const container = document.querySelector('.cart-items');
  const totalElement = document.getElementById('total-price');
  const checkoutBtn = document.getElementById('checkout-btn');

  if (!container) return;

  container.innerHTML = '';

  if (cart.length === 0) {
    container.innerHTML = `<p class="empty-state">Seu carrinho está vazio.</p>`;
    if (totalElement) totalElement.textContent = 'R$ 0,00';
    if (checkoutBtn) checkoutBtn.disabled = true;
    return;
  }

  let total = 0;

  cart.forEach((item, idx) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    const cartItem = document.createElement('div');
    cartItem.classList.add('cart-item');
    cartItem.innerHTML = `
      <div class="cart-thumb"><img src="${item.image}" alt="${item.name}"></div>
      <div class="cart-info">
        <h3 class="cart-title-item">${item.name}</h3>
        <p>Tamanho: ${item.size}</p>
        <p>Preço unitário: R$ ${item.price.toFixed(2)}</p>
        <div class="qty-control">
          <button class="qty-btn decrease" data-index="${idx}">−</button>
          <span class="qty-value">${item.quantity}</span>
          <button class="qty-btn increase" data-index="${idx}">+</button>
        </div>
      </div>
      <div class="cart-controls">
        <button class="remove-btn" data-index="${idx}">Remover</button>
      </div>
    `;
    container.appendChild(cartItem);
  });

  if (totalElement) totalElement.textContent = `R$ ${total.toFixed(2)}`;
  if (checkoutBtn) checkoutBtn.disabled = false;

  container.querySelectorAll('.qty-btn.decrease').forEach(btn => {
    btn.addEventListener('click', () => {
      changeQuantity(parseInt(btn.dataset.index), -1);
    });
  });

  container.querySelectorAll('.qty-btn.increase').forEach(btn => {
    btn.addEventListener('click', () => {
      changeQuantity(parseInt(btn.dataset.index), 1);
    });
  });

  container.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      removeItem(parseInt(btn.dataset.index));
    });
  });
}

function changeQuantity(index, delta) {
  const cart = getCart();
  if (!cart[index]) return;

  cart[index].quantity += delta;
  if (cart[index].quantity < 1) {
    if (!confirm('Quantidade menor que 1. Deseja remover o item?')) {
      cart[index].quantity = 1;
      return;
    }
    cart.splice(index, 1);
  }
  saveCart(cart);
  renderCart();
}

function removeItem(index) {
  const cart = getCart();
  if (!cart[index]) return;
  if (!confirm(`Deseja remover "${cart[index].name}" do carrinho?`)) return;
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
}

function setupAddToCartButtons() {
  const buttons = document.querySelectorAll('.cart-btn-add-cart');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const productCard = btn.closest('.cart-cream-box');
      if (!productCard) return alert('Produto inválido');

      const id = productCard.dataset.id || Date.now().toString();
      const name = productCard.querySelector('.cart-title-item').textContent.trim();
      const priceText = productCard.querySelector('.price-text').textContent.replace(/[^\d,]/g, '').replace(',', '.');
      const price = parseFloat(priceText) || 0;
      const image = productCard.querySelector('img').src;

      const sizeInputs = productCard.querySelectorAll('input[type="radio"][name^="size-produto"]');
      let size = 'M';
      if (sizeInputs.length > 0) {
        sizeInputs.forEach(input => {
          if (input.checked) size = input.value;
        });
      }

      const product = {
        id,
        name,
        price,
        image,
        size,
        quantity: 1
      };

      addToCart(product);
      window.location.href = 'checkout.html';
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  setupAddToCartButtons();
});

const WHATSAPP_NUMBER = '5511999999999'; // Coloque o número do WhatsApp com código do país, sem "+" nem espaços

function generateWhatsAppMessage() {
  const cart = getCart();
  if (cart.length === 0) return '';

  // Pega os dados do cliente do formulário
  const name = document.getElementById('name')?.value || '';
  const email = document.getElementById('email')?.value || '';
  const phone = document.getElementById('phone')?.value || '';
  const address = document.getElementById('address')?.value || '';

  let message = `Olá, gostaria de fazer um pedido na The Clothing Noshi.\n\n`;

  message += `*Dados do cliente:*\n`;
  message += `Nome: ${name}\n`;
  message += `Email: ${email}\n`;
  message += `Telefone: ${phone}\n`;
  message += `Endereço: ${address}\n\n`;

  message += `*Itens do pedido:*\n`;

  let total = 0;
  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    message += `- ${item.name} | Tamanho: ${item.size} | Quantidade: ${item.quantity} | Preço unitário: R$${item.price.toFixed(2)} | Subtotal: R$${itemTotal.toFixed(2)}\n`;
  });

  message += `\n*Total do pedido: R$${total.toFixed(2)}*`;

  return encodeURIComponent(message);
}

function openWhatsApp() {
  const message = generateWhatsAppMessage();
  if (!message) {
    alert('Seu carrinho está vazio!');
    return;
  }
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  window.open(url, '_blank');
}

function updateWhatsAppButtonState() {
  const cart = getCart();
  const btn = document.getElementById('whatsapp-btn');
  const form = document.getElementById('checkout-form');

  if (!btn || !form) return;

  const cartHasItems = cart.length > 0;
  const formValid = validateForm();

  btn.disabled = !(cartHasItems && formValid);
}

document.addEventListener('DOMContentLoaded', () => {
  // ... seu código já existente

  const whatsappBtn = document.getElementById('whatsapp-btn');
  if (whatsappBtn) {
    whatsappBtn.addEventListener('click', openWhatsApp);
  }

  const form = document.getElementById('checkout-form');
  if (form) {
    form.addEventListener('input', () => {
      updateWhatsAppButtonState();
    });
    updateWhatsAppButtonState();
  }
});
