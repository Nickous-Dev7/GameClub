class Produto {
    constructor() {
        this.id = 1;
        this.arrayProdutos = [];
        this.editandoId = null;
        this.carregarDoLocalStorage(); 
    }

    adicionar() {
        let produto = this.lerDados();

        if (this.validarCampos(produto)) {
            if (this.editandoId !== null) {
                
                for (let i = 0; i < this.arrayProdutos.length; i++) {
                    if (this.arrayProdutos[i].id == this.editandoId) {
                        produto.id = this.editandoId;
                        this.arrayProdutos[i] = produto;
                        break;
                    }
                }
                this.editandoId = null;
                this.atualizarTextoBotao("Registrar");
            } else {
                
                this.arrayProdutos.push(produto);
                this.id++;
            }
            this.salvarNoLocalStorage(); 
            this.cancelar();
            this.listaTabela();
        }
    }

    deletar(id) {
        if (confirm("Tem certeza que deseja excluir este item?")) {
            for (let i = 0; i < this.arrayProdutos.length; i++) {
                if (this.arrayProdutos[i].id == id) {
                    this.arrayProdutos.splice(i, 1);
                    break;
                }
            }
            this.salvarNoLocalStorage(); 
            this.listaTabela();
        }
    }

    
    salvarNoLocalStorage() {
        localStorage.setItem("produtos", JSON.stringify(this.arrayProdutos));
        localStorage.setItem("ultimoId", this.id.toString());
    }

   
    carregarDoLocalStorage() {
        const produtosSalvos = localStorage.getItem("produtos");
        const ultimoId = localStorage.getItem("ultimoId");

        if (produtosSalvos) {
            this.arrayProdutos = JSON.parse(produtosSalvos);
        }
        if (ultimoId) {
            this.id = parseInt(ultimoId, 10);
        }
        this.listaTabela(); 
    }

   
    
    lerDados() {
        let produto = {};
        produto.id = this.editandoId !== null ? this.editandoId : this.id;
        produto.nomeProduto = document.getElementById("nomeProduto").value;
        produto.console = document.getElementById("console").value;
        produto.estado = document.getElementById("estado").value;
        produto.genero = document.getElementById("genero").value;
        produto.valor = document.getElementById("preco").value;
        return produto;
    }

    validarCampos(produto) {
        if (produto.nomeProduto.trim() === "") {
            alert("Por favor, preencha o nome do jogo.");
            return false;
        }
        if (produto.console.trim() === "") {
            alert("Por favor, preencha o console.");
            return false;
        }
        if (produto.estado.trim() === "") {
            alert("Por favor, preencha o estado.");
            return false;
        }
        if (produto.genero.trim() === "") {
            alert("Por favor, preencha o gênero.");
            return false;
        }
        if (produto.valor.trim() === "") {
            alert("Por favor, preencha o valor.");
            return false;
        }
        return true;
    }

    cancelar() {
        document.getElementById("nomeProduto").value = "";
        document.getElementById("console").value = "";
        document.getElementById("estado").value = "";
        document.getElementById("genero").value = "";
        document.getElementById("preco").value = "";
        this.editandoId = null;
        this.atualizarTextoBotao("Registrar");
    }

    listaTabela() {
        let tbody = document.getElementById("tbody");
        tbody.innerHTML = "";

        for (let i = 0; i < this.arrayProdutos.length; i++) {
            let tr = tbody.insertRow();
            let td_id = tr.insertCell();
            let td_nomeProduto = tr.insertCell();
            let td_console = tr.insertCell();
            let td_estado = tr.insertCell();
            let td_genero = tr.insertCell();
            let td_valor = tr.insertCell();
            let td_acoes = tr.insertCell();

            td_id.innerText = this.arrayProdutos[i].id;
            td_nomeProduto.innerText = this.arrayProdutos[i].nomeProduto;
            td_console.innerText = this.arrayProdutos[i].console;
            td_estado.innerText = this.arrayProdutos[i].estado;
            td_genero.innerText = this.arrayProdutos[i].genero;
            td_valor.innerText = this.arrayProdutos[i].valor;

            let imgEdit = document.createElement("img");
            imgEdit.src = "Images/edit.svg";
            imgEdit.style.width = "24px";
            imgEdit.style.height = "24px";
            imgEdit.style.cursor = "pointer";
            imgEdit.style.marginRight = "8px";
            imgEdit.setAttribute("onclick", "produto.editar(" + this.arrayProdutos[i].id + ")");

            let imgDelete = document.createElement("img");
            imgDelete.src = "Images/delete.svg";
            imgDelete.style.width = "24px";
            imgDelete.style.height = "24px";
            imgDelete.style.cursor = "pointer";
            imgDelete.setAttribute("onclick", "produto.deletar(" + this.arrayProdutos[i].id + ")");

            td_acoes.appendChild(imgEdit);
            td_acoes.appendChild(imgDelete);
        }
    }

    editar(id) {
        let produto = this.arrayProdutos.find(p => p.id == id);
        if (produto) {
            document.getElementById("nomeProduto").value = produto.nomeProduto;
            document.getElementById("console").value = produto.console;
            document.getElementById("estado").value = produto.estado;
            document.getElementById("genero").value = produto.genero;
            document.getElementById("preco").value = produto.valor;

            this.editandoId = id;
            this.atualizarTextoBotao("Atualizar");
        }
    }

    atualizarTextoBotao(texto) {
        let botao = document.querySelector('button[onclick="produto.adicionar()"]');
        if (botao) {
            botao.innerText = texto;
        }
    }
}

var produto = new Produto();