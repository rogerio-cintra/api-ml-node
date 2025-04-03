const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Conecta ao banco de dados
const db = new sqlite3.Database('meLi.db', (err) => {
    if (err) {
        console.error("Erro ao conectar ao banco de dados:", err.message);
    } else {
        console.log('Conectado ao banco de dados meLi.db');
    }
});

// Lê o arquivo SQL
const sqlContent = fs.readFileSync(path.join(__dirname, 'recriar-tabela-vendas.sql'), 'utf8');

// Executa as queries
db.serialize(() => {
    // Primeiro, vamos dropar as tabelas existentes
    db.run(`DROP TABLE IF EXISTS vendas_ml;`);
    db.run(`DROP TABLE IF EXISTS tokens;`);
    
    // Agora vamos criar as tabelas novamente
    db.run(sqlContent, (err) => {
        if (err) {
            console.error("Erro ao criar tabela vendas_ml:", err.message);
        } else {
            console.log('Tabela vendas_ml criada com sucesso');
        }
    });

    // Criar tabela de tokens
    db.run(`CREATE TABLE tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        access_token TEXT,
        refresh_token TEXT
    )`, (err) => {
        if (err) {
            console.error("Erro ao criar tabela tokens:", err.message);
        } else {
            console.log('Tabela tokens criada com sucesso');
        }
    });

    // Inserir tokens iniciais
    const refresh_token = "TG-67ed9c80b215d500010cc1b4-667458323";
    const access_token = "APP_USR-3232966453370839-040216-cb56ca83f0e5d9d9fb87f6af1909be7a-667458323";

    db.run(`INSERT INTO tokens (id, refresh_token, access_token) VALUES (1, '${refresh_token}', '${access_token}');`, (err) => {
        if (err) {
            console.error("Erro ao inserir tokens:", err.message);
        } else {
            console.log('Tokens inseridos com sucesso');
        }
    });
});

// Fecha a conexão após 2 segundos para garantir que todas as operações terminem
setTimeout(() => {
    db.close((err) => {
        if (err) {
            console.error("Erro ao fechar o banco de dados:", err.message);
        } else {
            console.log('Banco de dados fechado com sucesso');
        }
    });
}, 2000); 