// Elementos da tela
const formLogin = document.getElementById("formLogin");
const formCadastro = document.getElementById("formCadastro");

const btnCriarConta = document.getElementById("btnCriarConta");
const btnVoltarLogin = document.getElementById("btnVoltarLogin");

// Mostrar formulário de cadastro
btnCriarConta.addEventListener("click", function(){

    formLogin.style.display = "none";
    btnCriarConta.style.display = "none";

    formCadastro.style.display = "block";

});

// Voltar para o login
btnVoltarLogin.addEventListener("click", function(){

    formCadastro.style.display = "none";

    formLogin.style.display = "block";
    btnCriarConta.style.display = "block";

});

// Cadastrar novo usuário no Supabase
formCadastro.addEventListener("submit", async function(event){

    event.preventDefault();

    const email = document.getElementById("emailCadastro").value;
    const senha = document.getElementById("senhaCadastro").value;

    const btnCadastrar = document.getElementById("btnCadastrar");

        btnCadastrar.disabled = true;
        btnCadastrar.textContent = "Cadastrando...";

    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: senha
    });

    if(error){
        mostrarNotificacao(
            "Erro ao cadastrar: " + error.message,
            "erro"
        );
    btnCadastrar.disabled = false;
    btnCadastrar.textContent = "Cadastrar";

    return;
    }

        mostrarNotificacao(
            "Cadastro realizado! Verifique seu e-mail para confirmar a conta!",
            "sucesso"
        );
        btnCadastrar.disabled = false;
        btnCadastrar.textContent = "Cadastrar";

    formCadastro.reset();

    formCadastro.style.display = "none";
    formLogin.style.display = "block";
    btnCriarConta.style.display = "block";

});


// Fazer login no MeuPedido
formLogin.addEventListener("submit", async function(event){

    event.preventDefault();

    const email = document.getElementById("emailLogin").value;
    const senha = document.getElementById("senhaLogin").value;

    const btnEntrar = document.getElementById("btnEntrar");

        btnEntrar.disabled = true;
        btnEntrar.textContent = "Entrando...";

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: senha
    });

   if(error){
        mostrarNotificacao(
            "Erro ao entrar: " + error.message,
            "erro"
        );
    btnEntrar.disabled = false;
    btnEntrar.textContent = "Entrar";

    return;
    }

        
    // Verificar se o usuário pode acessar o sistema
    const acessoPermitido = await verificarAssinatura(data.user.id);

    if(!acessoPermitido){

    mostrarTelaAssinaturaVencida();

    btnEntrar.disabled = false;
    btnEntrar.textContent = "Entrar";

    return;
    }

    mostrarNotificacao(
        "Login realizado com sucesso!",
        "sucesso"
    );

    // Esconder a área de login
    document.getElementById("areaLogin").style.display = "none";


    // Mostrar o painel principal
    document.getElementById("painelPrincipal").style.display = "block";

    // Mostrar o e-mail do usuário
    document.getElementById("usuarioLogado").textContent =
        "Usuário: " + data.user.email;

    // Carregar pedidos do usuário
    const carregouPedidos = await carregarPedidos();

    if(!carregouPedidos){
    mostrarNotificacao(
        "Login realizado, mas não foi possível carregar os pedidos. Tente novamente.",
        "erro"
    );
    }

    // Liberar o botão novamente
            btnEntrar.disabled = false;
            btnEntrar.textContent = "Entrar";

});


 // Identificar quando o usuário acessa pelo link de recuperação
supabaseClient.auth.onAuthStateChange(function(event, session){

    if(event === "PASSWORD_RECOVERY"){

        document.getElementById("areaLogin").style.display = "none";

        document.getElementById("painelPrincipal").style.display = "none";

        document.getElementById("areaNovaSenha").style.display = "block";

    }

});


// Verificar se já existe uma sessão ativa
async function verificarSessao(){

    const { data, error } = await supabaseClient.auth.getSession();

    // Não abrir o painel enquanto estiver recuperando a senha
    if(window.location.hash.includes("type=recovery")){
        return;
    }

   if(error){
    document.getElementById("areaLogin").style.display = "block";

    document.getElementById("painelPrincipal").style.display = "none";

    document.getElementById("usuarioLogado").textContent = "";

    pedidos = [];

    aplicarFiltros();

    mostrarNotificacao(
        "Erro ao verificar sessão: " + error.message,
        "erro"
    );

    return;
    }

    
if(data.session){

    const acessoPermitido = await verificarAssinatura(
        data.session.user.id
    );

    if(!acessoPermitido){

    mostrarTelaAssinaturaVencida();

    return;
    }

    document.getElementById("areaLogin").style.display = "none";

    document.getElementById("painelPrincipal").style.display = "block";




    document.getElementById("usuarioLogado").textContent =
        "Usuário: " + data.session.user.email;

    await carregarPedidos();

    } else {

        document.getElementById("areaLogin").style.display = "block";

        document.getElementById("painelPrincipal").style.display = "none";

        document.getElementById("usuarioLogado").textContent = "";

        pedidos = [];

    }

}


