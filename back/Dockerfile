
FROM node:24-alpine

# Define a pasta de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de dependência e instala
COPY package*.json ./
RUN npm install

# Copia o resto do código
COPY . .

# Compila o NestJS (TypeScript para JavaScript)
RUN npm run build

# Expõe a porta 3000
EXPOSE 3000

# Comando para iniciar o servidor em produção
CMD ["npm", "run", "start:prod"]