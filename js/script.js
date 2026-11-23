let pedidos = [];

let filtroAtual = "todos";

const form = document.getElementById("formPedido");

document.getElementById("arquivoBackup").addEventListener(
    "change",
    restaurarBackup
);

// Controle do período personalizado
const filtroPeriodo = document.getElementById("filtroPeriodo");
const datasPersonalizadas = document.getElementById("datasPersonalizadas");

filtroPeriodo.addEventListener("change", function(){

    if(filtroPeriodo.value === "personalizado"){
        datasPersonalizadas.style.display = "block";
    } else {
        datasPersonalizadas.style.display = "none";
    }

});

form.addEventListener("submit", async function(event){

    event.preventDefault();

    const btnSalvarPedido = document.getElementById("btnSalvarPedido");


    // Validar cálculo por metro quadrado
if(tipoCalculo.value === "metro"){

    const valorLargura = Number(largura.value);
    const valorAltura = Number(altura.value);
    const valorMetro = Number(precoMetro.value);

    if(
        !Number.isFinite(valorLargura) || valorLargura <= 0 ||
        !Number.isFinite(valorAltura) || valorAltura <= 0 ||
        !Number.isFinite(valorMetro) || valorMetro <= 0
    ){

        mostrarNotificacao(
            "Preencha corretamente as medidas e o preço por m²!",
            "erro"
        );

        btnSalvarPedido.disabled = false;
        btnSalvarPedido.textContent = "Cadastrar pedido";

        return;
    }
}

// Desativar botão para qualquer tipo de cálculo
btnSalvarPedido.disabled = true;
btnSalvarPedido.textContent = "Salvando pedido...";

        const cliente = document.getElementById("cliente").value;
        const produto = document.getElementById("produto").value;
        const quantidade = Number (document.getElementById("quantidade").value);
        const preco = Number (document.getElementById("preco").value);
        const pagamento = document.getElementById("pagamento").value;

        // Validar dados principais do pedido
        if(
            !cliente.trim() ||
            !produto.trim() ||
            !Number.isFinite(quantidade) ||
            quantidade <= 0 ||
            !Number.isFinite(preco) ||
            preco <= 0
        ){

            mostrarNotificacao(
                "Preencha corretamente todos os dados do pedido!",
                "erro"
            );

            btnSalvarPedido.disabled = false;
            btnSalvarPedido.textContent = "Cadastrar pedido";

            return;
        }

        const pedido = {
        data: obterDataLocal(),
        cliente,
        produto, 
        quantidade, 
        preco, 
        pagamento,
        total: quantidade * preco,

        tipoCalculo: tipoCalculo.value,

        largura: tipoCalculo.value === "metro"
        ? Number(largura.value)
        : null,

        altura: tipoCalculo.value === "metro"
        ? Number(altura.value)
        : null,

        precoMetro: tipoCalculo.value === "metro"
        ? Number(precoMetro.value)
        : null,

        area: tipoCalculo.value === "metro"
        ? Number(largura.value) * Number(altura.value)
        : null
        };

    let pedidoSalvo = null;

    try {

        pedidoSalvo = await salvarPedido(pedido);

    } catch(erro) {

        mostrarNotificacao(
            "Falha inesperada ao cadastrar pedido: " + erro.message,
            "erro"
        );

        btnSalvarPedido.disabled = false;
        btnSalvarPedido.textContent = "Cadastrar pedido";

        return;
    }

        if(!pedidoSalvo){

            btnSalvarPedido.disabled = false;
            btnSalvarPedido.textContent = "Cadastrar pedido";

            return;
        }

pedidos.push(pedidoSalvo);

form.reset();
tipoCalculo.dispatchEvent(new Event("change"));

aplicarFiltros();

mostrarNotificacao("Pedido cadastrado com sucesso!", "sucesso");

btnSalvarPedido.disabled = false;
btnSalvarPedido.textContent = "Cadastrar pedido";


});

//Tipo de cálculo
const tipoCalculo = document.getElementById("tipoCalculo");

//Área do metro quadrado
const camposMetro = document.getElementById("camposMetro");



const largura = document.getElementById("largura");
const altura = document.getElementById("altura");
const precoMetro = document.getElementById ("precoMetro");
const campoPreco = document.getElementById ("preco");

// Mostrar ou esconder campo m²
tipoCalculo.addEventListener("change", function(){
    if (tipoCalculo.value === "metro"){

        camposMetro.style.display = "block";

        largura.required = true;
        altura.required = true;
        precoMetro.required = true;
        campoPreco.readOnly = true;
        document.getElementById("labelPreco").textContent = "Valor por peça (R$)";
    } else {
        camposMetro.style.display = "none";

        largura.value = "";
        altura.value = "";
        precoMetro.value = "";

        largura.required = false;
        altura.required = false;
        precoMetro.required = false;
        campoPreco.readOnly = false;
        document.getElementById("labelPreco").textContent = "Valor unitário (R$)";
        campoPreco.value = "";
    }
});

