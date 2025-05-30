const express = require('express');
const authMiddleware = require('../middleware/auth');
const { database } = require('../database/db');

const router = express.Router();

/**
 * @swagger
 * /pets:
 *   post:
 *     summary: Criar um novo pet
 *     tags: [Pets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pet'
 *     responses:
 *       201:
 *         description: Pet criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 pet:
 *                   $ref: '#/components/schemas/Pet'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// POST /pets - Criar pet
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nome, porte, peso, data_nascimento, data_adocao, foto, usuario_id, especie, raca, idade, descricao } = req.body;

    // Usar o ID do usuário autenticado se não fornecido
    const petUsuarioId = usuario_id || req.user.id;

    if (!nome) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    // Verificar se porte é válido
    if (porte && !['pequeno', 'medio', 'grande'].includes(porte)) {
      return res.status(400).json({ error: 'Porte deve ser: pequeno, medio ou grande' });
    }

    // Verificar se o usuário existe (se foi fornecido um usuario_id diferente)
    if (usuario_id && usuario_id !== req.user.id) {
      const user = await database.get('SELECT id FROM usuarios WHERE id = ?', [usuario_id]);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
    }

    const result = await database.run(
      'INSERT INTO pets (nome, porte, peso, data_nascimento, data_adocao, foto, usuario_id, especie, raca, idade, descricao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [nome, porte, peso, data_nascimento, data_adocao, foto, petUsuarioId, especie, raca, idade, descricao]
    );

    const newPet = await database.get('SELECT * FROM pets WHERE id = ?', [result.id]);

    res.status(201).json({
      message: 'Pet criado com sucesso',
      pet: newPet
    });
  } catch (error) {
    console.error('Erro ao criar pet:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /pets:
 *   get:
 *     summary: Listar todos os pets
 *     tags: [Pets]
 *     responses:
 *       200:
 *         description: Lista de pets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pets:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Pet'
 */
