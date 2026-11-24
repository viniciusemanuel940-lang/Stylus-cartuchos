// ===== FUNÇÕES AUXILIARES =====

// Lê uma lista salva no localStorage (se der erro, devolve lista vazia)
function carregar(chave) {
    try {
        const dados = JSON.parse(localStorage.getItem(chave));
        return Array.isArray(dados) ? dados : [];
    } catch (erro) {
        return [];
    }
}

// Protege o HTML contra caracteres especiais digitados pelo usuário
function esc(texto) {
    return String(texto === undefined || texto === null ? '' : texto)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function moeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function arredondar(valor) {
    return Math.round(valor * 100) / 100;
}

// Data de hoje no formato do input type="date" (aaaa-mm-dd)
function hojeISO() {
    const agora = new Date();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');
    return agora.getFullYear() + '-' + mes + '-' + dia;
}

// Converte aaaa-mm-dd para dd/mm/aaaa
function formatarData(data) {
    return data.split('-').reverse().join('/');
}

// Converte data completa (ISO) para dd/mm/aaaa
function formatarDataISO(iso) {
    return new Date(iso).toLocaleDateString('pt-BR');
}

function formatarDataHora(iso) {
    const data = new Date(iso);
    return data.toLocaleDateString('pt-BR') + ' ' +
        data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function somarDias(iso, dias) {
    const data = new Date(iso);
    data.setDate(data.getDate() + dias);
    return data.toLocaleDateString('pt-BR');
}

function linhaVazia(colunas, texto) {
    return '<tr><td colspan="' + colunas + '" class="vazio">' + texto + '</td></tr>';
}

function mascaraCPF(valor) {
    valor = valor.replace(/\D/g, '').slice(0, 11);
    valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
    valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
    valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return valor;
}

function mascaraCNPJ(valor) {
    valor = valor.replace(/\D/g, '').slice(0, 14);
    valor = valor.replace(/^(\d{2})(\d)/, '$1.$2');
    valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    valor = valor.replace(/\.(\d{3})(\d)/, '.$1/$2');
    valor = valor.replace(/(\d{4})(\d)/, '$1-$2');
    return valor;
}

function mascaraTelefone(valor) {
    valor = valor.replace(/\D/g, '').slice(0, 11);

    if (valor.length > 10) {
        return valor.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    if (valor.length > 6) {
        return valor.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    }
    if (valor.length > 2) {
        return valor.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    }
    return valor.length ? '(' + valor : '';
}

function aplicarMascaras(idCpf, idTelefone, idCnpj) {
    const campoCpf = document.getElementById(idCpf);
    const campoTelefone = document.getElementById(idTelefone);

    campoCpf.addEventListener('input', function () {
        campoCpf.value = mascaraCPF(campoCpf.value);
    });

    campoTelefone.addEventListener('input', function () {
        campoTelefone.value = mascaraTelefone(campoTelefone.value);
    });

    // O CNPJ so existe na tela de clientes, por isso e opcional
    if (idCnpj) {
        const campoCnpj = document.getElementById(idCnpj);

        campoCnpj.addEventListener('input', function () {
            campoCnpj.value = mascaraCNPJ(campoCnpj.value);
        });
    }
}

const nomesCategoria = {
    toner: 'Toner',
    cartucho: 'Cartucho',
    capinha: 'Capinha',
    pelicula: 'Película'
};

const nomesPagamento = {
    dinheiro: 'Dinheiro',
    pix: 'Pix',
    debito: 'Cartão de débito',
    credito: 'Cartão de crédito'
};

// Tipos de aparelho (usado no orçamento e nas ordens de serviço)
const nomesTipo = {
    celular: 'Celular',
    impressora: 'Impressora',
    notebook: 'Notebook'
};

// Pergunta a forma de pagamento. Devolve 'dinheiro', 'pix', 'debito' ou 'credito' (ou null se cancelar)
function perguntarPagamento(pergunta) {
    const resposta = prompt(
        pergunta + '\n\nDigite o número:\n1 = Dinheiro\n2 = Pix\n3 = Cartão de débito\n4 = Cartão de crédito',
        '1'
    );

    if (resposta === null) {
        return null;
    }

    const porNumero = { '1': 'dinheiro', '2': 'pix', '3': 'debito', '4': 'credito' };

    // Tira acentos e deixa minúsculo (assim "Débito" também funciona)
    const texto = resposta.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const escolhida = porNumero[texto] || (nomesPagamento[texto] ? texto : null);

    if (!escolhida) {
        alert('Forma de pagamento inválida. Digite 1, 2, 3 ou 4.');
        return null;
    }

    return escolhida;
}

const nomesGarantia = {
    sem: 'Sem garantia',
    '30': '30 dias',
    '90': '90 dias',
    '180': '6 meses',
    '365': '1 ano'
};

// ===== DADOS DA EMPRESA (aparecem no topo de tudo que for impresso) =====
// Dados da Stylus Cartuchos (aparecem no topo das impressões).
// FALTA o CNPJ: escreva entre as aspas, por exemplo '12.345.678/0001-95'
const EMPRESA = {
    cnpj: '55.215.678/0001-83',
    telefone: '(67) 99104-3557',
    endereco: 'Rua Elmano Soares, 203 - Centro - CEP 79601-020'
};

// Texto que já vem preenchido na "Descrição da garantia" (dá para mudar em cada ordem)
const TERMOS_GARANTIA_PADRAO =
    'A garantia cobre somente defeito da peça substituída ou do serviço realizado. ' +
    'A garantia NÃO cobre riscos, amassados, trincas, quebras, quedas, contato com líquidos ou umidade, ' +
    'mau uso, nem aparelhos abertos ou consertados por terceiros. ' +
    'Nesses casos a garantia é perdida.';

// Arquivo do ícone do WhatsApp (coloque na mesma pasta do sistema.html)
const ICONE_WHATSAPP = 'whatsapp.png';

// Se o arquivo existir, mostra o ícone; se não existir, ele some e fica só o texto
function iconeZap() {
    return '<img src="' + ICONE_WHATSAPP + '" class="icone-zap" alt="" onerror="this.style.display=\'none\'">';
}

// Uma linha da tabela de informacoes (usada na impressao da OS)
function linhaInfo(rotulo, valor) {
    return '<tr><th>' + rotulo + '</th><td>' + esc(valor) + '</td></tr>';
}

// Abre a janela de impressao com o topo da Stylus Cartuchos
function abrirImpressao(titulo, corpo) {
    const estilo =
        'body{font-family:Arial,sans-serif;padding:32px;color:#1f2635;' +
        '-webkit-print-color-adjust:exact;print-color-adjust:exact;}' +
        '.topo{border-bottom:4px solid #f8770d;padding-bottom:12px;margin-bottom:24px;}' +
        '.topo h1{font-size:28px;}' +
        '.topo h1 span{color:#f8770d;}' +
        '.topo p{font-size:13px;margin-top:4px;color:#4b5563;}' +
        'h2{margin-bottom:16px;}' +
        'p{margin-bottom:6px;}' +
        'table{width:100%;border-collapse:collapse;margin:20px 0;}' +
        'th{background:#1c1f38;color:#fff;text-align:left;padding:10px;}' +
        'td{padding:10px;border-bottom:1px solid #ddd;}' +
        '.info th{width:190px;background:#f3f3f3;color:#1f2635;border-bottom:1px solid #ddd;}' +
        '.total{text-align:right;font-size:18px;}' +
        '.icone-zap{width:16px;height:16px;vertical-align:middle;margin-right:5px;}' +
        '.garantia{border:1px solid #ddd;border-left:4px solid #f8770d;padding:12px 16px;margin:16px 0;font-size:14px;line-height:1.5;}' +
        '.garantia h3{font-size:15px;margin-bottom:6px;}' +
        '.assinaturas{display:flex;gap:48px;margin-top:80px;}' +
        '.assinaturas div{flex:1;border-top:1px solid #1f2635;text-align:center;padding-top:6px;font-size:14px;}';

    const topo =
        '<div class="topo">' +
        '<h1>Stylus <span>Cartuchos</span></h1>' +
        (EMPRESA.cnpj ? '<p>CNPJ: ' + esc(EMPRESA.cnpj) + '</p>' : '') +
        '<p>' + esc(EMPRESA.endereco) + '</p>' +
        '<p>' + iconeZap() + 'WhatsApp: ' + esc(EMPRESA.telefone) + '</p>' +
        '</div>';

    const html =
        '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">' +
        '<title>' + esc(titulo) + '</title>' +
        '<style>' + estilo + '</style></head><body>' +
        topo + corpo +
        '</body></html>';

    const janela = window.open('', '_blank');

    if (!janela) {
        alert('O navegador bloqueou a janela. Libere os pop-ups deste site para imprimir.');
        return;
    }

    janela.document.write(html);
    janela.document.close();
    janela.focus();

    setTimeout(function () {
        janela.print();
    }, 300);
}


// ===== MENU =====

const botoes = document.querySelectorAll('.menu-lateral button');
const telas = document.querySelectorAll('.tela');

function mostrarTela(nome) {
    telas.forEach(function (tela) {
        tela.classList.remove('ativa');
    });

    botoes.forEach(function (botao) {
        botao.classList.remove('ativo');
    });

    document.getElementById('tela-' + nome).classList.add('ativa');
    document.querySelector('.menu-lateral button[data-tela="' + nome + '"]').classList.add('ativo');
}

botoes.forEach(function (botao) {
    botao.addEventListener('click', function () {
        mostrarTela(botao.dataset.tela);
    });
});


// ===== DADOS GUARDADOS NO NAVEGADOR =====

let produtos = carregar('produtos');
let clientes = carregar('clientes');
let vendas = carregar('vendas');
let orcamentos = carregar('orcamentos');
let ordens = carregar('ordens');

function salvarProdutos() {
    localStorage.setItem('produtos', JSON.stringify(produtos));
}

function salvarClientes() {
    localStorage.setItem('clientes', JSON.stringify(clientes));
}

function salvarVendas() {
    localStorage.setItem('vendas', JSON.stringify(vendas));
}

function salvarOrcamentos() {
    localStorage.setItem('orcamentos', JSON.stringify(orcamentos));
}

function salvarOrdens() {
    localStorage.setItem('ordens', JSON.stringify(ordens));
}


// ===== PRODUTOS =====

let idEditando = null;

const formProduto = document.getElementById('form-produto');
const tabelaProdutos = document.querySelector('#tabela-produtos tbody');
const filtroProdutos = document.getElementById('produtos-filtro');
const buscaProduto = document.getElementById('busca-produto');

// Sempre que um produto muda, atualiza tudo que depende dele
function atualizarTudoProdutos() {
    salvarProdutos();
    mostrarProdutos();
    mostrarEstoque();
    atualizarSelectsProdutos();
}

function mostrarProdutos() {
    tabelaProdutos.innerHTML = '';

    if (produtos.length === 0) {
        tabelaProdutos.innerHTML = linhaVazia(5, 'Nenhum produto cadastrado');
        return;
    }

    // filter cria uma lista nova, entao a lista original nao muda de ordem
    const termo = buscaProduto.value.trim().toLowerCase();

    const lista = produtos.filter(function (produto) {
        const nomeCategoria = (nomesCategoria[produto.categoria] || produto.categoria).toLowerCase();

        const passaCategoria = filtroProdutos.value === 'todas' || produto.categoria === filtroProdutos.value;
        const passaBusca = produto.nome.toLowerCase().includes(termo) || nomeCategoria.includes(termo);

        return passaCategoria && passaBusca;
    });

    // Agrupa por categoria e, dentro dela, ordena pelo nome
    lista.sort(function (a, b) {
        if (a.categoria !== b.categoria) {
            const nomeA = nomesCategoria[a.categoria] || a.categoria;
            const nomeB = nomesCategoria[b.categoria] || b.categoria;
            return nomeA.localeCompare(nomeB, 'pt-BR');
        }

        return a.nome.localeCompare(b.nome, 'pt-BR');
    });

    if (lista.length === 0) {
        tabelaProdutos.innerHTML = linhaVazia(5, 'Nenhum produto nesta categoria');
        return;
    }

    lista.forEach(function (produto) {
        const linha = document.createElement('tr');

        linha.innerHTML =
            '<td>' + esc(produto.nome) + '</td>' +
            '<td>' + (nomesCategoria[produto.categoria] || esc(produto.categoria)) + '</td>' +
            '<td>' + moeda(produto.preco) + '</td>' +
            '<td>' + produto.estoque + '</td>';

        const celulaAcoes = document.createElement('td');

        const botaoEditar = document.createElement('button');
        botaoEditar.textContent = 'Editar';
        botaoEditar.className = 'btn-editar';
        botaoEditar.addEventListener('click', function () {
            editarProduto(produto.id);
        });

        const botaoExcluir = document.createElement('button');
        botaoExcluir.textContent = 'Excluir';
        botaoExcluir.className = 'btn-excluir';
        botaoExcluir.addEventListener('click', function () {
            excluirProduto(produto.id);
        });

        celulaAcoes.appendChild(botaoEditar);
        celulaAcoes.appendChild(botaoExcluir);
        linha.appendChild(celulaAcoes);

        tabelaProdutos.appendChild(linha);
    });
}

function editarProduto(id) {
    const produto = produtos.find(function (item) {
        return item.id === id;
    });

    document.getElementById('produto-nome').value = produto.nome;
    document.getElementById('produto-categoria').value = produto.categoria;
    document.getElementById('produto-preco').value = produto.preco;
    document.getElementById('produto-estoque').value = produto.estoque;

    idEditando = id;
    formProduto.scrollIntoView({ behavior: 'smooth' });
}

function excluirProduto(id) {
    const confirmou = confirm('Deseja excluir este produto?');

    if (!confirmou) {
        return;
    }

    produtos = produtos.filter(function (produto) {
        return produto.id !== id;
    });

    if (idEditando === id) {
        idEditando = null;
        formProduto.reset();
    }

    atualizarTudoProdutos();
}

formProduto.addEventListener('submit', function (evento) {
    evento.preventDefault();

    const dados = {
        nome: document.getElementById('produto-nome').value.trim(),
        categoria: document.getElementById('produto-categoria').value,
        preco: Number(document.getElementById('produto-preco').value),
        estoque: Number(document.getElementById('produto-estoque').value)
    };

    if (idEditando === null) {
        dados.id = Date.now();
        produtos.push(dados);
    } else {
        const produto = produtos.find(function (item) {
            return item.id === idEditando;
        });

        Object.assign(produto, dados);

        idEditando = null;
    }

    atualizarTudoProdutos();
    formProduto.reset();
});


filtroProdutos.addEventListener('change', mostrarProdutos);
buscaProduto.addEventListener('input', mostrarProdutos);


// ===== LISTAS DE PRODUTOS NOS FORMULÁRIOS (VENDAS E ORÇAMENTOS) =====

function atualizarSelectsProdutos() {
    ['venda-produto', 'orcamento-produto'].forEach(function (idSelect) {
        const select = document.getElementById(idSelect);
        const selecionado = select.value;

        select.innerHTML = '';

        if (produtos.length === 0) {
            const opcaoVazia = document.createElement('option');
            opcaoVazia.value = '';
            opcaoVazia.textContent = 'Cadastre um produto primeiro';
            select.appendChild(opcaoVazia);
            return;
        }

        // No orçamento, a lista é filtrada pela categoria escolhida
        const categoria = idSelect === 'orcamento-produto'
            ? document.getElementById('orcamento-categoria').value
            : 'todas';

        // No orçamento, a lista também é filtrada pelo texto digitado na busca
        const termo = idSelect === 'orcamento-produto'
            ? document.getElementById('orcamento-busca-produto').value.trim().toLowerCase()
            : '';

        const lista = produtos.filter(function (produto) {
            return (categoria === 'todas' || produto.categoria === categoria) &&
                produto.nome.toLowerCase().includes(termo);
        });

        if (lista.length === 0) {
            const opcaoVazia = document.createElement('option');
            opcaoVazia.value = '';
            opcaoVazia.textContent = 'Nenhum produto encontrado';
            select.appendChild(opcaoVazia);
            return;
        }

        lista.forEach(function (produto) {
            const opcao = document.createElement('option');
            opcao.value = produto.id;
            opcao.textContent = produto.nome + ' - ' + moeda(produto.preco) + ' (estoque: ' + produto.estoque + ')';
            select.appendChild(opcao);
        });

        if (selecionado) {
            select.value = selecionado;
            if (select.selectedIndex === -1) {
                select.selectedIndex = 0;
            }
        }
    });
}


// ===== ESTOQUE =====

const ESTOQUE_BAIXO = 5;

const tabelaEstoque = document.querySelector('#tabela-estoque tbody');
const filtroEstoque = document.getElementById('estoque-filtro');

function situacaoEstoque(quantidade) {
    if (quantidade === 0) {
        return { texto: 'Esgotado', classe: 'tag-zero' };
    }
    if (quantidade <= ESTOQUE_BAIXO) {
        return { texto: 'Estoque baixo', classe: 'tag-baixo' };
    }
    return { texto: 'Normal', classe: 'tag-ok' };
}

function mostrarEstoque() {
    let baixos = 0;
    let zerados = 0;

    produtos.forEach(function (produto) {
        if (produto.estoque === 0) {
            zerados++;
        } else if (produto.estoque <= ESTOQUE_BAIXO) {
            baixos++;
        }
    });

    document.getElementById('estoque-total').textContent = produtos.length;
    document.getElementById('estoque-baixo').textContent = baixos;
    document.getElementById('estoque-zerado').textContent = zerados;

    const filtro = filtroEstoque.value;

    const lista = produtos.filter(function (produto) {
        if (filtro === 'baixo') {
            return produto.estoque > 0 && produto.estoque <= ESTOQUE_BAIXO;
        }
        if (filtro === 'zerado') {
            return produto.estoque === 0;
        }
        return true;
    });

    tabelaEstoque.innerHTML = '';

    if (lista.length === 0) {
        tabelaEstoque.innerHTML = linhaVazia(5, 'Nenhum produto encontrado');
        return;
    }

    lista.forEach(function (produto) {
        const situacao = situacaoEstoque(produto.estoque);
        const linha = document.createElement('tr');

        linha.innerHTML =
            '<td>' + esc(produto.nome) + '</td>' +
            '<td>' + (nomesCategoria[produto.categoria] || esc(produto.categoria)) + '</td>' +
            '<td>' + produto.estoque + '</td>' +
            '<td><span class="tag ' + situacao.classe + '">' + situacao.texto + '</span></td>';

        const celulaAcoes = document.createElement('td');

        const botaoRepor = document.createElement('button');
        botaoRepor.textContent = 'Dar entrada';
        botaoRepor.className = 'btn-ok';
        botaoRepor.addEventListener('click', function () {
            reporEstoque(produto.id);
        });

        const botaoAjustar = document.createElement('button');
        botaoAjustar.textContent = 'Ajustar';
        botaoAjustar.className = 'btn-editar';
        botaoAjustar.addEventListener('click', function () {
            ajustarEstoque(produto.id);
        });

        celulaAcoes.appendChild(botaoRepor);
        celulaAcoes.appendChild(botaoAjustar);
        linha.appendChild(celulaAcoes);

        tabelaEstoque.appendChild(linha);
    });
}

function reporEstoque(id) {
    const produto = produtos.find(function (item) {
        return item.id === id;
    });

    const resposta = prompt('Quantas unidades de "' + produto.nome + '" entraram no estoque?', '1');

    if (resposta === null) {
        return;
    }

    const quantidade = parseInt(resposta, 10);

    if (isNaN(quantidade) || quantidade < 1) {
        alert('Digite um número maior que zero.');
        return;
    }

    produto.estoque += quantidade;
    atualizarTudoProdutos();
}

function ajustarEstoque(id) {
    const produto = produtos.find(function (item) {
        return item.id === id;
    });

    const resposta = prompt('Nova quantidade em estoque de "' + produto.nome + '":', produto.estoque);

    if (resposta === null) {
        return;
    }

    const quantidade = parseInt(resposta, 10);

    if (isNaN(quantidade) || quantidade < 0) {
        alert('Digite um número válido (zero ou mais).');
        return;
    }

    produto.estoque = quantidade;
    atualizarTudoProdutos();
}

filtroEstoque.addEventListener('change', mostrarEstoque);


// ===== CLIENTES =====

let idEditandoCliente = null;

const formCliente = document.getElementById('form-cliente');
const tabelaClientes = document.querySelector('#tabela-clientes tbody');
const buscaCliente = document.getElementById('busca-cliente');

aplicarMascaras('cliente-cpf', 'cliente-telefone', 'cliente-cnpj');

function atualizarListaClientes() {
    const lista = document.getElementById('lista-clientes');
    lista.innerHTML = '';

    clientes.forEach(function (cliente) {
        const opcao = document.createElement('option');
        opcao.value = cliente.nome;
        lista.appendChild(opcao);
    });
}

function mostrarClientes() {
    const termo = buscaCliente.value.trim().toLowerCase();

    const filtrados = clientes.filter(function (cliente) {
        return cliente.nome.toLowerCase().includes(termo) ||
            (cliente.cpf || '').includes(termo) ||
            (cliente.cnpj || '').includes(termo) ||
            (cliente.telefone || '').includes(termo);
    });

    filtrados.sort(function (a, b) {
        return a.nome.localeCompare(b.nome, 'pt-BR');
    });

    tabelaClientes.innerHTML = '';

    if (filtrados.length === 0) {
        tabelaClientes.innerHTML = linhaVazia(6, 'Nenhum cliente encontrado');
        return;
    }

    filtrados.forEach(function (cliente) {
        const linha = document.createElement('tr');

        linha.innerHTML =
            '<td>' + esc(cliente.nome) + '</td>' +
            '<td>' + esc(cliente.cpf) + '</td>' +
            '<td>' + esc(cliente.cnpj) + '</td>' +
            '<td>' + esc(cliente.telefone) + '</td>' +
            '<td>' + esc(cliente.email) + '</td>';

        const celulaAcoes = document.createElement('td');

        const botaoEditar = document.createElement('button');
        botaoEditar.textContent = 'Editar';
        botaoEditar.className = 'btn-editar';
        botaoEditar.addEventListener('click', function () {
            editarCliente(cliente.id);
        });

        const botaoExcluir = document.createElement('button');
        botaoExcluir.textContent = 'Excluir';
        botaoExcluir.className = 'btn-excluir';
        botaoExcluir.addEventListener('click', function () {
            excluirCliente(cliente.id);
        });

        celulaAcoes.appendChild(botaoEditar);
        celulaAcoes.appendChild(botaoExcluir);
        linha.appendChild(celulaAcoes);

        tabelaClientes.appendChild(linha);
    });
}

function editarCliente(id) {
    const cliente = clientes.find(function (item) {
        return item.id === id;
    });

    document.getElementById('cliente-nome').value = cliente.nome;
    document.getElementById('cliente-cpf').value = cliente.cpf || '';
    document.getElementById('cliente-cnpj').value = cliente.cnpj || '';
    document.getElementById('cliente-telefone').value = cliente.telefone || '';
    document.getElementById('cliente-email').value = cliente.email || '';
    document.getElementById('cliente-endereco').value = cliente.endereco || '';
    document.getElementById('cliente-obs').value = cliente.obs || '';

    idEditandoCliente = id;
    formCliente.scrollIntoView({ behavior: 'smooth' });
}

function excluirCliente(id) {
    const confirmou = confirm('Deseja excluir este cliente?');

    if (!confirmou) {
        return;
    }

    clientes = clientes.filter(function (cliente) {
        return cliente.id !== id;
    });

    if (idEditandoCliente === id) {
        idEditandoCliente = null;
        formCliente.reset();
    }

    salvarClientes();
    mostrarClientes();
    atualizarListaClientes();
}

formCliente.addEventListener('submit', function (evento) {
    evento.preventDefault();

    const dados = {
        nome: document.getElementById('cliente-nome').value.trim(),
        cpf: document.getElementById('cliente-cpf').value,
        cnpj: document.getElementById('cliente-cnpj').value,
        telefone: document.getElementById('cliente-telefone').value,
        email: document.getElementById('cliente-email').value.trim(),
        endereco: document.getElementById('cliente-endereco').value.trim(),
        obs: document.getElementById('cliente-obs').value.trim()
    };

    if (idEditandoCliente === null) {
        dados.id = Date.now();
        clientes.push(dados);
    } else {
        const cliente = clientes.find(function (item) {
            return item.id === idEditandoCliente;
        });

        Object.assign(cliente, dados);

        idEditandoCliente = null;
    }

    salvarClientes();
    mostrarClientes();
    atualizarListaClientes();
    formCliente.reset();
});

buscaCliente.addEventListener('input', mostrarClientes);

// Cadastra o cliente automaticamente (usado ao salvar uma ordem de serviço)
function registrarClienteSeNovo(nome, cpf, telefone) {
    const nomeLimpo = nome.trim().toLowerCase();

    const jaExiste = clientes.some(function (cliente) {
        return (cpf && cliente.cpf === cpf) || cliente.nome.trim().toLowerCase() === nomeLimpo;
    });

    if (jaExiste) {
        return;
    }

    clientes.push({
        id: Date.now(),
        nome: nome.trim(),
        cpf: cpf,
        cnpj: '',
        telefone: telefone,
        email: '',
        endereco: '',
        obs: ''
    });

    salvarClientes();
    mostrarClientes();
    atualizarListaClientes();
}


// Procura um cliente cadastrado pelo nome
function acharCliente(nome) {
    const alvo = nome.trim().toLowerCase();

    return clientes.find(function (cliente) {
        return cliente.nome.trim().toLowerCase() === alvo;
    });
}

// Monta as linhas com os dados do cliente para a impressao
function dadosDoCliente(nome) {
    const cliente = acharCliente(nome);
    let html = '<p><strong>Cliente:</strong> ' + esc(nome) + '</p>';

    if (cliente) {
        if (cliente.cnpj) {
            html += '<p><strong>CNPJ:</strong> ' + esc(cliente.cnpj) + '</p>';
        }
        if (cliente.cpf) {
            html += '<p><strong>CPF:</strong> ' + esc(cliente.cpf) + '</p>';
        }
        if (cliente.telefone) {
            html += '<p>' + iconeZap() + '<strong>Telefone/WhatsApp:</strong> ' + esc(cliente.telefone) + '</p>';
        }
    }

    return html;
}


// ===== CARRINHO (USADO EM VENDAS E ORÇAMENTOS) =====

function criarCarrinho(config) {
    const carrinho = { itens: [] };

    const selectProduto = document.getElementById(config.selectProduto);
    const inputQtd = document.getElementById(config.inputQtd);
    const botaoAdicionar = document.getElementById(config.botaoAdicionar);
    const inputDesconto = document.getElementById(config.inputDesconto);
    const corpoTabela = document.querySelector('#' + config.tabela + ' tbody');
    const campoTotal = document.getElementById(config.total);

    // Campos extras da peça (só existem no orçamento)
    const inputProdModelo = config.produtoModelo ? document.getElementById(config.produtoModelo) : null;
    const inputProdDetalhes = config.produtoDetalhes ? document.getElementById(config.produtoDetalhes) : null;
    const inputProdPreco = config.produtoPreco ? document.getElementById(config.produtoPreco) : null;

    // Tabela separada para os serviços (só existe no orçamento)
    const corpoServicos = config.tabelaServicos
        ? document.querySelector('#' + config.tabelaServicos + ' tbody')
        : null;

    carrinho.subtotal = function () {
        let soma = 0;

        carrinho.itens.forEach(function (item) {
            soma += item.preco * item.qtd;
        });

        return arredondar(soma);
    };

    carrinho.desconto = function () {
        const valor = Number(inputDesconto.value) || 0;
        return Math.min(Math.max(valor, 0), carrinho.subtotal());
    };

    carrinho.total = function () {
        return arredondar(carrinho.subtotal() - carrinho.desconto());
    };

    carrinho.renderizar = function () {
        corpoTabela.innerHTML = '';

        if (corpoServicos) {
            corpoServicos.innerHTML = '';
        }

        let qtdProdutos = 0;
        let qtdServicos = 0;

        carrinho.itens.forEach(function (item, posicao) {
            // Serviço vai para a tabela de serviços (se ela existir)
            const ehServico = item.tipo === 'servico' && corpoServicos;
            const linha = document.createElement('tr');

            if (ehServico) {
                qtdServicos++;

                const aparelho = item.modelo
                    ? (nomesTipo[item.aparelho] || item.aparelho) + ' ' + item.modelo
                    : '-';

                linha.innerHTML =
                    '<td>' + esc(item.servico || item.nome) + '</td>' +
                    '<td>' + esc(aparelho) + '</td>' +
                    '<td>' + esc(item.detalhes || '-') + '</td>' +
                    '<td>' + moeda(item.preco) + '</td>';
            } else {
                qtdProdutos++;

                if (corpoServicos) {
                    // Orçamento: a peça aparece com todos os detalhes
                    linha.innerHTML =
                        '<td>' + esc(item.nome) + '</td>' +
                        '<td>' + (nomesCategoria[item.categoria] || '-') + '</td>' +
                        '<td>' + esc(item.modelo || '-') + '</td>' +
                        '<td>' + esc(item.detalhes || '-') + '</td>' +
                        '<td>' + item.qtd + '</td>' +
                        '<td>' + moeda(item.preco) + '</td>' +
                        '<td>' + moeda(item.preco * item.qtd) + '</td>';
                } else {
                    linha.innerHTML =
                        '<td>' + esc(item.nome) + '</td>' +
                        '<td>' + item.qtd + '</td>' +
                        '<td>' + moeda(item.preco) + '</td>' +
                        '<td>' + moeda(item.preco * item.qtd) + '</td>';
                }
            }

            const celula = document.createElement('td');

            const botaoRemover = document.createElement('button');
            botaoRemover.type = 'button';
            botaoRemover.textContent = 'Remover';
            botaoRemover.className = 'btn-excluir';
            botaoRemover.addEventListener('click', function () {
                carrinho.itens.splice(posicao, 1);
                carrinho.renderizar();
            });

            celula.appendChild(botaoRemover);
            linha.appendChild(celula);

            (ehServico ? corpoServicos : corpoTabela).appendChild(linha);
        });

        if (qtdProdutos === 0) {
            corpoTabela.innerHTML = linhaVazia(
                corpoServicos ? 8 : 5,
                corpoServicos ? 'Nenhum produto adicionado' : 'Nenhum item adicionado'
            );
        }

        if (corpoServicos && qtdServicos === 0) {
            corpoServicos.innerHTML = linhaVazia(5, 'Nenhum serviço adicionado');
        }

        campoTotal.textContent = moeda(carrinho.total());
    };

    carrinho.limpar = function () {
        carrinho.itens = [];
        carrinho.renderizar();
    };

    carrinho.definir = function (itens, desconto) {
        carrinho.itens = JSON.parse(JSON.stringify(itens));
        inputDesconto.value = desconto || 0;
        carrinho.renderizar();
    };

    botaoAdicionar.addEventListener('click', function () {
        const produto = produtos.find(function (item) {
            return item.id === Number(selectProduto.value);
        });

        const quantidade = parseInt(inputQtd.value, 10);

        if (!produto) {
            alert('Selecione um produto.');
            return;
        }

        if (isNaN(quantidade) || quantidade < 1) {
            alert('Informe uma quantidade válida.');
            return;
        }

        // Campos extras (só no orçamento). Na venda, ficam vazios e o preço é o do cadastro.
        const modelo = inputProdModelo ? inputProdModelo.value.trim() : '';
        const detalhes = inputProdDetalhes ? inputProdDetalhes.value.trim() : '';
        let preco = produto.preco;

        if (inputProdPreco) {
            preco = Number(inputProdPreco.value);

            if (inputProdPreco.value === '' || isNaN(preco) || preco < 0) {
                alert('Informe o preço unitário.');
                return;
            }
        }

        // Só junta na mesma linha se for a mesma peça, com o mesmo modelo, detalhes e preço
        const existente = carrinho.itens.find(function (item) {
            return item.produtoId === produto.id &&
                (item.modelo || '') === modelo &&
                (item.detalhes || '') === detalhes &&
                item.preco === preco;
        });

        const quantidadeTotal = quantidade + (existente ? existente.qtd : 0);

        if (config.validarEstoque && quantidadeTotal > produto.estoque) {
            alert('Estoque insuficiente. Disponível: ' + produto.estoque);
            return;
        }

        if (existente) {
            existente.qtd = quantidadeTotal;
        } else {
            carrinho.itens.push({
                produtoId: produto.id,
                nome: produto.nome,
                categoria: produto.categoria,
                modelo: modelo,
                detalhes: detalhes,
                preco: preco,
                qtd: quantidade
            });
        }

        // Limpa o que muda de uma peça para outra (a categoria fica)
        if (inputProdModelo) {
            inputProdModelo.value = '';
        }

        if (inputProdDetalhes) {
            inputProdDetalhes.value = '';
        }

        inputQtd.value = 1;
        carrinho.renderizar();
    });

    // Serviço (mão de obra): só existe no orçamento. Não tem estoque.
    if (config.botaoServico) {
        const selectTipo = document.getElementById(config.servicoTipo);
        const inputModelo = document.getElementById(config.servicoModelo);
        const selectNome = document.getElementById(config.servicoNome);
        const inputDetalhes = document.getElementById(config.servicoDetalhes);
        const inputValor = document.getElementById(config.servicoValor);

        document.getElementById(config.botaoServico).addEventListener('click', function () {
            const tipo = selectTipo.value;
            const modelo = inputModelo.value.trim();
            const nomeServico = selectNome.value;
            const detalhes = inputDetalhes.value.trim();
            const valor = Number(inputValor.value);

            if (!modelo) {
                alert('Informe o modelo do aparelho.');
                return;
            }

            if (nomeServico === 'Outro' && !detalhes) {
                alert('Em "Outro", descreva o serviço no campo Detalhes.');
                return;
            }

            if (isNaN(valor) || valor <= 0) {
                alert('Informe o valor do serviço.');
                return;
            }

            carrinho.itens.push({
                tipo: 'servico',
                produtoId: null,
                aparelho: tipo,
                modelo: modelo,
                servico: nomeServico,
                detalhes: detalhes,
                nome: 'Serviço: ' + nomeServico + ' - ' + (nomesTipo[tipo] || tipo) + ' ' + modelo,
                preco: valor,
                qtd: 1
            });

            // Limpa o que muda de um serviço para outro (o tipo de aparelho fica)
            inputModelo.value = '';
            inputDetalhes.value = '';
            inputValor.value = '';
            carrinho.renderizar();
        });
    }

    inputDesconto.addEventListener('input', carrinho.renderizar);

    return carrinho;
}


// ===== VENDAS =====

const formVenda = document.getElementById('form-venda');
const tabelaVendas = document.querySelector('#tabela-vendas tbody');
const tabelaCanceladas = document.querySelector('#tabela-canceladas tbody');

// Vendas que valem. As canceladas ficam guardadas, mas não entram nos totais nem no gráfico.
function vendasAtivas() {
    return vendas.filter(function (venda) {
        return !venda.cancelada;
    });
}

function vendasCanceladas() {
    return vendas.filter(function (venda) {
        return venda.cancelada;
    });
}

const carrinhoVenda = criarCarrinho({
    selectProduto: 'venda-produto',
    inputQtd: 'venda-qtd',
    botaoAdicionar: 'venda-add-item',
    inputDesconto: 'venda-desconto',
    tabela: 'tabela-venda-itens',
    total: 'venda-total',
    validarEstoque: true
});

function resumoItens(itens) {
    return itens.map(function (item) {
        return item.qtd + 'x ' + item.nome;
    }).join(', ');
}

// ===== GRÁFICO DE VENDAS POR MÊS =====

const nomesMes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const graficoVendas = document.getElementById('grafico-vendas');
const graficoMeses = document.getElementById('grafico-meses');
const graficoResumo = document.getElementById('grafico-resumo');
const graficoPeriodo = document.getElementById('grafico-periodo');

function mostrarGrafico() {
    const quantidade = Number(graficoPeriodo.value);
    const hoje = new Date();

    // Monta a lista dos últimos meses, do mais antigo até o mês atual
    const meses = [];

    for (let i = quantidade - 1; i >= 0; i--) {
        const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);

        meses.push({
            ano: data.getFullYear(),
            mes: data.getMonth(),
            total: 0
        });
    }

    // Soma cada venda no mês em que ela aconteceu (só as que não foram canceladas)
    vendasAtivas().forEach(function (venda) {
        const data = new Date(venda.data);

        const mes = meses.find(function (item) {
            return item.ano === data.getFullYear() && item.mes === data.getMonth();
        });

        if (mes) {
            mes.total += venda.total;
        }
    });

    let maior = 0;
    let soma = 0;
    let indiceMelhor = -1;

    meses.forEach(function (mes, posicao) {
        soma += mes.total;

        if (mes.total > maior) {
            maior = mes.total;
            indiceMelhor = posicao;
        }
    });

    graficoVendas.innerHTML = '';
    graficoMeses.innerHTML = '';

    if (maior === 0) {
        graficoVendas.innerHTML = '<p class="grafico-vazio">Nenhuma venda neste período</p>';
        graficoResumo.textContent = '';
        return;
    }

    meses.forEach(function (mes, posicao) {
        const rotulo = nomesMes[mes.mes] + '/' + String(mes.ano).slice(2);
        const altura = mes.total > 0 ? Math.max(4, Math.round(mes.total / maior * 170)) : 0;

        // Verde se vendeu mais que o mês anterior, vermelho se vendeu menos
        let classe = '';

        if (posicao > 0) {
            if (mes.total > meses[posicao - 1].total) {
                classe = 'barra-subiu';
            } else if (mes.total < meses[posicao - 1].total) {
                classe = 'barra-caiu';
            }
        }

        const numero = Math.round(mes.total).toLocaleString('pt-BR');

        const coluna = document.createElement('div');
        coluna.className = 'coluna';
        coluna.title = rotulo + ': ' + moeda(arredondar(mes.total));
        coluna.innerHTML =
            '<span class="valor">' + (posicao === indiceMelhor ? '★ ' : '') + numero + '</span>' +
            '<div class="barra ' + classe + '" style="height:' + altura + 'px"></div>';
        graficoVendas.appendChild(coluna);

        const nomeMes = document.createElement('span');
        nomeMes.textContent = rotulo;

        if (posicao === indiceMelhor) {
            nomeMes.className = 'mes-destaque';
        }

        graficoMeses.appendChild(nomeMes);
    });

    const melhor = meses[indiceMelhor];

    graficoResumo.textContent =
        'Melhor mês: ' + nomesMes[melhor.mes] + '/' + String(melhor.ano).slice(2) +
        ' (' + moeda(arredondar(melhor.total)) + ')  |  Total no período: ' + moeda(arredondar(soma)) +
        '  |  Média por mês: ' + moeda(arredondar(soma / quantidade)) +
        '  |  Valores do gráfico em R$';
}

graficoPeriodo.addEventListener('change', mostrarGrafico);

function mostrarResumoVendas() {
    const hoje = new Date().toLocaleDateString('pt-BR');

    let quantidadeHoje = 0;
    let totalHoje = 0;
    let totalGeral = 0;

    vendasAtivas().forEach(function (venda) {
        totalGeral += venda.total;

        if (formatarDataISO(venda.data) === hoje) {
            quantidadeHoje++;
            totalHoje += venda.total;
        }
    });

    document.getElementById('resumo-vendas-qtd').textContent = quantidadeHoje;
    document.getElementById('resumo-vendas-total').textContent = moeda(arredondar(totalHoje));
    document.getElementById('resumo-vendas-geral').textContent = moeda(arredondar(totalGeral));
}

function mostrarVendas() {
    tabelaVendas.innerHTML = '';

    mostrarResumoVendas();
    mostrarGrafico();
    mostrarCanceladas();

    const ativas = vendasAtivas();

    if (ativas.length === 0) {
        tabelaVendas.innerHTML = linhaVazia(6, 'Nenhuma venda registrada');
        return;
    }

    // Mostra as vendas mais recentes primeiro
    ativas.reverse().forEach(function (venda) {
        const linha = document.createElement('tr');

        linha.innerHTML =
            '<td>' + formatarDataHora(venda.data) + '</td>' +
            '<td>' + esc(venda.cliente || 'Consumidor final') + '</td>' +
            '<td>' + esc(resumoItens(venda.itens)) + '</td>' +
            '<td>' + (nomesPagamento[venda.pagamento] || esc(venda.pagamento)) + '</td>' +
            '<td>' + moeda(venda.total) + '</td>';

        const celulaAcoes = document.createElement('td');

        const botaoImprimir = document.createElement('button');
        botaoImprimir.textContent = 'Imprimir';
        botaoImprimir.className = 'btn-editar';
        botaoImprimir.addEventListener('click', function () {
            imprimirVenda(venda.id);
        });

        const botaoCancelar = document.createElement('button');
        botaoCancelar.textContent = 'Cancelar venda';
        botaoCancelar.className = 'btn-excluir';
        botaoCancelar.addEventListener('click', function () {
            cancelarVenda(venda.id);
        });

        celulaAcoes.appendChild(botaoImprimir);
        celulaAcoes.appendChild(botaoCancelar);
        linha.appendChild(celulaAcoes);

        tabelaVendas.appendChild(linha);
    });
}

function imprimirVenda(id) {
    const venda = vendas.find(function (item) {
        return item.id === id;
    });

    let linhas = '';

    venda.itens.forEach(function (item) {
        linhas +=
            '<tr>' +
            '<td>' + esc(item.nome) + '</td>' +
            '<td>' + item.qtd + '</td>' +
            '<td>' + moeda(item.preco) + '</td>' +
            '<td>' + moeda(item.preco * item.qtd) + '</td>' +
            '</tr>';
    });

    let corpo =
        '<h2>Comprovante de venda</h2>' +
        dadosDoCliente(venda.cliente || 'Consumidor final') +
        '<p><strong>Data:</strong> ' + formatarDataHora(venda.data) + '</p>' +
        '<p><strong>Pagamento:</strong> ' + (nomesPagamento[venda.pagamento] || esc(venda.pagamento)) + '</p>' +
        '<table><thead><tr><th>Produto</th><th>Qtd</th><th>Preço</th><th>Subtotal</th></tr></thead>' +
        '<tbody>' + linhas + '</tbody></table>';

    if (venda.desconto > 0) {
        corpo += '<p class="total">Desconto: ' + moeda(venda.desconto) + '</p>';
    }

    corpo += '<p class="total"><strong>Total: ' + moeda(venda.total) + '</strong></p>';

    abrirImpressao('Venda', corpo);
}

function cancelarVenda(id) {
    const confirmou = confirm(
        'Deseja cancelar esta venda?\n\nOs produtos voltam para o estoque e a venda sai dos totais e do gráfico. ' +
        'Ela fica guardada em "Vendas canceladas".'
    );

    if (!confirmou) {
        return;
    }

    const motivo = prompt('Motivo do cancelamento (pode deixar em branco):', '');

    // Se clicou em "Cancelar" na caixa do motivo, desiste de cancelar a venda
    if (motivo === null) {
        return;
    }

    const venda = vendas.find(function (item) {
        return item.id === id;
    });

    // Devolve os produtos para o estoque
    venda.itens.forEach(function (item) {
        // Serviço não tem estoque
        if (item.tipo === 'servico') {
            return;
        }

        const produto = produtos.find(function (p) {
            return p.id === item.produtoId;
        });

        if (produto) {
            produto.estoque += item.qtd;
        }
    });

    // Se a venda veio de uma ordem de serviço, a ordem volta a poder ser lançada
    if (venda.ordemId) {
        const ordemDaVenda = ordens.find(function (ordem) {
            return ordem.id === venda.ordemId;
        });

        if (ordemDaVenda) {
            delete ordemDaVenda.vendaId;
            salvarOrdens();
            mostrarOrdens();
        }
    }

    // Se a venda veio de um orçamento, o orçamento volta a ficar "Aprovado"
    if (venda.orcamentoId) {
        const orcamentoDaVenda = orcamentos.find(function (orcamento) {
            return orcamento.id === venda.orcamentoId;
        });

        if (orcamentoDaVenda && orcamentoDaVenda.situacao === 'vendido') {
            orcamentoDaVenda.situacao = 'aprovado';
            salvarOrcamentos();
            mostrarOrcamentos();
        }
    }

    // Em vez de apagar, marca como cancelada
    venda.cancelada = true;
    venda.canceladaEm = new Date().toISOString();
    venda.motivo = motivo.trim();

    salvarVendas();
    atualizarTudoProdutos();
    mostrarVendas();
}

function mostrarCanceladas() {
    const lista = vendasCanceladas();

    let total = 0;

    lista.forEach(function (venda) {
        total += venda.total;
    });

    document.getElementById('resumo-canceladas-qtd').textContent = lista.length;
    document.getElementById('resumo-canceladas-total').textContent = moeda(arredondar(total));

    tabelaCanceladas.innerHTML = '';

    if (lista.length === 0) {
        tabelaCanceladas.innerHTML = linhaVazia(7, 'Nenhuma venda cancelada');
        return;
    }

    // As canceladas mais recentes primeiro
    lista.sort(function (a, b) {
        return new Date(b.canceladaEm) - new Date(a.canceladaEm);
    });

    lista.forEach(function (venda) {
        const linha = document.createElement('tr');

        linha.innerHTML =
            '<td>' + formatarDataHora(venda.canceladaEm) + '</td>' +
            '<td>' + formatarDataHora(venda.data) + '</td>' +
            '<td>' + esc(venda.cliente || 'Consumidor final') + '</td>' +
            '<td>' + esc(resumoItens(venda.itens)) + '</td>' +
            '<td>' + (nomesPagamento[venda.pagamento] || esc(venda.pagamento)) + '</td>' +
            '<td>' + moeda(venda.total) + '</td>' +
            '<td>' + (esc(venda.motivo) || '-') + '</td>';

        tabelaCanceladas.appendChild(linha);
    });
}

formVenda.addEventListener('submit', function (evento) {
    evento.preventDefault();

    if (carrinhoVenda.itens.length === 0) {
        alert('Adicione pelo menos um item à venda.');
        return;
    }

    // Confere o estoque de novo antes de finalizar
    for (let i = 0; i < carrinhoVenda.itens.length; i++) {
        const item = carrinhoVenda.itens[i];

        const produto = produtos.find(function (p) {
            return p.id === item.produtoId;
        });

        if (!produto) {
            alert('O produto "' + item.nome + '" não existe mais. Remova-o da venda.');
            return;
        }

        if (produto.estoque < item.qtd) {
            alert('Estoque insuficiente para "' + item.nome + '". Disponível: ' + produto.estoque);
            return;
        }
    }

    // Dá baixa no estoque
    carrinhoVenda.itens.forEach(function (item) {
        const produto = produtos.find(function (p) {
            return p.id === item.produtoId;
        });

        produto.estoque -= item.qtd;
    });

    vendas.push({
        id: Date.now(),
        data: new Date().toISOString(),
        cliente: document.getElementById('venda-cliente').value.trim(),
        pagamento: document.getElementById('venda-pagamento').value,
        itens: JSON.parse(JSON.stringify(carrinhoVenda.itens)),
        desconto: carrinhoVenda.desconto(),
        total: carrinhoVenda.total()
    });

    salvarVendas();
    atualizarTudoProdutos();
    mostrarVendas();

    formVenda.reset();
    carrinhoVenda.limpar();
});


// ===== ORÇAMENTOS =====

let idEditandoOrcamento = null;

const formOrcamento = document.getElementById('form-orcamento');
const tabelaOrcamentos = document.querySelector('#tabela-orcamentos tbody');

const carrinhoOrcamento = criarCarrinho({
    selectProduto: 'orcamento-produto',
    inputQtd: 'orcamento-qtd',
    botaoAdicionar: 'orcamento-add-item',
    inputDesconto: 'orcamento-desconto',
    tabela: 'tabela-orcamento-produtos',
    tabelaServicos: 'tabela-orcamento-servicos',
    produtoModelo: 'orcamento-produto-modelo',
    produtoDetalhes: 'orcamento-produto-detalhes',
    produtoPreco: 'orcamento-produto-preco',
    total: 'orcamento-total',
    validarEstoque: false,
    servicoTipo: 'orcamento-servico-tipo',
    servicoModelo: 'orcamento-servico-modelo',
    servicoNome: 'orcamento-servico-nome',
    servicoDetalhes: 'orcamento-servico-detalhes',
    servicoValor: 'orcamento-servico-valor',
    botaoServico: 'orcamento-add-servico'
});

const nomesSituacaoOrcamento = {
    pendente: 'Pendente',
    aprovado: 'Aprovado',
    recusado: 'Recusado',
    vendido: 'Vendido'
};

function mostrarOrcamentos() {
    tabelaOrcamentos.innerHTML = '';

    if (orcamentos.length === 0) {
        tabelaOrcamentos.innerHTML = linhaVazia(7, 'Nenhum orçamento cadastrado');
        return;
    }

    orcamentos.slice().reverse().forEach(function (orcamento) {
        const linha = document.createElement('tr');

        linha.innerHTML =
            '<td>' + orcamento.numero + '</td>' +
            '<td>' + esc(orcamento.cliente) + '</td>' +
            '<td>' + formatarDataISO(orcamento.data) + '</td>' +
            '<td>' + somarDias(orcamento.data, orcamento.validade) + '</td>' +
            '<td>' + moeda(orcamento.total) + '</td>';

        // Situação
        const celulaSituacao = document.createElement('td');

        if (orcamento.situacao === 'vendido') {
            celulaSituacao.innerHTML = '<span class="tag tag-ok">Vendido</span>';
        } else {
            const select = document.createElement('select');

            ['pendente', 'aprovado', 'recusado'].forEach(function (chave) {
                const opcao = document.createElement('option');
                opcao.value = chave;
                opcao.textContent = nomesSituacaoOrcamento[chave];
                select.appendChild(opcao);
            });

            select.value = orcamento.situacao;
            select.addEventListener('change', function () {
                orcamento.situacao = select.value;
                salvarOrcamentos();
                mostrarOrcamentos();
            });

            celulaSituacao.appendChild(select);
        }

        linha.appendChild(celulaSituacao);

        // Ações
        const celulaAcoes = document.createElement('td');

        const botaoImprimir = document.createElement('button');
        botaoImprimir.textContent = 'Imprimir';
        botaoImprimir.className = 'btn-editar';
        botaoImprimir.addEventListener('click', function () {
            imprimirOrcamento(orcamento.id);
        });
        celulaAcoes.appendChild(botaoImprimir);

        if (orcamento.situacao !== 'vendido') {
            const botaoEditar = document.createElement('button');
            botaoEditar.textContent = 'Editar';
            botaoEditar.className = 'btn-editar';
            botaoEditar.addEventListener('click', function () {
                editarOrcamento(orcamento.id);
            });
            celulaAcoes.appendChild(botaoEditar);

            if (orcamento.situacao !== 'recusado') {
                const botaoVenda = document.createElement('button');
                botaoVenda.textContent = 'Virar venda';
                botaoVenda.className = 'btn-ok';
                botaoVenda.addEventListener('click', function () {
                    virarVenda(orcamento.id);
                });
                celulaAcoes.appendChild(botaoVenda);

                // Só aparece se o orçamento tem algum serviço
                const temServico = orcamento.itens.some(function (item) {
                    return item.tipo === 'servico';
                });

                if (temServico) {
                    const botaoServico = document.createElement('button');
                    botaoServico.textContent = 'Criar serviço';
                    botaoServico.className = 'btn-ok';
                    botaoServico.addEventListener('click', function () {
                        criarServicoDoOrcamento(orcamento.id);
                    });
                    celulaAcoes.appendChild(botaoServico);
                }
            }
        }

        const botaoExcluir = document.createElement('button');
        botaoExcluir.textContent = 'Excluir';
        botaoExcluir.className = 'btn-excluir';
        botaoExcluir.addEventListener('click', function () {
            excluirOrcamento(orcamento.id);
        });
        celulaAcoes.appendChild(botaoExcluir);

        linha.appendChild(celulaAcoes);
        tabelaOrcamentos.appendChild(linha);
    });
}

function editarOrcamento(id) {
    const orcamento = orcamentos.find(function (item) {
        return item.id === id;
    });

    document.getElementById('orcamento-cliente').value = orcamento.cliente;
    document.getElementById('orcamento-validade').value = orcamento.validade;
    document.getElementById('orcamento-obs').value = orcamento.observacoes || '';

    carrinhoOrcamento.definir(orcamento.itens, orcamento.desconto);

    idEditandoOrcamento = id;
    formOrcamento.scrollIntoView({ behavior: 'smooth' });
}

function excluirOrcamento(id) {
    const confirmou = confirm('Deseja excluir este orçamento?');

    if (!confirmou) {
        return;
    }

    orcamentos = orcamentos.filter(function (orcamento) {
        return orcamento.id !== id;
    });

    if (idEditandoOrcamento === id) {
        idEditandoOrcamento = null;
        formOrcamento.reset();
        carrinhoOrcamento.limpar();
    }

    salvarOrcamentos();
    mostrarOrcamentos();
}

function virarVenda(id) {
    const orcamento = orcamentos.find(function (item) {
        return item.id === id;
    });

    const chave = perguntarPagamento('Forma de pagamento do orçamento Nº ' + orcamento.numero);

    if (!chave) {
        return;
    }

    // Confere o estoque
    for (let i = 0; i < orcamento.itens.length; i++) {
        const item = orcamento.itens[i];

        // Serviço não tem estoque para conferir
        if (item.tipo === 'servico') {
            continue;
        }

        const produto = produtos.find(function (p) {
            return p.id === item.produtoId;
        });

        if (!produto || produto.estoque < item.qtd) {
            alert('Estoque insuficiente para "' + item.nome + '". Não foi possível gerar a venda.');
            return;
        }
    }

    // Dá baixa no estoque
    orcamento.itens.forEach(function (item) {
        if (item.tipo === 'servico') {
            return;
        }

        const produto = produtos.find(function (p) {
            return p.id === item.produtoId;
        });

        produto.estoque -= item.qtd;
    });

    vendas.push({
        id: Date.now(),
        data: new Date().toISOString(),
        cliente: orcamento.cliente,
        pagamento: chave,
        itens: JSON.parse(JSON.stringify(orcamento.itens)),
        desconto: orcamento.desconto,
        total: orcamento.total,
        orcamentoId: orcamento.id
    });

    orcamento.situacao = 'vendido';

    salvarVendas();
    salvarOrcamentos();
    atualizarTudoProdutos();
    mostrarVendas();
    mostrarOrcamentos();

    alert('Venda registrada com sucesso!');
}

function imprimirOrcamento(id) {
    const orcamento = orcamentos.find(function (item) {
        return item.id === id;
    });

    let linhasProdutos = '';
    let linhasServicos = '';

    orcamento.itens.forEach(function (item) {
        if (item.tipo === 'servico') {
            const aparelho = item.modelo
                ? (nomesTipo[item.aparelho] || item.aparelho) + ' ' + item.modelo
                : '-';

            linhasServicos +=
                '<tr>' +
                '<td>' + esc(item.servico || item.nome) + '</td>' +
                '<td>' + esc(aparelho) + '</td>' +
                '<td>' + esc(item.detalhes || '-') + '</td>' +
                '<td>' + moeda(item.preco) + '</td>' +
                '</tr>';
        } else {
            linhasProdutos +=
                '<tr>' +
                '<td>' + esc(item.nome) + '</td>' +
                '<td>' + (nomesCategoria[item.categoria] || '-') + '</td>' +
                '<td>' + esc(item.modelo || '-') + '</td>' +
                '<td>' + esc(item.detalhes || '-') + '</td>' +
                '<td>' + item.qtd + '</td>' +
                '<td>' + moeda(item.preco) + '</td>' +
                '<td>' + moeda(item.preco * item.qtd) + '</td>' +
                '</tr>';
        }
    });

    let corpo =
        '<h2>Orçamento Nº ' + orcamento.numero + '</h2>' +
        dadosDoCliente(orcamento.cliente) +
        '<p><strong>Data:</strong> ' + formatarDataISO(orcamento.data) + '</p>' +
        '<p><strong>Válido até:</strong> ' + somarDias(orcamento.data, orcamento.validade) + '</p>';

    // Só imprime cada tabela se tiver pelo menos uma linha
    if (linhasProdutos) {
        corpo +=
            '<h3 style="margin-top:20px">Produtos</h3>' +
            '<table><thead><tr><th>Produto</th><th>Categoria</th><th>Compatível com</th><th>Detalhes</th><th>Qtd</th><th>Preço</th><th>Subtotal</th></tr></thead>' +
            '<tbody>' + linhasProdutos + '</tbody></table>';
    }

    if (linhasServicos) {
        corpo +=
            '<h3 style="margin-top:20px">Serviços (mão de obra)</h3>' +
            '<table><thead><tr><th>Serviço</th><th>Aparelho</th><th>Detalhes</th><th>Valor</th></tr></thead>' +
            '<tbody>' + linhasServicos + '</tbody></table>';
    }

    if (orcamento.desconto > 0) {
        corpo += '<p class="total">Desconto: ' + moeda(orcamento.desconto) + '</p>';
    }

    corpo += '<p class="total"><strong>Total: ' + moeda(orcamento.total) + '</strong></p>';

    if (orcamento.observacoes) {
        corpo += '<p><strong>Observações:</strong> ' + esc(orcamento.observacoes) + '</p>';
    }

    abrirImpressao('Orçamento ' + orcamento.numero, corpo);
}

// Leva os serviços do orçamento para o formulário de Ordem de Serviço (já preenchido)
function criarServicoDoOrcamento(id) {
    const orcamento = orcamentos.find(function (item) {
        return item.id === id;
    });

    const servicos = orcamento.itens.filter(function (item) {
        return item.tipo === 'servico';
    });

    if (servicos.length === 0) {
        alert('Este orçamento não tem serviços.');
        return;
    }

    let valor = 0;

    servicos.forEach(function (servico) {
        valor += servico.preco * servico.qtd;
    });

    // Serviços novos têm campos separados; os antigos só têm o nome
    const descricao = servicos.map(function (servico) {
        if (servico.servico) {
            return servico.servico + (servico.detalhes ? ' (' + servico.detalhes + ')' : '');
        }

        return servico.nome.replace('Serviço: ', '');
    }).join(', ');

    mostrarTela('servicos');

    idEditandoOS = null;
    limparFormOS();

    document.getElementById('os-cliente').value = orcamento.cliente;

    // Aparelho e modelo vêm do primeiro serviço do orçamento
    const primeiro = servicos[0];

    if (primeiro.aparelho) {
        document.getElementById('os-tipo').value = primeiro.aparelho;
    }

    if (primeiro.modelo) {
        document.getElementById('os-modelo').value = primeiro.modelo;
    }

    // Se o cliente está cadastrado, já traz o CPF e o telefone dele
    const cliente = acharCliente(orcamento.cliente);

    if (cliente) {
        document.getElementById('os-cpf').value = cliente.cpf || '';
        document.getElementById('os-telefone').value = cliente.telefone || '';
    }

    document.getElementById('os-defeito').value = 'Orçamento Nº ' + orcamento.numero + ': ' + descricao;
    document.getElementById('os-valor').value = arredondar(valor);

    formOS.scrollIntoView({ behavior: 'smooth' });
    document.getElementById('os-modelo').focus();

    alert('Os dados do orçamento foram para a Ordem de Serviço. Confira os campos e salve.');
}

formOrcamento.addEventListener('submit', function (evento) {
    evento.preventDefault();

    if (carrinhoOrcamento.itens.length === 0) {
        alert('Adicione pelo menos um item ao orçamento.');
        return;
    }

    // Qual botão foi clicado: "salvar", "imprimir" ou "servico"
    const acao = evento.submitter ? evento.submitter.dataset.acao : 'salvar';

    const temServico = carrinhoOrcamento.itens.some(function (item) {
        return item.tipo === 'servico';
    });

    if (acao === 'servico' && !temServico) {
        alert('Para criar a ordem de serviço, adicione pelo menos um serviço no orçamento.');
        return;
    }

    const dados = {
        cliente: document.getElementById('orcamento-cliente').value.trim(),
        validade: Number(document.getElementById('orcamento-validade').value) || 7,
        observacoes: document.getElementById('orcamento-obs').value.trim(),
        itens: JSON.parse(JSON.stringify(carrinhoOrcamento.itens)),
        desconto: carrinhoOrcamento.desconto(),
        total: carrinhoOrcamento.total()
    };

    let salvo = null;

    if (idEditandoOrcamento === null) {
        let maiorNumero = 0;

        orcamentos.forEach(function (orcamento) {
            if (orcamento.numero > maiorNumero) {
                maiorNumero = orcamento.numero;
            }
        });

        dados.id = Date.now();
        dados.numero = maiorNumero + 1;
        dados.data = new Date().toISOString();
        dados.situacao = 'pendente';

        orcamentos.push(dados);
        salvo = dados;
    } else {
        const orcamento = orcamentos.find(function (item) {
            return item.id === idEditandoOrcamento;
        });

        Object.assign(orcamento, dados);
        salvo = orcamento;

        idEditandoOrcamento = null;
    }

    salvarOrcamentos();
    mostrarOrcamentos();

    formOrcamento.reset();
    carrinhoOrcamento.limpar();

    if (acao === 'imprimir') {
        imprimirOrcamento(salvo.id);
    }

    if (acao === 'servico') {
        criarServicoDoOrcamento(salvo.id);
    }
});


// ===== ORDENS DE SERVIÇO =====

let idEditandoOS = null;

function proximoNumeroOrdem() {
    let maior = 0;

    ordens.forEach(function (ordem) {
        if (ordem.numero > maior) {
            maior = ordem.numero;
        }
    });

    return maior + 1;
}

// Dá número para as ordens que foram salvas antes de existir numeração
function numerarOrdensAntigas() {
    let mudou = false;

    ordens.forEach(function (ordem) {
        if (!ordem.numero) {
            ordem.numero = proximoNumeroOrdem();
            mudou = true;
        }
    });

    if (mudou) {
        salvarOrdens();
    }
}

const formOS = document.getElementById('form-os');
const tabelaOS = document.querySelector('#tabela-os tbody');

aplicarMascaras('os-cpf', 'os-telefone');

function limparFormOS() {
    formOS.reset();
    document.getElementById('os-entrada').value = hojeISO();
    document.getElementById('os-termos').value = TERMOS_GARANTIA_PADRAO;
}

function mostrarOrdens() {
    tabelaOS.innerHTML = '';

    if (ordens.length === 0) {
        tabelaOS.innerHTML = linhaVazia(6, 'Nenhuma ordem de serviço cadastrada');
        return;
    }

    ordens.forEach(function (ordem) {
        const linha = document.createElement('tr');

        linha.innerHTML =
            '<td>' + esc(ordem.cliente) + '</td>' +
            '<td>' + (nomesTipo[ordem.tipo] || esc(ordem.tipo)) + ' - ' + esc(ordem.modelo) + '</td>' +
            '<td>' + formatarData(ordem.entrada) + '</td>' +
            '<td>' + moeda(ordem.valor) + '</td>' +
            '<td>' + (ordem.vendaId
                ? '<span class="tag tag-ok">Venda lançada</span>'
                : '<span class="tag tag-baixo">Não lançada</span>') + '</td>';

        const celulaAcoes = document.createElement('td');

        // Só aparece enquanto o serviço ainda não foi lançado como venda
        if (!ordem.vendaId) {
            const botaoLancar = document.createElement('button');
            botaoLancar.textContent = 'Lançar venda';
            botaoLancar.className = 'btn-ok';
            botaoLancar.addEventListener('click', function () {
                lancarVendaOrdem(ordem.id);
            });
            celulaAcoes.appendChild(botaoLancar);
        }

        const botaoImprimir = document.createElement('button');
        botaoImprimir.textContent = 'Imprimir';
        botaoImprimir.className = 'btn-editar';
        botaoImprimir.addEventListener('click', function () {
            imprimirOrdem(ordem.id);
        });
        celulaAcoes.appendChild(botaoImprimir);

        const botaoEditar = document.createElement('button');
        botaoEditar.textContent = 'Editar';
        botaoEditar.className = 'btn-editar';
        botaoEditar.addEventListener('click', function () {
            editarOrdem(ordem.id);
        });

        const botaoExcluir = document.createElement('button');
        botaoExcluir.textContent = 'Excluir';
        botaoExcluir.className = 'btn-excluir';
        botaoExcluir.addEventListener('click', function () {
            excluirOrdem(ordem.id);
        });

        celulaAcoes.appendChild(botaoEditar);
        celulaAcoes.appendChild(botaoExcluir);
        linha.appendChild(celulaAcoes);

        tabelaOS.appendChild(linha);
    });
}

function editarOrdem(id) {
    const ordem = ordens.find(function (item) {
        return item.id === id;
    });

    document.getElementById('os-cliente').value = ordem.cliente;
    document.getElementById('os-cpf').value = ordem.cpf || '';
    document.getElementById('os-telefone').value = ordem.telefone || '';
    document.getElementById('os-entrada').value = ordem.entrada;
    document.getElementById('os-tipo').value = ordem.tipo;
    document.getElementById('os-senha').value = ordem.senha || '';
    document.getElementById('os-modelo').value = ordem.modelo;
    document.getElementById('os-defeito').value = ordem.defeito || '';
    document.getElementById('os-valor').value = ordem.valor;
    document.getElementById('os-pelicula').value = ordem.pelicula;
    document.getElementById('os-garantia').value = ordem.garantia;
    // Ordens antigas não têm descrição guardada, então recebem o texto padrão
    document.getElementById('os-termos').value =
        ordem.termosGarantia !== undefined ? ordem.termosGarantia : TERMOS_GARANTIA_PADRAO;

    idEditandoOS = id;
    formOS.scrollIntoView({ behavior: 'smooth' });
}

function excluirOrdem(id) {
    const confirmou = confirm('Deseja excluir esta ordem de serviço?');

    if (!confirmou) {
        return;
    }

    ordens = ordens.filter(function (ordem) {
        return ordem.id !== id;
    });

    if (idEditandoOS === id) {
        idEditandoOS = null;
        limparFormOS();
    }

    salvarOrdens();
    mostrarOrdens();
}

function lancarVendaOrdem(id) {
    const ordem = ordens.find(function (item) {
        return item.id === id;
    });

    if (ordem.vendaId) {
        alert('Esta ordem de serviço já foi lançada como venda.');
        return;
    }

    const pagamento = perguntarPagamento(
        'Serviço de ' + ordem.cliente + ' (' + moeda(ordem.valor) + ').\nForma de pagamento:'
    );

    if (!pagamento) {
        return;
    }

    const venda = {
        id: Date.now(),
        data: new Date().toISOString(),
        cliente: ordem.cliente,
        pagamento: pagamento,
        itens: [{
            tipo: 'servico',
            produtoId: null,
            nome: 'Serviço: ' + (nomesTipo[ordem.tipo] || ordem.tipo) + ' ' + ordem.modelo,
            preco: ordem.valor,
            qtd: 1
        }],
        desconto: 0,
        total: ordem.valor,
        ordemId: ordem.id
    };

    vendas.push(venda);
    ordem.vendaId = venda.id;

    salvarVendas();
    salvarOrdens();
    mostrarVendas();
    mostrarOrdens();

    alert('Venda do serviço lançada! Ela já aparece em Vendas e no gráfico.');
}

function imprimirOrdem(id) {
    const ordem = ordens.find(function (item) {
        return item.id === id;
    });

    // Ordens antigas (sem texto guardado) usam o texto padrão
    const termos = ordem.termosGarantia !== undefined ? ordem.termosGarantia : TERMOS_GARANTIA_PADRAO;

    let blocoGarantia = '';

    if (ordem.garantia !== 'sem' && termos) {
        blocoGarantia =
            '<div class="garantia"><h3>Garantia: ' + (nomesGarantia[ordem.garantia] || esc(ordem.garantia)) + '</h3>' +
            '<p>' + esc(termos).replace(/\n/g, '<br>') + '</p></div>';
    }

    const corpo =
        '<h2>Ordem de Serviço' + (ordem.numero ? ' Nº ' + ordem.numero : '') + '</h2>' +
        '<table class="info"><tbody>' +
        linhaInfo('Cliente', ordem.cliente) +
        linhaInfo('CPF', ordem.cpf || '-') +
        '<tr><th>Telefone/WhatsApp</th><td>' + iconeZap() + esc(ordem.telefone || '-') + '</td></tr>' +
        linhaInfo('Data de entrada', formatarData(ordem.entrada)) +
        linhaInfo('Aparelho', (nomesTipo[ordem.tipo] || ordem.tipo) + ' - ' + ordem.modelo) +
        linhaInfo('Defeito relatado', ordem.defeito || '-') +
        linhaInfo('Inclui película', ordem.pelicula === 'sim' ? 'Sim' : 'Não') +
        linhaInfo('Garantia', nomesGarantia[ordem.garantia] || ordem.garantia) +
        linhaInfo('Valor do serviço', moeda(ordem.valor)) +
        '</tbody></table>' +
        blocoGarantia +
        '<p>Data de impressão: ' + new Date().toLocaleDateString('pt-BR') + '</p>' +
        '<div class="assinaturas"><div>Assinatura do cliente</div><div>Stylus Cartuchos</div></div>';

    abrirImpressao('Ordem de Serviço', corpo);
}

formOS.addEventListener('submit', function (evento) {
    evento.preventDefault();

    const dados = {
        cliente: document.getElementById('os-cliente').value.trim(),
        cpf: document.getElementById('os-cpf').value,
        telefone: document.getElementById('os-telefone').value,
        entrada: document.getElementById('os-entrada').value,
        tipo: document.getElementById('os-tipo').value,
        senha: document.getElementById('os-senha').value,
        modelo: document.getElementById('os-modelo').value.trim(),
        defeito: document.getElementById('os-defeito').value.trim(),
        valor: Number(document.getElementById('os-valor').value),
        pelicula: document.getElementById('os-pelicula').value,
        garantia: document.getElementById('os-garantia').value,
        termosGarantia: document.getElementById('os-termos').value.trim()
    };

    if (idEditandoOS === null) {
        dados.id = Date.now();
        dados.numero = proximoNumeroOrdem();
        ordens.push(dados);
    } else {
        const ordem = ordens.find(function (item) {
            return item.id === idEditandoOS;
        });

        Object.assign(ordem, dados);

        idEditandoOS = null;
    }

    registrarClienteSeNovo(dados.cliente, dados.cpf, dados.telefone);

    salvarOrdens();
    mostrarOrdens();
    limparFormOS();
});


// ===== INÍCIO: DESENHA TUDO NA TELA =====

atualizarTudoProdutos();
mostrarClientes();
atualizarListaClientes();
carrinhoVenda.renderizar();
carrinhoOrcamento.renderizar();
mostrarVendas();
mostrarOrcamentos();
numerarOrdensAntigas();
mostrarOrdens();

// Orçamento: ao trocar a categoria ou o produto, o preço unitário vem do cadastro (dá para mudar)
function preencherPrecoOrcamento() {
    const produto = produtos.find(function (item) {
        return item.id === Number(document.getElementById('orcamento-produto').value);
    });

    document.getElementById('orcamento-produto-preco').value = produto ? produto.preco : '';
}

document.getElementById('orcamento-categoria').addEventListener('change', function () {
    atualizarSelectsProdutos();
    preencherPrecoOrcamento();
});

document.getElementById('orcamento-busca-produto').addEventListener('input', function () {
    atualizarSelectsProdutos();
    preencherPrecoOrcamento();
});

document.getElementById('orcamento-produto').addEventListener('change', preencherPrecoOrcamento);

preencherPrecoOrcamento();
limparFormOS();