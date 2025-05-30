const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Criar diretório de uploads se não existir
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Aceitar apenas imagens
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limite
  }
});

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload de imagem via multipart/form-data
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo de imagem
 *     responses:
 *       200:
 *         description: Upload realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 url:
 *                   type: string
 *                   description: URL da imagem uploadada
 *                 filename:
 *                   type: string
 *                   description: Nome do arquivo gerado
 *                 originalName:
 *                   type: string
 *                   description: Nome original do arquivo
 *                 size:
 *                   type: integer
 *                   description: Tamanho do arquivo em bytes
 *       400:
 *         description: Nenhum arquivo enviado
 */
// POST /upload - Upload de imagem
router.post('/', authMiddleware, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      message: 'Upload realizado com sucesso',
      url: imageUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /upload/base64:
 *   post:
 *     summary: Upload de imagem via base64
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [image, filename]
 *             properties:
 *               image:
 *                 type: string
 *                 description: Imagem codificada em base64 com prefixo data:image/...;base64,
 *               filename:
 *                 type: string
 *                 description: Nome desejado para o arquivo
 *     responses:
 *       200:
 *         description: Upload realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 url:
 *                   type: string
 *                   description: URL da imagem uploadada
 *                 filename:
 *                   type: string
 *                   description: Nome do arquivo gerado
 *       400:
 *         description: Dados inválidos ou formato base64 incorreto
 */
// POST /upload/base64 - Upload via base64
router.post('/base64', authMiddleware, (req, res) => {
  try {
    const { image, filename } = req.body;

    if (!image || !filename) {
      return res.status(400).json({ error: 'Imagem (base64) e filename são obrigatórios' });
    }

    // Verificar se é base64 válido
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Formato base64 inválido' });
    }

    const imageType = matches[1];
    const imageData = matches[2];

    // Verificar se é imagem
    if (!imageType.startsWith('image/')) {
      return res.status(400).json({ error: 'Apenas imagens são permitidas' });
    }

    // Gerar nome único para o arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = imageType.split('/')[1];
    const newFilename = `${filename}-${uniqueSuffix}.${ext}`;
    const filePath = path.join(uploadsDir, newFilename);

    // Salvar arquivo
    fs.writeFileSync(filePath, imageData, 'base64');

    const imageUrl = `/uploads/${newFilename}`;
    
    res.json({
      message: 'Upload realizado com sucesso',
      url: imageUrl,
      filename: newFilename
    });
  } catch (error) {
    console.error('Erro no upload base64:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Middleware de erro para multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Arquivo muito grande (máximo 5MB)' });
    }
  }
  res.status(400).json({ error: error.message });
});

module.exports = router;