// GET /pets - Listar todos os pets
router.get('/', authMiddleware, async (req, res) => {
  try {
    const pets = await database.all(`
      SELECT p.*, u.nome as dono_nome, u.numero_apartamento 
      FROM pets p 
      JOIN usuarios u ON p.usuario_id = u.id 
      ORDER BY p.nome
    `);
    
    res.json({ pets });
  } catch (error) {
    console.error('Erro ao listar pets:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /pets/{id}:
 *   get:
 *     summary: Buscar pet por ID
 *     tags: [Pets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do pet
 *     responses:
 *       200:
 *         description: Pet encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pet'
 *       404:
 *         description: Pet não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// GET /pets/:id - Detalhar pet
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const pet = await database.get(`
      SELECT p.*, u.nome as dono_nome, u.numero_apartamento 
      FROM pets p 
      JOIN usuarios u ON p.usuario_id = u.id 
      WHERE p.id = ?
    `, [id]);
    
    if (!pet) {
      return res.status(404).json({ error: 'Pet não encontrado' });
    }
    
    res.json(pet);
  } catch (error) {
    console.error('Erro ao buscar pet:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /pets/{id}:
 *   put:
 *     summary: Atualizar pet
 *     tags: [Pets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do pet
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
 *                 description: Nome do pet
 *               porte:
 *                 type: string
 *                 enum: [pequeno, medio, grande]
 *                 description: Porte do pet
 *               peso:
 *                 type: number
 *                 format: float
 *                 description: Peso do pet em kg
 *               data_nascimento:
 *                 type: string
 *                 format: date
 *                 description: Data de nascimento do pet
 *               data_adocao:
 *                 type: string
 *                 format: date
 *                 description: Data de adoção do pet
 *               foto:
 *                 type: string
 *                 description: URL da foto do pet
 *     responses:
 *       200:
 *         description: Pet atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 pet:
 *                   $ref: '#/components/schemas/Pet'
 *       403:
 *         description: Não autorizado
 *       404:
 *         description: Pet não encontrado
 */
// PUT /pets/:id - Atualizar pet
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, porte, peso, data_nascimento, data_adocao, foto } = req.body;
    
    // Verificar se o pet existe
    const existingPet = await database.get('SELECT * FROM pets WHERE id = ?', [id]);
    if (!existingPet) {
      return res.status(404).json({ error: 'Pet não encontrado' });
    }
    
    // Verificar se porte é válido
    if (porte && !['pequeno', 'medio', 'grande'].includes(porte)) {
      return res.status(400).json({ error: 'Porte deve ser: pequeno, medio ou grande' });
    }
    
    let updateFields = [];
    let updateValues = [];
    
    if (nome) {
      updateFields.push('nome = ?');
      updateValues.push(nome);
    }
    if (porte) {
      updateFields.push('porte = ?');
      updateValues.push(porte);
    }
    if (peso !== undefined) {
      updateFields.push('peso = ?');
      updateValues.push(peso);
    }
    if (data_nascimento !== undefined) {
      updateFields.push('data_nascimento = ?');
      updateValues.push(data_nascimento);
    }
    if (data_adocao !== undefined) {
      updateFields.push('data_adocao = ?');
      updateValues.push(data_adocao);
    }
    if (foto !== undefined) {
      updateFields.push('foto = ?');
      updateValues.push(foto);
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);
    
    if (updateFields.length === 1) { // só updated_at
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }
    
    await database.run(
      `UPDATE pets SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    
    // Buscar pet atualizado
    const updatedPet = await database.get('SELECT * FROM pets WHERE id = ?', [id]);
    
    res.json({
      message: 'Pet atualizado com sucesso',
      pet: updatedPet
    });
  } catch (error) {
    console.error('Erro ao atualizar pet:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /pets/{id}:
 *   delete:
 *     summary: Remover pet
 *     tags: [Pets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do pet
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pet removido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Pet não encontrado
 */
// DELETE /pets/:id - Remover pet
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await database.run('DELETE FROM pets WHERE id = ?', [id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Pet não encontrado' });
    }
    
    res.json({ message: 'Pet removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover pet:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /pets/{petId}/vacinas:
 *   get:
 *     summary: Listar vacinas do pet
 *     tags: [Pets]
 *     parameters:
 *       - in: path
 *         name: petId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do pet
 *     responses:
 *       200:
 *         description: Lista de vacinas do pet
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Vacina'
 *   post:
 *     summary: Registrar nova vacina para o pet
 *     tags: [Pets]
 *     parameters:
 *       - in: path
 *         name: petId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do pet
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Vacina'
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
// GET /pets/:petId/vacinas - Listar vacinas do pet
router.get('/:petId/vacinas', authMiddleware, async (req, res) => {
  try {
    const { petId } = req.params;
    
    // Verificar se pet existe
    const pet = await database.get('SELECT id FROM pets WHERE id = ?', [petId]);
    if (!pet) {
      return res.status(404).json({ error: 'Pet não encontrado' });
    }
    
    const vacinas = await database.all(
      'SELECT * FROM vacinas WHERE pet_id = ? ORDER BY data_aplicacao DESC',
      [petId]
    );
    
    res.json(vacinas);
  } catch (error) {
    console.error('Erro ao buscar vacinas do pet:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /pets/:petId/vacinas - Registrar vacina
router.post('/:petId/vacinas', authMiddleware, async (req, res) => {
  try {
    const { petId } = req.params;
    const { nome, descricao, data_aplicacao } = req.body;

    if (!nome || !data_aplicacao) {
      return res.status(400).json({ error: 'Nome e data_aplicacao são obrigatórios' });
    }

    // Verificar se pet existe
    const pet = await database.get('SELECT id FROM pets WHERE id = ?', [petId]);
    if (!pet) {
      return res.status(404).json({ error: 'Pet não encontrado' });
    }

    const result = await database.run(
      'INSERT INTO vacinas (nome, descricao, data_aplicacao, pet_id) VALUES (?, ?, ?, ?)',
      [nome, descricao, data_aplicacao, petId]
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

module.exports = router;
