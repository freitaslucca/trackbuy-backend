const { loginHandler, registerHandler } = require('../controllers/auth.controller');

async function authRoutes(fastify, options) {
  fastify.post('/login', loginHandler);
  fastify.post('/register', registerHandler);
}

module.exports = authRoutes;