// Mostrar tela quando a assinatura não permite acesso
function mostrarTelaAssinaturaVencida(){

    document.getElementById("areaLogin").style.display = "none";

    document.getElementById("painelPrincipal").style.display = "none";

    document.getElementById("areaAssinaturaVencida").style.display = "block";

    document.getElementById("usuarioLogado").textContent = "";

    pedidos = [];

    aplicarFiltros();
}


// Verificar se o usuário pode acessar o MeuPedido
async function verificarAssinatura(userId){

    const { data, error } = await supabaseClient
        .from("assinaturas")
        .select("status, trial_ends_at, subscription_ends_at")
        .eq("user_id", userId)
        .maybeSingle();

    if(error){
        mostrarNotificacao(
            "Erro ao verificar assinatura: " + error.message,
            "erro"
        );
        return false;
    }

    // Contas antigas sem assinatura continuam com acesso
    if(!data){
        return true;
    }

    // Período gratuito
    if(data.status === "trialing"){

        if(
            data.trial_ends_at &&
            new Date(data.trial_ends_at).getTime() > Date.now()
        ){
            return true;
        }

        return false;
    }

    // Assinatura paga
    if(data.status === "active"){

        if(!data.subscription_ends_at){
            return true;
        }

        return new Date(data.subscription_ends_at).getTime()
            > Date.now();
    }

    // Cadastro pendente, expirado ou cancelado
    return false;
}


// Executar verificação
verificarSessao();

// Sair da conta
const btnSair = document.getElementById("btnSair");

btnSair.addEventListener("click", async function(){

    btnSair.disabled = true;
    btnSair.textContent = "Saindo...";

    const { error } = await supabaseClient.auth.signOut();

    if(error){
    mostrarNotificacao(
        "Erro ao sair: " + error.message,
        "erro"
    );

    btnSair.disabled = false;
    btnSair.textContent = "Sair";

    return;
    }

    // Limpar pedidos da memória
    pedidos = [];

    // Esconder painel principal
    document.getElementById("painelPrincipal").style.display = "none";

    // Mostrar área de login
    document.getElementById("areaLogin").style.display = "block";

    // Limpar informações do usuário
    document.getElementById("usuarioLogado").textContent = "";

    // Limpar lista de pedidos
    document.getElementById("listaPedidos").innerHTML = "";

    // Atualizar filtros e dashboard sem pedidos
    aplicarFiltros();

    formLogin.reset();

    btnSair.disabled = false;
    btnSair.textContent = "Sair";

    mostrarNotificacao(
    "Você saiu da sua conta!",
    "sucesso"
);

});


// Recuperar senha por e-mail
const btnEsqueciSenha = document.getElementById("btnEsqueciSenha");

btnEsqueciSenha.addEventListener("click", async function(){

    const email = document.getElementById("emailLogin").value;

    if(!email){
        mostrarNotificacao(
            "Digite seu e-mail no campo de login primeiro!",
            "erro"
        );
        return;
    }

    const { error } = await supabaseClient.auth.resetPasswordForEmail(
        email,
        {
            redirectTo: window.location.origin + "/index.html"
        }
    );

    if(error){
        mostrarNotificacao(
            "Erro ao solicitar recuperação: " + error.message,
            "erro"
        );
        return;
    }

    mostrarNotificacao(
            "Enviamos um link de recuperação para seu e-mail. Verifique sua caixa de entrada!",
            "sucesso"
        );

});


// Alterar senha do usuário
const formNovaSenha = document.getElementById("formNovaSenha");

formNovaSenha.addEventListener("submit", async function(event){

    event.preventDefault();

    const novaSenha = document.getElementById("novaSenha").value;
    const confirmarSenha = document.getElementById("confirmarSenha").value;

    if(novaSenha !== confirmarSenha){
        mostrarNotificacao(
            "As senhas não são iguais!",
            "erro"
        );
        return;
    }

    const { error } = await supabaseClient.auth.updateUser({
        password: novaSenha
    });

    if(error){
        mostrarNotificacao(
            "Erro ao alterar senha: " + error.message,
            "erro"
        );
        return;
    }

        mostrarNotificacao(
        "Senha alterada com sucesso!",
        "sucesso"
    );

    formNovaSenha.reset();

    document.getElementById("areaNovaSenha").style.display = "none";
    document.getElementById("areaLogin").style.display = "block";

    await supabaseClient.auth.signOut();

});


// Sair da conta pela tela de assinatura vencida
document.getElementById("btnSairAssinatura").addEventListener("click", async function(){

    const { error } = await supabaseClient.auth.signOut();

    if(error){
        mostrarNotificacao(
            "Erro ao sair da conta: " + error.message,
            "erro"
        );
        return;
    }

    document.getElementById("areaAssinaturaVencida").style.display = "none";
    document.getElementById("areaLogin").style.display = "block";
    document.getElementById("painelPrincipal").style.display = "none";
    document.getElementById("usuarioLogado").textContent = "";

    pedidos = [];

    aplicarFiltros();

});


// Botão de contratação
document.getElementById("btnContratar").addEventListener("click", function(){

    mostrarNotificacao(
        "A contratação estará disponível em breve!",
        "sucesso"
    );

});
