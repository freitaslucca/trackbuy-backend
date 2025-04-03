const { login, register } = require('../services/auth.service');

async function loginHandler(request, reply) {
  const { email, senha } = request.body;
  const db = request.server.mongo;

  const result = await login(email, senha, db);

  if (!result.success) {
    return reply.code(401).send({ success: false, message: 'Credenciais inválidas' });
  }

  return reply.send(result);
}

async function registerHandler(request, reply) {
  const { email, senha, tipoUsuario } = request.body;
  const db = request.server.mongo;

  const result = await register(email, senha, tipoUsuario, db);

  if (!result.success) {
    return reply.code(400).send({ success: false, message: result.message });
  }

  return reply.send(result);
}

module.exports = { loginHandler, registerHandler };