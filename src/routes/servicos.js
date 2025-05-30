const express = require('express');
const authMiddleware = require('../middleware/auth');
const { database } = require('../database/db');

const router = express.Router();

/**
 * @swagger
 * /servicos:
 *   post:
 *     summary: Criar novo serviço
 *     tags: [Serviços]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, categoria, contato]
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Nome do serviço
 *               tipo:
 *                 type: string
 *                 description: Tipo do serviço
 *               descricao:
 *                 type: string
 *                 description: Descrição do serviço
 *               categoria:
 *                 type: string
 *                 description: Categoria do serviço
 *               contato:
 *                 type: string
 *                 description: Informações de contato
 *               prestador:
 *                 type: string
 *                 description: Nome do prestador do serviço
 *               preco:
 *                 type: number
 *                 format: float
 *                 description: Preço do serviço
 *               data_servico:
 *                 type: string
 *                 format: date
 *                 description: Data do serviço
 *               foto:
 *                 type: string
 *                 description: URL da foto do serviço
 *     responses:
 *       201:
 *         description: Serviço criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 servico:
 *                   $ref: '#/components/schemas/Servico'
 */
// POST /servicos - Criar serviço
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nome, tipo, descricao, categoria, contato, prestador, preco, data_servico, foto } = req.body;

    // Aceitar tanto o formato antigo quanto o novo
    const servicoNome = nome || tipo;
    const servicoCategoria = categoria || tipo;
    const servicoContato = contato || prestador;

    if (!servicoNome && !tipo) {
      return res.status(400).json({ error: 'Nome ou tipo do serviço é obrigatório' });
    }

    const result = await database.run(
      'INSERT INTO servicos (nome, tipo, descricao, categoria, contato, prestador, preco, data_servico, foto) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [servicoNome, tipo, descricao, servicoCategoria, contato, prestador, preco, data_servico, foto]
    );

    const newServico = await database.get('SELECT * FROM servicos WHERE id = ?', [result.id]);

    res.status(201).json({
      message: 'Serviço criado com sucesso',
      servico: newServico
    });
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /servicos:
 *   get:
 *     summary: Listar todos os serviços
 *     tags: [Serviços]
 *     parameters:
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *         description: Filtrar por categoria
 *     responses:
 *       200:
 *         description: Lista de serviços
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Servico'
 */
// GET /servicos - Listar todos os serviços
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { categoria } = req.query;
    
    let sql = 'SELECT * FROM servicos';
    let params = [];
    
    if (categoria) {
      sql += ' WHERE categoria = ?';
      params.push(categoria);
    }
    
    sql += ' ORDER BY nome';
    
    const servicos = await database.all(sql, params);
    
    res.json(servicos);
  } catch (error) {
    console.error('Erro ao listar serviços:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /servicos/{id}:
 *   get:
 *     summary: Detalhar serviço por ID
 *     tags: [Serviços]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do serviço
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalhes do serviço
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Servico'
 *       404:
 *         description: Serviço não encontrado
 */
// GET /servicos/:id - Detalhar serviço
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const servico = await database.get('SELECT * FROM servicos WHERE id = ?', [id]);
    
    if (!servico) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }
    
    res.json(servico);
  } catch (error) {
    console.error('Erro ao buscar serviço:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /servicos/{id}:
 *   put:
 *     summary: Atualizar serviço
 *     tags: [Serviços]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do serviço
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
 *                 description: Nome do serviço
 *               descricao:
 *                 type: string
 *                 description: Descrição do serviço
 *               categoria:
 *                 type: string
 *                 description: Categoria do serviço
 *               contato:
 *                 type: string
 *                 description: Informações de contato
 *               foto:
 *                 type: string
 *                 description: URL da foto do serviço
 *     responses:
 *       200:
 *         description: Serviço atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 servico:
 *                   $ref: '#/components/schemas/Servico'
 *       404:
 *         description: Serviço não encontrado
 */
// PUT /servicos/:id - Atualizar serviço
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, categoria, contato, foto } = req.body;
    
    // Verificar se o serviço existe
    const existingServico = await database.get('SELECT * FROM servicos WHERE id = ?', [id]);
    if (!existingServico) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
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
    if (categoria) {
      updateFields.push('categoria = ?');
      updateValues.push(categoria);
    }
    if (contato) {
      updateFields.push('contato = ?');
      updateValues.push(contato);
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
      `UPDATE servicos SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    
    // Buscar serviço atualizado
    const updatedServico = await database.get('SELECT * FROM servicos WHERE id = ?', [id]);
    
    res.json({
      message: 'Serviço atualizado com sucesso',
      servico: updatedServico
    });
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /servicos/{id}:
 *   delete:
 *     summary: Remover serviço
 *     tags: [Serviços]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do serviço
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Serviço removido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Serviço não encontrado
 */
// DELETE /servicos/:id - Remover serviço
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await database.run('DELETE FROM servicos WHERE id = ?', [id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }
    
    res.json({ message: 'Serviço removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover serviço:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
