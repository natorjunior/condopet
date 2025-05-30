const express = require('express');
const authMiddleware = require('../middleware/auth');
const { database } = require('../database/db');

const router = express.Router();

/**
 * @swagger
 * /vacinas:
 *   post:
 *     summary: Registrar nova vacina
 *     tags: [Vacinas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, data_aplicacao, pet_id]
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Nome da vacina
 *               descricao:
 *                 type: string
 *                 description: Descrição da vacina
 *               data_aplicacao:
 *                 type: string
 *                 format: date
 *                 description: Data de aplicação da vacina
 *               pet_id:
 *                 type: integer
 *                 description: ID do pet
 *               veterinario:
 *                 type: string
 *                 description: Nome do veterinário
 *               observacoes:
 *                 type: string
 *                 description: Observações sobre a vacina
 *     responses:
 *       201:
 *         description: Vacina registrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 vacina:
 *                   $ref: '#/components/schemas/Vacina'
 */
// POST /vacinas - Registrar vacina
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nome, descricao, data_aplicacao, pet_id, veterinario, observacoes } = req.body;

    if (!nome || !data_aplicacao || !pet_id) {
      return res.status(400).json({ error: 'Nome, data_aplicacao e pet_id são obrigatórios' });
    }

    // Verificar se pet existe e pertence ao usuário
    const pet = await database.get('SELECT id FROM pets WHERE id = ? AND usuario_id = ?', [pet_id, req.user.id]);
    if (!pet) {
      return res.status(404).json({ error: 'Pet não encontrado ou não pertence ao usuário' });
    }

    const result = await database.run(
      'INSERT INTO vacinas (nome, descricao, data_aplicacao, pet_id, veterinario, observacoes) VALUES (?, ?, ?, ?, ?, ?)',
      [nome, descricao, data_aplicacao, pet_id, veterinario, observacoes]
    );

    const newVacina = await database.get('SELECT * FROM vacinas WHERE id = ?', [result.id]);

    res.status(201).json({
      message: 'Vacina registrada com sucesso',
      vacina: newVacina
    });
  } catch (error) {
    console.error('Erro ao registrar vacina:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /vacinas/{id}:
 *   put:
 *     summary: Atualizar vacina
 *     tags: [Vacinas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da vacina
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
 *                 description: Nome da vacina
 *               descricao:
 *                 type: string
 *                 description: Descrição da vacina
 *               data_aplicacao:
 *                 type: string
 *                 format: date
 *                 description: Data de aplicação da vacina
 *               veterinario:
 *                 type: string
 *                 description: Nome do veterinário
 *               observacoes:
 *                 type: string
 *                 description: Observações sobre a vacina
 *     responses:
 *       200:
 *         description: Vacina atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 vacina:
 *                   $ref: '#/components/schemas/Vacina'
 *       404:
 *         description: Vacina não encontrada
 */
// PUT /vacinas/:id - Atualizar vacina
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, data_aplicacao } = req.body;
    
    // Verificar se a vacina existe
    const existingVacina = await database.get('SELECT * FROM vacinas WHERE id = ?', [id]);
    if (!existingVacina) {
      return res.status(404).json({ error: 'Vacina não encontrada' });
    }
    
    let updateFields = [];
    let updateValues = [];
    
    if (nome) {
      updateFields.push('nome = ?');
      updateValues.push(nome);
    }
    if (descricao !== undefined) {
      updateFields.push('descricao = ?');
      updateValues.push(descricao);
    }
    if (data_aplicacao) {
      updateFields.push('data_aplicacao = ?');
      updateValues.push(data_aplicacao);
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);
    
    if (updateFields.length === 1) { // só updated_at
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }
    
    await database.run(
      `UPDATE vacinas SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    
    // Buscar vacina atualizada
    const updatedVacina = await database.get('SELECT * FROM vacinas WHERE id = ?', [id]);
    
    res.json({
      message: 'Vacina atualizada com sucesso',
      vacina: updatedVacina
    });
  } catch (error) {
    console.error('Erro ao atualizar vacina:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /vacinas/{id}:
 *   delete:
 *     summary: Remover vacina
 *     tags: [Vacinas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da vacina
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Vacina removida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Vacina não encontrada
 */
// DELETE /vacinas/:id - Remover vacina
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await database.run('DELETE FROM vacinas WHERE id = ?', [id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Vacina não encontrada' });
    }
    
    res.json({ message: 'Vacina removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover vacina:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
