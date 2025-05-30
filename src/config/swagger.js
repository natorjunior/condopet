const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CondoPet API',
      version: '1.0.0',
      description: 'API para Sistema de Gestão de Pets em Condomínios',
      contact: {
        name: 'nator.costa',
        email: 'nator.costa@example.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desenvolvimento'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Usuario: {
          type: 'object',
          required: ['nome', 'email', 'numero_apartamento', 'senha'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único do usuário'
            },
            nome: {
              type: 'string',
              description: 'Nome completo do usuário'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email único do usuário'
            },
            numero_apartamento: {
              type: 'string',
              description: 'Número do apartamento'
            },
            telefone: {
              type: 'string',
              description: 'Telefone de contato'
            },
            foto: {
              type: 'string',
              description: 'URL da foto do usuário'
            },
            senha: {
              type: 'string',
              description: 'Senha do usuário (apenas para criação)'
            }
          }
        },        Pet: {
          type: 'object',
          required: ['nome', 'usuario_id'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único do pet'
            },
            nome: {
              type: 'string',
              description: 'Nome do pet'
            },
            especie: {
              type: 'string',
              description: 'Espécie do pet (cachorro, gato, etc.)'
            },
            raca: {
              type: 'string',
              description: 'Raça do pet'
            },
            idade: {
              type: 'integer',
              description: 'Idade do pet em anos'
            },
            porte: {
              type: 'string',
              enum: ['pequeno', 'medio', 'grande'],
              description: 'Porte do pet'
            },
            peso: {
              type: 'number',
              format: 'float',
              description: 'Peso do pet em kg'
            },
            data_nascimento: {
              type: 'string',
              format: 'date',
              description: 'Data de nascimento do pet'
            },
            data_adocao: {
              type: 'string',
              format: 'date',
              description: 'Data de adoção do pet'
            },
            descricao: {
              type: 'string',
              description: 'Descrição adicional do pet'
            },
            foto: {
              type: 'string',
              description: 'URL da foto do pet'
            },
            usuario_id: {
              type: 'integer',
              description: 'ID do usuário dono do pet'
            }
          }
        },        Vacina: {
          type: 'object',
          required: ['nome', 'data_aplicacao'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único da vacina'
            },
            nome: {
              type: 'string',
              description: 'Nome da vacina'
            },
            descricao: {
              type: 'string',
              description: 'Descrição da vacina'
            },
            data_aplicacao: {
              type: 'string',
              format: 'date',
              description: 'Data de aplicação da vacina'
            },
            veterinario: {
              type: 'string',
              description: 'Nome do veterinário que aplicou a vacina'
            },
            observacoes: {
              type: 'string',
              description: 'Observações sobre a vacina'
            },
            pet_id: {
              type: 'integer',
              description: 'ID do pet vacinado'
            }
          }
        },        Servico: {
          type: 'object',
          required: ['nome', 'categoria', 'contato'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único do serviço'
            },
            nome: {
              type: 'string',
              description: 'Nome do serviço'
            },
            tipo: {
              type: 'string',
              description: 'Tipo do serviço'
            },
            descricao: {
              type: 'string',
              description: 'Descrição do serviço'
            },
            categoria: {
              type: 'string',
              description: 'Categoria do serviço'
            },
            contato: {
              type: 'string',
              description: 'Informações de contato'
            },
            prestador: {
              type: 'string',
              description: 'Nome do prestador do serviço'
            },
            preco: {
              type: 'number',
              format: 'float',
              description: 'Preço do serviço'
            },
            data_servico: {
              type: 'string',
              format: 'date',
              description: 'Data do serviço'
            },
            foto: {
              type: 'string',
              description: 'URL da foto do serviço'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensagem de erro'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Mensagem de sucesso'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs
};
