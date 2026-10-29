# Sistema de Leilões - Elite Dev 🚀

> ⚠️ **Nota Importante sobre Dependências de Desenvolvimento:** Ao rodar `npm audit` na pasta do backend, o sistema pode apontar 6 vulnerabilidades de severidade baixa (*low*). Elas são exclusivas do ecossistema interno do **Jest** e do `deepmerge` em ambiente de teste. Como não afetam a produção e qualquer tentativa forçada de correção quebra a compatibilidade de testes do NestJS, elas foram mantidas intencionalmente para garantir a validação rigorosa das regras de negócio.

Um sistema completo, reativo e seguro para gerenciamento de leilões, licitantes e arremates, com auditoria antifraude baseada em criptografia e processamento de filas de alta performance.

---

## 🛠️ Tech Stack

O projeto adota uma arquitetura moderna e conteinerizada:

**Back-End:**
* **Framework:** Node.js com NestJS
* **Banco de Dados:** PostgreSQL (Relacional)
* **Mensageria/Filas:** Redis + BullMQ (Para encerramento de lotes e assincronicidade)
* **Comunicação Real-Time:** WebSockets (Socket.IO)
* **ORM:** TypeORM
* **Testes:** Jest

**Front-End:**
* **Framework:** React com Vite
* **Estilização:** Tailwind CSS v4 (com suporte total nativo a Dark Mode)
* **Comunicação API:** Axios (com interceptadores de sessão)

**Infraestrutura:**
* Docker & Docker Compose

---

## 🚀 Como Executar o Projeto (Docker)

O projeto foi totalmente orquestrado com Docker para que rode em qualquer máquina com um único comando, sem a necessidade de instalar Node, Postgres ou Redis localmente.

### Pré-requisitos
* **Docker** e **Docker Compose** instalados na máquina.

### Passo a Passo

1. **Abra o terminal** na raiz do projeto (onde o arquivo `docker-compose.yml` está localizado).
2. **Construa e inicie os containers** rodando o comando:
   ```bash
   docker-compose up --build -d
    ```
3.  **Acompanhe a inicialização** (opcional, para ver a mágica do backend populando o banco):
    
    Bash
    
    ```
    docker-compose logs -f backend
    ```
    
    _O backend possui um módulo de `Seed` que detecta se o banco está vazio e injeta automaticamente Licitantes, Leiloeiro e Lotes (Ao Vivo, Agendados e Encerrados)._
    
4.  **Acesse a Aplicação:**
    
    -   **Front-End:** [http://localhost:5173](http://localhost:5173)
        
    -   **Back-End (API):** [http://localhost:3000](http://localhost:3000)
        

### Contas de Teste Pré-Configuradas (Seed):

-   **Leiloeiro:** `admin@leilao.com` | Senha: `123456`
    
-   **Licitante 1 (Rico):** `carlos@email.com` | Senha: `123456`
    
-   **Licitante 2:** `maria@email.com` | Senha: `123456`
    

_(Para parar o sistema, rode `docker-compose down`)._

## 🛡️ Contexto do Sistema Anti-Fraude (Hash SHA-256)

Para garantir a integridade absoluta dos leilões e impedir que administradores alterem lances diretamente no banco de dados (ex: mudar o valor de um lance vencedor), implementamos um sistema de **Chain of Custody (Cadeia de Custódia)** inspirado na tecnologia Blockchain.

### Como Funciona:

1.  Cada lance dado gera um **Hash SHA-256** determinístico, utilizando os dados daquele lance (`bidId`, `lotId`, `userId`, `amount`, `createdAt`) **+** o hash do lance imediatamente anterior.
    
2.  O primeiro lance do lote utiliza a palavra `GENESIS` como hash anterior.
    
3.  Isso cria uma corrente inquebrável. Se um único centavo (`amount`) ou data for alterado manualmente no banco de dados por um atacante, o hash armazenado não baterá mais com o recálculo do sistema.
    
4.  **O Teste FinaL (Auditoria):** O método `auditLot` varre o histórico. Se qualquer lance foi adulterado, a corrente é quebrada, a flag `isChainIntact` passa para `false`, e o painel de auditoria expõe a fraude visualmente, isolando o lance criminoso.
    

## ⚙️ Funcionalidades: Comportamentos Esperados e Inesperados

### Comportamentos Esperados (Projetados)

-   **Fila de Encerramento (BullMQ):** Lotes que atingem o tempo limite são processados por uma fila no Redis. Se o lote tiver vencedor, o sistema debita automaticamente o saldo do licitante e credita o leiloeiro numa única transação atômica (`transaction`). Se terminar sem lances, encerra de forma isolada.
    
-   **Atualização em Tempo Real:** Conectados à mesma página de lote, todos os clientes veem o novo lance entrar na mesma fração de segundo via WebSocket.
    
-   **Auto-Logout Segurança:** O interceptador do Axios monitora o status 401. Se o token expirar ou for inválido, o sistema silenciosamente remove o cache e redireciona para a tela de login.
    

### Comportamentos "Inesperados" (Limites do Sistema e Resoluções)

-   **Concorrência de Lances (Race Condition):** Se dois usuários clicarem em dar lance no mesmo milissegundo, pode haver um comportamento onde um se sobrepõe. _Resolução:_ O uso de transações no TypeORM previne a duplicidade, rejeitando o lance inferior caso a validação em banco constate que o preço já subiu.
    
-   **Piscada do WebSocket:** Se o container do Redis reiniciar, o WebSocket pode perder conexão temporal. _Resolução:_ O Socket.IO está configurado com `polling` de reconexão automática, então o sistema volta ao normal em poucos segundos sem intervenção do usuário.
    
-   **Modo Escuro no Autocomplete:** Em alguns navegadores baseados em Chromium, o autocompletar de senhas (fundo amarelo) quebra temporariamente o estilo do dark mode nos inputs, voltando ao normal ao interagir com a tela.
    

## 🤖 Utilização de Inteligência Artificial

A Inteligência Artificial (LLMs baseados em arquiteturas avançadas como GPT-4/Claude/Gemini) foi utilizada neste projeto como uma ferramenta de **Pair Programming** (programação em dupla) e **Code Review**, atuando especificamente em:

1.  **Resolução de Conflitos Ambientais:** Auxílio na configuração estrita do Node.js em modo nativo ESM (ECMAScript Modules) com o Jest, lidando com erros de compilação cruzada (`import` vs `require`) e injeção de flags no `package.json` (`--experimental-vm-modules`).
    
2.  **Refatoração Visual (UI/UX):** Criação de lógicas para o modo escuro (Tailwind v4) de forma nativa (`@custom-variant dark`), evitando falhas de contraste (branco sobre branco) em componentes críticos como login e registro.
    
3.  **Mocking Avançado de Testes:** Orientações sobre como burlar restrições de tipagem estrita (`never`) do TypeScript no ecossistema do `@jest/globals` utilizando Type Assertions (`as any`) em testes envolvendo conexões de banco de dados (`transaction`).
    
4.  **Infraestrutura Docker:** Aperfeiçoamento do `Dockerfile` e do `docker-compose.yml`, introduzindo `.dockerignore` para reduzir o tempo de build em 95% e aplicando nomes de volumes exclusivos (`elitedev_pgdata`) para evitar reaproveitamento de dados espúrios da máquina do desenvolvedor.