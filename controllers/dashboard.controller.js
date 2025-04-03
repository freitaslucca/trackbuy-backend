async function listarSolicitacoesHandler(request, reply) {
    const db = request.server.mongo;
    const user = request.user;
    const statusFiltro = request.query.status;
  
    const query = {};
  
    // Se o status foi informado na URL, adiciona no filtro
    if (statusFiltro) {
      query.status = statusFiltro;
    }
  
    // Se o usuário for solicitante, mostra só as solicitações dele
    if (user.tipoUsuario === 'solicitante') {
      query.solicitanteId = user.id;
    }
  
    const solicitacoes = await db.collection('solicitacoes')
      .find(query)
      .sort({ dataSolicitacao: -1 }) // mais recentes primeiro
      .toArray();
  
    return { success: true, solicitacoes };
  }
  
  module.exports = { listarSolicitacoesHandler };