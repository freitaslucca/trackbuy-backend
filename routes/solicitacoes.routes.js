const { criarSolicitacaoHandler, atualizarStatusHandler } = require('../controllers/solicitacoes.controller');
const authenticate = require('../middlewares/auth');

async function solicitacoesRoutes(fastify, options) {
  fastify.post('/solicitacoes', { preHandler: [authenticate] }, criarSolicitacaoHandler);

  fastify.patch('/solicitacoes/:id/status', {
    preHandler: [authenticate],
    handler: atualizarStatusHandler
  });
}

module.exports = solicitacoesRoutes;