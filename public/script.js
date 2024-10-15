function cadastrarDespesa() {
    const data = document.getElementById('data').value;
    const tipo = document.getElementById('tipo').value;
    const descricao = document.getElementById('descricao').value;
    const valor = document.getElementById('valor').value;
  
    const despesa = { data, tipo, descricao, valor };
  
    // Enviando via AJAX para o servidor
    fetch('/cadastrar-despesa', {
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
  