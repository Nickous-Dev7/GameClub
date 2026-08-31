
window.utils = (function(){
  function validateCPF(cpf){
    if(!cpf) return false;
    cpf = cpf.replace(/\D/g,'');
    if(cpf.length !== 11) return false;
    if(/^(\d)\1+$/.test(cpf)) return false;
    let sum=0, rest;
    for(let i=1;i<=9;i++) sum += parseInt(cpf.substring(i-1,i))*(11-i);
    rest = (sum*10) % 11; if(rest===10) rest=0;
    if(rest !== parseInt(cpf.substring(9,10))) return false;
    sum = 0;
    for(let i=1;i<=10;i++) sum += parseInt(cpf.substring(i-1,i))*(12-i);
    rest = (sum*10) % 11; if(rest===10) rest=0;
    if(rest !== parseInt(cpf.substring(10,11))) return false;
    return true;
  }
  function formatCPF(v){
    v = v.replace(/\D/g,'');
    v = v.slice(0,11);
    v = v.replace(/(\d{3})(\d)/,'$1.$2');
    v = v.replace(/(\d{3})(\d)/,'$1.$2');
    v = v.replace(/(\d{3})(\d{1,2})$/,'$1-$2');
    return v;
  }
  function formatPhone(v){
    v = v.replace(/\D/g,'');
    v = v.slice(0,11);
    if(v.length<=2) return '('+v;
    if(v.length<=6) return '('+v.slice(0,2)+') '+v.slice(2);
    if(v.length<=10) return '('+v.slice(0,2)+') '+v.slice(2,6)+'-'+v.slice(6);
    return '('+v.slice(0,2)+') '+v.slice(2,7)+'-'+v.slice(7,11);
  }
  function formatCEP(v){
    v = v.replace(/\D/g,'');
    v = v.slice(0,8);
    if(v.length<=5) return v;
    return v.replace(/(\d{5})(\d)/,'$1-$2');
  }
  async function lookupCEP(cep){
    try{
      cep = cep.replace(/\D/g,'');
      if(cep.length !== 8) return null;
      const res = await fetch('https://viacep.com.br/ws/' + cep + '/json/');
      const data = await res.json();
      if(data.erro) return null;
      return data;
    }catch(e){ return null; }
  }
  function validateEmail(email){
    if(!email) return false;
    return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/.test(email.toLowerCase());
  }
  return { validateCPF, formatCPF, formatPhone, formatCEP, lookupCEP, validateEmail };
})();
