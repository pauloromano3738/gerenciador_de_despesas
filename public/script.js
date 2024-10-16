function pegaNomeUsuario() {
  fetch('/usuario')
    .then(response => response.json())
    .then(data => {
      if (data.nome) {
        document.getElementById('usuarioLogado').innerText = data.nome;
      }
    })
    .catch(error => console.error('Erro ao buscar nome do usuário:', error));
}

function carregarTipos() {
  fetch('/tipos')
      .then(response => response.json())
      .then(data => {
          const selectTipo = document.getElementById('tipo');
          selectTipo.innerHTML = '';  // Limpar opções anteriores
          data.forEach(tipo => {
              const option = document.createElement('option');
              option.value = tipo.id;
              option.textContent = tipo.titulo;
              selectTipo.appendChild(option);
          });
      })
      .catch(error => console.error('Erro ao carregar tipos:', error));
}

function adicionarTipo() {
  const novoTipo = document.getElementById('novoTipo').value;

  if (!novoTipo) {
      alert('Por favor, digite um tipo.');
      return;
  }

  // Enviar uma requisição POST ao servidor para adicionar o tipo
  fetch('/adicionarTipo', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ titulo: novoTipo })  // Passa o tipo como JSON
  })
  .then(response => {
      if (response.ok) {
          // Fechar o modal
          const modal = bootstrap.Modal.getInstance(document.getElementById('modalNovoTipo'));
          modal.hide();

          // Limpar o campo de entrada
          document.getElementById('novoTipo').value = '';

          // Atualizar a lista de tipos
          carregarTipos();
      } else {
          alert('Erro ao adicionar tipo.');
      }
  })
  .catch(error => {
      console.error('Erro:', error);
      alert('Erro ao adicionar tipo.');
  });
}

function cadastrarDespesa() {
    const data = document.getElementById('data').value;
    const tipo = document.getElementById('tipo').value;
    const descricao = document.getElementById('descricao').value;
    const valor = document.getElementById('valor').value;
  
    const despesa = { data, tipo, descricao, valor };
  
    // Enviando via AJAX para o servidor
    fetch('/cadastrarDespesa', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(despesa),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          alert(data.message);
          // Limpar o formulário
          document.getElementById('data').value = '';
          document.getElementById('tipo').value = '';
          document.getElementById('descricao').value = '';
          document.getElementById('valor').value = '';
        } else {
          alert('Erro ao cadastrar despesa');
        }
      })
      .catch((error) => console.error('Erro:', error));
  }

  
  