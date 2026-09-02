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

# Expõe a porta HTTP
EXPOSE 443

# Inicia o Nginx
CMD ["nginx", "-g", "daemon off;"]
