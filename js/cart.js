// Itens do carrinho armazenados no localStorage para persistência
const CART_KEY = 'meu_carrinho_loja';

// Função para obter o carrinho do localStorage ou iniciar vazio
function getCart() {
  const cartJSON = localStorage.getItem(CART_KEY);
  return cartJSON ? JSON.parse(cartJSON) : [];
}

// Salva o carrinho no localStorage
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// Adiciona produto ao carrinho
function addToCart(product) {
  const cart = getCart();
  
  // Verifica se o produto com mesmo tamanho já está no carrinho para somar quantidade
  const index = cart.findIndex(item => item.id === product.id && item.size === product.size);
  
  if (index !== -1) {
    cart[index].quantity += product.quantity;
  } else {
    cart.push(product);
  }
  
  saveCart(cart);
  alert(`Produto "${product.name}" adicionado ao carrinho!`);
}

// Atualiza a exibição do carrinho na página checkout
function renderCart() {
  const cart = getCart();
  const container = document.querySelector('.cart-items');
  const totalElement = document.getElementById('total-price');
  
  if (!container) return; // Se não estiver na página checkout, sai
  
  container.innerHTML = ''; // limpa itens
  
  if (cart.length === 0) {
    container.innerHTML = `<p class="empty-state">Seu carrinho está vazio.</p>`;
    if (totalElement) totalElement.textContent = 'R$ 0,00';
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
  
  // Adiciona eventos para botões
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

// Altera quantidade de um item (incrementa ou decrementa)
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

// Remove item do carrinho
function removeItem(index) {
  const cart = getCart();
  if (!cart[index]) return;
  if (!confirm(`Deseja remover "${cart[index].name}" do carrinho?`)) return;
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
}

// Função para capturar clique no botão adicionar ao carrinho e redirecionar para checkout
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
      
      // Pega tamanho selecionado dentro do produto
      const sizeInputs = productCard.querySelectorAll('input[type="radio"][name^="size-produto"]');
      let size = 'M'; // padrão
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
      // Redireciona para checkout
      window.location.href = 'checkout.html';
    });
  });
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  setupAddToCartButtons();
});
// Atualiza o carrinho na página de checkout