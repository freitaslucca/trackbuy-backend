const fastifyPlugin = require('fastify-plugin');
const { MongoClient } = require('mongodb');

async function dbConnector(fastify, options) {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  console.log('🟢 Conectado ao MongoDB');

  const db = client.db('trackbuy'); 

  fastify.decorate('mongo', db);
}

module.exports = fastifyPlugin(dbConnector);