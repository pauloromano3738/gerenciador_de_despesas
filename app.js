class Despesa {
	constructor(data, tipo, descricao, valor) {
		this.data = data; // Armazena a data como um objeto Date
		this.tipo = tipo;
		this.descricao = descricao;
		this.valor = valor;
	}

	validarDados() {
		for (let i in this) {
			if (this[i] == undefined || this[i] == '' || this[i] == null) {
				return false;
			}
		}
		return true;
	}
}

class Bd {
	constructor() {
		let id = localStorage.getItem('id');

		if (id === null) {
			localStorage.setItem('id', 0);
		}
	}

	getProximoId() {
		let proximoId = localStorage.getItem('id');
		return parseInt(proximoId) + 1;
	}

	gravar(d) {
		let id = this.getProximoId();
		localStorage.setItem(id, JSON.stringify(d));
		localStorage.setItem('id', id);
	}

	recuperarTodosRegistros() {
    let despesas = [];
    let id = localStorage.getItem('id');

    for (let i = 1; i <= id; i++) {
        let despesa = JSON.parse(localStorage.getItem(i));
        if (despesa === null) {
            continue;
        }
        despesa.id = i;
        despesas.push(despesa);
    }

    // Inverte a ordem para que as despesas mais recentes apareçam primeiro
    return despesas.reverse();
}

	pesquisar(despesa) {
		let despesasFiltradas = this.recuperarTodosRegistros();
		console.log(despesasFiltradas);
		console.log(despesa);

		// Aplicando filtros
		if (despesa.data) {
			let ano = despesa.data.split('-')[0];
			let mes = despesa.data.split('-')[1];
			despesasFiltradas = despesasFiltradas.filter(d => d.data.startsWith(`${ano}-${mes}`));
		}
		if (despesa.tipo != '') {
			despesasFiltradas = despesasFiltradas.filter(d => d.tipo == despesa.tipo);
		}
		if (despesa.descricao != '') {
			despesasFiltradas = despesasFiltradas.filter(d => d.descricao == despesa.descricao);
		}
		if (despesa.valor != '') {
			despesasFiltradas = despesasFiltradas.filter(d => d.valor == despesa.valor);
		}

		return despesasFiltradas;
	}

	remover(id) {
		localStorage.removeItem(id);
	}
}

let bd = new Bd();

function cadastrarDespesa() {
	let data = document.getElementById('data').value; // Novo input de data
	let tipo = document.getElementById('tipo');
	let descricao = document.getElementById('descricao');
	let valor = document.getElementById('valor');

	let despesa = new Despesa(data, tipo.value, descricao.value, valor.value);

	if (despesa.validarDados()) {
		bd.gravar(despesa);

		document.getElementById('modal_titulo').innerHTML = 'Registro inserido com sucesso';
		document.getElementById('modal_titulo_div').className = 'modal-header text-success';
		document.getElementById('modal_conteudo').innerHTML = 'Despesa foi cadastrada com sucesso!';
		document.getElementById('modal_btn').innerHTML = 'Voltar';
		document.getElementById('modal_btn').className = 'btn btn-success';

		const alertaSucesso = document.getElementById('alertaSucesso');
    alertaSucesso.style.display = 'block'; // Mostra o alerta

    // Esconde o alerta após 1 segundo
    setTimeout(() => {
      location.reload(); // Recarrega a página
      alertaSucesso.style.display = 'none';
    }, 1000);

	} else {
		document.getElementById('modal_titulo').innerHTML = 'Erro na inclusão do registro';
		document.getElementById('modal_titulo_div').className = 'modal-header text-danger';
		document.getElementById('modal_conteudo').innerHTML = 'Erro na gravação, verifique se todos os campos foram preenchidos corretamente!';
		document.getElementById('modal_btn').innerHTML = 'Voltar e corrigir';
		document.getElementById('modal_btn').className = 'btn btn-danger';

		$('#modalRegistraDespesa').modal('show');
	}
}

