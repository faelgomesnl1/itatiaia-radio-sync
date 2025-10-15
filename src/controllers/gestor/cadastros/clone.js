const pool = require('../../../database');

class clonarEscala {
    async cloneGet(req, res) {
        res.render('links/cadastros/clonar_escala');
    };

    async clonePost(req, res) {
        const { dt_start, dt_end } = req.body;
        const dt_escala = dt_end;
        const atv_evento = 1;
        const id_atv = await pool.query('SELECT id_atividade FROM tb_atividade ORDER BY id_atividade DESC');
        let id_atividade = id_atv[0].id_atividade;
        const id_atv_ev = await pool.query('SELECT id_atividade_evento FROM tb_atividade_evento ORDER BY id_atividade_evento DESC');
        let id_atividade_evento = id_atv_ev[0].id_atividade_evento;

        const clone = await pool.query('SELECT e.id_evento, ae.id_atividade_evento, GROUP_CONCAT(DISTINCT(p.id_programa) SEPARATOR ",") id_programa, GROUP_CONCAT(DISTINCT(f.id_funcionario) SEPARATOR ",") id_funcionario, a.observacao observacao, a.id_atividade, ae.h_evento_fim, ae.h_evento_inicio, u.id ' +
            'FROM tb_evento e ' +
            'INNER JOIN tb_atividade_evento ae ON e.id_evento = ae.id_evento ' +
            'INNER JOIN tb_atividade a ON ae.id_atividade = a.id_atividade ' +
            'LEFT OUTER JOIN tb_programacao_prog pp ON ae.id_atividade_evento = pp.id_atividade_evento ' +
            'LEFT OUTER JOIN tb_programa p ON pp.id_programa = p.id_programa ' +
            'INNER JOIN tb_func_escala fe ON ae.id_atividade_evento = fe.id_atividade_evento ' +
            'INNER JOIN tb_funcionario f ON fe.id_funcionario = f.id_funcionario ' +
            'INNER JOIN users u ON ae.id = u.id ' +
            'WHERE a.dt_escala = ? AND e.info_manual IS NULL ' +
            'GROUP BY ae.id_atividade_evento;', [dt_start]);

        for (const e of clone) {
            const observacao = e.observacao;
            const importantej = e.importante;
            const atencaoj = e.importante;
            const novaAtividade = { dt_escala, atv_evento, importantej, atencaoj, observacao };
            await pool.query('INSERT INTO tb_atividade SET ?', novaAtividade);

            const id_evento = e.id_evento;
            const id = e.id;
            const h_evento_fim = e.h_evento_fim;
            const h_evento_inicio = e.h_evento_inicio;
            const dt_update_evento = new Date();
            id_atividade++;
            const comum = { id_evento, id, id_atividade, dt_update_evento }
            const atividadeEvento = h_evento_inicio === '' ? { ...comum } : h_evento_fim === '' ? { ...comum, h_evento_inicio } : { ...comum, h_evento_inicio, h_evento_fim };
            await pool.query('INSERT INTO tb_atividade_evento SET ?', [atividadeEvento]);

            id_atividade_evento++;
            for (const event of e.id_funcionario.split(',')) {
                const id_funcionario = event;
                const funcionario = { id_atividade_evento, id_funcionario };

                await pool.query('INSERT INTO tb_func_escala SET ?', [funcionario]);
            }

            try {
                for (const event of e.id_programa.split(',')) {
                    const id_programa = event;
                    const programacao = { id_atividade_evento, id_programa };

                    await pool.query('INSERT INTO tb_programacao_prog SET ? ', [programacao]);
                }
            } catch (err) {
                const programacao = { id_atividade_evento }
                await pool.query('INSERT INTO tb_programacao_prog SET ? ', [programacao]);
            }
        }
        req.flash('success', 'Escala clonada com sucesso!');
        res.redirect('/profile')
    }
};

module.exports = new clonarEscala();