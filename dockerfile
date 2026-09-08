# Etapa 1: Build da aplicação
FROM node:20-alpine AS build

WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências
RUN npm ci

# Copia o restante do projeto
COPY . .

# Gera o build de produção
RUN npm run build


# Etapa 2: Servidor Nginx
FROM nginx:alpine

# Remove a configuração padrão
RUN rm -rf /usr/share/nginx/html/*

# Copia o build do React
COPY --from=build /app/dist /usr/share/nginx/html

# Configuração para React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia entrypoint e usa-o para injetar variáveis em runtime
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expõe a porta HTTP
EXPOSE 80

# Usa entrypoint que escreve env-config.js a partir de variáveis de ambiente
ENTRYPOINT ["/entrypoint.sh"]
