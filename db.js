const mysql = require('mysql');

// Configurando a conexão com o banco de dados
const connection = mysql.createConnection({
  host: 'localhost',  // ou o endereço do seu servidor
  user: 'root',       // seu usuário MySQL
  password: 'Paulo202930!',       // sua senha MySQL
  database: 'gerenciador_de_despesas' // o nome do banco de dados
});

// Estabelecendo a conexão
connection.connect((err) => {
  if (err) {
    console.error('Erro de conexão: ' + err.stack);
    return;
  }
  console.log('Conectado ao banco de dados como ID ' + connection.threadId);
});

// Exemplo de uma consulta
connection.query('SELECT * FROM usuarios', (error, results, fields) => {
  if (error) throw error;
  console.log('Resultado da consulta:', results);
});

// Fechando a conexão
connection.end();
