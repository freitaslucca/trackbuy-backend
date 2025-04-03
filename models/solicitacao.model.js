async function criarSolicitacao(db, dados) {
    const result = await db.collection('solicitacoes').insertOne(dados);
    return result.insertedId;
  }
  
  module.exports = { criarSolicitacao };