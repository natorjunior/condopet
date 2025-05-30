# Use a imagem oficial do Node.js
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Instalar curl para healthcheck
RUN apk add --no-cache curl

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY src/ ./src/

# Criar diretórios necessários
RUN mkdir -p /app/data /app/uploads

# Expor a porta
EXPOSE 3000

# Definir usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Ajustar permissões dos diretórios de dados
RUN chown -R nodejs:nodejs /app
RUN chmod -R 755 /app/data /app/uploads

USER nodejs

# Comando para iniciar a aplicação
CMD ["node", "src/app.js"]
