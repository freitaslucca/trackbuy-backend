const { listarSolicitacoesHandler } = require('../controllers/dashboard.controller');
const authenticate = require('../middlewares/auth');

async function dashboardRoutes(fastify, options) {
  fastify.get('/dashboard', { preHandler: [authenticate] }, listarSolicitacoesHandler);
}

module.exports = dashboardRoutes;