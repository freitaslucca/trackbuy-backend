async function criarNotificacao(db, notificacao) {
  const collection = db.collection('notificacoes');
  const result = await collection.insertOne(notificacao);
  return result.insertedId;  
}

module.exports = { criarNotificacao };