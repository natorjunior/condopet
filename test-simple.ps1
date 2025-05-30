# Script de Teste da API CondoPet
# Execute este script no PowerShell para testar todos os endpoints

$baseUrl = "http://localhost:3000"
$headers = @{"Content-Type"="application/json"}

Write-Host "Testando API CondoPet..." -ForegroundColor Cyan

# 1. Health Check
Write-Host "1. Testando Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "Health Check OK: $($health.message)" -ForegroundColor Green
} catch {
    Write-Host "Erro no Health Check: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Cadastro de usuario
Write-Host "2. Cadastrando usuario..." -ForegroundColor Yellow
$userBody = @{
    nome = "Maria Silva"
    email = "maria@condopet.com"
    numero_apartamento = "102"
    telefone = "11988887777"
    senha = "senha123"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Headers $headers -Body $userBody
    Write-Host "Usuario cadastrado: $($registerResponse.user.nome)" -ForegroundColor Green
    $token = $registerResponse.token
    $userId = $registerResponse.user.id
} catch {
    Write-Host "Erro no cadastro: $($_.Exception.Message)" -ForegroundColor Red
    return
}

# Headers com autenticacao
$authHeaders = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token"
}

# 3. Criar pet
Write-Host "3. Cadastrando pet..." -ForegroundColor Yellow
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
    Write-Host "Pet cadastrado: $($petResponse.pet.nome)" -ForegroundColor Green
    $petId = $petResponse.pet.id
} catch {
    Write-Host "Erro ao cadastrar pet: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Registrar vacina
Write-Host "4. Registrando vacina..." -ForegroundColor Yellow
$vacinaBody = @{
    nome = "V8"
    descricao = "Vacina octupla"
    data_aplicacao = "2024-01-15"
} | ConvertTo-Json

try {
    $vacinaResponse = Invoke-RestMethod -Uri "$baseUrl/pets/$petId/vacinas" -Method POST -Headers $authHeaders -Body $vacinaBody
    Write-Host "Vacina registrada: $($vacinaResponse.vacina.nome)" -ForegroundColor Green
} catch {
    Write-Host "Erro ao registrar vacina: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Criar servico
Write-Host "5. Cadastrando servico..." -ForegroundColor Yellow
$servicoBody = @{
    nome = "Veterinaria Pet Care"
    descricao = "Clinica veterinaria especializada"
    categoria = "Saude"
    contato = "11977776666"
} | ConvertTo-Json

try {
    $servicoResponse = Invoke-RestMethod -Uri "$baseUrl/servicos" -Method POST -Headers $authHeaders -Body $servicoBody
    Write-Host "Servico cadastrado: $($servicoResponse.servico.nome)" -ForegroundColor Green
} catch {
    Write-Host "Erro ao cadastrar servico: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Teste completo! API funcionando corretamente." -ForegroundColor Green
Write-Host "Token para uso manual: $token" -ForegroundColor Cyan
