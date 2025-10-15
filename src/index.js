const express = require('express');
const morgan = require('morgan');
const path = require('path');
const exphbs = require('express-handlebars');
const session = require('express-session');
const validator = require('express-validator');
const passport = require('passport');
const flash = require('connect-flash');
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const ngrok = require('ngrok');

const { database } = require('./keys');

// Intializations
const app = express();
require('./lib/passport');
app.use(express.urlencoded({ extended: true })); // <-- ESSENCIAL
app.use(express.json());
// Settings
app.set('port', process.env.PORT || 5087

);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  layoutsDir: path.join(app.get('views'), 'layouts'),
  partialsDir: path.join(app.get('views'), 'partials'),
  extname: '.hbs',
  helpers: require('./lib/handlebars')
}))
app.set('view engine', '.hbs');

// Middlewares
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
/* app.use(bodyParser.json()); */
app.use(bodyParser.json({ limit: '50mb' }));

app.use(session({
  secret: 'faztmysqlnodesession',
  resave: false,
  saveUninitialized: false,
  store: new MySQLStore(database)
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(validator());

// Global variables
app.use((req, res, next) => {
  app.locals.message = req.flash('message');
  app.locals.success = req.flash('success');
  app.locals.user = req.user;
    if (req.user) {
    // Salva o valor original do ADMIN em uma variável separada
    res.locals.originalAdmin = req.user.ADMIN;

    res.locals.isAdmin1 = req.user.ADMIN === 1;
    res.locals.isAdmin2 = req.user.ADMIN === 2;
    res.locals.isAdmin0 = req.user.ADMIN === 0;
    // Força o user.ADMIN para o valor original (se necessário)
    req.user.ADMIN = req.user.ADMIN;
  }

  next();
});

// Routes
app.use(require('./routes/index'));
app.use(require('./routes/authentication'));
app.use('/links', require('./routes/links'));

// Public
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// Starting
app.listen(app.get('port'), () => {
  console.log('Server is in port', app.get('port'));
});
