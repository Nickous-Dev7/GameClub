(function(){

  // ===========================
  //  DATABASE HELPER
  // ===========================
  const DB = {
    get(k){ try{return JSON.parse(localStorage.getItem(k));}catch(e){return null} },
    set(k,v){ localStorage.setItem(k, JSON.stringify(v)); },
    remove(k){ localStorage.removeItem(k); }
  };

  function el(id){ return document.getElementById(id); }

  window.logout = window.logout || function(){
    DB.remove('session');
    location.href='index.html';
  };


  // ===========================
  //  GERADOR DE ID GAMECLUB
  // ===========================
  function generateGameClubOrderId() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return "GC-" + code;
  }
  window.generateGameClubOrderId = generateGameClubOrderId;



  // ===========================
  //  REMOVE PRODUTOS INICIAIS
  // ===========================
  if (!DB.get('products')) {
    DB.set('products', []); // marketplace começa vazio
  }



  // ===========================
  //  MARKETPLACE
  // ===========================
  if(location.pathname.includes('marketplace')){
    const list = el('productsList');

    const searchInput = document.createElement('input');
    searchInput.placeholder = 'Pesquisar por título...';

    const categorySelect = document.createElement('select');
    categorySelect.innerHTML =
      '<option value="">Todas categorias</option><option>Jogo</option><option>Console</option><option>Acessório</option>';

    const platformSelect = document.createElement('select');
    platformSelect.innerHTML = 
    `<option value="">Todas plataformas</option>
     <option>Amiga</option>
     <option>Amstrad CPC</option>
     <option>Arcade</option>
     <option>Atari 2600</option>
     <option>Atari 5200</option>
     <option>Atari 7800</option>
     <option>Atari Jaguar</option>
     <option>Atari Lynx</option>
     <option>Commodore 64</option>
     <option>Dreamcast</option>
     <option>Game Boy</option>
     <option>Game Boy Advance</option>
     <option>Game Boy Color</option>
     <option>GameCube</option>
     <option>Master System</option>
     <option>Mega Drive</option>
     <option>Nintendo 3DS</option>
     <option>Nintendo 64</option>
     <option>Nintendo DS</option>
     <option>Nintendo Switch</option>
     <option>PC</option>
     <option>PlayStation 1</option>
     <option>PlayStation 2</option>
     <option>PlayStation 3</option>
     <option>PlayStation 4</option>
     <option>PlayStation 5</option>
     <option>PSP</option>
     <option>PS Vita</option>
     <option>Sega 32X</option>
     <option>Sega CD</option>
     <option>Sega Saturn</option>
     <option>Super Nintendo</option>
     <option>TurboGrafx-16</option>
     <option>Wii</option>
     <option>Wii U</option>
     <option>Xbox</option>
     <option>Xbox 360</option>
     <option>Xbox One</option>
     <option>Xbox Series X</option>
     <option>Xbox Series S</option>`;


    const searchRow = document.createElement('div');
    searchRow.className = 'search-row';
    searchRow.appendChild(searchInput);
    searchRow.appendChild(categorySelect);
    searchRow.appendChild(platformSelect);

    list.parentNode.insertBefore(searchRow, list);

    function render(){
      const products = DB.get('products') || [];

      const filtered = products.filter(p =>
        (!p.sold) && // mostra apenas DISPONÍVEIS
        p.title.toLowerCase().includes(searchInput.value.toLowerCase())
        && (!categorySelect.value || p.category === categorySelect.value)
        && (!platformSelect.value || p.platform === platformSelect.value)
      );

      list.innerHTML = filtered.map(p=>`
        <div class="product card">
          <img src="${p.image}" alt="${p.title}" />
          <div><strong>${p.title}</strong></div>
          <div class="muted">${p.category} • ${p.platform}</div>
          <div class="muted">${p.desc}</div>

          <div class="row" style="margin-top:auto;justify-content:space-between;align-items:center">
            <div class="price">R$ ${p.price}</div>

            <div class="row">
              <button class="icon-btn" onclick="viewProduct('${p.id}')">Ver</button>
              <button onclick="addToCart('${p.id}')" class="icon-btn">Comprar</button>
            </div>
          </div>
        </div>
      `).join('') || '<div class="muted">Nenhum produto encontrado</div>';
    }

    searchInput.addEventListener('input', render);
    categorySelect.addEventListener('change', render);
    platformSelect.addEventListener('change', render);

    render();
  }



  // ===========================
  //  VISUALIZAR PRODUTO
  // ===========================
 
  window.viewProduct = function(id){
  const p = DB.get('products').find(x=>x.id===id);

  // Preenche modal
  el("modalImage").src = p.image;
  el("modalTitle").textContent = p.title;
  el("modalCategory").textContent = "Categoria: " + p.category;
  el("modalPlatform").textContent = "Plataforma: " + p.platform;
  el("modalDesc").textContent = p.desc || "Sem descrição";
  el("modalPrice").textContent = "R$ " + p.price;

  // Botão comprar dentro do modal
  const buyBtn = el("modalBuyBtn");
  buyBtn.onclick = () => addToCart(p.id);

  // Exibir modal
  el("productModal").classList.remove("hidden");
};
    


  // ===========================
  //  CARRINHO
  // ===========================
  window.getCart = function(){ return DB.get('cart') || []; }

  window.addToCart = function(id){
  let cart = DB.get('cart') || [];
  const p = DB.get('products').find(x=>x.id===id);
  const sess = DB.get('session');

  if (!sess)
    return alert('Faça login para comprar.');

  if (!p)
    return alert('Produto não encontrado.');

  // Já marcado como vendido? Não deixa comprar
  if (p.sold)
    return alert('Este produto já foi vendido.');

  // 🔥 Impedir comprar o próprio produto
  if (p.owner === (sess?.email || ''))
    return alert('Você não pode comprar seu próprio produto.');

  // 🔥 Produto é unitário → não deixar entrar 2x no carrinho
  const already = cart.find(i => i.id === id);
  if (already)
    return alert('Este item é único e já está no carrinho.');

  // Sempre 1 unidade
  cart.push({ id: p.id, title: p.title, price: p.price, qty: 1 });

  DB.set('cart', cart);
  alert('Produto adicionado ao carrinho!');
};



  // ===========================
  //  MEUS PRODUTOS
  // ===========================
  if(location.pathname.includes('myproducts')){
    let products = DB.get('products') || [];
    const list = el('myProductsList');
    const form = el('productForm');


    const fileInput = document.createElement('input');
    fileInput.type='file';
    fileInput.accept='image/*';
    fileInput.id='prodImageFile';

    const imagePreview = document.createElement('img');
    imagePreview.className='preview-img';
    imagePreview.style.display='none';

    form.insertBefore(fileInput, form.querySelector('textarea'));
    form.insertBefore(imagePreview, form.querySelector('textarea'));

    fileInput.addEventListener('change', (e)=>{
      const f = e.target.files[0];
      if(!f) return;

      const reader = new FileReader();
      reader.onload = ev=>{
        imagePreview.src = ev.target.result;
        imagePreview.style.display='block';
        imagePreview.dataset.base = ev.target.result;
      };
      reader.readAsDataURL(f);
    });

    function render(){
      const sess = DB.get('session') || {};
      const mine = products.filter(p=>p.owner === (sess.email || ''));

      list.innerHTML = mine.map(p=>`
        <div class="card">

          <img src="${p.image}" class="myprod-thumb">

          <strong>${p.title}</strong>
          <div class="muted">${p.category} • ${p.platform} • R$ ${p.price}</div>

          ${p.sold ? `<div class="soldTag">VENDIDO</div>` : ''}

          <div class="row" style="margin-top:8px">
            <button class="icon-btn" onclick="editProd('${p.id}')">Editar</button>
            <button class="icon-btn" onclick="delProd('${p.id}')">Excluir</button>
          </div>

        </div>
      `).join('') || '<div class="muted">Nenhum produto seu ainda</div>';
    }

    render();

    form.addEventListener('submit', e=>{
      e.preventDefault();

      const id = el('editingId').value || 'p' + Math.random().toString(36).slice(2,9);
      const imgBase = imagePreview.dataset.base;

      const p = {
        id,
        title: el('prodTitle').value.trim(),
        price: Number(el('prodPrice').value),
        category: el('prodCategory').value.trim(),
        platform: el('prodPlatform').value,
        desc: el('prodDesc').value.trim(),
        image: imgBase || el('prodImage').value || '',
        owner: DB.get('session')?.email || 'anon',
        sold: false
      };

      if(!p.title || !p.price || !p.category)
        return alert('Título, preço e categoria são obrigatórios.');

      const idx = products.findIndex(x=>x.id===id);
      if(idx===-1) products.push(p);
      else products[idx]=p;

      DB.set('products', products);

      alert('Produto salvo!');

      form.reset();
      imagePreview.style.display='none';
      imagePreview.dataset.base='';
      el('editingId').value='';

      products = DB.get('products') || [];
      render();
    });

    window.editProd = function(id){
      const p = products.find(x=>x.id===id);

      el('prodTitle').value = p.title;
      el('prodPrice').value = p.price;
      el('prodCategory').value = p.category;
      el('prodDesc').value = p.desc;
      el('prodImage').value = p.image;
      el('editingId').value = p.id;

      el('prodPlatform').value = p.platform;

      imagePreview.src = p.image;
      imagePreview.style.display='block';
      imagePreview.dataset.base = p.image;
    }

    window.delProd = function(id){
      if(!confirm('Excluir produto?')) return;

      const idx = products.findIndex(x=>x.id===id);
      if(idx>-1) products.splice(idx,1);

      DB.set('products', products);

      products = DB.get('products') || [];
      render();
    }
  }

})();

// ===========================
//  FECHAR MODAL PRODUTO
// ===========================

document.getElementById("closeModal").onclick = function(){
  document.getElementById("productModal").classList.add("hidden");
};

// Fecha ao clicar FORA do content
document.getElementById("productModal").addEventListener("click", function(e){
  // se clicou no fundo (modal), fecha
  if (e.target === this) {
    this.classList.add("hidden");
  }
});
