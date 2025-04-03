const { ObjectId } = require('mongodb');

async function criarHistoricoStatus(db, statusHistory) {
  const collection = db.collection('status_history');
  const result = await collection.insertOne(statusHistory);
  return result.insertedId;
}

module.exports = { criarHistoricoStatus };