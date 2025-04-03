const sqlite3 = require('sqlite3').verbose();

// Conecta ao banco de dados
const db = new sqlite3.Database('meLi.db', (err) => {
    if (err) {
        console.error("Erro ao conectar ao banco de dados:", err.message);
        return;
    }
    console.log('Conectado ao banco de dados meLi.db');

    // Listar todas as tabelas
    db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
        if (err) {
            console.error("Erro ao listar tabelas:", err.message);
            return;
        }
        
        console.log('\nTabelas encontradas:');
        tables.forEach(table => {
            console.log(`\nTabela: ${table.name}`);
            
            // Mostrar estrutura da tabela
            db.all(`PRAGMA table_info(${table.name})`, [], (err, columns) => {
                if (err) {
                    console.error(`Erro ao obter estrutura da tabela ${table.name}:`, err.message);
                    return;
                }
                
                console.log('Estrutura:');
                columns.forEach(col => {
                    console.log(`  ${col.name} (${col.type})`);
                });
                
                // Mostrar dados da tabela
                db.all(`SELECT * FROM ${table.name}`, [], (err, rows) => {
                    if (err) {
                        console.error(`Erro ao obter dados da tabela ${table.name}:`, err.message);
                        return;
                    }
                    
                    console.log('\nDados:');
                    rows.forEach(row => {
                        console.log(row);
                    });
                });
            });
        });
    });
});

// Aguardar 5 segundos antes de fechar
setTimeout(() => {
    db.close((err) => {
        if (err) {
            console.error("Erro ao fechar banco de dados:", err.message);
        } else {
            console.log("\nConexão com banco de dados fechada");
        }
    });
}, 5000); 