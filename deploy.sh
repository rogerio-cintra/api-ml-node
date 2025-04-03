#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Iniciando processo de deploy...${NC}"

# Verifica se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js não está instalado. Instalando...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Verifica se o PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}Instalando PM2...${NC}"
    sudo npm install -g pm2
fi

# Verifica se o PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo -e "${RED}PostgreSQL não está instalado. Instalando...${NC}"
    sudo apt-get update
    sudo apt-get install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
fi

# Instala dependências
echo -e "${YELLOW}Instalando dependências...${NC}"
npm install

# Configura o banco de dados
echo -e "${YELLOW}Configurando banco de dados...${NC}"
sudo -u postgres psql -c "CREATE DATABASE aveloz;" || true
sudo -u postgres psql -d aveloz -f recriar-tabela-vendas.sql

# Configura o Nginx
echo -e "${YELLOW}Configurando Nginx...${NC}"
sudo cp nginx.conf /etc/nginx/sites-available/api-ml-aveloz
sudo ln -sf /etc/nginx/sites-available/api-ml-aveloz /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Inicia a aplicação com PM2
echo -e "${YELLOW}Iniciando aplicação...${NC}"
pm2 start ecosystem.config.js --env production
pm2 save

echo -e "${GREEN}Deploy concluído com sucesso!${NC}" 