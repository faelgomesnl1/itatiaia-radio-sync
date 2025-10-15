const pool = require('../../../database');

class excluirJogo {

    async excluirJogoPost(req, res) {
        const { id_atividade } = req.body;

        const ids = await pool.query(`SELECT aj.id_atividade_jrd, j.id_jogo 
            FROM tb_atividade_jornada aj 
            INNER JOIN tb_jogo j ON aj.id_atividade_jrd = j.id_atividade_jrd
            WHERE aj.id_atividade = ?`, [id_atividade]);

        await pool.query('DELETE FROM tb_clubes_jogos WHERE id_jogo = ?', [ids[0].id_jogo])
        await pool.query('DELETE FROM tb_jogo WHERE id_atividade_jrd = ?', [ids[0].id_atividade_jrd]);
        await pool.query('DELETE FROM tb_atividade_jornada WHERE id_atividade = ?', [id_atividade]);
        await pool.query('DELETE FROM tb_atividade WHERE id_atividade = ?', [id_atividade]);

        req.flash('success', 'Escala excluida com sucesso!');
        res.redirect('/profile');
    };
};

module.exports = new excluirJogo();