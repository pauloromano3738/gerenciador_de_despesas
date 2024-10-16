function pegaNomeUsuario() {
  fetch('/usuario')
    .then(response => response.json())
    .then(data => {
      if (data.nome) {
        document.getElementById('usuarioLogado').innerText = data.nome;
      } else {
        location.href = "/login"
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
          
          // Adiciona uma opção padrão
          const defaultOption = document.createElement('option');
          defaultOption.value = ''; // Valor vazio para permitir filtragem sem tipo
          defaultOption.textContent = 'Escolha um tipo'; // Texto padrão
          selectTipo.appendChild(defaultOption);

          // Adiciona as opções de tipos retornadas do servidor
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


  if (!data || !tipo || !descricao || !valor) {
      alert("Preencha todos os campos");
      return;
  }
  
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
          location.reload();
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

  function carregaListaDespesas(dataInicio = '', dataFim = '', tipo = '') {
    // Construa a URL com os parâmetros de busca
    let url = '/despesas?';

    if (dataInicio) {
        url += `dataInicio=${dataInicio}&`;
    }

    if (dataFim) {
        url += `dataFim=${dataFim}&`;
    }

    if (tipo) {
        url += `tipo=${tipo}&`;
    }

    // Remover o último '&' se presente
    url = url.slice(0, -1);

    fetch(url) // Faz a requisição para a rota correta no back-end
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar as despesas');
            }
            return response.json(); // Converte a resposta em JSON
        })
        .then(despesas => {
            const listaDespesas = document.getElementById('listaDespesas');
            listaDespesas.innerHTML = ''; // Limpa a tabela antes de preencher

            if (despesas.length > 0) {
                // Itera sobre as despesas retornadas e monta as linhas da tabela
                despesas.forEach(despesa => {
                    const row = `
                        <tr>
                            <td>${new Date(despesa.data).toLocaleDateString()}</td>
                            <td>${despesa.tipo}</td> <!-- Alterado para mostrar o título do tipo -->
                            <td>${despesa.descricao}</td>
                            <td>${despesa.valor}</td>
                            <td>
                                <button class="btn btn-danger" onclick="removerDespesa(${despesa.id})">X</button>
                            </td>
                        </tr>
                    `;
                    listaDespesas.insertAdjacentHTML('beforeend', row); // Adiciona a linha na tabela
                });
            } else {
                // Caso não haja despesas, exibe uma linha informativa
                listaDespesas.innerHTML = '<tr><td colspan="5" class="text-center">Nenhuma despesa encontrada.</td></tr>';
            }
        })
        .catch(err => {
            console.error('Erro ao carregar as despesas:', err);
        });
}

function pesquisarDespesa() {
  const dataInicio = document.getElementById('dataInicio').value;
  const dataFim = document.getElementById('dataFim').value;
  const tipo = document.getElementById('tipo').value;

  // Chama a função carregaListaDespesas com os parâmetros de filtro
  carregaListaDespesas(dataInicio, dataFim, tipo);
}

function removerDespesa(id) {
  fetch(`/despesas/${id}`, {
      method: 'DELETE', // Método DELETE para remover a despesa
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('Erro ao remover despesa');
      }
      carregaListaDespesas(); // Recarrega a lista após a remoção
  })
  .catch(err => {
      console.error('Erro ao remover despesa:', err);
  });
}

function carregarRelatorio() {
  fetch('/despesas/somaPorTipo') // Rota que retorna a soma das despesas por tipo
      .then(response => {
          if (!response.ok) {
              throw new Error('Erro ao carregar os dados do relatório');
          }
          return response.json();
      })
      .then(dados => {
          const tipos = dados.map(item => item.tipo); // Extrai os tipos
          const valores = dados.map(item => item.total); // Extrai os totais
          
          // Cria o gráfico
          const ctx = document.getElementById('graficoDespesas').getContext('2d');
          const graficoDespesas = new Chart(ctx, {
              type: 'bar', // Tipo do gráfico
              data: {
                  labels: tipos,
                  datasets: [{
                      label: 'Total de Despesas por Tipo (R$)',
                      data: valores,
                      backgroundColor: '#0D6EFD', // Cor das barras
                      borderColor: '#0D6EFD',
                      borderWidth: 1
                  }]
              },
              options: {
                  scales: {
                      y: {
                          beginAtZero: true,
                          title: {
                              display: true,
                              text: 'Total (R$)',
                              color: '#ffffff' // Cor do texto do eixo Y
                          },
                          ticks: {
                              color: '#ffffff' // Cor dos números no eixo Y
                          }
                      },
                      x: {
                          ticks: {
                              color: '#ffffff' // Cor dos rótulos no eixo X
                          }
                      }
                  },
                  plugins: {
                      legend: {
                          labels: {
                              color: '#ffffff' // Cor da legenda
                          }
                      }
                  }
              }
          });
      })
      .catch(error => console.error('Erro ao carregar os dados:', error));
}


