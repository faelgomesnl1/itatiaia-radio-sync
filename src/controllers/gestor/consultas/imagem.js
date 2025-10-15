const pool = require('../../../database');

class imagens {
    async imagemGet(req, res) {
        res.render('links/consultas/imagens');
    };
};

module.exports = new imagens();