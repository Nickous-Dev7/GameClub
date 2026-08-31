(function(){
  const DB = {
    get(k){ try{return JSON.parse(localStorage.getItem(k));}catch(e){return null} },
    set(k,v){ localStorage.setItem(k, JSON.stringify(v)); },
    remove(k){ localStorage.removeItem(k); }
  };

  function el(id){ return document.getElementById(id); }


  // ============================================
  // GERADOR DE ID GAMECLUB  (ADICIONADO AQUI)
  // ============================================
  function generateGameClubOrderId() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return "GC-" + code;
  }



  // ============================================
  // CARRINHO (cart.html)
  // ============================================
  if (location.pathname.includes('cart')) {
    const area = el('cartArea');

    function renderCart(){
      const cart = DB.get('cart') || [];

      if (!cart.length)
        return area.innerHTML = '<div class="muted">Carrinho vazio</div>';

      area.innerHTML =
        cart.map(i => `
          <div class="card">
            <strong>${i.title}</strong>
            <div class="muted">R$ ${i.price} x ${i.qty}</div>
          </div>
        `).join('')
        +
        `<div style="margin-top:12px">
           <button onclick="location.href='checkout.html'">Finalizar Compra</button>
         </div>`;
    }

    renderCart();
  }


  // ============================================
  // CHECKOUT (checkout.html)
  // ============================================
  if (
    location.pathname.endsWith('checkout.html') ||
    location.pathname.endsWith('/checkout') ||
    location.pathname.includes('checkout')
  ) {

    const session = DB.get('session');

    // 🔒 Se não estiver logado, volta para login
    if (!session) {
      alert("Você precisa estar logado para finalizar a compra.");
      location.href = "index.html";
      return;
    }

    // 🏠 Preencher automaticamente o endereço
    if (session.address) {
      const addr = el("checkoutAddress");
      if (addr) addr.value = session.address;
    }

    const form = el('checkoutForm');

    form.addEventListener('submit', e => {
      e.preventDefault();

      const cart = DB.get('cart') || [];
      if (!cart.length) return alert("Carrinho vazio.");
    
      const orders = DB.get('orders') || [];
      const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

        // 🔥 Marca produtos como vendidos
      const products = DB.get('products') || [];
      cart.forEach(item => {
        const prod = products.find(p => p.id === item.id);
        if (prod) {
        prod.sold = true; // agora esse anúncio está vendido
  }
});
      DB.set('products', products);

// -------------- ID GameClub --------------
      const order = {
        id: generateGameClubOrderId(),
        user: DB.get('session')?.email || 'anon',
        items: cart,
        total,
        at: new Date().toISOString()
};
// -----------------------------------------

      orders.push(order);
      DB.set('orders', orders);
      DB.set('cart', []);

      alert('Compra finalizada: R$ ' + total);
      location.href = 'marketplace.html';
  
    });
  }


  // ============================================
  // HISTÓRICO DO PERFIL (profile.html)
  // ============================================
  if (location.pathname.includes('profile')) {
    const list = el('orderHistory');

    if (list) {
      const sess = DB.get('session')?.email;
      const orders = (DB.get('orders') || []).filter(o => o.user === sess);

      list.innerHTML =
        orders.map(o => `
          <div class="card">
            <strong>Pedido ${o.id}</strong>
            <div class="muted">${new Date(o.at).toLocaleString()}</div>
            <div>Total: R$ ${o.total}</div>
          </div>
        `).join('')
        || '<div class="muted">Nenhum pedido</div>';
    }
  }

})();
