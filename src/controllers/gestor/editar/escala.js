const pool = require('../../../database');

class editarEscala {
    async editarEscalaGet(req, res) {
        const id_escala = req.query.id_escala;

        const dataQuery = `SELECT DATE_FORMAT(a.dt_escala, "%Y-%m-%d") AS data, a.id_atividade
        FROM tb_atividade a 
        INNER JOIN tb_atividade_evento ae ON ae.id_atividade = a.id_atividade 
        WHERE ae.id_atividade_evento = ?`;

        const eventoQuery = `SELECT e.id_evento AS id, e.nome AS nome 
        FROM tb_evento e 
        INNER JOIN tb_atividade_evento ae ON ae.id_evento = e.id_evento 
        WHERE id_atividade_evento = ?`;

        const hInicioQuery = `SELECT ae.h_evento_inicio AS inicio 
        FROM tb_atividade_evento ae 
        WHERE ae.id_atividade_evento = ?`;

        const hFimQuery = `SELECT ae.h_evento_fim AS fim 
        FROM tb_atividade_evento ae 
        WHERE id_atividade_evento = ?`;

        const funcionarioQuery = `SELECT f.nome, f.id_funcionario id
        FROM tb_funcionario f 
        INNER JOIN tb_func_escala fe ON fe.id_funcionario = f.id_funcionario 
        WHERE fe.id_atividade_evento = ?`;

        const programaQuery = `SELECT p.nome, p.id_programa AS id 
        FROM tb_programa p 
        INNER JOIN tb_programacao_prog pp ON pp.id_programa = p.id_programa 
        WHERE pp.id_atividade_evento = ?`;

        const observacaoQuery = `SELECT a.observacao 
        FROM tb_atividade a 
        INNER JOIN tb_atividade_evento ae ON ae.id_atividade = a.id_atividade 
        WHERE ae.id_atividade_evento = ?`;

        const todosFuncionariosQuery = `SELECT id_funcionario id, nome FROM tb_funcionario ORDER BY nome`;

        const todosEventosQuery = `SELECT id_evento, nome 
        FROM tb_evento 
        WHERE info_manual IS NULL OR id_evento IN (SELECT ae.id_evento FROM tb_atividade_evento ae WHERE id_atividade_evento = ?) 
        ORDER BY nome`;

        const todosProgramasQuery = `SELECT id_programa id,nome FROM tb_programa ORDER BY nome`;

        // Executa todas as queries com uma única requisição, aumentando desempenho
        const queryPromises = [
            pool.query(dataQuery, [id_escala]),
            pool.query(eventoQuery, [id_escala]),
            pool.query(hInicioQuery, [id_escala]),
            pool.query(hFimQuery, [id_escala]),
            pool.query(funcionarioQuery, [id_escala]),
            pool.query(programaQuery, [id_escala]),
            pool.query(observacaoQuery, [id_escala]),
            pool.query(todosFuncionariosQuery),
            pool.query(todosEventosQuery, [id_escala]),
            pool.query(todosProgramasQuery)
        ];

        // Repassa os valores da query de uma só vez, agilizando o processo
        const [data, evento, inicio, fim, funcionario, programa, observacao, todosFuncionarios, todosEventos, todosProgramas] = await Promise.all(queryPromises);

        res.render('links/editar/editar_escala', { data, evento, inicio, fim, funcionario, programa, observacao, todosFuncionarios, todosEventos, todosProgramas });
    };

    async editarEscalaPost(req, res) {
        const id = req.user.id;
        const { id_escala, eventomanual,
            id_funcionario1, id_funcionario2, id_funcionario3, id_funcionario4, id_funcionario5, id_funcionario6, id_funcionario7, id_funcionario8, id_funcionario9, id_funcionario10,
            observacao, h_evento_inicio, h_evento_fim,
            id_programa1, id_programa2, id_programa3, id_programa4, id_programa5, id_programa6, id_programa7, id_programa8, id_programa9, id_programa10,
            auxFunc, auxProg } = req.body;
        let { id_evento } = req.body;
        const id_funcionarios = [id_funcionario1, id_funcionario2, id_funcionario3, id_funcionario4, id_funcionario5, id_funcionario6, id_funcionario7, id_funcionario8, id_funcionario9, id_funcionario10];
        const id_programas = [id_programa1, id_programa2, id_programa3, id_programa4, id_programa5, id_programa6, id_programa7, id_programa8, id_programa9, id_programa10];
        if (eventomanual == '') {
        } else {
            const nome = eventomanual;
            const info_manual = 1;
            const newEvent = { nome, info_manual }

            await pool.query('INSERT INTO tb_evento SET ?', [newEvent]);
            const aux = await pool.query('SELECT id_evento FROM tb_evento ORDER BY id_evento DESC');
            id_evento = aux[0].id_evento;
            await pool.query('UPDATE tb_atividade_evento SET id_evento = ? WHERE id_atividade_evento = ?', [id_evento, id_escala])
        };

        console.log(id_funcionarios);

        const id_atv = await pool.query('SELECT id_atividade FROM tb_atividade_evento WHERE id_atividade_evento = ?', [id_escala]);
        await pool.query('UPDATE tb_atividade SET observacao = ? WHERE id_atividade = ?', [observacao, id_atv[0].id_atividade]);
        const id_atividade = id_atv[0].id_atividade;
        const dt_update_evento = new Date();

        await pool.query('DELETE FROM tb_atividade_evento WHERE id_atividade_evento = ?', [id_escala]);

        const comum = { id_evento, id, id_atividade, dt_update_evento }
        const atividadeEvento = h_evento_inicio === '' ? { ...comum } : h_evento_fim === '' ? { ...comum, h_evento_inicio } : { ...comum, h_evento_inicio, h_evento_fim };

        await pool.query('INSERT INTO tb_atividade_evento SET ?', [atividadeEvento]);

        const id_atv_ev = await pool.query('SELECT id_atividade_evento FROM tb_atividade_evento ORDER BY id_atividade_evento DESC');
        const id_atividade_evento = id_atv_ev[0].id_atividade_evento;

        for (let i = 0; i < auxProg; i++) {
            const id_programa = id_programas[i];
            const programacao = { id_atividade_evento, id_programa };

            await pool.query('INSERT INTO tb_programacao_prog SET ? ', [programacao]);
        };

        for (let i = 0; i < auxFunc; i++) {
            const id_funcionario = id_funcionarios[i];
            const funcionario = { id_atividade_evento, id_funcionario };

            await pool.query('INSERT INTO tb_func_escala SET ?', [funcionario]);
        };

        req.flash('success', 'Escala editada com sucesso!');
        res.redirect('/profile');
    };
};

module.exports = new editarEscala();