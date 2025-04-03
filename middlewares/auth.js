const jwt = require('jsonwebtoken');

async function authenticate(request, reply) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({ success: false, message: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Adiciona os dados decodificados do token na request
    request.user = decoded;

  } catch (error) {
    return reply.code(401).send({ success: false, message: 'Token inválido ou expirado' });
  }
}

module.exports = authenticate;