function calcularMetro(){

    const valorLargura = Number(largura.value);
    const valorAltura = Number(altura.value);
    const valorMetro = Number(precoMetro.value);

    if(
        Number.isFinite(valorLargura) && valorLargura > 0 &&
        Number.isFinite(valorAltura) && valorAltura > 0 &&
        Number.isFinite(valorMetro) && valorMetro > 0
    ){

        const area = valorLargura * valorAltura;
        const valorUnitario = area * valorMetro;

        campoPreco.value = valorUnitario.toFixed(2);

    } else {

        campoPreco.value = "";

    }
}

largura.addEventListener("input", calcularMetro);
altura.addEventListener("input", calcularMetro);
precoMetro.addEventListener("input", calcularMetro);

// Obter data atual no formato brasileiro
function obterDataLocal(){

    const hoje = new Date();

    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

// Buscar pedidos do Supabase
async function carregarPedidos(){

    pedidos = [];

    let user = null;
let erroUsuario = null;

try {

    const resultado = await supabaseClient.auth.getUser();

    user = resultado.data.user;
    erroUsuario = resultado.error;

} catch(erro){

    pedidos = [];

    aplicarFiltros();

    mostrarNotificacao(
        "Falha ao verificar usuário: " + erro.message,
        "erro"
    );

    return false;
}

if(erroUsuario || !user){

    pedidos = [];

    aplicarFiltros();

    mostrarNotificacao(
        "Não foi possível identificar o usuário conectado.",
        "erro"
    );

    return false;
}

    let data = null;
    let error = null;

    try {

        const resultado = await supabaseClient
            .from("pedidos")
            .select("*")
            .eq("user_id", user.id)
            .order("id", { ascending: false });

        data = resultado.data;
        error = resultado.error;

        

    } catch(erro) {

        pedidos = [];

        aplicarFiltros();

        mostrarNotificacao(
            "Falha inesperada ao carregar pedidos: " + erro.message,
            "erro"
        );

        return false;
    }

   if(error){
    pedidos = [];

    aplicarFiltros();

    mostrarNotificacao(
        "Erro ao carregar pedidos: " + error.message,
        "erro"
    );

    return false;
    }

    pedidos = (data || []).map(function(pedido){

    return {
        ...pedido,
        tipoCalculo: pedido.tipo_calculo,
        precoMetro: pedido.preco_metro
    };

    });

        aplicarFiltros();

        return true;

    }

// Cadastrar um pedido no Supabase
async function salvarPedido(pedido){

    if(salvarPedido.emAndamento){
        return null;
    }

    salvarPedido.emAndamento = true;

    try {

        if(!pedido || typeof pedido !== "object"){
            mostrarNotificacao(
                "Dados do pedido inválidos.",
                "erro"
            );
            return null;
        }

    let user = null;
    let erroUsuario = null;

    try {
        const resultado = await supabaseClient.auth.getUser();

        user = resultado.data.user;
        erroUsuario = resultado.error;

    } catch(error) {
        mostrarNotificacao(
            "Erro ao verificar usuário: " + error.message,
            "erro"
        );

        return null;
    }

    if(erroUsuario || !user){
    mostrarNotificacao(
        "Usuário não identificado!",
        "erro"
    );
    return null;
    }

    let data = null;
    let error = null;

    try {

        const resultado = await supabaseClient
            .from("pedidos")
            .insert({
                user_id: user.id,
                backup_id: crypto.randomUUID(),
                cliente: pedido.cliente,
                produto: pedido.produto,
                quantidade: pedido.quantidade,
                preco: pedido.preco,
                total: pedido.total,
                pagamento: pedido.pagamento,
                tipo_calculo: pedido.tipoCalculo || "unitario",
                largura: pedido.largura,
                altura: pedido.altura,
                area: pedido.area,
                preco_metro: pedido.precoMetro,
                data: pedido.data
            })
            .select()
            .single();

        data = resultado.data;
        error = resultado.error;

    } catch(erro) {

        mostrarNotificacao(
            "Falha inesperada ao salvar pedido: " + erro.message,
            "erro"
        );

        return null;
    }

    if(error){
    mostrarNotificacao(
        "Erro ao salvar pedido: " + error.message,
        "erro"
    );
    return null;
    }

       return {
        ...data,
        tipoCalculo: data.tipo_calculo,
        precoMetro: data.preco_metro
    };

    } finally {
        salvarPedido.emAndamento = false;
    }

}

// Proteger textos inseridos no HTML
function escaparHTML(texto){

    return String(texto ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Mostrar pedidos
function mostrarPedidos(listaExibida = pedidos){
    
    const lista = document.getElementById("listaPedidos");
    lista.innerHTML = "";
    let htmlPedidos = "";


        let total = 0;
        let pendente = 0;
        let recebido = 0;

        let quantidadePagos = 0;
        let quantidadePendentes = 0;

        // Calcular os valores de todos os pedidos
        pedidos.forEach(function(pedido){

            const valorPedido = Number(pedido.total);

            total += valorPedido;

            if(pedido.pagamento === "Pendente"){
                pendente += valorPedido;
                quantidadePendentes++;
                } else if(pedido.pagamento === "Pago"){
                recebido += valorPedido;
                quantidadePagos++;
            }

        });


    // Exibir somente os pedidos filtrados
    listaExibida.forEach(function(pedido){

        const clienteSeguro = escaparHTML(pedido.cliente);
        const produtoSeguro = escaparHTML(pedido.produto);
        const pagamentoSeguro = escaparHTML(pedido.pagamento);

        const quantidadeSegura = escaparHTML(pedido.quantidade);
        const larguraSegura = escaparHTML(pedido.largura);
        const alturaSegura = escaparHTML(pedido.altura);
        const areaSegura = escaparHTML(
            Number(pedido.area).toFixed(2)
        );

        const precoSeguro = escaparHTML(formatarMoeda(pedido.preco));

        const totalSeguro = escaparHTML(formatarMoeda(pedido.total));

        const precoMetroSeguro = escaparHTML(
            formatarMoeda(pedido.precoMetro)
        );

    htmlPedidos += `
    <div class="pedido">
        <h3 class="pedido-cliente">${clienteSeguro}</h3>

        <p>Produto: ${produtoSeguro}</p>
        <p>Quantidade: ${quantidadeSegura}</p>

        ${pedido.tipoCalculo === "metro" ? `
            <br><hr><br>
            <h4>Detalhes do cálculo</h4>

            <p>Largura: ${larguraSegura} m</p>
            <p>Altura: ${alturaSegura} m</p>
            <p>Área: ${areaSegura} m²</p>
            <p>Preço por m²: ${precoMetroSeguro}</p>
            <br><hr><br>
        ` : ""}

        <p>Valor unitário: ${precoSeguro}</p>
        <p class="pedido-total">
            Total: ${totalSeguro}
        </p>
        <p>
            Pagamento:
            <span class="${pedido.pagamento === "Pago" ? "status-pago" : "status-pendente"}">
                ${pagamentoSeguro}
            </span>
        </p>

        <button class="btn-editar" onclick="editarPedido(${Number(pedido.id)}, this)">
            Editar
        </button>

        <button class="btn-pagamento" onclick="alterarPagamento(${Number(pedido.id)}, this)">
            ${pedido.pagamento === "Pendente"
                ? "Marcar como pago"
                : "Marcar como pendente"}
        </button>

        <button class="btn-excluir" onclick="excluirPedido(${Number(pedido.id)}, this)">
            Excluir
        </button>
    </div>
        `;
        });

        lista.innerHTML = htmlPedidos;

    document.getElementById("totalPedidos").textContent = pedidos.length;
    
    document.getElementById("valorTotal").textContent = formatarMoeda(total);

    document.getElementById("valorPendente").textContent = formatarMoeda(pendente);

    // Atualizar relatório financeiro
    document.getElementById("valorRecebido").textContent = formatarMoeda(recebido);

    document.getElementById("pedidosPagos").textContent = quantidadePagos;

    document.getElementById("pedidosPendentes").textContent = quantidadePendentes;
}

async function excluirPedido(id, botao){

        if(botao.disabled){
        return;
    }

    const pedido = pedidos.find(function(item){
    return item.id === id;
    });

    if(!pedido){
        mostrarNotificacao("Pedido não encontrado!", "erro");
        return;
    }

    const confirmar = confirm("Deseja realmente excluir este pedido?");

    if(!confirmar){
        return;
    }
        botao.disabled = true;
        botao.textContent = "Excluindo...";

    let user = null;
    let erroUsuario = null;

    try {

        const resultado = await supabaseClient.auth.getUser();

        user = resultado.data.user;
        erroUsuario = resultado.error;

    } catch(error) {

    mostrarNotificacao(
        "Erro ao verificar usuário: " + error.message,
        "erro"
    );

    botao.disabled = false;
    botao.textContent = "Excluir";

    return;
    }

    if(erroUsuario || !user){
        mostrarNotificacao("Usuário não identificado!", "erro");
        botao.disabled = false;
        botao.textContent = "Excluir";
        return;
    }

    let error = null;

    try {

        const resultado = await supabaseClient
            .from("pedidos")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id)
            .select()
            .single();

            error = resultado.error;

            if(!error && !resultado.data){
                error = new Error("O pedido não foi encontrado para exclusão.");
            }

    } catch(erro) {

        mostrarNotificacao(
            "Falha inesperada ao excluir pedido: " + erro.message,
            "erro"
        );

        botao.disabled = false;
        botao.textContent = "Excluir";

        return;
    }

    if(error){
    mostrarNotificacao(
        "Erro ao excluir pedido: " + error.message,
        "erro"
    );

    botao.disabled = false;
    botao.textContent = "Excluir";

    return;
    }

    pedidos = pedidos.filter(function(pedido){
    return pedido.id !== id;
    });

    // Atualizar a tela
    aplicarFiltros();

    mostrarNotificacao(
        "Pedido excluído com sucesso!",
        "sucesso"
    );

}

// Editar pedido
async function editarPedido(id, botao){

        if(botao.disabled){
        return;
    }
    
    const pedido = pedidos.find(function(item){
        return item.id === id;
    });

    if (!pedido){
        mostrarNotificacao("Pedido não encontrado!", "erro");
        return;
    }

    const pedidoAtualizado = { ...pedido };

    //Solicitar novas informações
    const cliente = prompt("Nome do cliente", pedido.cliente);
        if(cliente === null) 
            return;
    
    const produto = prompt("Descrição do produto: ", pedido.produto);
        if(produto === null)
            return;
    const quantidade = prompt("Quantidade: ", pedido.quantidade);
        if(quantidade === null)
            return;
    const novaQuantidade = Number(quantidade);
    //Validar informações básicas
        if(
            cliente.trim() === "" ||
            produto.trim() === "" ||
            !Number.isInteger(novaQuantidade) ||
            novaQuantidade < 1
        ){
            mostrarNotificacao("Verifique os dados!", "erro");
            return;
        } 
    // Se o pedido for calculado por metro quadrado
    if(pedido.tipoCalculo === "metro"){

        const largura = prompt("Largura em metros:", pedido.largura);
        if(largura === null) return;

        const altura = prompt("Altura em metros:", pedido.altura);
        if(altura === null) return;

        const precoMetro = prompt("Preço por m²:", pedido.precoMetro);
        if(precoMetro === null) return;

        const novaLargura = Number(largura);
        const novaAltura = Number(altura);
        const novoPrecoMetro = Number(precoMetro);

        if(
            !Number.isFinite(novaLargura) || novaLargura <= 0 ||
            !Number.isFinite(novaAltura) || novaAltura <= 0 ||
            !Number.isFinite(novoPrecoMetro) || novoPrecoMetro <= 0
        ){
            mostrarNotificacao("Verifique as medidas e o preço por m²!", "erro");
            return;
        }

        // Recalcular área e valores
            pedidoAtualizado.largura = novaLargura;
            pedidoAtualizado.altura = novaAltura;
            pedidoAtualizado.precoMetro = novoPrecoMetro;
            pedidoAtualizado.area = novaLargura * novaAltura;
            pedidoAtualizado.preco = pedidoAtualizado.area * novoPrecoMetro;

    } else {

    // Se o pedido for por valor unitário
        const preco = prompt("Valor unitário:", pedido.preco);
        if(preco === null) return;

        const novoPreco = Number(preco);

        if(!Number.isFinite(novoPreco) || novoPreco <= 0){
            mostrarNotificacao("Verifique o valor informado!", "erro");
            return;
        }

        pedidoAtualizado.preco = novoPreco;
    }

    // Atualizar informações na cópia
    pedidoAtualizado.cliente = cliente.trim();
    pedidoAtualizado.produto = produto.trim();
    pedidoAtualizado.quantidade = novaQuantidade;

    // Recalcular total
    pedidoAtualizado.total = novaQuantidade * pedidoAtualizado.preco;

    botao.disabled = true;
    botao.textContent = "Salvando alterações...";

    // Salvar alterações no Supabase
    // Verificar usuário conectado
const { data: { user }, error: erroUsuario } =
    await supabaseClient.auth.getUser();

if(erroUsuario || !user){

    mostrarNotificacao(
        "Usuário não identificado!",
        "erro"
    );

    botao.disabled = false;
    botao.textContent = "Editar";

    return;
}

let error = null;

try {

    const resultado = await supabaseClient
    .from("pedidos")
    .update({
        cliente: pedidoAtualizado.cliente,
        produto: pedidoAtualizado.produto,
        quantidade: pedidoAtualizado.quantidade,
        preco: pedidoAtualizado.preco,
        total: pedidoAtualizado.total,
        largura: pedidoAtualizado.largura,
        altura: pedidoAtualizado.altura,
        area: pedidoAtualizado.area,
        preco_metro: pedidoAtualizado.precoMetro
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

error = resultado.error;

} catch(erro) {

    mostrarNotificacao(
        "Falha inesperada ao atualizar pedido: " + erro.message,
        "erro"
    );

    botao.disabled = false;
    botao.textContent = "Editar";

    return;
}

if(error){

    mostrarNotificacao(
        "Erro ao atualizar pedido: " + error.message,
        "erro"
    );

    botao.disabled = false;
    botao.textContent = "Editar";

    return;
}


// Atualizar pedido na memória
        const indice = pedidos.findIndex(function(item){
            return item.id === id;
        });

        if(indice !== -1){
            pedidos[indice] = pedidoAtualizado;
        }

        // Restaurar botão
        botao.disabled = false;
        botao.textContent = "Editar";

        // Atualizar a tela
        aplicarFiltros();

        console.log("Edição finalizada!");
        console.log("Pedido atualizado:", pedidoAtualizado);

        // Mostrar mensagem de sucesso
        mostrarNotificacao(
            "Pedido atualizado com sucesso!",
            "sucesso"
        ); }
        

//Alterar pagamento
async function alterarPagamento(id, botao){

        if(botao.disabled){
        return;
    }

    const pedido = pedidos.find(function(item){
        return item.id === id;
    });

    if(!pedido){
        mostrarNotificacao("Pedido não encontrado!", "erro");
        return;
    }

    const pedidoAtualizado = { ...pedido };

        botao.disabled = true;
        botao.textContent = "Atualizando...";

    const novoPagamento = pedido.pagamento === "Pendente"
        ? "Pago"
        : "Pendente";

        pedidoAtualizado.pagamento = novoPagamento;
        

// Verificar usuário conectado
let user = null;
let erroUsuario = null;

try {

    const resultado = await supabaseClient.auth.getUser();

    user = resultado.data.user;
    erroUsuario = resultado.error;

} catch(erro){

    mostrarNotificacao(
        "Falha ao verificar usuário: " + erro.message,
        "erro"
    );

    botao.disabled = false;
    botao.textContent = pedido.pagamento === "Pendente"
    ? "Marcar como pago"
    : "Marcar como pendente";

    return;
}

if(erroUsuario || !user){

    mostrarNotificacao(
        "Usuário não identificado!",
        "erro"
    );

    botao.disabled = false;
    botao.textContent = pedido.pagamento === "Pendente"
    ? "Marcar como pago"
    : "Marcar como pendente";

    return;
}

let error = null;

try {

    const resultado = await supabaseClient
        .from("pedidos")
        .update({
            pagamento: pedidoAtualizado.pagamento
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

    error = resultado.error;

        if(!error && !resultado.data){
            error = new Error("O pedido atualizado não foi encontrado.");
        }

} catch(erro) {

    mostrarNotificacao(
        "Falha inesperada ao atualizar pagamento: " + erro.message,
        "erro"
    );

    botao.disabled = false;
    botao.textContent = pedido.pagamento === "Pendente"
        ? "Marcar como pago"
        : "Marcar como pendente";

    return;
}

if(error){

    mostrarNotificacao(
        "Erro ao atualizar pagamento: " + error.message,
        "erro"
    );

    botao.disabled = false;
    botao.textContent = pedido.pagamento === "Pendente"
        ? "Marcar como pago"
        : "Marcar como pendente";

    return;
}

    const indice = pedidos.findIndex(function(item){
    return item.id === id;
    });

    if(indice !== -1){
    pedidos[indice] = pedidoAtualizado;
}

// Restaurar o botão
    botao.disabled = false;
    botao.textContent = novoPagamento === "Pago"
        ? "Marcar como pendente"
        : "Marcar como pago";

    // Atualizar a tela
    aplicarFiltros();

    mostrarNotificacao(
    novoPagamento === "Pago"
        ? "Pagamento marcado como pago!"
        : "Pagamento marcado como pendente!",
    "sucesso"
);

}


    // Filtrar Pedido
    function filtrarPedidos(status){

        filtroAtual = status;

        aplicarFiltros();

    }

function aplicarFiltros(){

    const pesquisa = document
        .getElementById("pesquisaPedidos")
        .value.toLowerCase();
    
    const periodo = document.getElementById("filtroPeriodo").value;    

    let pedidosFiltrados = pedidos;

    if(filtroAtual !== "todos"){
        pedidosFiltrados = pedidosFiltrados.filter(function(pedido){
            return pedido.pagamento === filtroAtual;
        });
    }



    // Filtrar por período
    if(periodo === "personalizado"){

    const dataInicial = document.getElementById("dataInicial").value;
    const dataFinal = document.getElementById("dataFinal").value;

    if(!dataInicial || !dataFinal){

        pedidosFiltrados = [];

    } else {

        pedidosFiltrados = pedidosFiltrados.filter(function(pedido){

            if(!pedido.data){
                return false;
            }

            return pedido.data >= dataInicial &&
                   pedido.data <= dataFinal;

        });

    }

    } else if(periodo !== "todos"){

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dataInicial = new Date(hoje);

    if(periodo === "7dias"){
        dataInicial.setDate(hoje.getDate() - 6);
    }

    if(periodo === "30dias"){
        dataInicial.setDate(hoje.getDate() - 29);
    }

    pedidosFiltrados = pedidosFiltrados.filter(function(pedido){

        if(!pedido.data){
            return false;
        }

        const partes = pedido.data.split("-");

        const dataPedido = new Date(
            Number(partes[0]),
            Number(partes[1]) - 1,
            Number(partes[2])
        );

        return dataPedido >= dataInicial && dataPedido <= hoje;

    });

        }



            pedidosFiltrados = pedidosFiltrados.filter(function(pedido){

            const cliente = String(pedido.cliente ?? "").toLowerCase();
            const produto = String(pedido.produto ?? "").toLowerCase();

            return cliente.includes(pesquisa) ||
                produto.includes(pesquisa);

            });

            mostrarPedidos(pedidosFiltrados);

}

        document.getElementById("pesquisaPedidos").addEventListener("input", aplicarFiltros);

        document.getElementById("filtroPeriodo").addEventListener("change", aplicarFiltros);

        document.getElementById("dataInicial").addEventListener("change", aplicarFiltros);

        document.getElementById("dataFinal").addEventListener("change", aplicarFiltros);

// Formatar Moeda
function formatarMoeda(valor){

    // Verificar se o valor está vazio
    if(valor === null || valor === undefined || valor === ""){
        return "—";
    }

    const numero = Number(valor);

    // Verificar se é um número válido
    if(!Number.isFinite(numero)){
        return "—";
    }

    return numero.toLocaleString("pt-BR",{
        style: "currency",
        currency: "BRL"
    });
}

// Iniciar Sistema
mostrarPedidos();


function exportarRelatorio(){

    // Verificar se existem pedidos
    if(pedidos.length === 0){
        mostrarNotificacao("Não existem pedidos para exportar!", "erro");
        return;
    }

    // Criar cabeçalho da planilha
    let csv = "Data;Cliente;Produto;Quantidade;Valor Unitário;Total;Pagamento\n";

    // Adicionar os pedidos
    pedidos.forEach(function(pedido){

        const linha = [
            pedido.data || "Sem data",
            pedido.cliente,
            pedido.produto,
            pedido.quantidade,
            pedido.preco.toFixed(2).replace(".", ","),
            pedido.total.toFixed(2).replace(".", ","),
            pedido.pagamento
        ];

        csv += linha.join(";") + "\n";

    });

    // Preparar arquivo para download
    const arquivo = new Blob(
        ["\uFEFF" + csv],
        { type: "text/csv;charset=utf-8;" }
    );

    const link = document.createElement("a");

    const url = URL.createObjectURL(arquivo);

    link.href = url;
    link.download = "relatorio-meupedido.csv";

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    mostrarNotificacao("Relatório exportado com sucesso!", "sucesso");

}

//Fazer Backup
async function fazerBackup(botao){

    botao.disabled = true;
    botao.textContent = "Preparando backup...";

    function restaurarBotaoBackup(){
    botao.disabled = false;
    botao.textContent = "Baixar backup";
    }

    // Buscar pedidos diretamente do Supabase
    let user = null;
    let erroUsuario = null;

    try {

        const resultado = await supabaseClient.auth.getUser();

        user = resultado.data.user;
        erroUsuario = resultado.error;

    } catch(erro) {

        mostrarNotificacao(
            "Falha ao verificar usuário: " + erro.message,
            "erro"
        );

        restaurarBotaoBackup();

        return;
    }

    if(erroUsuario || !user){

    mostrarNotificacao("Usuário não identificado!", "erro");

    restaurarBotaoBackup();

    return;
    }

    let data = null;
    let error = null;

    try {

        const resultado = await supabaseClient
            .from("pedidos")
            .select("*")
            .eq("user_id", user.id);

        data = resultado.data;
        error = resultado.error;

    } catch(erro) {

        mostrarNotificacao(
            "Falha inesperada ao buscar pedidos: " + erro.message,
            "erro"
        );

        restaurarBotaoBackup();

        return;
    }

    if(error){
    mostrarNotificacao(
    "Erro ao buscar pedidos: " + error.message,
    "erro"
    );

    restaurarBotaoBackup();

    return;
    }

    // Verificar se existem pedidos
    if(!data || data.length === 0){
    mostrarNotificacao(
    "Não existem pedidos para fazer backup!",
    "erro"
    );

    restaurarBotaoBackup();

    return;
    }

    try {

    // Transformar os pedidos em JSON
    const dados = JSON.stringify(data, null, 2);

    // Criar arquivo
    const arquivo = new Blob(
        [dados],
        { type: "application/json" }
    );

    // Criar link para download
    const url = URL.createObjectURL(arquivo);

    const link = document.createElement("a");

    link.href = url;
    link.download = "backup-meupedido.json";

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    mostrarNotificacao(
        "Backup realizado com sucesso!",
        "sucesso"
    );

    } catch(erro) {

        mostrarNotificacao(
            "Erro ao gerar o arquivo de backup: " + erro.message,
            "erro"
        );

    } finally {

        restaurarBotaoBackup();

    }

}

// Gerar identificador estável para pedidos de backups antigos
async function gerarBackupIdLegado(pedido, indice, userId){

    const identificacao = JSON.stringify({

        usuario: userId,
        indice: indice,
        idAntigo: pedido.id || null,
        data: pedido.data || "",
        cliente: pedido.cliente.trim(),
        produto: pedido.produto.trim(),
        quantidade: Number(pedido.quantidade),
        preco: Number(pedido.preco),
        total: Number(pedido.total),
        pagamento: pedido.pagamento

    });

    // Gerar hash dos dados
    const resultado = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(identificacao)
    );

    // Transformar o resultado em bytes
    const bytes = Array.from(
        new Uint8Array(resultado).slice(0, 16)
    );

    // Formatar como UUID
    bytes[6] = (bytes[6] & 0x0f) | 0x50;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hexadecimal = bytes.map(function(byte){
        return byte.toString(16).padStart(2, "0");
    }).join("");

    return [
        hexadecimal.slice(0, 8),
        hexadecimal.slice(8, 12),
        hexadecimal.slice(12, 16),
        hexadecimal.slice(16, 20),
        hexadecimal.slice(20, 32)
    ].join("-");
}

//Restaurar Backup
async function restaurarBackup(event){

    const textoRestaurarBackup = document.getElementById("textoRestaurarBackup");

    const arquivo = event.target.files[0];

    if(!arquivo){
        return;
    }

    // Limitar backup a 5 MB
    if(arquivo.size > 5 * 1024 * 1024){

    mostrarNotificacao(
        "O arquivo de backup não pode ultrapassar 5 MB.",
        "erro"
    );

    event.target.value = "";
    return;
    }

    // Verificar extensão do arquivo
    if(!arquivo.name.toLowerCase().endsWith(".json")){

    mostrarNotificacao(
        "Selecione um arquivo de backup no formato JSON.",
        "erro"
    );

    event.target.value = "";
    return;
    }

    // Confirmar a restauração
    const confirmar = confirm(
        "Os pedidos do backup serão adicionados aos pedidos atuais. Deseja continuar?"
    );

    if(!confirmar){
        event.target.value = "";
        return;
    }

    textoRestaurarBackup.textContent = "Restaurando backup...";

    const leitor = new FileReader();

    leitor.onload = async function(){

        try {

            const dados = JSON.parse(leitor.result);

            // Verificar se o arquivo contém uma lista
            if(!Array.isArray(dados) || dados.length === 0){
                throw new Error("Arquivo inválido ou vazio.");
            }

            // Validar os pedidos
            // Validar os pedidos
    const valido = dados.every(function(pedido){

    const quantidade = Number(pedido?.quantidade);
    const preco = Number(pedido?.preco);
    const total = Number(pedido?.total);

    const tipoCalculo = pedido?.tipo_calculo ?? pedido?.tipoCalculo;

    // Verificar o tipo de cálculo
        if(
            tipoCalculo &&
            !["metro", "unidade", "unitario"].includes(tipoCalculo)
        ){
            return false;
        }

    // Validar informações básicas
    if(
        !pedido ||
        typeof pedido.cliente !== "string" ||
        pedido.cliente.trim() === "" ||
        typeof pedido.produto !== "string" ||
        pedido.produto.trim() === "" ||
        !Number.isFinite(quantidade) ||
        quantidade <= 0 ||
        !Number.isFinite(preco) ||
        preco < 0 ||
        !Number.isFinite(total) ||
        total < 0 ||
        !["Pago", "Pendente"].includes(pedido.pagamento)
    ){
        return false;
    }

    // Validar medidas quando o cálculo for por m²
    if(tipoCalculo === "metro"){

        const largura = Number(pedido.largura);
        const altura = Number(pedido.altura);
        const precoMetro = Number(
            pedido.preco_metro ?? pedido.precoMetro
        );

        if(
            !Number.isFinite(largura) || largura <= 0 ||
            !Number.isFinite(altura) || altura <= 0 ||
            !Number.isFinite(precoMetro) || precoMetro <= 0
        ){
            return false;
        }
    }

    return true;

    });

            if(!valido){
                throw new Error("Dados dos pedidos inválidos.");
            }

            // Identificar o usuário conectado
            let user = null;
            let erroUsuario = null;

            try {

                const resultado = await supabaseClient.auth.getUser();

                user = resultado.data.user;
                erroUsuario = resultado.error;

            } catch(erro) {

                mostrarNotificacao(
                    "Falha ao verificar usuário: " + erro.message,
                    "erro"
                );

                return;
            }

            if(erroUsuario || !user){
                mostrarNotificacao(
                    "Usuário não identificado!",
                    "erro"
                );
                return;
            }

            
            // Preparar pedidos para o Supabase
    const pedidosParaRestaurar = await Promise.all(
    dados.map(async function(pedido, indice){

    const tipoCalculo = pedido.tipo_calculo ?? pedido.tipoCalculo;

    return {
        user_id: user.id,
        backup_id: pedido.backup_id ||
    await gerarBackupIdLegado(pedido, indice, user.id),

        cliente: pedido.cliente.trim(),
        produto: pedido.produto.trim(),

        quantidade: Number(pedido.quantidade),
        preco: Number(pedido.preco),
        total: Number(pedido.total),

        pagamento: pedido.pagamento,

        tipo_calculo: tipoCalculo === "metro"
        ? "metro"
        : "unitario",

        largura: tipoCalculo === "metro"
            ? Number(pedido.largura)
            : null,

        altura: tipoCalculo === "metro"
            ? Number(pedido.altura)
            : null,

        area: tipoCalculo === "metro"
            ? Number(pedido.largura) * Number(pedido.altura)
            : null,

        preco_metro: tipoCalculo === "metro"
            ? Number(pedido.preco_metro ?? pedido.precoMetro)
            : null,

        data: pedido.data || obterDataLocal()
     };

    })
    );

            // Enviar pedidos ao Supabase
                let error = null;

                try {

                    const resultado = await supabaseClient
                        .from("pedidos")
                        .upsert(pedidosParaRestaurar, {
                            onConflict: "user_id,backup_id",
                            ignoreDuplicates: true
                        });

                    error = resultado.error;

                } catch(erro) {

                    mostrarNotificacao(
                        "Falha inesperada ao restaurar backup: " + erro.message,
                        "erro"
                    );

                    return;
                }

            if(error){
                mostrarNotificacao(
                "Erro ao restaurar backup: " + error.message,
                "erro"
            );
                return;
            }

            // Atualizar a tela
            const carregou = await carregarPedidos();

                if(!carregou){

                    mostrarNotificacao(
                        "Backup restaurado, mas não foi possível atualizar a lista. Recarregue a página.",
                        "erro"
                    );

                    return;
                }

                mostrarNotificacao(
                    "Backup restaurado com sucesso!",
                    "sucesso"
                );

        } catch(erro){

            mostrarNotificacao(
                "Não foi possível restaurar o backup. Verifique o arquivo.",
                "erro"
            );

            console.error(erro);

        } finally {

            event.target.value = "";

            textoRestaurarBackup.textContent = "Restaurar backup";

        }

    };

    leitor.onerror = function(){

    mostrarNotificacao(
        "Erro ao ler o arquivo de backup.",
        "erro"
    );

    event.target.value = "";

    textoRestaurarBackup.textContent = "Restaurar backup";

    };

    leitor.readAsText(arquivo);

}

function mostrarNotificacao(mensagem, tipo = "sucesso"){

    const area = document.getElementById("notificacao");

    const elemento = document.createElement("div");

    elemento.className = "mensagem-notificacao " + tipo;

    elemento.textContent = mensagem;

    area.appendChild(elemento);

    setTimeout(function(){

        elemento.remove();

    }, 3500);

}


