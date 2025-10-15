const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const pool = require('../database');
const helpers = require('./helpers');

// ========================= SIGNIN =========================
passport.use('local.signin', new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, username, password, done) => {
  try {
    const rows = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

    if (rows.length > 0) {
      const user = rows[0];
      const validPassword = await helpers.matchPassword(password, user.password);

      if (validPassword) {
        return done(null, user, req.flash('success', 'Bem-vindo(a), ' + user.username));
      } else {
        return done(null, false, req.flash('message', 'Senha incorreta'));
      }
    } else {
      return done(null, false, req.flash('message', 'Usuário não existe.'));
    }
  } catch (err) {
    return done(err);
  }
}));

// ========================= SIGNUP (ADMIN) =========================
passport.use('local.signup', new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, username, password, done) => {
  const { fullname, setor, permissao } = req.body;
  const ADMIN = 0;

  try {
    // Verifica se username já existe
    const rows = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length > 0) {
      return done(null, false, req.flash('message', 'Usuário já cadastrado em nosso sistema.'));
    }

    // Cria novo usuário
    let newUser = {
      fullname,
      username,
      password,
      setor,
      permissao: permissao || 0,
      ADMIN
    };

    newUser.password = await helpers.encryptPassword(password);

    const result = await pool.query('INSERT INTO users SET ?', [newUser]);
    newUser.id = result.insertId;

    return done(null, newUser, req.flash('success', 'Cadastro realizado com sucesso!'));
  } catch (err) {
    console.error(err);
    return done(err, false, req.flash('message', 'Erro ao cadastrar usuário.'));
  }
}));

// ========================= SESSÃO =========================
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const rows = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    done(null, rows[0]);
  } catch (err) {
    done(err, null);
  }
});
