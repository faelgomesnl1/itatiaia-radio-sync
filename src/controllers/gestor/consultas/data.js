const pool = require('../../../database');

class escolherData {
    async dataGet(req, res) {
        res.render('links/consultas/escolher_data');
    };
};

module.exports = new escolherData();