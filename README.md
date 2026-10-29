# Sistema de Leilões - Elite Dev 🚀

> ⚠️ **Nota Importante sobre Dependências de Desenvolvimento:** Ao rodar `npm audit` na pasta do backend, o sistema apontará 6 vulnerabilidades de severidade baixa (*low*). Elas são exclusivas do ecossistema interno do **Jest** (especificamente a biblioteca `deepmerge`) em ambiente isolado de teste. Como não afetam a produção e qualquer tentativa forçada de correção quebra a compatibilidade de testes nativos do NestJS, elas foram mantidas intencionalmente para garantir a validação rigorosa das regras de negócio e estabilidade do código.

Um sistema completo, reativo e seguro para gerenciamento de leilões, licitantes e arremates. O projeto foi desenhado sob uma arquitetura distribuída, com auditoria antifraude baseada em criptografia e processamento de filas de alta performance para encerramento automático de lotes.

O repositório está dividido em duas frentes principais:
* `/back`: API RESTful construída com NestJS.
* `/front`: Single Page Application (SPA) construída com React e Vite.

---

### 🔑 Contas de Teste Injetadas Pelo Sistema (Seed):

Seja rodando via Docker ou Local, o banco será populado com estes acessos para testes imediatos:

-   **Perfil Leiloeiro:** `admin@leilao.com` | Senha: `123456`
    
-   **Perfil Licitante 1 (Com Saldo Alto):** `carlos@email.com` | Senha: `123456`
    
-   **Perfil Licitante 2 (Com Saldo Baixo):** `maria@email.com` | Senha: `123456`

## 🛠️ Tech Stack e Arquitetura

O projeto adota uma arquitetura moderna, com separação clara de responsabilidades:

**Back-End (API):**
* **Node.js + NestJS:** Framework progressivo adotado pela sua arquitetura modular (Controllers, Services, Modules) fortemente tipada com TypeScript.
* **PostgreSQL:** Banco de dados relacional para garantir a integridade das transações financeiras e relacionamentos complexos (ACID).
* **Redis + BullMQ:** Sistema em memória utilizado para processamento de filas assíncronas (jobs), responsável por monitorar o tempo e executar o encerramento cronometrado dos lotes sem travar o Event Loop da API principal.
* **Socket.IO:** Canal de WebSockets bidirecional para transmissão de lances em tempo real para todos os clientes conectados.
* **TypeORM:** Mapeamento objeto-relacional estruturado.
* **Jest:** Testes unitários focados nas regras financeiras e validações de criptografia.

**Front-End (UI/UX):**
* **React + Vite:** Renderização ágil e build ultrarrápido utilizando módulos nativos ES (ESM).
* **Tailwind CSS v4:** Motor de estilização utilitário com suporte customizado a Dark Mode (`@custom-variant dark`) integrado diretamente no HTML.
* **Axios:** Cliente HTTP configurado com Interceptadores para gerenciamento automático de ciclo de vida do Token JWT (Logout automático em erros 401).

---

## 🐳 Como Executar o Projeto (COM DOCKER) - Recomendado

O projeto foi orquestrado para subir com um único comando, abstraindo completamente a configuração de bancos de dados.

### Pré-requisitos
* **Docker** e **Docker Compose** instalados.

### Passo a Passo
1. Abra o terminal na raiz do projeto (onde o arquivo `docker-compose.yml` está localizado).
2. Construa e inicie todos os serviços:
   ```bash
   docker-compose up --build -d
   ```
3.  Opcional: acompanhe a injeção automática de dados (_seed_):
    
    Bash
    
    ```
    docker-compose logs -f backend
    ```
    
