
// Auth logic with masks and validation
(function(){
  const DB = {
    get(k){ try{return JSON.parse(localStorage.getItem(k));}catch(e){return null} },
    set(k,v){ localStorage.setItem(k, JSON.stringify(v)); },
    remove(k){ localStorage.removeItem(k); }
  };
  function el(id){ return document.getElementById(id); }
  window.logout = function(){ DB.remove('session'); location.href='index.html'; }

  function bindMask(id, formatter){
    const input = el(id);
    if(!input) return;
    input.addEventListener('input', (e)=>{
      input.value = formatter(input.value);
      input.selectionStart = input.selectionEnd = input.value.length;
    });
  }

  if(location.pathname.includes('register')){
    bindMask('regCPF', window.utils.formatCPF);
    bindMask('regPhone', window.utils.formatPhone);
    bindMask('regCEP', window.utils.formatCEP);
    const cepInput = el('regCEP');
    const addr = el('regAddress');
    cepInput.addEventListener('blur', async ()=>{
      const data = await window.utils.lookupCEP(cepInput.value);
      if(data){ addr.value = (data.logradouro? data.logradouro + ', ' : '') + (data.bairro? data.bairro + ', ': '') + data.localidade + ' - ' + data.uf; addr.disabled=false; }
      else { addr.value=''; addr.disabled=true; alert('CEP não encontrado'); }
    });

    el('registerForm').addEventListener('submit', (e)=>{
      e.preventDefault();
      const name = el('regName').value.trim();
      const email = el('regEmail').value.trim().toLowerCase();
      const birth = el('regBirth').value;
      const pass = el('regPass').value;
      const cpf = el('regCPF').value;
      const phone = el('regPhone').value;
      const cep = el('regCEP').value;
      const address = el('regAddress').value;

      if(!name || !email || !pass || !cpf || !phone || !cep || !address || !birth) 
        return alert('Todos os campos são obrigatórios.');

      if(!window.utils.validateEmail(email)) return alert('Email inválido.');
      if(!window.utils.validateCPF(cpf)) return alert('CPF inválido.');

      const users = DB.get('users') || [];
      if(users.find(u=>u.email===email)) return alert('Email já cadastrado.');
      users.push({ name, email, pass, cpf, phone: window.utils.formatPhone(phone), cep, address, birth });
      DB.set('users', users);
      alert('Cadastro realizado com sucesso! Faça login.');
      location.href='index.html';
    });
  }

  if(location.pathname.includes('index')){
    el('loginForm').addEventListener('submit', (e)=>{
      e.preventDefault();
      const email = el('loginEmail').value.trim().toLowerCase();
      const pass = el('loginPass').value;
      const users = DB.get('users') || [];
      const user = users.find(u=>u.email===email && u.pass===pass);
      if(!user) return alert('Credenciais inválidas.');
      DB.set('session', user);
      location.href='marketplace.html';
    });
  }

    if (location.pathname.includes('profile')) {
    const session = DB.get('session');
    if (!session) {
      location.href = 'index.html';
      return;
    }

    // Preenche campos
    const nameInput    = el('profileName');
    const emailInput   = el('profileEmail');
    const cpfInput     = el('profileCPF');
    const phoneInput   = el('profilePhone');
    const cepInput     = el('profileCEP');
    const addrInput    = el('profileAddress');
    const birthInput   = el('profileBirth'); 
    const passInput    = el('profilePass'); 

    if (nameInput)  nameInput.value  = session.name   || '';
    if (emailInput) emailInput.value = session.email  || '';
    if (cpfInput)   cpfInput.value   = session.cpf    || '';
    if (phoneInput) phoneInput.value = session.phone  || '';
    if (cepInput)   cepInput.value   = session.cep    || '';
    if (addrInput)  addrInput.value  = session.address|| '';
    if (birthInput) birthInput.value = session.birth  || '';
    if (passInput)  passInput.value  = session.pass   || ''; 

    bindMask('profileCPF', window.utils.formatCPF);
    bindMask('profilePhone', window.utils.formatPhone);
    bindMask('profileCEP', window.utils.formatCEP);

    if (cepInput && addrInput) {
      cepInput.addEventListener('blur', async ()=>{
        const data = await window.utils.lookupCEP(cepInput.value);
        if(data){
          addrInput.value =
            (data.logradouro ? data.logradouro + ', ' : '') +
            (data.bairro     ? data.bairro + ', '     : '') +
            data.localidade + ' - ' + data.uf;
        } else {
          alert('CEP não encontrado');
        }
      });
    }

    const form = el('profileForm');
    if (!form) return;

    form.addEventListener('submit', (e)=>{
      e.preventDefault();

      const users = DB.get('users') || [];
      const idx   = users.findIndex(u => u.email === session.email);
      if (idx === -1) {
        alert('Usuário não encontrado.');
        return;
      }

      const name    = nameInput  ? nameInput.value.trim()  : session.name;
      const cpf     = cpfInput   ? cpfInput.value          : session.cpf;
      const phone   = phoneInput ? phoneInput.value        : session.phone;
      const cep     = cepInput   ? cepInput.value          : session.cep;
      const address = addrInput  ? addrInput.value         : session.address;
      const birth   = birthInput ? birthInput.value        : session.birth;
      const newPass = passInput  ? passInput.value         : session.pass;

      // Se houver campo de email editável, usa; senão mantém o antigo
      const newEmail = emailInput
        ? emailInput.value.trim().toLowerCase()
        : session.email;
      

      if(!name || !cpf || !phone || !cep || !address || !newEmail || !birth) {
        alert('Todos os campos são obrigatórios.');
        return;
      }

      if(!window.utils.validateCPF(cpf)) {
        alert('CPF inválido.');
        return;
      }

      // Se email mudou, verifica se já existe outro usuário com ele
      if (newEmail !== session.email && users.find(u => u.email === newEmail)) {
        alert('Este email já está em uso.');
        return;
      }

      const oldUser = users[idx];

      const updatedUser = {
        ...oldUser,
        name,
        cpf,
        phone: window.utils.formatPhone(phone),
        cep,
        address,
        birth,
        email: newEmail,
        pass: newPass ? newPass : oldUser.pass  // só muda se digitar algo
      };

      users[idx] = updatedUser;
      DB.set('users', users);
      DB.set('session', updatedUser);

      alert('Perfil atualizado com sucesso!');
      location.reload();
    });
  }

window.deleteAccount = function () {
    const DB = {
        get(k){ try{return JSON.parse(localStorage.getItem(k));}catch(e){return null} },
        set(k,v){ localStorage.setItem(k, JSON.stringify(v)); },
        remove(k){ localStorage.removeItem(k); }
    };

    if (!confirm("Tem certeza que deseja excluir sua conta? Essa ação é irreversível.")) {
        return;
    }

    const session = DB.get('session');
    if (!session) return;

    let users = DB.get('users') || [];

    // Remove o usuário da lista de usuários
    users = users.filter(u => u.email !== session.email);

    DB.set('users', users);

    // Remove sessão
    DB.remove('session');

    let orders = DB.get('orders') || [];
    orders = orders.filter(o => o.user !== session.email);
    DB.set('orders', orders);

    alert("Conta excluída com sucesso!");

    // Enviar para a tela inicial
    location.href = 'index.html';
};

})();
