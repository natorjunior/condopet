# 📘 Documentação da API CondoPet

## 🔗 Base URL
```
http://localhost:3000
```

## 🔐 Autenticação

Para rotas protegidas, inclua o token JWT no header:
```
Authorization: Bearer <seu_token_jwt>
```

---

## 🧑 Endpoints de Usuário

### POST /auth/register - Cadastro
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "numero_apartamento": "101",
  "telefone": "11999999999",
  "senha": "123456",
  "foto": "https://exemplo.com/foto.jpg"
}
```

**Resposta:**
```json
{
  "message": "Usuário cadastrado com sucesso",
  "user": {
    "id": 1,
    "nome": "João Silva",
    "email": "joao@email.com",
    "numero_apartamento": "101",
    "telefone": "11999999999",
    "foto": "https://exemplo.com/foto.jpg"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /auth/login - Login
```json
{
  "email": "joao@email.com",
  "senha": "123456"
}
```

### GET /usuarios/:id - Buscar usuário
**Headers:** `Authorization: Bearer <token>`

### PUT /usuarios/:id - Atualizar usuário
**Headers:** `Authorization: Bearer <token>`
```json
{
  "nome": "João Silva Santos",
  "telefone": "11888888888"
}
```

### DELETE /usuarios/:id - Remover usuário
**Headers:** `Authorization: Bearer <token>`

### GET /usuarios/:usuarioId/pets - Pets do usuário
**Headers:** `Authorization: Bearer <token>`

---

## 🐶 Endpoints de Pet

### POST /pets - Criar pet
**Headers:** `Authorization: Bearer <token>`
```json
{
  "nome": "Rex",
  "porte": "grande",
  "peso": 25.5,
  "data_nascimento": "2020-03-15",
  "data_adocao": "2020-06-01",
  "foto": "/uploads/rex.jpg",
  "usuario_id": 1
}
```

### GET /pets/:id - Detalhar pet
**Headers:** `Authorization: Bearer <token>`

### PUT /pets/:id - Atualizar pet
**Headers:** `Authorization: Bearer <token>`
```json
{
  "nome": "Rex Jr.",
  "peso": 26.0
}
```

### DELETE /pets/:id - Remover pet
**Headers:** `Authorization: Bearer <token>`

---

## 💉 Endpoints de Vacina

### POST /pets/:petId/vacinas - Registrar vacina
**Headers:** `Authorization: Bearer <token>`
```json
{
  "nome": "Antirrábica",
  "descricao": "Vacina contra raiva",
  "data_aplicacao": "2024-01-15"
}
```

### GET /pets/:petId/vacinas - Listar vacinas
**Headers:** `Authorization: Bearer <token>`

### PUT /vacinas/:id - Atualizar vacina
**Headers:** `Authorization: Bearer <token>`
```json
{
  "nome": "Antirrábica Reforço",
  "data_aplicacao": "2024-01-16"
}
```

### DELETE /vacinas/:id - Remover vacina
**Headers:** `Authorization: Bearer <token>`

---

## 🧰 Endpoints de Serviço

### POST /servicos - Criar serviço
**Headers:** `Authorization: Bearer <token>`
```json
{
  "nome": "Pet Shop do João",
  "descricao": "Banho e tosa para cães e gatos",
  "categoria": "Estética",
  "contato": "11999999999",
  "foto": "/uploads/petshop.jpg"
}
```

### GET /servicos - Listar serviços
**Headers:** `Authorization: Bearer <token>`
**Query params:** `?categoria=Estética`

### GET /servicos/:id - Detalhar serviço
**Headers:** `Authorization: Bearer <token>`

### PUT /servicos/:id - Atualizar serviço
**Headers:** `Authorization: Bearer <token>`
```json
{
  "nome": "Pet Shop Premium",
  "contato": "11888888888"
}
```

### DELETE /servicos/:id - Remover serviço
**Headers:** `Authorization: Bearer <token>`

---

## 📸 Endpoints de Upload

### POST /upload - Upload multipart
**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form data:**
- `image`: arquivo de imagem (máx 5MB)

**Resposta:**
```json
{
  "message": "Upload realizado com sucesso",
  "url": "/uploads/image-1640995200000-123456789.jpg",
  "filename": "image-1640995200000-123456789.jpg",
  "originalName": "minha-foto.jpg",
  "size": 1024000
}
```

### POST /upload/base64 - Upload base64
**Headers:** `Authorization: Bearer <token>`
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "filename": "minha-foto"
}
```

---

## 🏥 Health Check

### GET /health - Status da API
```json
{
  "status": "OK",
  "message": "API CondoPet funcionando!"
}
```

---

## ⚠️ Códigos de Erro

- **400 Bad Request** - Dados inválidos ou campos obrigatórios ausentes
- **401 Unauthorized** - Token inválido ou ausente
- **403 Forbidden** - Não autorizado para esta ação
- **404 Not Found** - Recurso não encontrado
- **500 Internal Server Error** - Erro interno do servidor

**Exemplo de resposta de erro:**
```json
{
  "error": "Token de acesso requerido"
}
```
