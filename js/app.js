// quando o meu documento for validado e carregado 
$(document).ready(function () {
    cardapio.eventos.init();
})

var cardapio = {};

var MEU_CARRINHO = [];
var MEU_ENDERECO = null;

var VALOR_CARRINHO = 0;
var VALOR_ENTREGA = 5;

var CELULAR_EMPRESA = '5551993629999';

// evcento que vai acontecer quando inicializar a tela
cardapio.eventos = {

    init: () => {
        // quando a tela é iniciada eu chamo essa funcção de obter itens do cardapio
        cardapio.metodos.obterItensCardapio();
        // quando a tela é iniciada eu chamo essa funcção de whatsApp
        cardapio.metodos.carregarBotaoWhatsApp();
        // quando a tela é iniciada eu chamo essa funcção de carregar botao ligar
        cardapio.metodos.carregarBotaoLigar();
        // quando a tela é iniciada eu chamo essa funcção de carregar botao reserva
        cardapio.metodos.carregarBotaoReserva();
        // quando a tela é iniciada eu chamo essa funcção de whatsApp
        cardapio.metodos.carregarBotaoWhatsAppFooter();

    }
    
}

cardapio.metodos = {
    // função obtem a lista de itens do cardapio
    obterItensCardapio: (categoria = 'burgers', vermais = false) => {

        var filtro = MENU[categoria];
        console.log(filtro);

        // se não for clicado no ver mais apaga, se for clicado no ver mais não apaga
        if (!vermais) {
            // limpando a tela para aparecer somente os produtos que o cliente esta selecionando
            $('#itensCardapio').html('');
            // se clicar em uma categoria nova o botao ver mais volta a aparecer 
            $("#btnVerMais").removeClass('hidden');
        }

        // fazendo o for each para percorrer a lista e preencher dinamicamente / i = indice e = elemento
        $.each(filtro, (i, e) => {
            // criando a variável do template     / substituindo a variavel img do template pelo elemento.img
            let temp = cardapio.templates.item.replace(/\${img}/g, e.img)
            .replace(/\${nome}/g, e.name)
            .replace(/\${preco}/g, e.price.toFixed(2).replace('.', ',')) // fixando 2 casas depois da virgula e trocando ponto por virgula
            .replace(/\${id}/g, e.id);

            // se ele clicar no botao ver mais, irá mostrar os ultimos 4 itens (12 itens vai aparecer)
            if (vermais && i >= 8 && i < 12) {
                // adicionar dentro do html, onde tem o id itensCardapio
                $('#itensCardapio').append(temp)
            }

            // paginação inicial (8 itens)
            // ponto de ! para mostrar que o vermais é falso
            if (!vermais && i < 8) {
                $('#itensCardapio').append(temp)
            }



        })

        // remove o ativo
        $(".container-menu a").removeClass('active');

        // seta menu para ativo
        $("#menu-" + categoria).addClass('active')

    },
    
    // criando um metodo para o botao de ver mais (clique no botao)
    verMais: () => {

        // pegando o ativo pelo id
        var ativo = $(".container-menu a.active").attr('id').split('menu-')[1];  // split vai quebrar o id, exemplo [menu-][burgers] e vamos pegar o item [1], ou seja, o burgers
        // carregando as imagens do elemento que esta ativo no ver mais
        cardapio.metodos.obterItensCardapio(ativo, true);
        // quando eu clicar no ver mais ele vai chamar o metodo e o botao vai sumir
        $("#btnVerMais").addClass('hidden');

    },

    // função diminuir quantidade do idem no cardapio
    diminuirQuantidade: (id) => {
        // pegando a quantidade total que tem no momento e transformando pra inteiro pois vem com texto
        let qntdAtual = parseInt($("#qntd-" + id).text());
        // se quantidade atual for maior que 0 ele diminui 1 ao clicar no botao de menos
        if (qntdAtual > 0) {
            $("#qntd-" + id).text(qntdAtual - 1);
        }
        
    },

    // função aumentar quantidade do item no cardapio
    aumentarQuantidade: (id) => {

        // pegando a quantidade total que tem no momento e transformando pra inteiro pois vem com texto
        let qntdAtual = parseInt($("#qntd-" + id).text());
        // somando 1 quando clicar no botao de mais
        $("#qntd-" + id).text(qntdAtual + 1);
        
    },

    // adicionar ao carrinho o item do cardapio
    adicionarAoCarrinho: (id) => {

        // pegando a quantidade total que tem no momento e transformando pra inteiro pois vem com texto
        let qntdAtual = parseInt($("#qntd-" + id).text());
        
        if (qntdAtual > 0) {
            // obter a categoria ativa
            var categoria = $(".container-menu a.active").attr('id').split('menu-')[1];  // split vai quebrar o id, exemplo [menu-][burgers] e vamos pegar o item [1], ou seja, o burgers

            // obtem a lista de itens
            let filtro = MENU[categoria];

            // obtem o item
            let item = $.grep(filtro, (e, i) => { return e.id == id }); // dentro da lista de categorias no filtro eu quero pegar somente o que tem o id igual ao id que eu passei

            // se o item ofr mais que 0
            if (item.length > 0) {

                // validar se já existe esse item nocarrinho
                let existe = $.grep(MEU_CARRINHO, (elem, index) => {return elem.id == id});
                // se existe item dentro do carrinho igual, só altera a quantidade
                if (existe.length > 0) {
                    // qual a posição do index do carrinho
                    let objIndex = MEU_CARRINHO.findIndex((obj => obj.id == id));
                    // somando o item no carrinho com o que já tem
                    MEU_CARRINHO[objIndex].qntd = MEU_CARRINHO[objIndex].qntd + qntdAtual;

                }
                // se não existe o item no carrinho ainda, adiciona ele
                else {
                    item[0].qntd = qntdAtual;
                    MEU_CARRINHO.push(item[0])
                }

                // chamando a funcção de mensagem de item adicionado ao carrinho com sucesso
                cardapio.metodos.mensagem('Item adicionado ao carrinho', 'green');
                // zerando a quantidade do produto depois de clicar em adicionar ao carrinho
                $("#qntd-" + id).text(0);

                // chamando o metodo para atualizar o carrinho
                cardapio.metodos.atualizarBadgeTotal();

            }


        }
        
    },

    // atualiza o badge de totais dos botões do meu carrinho
    atualizarBadgeTotal: () => {

        var total = 0;
        // percorrer o meu carrinho
        $.each(MEU_CARRINHO, (i, e) => {
            // o total recece o total mais a quantidade
            total += e.qntd
        })

        // se o total for mais que 0, ou seja, se tiver coisa no carrinho
        if (total > 0) {
            // faz o botao aparecer se tiver item no carrinho
            $(".botao-carrinho").removeClass('hidden')
            $(".container-total-carrinho").removeClass('hidden')
        }
        else {
            // faz o botao desaparecer se não tiver item no carrinho
            $(".botao-carrinho").addClass('hidden')
            $(".container-total-carrinho").addClass('hidden')
        }

        $(".badge-total-carrinho").html(total);
            
    },

    // metodo para abrir nossa modal full ao clicar no carrinho
    abrirCarrinho: (abrir) => {
        if (abrir) {
            // torno a modal visivel tirando o hidden dela
            $("#modalCarrinho").removeClass('hidden')
            cardapio.metodos.carregarCarrinho();
        }
        else {
            // torno a modal nao visivel colocando o hidden dela
            $("#modalCarrinho").addClass('hidden')
        }
    },

    // altera os textos e exibe os botões das etapas na parte do meu carrinho
    carregarEtapa: (etapa) => {
        // se estiver na etapa 1
        if (etapa == 1) {
            // exibe o texto seu carrinho
            $("#lblTituloEtapa").text('Seu carrinho:');
            // deixa visivel apenas o id itensCarrinho
            $("#itensCarrinho").removeClass('hidden');
            $("#localEntrega").addClass('hidden');
            $("#resumoCarrinho").addClass('hidden');

            // remove o ativo de todos
            $(".etapa").removeClass('active');
            //adiciona o ativo apenas na etapa 1, na bolinha das etapas
            $(".etapa1").addClass('active');

            // exibindo o botao de continuar
            $("#btnEtapaPedido").removeClass('hidden');
            // ocultando o botao de Revisar pedido
            $("#btnEtapaEndereco").addClass('hidden');
            // ocultando o botao de enviar pedido
            $("#btnEtapaResumo").addClass('hidden');
            // ocultando o botao de voltar
            $("#btnVoltar").addClass('hidden');
        }

        if (etapa == 2) {
            // exibe o texto seu carrinho
            $("#lblTituloEtapa").text('Endereço de entrega:');
            // deixa visivel apenas o id de local de entrega
            $("#itensCarrinho").addClass('hidden');
            $("#localEntrega").removeClass('hidden');
            $("#resumoCarrinho").addClass('hidden');

            // remove o ativo de todos
            $(".etapa").removeClass('active');
            //adiciona o ativo apenas na etapa 1 e 2, na bolinha das etapas
            $(".etapa1").addClass('active');
            $(".etapa2").addClass('active');

            // ocultando o botao de continuar
            $("#btnEtapaPedido").addClass('hidden');
            // exibindo o botao de Revisar pedido
            $("#btnEtapaEndereco").removeClass('hidden');
            // ocultando o botao de enviar pedido
            $("#btnEtapaResumo").addClass('hidden');
            // exibindo o botao de voltar
            $("#btnVoltar").removeClass('hidden');
            
        }

        if (etapa == 3) {
            // exibe o texto seu carrinho
            $("#lblTituloEtapa").text('Resumo do pedido:');
            // deixa visivel apenas o id de resumo do carrinho
            $("#itensCarrinho").addClass('hidden');
            $("#localEntrega").addClass('hidden');
            $("#resumoCarrinho").removeClass('hidden');

            // remove o ativo de todos
            $(".etapa").removeClass('active');
            //adiciona o ativo apenas na etapa 1, 2 e 3, na bolinha das etapas
            $(".etapa1").addClass('active');
            $(".etapa2").addClass('active');
            $(".etapa3").addClass('active');

            // ocultando o botao de continuar
            $("#btnEtapaPedido").addClass('hidden');
            // ocultando o botao de Revisar pedido
            $("#btnEtapaEndereco").addClass('hidden');
            // exibindo o botao de enviar pedido
            $("#btnEtapaResumo").removeClass('hidden');
            // exibindo o botao de voltar
            $("#btnVoltar").removeClass('hidden');            
        }

    },

    // botao de voltar dentro do meu carrinho para voltar as etapas 2 e 3
    voltarEtapa: () => {

        // quantos elementos tem a etapa active. ex.: etapa 2 tem 2 ativos e etapa 3 tem 3 ativos
        let etapa = $(".etapa.active").length;
        // carregando o metodo e diminuindo 1 da etapa atual. ex.: se tiver na etapa 3 volta para 2 e se tiver na 2 volta para 1
        cardapio.metodos.carregarEtapa(etapa - 1);

    },

    // 1ª função depois que abre o carrinho, etapa 1 do carrinho para carregar os itens
    carregarCarrinho: () => {
        // chamando a funçao para carregar a etapa 1
        cardapio.metodos.carregarEtapa(1);

        // se tiver alguma coisa no carrinho
        if (MEU_CARRINHO.length > 0) {

            // limpa para poder carregar novos itens
            $("#itensCarrinho").html('');

            // percorrer os elementos do carrinho
            $.each(MEU_CARRINHO, (i, e) => {
                // criando a variável do template     / substituindo a variavel img do template pelo elemento.img
                let temp = cardapio.templates.itemCarrinho.replace(/\${img}/g, e.img)
                .replace(/\${nome}/g, e.name)
                .replace(/\${preco}/g, e.price.toFixed(2).replace('.', ',')) // fixando 2 casas depois da virgula e trocando ponto por virgula
                .replace(/\${id}/g, e.id)
                .replace(/\${qntd}/g, e.qntd)

                // adiciona na nossa lista de carrinhos
                $("#itensCarrinho").append(temp);

                // ultimo item do carrinho
                if ((i + 1) == MEU_CARRINHO.length) {
                    // atualiza os valores (R$) do carrinho
                    cardapio.metodos.carregarValores();
                }


            })
        }
        else {
            // se o carrinho estiver vazio aparecerá essa mensagem
            $("#itensCarrinho").html('<p class="carrinho-vazio"><i class="fa fa-shopping-bag"></i>Seu carrinho está vazio.</p>');
            // atualiza os valores (R$) do carrinho
            cardapio.metodos.carregarValores();
        }

    },

    // diminuir a quantidade do item dentro do carrinho na etapa 1
    diminuirQuantidadeCarrinho: (id) => {

        // pegando a quantidade total que tem no momento e transformando pra inteiro pois vem com texto
        let qntdAtual = parseInt($("#qntd-carrinho-" + id).text());
        // se quantidade atual for maior que 1 ele diminui 1 ao clicar no botao de menos
        if (qntdAtual > 1) {
            $("#qntd-carrinho-" + id).text(qntdAtual - 1);
            // chamando a funçao para atualizar o carrinho tirando 1 da quantidade
            cardapio.metodos.atualizarCarrinho(id, qntdAtual - 1)
        }
        // se for menor que 1 ele remove o item do carrinho
        else {
            cardapio.metodos.removerItemCarrinho(id);
        }

    },

    // aumentar a quantidade do item dentro do carrinho na etapa 1
    aumentarQuantidadeCarrinho: (id) => {

        // pegando a quantidade total que tem no momento e transformando pra inteiro pois vem com texto
        let qntdAtual = parseInt($("#qntd-carrinho-" + id).text());   
        
        // ele aumenta 1 ao clicar no botao de mais
        $("#qntd-carrinho-" + id).text(qntdAtual + 1);

        // chamando a funçao para atualizar o carrinho aumentando 1 da quantidade
        cardapio.metodos.atualizarCarrinho(id, qntdAtual + 1)

        // chamando o metodo para atualizar o bag com o numero de itens que tem no carrinho correto
        cardapio.metodos.atualizarBadgeTotal();

    },

    // botao remover o item do carrinho na etapa 1
    removerItemCarrinho: (id) => {
        // retonar apenas a lista que é diferente do meu id, ou seja, se ele clicar no botao de remover ele remove o item do carrinho
        MEU_CARRINHO = $.grep(MEU_CARRINHO, (e, i) => { return e.id != id});
        // carrega o carinho novamente sem o item excluído
        cardapio.metodos.carregarCarrinho();

    },

    // atualiza o acrrinho com a quantidade atual
    atualizarCarrinho: (id, qntd) => {
        // pegar o item do objeto, o indice certo
        let objIndex = MEU_CARRINHO.findIndex((obj => obj.id == id));
        // passar a nova quantidade para meu carrinho atraves do indice igual
        MEU_CARRINHO[objIndex].qntd = qntd;

        // chamando o metodo para atualizar o bag com o numero de itens que tem no carrinho correto
        cardapio.metodos.atualizarBadgeTotal();

        // atualiza os valores (R$) do carrinho
        cardapio.metodos.carregarValores();

    },

    // carrega todos os valores de subtotal, entrega e total no meu carrinho
    carregarValores: () => {
        // inicia o valor do carrinho como 0
        VALOR_CARRINHO = 0;
        // limpando tudo
        $("#lblSubTotal").text('R$ 0,00');
        $("#lblValorEntrega").text('+ R$ 0,00');
        $("#lblValorTotal").text('R$ 0,00');

        // percorrer o meu carrinho para ver qual valor do carrinho
        $.each(MEU_CARRINHO, (i, e) => {
            // valor do carrinho vai ser o preço vezes a quantidade do item + o valor que já está adicionado ao carrinho
            VALOR_CARRINHO += parseFloat(e.price * e.qntd);

            // quando estiver no ultimo item do meu for (do meu carrinho) a gente atualiza os valores do carrinho
            if ((i + 1) == MEU_CARRINHO.length) {
                $("#lblSubTotal").text(`R$ ${VALOR_CARRINHO.toFixed(2).replace('.', ',')}`);
                $("#lblValorEntrega").text(`+ R$ ${VALOR_ENTREGA.toFixed(2).replace('.', ',')}`);
                $("#lblValorTotal").text(`R$ ${(VALOR_CARRINHO + VALOR_ENTREGA).toFixed(2).replace('.', ',')}`);
            }

        })

    },

    // carregar a etapa endereços clicando no botao continuar
    carregarEndereco: () => {

        // se nao tiver nada no meu carrinho
        if (MEU_CARRINHO.length <= 0) {
            // vai aparecer essa mensagem
            cardapio.metodos.mensagem('Seu carrinho está vazio.')
            // não continua o que estiver a baixo e não faz nada a partir dessa mensagem
            return;
        }

        // se tiver itens no carrinho carrega a etapa 2
        cardapio.metodos.carregarEtapa(2);

    },   
    
    // API ViaCEP
    buscarCep: () => {    
        // criando a variavel com valor cep   trim = limpa os espações antes e depois do texto e replace pra deixar somente numeros
        var cep = $("#txtCEP").val().trim().replace(/\D/g, '');

        // verifica se o cep possui valor informado
        if (cep != "") {
            // expressao regular para validar o cep
            var validacep = /^[0-9]{8}$/;  // de 0 a 9 pegando 8 digitos

            // para verificar se o cep é valido ou não - se cair no if o formato do cep é vallido
            if (validacep.test(cep)) {

                // chamando a API do ViaCEP
                $.getJSON("https://viacep.com.br/ws/" + cep + "/json/?callback=?", function (dados) {

                    // se não tiver nenhum erro no retorno dos dados
                    if (!("erro" in dados)) {

                        // Atualizar os campos com os valores retornados da API
                        $("#txtEndereco").val(dados.logradouro); // preenchendo o endereço com o valor da api logradouro e será assim para os demais
                        $("#txtBairro").val(dados.bairro);
                        $("#txtCidade").val(dados.localidade);
                        $("#ddlUF").val(dados.uf);
                        $("#txtNumero").focus(); // foca o cursor no numero, pois nao vem no via cep

                    }
                    // se tiver erro, o cep nao foi encontrado
                    else {
                        cardapio.metodos.mensagem('CEP não encontrado. Preencha as informações manualmente.');
                        $("#txtEndereco").focus(); // foca o cursor no cep
                    }

                })

            }
            // se cair no else é pq o formato do cep é invalido
            else {
                cardapio.metodos.mensagem('Formato do CEP inválido.');
                $("#txtCEP").focus(); // foca o cursor no cep
            }

        }
        // se o cep nao foi preenchido apresentamos mensagem
        else {
            cardapio.metodos.mensagem('Informe o CEP, por favor.');
            $("#txtCEP").focus(); // foca o cursor no cep
        }

    },

    // validação antes de prosseguir para etapa 3 cliclando em revisar pedido
    resumoPedido: () => {   
        // pegando os valores dos inputs e tirtando os espações vazios
        let cep = $("#txtCEP").val().trim();
        let endereco = $("#txtEndereco").val().trim();
        let bairro = $("#txtBairro").val().trim();
        let cidade = $("#txtCidade").val().trim();
        let uf = $("#ddlUF").val().trim();
        let numero = $("#txtNumero").val().trim();
        let complemento = $("#txtComplemento").val().trim();

        // se não digitou nada
        if (cep.length <= 0) {
            cardapio.metodos.mensagem('Informe o CEP, por favor.');
            $("#txtCEP").focus();
            // volta e nao cntinua o codigo
            return;
        }

        // se não digitou nada
        if (endereco.length <= 0) {
            cardapio.metodos.mensagem('Informe o endereço, por favor.');
            $("#txtEndereco").focus();
            // volta e nao cntinua o codigo
            return;
        }

        // se não digitou nada
        if (bairro.length <= 0) {
            cardapio.metodos.mensagem('Informe o bairro, por favor.');
            $("#txtBairro").focus();
            // volta e nao cntinua o codigo
            return;
        }  
        
        // se não digitou nada
        if (cidade.length <= 0) {
            cardapio.metodos.mensagem('Informe a cidade, por favor.');
            $("#txtCidade").focus();
            // volta e nao cntinua o codigo
            return;
        }
        
        // se não digitou nada
        if (uf == -1) {
            cardapio.metodos.mensagem('Informe a UF, por favor.');
            $("#ddlUF").focus();
            // volta e nao cntinua o codigo
            return;
        }

        // se não digitou nada
        if (numero.length <= 0) {
            cardapio.metodos.mensagem('Informe o número, por favor.');
            $("#txtNumero").focus();
            // volta e nao cntinua o codigo
            return;
        }

        // meu endereço vai receber todos os valores e armazenar para levar para o resumo do pedido
        MEU_ENDERECO = {
            cep: cep,
            endereco: endereco,
            bairro: bairro,
            cidade: cidade,
            uf: uf,
            numero: numero,
            complemento: complemento
        }

        // quando clicar no botao de revisar pedido vai ir pra etapa 3
        cardapio.metodos.carregarEtapa(3);
        // carrega a etapa de resumo do pedido
        cardapio.metodos.carregarResumo();

    },

    // carrega a etapa de resumo do pedido
    carregarResumo: () => {  

        // limpa os itens da lista pra não duplicar
        $("#listaItensResumo").html('');

        // percorrer o meu carrinho
        $.each(MEU_CARRINHO, (i, e) => {
            // criando a variável do template     / substituindo a variavel img do template pelo elemento.img
            let temp = cardapio.templates.itemResumo.replace(/\${img}/g, e.img)
                .replace(/\${nome}/g, e.name)
                .replace(/\${preco}/g, e.price.toFixed(2).replace('.', ',')) // fixando 2 casas depois da virgula e trocando ponto por virgula
                .replace(/\${qntd}/g, e.qntd)

            // adicionar na lista itens resumo
            $("#listaItensResumo").append(temp);

        });

        // informando no html para o resumo do pedido o endereço informado no local de entrega
        $("#resumoEndereco").html(`${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero}, ${MEU_ENDERECO.bairro}`);
        // informando no html para o resumo do pedido o endereço informado no local de entrega
        $("#cidadeEndereco").html(`${MEU_ENDERECO.cidade}-${MEU_ENDERECO.uf} / ${MEU_ENDERECO.cep} ${MEU_ENDERECO.complemento}`);

        // ja chama nosso botao do enviar pedido com o link para cnversa atualziado
        cardapio.metodos.finalizarPedido();

    },

    // atualiza o link do botao do whatsapp
    finalizarPedido: () => {  

        // se o carrinho tiver itens e o endereço foi preenchido
        if (MEU_CARRINHO.length > 0 && MEU_ENDERECO != null) {

            // criar o texto que sera enviado mno wpp
            var texto = 'Olá! Gostaria de fazer um pedido:';
            texto += `\n*Itens do pedido:*\n\n\${itens}`;
            texto += '\n*Endereço de entrega:*';
            texto += `\n${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero}, ${MEU_ENDERECO.bairro}`;
            texto += `\n${MEU_ENDERECO.cidade}-${MEU_ENDERECO.uf} / ${MEU_ENDERECO.cep} ${MEU_ENDERECO.complemento}`;
            texto += `\n\n*Total (com entrega): R$ ${(VALOR_CARRINHO + VALOR_ENTREGA).toFixed(2).replace('.', ',')}*`;

            // criando variavel itens vazio
            var itens = '';
            // percorrendo o carrinho para preencher a variavel itens com os itens que tem no carrinho
            $.each(MEU_CARRINHO, (i, e) => {
                // itens recebe o item que ja esta mais o que ta sendo adicionado com quantidade, nome e preço de cada item
                itens += `*${e.qntd}x* ${e.name} ....... R$ ${e.price.toFixed(2).replace('.', ',')} \n`;

                // quando estiver no ultimo item do meu for each
                if ((i + 1) == MEU_CARRINHO.length) {
                    // vou atualizar no meu texto meus itens
                    texto = texto.replace(/\${itens}/g, itens);

                    // converte a URL para poder enviar o texto para o wpp de maneira q o navegador entenda
                    let encode = encodeURI(texto);
                    // criando a URL
                    let URL = `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`;

                    // atribuindo ao href do botao a url, pra quando clicar direcionar para o whats com a mensagem
                    $("#btnEtapaResumo").attr('href', URL);

                }

            })

        }

    },

    // carrega o link botao reserva
    carregarBotaoReserva: () => {
        // criando a variavel texto
        var texto = 'Olá! Gostaria de fazer uma *reserva*';
        // converte a URL para poder enviar o texto para o wpp de maneira q o navegador entenda
        let encode = encodeURI(texto);
        // criando a URL
        let URL = `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`;

        // atribuindo ao href do botao a url, pra quando clicar direcionar para o whats com a mensagem
        $("#btnReserva").attr('href', URL);

    },

    // carrega o link botao ligar
    carregarBotaoLigar: () => {

        // atribuindo ao href do botao a url, pra quando clicar direcionar para a ligação
        $("#btnLigar").attr('href', `tel:${CELULAR_EMPRESA}`);

    },

    // abre o depoimento
    abrirDepoimento: (depoimento) => {

        // escondendo todos os depoimentos
        $("#depoimento-1").addClass('hidden');
        $("#depoimento-2").addClass('hidden');
        $("#depoimento-3").addClass('hidden');

        // escondendo o ativo de botos botoes
        $("#btnDepoimento-1").removeClass('active');
        $("#btnDepoimento-2").removeClass('active');
        $("#btnDepoimento-3").removeClass('active');

        // ele aparece o depoimento de acordo com o botao do depoimento que o usuario clicar
        $("#depoimento-" + depoimento).removeClass('hidden');
        // ele torna o depoimento ativo de acordo com o botao do depoimento que o usuario clicar
        $("#btnDepoimento-" + depoimento).addClass('active');

    },

    // carrega o link botao reserva
    carregarBotaoWhatsApp: () => {
        // criando a variavel texto
        var texto = 'Olá! Vim pelo *site* e gostaria de ser atendido';
        // converte a URL para poder enviar o texto para o wpp de maneira q o navegador entenda
        let encode = encodeURI(texto);
        // criando a URL
        let URL = `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`;

        // atribuindo ao href do botao a url, pra quando clicar direcionar para o whats com a mensagem
        $("#btnWhatsApp").attr('href', URL);

    },

    // carrega o link botao reserva
    carregarBotaoWhatsAppFooter: () => {
        // criando a variavel texto
        var texto = 'Olá! Vim pelo *site* e gostaria de ser atendido';
        // converte a URL para poder enviar o texto para o wpp de maneira q o navegador entenda
        let encode = encodeURI(texto);
        // criando a URL
        let URL = `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`;

        // atribuindo ao href do botao a url, pra quando clicar direcionar para o whats com a mensagem
        $("#btnWhatsAppFooter").attr('href', URL);

    },    

    // metodo de mensagem personalizada
    mensagem: (texto, cor = 'red', tempo = 3500) => {

        // criando um id dinamico para nao se repetir o id
        let id = Math.floor(Date.now() * Math.random()).toString();

        // criando a variavel do texto
        let msg = `<div id="msg-${id}" class="animated fadeInDown toast ${cor}">${texto}</div>`;
        // adicionando a mensgaem ao id
        $("#container-mensagens").append(msg);

        // ele espera determinado tempo(3500milisegundos) e realiza a função de remover a mensagem
        setTimeout(() => {
            // removendo a classe e adicionando classe para fazer a animação na tela
            $("#msg-" + id).removeClass('fadeInDown');
            $("#msg-" + id).addClass('fadeOutUp');
            
            setTimeout(() => {
                // remove a mensagem com o id aleatorio
                $("#msg-" + id).remove();
            },800)

        }, tempo)

    },

}

