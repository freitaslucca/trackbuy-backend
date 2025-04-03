async function getNotificacoesHandler(request, reply) {
    const db = request.server.mongo;
    const user = request.user;
  
    console.log('Usuário autenticado:', user); // Log para verificar o usuário
    console.log('ID do solicitante:', user.id); // Log para verificar o ID do solicitante
  
    const notificacoes = await db.collection('notificacoes').find({ solicitanteId: user.id }).toArray();
  
    console.log('Notificações encontradas:', notificacoes); // Verificando as notificações
  
    return reply.send({ success: true, notificacoes });
  }
  
  module.exports = { getNotificacoesHandler };