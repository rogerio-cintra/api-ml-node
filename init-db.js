const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Cria ou conecta ao banco de dados
const db = new sqlite3.Database('meLi.db', (err) => {
    if (err) {
        console.error("Erro ao conectar ao banco de dados", err.message);
    } else {
        console.log('Conectado ao banco de dados meLi.db');
    }
});

// Criar tabela de vendas
db.run(`CREATE TABLE IF NOT EXISTS vendas_ml (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_venda TEXT,
    data_venda TEXT,
    sku TEXT,
    valor_venda REAL(10,2),
    comissao REAL(10,2)
)`, [], (err) => {
    if (err) {
        console.error("Erro ao criar tabela de vendas", err.message);
    } else {
        console.log('Tabela de vendas criada com sucesso');
    }
});

// Criar tabela de tokens
db.run(`CREATE TABLE IF NOT EXISTS tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    access_token TEXT,
    refresh_token TEXT
)`, [], (err) => {
    if (err) {
        console.error("Erro ao criar tabela de tokens", err.message);
    } else {
        console.log('Tabela de tokens criada com sucesso');
    }
});

// Inserir um registro inicial na tabela tokens
const refresh_token = "TG-67ed9c80b215d500010cc1b4-667458323";
const access_token = "APP_USR-3232966453370839-040216-cb56ca83f0e5d9d9fb87f6af1909be7a-667458323";

db.run(`INSERT OR REPLACE INTO tokens (id, refresh_token, access_token) VALUES (1, '${refresh_token}', '${access_token}');`, [], (err) => {
    if (err) {
        console.error("Erro ao inserir tokens:", err.message);
    } else {
        console.log('Tokens inseridos com sucesso');
    }
    
    // Fecha o banco de dados
    db.close((err) => {
        if (err) {
            console.error("Erro ao fechar o banco de dados", err.message);
        } else {
            console.log('Banco de dados fechado com sucesso');
        }
    });
}); 