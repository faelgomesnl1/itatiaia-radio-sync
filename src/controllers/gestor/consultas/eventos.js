const pool = require('../../../database');

class listaEventos {
    //Exibe eventos sem lista de equipamentos
    async eventosDisp(req, res) {
        const id = req.body;

        console.log(id);

        const eventos = await pool.query(`SELECT id, data  FROM tb_evento;`);

        res.render('links/consultas/lista_eventos', { eventos });
    };

    //Exibe eventos que já tem lista de equipamentos
    async eventosReserv(req, res) {
        const id = req.body;

        console.log(id);

        const eventosReservados = await pool.query(`SELECT id, data  FROM tb_evento;;`)

        res.render('links/consultas/lista_evtRsrv', { eventos: eventosReservados });
    };

    async eventosPDF(req, res) {
        const id = req.body;

        console.log(id);

        const eventosReservados = await pool.query(`SELECT id, data  FROM tb_evento;;`)

        res.render('links/consultas/lista_saida', { eventos: eventosReservados });
    };


    //Exibe eventos finalizados
    async eventosFinaliz(req, res) {
        const id = req.body;

        console.log(id);
        const eventosFinalizados = await pool.query(`SELECT id, data  FROM tb_evento;`)

        res.render('links/consultas/lista_evtFinal', { eventos: eventosFinalizados });
    };
};

module.exports = new listaEventos();