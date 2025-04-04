const { listarSolicitacoesHandler, dashboardCompradoraHandler } = require('../controllers/dashboard.controller');
const authenticate = require('../middlewares/auth');

async function dashboardRoutes(fastify, options) {
  fastify.get('/dashboard', { preHandler: [authenticate] }, listarSolicitacoesHandler);

  fastify.get('/dashboard/compradora', { preHandler: [authenticate] }, dashboardCompradoraHandler);

}

module.exports = dashboardRoutes;