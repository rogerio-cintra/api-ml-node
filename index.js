// index.js

const express = require('express');
const app = express();
const path = require('path');
const fetch = require('node-fetch');
const sqlite3 = require('sqlite3').verbose();

// Indica onde está os arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Cria ou conecta ao banco de dados
const db = new sqlite3.Database('meLi.db', (err) => {
    if (err) {
        console.error("Erro ao conectar ao banco de dados", err.message);
    } else {
        console.log('Conectado ao banco de dados meLi.db');
    }
});

// Criar tabela de tokens
db.run(`CREATE TABLE IF NOT EXISTS tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    access_token TEXT,
    refresh_token TEXT)`, [], (err) => {
    if (err) {
        console.error("Erro ao criar tabela de tokens", err.message);
    } else {
        console.log('Tabela de tokens criada com sucesso');
    }
});

// Funções =========================================================================================================

// Função para iniciar a conexão com o banco de dados sqlite
function iniciarConexaoDB() {
    const db = new sqlite3.Database('meLi.db', (err) => {
        if (err) {
            console.error("Erro ao conectar ao banco de dados", err.message);
        } else {
            console.log('Conectado ao banco de dados meLi.db'); 
        }
    });
    return db;
}
// Função para fechar a conexão com o banco de dados sqlite
function fecharConexaoDB(db) {
    db.close((err) => {
        if (err) {
            console.error("Erro ao fechar o banco de dados", err.message);
        } else {
            console.log('Banco de dados fechado com sucesso');
        }
    });
}

