async function findUserByEmail(db, email) {
    return await db.collection('users').findOne({ email });
  }
  
  module.exports = { findUserByEmail };