4.  **Acesse a Aplicação:**
    
    -   Front-End: [http://localhost:5173](http://localhost:5173)
        
    -   Back-End (API): [http://localhost:3000](http://localhost:3000)
        

## 💻 Como Executar o Projeto (SEM DOCKER / Localmente)

Caso deseje rodar a aplicação diretamente no sistema operacional (_bare metal_), você precisará configurar os serviços dependentes manualmente.

### Pré-requisitos Locais

-   **Node.js** (versão 20 ou superior).
    
-   **PostgreSQL** (versão 15+) rodando na porta 5432.
    
-   **Redis** (versão 7+) rodando na porta 6379.
    

### Passo 1: Configuração do Banco de Dados

Acesse o seu PostgreSQL (via pgAdmin, DBeaver ou psql) e crie um banco de dados em branco chamado `leilaodb`.

### Passo 2: Configuração do Back-End

1.  Abra um terminal e navegue até a pasta do backend:
    
    Bash
    
    ```
    cd back
    ```
    
2.  Crie um arquivo `.env` na raiz da pasta `back` contendo as variáveis de conexão locais:
    
    Snippet de código
    
    ```
    DB_HOST=localhost
    DB_PORT=5432
    DB_USER=seu_usuario_do_postgres
    DB_PASSWORD=sua_senha_do_postgres
    DB_NAME=leilaodb
    REDIS_HOST=localhost
    REDIS_PORT=6379
    JWT_SECRET=chave_secreta_elite_dev_2026
    ```
    
3.  Instale as dependências:
    
    Bash
    
    ```
    npm install
    ```
    
4.  Inicie o servidor em modo de desenvolvimento:
    
    Bash
    
    ```
    npm run start:dev
    ```
    
    _(Nota: Ao iniciar, o `SeedService` do NestJS detectará o banco de dados vazio e criará automaticamente as tabelas e os dados falsos iniciais)._
    

### Passo 3: Configuração do Front-End

1.  Abra um **novo** terminal e navegue até a pasta do frontend:
    
    Bash
    
    ```
    cd front
    ```
    
2.  Crie um arquivo `.env` na raiz da pasta `front` apontando para a sua API local:
    
    Snippet de código
    
    ```
    VITE_API_URL=http://localhost:3000
    ```
    
3.  Instale as dependências:
    
    Bash
    
    ```
    npm install
    ```
    
4.  Inicie a interface:
    
    Bash
    
    ```
    npm run dev
    ```
    

### 🔑 Contas de Teste Injetadas Pelo Sistema (Seed):

Seja rodando via Docker ou Local, o banco será populado com estes acessos para testes imediatos:

-   **Perfil Leiloeiro:** `admin@leilao.com` | Senha: `123456`
    
-   **Perfil Licitante 1 (Com Saldo Alto):** `carlos@email.com` | Senha: `123456`
    
-   **Perfil Licitante 2 (Com Saldo Baixo):** `maria@email.com` | Senha: `123456`
    

## 🛡️ Contexto do Sistema Anti-Fraude (Hash SHA-256)

Para garantir a integridade absoluta dos leilões e impedir que administradores ou invasores alterem lances diretamente no banco de dados (ex: manipular o valor de um lance vencedor após o encerramento), implementamos um sistema de **Cadeia de Custódia** (_Chain of Custody_), inspirado no funcionamento estrutural de Blockchains.

### Funcionamento Matemático:

1.  **Ligação Criptográfica:** Cada novo lance registrado gera um **Hash SHA-256** determinístico. Esse hash é calculado fundindo os dados brutos daquele lance (`bidId`, `lotId`, `userId`, `amount`, `createdAt`) **somados** ao hash gerado pelo lance imediatamente anterior. O primeiríssimo lance do lote utiliza a string fixa `GENESIS` como raiz.
    
2.  **Efeito Avalanche:** Isso cria uma corrente imutável. Se um único caractere ou centavo for alterado no banco de dados, o hash salvo já não corresponderá à fórmula original daquele bloco, quebrando não apenas aquele lance, mas toda a cadeia subsequente.
    
3.  **Auditoria Punitiva:** O sistema possui a funcionalidade de "Auditar Lote" (`auditLot`). Quando acionada, ela recalcula a cadeia inteira em tempo real. Se for detectada divergência (fraude/adulteração), a flag geral `isChainIntact` torna-se `false` e o painel de auditoria expõe visualmente o ID do lance específico que foi adulterado.
    

## ⚙️ Funcionalidades: Comportamentos Esperados e Inesperados

### Comportamentos Esperados (Features Projetadas)

-   **Liquidação via Fila (BullMQ):** O encerramento do leilão não depende de requisições HTTP manuais. Lotes que atingem o tempo limite são processados silenciosamente em background por um _worker_ do Redis. Se houver vencedor, o débito do saldo comprometido do licitante e o crédito na conta do leiloeiro ocorrem em uma transação atômica (`Transaction` do banco). Se terminar sem lances, o sistema anula o encerramento financeiro e o lote é marcado apenas como Encerrado.
    
-   **Reatividade Global:** Dois usuários visualizando a mesma tela verão o saldo do lote subir na exata mesma fração de segundo em que um lance for disparado, graças a emissão de eventos isolados via WebSockets (Rooms do Socket.IO).
    
-   **Auto-Logout de Segurança e Cache Zero:** Interceptadores Axios monitoram todas as requisições. Receber um status HTTP `401 Unauthorized` por expiração força uma remoção de cache rígida (`localStorage`) e redireciona o usuário para o `/login` usando navegação Window nativa, limpando o State Management do React.
    

### Comportamentos "Inesperados" (Fatores Contornados)

-   **Condição de Corrida (Race Condition) em Lances Simultâneos:** Cenário onde múltiplos usuários pressionam "Dar Lance" no mesmo milissegundo. _Resolução:_ Uma trava no nível do backend impede sobreposições validando se o valor proposto ainda é superior ao lance mais alto recém-registrado na mesma transação, rejeitando lances atrasados.
    
-   **Quedas Temporárias do Redis:** Em ambientes locais (sem Docker), se o serviço do Redis for reiniciado manualmente, o WebSocket perderá a conexão temporalmente. _Resolução:_ O cliente React do Socket.IO está configurado com `long-polling` como fallback de reconexão automática. O sistema normaliza em segundos sem necessidade de recarregar a aba (F5).
    
-   **Pintura Nativa do Navegador no Dark Mode:** Em navegadores Chrome/Edge, o "autofill" (preenchimento automático de senhas) sobrepõe estilos amarelos fixos por segurança, o que poderia contrastar com o modo escuro. _Resolução:_ Aplicamos o hack `-webkit-text-fill-color` e `box-shadow inset` no arquivo de injeção global CSS do Tailwind para preservar o dark mode mesmo sobre o preenchimento nativo do browser.
    

## 🤖 Utilização de Inteligência Artificial

A Inteligência Artificial (utilizando LLMs de arquiteturas avançadas) atuou como uma ferramenta indispensável de **Pair Programming** e **Troubleshooting** (solução de problemas), sendo aplicada nas seguintes frentes críticas do desenvolvimento:

1. Assistência na adaptação dos testes e do ambiente NestJS para a resolução do bloqueio do Jest configurando suporte nativo `--experimental-vm-modules` sem transpilações pesadas de Babel.
    
2.  **Engenharia de Contorno de Tipagem (Type Casting) em Testes:** Burlar restrições severas de tipagem (erros `never`) impostas pelo `@jest/globals` durante simulações complexas de banco de dados (`jest.fn().mockImplementation`). A IA orientou o uso cirúrgico de conversões `as any` e retornos controlados de Promessas (`Promise.resolve`) para manter o TDD sem bloquear o compilador.
    
3.  **Refatoração UI/UX e Modos de Cor Dinâmicos:** Adaptação da sintaxe revolucionária do novo **Tailwind v4** para gerir cores condicionais de Dark/Light mode através da diretiva manual `@custom-variant dark`, desenhando componentes com cores consistentes para leitura (ex: texto cinza num input branco vs texto branco num input ardósia escuro).
    
4.  **Otimização de DevOps e Infraestrutura:** Criação otimizada dos Dockerfiles para Node, incluindo implementações essenciais como `.dockerignore` – que resultou numa queda expressiva do tamanho de contexto transferido no build – e a criação de nomes de volume exclusivos para o Compose (ex: `elitedev_pgdata`), evitando falsos positivos de cache residual durante os reinícios do banco de dados na máquina host.