// Função que faz uma validação de teste para verificar se o Access Token é válido
async function authTest(){
    const db = iniciarConexaoDB();

    try{
        const resultado = await new Promise((resolve, reject) => {
            db.all("SELECT access_token FROM tokens WHERE id = 1;" ,  [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });

        if (!resultado || resultado.length === 0) {
            console.log("Nenhum token encontrado no banco de dados");
            return null;
        }

        const access_token = resultado[0].access_token;

        const url_teste = `https://api.mercadolibre.com/users/me`;

        const headers = {
            "Authorization": `Bearer ${access_token}`
        };

        const resposta = await fetch(url_teste, {
            method: 'GET',
            headers: headers
        });

        if (resposta.status === 200) {
            return access_token;
        } else if (resposta.status === 401) {
            return "Token inválido";
        } else {
            return null;
        }
    } catch (err) {
        console.error("Erro ao validar token:", err.message);
        return null;
    } finally {
        fecharConexaoDB(db);
    }
};

// Função que obtem o access token da API do Mercado Livre
async function getAuth(){
    // Variáveis fixas que vamos precisar para enviar à API do Mercado Livre
    const app_id = "3232966453370839";
    const client_secret = "S3QbTCi6Clg0zRrftsXxi7C3jn5dx7LS";

    // Chama a função que faz a conexão com o banco de dados
    const db = iniciarConexaoDB();

    try{
        console.log("Buscando refresh_token no banco de dados...");
        const resultado = await new Promise((resolve, reject) => {
            db.all("SELECT refresh_token FROM tokens WHERE id = 1;", [], (err, rows) => {
                if (err) {
                    console.error("Erro ao buscar refresh_token:", err.message);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });

        if (!resultado || resultado.length === 0) {
            console.log("Nenhum refresh token encontrado no banco de dados");
            return null;
        }

        const refresh_token_antigo = resultado[0].refresh_token;
        console.log("Refresh token encontrado:", refresh_token_antigo);

        const url_principal = "https://api.mercadolibre.com/oauth/token";

        const headers = {
            "accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded"
        };

        const dados = `grant_type=refresh_token&client_id=${app_id}&client_secret=${client_secret}&refresh_token=${refresh_token_antigo}`;
        console.log("Enviando requisição para obter novo token...");

        const resposta = await fetch(url_principal, {
            method: 'POST',
            headers: headers,
            body: dados
        });

        console.log("Status da resposta:", resposta.status);
        const resposta_json = await resposta.json();
        console.log("Resposta da API:", JSON.stringify(resposta_json, null, 2));

        if (resposta.status !== 200) {
            console.error("Erro ao obter token. Status:", resposta.status);
            // Se o refresh token expirou, tenta obter novos tokens usando o processo de autorização
            if (resposta.status === 400) {
                console.log("Refresh token expirado, iniciando processo de autorização automática...");
                return await autoUpdateTokens();
            }
            return null;
        }

        console.log("Atualizando tokens no banco de dados...");
        await new Promise((resolve, reject) => {
            db.run(`UPDATE tokens SET refresh_token = '${resposta_json.refresh_token}', access_token = '${resposta_json.access_token}' WHERE id = 1;`, [], (err) => {
                if (err) {
                    console.error("Erro ao atualizar os tokens no banco de dados:", err.message);
                    reject(err);
                } else {
                    console.log("Tokens atualizados com sucesso");
                    resolve();
                }
            });
        });

        return resposta_json.access_token;

    } catch (err) {
        console.error("Erro ao obter o access token:", err.message);
        return null;
    } finally {
        fecharConexaoDB(db);
    }
};

// Função para automatizar a atualização dos tokens
async function autoUpdateTokens() {
    const app_id = "3232966453370839";
    const client_secret = "S3QbTCi6Clg0zRrftsXxi7C3jn5dx7LS";
    const redirect_uri = "https://www.useaveloz.com.br";

    try {
        // Primeiro, tenta usar o refresh token existente
        const db = iniciarConexaoDB();
        const resultado = await new Promise((resolve, reject) => {
            db.all("SELECT refresh_token FROM tokens WHERE id = 1;", [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });

        if (resultado && resultado.length > 0) {
            const refresh_token = resultado[0].refresh_token;
            const url_principal = "https://api.mercadolibre.com/oauth/token";
            const headers = {
                "accept": "application/json",
                "Content-Type": "application/x-www-form-urlencoded"
            };
            const dados = `grant_type=refresh_token&client_id=${app_id}&client_secret=${client_secret}&refresh_token=${refresh_token}`;

            const resposta = await fetch(url_principal, {
                method: 'POST',
                headers: headers,
                body: dados
            });

            if (resposta.status === 200) {
                const resposta_json = await resposta.json();
                await new Promise((resolve, reject) => {
                    db.run(`UPDATE tokens SET refresh_token = '${resposta_json.refresh_token}', access_token = '${resposta_json.access_token}' WHERE id = 1;`, [], (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                });
                return resposta_json.access_token;
            }
        }

        // Se não conseguiu usar o refresh token, inicia o processo de autorização
        console.log("Iniciando processo de autorização automática...");
        
        // Aqui você pode implementar uma lógica personalizada para notificar
        // quando for necessário uma nova autorização manual
        // Por exemplo, enviar um e-mail, uma notificação push, etc.
        
        console.log("É necessário realizar uma nova autorização manual.");
        console.log("Acesse: https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=" + app_id + "&redirect_uri=" + redirect_uri);
        
        return null;
    } catch (err) {
        console.error("Erro ao atualizar tokens automaticamente:", err.message);
        return null;
    } finally {
        fecharConexaoDB(db);
    }
}

// Função para obter vendas do Mercado Livre
async function getVendas(access_token) {
    console.log("Iniciando busca de vendas...");
    console.log("Token de acesso:", access_token);
    
    const seller_id = "667458323";
    
    // Obter data atual e data de 30 dias atrás
    const data_final = new Date().toISOString().split('T')[0];
    const data_inicial = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    console.log("Período de busca:", data_inicial, "até", data_final);

    const headers = {
        "Authorization": `Bearer ${access_token}`
    };

    const url = `https://api.mercadolibre.com/orders/search?seller=${seller_id}&order.date_created.from=${data_inicial}T00:00:00.000-03:00&order.date_created.to=${data_final}T23:59:59.999-03:00`;
    console.log("URL da requisição:", url);
    
    try {
        console.log("Enviando requisição para a API do Mercado Livre...");
        const resposta = await fetch(url, {
            method: 'GET',
            headers: headers,
        });
        
        console.log("Status da resposta:", resposta.status);
        
        if (resposta.status !== 200) {
            console.error("Erro ao obter vendas. Status:", resposta.status);
            const texto = await resposta.text();
            console.error("Resposta:", texto);
            return null;
        }
        
        const resposta_json = await resposta.json();
        console.log("Resposta da API:", JSON.stringify(resposta_json, null, 2));
        
        if (!resposta_json || !resposta_json.results) {
            console.error("Resposta inválida da API");
            return null;
        }
        
        console.log(`Encontradas ${resposta_json.results.length} vendas`);
        return resposta_json;
    } catch (err) {
        console.error("Erro ao obter vendas:", err.message);
        return null;
    }
}

// Função para salvar vendas no banco de dados
function salvarVendas(vendas) {
    console.log("Iniciando salvamento das vendas...");
    
    if (!vendas) {
        console.error("Nenhum dado de venda recebido");
        return;
    }
    
    const db = iniciarConexaoDB();
    
    try {
        if (!vendas.results || !Array.isArray(vendas.results)) {
            console.error("Dados de vendas inválidos ou vazios");
            return;
        }

        console.log(`Preparando para salvar ${vendas.results.length} vendas`);

        // Preparar a inserção
        const stmt = db.prepare(`
            INSERT INTO vendas_ml (
                id_venda, 
                data_venda, 
                produto, 
                cor, 
                tamanho, 
                sku, 
                valor_venda, 
                comissao, 
                status_pagamento, 
                status_entrega, 
                comprador_id, 
                comprador_nickname, 
                dados_completos
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        // Inserir cada venda
        vendas.results.forEach((venda, index) => {
            console.log(`Processando venda ${index + 1}/${vendas.results.length}`);
            
            // Extrair dados da venda
            // Garantir que o id_venda seja armazenado como texto sem formatação científica
            const id_venda = venda.id ? venda.id.toString() : '';
            const data_venda = venda.date_created;
            
            // Extrair dados do produto
            let produto = '';
            let cor = '';
            let tamanho = '';
            let sku = '';
            
            if (venda.order_items && venda.order_items.length > 0) {
                const item = venda.order_items[0].item;
                produto = item.title;
                sku = item.seller_sku || '';
                
                // Extrair cor e tamanho dos atributos de variação
                if (item.variation_attributes) {
                    item.variation_attributes.forEach(attr => {
                        if (attr.name === 'Cor') {
                            cor = attr.value_name;
                        } else if (attr.name === 'Tamanho') {
                            tamanho = attr.value_name;
                        }
                    });
                }
            }
            
            // Extrair valores
            const valor_venda = venda.total_amount || 0;
            const comissao = venda.order_items && venda.order_items.length > 0 ? 
                venda.order_items[0].sale_fee || 0 : 0;
            
            // Extrair status
            const status_pagamento = venda.status || '';
            const status_entrega = venda.tags && venda.tags.includes('delivered') ? 'delivered' : '';
            
            // Extrair dados do comprador
            const comprador_id = venda.buyer ? venda.buyer.id : '';
            const comprador_nickname = venda.buyer ? venda.buyer.nickname : '';
            
            // Converter o objeto venda completo para JSON
            const dados_completos = JSON.stringify(venda);
            
            // Inserir no banco de dados
            stmt.run(
                id_venda,
                data_venda,
                produto,
                cor,
                tamanho,
                sku,
                valor_venda,
                comissao,
                status_pagamento,
                status_entrega,
                comprador_id,
                comprador_nickname,
                dados_completos,
                function(err) {
                    if (err) {
                        console.error("Erro ao inserir venda:", err.message);
                    } else {
                        console.log("Venda salva com sucesso");
                    }
                }
            );
        });
        
        // Finalizar a preparação
        stmt.finalize();
        console.log("Processo de salvamento concluído");
    } catch (err) {
        console.error("Erro ao salvar vendas:", err.message);
    } finally {
        // Aguardar um momento para garantir que todas as operações foram concluídas
        setTimeout(() => {
            fecharConexaoDB(db);
        }, 1000);
    }
}

// Rotas =========================================================================================================

// Rota para inicializar o banco de dados com um token válido
app.post('/initDB', async (req, res) => {
    const db = iniciarConexaoDB();
    
    try {
        // Verificar se já existe um registro na tabela tokens
        const resultado = await new Promise((resolve, reject) => {
            db.all("SELECT * FROM tokens WHERE id = 1;", [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
        
        if (resultado && resultado.length > 0) {
            console.log("Banco de dados já inicializado");
            res.send("Banco de dados já inicializado");
            return;
        }
        
        // Inserir um registro inicial na tabela tokens
        // Você deve substituir estes valores pelos tokens reais do Mercado Livre
        const refresh_token = "TG-67ed9c80b215d500010cc1b4-667458323";
        const access_token = "APP_USR-3232966453370839-040216-cb56ca83f0e5d9d9fb87f6af1909be7a-667458323";
        
        db.run(`INSERT INTO tokens (id, refresh_token, access_token) VALUES (1, '${refresh_token}', '${access_token}');`, [], (err) => {
            if (err) {
                console.error("Erro ao inicializar banco de dados:", err.message);
                res.status(500).send("Erro ao inicializar banco de dados");
            } else {
                console.log("Banco de dados inicializado com sucesso");
                res.send("Banco de dados inicializado com sucesso");
            }
        });
    } catch (err) {
        console.error("Erro ao inicializar banco de dados:", err.message);
        res.status(500).send("Erro ao inicializar banco de dados");
    } finally {
        fecharConexaoDB(db);
    }
});

// Rota teste
app.post('/test', async (req, res) => {
  const app_id = "3232966453370839";
  const client_secret = "S3QbTCi6Clg0zRrftsXxi7C3jn5dx7LS";
  const code = "TG-67edef0bd028f4000100cfdb-667458323";
  const redirect_uri = "https://www.useaveloz.com.br";

  // URL principal sa API do Mercado Livre - para obter o access token
  const url_principal = "https://api.mercadolibre.com/oauth/token";

  // Informaç˜pes que serão enviadas junto com a URL principal da requisição/chamada
  const headers = {
    "accept": "application/json",
    "Content-Type": "application/x-www-form-urlencoded"
  };
  const dados = `grant_type=authorization_code&client_id=${app_id}&client_secret=${client_secret}&code=${code}&redirect_uri=${redirect_uri}`;

  try {
    // Faz a requisição para a API do Mercado Livre
    const resposta = await fetch(url_principal, {
      method: 'POST',
      headers: headers,
      body: dados
    });

    // Converte a resposta para JSON
    const resposta_json = await resposta.json();

    console.log("Resposta da API:", JSON.stringify(resposta_json, null, 2));

    // Se a resposta for bem sucedida, atualiza os tokens no banco de dados
    if (resposta.status === 200) {
      const db = iniciarConexaoDB();
      db.run(`UPDATE tokens SET refresh_token = '${resposta_json.refresh_token}', access_token = '${resposta_json.access_token}' WHERE id = 1;`, [], (err) => {
        if (err) {
          console.error("Erro ao atualizar os tokens no banco de dados:", err.message);
        } else {
          console.log("Tokens atualizados com sucesso");
        }
        fecharConexaoDB(db);
      });
      res.json(resposta_json);
    } else {
      console.error("Erro ao obter tokens. Status:", resposta.status);
      res.status(500).json(resposta_json);
    }
  } catch (err) {
    console.error("Erro ao obter tokens:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Rota para obter o access token
app.post('/getAccessToken', async (req, res) => {
  const app_id = "3232966453370839";
  const client_secret = "S3QbTCi6Clg0zRrftsXxi7C3jn5dx7LS";
  const refresh_token = "TG-67ed9c80b215d500010cc1b4-667458323";

  const url_principal = "https://api.mercadolibre.com/oauth/token";

  const headers = {
    "accept": "application/json",
    "Content-Type": "application/x-www-form-urlencoded"
  };

  const dados = `grant_type=refresh_token&client_id=${app_id}&client_secret=${client_secret}&refresh_token=${refresh_token}`;

  const resposta = await fetch(url_principal, {
    method: 'POST',
    headers: headers,
    body: dados
  });


  const resposta_json = await resposta.json();

  console.log(resposta_json);

  res.send("OK");

});

// Rota para consultar uma venda
app.get('/getInfoVenda', async (req, res) => {
  const access_token = "APP_USR-3232966453370839-040216-cb56ca83f0e5d9d9fb87f6af1909be7a-667458323";
  const id_venda = "2000011198245998";

  const headers = {
    "Authorization": `Bearer ${access_token}`
  };

  const url = `https://api.mercadolibre.com/orders/${id_venda}`;

  const resposta = await fetch(url, {
    method: 'GET',
    headers: headers,
  });

  const resposta_json = await resposta.json();

  console.log(resposta_json);

  res.send(resposta_json);
});

// Rota para atualizar os tokens no banco de dados
app.post('/updateTokens', async (req, res) => {
    try {
        const access_token = await autoUpdateTokens();
        if (access_token) {
            res.send("Tokens atualizados com sucesso");
        } else {
            res.status(500).send("É necessário realizar uma nova autorização manual. Verifique os logs do servidor para mais informações.");
        }
    } catch (err) {
        console.error("Erro ao atualizar os tokens:", err.message);
        res.status(500).send("Erro ao atualizar os tokens");
    }
});

// Baixar vendas de um período selecionado
app.get('/getVendas', async (req, res) => {
  console.log("Iniciando rota /getVendas");
  
  const resposta = await authTest();
  console.log("Resultado do authTest:", resposta);

  if (resposta && resposta !== "Token inválido"){
    console.log("Token válido, buscando vendas...");
    const resultado = await getVendas(resposta);
    console.log("Resultado do getVendas:", resultado ? "Dados obtidos" : "Nenhum dado obtido");
    
    if (resultado) {
      console.log("Salvando vendas no banco de dados...");
      salvarVendas(resultado);
      console.log("Vendas salvas com sucesso");
    } else {
      console.log("Nenhuma venda para salvar");
    }
    
    res.send("OK");
  } else {
    console.log("Token inválido ou não encontrado, tentando obter novo token");
    const access_token = await getAuth();
    console.log("Resultado do getAuth:", access_token ? "Token obtido" : "Falha ao obter token");
    
    if (access_token) {
      console.log("Buscando vendas com o novo token...");
      const resultado = await getVendas(access_token);
      console.log("Resultado do getVendas:", resultado ? "Dados obtidos" : "Nenhum dado obtido");
      
      if (resultado) {
        console.log("Salvando vendas no banco de dados...");
        salvarVendas(resultado);
        console.log("Vendas salvas com sucesso");
      } else {
        console.log("Nenhuma venda para salvar");
      }
      
      res.send("OK");
    } else {
      console.log("Não foi possível obter um token válido");
      res.status(500).send("Não foi possível obter um token válido");
    }
  }
});

// ================================================================================================================
// Iniciando o servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});