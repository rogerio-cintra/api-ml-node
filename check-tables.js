const sqlite3 = require('sqlite3').verbose();

// Conecta ao banco de dados
const db = new sqlite3.Database('meLi.db', (err) => {
    if (err) {
        console.error("Erro ao conectar ao banco de dados:", err.message);
    } else {
        console.log('Conectado ao banco de dados meLi.db');
    }
});

// Query para listar todas as tabelas
const query = `SELECT name FROM sqlite_master WHERE type='table';`;

// Executa a query
db.all(query, [], (err, tables) => {
    if (err) {
        console.error("Erro ao buscar tabelas:", err.message);
    } else {
        console.log('\nTabelas encontradas:');
        tables.forEach(table => {
            console.log(`- ${table.name}`);
            
            // Para cada tabela, vamos mostrar sua estrutura
            db.all(`PRAGMA table_info(${table.name})`, [], (err, columns) => {
                if (err) {
                    console.error(`Erro ao buscar estrutura da tabela ${table.name}:`, err.message);
                } else {
                    console.log(`\nEstrutura da tabela ${table.name}:`);
                    columns.forEach(col => {
                        console.log(`  ${col.name} (${col.type})`);
                    });
                    console.log('');
                }
            });
        });
    }
    
    // Fecha a conexão após 1 segundo para garantir que todas as queries terminem
    setTimeout(() => {
        db.close((err) => {
            if (err) {
                console.error("Erro ao fechar o banco de dados:", err.message);
            } else {
                console.log('Conexão com o banco de dados fechada');
            }
        });
    }, 1000);
}); 