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
// Nova função para dashboard da compradora
async function dashboardCompradoraHandler(request, reply) {
  const db = request.server.mongo;
  const user = request.user;

  // Verifica se o usuário é do tipo 'compradora'
  if (user.tipoUsuario !== 'compradora') {
    return reply.code(403).send({ success: false, message: 'Apenas usuários compradoras podem acessar este painel.' });
  }

  // Total de pedidos (todas as solicitações no banco)
  const totalPedidos = await db.collection('solicitacoes').countDocuments();

  // Pedidos por setor
  const pedidosPorSetor = await db.collection('solicitacoes').aggregate([
    { $group: { _id: "$setorSolicitante", count: { $sum: 1 } } }
  ]).toArray();

  // Comparativo de compras mês a mês (total de compras por mês)
  const comprasMes = await db.collection('solicitacoes').aggregate([
    { $match: { dataSolicitacao: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } },
    { $group: { _id: { $month: "$dataSolicitacao" }, total: { $sum: 1 } } }
  ]).toArray();

  // Valor total de compras no mês atual
  const totalComprasMes = await db.collection('solicitacoes').aggregate([
    { $match: { dataSolicitacao: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } },
    { $group: { _id: null, total: { $sum: "$quantidade" } } }
  ]).toArray();

  // Últimos pedidos (pegando os 5 mais recentes)
  const ultimosPedidos = await db.collection('solicitacoes').find().sort({ dataSolicitacao: -1 }).limit(5).toArray();

  return reply.send({
    success: true,
    dashboard: {
      totalPedidos,
      pedidosPorSetor,
      comprasMes,
      totalComprasMes: totalComprasMes[0]?.total || 0,
      ultimosPedidos
    }
  });
}

module.exports = { listarSolicitacoesHandler, dashboardCompradoraHandler };