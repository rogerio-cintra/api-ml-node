const sqlite3 = require('sqlite3').verbose();

// Criar e conectar ao banco de dados
const db = new sqlite3.Database('meLi.db', (err) => {
    if (err) {
        return console.error("Erro ao criar banco de dados:", err.message);
    }
    console.log('Banco de dados criado e conectado com sucesso');
    
    // Criar tabelas em sequência
    db.serialize(() => {
        // Criar tabela tokens
        db.run(`
            CREATE TABLE IF NOT EXISTS tokens (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                access_token TEXT,
                refresh_token TEXT
            )
        `, [], (err) => {
            if (err) {
                console.error("Erro ao criar tabela tokens:", err.message);
            } else {
                console.log("Tabela tokens criada com sucesso");
                
                // Inserir tokens iniciais
                const refresh_token = "TG-67ed9c80b215d500010cc1b4-667458323";
                const access_token = "APP_USR-3232966453370839-040216-cb56ca83f0e5d9d9fb87f6af1909be7a-667458323";
                
                db.run(`
                    INSERT INTO tokens (id, refresh_token, access_token) 
                    VALUES (1, ?, ?)
                `, [refresh_token, access_token], (err) => {
                    if (err) {
                        console.error("Erro ao inserir tokens:", err.message);
                    } else {
                        console.log("Tokens inseridos com sucesso");
                    }
                });
            }
        });

        // Criar tabela vendas_ml
        db.run(`
            CREATE TABLE IF NOT EXISTS vendas_ml (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                id_venda TEXT,
                data_venda TEXT,
                produto TEXT,
                cor TEXT,
                tamanho TEXT,
                sku TEXT,
                valor_venda REAL,
                comissao REAL,
                status_pagamento TEXT,
                status_entrega TEXT,
                comprador_id TEXT,
                comprador_nickname TEXT,
                dados_completos TEXT
            )
        `, [], (err) => {
            if (err) {
                console.error("Erro ao criar tabela vendas_ml:", err.message);
            } else {
                console.log("Tabela vendas_ml criada com sucesso");
            }
        });
    });
});

// Aguardar 2 segundos antes de fechar a conexão
setTimeout(() => {
    db.close((err) => {
        if (err) {
            console.error("Erro ao fechar banco de dados:", err.message);
        } else {
            console.log("Conexão com banco de dados fechada com sucesso");
        }
    });
}, 2000); 