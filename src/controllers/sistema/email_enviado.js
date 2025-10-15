const helpers = require('../../lib/helpers');
const pool = require('../../database');

class alertaEmail {

    async emailEnviadoGet(req, res) {

        res.render('links/consultas/email_enviado_alerta');
    };

};

module.exports = new alertaEmail();