# 📘 API - Sistema de Gestão de Pets em Condomínios

## 📌 Entidades e Endpoints

### 🧑 Usuário
Campos:
- `id`, `nome`, `email`, `numero_apartamento`, `telefone`, `foto`, `senha_hash`

Endpoints:
- `POST /auth/register` - Cadastro
- `POST /auth/login` - Login
- `GET /usuarios/:id` - Buscar usuário
- `PUT /usuarios/:id` - Atualizar
- `DELETE /usuarios/:id` - Remover

---

### 🐶 Pet
Campos:
- `id`, `nome`, `porte`, `peso`, `data_nascimento`, `data_adocao`, `foto`, `usuario_id`

Endpoints:
- `POST /pets` - Criar pet
- `GET /pets/:id` - Detalhar pet
- `GET /usuarios/:usuarioId/pets` - Pets do usuário
- `PUT /pets/:id` - Atualizar pet
- `DELETE /pets/:id` - Remover pet

---

### 💉 Vacina
Campos:
- `id`, `nome`, `descricao`, `data_aplicacao`, `pet_id`

Endpoints:
- `POST /pets/:petId/vacinas` - Registrar vacina
- `GET /pets/:petId/vacinas` - Listar vacinas
- `PUT /vacinas/:id` - Atualizar
- `DELETE /vacinas/:id` - Remover

---

### 🧰 Serviço
Campos:
- `id`, `nome`, `descricao`, `categoria`, `contato`, `foto`

Endpoints:
- `POST /servicos` - Criar serviço
- `GET /servicos` - Listar todos
- `GET /servicos/:id` - Detalhar serviço
- `PUT /servicos/:id` - Atualizar
- `DELETE /servicos/:id` - Remover

---

## 🔐 Autenticação
- JWT Token via `Authorization: Bearer <token>`

## 🖼️ Upload de Imagens
- `POST /upload` (usuário e pet) — `multipart/form-data` ou base64

---

## 📅 Futuro
- Chat com o síndico (em planejamento)
