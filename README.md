
# Backend TrackBuy

## 🚀 **Sobre o Projeto**

O **Backend TrackBuy** é um sistema desenvolvido para gerenciar solicitações de compras em uma empresa. Ele permite que usuários criem, acompanhem e alterem o status de suas solicitações, sendo autenticados via **JSON Web Tokens (JWT)**.

## 🛠 **Tecnologias Usadas**

- **Node.js**: Ambiente de execução para o servidor.
- **Fastify**: Framework rápido para APIs.
- **MongoDB**: Banco de dados NoSQL para armazenar os dados.
- **JWT (JSON Web Tokens)**: Para autenticação e segurança das rotas.
- **bcryptjs**: Para criptografia das senhas.

## 📋 **Funcionalidades**

### 1. **Cadastro de Usuários (POST /register)**

O endpoint de cadastro permite criar novos usuários, informando `email`, `senha`, `tipoUsuario`, `nome` e `setor`. O tipo de usuário pode ser `solicitante` ou `comprador`. Ao criar o usuário, ele pode acessar o sistema com seu email e senha, gerando um token JWT para autenticação.

### 2. **Login (POST /login)**

O login gera um **JWT** para o usuário após validação das credenciais (email e senha). Esse token deve ser utilizado em todas as requisições subsequentes para garantir a segurança do sistema.

### 3. **Criação de Solicitação de Compra (POST /solicitacoes)**

Usuários autenticados podem criar solicitações de compra, informando os dados do produto como `nomeProduto`, `quantidade`, `prazo`, `fornecedorSugerido` e `linkFoto`. A solicitação será registrada com o status inicial `pendente`.

### 4. **Listagem de Solicitações (GET /dashboard)**

O endpoint `/dashboard` permite listar todas as solicitações de compra feitas, com a possibilidade de filtrá-las por `status` (como `pendente`, `aprovado` ou `negado`). O filtro por status é opcional e pode ser feito através de query parameters.

### 5. **Alteração de Status da Solicitação (PATCH /solicitacoes/:id/status)**

Apenas usuários com o tipo `comprador` podem alterar o status das solicitações de compra. Os status disponíveis são: `pendente`, `aprovado` e `negado`. Esta ação é essencial para a aprovação ou recusa das solicitações de compra.

## 📦 **Instruções para Instalação e Execução**

1. Clone o repositório:
    ```bash
    git clone https://github.com/seu-usuario/trackbuy-backend.git
    ```

2. Instale as dependências:
    ```bash
    cd trackbuy-backend
    npm install
    ```

3. Crie um arquivo `.env` na raiz do projeto e configure suas variáveis de ambiente:
    ```bash
    PORT=3000
    MONGO_URI=URL_DO_SEU_MONGO
    JWT_SECRET=SEGREDO_AQUI
    ```

4. Inicie o servidor:
    ```bash
    npm start
    ```

Agora, o backend estará rodando em `http://localhost:3000`.

## 🔑 **Sobre o Token JWT**

O **JSON Web Token (JWT)** é utilizado para autenticar as requisições. Ele contém informações sobre o usuário (como `id` e `tipoUsuario`) e é enviado nas **headers** de cada requisição.

### Exemplo de Header com o Token:

```
Authorization: Bearer SEU_TOKEN_AQUI
```

---
## Novas Funcionalidades Implementadas

### 1. Exportação de Solicitações
Agora é possível exportar as solicitações através de um arquivo CSV com filtros para **data** e **setor**. O formato para filtrar por data e setor é simples:

- **Filtro por período (data):**
    ```http
    GET /solicitacoes/exportar?startDate=2025-04-01&endDate=2025-04-30
    ```

- **Filtro por setor:**
    ```http
    GET /solicitacoes/exportar?setor=Marketing
    ```

### 2. Notificação para o Solicitante
Quando o status de uma solicitação é alterado (como "aprovado" ou "negado"), uma **notificação** é enviada automaticamente para o solicitante. A notificação informa o status da solicitação, como "Aprovada" ou "Rejeitada", com base na alteração.

### 3. Fuso Horário e Formatação de Data
As datas agora são retornadas e manipuladas com o formato **brasileiro** (`dd/MM/yyyy`), e o horário está ajustado para o **fuso horário do Brasil**.

---

**Como Usar:**

1. Para exportar as solicitações por **data** e **setor**, utilize os parâmetros `startDate`, `endDate`, e `setor` conforme exemplificado.
2. As notificações são enviadas automaticamente sempre que uma solicitação for atualizada com o novo status.

Essas atualizações tornam a exportação de dados mais flexível e mantêm os usuários informados sobre o status das suas solicitações.

**TrackBuy - Backend** desenvolvido por **Lucca Rodrigues**.
