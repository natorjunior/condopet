# 🐾 CondoPet API

API para Sistema de Gestão de Pets em Condomínios desenvolvida em Node.js com Express.

## 🚀 Como executar

### Pré-requisitos
- Node.js 14+ 
- npm ou yarn

### Instalação
```bash
# Instalar dependências
npm install

# Copiar e configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env conforme necessário

# Executar em modo desenvolvimento
npm run dev

# Executar em produção
npm start
```

## 📋 Funcionalidades

### 🔐 Autenticação
- **POST /auth/register** - Cadastro de usuário
- **POST /auth/login** - Login

### 👤 Usuários
- **GET /usuarios/:id** - Buscar usuário
- **PUT /usuarios/:id** - Atualizar usuário
- **DELETE /usuarios/:id** - Remover usuário
- **GET /usuarios/:usuarioId/pets** - Listar pets do usuário

### 🐶 Pets
- **POST /pets** - Criar pet
- **GET /pets/:id** - Detalhar pet
- **PUT /pets/:id** - Atualizar pet
- **DELETE /pets/:id** - Remover pet
- **GET /pets/:petId/vacinas** - Listar vacinas do pet
- **POST /pets/:petId/vacinas** - Registrar vacina

### 💉 Vacinas
- **PUT /vacinas/:id** - Atualizar vacina
- **DELETE /vacinas/:id** - Remover vacina

### 🔧 Serviços
- **POST /servicos** - Criar serviço
- **GET /servicos** - Listar serviços (com filtro por categoria)
- **GET /servicos/:id** - Detalhar serviço
- **PUT /servicos/:id** - Atualizar serviço
- **DELETE /servicos/:id** - Remover serviço

### 📸 Upload
- **POST /upload** - Upload de imagem (multipart/form-data)
- **POST /upload/base64** - Upload via base64

## 🔑 Autenticação

Todas as rotas (exceto registro e login) requerem autenticação via Bearer Token:

```
Authorization: Bearer <jwt_token>
```

## 📦 Banco de Dados

Utiliza SQLite como banco de dados. O arquivo `database.sqlite` será criado automaticamente na primeira execução.

## 🛡️ Segurança

- Senhas são hasheadas com bcrypt
- Autenticação via JWT
- Validação de tipos de arquivo para uploads
- Middleware de autenticação para rotas protegidas

## 📁 Estrutura do Projeto

```
src/
├── app.js              # Arquivo principal
├── database/
│   └── db.js          # Configuração do banco
├── middleware/
│   └── auth.js        # Middleware de autenticação
└── routes/
    ├── auth.js        # Rotas de autenticação
    ├── usuarios.js    # Rotas de usuários
    ├── pets.js        # Rotas de pets
    ├── vacinas.js     # Rotas de vacinas
    ├── servicos.js    # Rotas de serviços
    └── upload.js      # Rotas de upload
```

## 🧪 Testando a API

Você pode usar ferramentas como Postman, Insomnia ou curl para testar os endpoints.

Exemplo de cadastro:
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@email.com",
    "numero_apartamento": "101",
    "telefone": "11999999999",
    "senha": "123456"
  }'
```

## 📈 Health Check

- **GET /health** - Verificar status da API