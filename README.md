# API MeLi Aveloz

API para integração com o Mercado Livre, desenvolvida para a Aveloz.

## Requisitos

- Node.js 18+
- PostgreSQL
- NPM ou Yarn

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/api-ml-node.git
cd api-ml-node
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. Inicie o servidor:
```bash
npm start
```

## Configuração

O arquivo `.env` deve conter as seguintes variáveis:

```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aveloz
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
```

## Scripts Disponíveis

- `npm start`: Inicia o servidor em modo produção
- `npm run dev`: Inicia o servidor em modo desenvolvimento com hot-reload
- `npm test`: Executa os testes
- `npm run lint`: Executa o linter

## Estrutura do Projeto

```
api-ml-node/
├── src/
│   ├── config/         # Configurações do projeto
│   ├── controllers/    # Controladores da API
│   ├── models/        # Modelos do banco de dados
│   ├── routes/        # Rotas da API
│   └── services/      # Serviços e lógica de negócio
├── tests/             # Testes
├── .env.example       # Exemplo de variáveis de ambiente
├── ecosystem.config.js # Configuração do PM2
└── package.json       # Dependências e scripts
```

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes. 