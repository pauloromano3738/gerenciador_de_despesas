document.querySelector('form').addEventListener('submit', function(event) {
  event.preventDefault(); // Evita o envio padrão do formulário

  const formData = {
    nome: document.getElementById('nome').value,
    email: document.getElementById('email').value,
    senha: document.getElementById('senha').value
  };

  fetch('/cadastrar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  })
  .then(response => response.json())
  .then(data => {
    if (data.message) {
      // Exibe o alerta de sucesso
      document.getElementById('alertaSucesso').style.display = 'block';

      // Limpa os campos do formulário
      document.getElementById('nome').value = '';
      document.getElementById('email').value = '';
      document.getElementById('senha').value = '';

      // Redireciona para a página de login após 2 segundos
      setTimeout(() => {
        window.location.href = '/login.html';
      }, 1000);
    } else {
      alert('Erro ao cadastrar o usuário');
    }
  })
  .catch(error => console.error('Erro:', error));
});