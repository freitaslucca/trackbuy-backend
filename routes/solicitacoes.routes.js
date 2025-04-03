const { criarSolicitacaoHandler, atualizarStatusHandler,painelCompradoraHandler,exportarSolicitacoesHandler } = require('../controllers/solicitacoes.controller');
const{ getNotificacoesHandler } = require('../controllers/notificacoes.controller')
const authenticate = require('../middlewares/auth');

async function solicitacoesRoutes(fastify, options) {
  fastify.post('/solicitacoes', { preHandler: [authenticate] }, criarSolicitacaoHandler);

  fastify.patch('/solicitacoes/:id/status', {
    preHandler: [authenticate],
    handler: atualizarStatusHandler
  });
    // Rota para o painel da compradora
    fastify.get('/painel/compradora', { preHandler: [authenticate] }, painelCompradoraHandler);

    // Nova rota para pegar notificações
    fastify.get('/notificacoes', { preHandler: [authenticate] }, getNotificacoesHandler);

    fastify.get('/solicitacoes/exportar', { preHandler: [authenticate] }, exportarSolicitacoesHandler);
}

module.exports = solicitacoesRoutes;