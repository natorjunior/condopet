const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initDatabase } = require('./database/db');
const { swaggerUi, specs } = require('./config/swagger');
const authRoutes = require('./routes/auth');
const usuarioRoutes = require('./routes/usuarios');
const petRoutes = require('./routes/pets');
const vacinaRoutes = require('./routes/vacinas');
const servicoRoutes = require('./routes/servicos');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos para uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }'
}));

// Rotas
app.use('/auth', authRoutes);
app.use('/usuarios', usuarioRoutes);
app.use('/pets', petRoutes);
app.use('/vacinas', vacinaRoutes);
app.use('/servicos', servicoRoutes);
app.use('/upload', uploadRoutes);

// Rota de saúde
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'API CondoPet funcionando!' });
});

// Rota raiz com link para documentação
app.get('/', (req, res) => {
  res.json({ 
    message: 'Bem-vindo à API CondoPet!',
    documentation: 'http://localhost:3000/api-docs',
    health: 'http://localhost:3000/health'
  });
});

// Middleware de erro global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo deu errado!' });
});

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Inicializar banco de dados e servidor
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
  });
}).catch(err => {
  console.error('Erro ao inicializar banco de dados:', err);
});

module.exports = app;