cardapio.templates = {

    item: `

        <div class="col-12 col-lg-3 col-md-3 col-sm-6 mb-5 animated fadeInUp">
            <div class="card card-item" id="\${id}">
                <div class="img-produto">
                    <img src="\${img}">
                </div>
                <p class="title-produto text-center mt-4">
                    <b>\${nome}</b>
                </p>
                <p class="price-produto text-center">
                    <b>R$ \${preco}</b>
                </p>
                <div class="add-carrinho">
                    <span class="btn-menos" onclick="cardapio.metodos.diminuirQuantidade('\${id}')"><i class="fas fa-minus"></i></span>
                    <span class="add-numero-itens" id="qntd-\${id}">0</span>
                    <span class="btn-plus" onclick="cardapio.metodos.aumentarQuantidade('\${id}')"><i class="fas fa-plus"></i></span>
                    <span class="btn btn-add" onclick="cardapio.metodos.adicionarAoCarrinho('\${id}')"><i class="fa fa-shopping-bag"></i></span>
                </div>
            </div>
        </div>


    `,

    itemCarrinho: `

        <div class="col-12 item-carrinho">
            <div class="img-produto">
                <img src="\${img}">
            </div>
            <div class="dados-produto">
                <p class="title-produto"><b>\${nome}</b></p>
                <p class="price-produto"><b>R$ \${preco}</b></p>
            </div>
            <div class="add-carrinho">
                <span class="btn-menos" onclick="cardapio.metodos.diminuirQuantidadeCarrinho('\${id}')"><i class="fas fa-minus"></i></span>
                <span class="add-numero-itens" id="qntd-carrinho-\${id}">\${qntd}</span>
                <span class="btn-plus" onclick="cardapio.metodos.aumentarQuantidadeCarrinho('\${id}')"><i class="fas fa-plus"></i></span>
                <span class="btn btn-remove no-mobile" onclick="cardapio.metodos.removerItemCarrinho('\${id}')"><i class="fa fa-times"></i></span>
            </div>
        </div>

    `,

    itemResumo: `

        <div class="col-12 item-carrinho resumo">
            <div class="img-produto-resumo">
                <img src="\${img}">
            </div>
            <div class="dados-produto">
                <p class="title-produto-resumo">
                    <b>\${nome}</b>
                </p>
                <p class="price-produto-resumo">
                    <b>R$ \${preco}</b>
                </p>
            </div>
            <p class="quantidade-produto-resumo">
                x <b>\${qntd}</b>
            </p>
        </div>
    
    `
    
}