const bcrypt = require('bcryptjs');
const jwt = require('../utils/jwt');
const { findUserByEmail } = require('../models/user.model');

async function login(email, senha, db) {
  const user = await findUserByEmail(db, email);
  if (!user) return { success: false };

  const match = await bcrypt.compare(senha, user.senha);
  if (!match) return { success: false };

  // Agora, o token incluirá o campo 'nome'
  const token = jwt.generateToken({
    id: user._id,
    tipoUsuario: user.tipoUsuario,
    nome: user.nome 
  });

  return { success: true, token, tipoUsuario: user.tipoUsuario };
}

async function register(email, senha, tipoUsuario, nome, setor, db) {
  const existing = await findUserByEmail(db, email);
  if (existing) return { success: false, message: 'Usuário já existe' };

  const hash = await bcrypt.hash(senha, 10);

  await db.collection('users').insertOne({
    email,
    senha: hash,
    tipoUsuario,
    nome,
    setor
  });

  return { success: true, message: 'Usuário registrado com sucesso' };
}

module.exports = { login, register };