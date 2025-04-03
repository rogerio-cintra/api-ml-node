const sqlite3 = require('sqlite3').verbose();

// Conecta ao banco de dados
const db = new sqlite3.Database('meLi.db', (err) => {
    if (err) {
        console.error("Erro ao conectar ao banco de dados:", err.message);
    } else {
        console.log('Conectado ao banco de dados meLi.db');
    }
});

// SQL para criar a tabela vendas_ml
const sql = `
CREATE TABLE IF NOT EXISTS vendas_ml (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_venda TEXT,
    data_venda TEXT,
    produto TEXT,
    cor TEXT,
    tamanho TEXT,
    sku TEXT,
    valor_venda REAL(10,2),
    comissao REAL(10,2),
    status_pagamento TEXT,
    status_entrega TEXT,
    comprador_id TEXT,
    comprador_nickname TEXT,
    dados_completos TEXT
);`;

// Executa a query
db.run(sql, (err) => {
    if (err) {
        console.error("Erro ao criar tabela vendas_ml:", err.message);
    } else {
        console.log('Tabela vendas_ml criada com sucesso');
    }
    
    // Fecha a conexão
    db.close((err) => {
        if (err) {
            console.error("Erro ao fechar o banco de dados:", err.message);
        } else {
            console.log('Banco de dados fechado com sucesso');
        }
    });
}); 