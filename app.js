const express = require('express');
const path = require('path');
const mysql = require('mysql');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Configuração do MySQL
const database = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Paulo202930!', // Use sua senha correta aqui
  database: 'gerenciador_de_despesas'
});

// Conectar ao banco de dados MySQL
database.connect((error) => {
  if (error) {
    console.error('Erro ao conectar ao MySQL:', error);
    return;
  }
  console.log('Conectado ao MySQL!');
});

// Configuração do middleware de sessão
app.use(session({
  secret: 'segredo', // Use um segredo mais forte em produção
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60000 * 30 } // Duração da sessão (30 minutos)
}));

// Middleware para processar dados do corpo da requisição
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Servir arquivos estáticos na pasta "public"
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para verificar se o usuário está logado
function verificaAutenticacao(req, res, next) {
  if (req.session && req.session.userId) {
    return next(); // Usuário autenticado, continuar
  } else {
    // Redirecionar para a página de login se não estiver autenticado
    res.redirect('/login');
  }
}

// Rota para a página de login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Rota para a página de cadastro de usuário
app.get('/cadastro', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cadastro.html'));
});

// Rota para a página inicial (/) que redireciona para o login ou index
app.get('/', (req, res) => {
  if (req.session && req.session.userId) {
    // Se o usuário estiver logado, redireciona para o index
    res.redirect('/index.html');
  } else {
    // Caso contrário, redireciona para a página de login
    res.redirect('/login');
  }
});

// Rota para registrar um novo usuário
app.post('/cadastrar', (req, res) => {
  const { nome, email, senha } = req.body;

  const query = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
  database.query(query, [nome, email, senha], (error, result) => {
    if (error) {
      console.error('Erro ao cadastrar o usuário:', error);
      res.status(500).json({ message: 'Erro ao cadastrar usuário.' });
    } else {
      res.json({ message: 'Usuário cadastrado com sucesso!' });
    }
  });
});


// Rota para verificar o login do usuário
app.post('/verificarLogin', (req, res) => {
  const { login, senha } = req.body;

  // Verificar se o usuário existe no banco de dados
  const sql = 'SELECT * FROM usuarios WHERE email = ? AND senha = ?';
  database.query(sql, [login, senha], (error, results) => {
    if (error || results.length === 0) {
      // Se o login falhar, renderizar a página de login com uma mensagem de erro
      return res.send(`
        <script>
          alert('Usuário ou senha incorretos. Por favor, tente novamente.');
          window.location.href = '/login';
        </script>
      `);
    }

    // Salvando o ID do usuário na sessão
    req.session.userId = results[0].id;
    req.session.userName = results[0].nome;

    // Redirecionar para o index.html após o login
    res.redirect('/index.html');
  });
});

// Rota para a página principal (index.html) protegida por autenticação
app.get('/index.html', verificaAutenticacao, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


//recupera o nome do usuário
app.get('/usuario', (req, res) => {
  if (req.session.userId) {
    res.json({ nome: req.session.userName });
  } else {
    res.status(401).json({ message: 'Usuário não logado' });
  }
});

// Rota para cadastrar uma nova despesa (protegida por autenticação)
app.post('/cadastrarDespesa', verificaAutenticacao, (req, res) => {
  const { data, tipo, descricao, valor } = req.body;

  // Inserir a despesa no banco de dados com o ID do usuário logado
  const sql = 'INSERT INTO despesas (data, tipo, descricao, valor, usuarios_id) VALUES (?, ?, ?, ?, ?)';
  database.query(sql, [data, tipo, descricao, valor, req.session.userId], (error, result) => {
    if (error) {
      return res.status(500).json({ error: 'Erro ao cadastrar despesa' });
    }
    res.status(200).json({ message: 'Despesa cadastrada com sucesso' });
  });
});

// Rota para fazer logout do usuário
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao sair' });
    }
    res.redirect('/login');
  });
});

// Iniciando o servidor na porta 3000
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
