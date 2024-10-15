const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');
const session = require('express-session'); // Importando o express-session

const app = express();
const port = 3000;

// Configurando a conexão com o banco de dados
const database = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Paulo202930!',
  database: 'gerenciador_de_despesas'
});

database.connect((error) => {
  if (error) {
    console.error('Erro ao conectar ao MySQL:', error);
    return;
  }
  console.log('Conectado ao MySQL!');
});

// Middleware para processar dados JSON e URL-encoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuração da sessão
app.use(session({
  secret: 'seu-segredo-aqui', // Chave secreta para a sessão
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Mudar para 'true' se estiver usando HTTPS
}));

// Servindo arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Redirecionando para a página de login quando acessar '/'
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Rota para a página de login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Rota para a página de cadastro
app.get('/cadastro', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cadastro.html'));
});

// Rota para cadastrar um novo usuário
app.post('/cadastrar', (req, res) => {
  const { nome, email, senha } = req.body;

  // Verificar se o usuário já existe
  database.query('SELECT * FROM usuarios WHERE email = ?', [email], (error, results) => {
    if (results.length > 0) {
      return res.status(400).json({ message: 'Usuário já cadastrado com este email' });
    }

    // Inserir o usuário no banco de dados
    const sql = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
    database.query(sql, [nome, email, senha], (error, result) => {
      if (error) {
        return res.status(500).json({ error: 'Erro ao cadastrar usuário' });
      }
      res.redirect('/login'); // Redirecionar para o login após o cadastro
    });
  });
});

// Rota para verificar o login
app.post('/verifyLogin', (req, res) => {
  const { login, senha } = req.body;

  // Verificar se o usuário existe
  const sql = 'SELECT * FROM usuarios WHERE email = ? AND senha = ?';
  database.query(sql, [login, senha], (error, results) => {
    if (results.length === 0) {
      return res.status(400).json({ message: 'Usuário ou senha incorretos' });
    }

    // Salvando o ID do usuário na sessão
    req.session.userId = results[0].id;
    req.session.userName = results[0].nome;

    // Redirecionar para o index.html após o login
    res.redirect('/index.html');
  });
});

// Rota para proteger a página index.html
app.get('/index.html', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para cadastrar uma nova despesa
app.post('/cadastrar-despesa', (req, res) => {
  const { data, tipo, descricao, valor } = req.body;

  // Verificar se o usuário está logado
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Usuário não autenticado' });
  }

  // Inserir a despesa no banco de dados
  const sql = 'INSERT INTO despesas (data, tipo, descricao, valor, usuarios_id) VALUES (?, ?, ?, ?, ?)';
  database.query(sql, [data, tipo, descricao, valor, req.session.userId], (error, result) => {
    if (error) {
      return res.status(500).json({ error: 'Erro ao cadastrar despesa' });
    }
    res.status(200).json({ message: 'Despesa cadastrada com sucesso' });
  });
});

// Rota para logout
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao sair' });
    }
    res.redirect('/login');
  });
});

// Iniciando o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
