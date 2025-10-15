const pool = require('../../../database');

class cadastroEscala {

    //CADASTRAR PROMOÇÕES
    async consultaEscalaGet(req, res) {
        const dt_escala = req.query.dt_escala;

        const tipo_escala = req.query.tipo_escala;

        if (tipo_escala == "1") {

            const escala = await pool.query('SELECT ae.id_atividade_evento id, a.id_atividade, e.nome nome_evento, GROUP_CONCAT(DISTINCT(p.nome) SEPARATOR ", ") nome_programa, ' +
                'GROUP_CONCAT(DISTINCT(f.nome) SEPARATOR ", ") nome_funcionario, a.observacao observacao, ' +
                'DATE_FORMAT(ae.h_evento_inicio, "%H:%i") hr_inicio, DATE_FORMAT(ae.h_evento_fim, "%H:%i") hr_fim ' +
                'FROM tb_evento e ' +
                'INNER JOIN tb_atividade_evento ae ON e.id_evento = ae.id_evento ' +
                'INNER JOIN tb_atividade a ON ae.id_atividade = a.id_atividade ' +
                'LEFT OUTER JOIN tb_programacao_prog pp ON ae.id_atividade_evento = pp.id_atividade_evento ' +
                'LEFT OUTER JOIN tb_programa p ON pp.id_programa = p.id_programa ' +
                'INNER JOIN tb_func_escala fe ON ae.id_atividade_evento = fe.id_atividade_evento ' +
                'INNER JOIN tb_funcionario f ON fe.id_funcionario = f.id_funcionario ' +
                'WHERE a.dt_escala = ? ' +
                'GROUP BY a.dt_escala, e.id_evento;', [dt_escala]);

            const data_escala = dt_escala.split('-').reverse().join('/');
            res.render('links/consultas/consulta_escala', { escala, data_escala });

        } else {
            const escala = await pool.query('SELECT a.id_atividade id, p.nome seguir, c.nome campeonato, ' +
                'GROUP_CONCAT(DISTINCT(cl.nome) SEPARATOR ", ") nome_times, DATE_FORMAT(j.horario_abertura, "%Hh%i") AS abertura ' +
                'FROM tb_atividade a ' +
                'INNER JOIN tb_atividade_jornada aj ON a.id_atividade = aj.id_atividade ' +
                'INNER JOIN tb_jogo j ON aj.id_atividade_jrd = j.id_atividade_jrd ' +
                'INNER JOIN tb_clubes_jogos cj ON j.id_jogo = cj.id_jogo ' +
                'INNER JOIN tb_clubes cl ON cj.id_clube = cl.id_clubes ' +
                'INNER JOIN tb_campeonato c ON aj.id_campeonato = c.id_campeonato ' +
                'LEFT OUTER JOIN tb_programa p ON j.seguir = p.id_programa ' +
                'WHERE a.dt_escala = ? ' +
                'GROUP BY a.dt_escala, j.id_jogo  ' +
                'ORDER BY DATE_FORMAT(j.horario_abertura, "%Hh%i") ;', [dt_escala]);

            const data_escala = dt_escala.split('-').reverse().join('/');
            res.render('links/consultas/consulta_escala', { escala, data_escala });
        }
    };

    async consultaEscalaPost(req, res) {
        const { dt_escala, id_evento, id_funcionario, programa, h_inicio, h_evento_fim, importante, atencao, observacao } = req.body;
        const evento = 1;
        const novaAtividade = { dt_escala, programa, evento, importante, atencao, observacao, h_inicio, id_funcionario, h_evento_fim };
        const novaAtividadeEvento = { id_evento }

        await pool.query('INSERT INTO tb_atividade set ?', [novaAtividade]);

        req.flash('success', 'Funcionario cadastrado com sucesso!');
        res.redirect('/profile');
    };

};

module.exports = new cadastroEscala();