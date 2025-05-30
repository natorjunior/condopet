const express = require('express');
const bcrypt = require('bcrypt');
const authMiddleware = require('../middleware/auth');
const { database } = require('../database/db');

const router = express.Router();

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Listar todos os usuários
 *     tags: [Usuários]
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 usuarios:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Usuario'
 */
// GET /usuarios - Listar todos os usuários
router.get('/', authMiddleware, async (req, res) => {
  try {
    const usuarios = await database.all(
      'SELECT id, nome, email, numero_apartamento, telefone, foto, created_at FROM usuarios ORDER BY nome'
    );
    
    res.json({ usuarios });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     summary: Buscar usuário por ID
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do usuário
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// GET /usuarios/:id - Buscar usuário
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await database.get(
      'SELECT id, nome, email, numero_apartamento, telefone, foto, created_at FROM usuarios WHERE id = ?',
      [id]
    );
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /usuarios/{id}:
 *   put:
 *     summary: Atualizar usuário
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do usuário
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Nome do usuário
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email do usuário
 *               numero_apartamento:
 *                 type: string
 *                 description: Número do apartamento
 *               telefone:
 *                 type: string
 *                 description: Telefone do usuário
 *               foto:
 *                 type: string
 *                 description: URL da foto do usuário
 *               senha:
 *                 type: string
 *                 description: Nova senha do usuário
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/Usuario'
 *       403:
 *         description: Não autorizado
 *       404:
 *         description: Usuário não encontrado
 */
// PUT /usuarios/:id - Atualizar usuário
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, numero_apartamento, telefone, foto, senha } = req.body;
    
    // Verificar se o usuário existe
    const existingUser = await database.get('SELECT * FROM usuarios WHERE id = ?', [id]);
    if (!existingUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Verificar se o usuário pode atualizar (só pode atualizar próprios dados)
    if (req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: 'Não autorizado a atualizar este usuário' });
    }
    
    let updateFields = [];
    let updateValues = [];
    
    if (nome) {
      updateFields.push('nome = ?');
      updateValues.push(nome);
    }
    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (numero_apartamento) {
      updateFields.push('numero_apartamento = ?');
      updateValues.push(numero_apartamento);
    }
    if (telefone !== undefined) {
      updateFields.push('telefone = ?');
      updateValues.push(telefone);
    }
    if (foto !== undefined) {
      updateFields.push('foto = ?');
      updateValues.push(foto);
    }
    if (senha) {
      const senha_hash = await bcrypt.hash(senha, 10);
      updateFields.push('senha_hash = ?');
      updateValues.push(senha_hash);
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);
    
    if (updateFields.length === 1) { // só updated_at
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }
    
    await database.run(
      `UPDATE usuarios SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    
    // Buscar usuário atualizado
    const updatedUser = await database.get(
      'SELECT id, nome, email, numero_apartamento, telefone, foto, updated_at FROM usuarios WHERE id = ?',
      [id]
    );
    
    res.json({
      message: 'Usuário atualizado com sucesso',
      user: updatedUser
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /usuarios/{id}:
 *   delete:
 *     summary: Remover usuário
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do usuário
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuário removido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       403:
 *         description: Não autorizado
 *       404:
 *         description: Usuário não encontrado
 */
// DELETE /usuarios/:id - Remover usuário
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o usuário pode deletar (só pode deletar próprios dados)
    if (req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: 'Não autorizado a deletar este usuário' });
    }
    
    const result = await database.run('DELETE FROM usuarios WHERE id = ?', [id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json({ message: 'Usuário removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /usuarios/{usuarioId}/pets:
 *   get:
 *     summary: Listar pets de um usuário
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         description: ID do usuário
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de pets do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pet'
 */
// GET /usuarios/:usuarioId/pets - Pets do usuário
router.get('/:usuarioId/pets', authMiddleware, async (req, res) => {
  try {
    const { usuarioId } = req.params;
    
    const pets = await database.all(
      'SELECT * FROM pets WHERE usuario_id = ? ORDER BY nome',
      [usuarioId]
    );
    
    res.json(pets);
  } catch (error) {
    console.error('Erro ao buscar pets do usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
