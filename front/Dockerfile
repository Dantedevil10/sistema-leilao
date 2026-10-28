
FROM node:24-alpine

# Define a pasta de trabalho
WORKDIR /app

# Copia os arquivos e instala as dependências
COPY package*.json ./
RUN npm install

# Copia o resto do código
COPY . .

# O Vite precisa saber a URL do backend na hora do build
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL

# Faz o build de produção do React
RUN npm run build

# Expõe a porta padrão do Vite (5173)
EXPOSE 5173

# Usa o Vite Preview para servir a pasta dist (build) na rede do Docker
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]