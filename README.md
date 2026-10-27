# Casa de Leilões Teste - Elite Dev

Uma plataforma completa de leilões online em tempo real, onde leiloeiros gerem lotes e licitantes disputam itens com lances ao vivo.

## 🚀 Tecnologias Utilizadas

**Front-End:** React, Vite, Tailwind CSS, React Router, Socket.IO-client.
**Back-End:** NestJS, TypeScript, TypeORM, PostgreSQL, Redis, BullMQ, Socket.IO.

## 🏗️ Arquitetura e Decisões Técnicas

* **Resiliência de API Externa:** Para garantir que o sistema não fica inutilizável com instabilidades da API externa, a aplicação faz a requisição à *Fake Store API* apenas no momento da criação do lote pelo Leiloeiro. Os dados (imagem, atributos, título) são persistidos no nosso PostgreSQL. A Vitrine e a Sala do Lote consomem a nossa base de dados interna.
* **Comunicação em Tempo Real:** Utilização de WebSockets (Socket.IO) para garantir que lances, cronómetros e alertas de liderança sejam atualizados sem necessidade de recarregar a página.
* **Gerenciamento de Filas (Liquidação e Anti-Sniping):** O encerramento do lote é gerido por um *Worker* isolado via **BullMQ + Redis**. Se um lance for dado nos últimos 2 minutos, a regra de prorrogação (+2 min) é acionada e o BullMQ reagenda automaticamente a tarefa de liquidação, garantindo extrema fiabilidade na transferência de saldos.

## 🔒 Segurança e Auditoria (À prova de adulteração)

Para garantir que o histórico de lances é à prova de adulteração (mesmo direto na base de dados), foi implementada uma **Cadeia de Hash Criptográfica (Hash Chain)** baseada em SHA-256. 
* Cada lance inserido gera um hash único que combina os seus próprios dados (ID, valor, data, utilizador) com o `hash` do lance imediatamente anterior (`previousHash`). 
* A Rota de Auditoria Pública recalcula os hashes de toda a cadeia no momento da requisição. Se qualquer administrador alterar um cêntimo ou remover uma linha no PostgreSQL, a cadeia quebra e o sistema acusa "ADULTERADO" instantaneamente.

## 🛠️ Como Executar o Projeto Localmente

### 1. Pré-requisitos
* Node.js (v18+)
* Docker e Docker Compose instalados.

### 2. Levantar as Bases de Dados
Na raiz da pasta do backend, execute o comando para iniciar o PostgreSQL e o Redis:
\`\`\`bash
docker-compose up -d
\`\`\`

### 3. Configurar e Executar o Backend
\`\`\`bash
cd backend
npm install
# O projeto utiliza a sincronização automática do TypeORM.
# Inserir os dados de teste obrigatórios (1 Leiloeiro, 2 Licitantes e 1 Lote aberto)
npm run seed 
# Iniciar o servidor
npm run start:dev
\`\`\`

### 4. Configurar e Executar o Front-End
Em outro terminal:
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

A aplicação estará disponível em \`http://localhost:5173\`.

### 5. Utilizadores para Teste (Criados no Seed)
* **Leiloeiro:** `leiloeiro@verzel.com` (Senha: `123456`)
* **Licitante 1:** `cliente1@verzel.com` (Senha: `123456`)
* **Licitante 2:** `cliente2@verzel.com` (Senha: `123456`)