function carregaListaDespesas(despesas = Array(), filtro = false) {
    if (despesas.length == 0 && filtro == false) {
        despesas = bd.recuperarTodosRegistros();
    }

    let listaDespesas = document.getElementById("listaDespesas");
    listaDespesas.innerHTML = '';
    despesas.forEach(function(d) {
        var linha = listaDespesas.insertRow();
        
        // Formatar a data corretamente
        let data = new Date(d.data);
        let dataFormatada = data.toLocaleDateString('pt-BR', {
            timeZone: 'UTC', // Define o fuso horário como UTC
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });

        linha.insertCell(0).innerHTML = dataFormatada;

        switch (d.tipo) {
            case '1': d.tipo = 'Alimentação'; break;
            case '2': d.tipo = 'Educação'; break;
            case '3': d.tipo = 'Lazer'; break;
            case '4': d.tipo = 'Saúde'; break;
            case '5': d.tipo = 'Transporte'; break;
        }
        linha.insertCell(1).innerHTML = d.tipo;
        linha.insertCell(2).innerHTML = d.descricao;
        linha.insertCell(3).innerHTML = d.valor;

        let btn = document.createElement('button');
        btn.className = 'btn btn-danger';
        btn.innerHTML = '<i class="fa fa-times"></i>';
        btn.id = `id_despesa_${d.id}`;
        btn.onclick = function() {
            let id = this.id.replace('id_despesa_', '');
            bd.remover(id);
            window.location.reload();
        }
        linha.insertCell(4).append(btn);
    });
}


function pesquisarDespesa() {
	let dataInicio = document.getElementById("dataInicio").value;
	let dataFim = document.getElementById("dataFim").value;
	let tipo = document.getElementById("tipo").value;

	let despesas = bd.recuperarTodosRegistros();

	// Filtragem por intervalo de datas
	if (dataInicio) {
			despesas = despesas.filter(d => new Date(d.data) >= new Date(dataInicio));
	}
	if (dataFim) {
			despesas = despesas.filter(d => new Date(d.data) <= new Date(dataFim));
	}
	if (tipo) {
			despesas = despesas.filter(d => d.tipo == tipo);
	}

	carregaListaDespesas(despesas, true);
}


function adicionarTipo() {
	let novoTipo = document.getElementById('novoTipo').value;

	if (novoTipo) {
			// Cria uma nova opção
			let option = document.createElement('option');
			option.value = novoTipo;
			option.text = novoTipo;

			// Adiciona a nova opção ao select
			document.getElementById('tipo').add(option);

			// Adiciona o novo tipo ao localStorage
			salvarTipo(novoTipo);

			// Limpa o campo de entrada no modal
			document.getElementById('novoTipo').value = '';

			// Fecha o modal
			$('#modalNovoTipo').modal('hide');
	} else {
			alert('Por favor, insira um tipo válido.');
	}
}

function salvarTipo(tipo) {
	let tipos = JSON.parse(localStorage.getItem('tiposDespesa')) || [];
	tipos.push(tipo);
	localStorage.setItem('tiposDespesa', JSON.stringify(tipos));
}

function carregarTipos() {
	let tipos = JSON.parse(localStorage.getItem('tiposDespesa')) || [];

	tipos.forEach(function(tipo) {
			let option = document.createElement('option');
			option.value = tipo;
			option.text = tipo;
			document.getElementById('tipo').add(option);
	});
}

function imprimirTabela() {
	// Obtém o conteúdo da tabela
	const tabela = document.getElementById('tabelaDespesas');

	// Verifica se a tabela foi encontrada
	if (!tabela) {
			console.error('Tabela não encontrada!');
			return; // Sai da função se a tabela não for encontrada
	}

	// Clona a tabela
	const tabelaClone = tabela.cloneNode(true);

	// Remove os botões da tabela clonada
	const botoes = tabelaClone.querySelectorAll('button');
	botoes.forEach(botao => botao.parentNode.removeChild(botao));

	const tabelaHtml = tabelaClone.outerHTML;

	// Cria uma nova janela
	const novaJanela = window.open('', '', 'width=800,height=600');

	// Adiciona o conteúdo da tabela à nova janela
	novaJanela.document.write('<html><head><title>Imprimir Despesas</title>');
	novaJanela.document.write('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">'); // Link para o CSS do Bootstrap
	novaJanela.document.write('</head><body>');
	novaJanela.document.write('<h1>Lista de Despesas</h1>');
	novaJanela.document.write(tabelaHtml);
	novaJanela.document.write('</body></html>');

	// Fecha o documento para renderizar
	novaJanela.document.close();

	// Abre a caixa de diálogo de impressão
	novaJanela.print();
}


