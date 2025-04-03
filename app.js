require('dotenv').config();
const fastify = require('fastify')({ logger: true });
const dbPlugin = require('./plugins/db');

fastify.register(require('@fastify/cors'));
fastify.register(dbPlugin);
fastify.register(require('./routes/auth.routes'));

const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' });
    console.log('Server rodando 🚀');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();