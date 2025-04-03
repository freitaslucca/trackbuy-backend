const { criarSolicitacao } = require('../models/solicitacao.model');
const { findUserById } = require('../models/user.model'); // adiciona essa função no model
const { ObjectId } = require('mongodb');

async function criarSolicitacaoHandler(request, reply) {
  const db = request.server.mongo;
  const { nomeProduto, quantidade, prazo, fornecedorSugerido, linkFoto } = request.body;
  const user = request.user;

  if (!nomeProduto || !quantidade || !prazo) {
    return reply.code(400).send({ success: false, message: 'nomeProduto, quantidade e prazo são obrigatórios.' });
  }

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
    dataSolicitacao: new Date(),
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
    const { status } = request.body;
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
  
    const result = await db.collection('solicitacoes').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status } }
    );
  
    if (result.modifiedCount === 0) {
      return reply.code(404).send({ success: false, message: 'Solicitação não encontrada ou status já definido.' });
    }
  
    return reply.send({ success: true, message: `Status atualizado para ${status}` });
  }

module.exports = { criarSolicitacaoHandler, atualizarStatusHandler };