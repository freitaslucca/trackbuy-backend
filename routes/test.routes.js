const authenticate = require('../middlewares/auth');

async function testRoutes(fastify, options) {
  fastify.get('/protegido', { preHandler: [authenticate] }, async (request, reply) => {
    return {
      success: true,
      message: 'Acesso autorizado!',
      user: request.user // isso virá do token
    };
  });
}

module.exports = testRoutes;