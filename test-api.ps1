# Script de Teste da API CondoPet
# Execute este script no PowerShell para testar todos os endpoints

$baseUrl = "http://localhost:3000"
$headers = @{"Content-Type"="application/json"}

Write-Host "🧪 Testando API CondoPet..." -ForegroundColor Cyan

# 1. Health Check
Write-Host "`n📊 1. Testando Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "✅ Health Check: $($health.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro no Health Check: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Cadastro de usuário
Write-Host "`n👤 2. Cadastrando usuário..." -ForegroundColor Yellow
$userBody = @{
    nome = "Maria Silva"
    email = "maria@condopet.com"
    numero_apartamento = "102"
    telefone = "11988887777"
    senha = "senha123"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Headers $headers -Body $userBody
    Write-Host "✅ Usuário cadastrado: $($registerResponse.user.nome)" -ForegroundColor Green
    $token = $registerResponse.token
    $userId = $registerResponse.user.id
} catch {
    Write-Host "❌ Erro no cadastro: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Login
Write-Host "`n🔐 3. Fazendo login..." -ForegroundColor Yellow
$loginBody = @{
    email = "maria@condopet.com"
    senha = "senha123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Headers $headers -Body $loginBody
    Write-Host "✅ Login realizado: $($loginResponse.user.nome)" -ForegroundColor Green
    $token = $loginResponse.token
} catch {
    Write-Host "❌ Erro no login: $($_.Exception.Message)" -ForegroundColor Red
}

# Headers com autenticação
$authHeaders = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token"
}

# 4. Buscar usuário
Write-Host "`n👥 4. Buscando usuário..." -ForegroundColor Yellow
try {
    $user = Invoke-RestMethod -Uri "$baseUrl/usuarios/$userId" -Method GET -Headers $authHeaders
    Write-Host "✅ Usuário encontrado: $($user.nome) - Apt: $($user.numero_apartamento)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao buscar usuário: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Criar pet
Write-Host "`n🐶 5. Cadastrando pet..." -ForegroundColor Yellow
$petBody = @{
    nome = "Bobby"
    porte = "medio"
    peso = 15.5
    data_nascimento = "2022-05-10"
    data_adocao = "2022-07-15"
    usuario_id = $userId
} | ConvertTo-Json

try {
    $petResponse = Invoke-RestMethod -Uri "$baseUrl/pets" -Method POST -Headers $authHeaders -Body $petBody
    Write-Host "✅ Pet cadastrado: $($petResponse.pet.nome)" -ForegroundColor Green
    $petId = $petResponse.pet.id
} catch {
    Write-Host "❌ Erro ao cadastrar pet: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Listar pets do usuário
Write-Host "`n🐕 6. Listando pets do usuário..." -ForegroundColor Yellow
try {
    $pets = Invoke-RestMethod -Uri "$baseUrl/usuarios/$userId/pets" -Method GET -Headers $authHeaders
    Write-Host "✅ Pets encontrados: $($pets.Count)" -ForegroundColor Green
    foreach ($pet in $pets) {
        Write-Host "   - $($pet.nome) ($($pet.porte))" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Erro ao listar pets: $($_.Exception.Message)" -ForegroundColor Red
}

# 7. Registrar vacina
Write-Host "`n💉 7. Registrando vacina..." -ForegroundColor Yellow
$vacinaBody = @{
    nome = "V8"
    descricao = "Vacina óctupla"
    data_aplicacao = "2024-01-15"
} | ConvertTo-Json

try {
    $vacinaResponse = Invoke-RestMethod -Uri "$baseUrl/pets/$petId/vacinas" -Method POST -Headers $authHeaders -Body $vacinaBody
    Write-Host "✅ Vacina registrada: $($vacinaResponse.vacina.nome)" -ForegroundColor Green
    $vacinaId = $vacinaResponse.vacina.id
} catch {
    Write-Host "❌ Erro ao registrar vacina: $($_.Exception.Message)" -ForegroundColor Red
}

# 8. Listar vacinas do pet
Write-Host "`n🏥 8. Listando vacinas do pet..." -ForegroundColor Yellow
try {
    $vacinas = Invoke-RestMethod -Uri "$baseUrl/pets/$petId/vacinas" -Method GET -Headers $authHeaders
    Write-Host "✅ Vacinas encontradas: $($vacinas.Count)" -ForegroundColor Green
    foreach ($vacina in $vacinas) {
        Write-Host "   - $($vacina.nome) - $($vacina.data_aplicacao)" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Erro ao listar vacinas: $($_.Exception.Message)" -ForegroundColor Red
}

# 9. Criar serviço
Write-Host "`n🛠️ 9. Cadastrando serviço..." -ForegroundColor Yellow
$servicoBody = @{
    nome = "Veterinária Pet Care"
    descricao = "Clínica veterinária especializada"
    categoria = "Saúde"
    contato = "11977776666"
} | ConvertTo-Json

try {
    $servicoResponse = Invoke-RestMethod -Uri "$baseUrl/servicos" -Method POST -Headers $authHeaders -Body $servicoBody
    Write-Host "✅ Serviço cadastrado: $($servicoResponse.servico.nome)" -ForegroundColor Green
    $servicoId = $servicoResponse.servico.id
} catch {
    Write-Host "❌ Erro ao cadastrar serviço: $($_.Exception.Message)" -ForegroundColor Red
}

# 10. Listar serviços
Write-Host "`n📋 10. Listando serviços..." -ForegroundColor Yellow
try {
    $servicos = Invoke-RestMethod -Uri "$baseUrl/servicos" -Method GET -Headers $authHeaders
    Write-Host "✅ Serviços encontrados: $($servicos.Count)" -ForegroundColor Green
    foreach ($servico in $servicos) {
        Write-Host "   - $($servico.nome) ($($servico.categoria))" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Erro ao listar serviços: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Teste completo! Todos os endpoints principais foram testados." -ForegroundColor Green
Write-Host "📝 Token JWT para uso manual: $token" -ForegroundColor Cyan
