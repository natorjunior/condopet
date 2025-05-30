const jwt = require('jsonwebtoken');
const { database } = require('../database/db');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de acesso requerido' });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Verificar se o usuário ainda existe
      const user = await database.get('SELECT id, nome, email FROM usuarios WHERE id = ?', [decoded.userId]);
      
      if (!user) {
        return res.status(401).json({ error: 'Usuário não encontrado' });
      }
      
      req.user = user;
      next();
    } catch (jwtError) {
      return res.status(401).json({ error: 'Token inválido' });
    }
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = authMiddleware;
