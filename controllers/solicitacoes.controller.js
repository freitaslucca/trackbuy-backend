const { criarSolicitacao } = require('../models/solicitacao.model');
const { findUserById } = require('../models/user.model');
const { ObjectId } = require('mongodb');
const { criarHistoricoStatus } = require('../models/statusHistory.model');
const { criarNotificacao } = require('../models/notificacoes.model');
const { parse } = require('json2csv');

// Função para ajustar a data para o fuso horário brasileiro (sem usar date-fns-tz)
function ajustarParaFusoBrasileiro(data) {
  // Se for necessário fazer algum ajuste de fuso horário, faça diretamente aqui
  // Caso contrário, apenas use a data como está.
  return data; // Aqui a data é retornada sem modificações (já no fuso horário local do servidor)
}

async function criarSolicitacaoHandler(request, reply) {
  const db = request.server.mongo;
  const { nomeProduto, quantidade, prazo, fornecedorSugerido, linkFoto } = request.body;
  const user = request.user;

  if (!nomeProduto || !quantidade || !prazo) {
    return reply.code(400).send({ success: false, message: 'nomeProduto, quantidade e prazo são obrigatórios.' });
  }

  const dataSolicitacao = new Date(); // Obtendo a data atual

  // Buscar o usuário autenticado no banco para pegar nome e setor
  const userData = await findUserById(db, user.id);
  if (!userData) {
    return reply.code(404).send({ success: false, message: 'Usuário não encontrado' });
  }

  const novaSolicitacao = {
    nomeProduto,
    quantidade,
    prazo,
    fornecedorSugerido: fornecedorSugerido || null,
    linkFoto: linkFoto || null,
    status: 'pendente',
    dataSolicitacao, // Salvando a data sem ajustes de fuso horário
    nomeSolicitante: userData.nome,
    setorSolicitante: userData.setor,
    solicitanteId: user.id
  };

  const id = await criarSolicitacao(db, novaSolicitacao);

  return reply.code(201).send({ success: true, message: 'Solicitação criada com sucesso', id });
}

async function atualizarStatusHandler(request, reply) {
  const db = request.server.mongo;
  const { id } = request.params;
  const { status, comentarioNegado } = request.body;
  const user = request.user;

  // Verifica se é compradora
  if (user.tipoUsuario !== 'compradora') {
    return reply.code(403).send({ success: false, message: 'Apenas usuários compradoras podem alterar o status.' });
  }

  // Validação do novo status
  const statusPermitidos = ['pendente', 'aprovado', 'negado'];
  if (!statusPermitidos.includes(status)) {
    return reply.code(400).send({ success: false, message: 'Status inválido.' });
  }

  // Atualiza o status da solicitação
  const result = await db.collection('solicitacoes').updateOne(
    { _id: new ObjectId(id) },
    { $set: { status, comentarioNegado } }
  );

  if (result.modifiedCount === 0) {
    return reply.code(404).send({ success: false, message: 'Solicitação não encontrada ou status já definido.' });
  }

  // Criação do histórico de status
  const statusHistory = {
    solicitacaoId: new ObjectId(id),
    statusAlteradoPara: status,
    comentarioNegado,
    dataAlteracao: new Date(),
    alteradoPor: user.id
  };

  await criarHistoricoStatus(db, statusHistory);

  // Notificação ao solicitante
  const solicitacao = await db.collection('solicitacoes').findOne({ _id: new ObjectId(id) });
  const solicitanteId = solicitacao.solicitanteId;

  const notificacao = {
    solicitanteId: solicitanteId,
    mensagem: `Sua solicitação foi ${status === 'negado' ? 'rejeitada' : 'aprovada'}.`,
    status: status,
    dataNotificacao: new Date(),
  };

  await criarNotificacao(db, notificacao);

  return reply.send({ success: true, message: `Status atualizado para ${status}` });
}

async function painelCompradoraHandler(request, reply) {
  const db = request.server.mongo;
  const user = request.user;

  // Verifica se o usuário é compradora
  if (user.tipoUsuario !== 'compradora') {
    return reply.code(403).send({ success: false, message: 'Apenas usuários compradoras podem acessar este painel.' });
  }

  // Conta o total de solicitações por status
  const pendente = await db.collection('solicitacoes').countDocuments({ status: 'pendente' });
  const aprovado = await db.collection('solicitacoes').countDocuments({ status: 'aprovado' });
  const negado = await db.collection('solicitacoes').countDocuments({ status: 'negado' });

  return reply.send({
    success: true,
    painel: {
      pendente,
      aprovado,
      negado
    }
  });
}

async function exportarSolicitacoesHandler(request, reply) {
  const db = request.server.mongo;
  const user = request.user;

  // Verifica se o usuário tem permissão para exportar
  if (user.tipoUsuario !== 'compradora' && user.tipoUsuario !== 'administrador') {
    return reply.code(403).send({ success: false, message: 'Apenas compradores ou administradores podem exportar as solicitações.' });
  }

  const { startDate, endDate, setor } = request.query;

  // Função para converter data de dd/mm/yyyy para yyyy-mm-dd
  function convertToDate(dateString) {
    const [day, month, year] = dateString.split('/');
    return new Date(`${year}-${month}-${day}`);
  }

  // Verifica se as datas estão no formato correto (dd/mm/yyyy)
  if (startDate && !/^(\d{2})\/(\d{2})\/(\d{4})$/.test(startDate)) {
    return reply.code(400).send({ success: false, message: 'Formato de data de início inválido. Utilize o formato dd/mm/yyyy.' });
  }
  if (endDate && !/^(\d{2})\/(\d{2})\/(\d{4})$/.test(endDate)) {
    return reply.code(400).send({ success: false, message: 'Formato de data de término inválido. Utilize o formato dd/mm/yyyy.' });
  }

  // Converte as datas para o formato esperado (yyyy-mm-dd)
  const filter = {};
  if (startDate && endDate) {
    const start = convertToDate(startDate);
    const end = convertToDate(endDate);
    end.setHours(23, 59, 59, 999); // Ajusta a data de fim para o final do dia

    filter.dataSolicitacao = {
      $gte: start,
      $lte: end,
    };
  }

  if (setor) {
    filter.setorSolicitante = setor;
  }

  // Busca as solicitações no banco aplicando os filtros
  const solicitacoes = await db.collection('solicitacoes').find(filter).toArray();

  if (!solicitacoes || solicitacoes.length === 0) {
    return reply.code(404).send({ success: false, message: 'Nenhuma solicitação encontrada para exportar.' });
  }

  // Formata as datas no formato brasileiro (dd/MM/yyyy)
  const solicitacoesComDataFormatada = solicitacoes.map(solicitacao => ({
    ...solicitacao,
    dataSolicitacao: new Date(solicitacao.dataSolicitacao).toLocaleDateString('pt-BR'),
    dataAlteracao: solicitacao.dataAlteracao ? new Date(solicitacao.dataAlteracao).toLocaleDateString('pt-BR') : null,
  }));

  const csv = parse(solicitacoesComDataFormatada);

  reply.header('Content-Type', 'text/csv');
  reply.header('Content-Disposition', 'attachment; filename=solicitacoes.csv');
  reply.send(csv);
}

module.exports = { criarSolicitacaoHandler, atualizarStatusHandler, painelCompradoraHandler, exportarSolicitacoesHandler };