#!/bin/bash

# Atualizar o sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js e npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Instalar Nginx
sudo apt install -y nginx

# Instalar PM2 globalmente
sudo npm install -g pm2

# Criar usuário do banco de dados
sudo -u postgres psql -c "CREATE USER seu_usuario WITH PASSWORD 'sua_senha';"
sudo -u postgres psql -c "CREATE DATABASE melidb;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE melidb TO seu_usuario;"

# Configurar Nginx
sudo cp nginx.conf /etc/nginx/sites-available/api-ml
sudo ln -s /etc/nginx/sites-available/api-ml /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# Instalar dependências do projeto
npm install

# Iniciar a aplicação com PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup 