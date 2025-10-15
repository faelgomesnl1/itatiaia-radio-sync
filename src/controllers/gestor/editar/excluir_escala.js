const pool = require('../../../database');

class excluirEscala {

    async excluirEscalaPost(req, res) {
        const { id_atividade } = req.body;

        console.log("teste")
        console.log(id_atividade);

        await pool.query('DELETE FROM tb_atividade WHERE id_atividade = ?', [id_atividade]);

        req.flash('success', 'Escala excluida com sucesso!');
        res.redirect('/profile');
    };
};

module.exports = new excluirEscala();