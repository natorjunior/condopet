# Teste Completo da API CondoPet
# Este script testa todos os endpoints principais da API

$baseUrl = "http://localhost:3000"
$headers = @{ "Content-Type" = "application/json" }

Write-Host "🧪 Iniciando testes completos da API CondoPet..." -ForegroundColor Cyan
Write-Host ""

# 1. Teste Health Check
Write-Host "1️⃣ Testando Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/health" -Method GET
    $healthData = $response.Content | ConvertFrom-Json
    Write-Host "✅ Health Check OK: $($healthData.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro no Health Check: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. Teste de Registro de Usuário
Write-Host "`n2️⃣ Testando Registro de Usuário..." -ForegroundColor Yellow
$newUser = @{
    nome = "João Silva"
    email = "joao.silva@email.com"
    senha = "senha123"
    numero_apartamento = "202"
    telefone = "11987654321"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/register" -Method POST -Body $newUser -ContentType "application/json"
    $userData = $response.Content | ConvertFrom-Json
    $token = $userData.token
    Write-Host "✅ Usuário registrado: $($userData.user.nome)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro no registro: $($_.Exception.Message)" -ForegroundColor Red
    # Tentar login se usuário já existe
    Write-Host "Tentando fazer login..." -ForegroundColor Yellow
    $loginData = @{
        email = "joao.silva@email.com"
        senha = "senha123"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/auth/login" -Method POST -Body $loginData -ContentType "application/json"
        $userData = $response.Content | ConvertFrom-Json
        $token = $userData.token
        Write-Host "✅ Login realizado: $($userData.user.nome)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erro no login: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Headers com autorização
$authHeaders = @{ 
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token"
}

# 3. Teste de Cadastro de Pet
Write-Host "`n3️⃣ Testando Cadastro de Pet..." -ForegroundColor Yellow
$newPet = @{
    nome = "Rex"
    especie = "Cachorro"
    raca = "Golden Retriever"
    idade = 3
    peso = 25.5
    descricao = "Pet muito carinhoso e brincalhão"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/pets" -Method POST -Body $newPet -Headers $authHeaders
    $petData = $response.Content | ConvertFrom-Json
    $petId = $petData.pet.id
    Write-Host "✅ Pet cadastrado: $($petData.pet.nome)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro no cadastro do pet: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Teste de Listagem de Pets
Write-Host "`n4️⃣ Testando Listagem de Pets..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/pets" -Method GET -Headers $authHeaders
    $petsData = $response.Content | ConvertFrom-Json
    Write-Host "✅ Pets listados: $($petsData.pets.Count) pet(s) encontrado(s)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro na listagem de pets: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Teste de Cadastro de Vacina
if ($petId) {
    Write-Host "`n5️⃣ Testando Cadastro de Vacina..." -ForegroundColor Yellow
    $newVacina = @{
        pet_id = $petId
        nome = "Raiva"
        data_aplicacao = "2024-01-15"
        veterinario = "Dr. Carlos Medeiros"
        observacoes = "Vacina anual aplicada com sucesso"
    } | ConvertTo-Json

    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/vacinas" -Method POST -Body $newVacina -Headers $authHeaders
        $vacinaData = $response.Content | ConvertFrom-Json
        Write-Host "✅ Vacina cadastrada: $($vacinaData.vacina.nome)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erro no cadastro da vacina: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 6. Teste de Cadastro de Serviço
Write-Host "`n6️⃣ Testando Cadastro de Serviço..." -ForegroundColor Yellow
$newServico = @{
    tipo = "Veterinário"
    descricao = "Consulta de rotina e check-up completo"
    preco = 150.00
    data_servico = "2024-02-10"
    prestador = "Clínica Veterinária PetCare"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/servicos" -Method POST -Body $newServico -Headers $authHeaders
    $servicoData = $response.Content | ConvertFrom-Json
    Write-Host "✅ Serviço cadastrado: $($servicoData.servico.tipo)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro no cadastro do serviço: $($_.Exception.Message)" -ForegroundColor Red
}

# 7. Teste de Listagem de Usuários
Write-Host "`n7️⃣ Testando Listagem de Usuários..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/usuarios" -Method GET -Headers $authHeaders
    $usuariosData = $response.Content | ConvertFrom-Json
    Write-Host "✅ Usuários listados: $($usuariosData.usuarios.Count) usuário(s) encontrado(s)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro na listagem de usuários: $($_.Exception.Message)" -ForegroundColor Red
}

# 8. Teste de Swagger UI
Write-Host "`n8️⃣ Testando Swagger UI..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api-docs" -Method GET
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Swagger UI acessível" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Erro no acesso ao Swagger UI: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Testes concluídos!" -ForegroundColor Cyan
Write-Host "📊 Acesse a documentação Swagger em: $baseUrl/api-docs" -ForegroundColor Blue
Write-Host "🔗 Health Check disponível em: $baseUrl/health" -ForegroundColor Blue
