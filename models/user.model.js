const { ObjectId } = require('mongodb');

async function findUserByEmail(db, email) {
  return await db.collection('users').findOne({ email });
}

async function findUserById(db, id) {
  return await db.collection('users').findOne({ _id: new ObjectId(id) });
}

module.exports = { findUserByEmail, findUserById };