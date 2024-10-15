const mysql = require('mysql');

// Configurando a conexão com o banco de dados
const database = mysql.createConnection({
  host: 'localhost',  // ou o endereço do seu servidor
  user: 'root',       // seu usuário MySQL
  password: 'Paulo202930!',       // sua senha MySQL
  database: 'gerenciador_de_despesas' // o nome do banco de dados
});

database.connect((error) => {
    if (error) {
        console.error('Erro ao conectar ao MySQL:', error);
        return;
    }
    console.log('Conectado ao MySQL!');
});

module.exports = db;
