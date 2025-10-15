const express = require('express');
const router = express.Router();
const pool = require('../database');
const passport = require('passport');
const { isLoggedIn } = require('../lib/auth');

// SIGNUP
router.get('/signup', async (req, res) => {
 try {
    const setores = await pool.query('SELECT id, nome FROM tb_setor');
    res.render('auth/signup', { setores });
  } catch (error) {
    console.error(error);
    res.render('auth/signup', { setores: [] });
  }
});

router.post('/signup', passport.authenticate('local.signup', {
  successRedirect: '/profile',
  failureRedirect: '/signup',
  failureFlash: true
}));

// SINGIN
router.get('/signin', (req, res) => {
  res.render('auth/signin');
});

router.post('/signin', (req, res, next) => {
  req.check('username', 'Username is Required').notEmpty();
  req.check('password', 'Password is Required').notEmpty();
  const errors = req.validationErrors();
  
  if (errors && errors.length > 0) {
    req.flash('message', errors[0].msg);
    return res.redirect('/signin');
  }
  
  passport.authenticate('local.signin', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      //req.flash('message', info.message);
      return res.redirect('/signin');
    }
    
    req.logIn(user, (err) => {
      if (err) return next(err);
      req.session.userId = user.id; // Garante que o userId está na sessão
      return res.redirect('/profile');
    });
  })(req, res, next);
});

router.get('/logout', (req, res, next) => {
  req.logOut((e) => {
    if (e) return next(e);
  });
  res.redirect('/');
});

router.get('/profile', isLoggedIn, async (req, res) => {
  //PERFIL GESTOR DESENVOLVIMENTO
  /* const visuGestor = await pool.query('SELECT * FROM dbescalaesp_prod.users;'); */

  /* const datasEscala = await pool.query('SELECT DATE_FORMAT(dt_escala, "%Y-%m-%d") dt_escala FROM tb_atividade WHERE atv_evento = 1 GROUP BY dt_escala ORDER BY dt_escala;');
  const datasJogos = await pool.query('SELECT DATE_FORMAT(dt_escala, "%Y-%m-%d") dt_escala FROM tb_atividade WHERE atv_programa = 1 GROUP BY dt_escala ORDER BY dt_escala;'); */

  /* console.log(datasEscala); */

  res.render('profile'/* , { visuGestor, datasEscala, datasJogos } */);
});

module.exports = router;
