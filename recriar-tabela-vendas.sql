-- Recriar a tabela vendas_ml com uma estrutura mais adequada
DROP TABLE IF EXISTS vendas_ml;

CREATE TABLE vendas_ml (
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
); 