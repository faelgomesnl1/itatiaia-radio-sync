const pool = require('../../../database');

class editarJogos {
    async editarJogosGet(req, res) {
        const id_escala = req.query.id_escala;

        const dt_escala = await pool.query(`SELECT dt_escala FROM dbescalaesp_prod.tb_atividade WHERE id_atividade = ?`, [id_escala]);

        const dt = dt_escala[0].dt_escala

        const informativos = await pool.query(`
            SELECT a.observacaoj, a.atencaoj, a.importantej
            FROM 
                tb_campeonato c
                INNER JOIN tb_atividade_jornada aj ON c.id_campeonato = aj.id_campeonato
                INNER JOIN tb_atividade a ON aj.id_atividade = a.id_atividade
                INNER JOIN tb_jogo j ON aj.id_atividade_jrd = j.id_atividade_jrd
                INNER JOIN tb_clubes_jogos cj ON j.id_jogo = cj.id_jogo
                INNER JOIN tb_clubes cl ON cj.id_clube = cl.id_clubes
                LEFT JOIN tb_local l ON j.id_local = l.id_local
                LEFT JOIN tb_programa pg ON j.seguir = pg.id_programa
                LEFT JOIN tb_func_escala fe_narrador ON fe_narrador.id_jogo = j.id_jogo AND fe_narrador.tipo_funcao = 1
                LEFT JOIN tb_funcionario narrador ON fe_narrador.id_funcionario = narrador.id_funcionario
                LEFT JOIN tb_func_escala fe_ancora ON fe_ancora.id_jogo = j.id_jogo AND fe_ancora.tipo_funcao = 2
                LEFT JOIN tb_funcionario ancora ON fe_ancora.id_funcionario = ancora.id_funcionario
                LEFT JOIN tb_func_escala fe_comentarista ON fe_comentarista.id_jogo = j.id_jogo AND fe_comentarista.tipo_funcao = 3
                LEFT JOIN tb_funcionario comentarista ON fe_comentarista.id_funcionario = comentarista.id_funcionario
                LEFT JOIN tb_func_escala fe_arbitragem ON fe_arbitragem.id_jogo = j.id_jogo AND fe_arbitragem.tipo_funcao = 4
                LEFT JOIN tb_funcionario arbitragem ON fe_arbitragem.id_funcionario = arbitragem.id_funcionario
                LEFT JOIN tb_func_escala fe_numeros ON fe_numeros.id_jogo = j.id_jogo AND fe_numeros.tipo_funcao = 5
                LEFT JOIN tb_funcionario numeros ON fe_numeros.id_funcionario = numeros.id_funcionario
                LEFT JOIN tb_func_escala fe_reporter ON fe_reporter.id_jogo = j.id_jogo AND fe_reporter.tipo_funcao = 6
                LEFT JOIN tb_funcionario reporter ON fe_reporter.id_funcionario = reporter.id_funcionario
                LEFT JOIN tb_func_escala fe_operador ON fe_operador.id_jogo = j.id_jogo AND fe_operador.tipo_funcao = 7
                LEFT JOIN tb_funcionario operador ON fe_operador.id_funcionario = operador.id_funcionario
                LEFT JOIN tb_func_escala fe_producao ON fe_producao.id_jogo = j.id_jogo AND fe_producao.tipo_funcao = 8
                LEFT JOIN tb_funcionario producao ON fe_producao.id_funcionario = producao.id_funcionario
            WHERE
            a.dt_escala BETWEEN ? AND ?
                GROUP BY a.observacaoj, a.atencaoj, a.importantej

            UNION ALL

            SELECT
            ' ' AS observacaoj,
                ' ' AS atencaoj,
                    ' ' AS importantej
            WHERE NOT EXISTS(
                        SELECT 
                    1
                FROM 
                    tb_campeonato c
                    INNER JOIN tb_atividade_jornada aj ON c.id_campeonato = aj.id_campeonato
                    INNER JOIN tb_atividade a ON aj.id_atividade = a.id_atividade
                    INNER JOIN tb_jogo j ON aj.id_atividade_jrd = j.id_atividade_jrd
                    INNER JOIN tb_clubes_jogos cj ON j.id_jogo = cj.id_jogo
                    INNER JOIN tb_clubes cl ON cj.id_clube = cl.id_clubes
                    LEFT JOIN tb_local l ON j.id_local = l.id_local
                    LEFT JOIN tb_programa pg ON j.seguir = pg.id_programa
                    LEFT JOIN tb_func_escala fe_narrador ON fe_narrador.id_jogo = j.id_jogo AND fe_narrador.tipo_funcao = 1
                    LEFT JOIN tb_funcionario narrador ON fe_narrador.id_funcionario = narrador.id_funcionario
                    LEFT JOIN tb_func_escala fe_ancora ON fe_ancora.id_jogo = j.id_jogo AND fe_ancora.tipo_funcao = 2
                    LEFT JOIN tb_funcionario ancora ON fe_ancora.id_funcionario = ancora.id_funcionario
                    LEFT JOIN tb_func_escala fe_comentarista ON fe_comentarista.id_jogo = j.id_jogo AND fe_comentarista.tipo_funcao = 3
                    LEFT JOIN tb_funcionario comentarista ON fe_comentarista.id_funcionario = comentarista.id_funcionario
                    LEFT JOIN tb_func_escala fe_arbitragem ON fe_arbitragem.id_jogo = j.id_jogo AND fe_arbitragem.tipo_funcao = 4
                    LEFT JOIN tb_funcionario arbitragem ON fe_arbitragem.id_funcionario = arbitragem.id_funcionario
                    LEFT JOIN tb_func_escala fe_numeros ON fe_numeros.id_jogo = j.id_jogo AND fe_numeros.tipo_funcao = 5
                    LEFT JOIN tb_funcionario numeros ON fe_numeros.id_funcionario = numeros.id_funcionario
                    LEFT JOIN tb_func_escala fe_reporter ON fe_reporter.id_jogo = j.id_jogo AND fe_reporter.tipo_funcao = 6
                    LEFT JOIN tb_funcionario reporter ON fe_reporter.id_funcionario = reporter.id_funcionario
                    LEFT JOIN tb_func_escala fe_operador ON fe_operador.id_jogo = j.id_jogo AND fe_operador.tipo_funcao = 7
                    LEFT JOIN tb_funcionario operador ON fe_operador.id_funcionario = operador.id_funcionario
                    LEFT JOIN tb_func_escala fe_producao ON fe_producao.id_jogo = j.id_jogo AND fe_producao.tipo_funcao = 8
                    LEFT JOIN tb_funcionario producao ON fe_producao.id_funcionario = producao.id_funcionario
                WHERE 
        a.dt_escala BETWEEN ? AND ?);`, [dt, dt, dt, dt]);

        const dataQuery = `SELECT DATE_FORMAT(a.dt_escala, "%Y-%m-%d") AS data, a.id_atividade
            FROM tb_atividade a 
            WHERE a.id_atividade = ?`;

        const campeonatoQuery = `SELECT c.id_campeonato id 
            FROM tb_campeonato c 
            INNER JOIN tb_atividade_jornada aj ON c.id_campeonato = aj.id_campeonato
            WHERE aj.id_atividade = ?`;

        const clubesQuery = `SELECT c.id_clubes id 
            FROM tb_clubes c 
            INNER JOIN tb_clubes_jogos cj ON c.id_clubes = cj.id_clube 
            INNER JOIN tb_jogo j ON cj.id_jogo = j.id_jogo 
            INNER JOIN tb_atividade_jornada aj ON j.id_atividade_jrd = aj.id_atividade_jrd 
            WHERE aj.id_atividade = ?`;

        const hInicioQuery = `SELECT j.horario_abertura horario
            FROM tb_jogo j
            INNER JOIN tb_atividade_jornada aj ON j.id_atividade_jrd = aj.id_atividade_jrd 
            WHERE aj.id_atividade = ?`;

        const hJogoQuery = `SELECT j.horario_jogo horario
            FROM tb_jogo j
            INNER JOIN tb_atividade_jornada aj ON j.id_atividade_jrd = aj.id_atividade_jrd 
            WHERE aj.id_atividade = ?`;

        const estadioQuery = `SELECT l.id_local id
            FROM tb_local l
            INNER JOIN tb_jogo j ON l.id_local = j.id_local 
            INNER JOIN tb_atividade_jornada aj ON j.id_atividade_jrd = aj.id_atividade_jrd
            WHERE aj.id_atividade = ?`;

        const narradorQuery = `SELECT fe.id_funcionario id, fe.obs_funcao obs
            FROM tb_func_escala fe
            INNER JOIN tb_jogo j ON fe.id_jogo = j.id_jogo
            INNER JOIN tb_atividade_jornada aj ON j.id_atividade_jrd = aj.id_atividade_jrd
            WHERE aj.id_atividade = ? AND fe.tipo_funcao = 1`;

        const ancoraQuery = `SELECT fe.id_funcionario id
            FROM tb_func_escala fe
            INNER JOIN tb_jogo j ON fe.id_jogo = j.id_jogo
            INNER JOIN tb_atividade_jornada aj ON j.id_atividade_jrd = aj.id_atividade_jrd
            WHERE aj.id_atividade = ? AND fe.tipo_funcao = 2`;

        const comentaristaQuery = `SELECT fe.id_funcionario id
            FROM tb_func_escala fe
            INNER JOIN tb_jogo j ON fe.id_jogo = j.id_jogo
            INNER JOIN tb_atividade_jornada aj ON j.id_atividade_jrd = aj.id_atividade_jrd
            WHERE aj.id_atividade = ? AND fe.tipo_funcao = 3`;

        const arbitragemQuery = `SELECT fe.id_funcionario id
            FROM tb_func_escala fe
            INNER JOIN tb_jogo j ON fe.id_jogo = j.id_jogo
            INNER JOIN tb_atividade_jornada aj ON j.id_atividade_jrd = aj.id_atividade_jrd
            WHERE aj.id_atividade = ? AND fe.tipo_funcao = 4`;

        const numerosQuery = `SELECT fe.id_funcionario id
            FROM tb_func_escala fe
            INNER JOIN tb_jogo j ON fe.id_jogo = j.id_jogo
            INNER JOIN tb_atividade_jornada aj ON j.id_atividade_jrd = aj.id_atividade_jrd
            WHERE aj.id_atividade = ? AND fe.tipo_funcao = 5`;

        const reporterQuery = `SELECT fe.id_funcionario id
            FROM tb_func_escala fe
            INNER JOIN tb_jogo j ON fe.id_jogo = j.id_jogo
            INNER JOIN tb_atividade_jornada aj ON j.id_atividade_jrd = aj.id_atividade_jrd
            WHERE aj.id_atividade = ? AND fe.tipo_funcao = 6`;

        const operadorQuery = `SELECT fe.id_funcionario id
            FROM tb_func_escala fe
            INNER JOIN tb_jogo j ON fe.id_jogo = j.id_jogo
            INNER JOIN tb_atividade_jornada aj ON j.id_atividade_jrd = aj.id_atividade_jrd
            WHERE aj.id_atividade = ? AND fe.tipo_funcao = 7`;

        const producaoQuery = `SELECT fe.id_funcionario id
            FROM tb_func_escala fe
            INNER JOIN tb_jogo j ON fe.id_jogo = j.id_jogo
            INNER JOIN tb_atividade_jornada aj ON j.id_atividade_jrd = aj.id_atividade_jrd
            WHERE aj.id_atividade = ? AND fe.tipo_funcao = 8`;

        const torcidaQuery = `SELECT fe.id_funcionario id
            FROM tb_func_escala fe
            INNER JOIN tb_jogo j ON fe.id_jogo = j.id_jogo
            INNER JOIN tb_atividade_jornada aj ON j.id_atividade_jrd = aj.id_atividade_jrd
            WHERE aj.id_atividade = ? AND fe.tipo_funcao = 9`;

        const dialQuery = `SELECT fe.id_funcionario id
            FROM tb_func_escala fe
            INNER JOIN tb_jogo j ON fe.id_jogo = j.id_jogo
            INNER JOIN tb_atividade_jornada aj ON j.id_atividade_jrd = aj.id_atividade_jrd
            WHERE aj.id_atividade = ? AND fe.tipo_funcao = 10`;

        const cinegrafistaQuery = `SELECT fe.id_funcionario id
            FROM tb_func_escala fe
            INNER JOIN tb_jogo j ON fe.id_jogo = j.id_jogo
            INNER JOIN tb_atividade_jornada aj ON j.id_atividade_jrd = aj.id_atividade_jrd
            WHERE aj.id_atividade = ? AND fe.tipo_funcao = 11`;

        const digitalQuery = `SELECT fe.id_funcionario id
            FROM tb_func_escala fe
            INNER JOIN tb_jogo j ON fe.id_jogo = j.id_jogo
            INNER JOIN tb_atividade_jornada aj ON j.id_atividade_jrd = aj.id_atividade_jrd
            WHERE aj.id_atividade = ? AND fe.tipo_funcao = 12`;

        const programaQuery = `SELECT j.seguir id
            FROM tb_jogo j
            INNER JOIN tb_atividade_jornada aj ON j.id_atividade_jrd = aj.id_atividade_jrd
            WHERE aj.id_atividade = ?`;

        const hEncerramentoQuery = `SELECT j.encerramento horario
            FROM tb_jogo j
            INNER JOIN tb_atividade_jornada aj ON j.id_atividade_jrd = aj.id_atividade_jrd 
            WHERE aj.id_atividade = ?`;

        const saidaQuery = `SELECT j.saida
            FROM tb_jogo j
            INNER JOIN tb_atividade_jornada aj ON j.id_atividade_jrd = aj.id_atividade_jrd 
            WHERE aj.id_atividade = ?`;

        const retornoQuery = `SELECT j.retorno
            FROM tb_jogo j
            INNER JOIN tb_atividade_jornada aj ON j.id_atividade_jrd = aj.id_atividade_jrd 
            WHERE aj.id_atividade = ?`;

        const todosFuncionariosQuery = `SELECT id_funcionario id, nome 
            FROM tb_funcionario 
            ORDER BY nome`;

        const todosClubesQuery = `SELECT id_clubes id, nome 
            FROM tb_clubes
            ORDER BY nome`;

        const todosProgramasQuery = `SELECT id_programa id, nome 
            FROM tb_programa 
            ORDER BY nome`;

        const todosCampeonatosQuery = `SELECT id_campeonato id, nome
            FROM tb_campeonato
            ORDER BY nome`;

        const todosEstadiosQuery = `SELECT id_local id, nome 
            FROM tb_local 
            ORDER BY nome`;

        // Executa todas as queries com uma única requisição, aumentando desempenho
        const queryPromises = [
            pool.query(dataQuery, [id_escala]),
            pool.query(campeonatoQuery, [id_escala]),
            pool.query(clubesQuery, [id_escala]),
            pool.query(hInicioQuery, [id_escala]),
            pool.query(hJogoQuery, [id_escala]),
            pool.query(estadioQuery, [id_escala]),
            pool.query(narradorQuery, [id_escala]),
            pool.query(ancoraQuery, [id_escala]),
            pool.query(comentaristaQuery, [id_escala]),
            pool.query(arbitragemQuery, [id_escala]),
            pool.query(numerosQuery, [id_escala]),
            pool.query(reporterQuery, [id_escala]),
            pool.query(operadorQuery, [id_escala]),
            pool.query(producaoQuery, [id_escala]),
            pool.query(torcidaQuery, [id_escala]),
            pool.query(dialQuery, [id_escala]),
            pool.query(cinegrafistaQuery, [id_escala]),
            pool.query(digitalQuery, [id_escala]),
            pool.query(programaQuery, [id_escala]),
            pool.query(saidaQuery, [id_escala]),
            pool.query(retornoQuery, [id_escala]),
            pool.query(hEncerramentoQuery, [id_escala]),
            pool.query(todosFuncionariosQuery),
            pool.query(todosClubesQuery),
            pool.query(todosProgramasQuery),
            pool.query(todosCampeonatosQuery),
            pool.query(todosEstadiosQuery),
        ];

        // Repassa os valores da query de uma só vez, agilizando o processo
        const [data, campeonato, clubes, h_inicio, h_jogo, estadio, narrador, ancora, comentarista, arbitragem, numeros, reporter, operador, producao, torcida, dial,
            cinegrafista, digital, programa, saida, retorno, h_encerramento, todosFuncionarios, todosClubes, todosProgramas, todosCampeonatos,
            todosEstadios] = await Promise.all(queryPromises);

        console.log(programa);

        res.render('links/editar/editar_jogos', {
            data, informativos, campeonato, clubes, h_inicio, h_jogo, estadio, narrador, ancora, comentarista, arbitragem, numeros, reporter, operador,
            producao, torcida, dial, cinegrafista, digital, programa, saida, retorno, h_encerramento, todosFuncionarios, todosClubes, todosProgramas, todosCampeonatos, todosEstadios
        });
    };

    async editarJogosPost(req, res) {
        const { /* id_atividade, */ dt_escala, id_campeonato, id_clube1, id_clube2, horario_abertura, horario_jogo, id_local, id_programa, saida, retorno, encerramento,
            importantej, atencaoj, observacaoj, ...rest } = req.body;

        const id_atividade = Array.isArray(req.body.id_atividade) ? req.body.id_atividade[0] : req.body.id_atividade;


        // id_narrador_jogos_${index}
        // id_ancora_jogos_${index}
        // id_comentarista_jogos_${index}
        // id_arbitragem_jogos_${index}
        // id_numeros_jogos_${index}
        // id_reporter_jogos_${index}
        // id_operador_jogos_${index}
        // id_producao-_jogos_${index}

        const id_clubes = [id_clube1, id_clube2];

        // Define categories and the number of items per category
        const categories = [
            "narrador", "ancora", "comentarista", "arbitragem", "numeros", "reporter", "operador", "producao", "torcida", "dial", "cinegrafista", "digital",
        ];
        const numItems = 10;

        // Initialize empty arrays for each category
        const data = categories.reduce((acc, category) => {
            acc[category] = { id: [], obs: [] };
            return acc;
        }, {});

        // Populate the arrays using loops
        for (let i = 1; i <= numItems; i++) {
            categories.forEach(category => {
                data[category].id.push(rest[`id_${category}_jogos_${i}`]);
                data[category].obs.push(rest[`observacao_${capitalize(category)}${i}`]);
            });
        }

        // Filter out undefined elements from each array
        categories.forEach(category => {
            data[category].id = data[category].id.filter(item => item !== undefined);
            data[category].obs = data[category].obs.filter(item => item !== undefined);
        });

        // Function to capitalize the first letter of a string
        function capitalize(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        }

        await pool.query('UPDATE tb_atividade_jornada SET id_campeonato = ? WHERE id_atividade = ?', [id_campeonato, id_atividade]);

        await pool.query('UPDATE tb_atividade SET importantej = ?, atencaoj = ?, observacaoj = ? WHERE dt_escala = ?', [importantej, atencaoj, observacaoj, dt_escala])

        const id_atividade_jrd = await pool.query('SELECT id_atividade_jrd FROM tb_atividade_jornada WHERE id_atividade = ?', [id_atividade]);
        const id_jogo = await pool.query('SELECT id_jogo FROM tb_jogo WHERE id_atividade_jrd = ?', [id_atividade_jrd[0].id_atividade_jrd]);

        const newJogo = {
            id_local,
            id_atividade_jrd: id_atividade_jrd[0].id_atividade_jrd,
            horario_abertura,
            horario_jogo,
            saida,
            retorno,
            seguir: id_programa,
            encerramento
        };

        await pool.query('UPDATE tb_jogo SET ? WHERE id_jogo = ?', [newJogo, id_jogo[0].id_jogo]);

        await pool.query('DELETE FROM tb_clubes_jogos WHERE id_jogo = ?', [id_jogo[0].id_jogo]);

        id_clubes.forEach(async (element) => {
            const newClubesJogos = {
                id_jogo: id_jogo[0].id_jogo,
                id_clube: element
            };

            await pool.query('INSERT INTO tb_clubes_jogos SET ?', [newClubesJogos]);
        });

        // Now data contains all the arrays you need without undefined elements
        const {
            narrador, ancora, comentarista, arbitragem, numeros, reporter, operador, producao, torcida, dial, cinegrafista, digital
        } = data;

        await pool.query('DELETE FROM tb_func_escala WHERE id_jogo = ?', [id_jogo[0].id_jogo]);

        // Retornar aqui após cadastrar o jogo
        narrador.id.forEach(async (id, index) => {
            const obs_funcao = narrador.obs[index];
            const id_funcionario = id;
            const tipo_funcao = 1;

            const newFuncionario = {
                id_funcionario,
                id_jogo: id_jogo[0].id_jogo,
                tipo_funcao,
                obs_funcao
            };

            await pool.query('INSERT INTO tb_func_escala SET ?', [newFuncionario]);
        });

        ancora.id.forEach(async (id, index) => {
            const obs_funcao = ancora.obs[index];
            const id_funcionario = id;
            const tipo_funcao = 2;

            const newFuncionario = {
                id_funcionario,
                id_jogo: id_jogo[0].id_jogo,
                tipo_funcao,
                obs_funcao
            };

            await pool.query('INSERT INTO tb_func_escala SET ?', [newFuncionario]);
        });

        comentarista.id.forEach(async (id, index) => {
            const obs_funcao = comentarista.obs[index];
            const id_funcionario = id;
            const tipo_funcao = 3;

            const newFuncionario = {
                id_funcionario,
                id_jogo: id_jogo[0].id_jogo,
                tipo_funcao,
                obs_funcao
            };

            await pool.query('INSERT INTO tb_func_escala SET ?', [newFuncionario]);
        });

        arbitragem.id.forEach(async (id, index) => {
            const obs_funcao = arbitragem.obs[index];
            const id_funcionario = id;
            const tipo_funcao = 4;

            const newFuncionario = {
                id_funcionario,
                id_jogo: id_jogo[0].id_jogo,
                tipo_funcao,
                obs_funcao
            };

            await pool.query('INSERT INTO tb_func_escala SET ?', [newFuncionario]);
        });

        numeros.id.forEach(async (id, index) => {
            const obs_funcao = numeros.obs[index];
            const id_funcionario = id;
            const tipo_funcao = 5;

            const newFuncionario = {
                id_funcionario,
                id_jogo: id_jogo[0].id_jogo,
                tipo_funcao,
                obs_funcao
            };

            await pool.query('INSERT INTO tb_func_escala SET ?', [newFuncionario]);
        });

        reporter.id.forEach(async (id, index) => {
            const obs_funcao = reporter.obs[index];
            const id_funcionario = id;
            const tipo_funcao = 6;

            const newFuncionario = {
                id_funcionario,
                id_jogo: id_jogo[0].id_jogo,
                tipo_funcao,
                obs_funcao
            };

            await pool.query('INSERT INTO tb_func_escala SET ?', [newFuncionario]);
        });

        operador.id.forEach(async (id, index) => {
            const obs_funcao = operador.obs[index];
            const id_funcionario = id;
            const tipo_funcao = 7;

            const newFuncionario = {
                id_funcionario,
                id_jogo: id_jogo[0].id_jogo,
                tipo_funcao,
                obs_funcao
            };

            await pool.query('INSERT INTO tb_func_escala SET ?', [newFuncionario]);
        });

        producao.id.forEach(async (id, index) => {
            const obs_funcao = producao.obs[index];
            const id_funcionario = id;
            const tipo_funcao = 8;

            const newFuncionario = {
                id_funcionario,
                id_jogo: id_jogo[0].id_jogo,
                tipo_funcao,
                obs_funcao
            };

            await pool.query('INSERT INTO tb_func_escala SET ?', [newFuncionario]);
        });

        torcida.id.forEach(async (id, index) => {
            const obs_funcao = torcida.obs[index];
            const id_funcionario = id;
            const tipo_funcao = 9;

            const newFuncionario = {
                id_funcionario,
                id_jogo: id_jogo[0].id_jogo,
                tipo_funcao,
                obs_funcao
            };

            await pool.query('INSERT INTO tb_func_escala SET ?', [newFuncionario]);
        });

        dial.id.forEach(async (id, index) => {
            const obs_funcao = dial.obs[index];
            const id_funcionario = id;
            const tipo_funcao = 10;

            const newFuncionario = {
                id_funcionario,
                id_jogo: id_jogo[0].id_jogo,
                tipo_funcao,
                obs_funcao
            };

            await pool.query('INSERT INTO tb_func_escala SET ?', [newFuncionario]);
        });

        cinegrafista.id.forEach(async (id, index) => {
            const obs_funcao = cinegrafista.obs[index];
            const id_funcionario = id;
            const tipo_funcao = 11;

            const newFuncionario = {
                id_funcionario,
                id_jogo: id_jogo[0].id_jogo,
                tipo_funcao,
                obs_funcao
            };

            await pool.query('INSERT INTO tb_func_escala SET ?', [newFuncionario]);
        });

        digital.id.forEach(async (id, index) => {
            const obs_funcao = digital.obs[index];
            const id_funcionario = id;
            const tipo_funcao = 12;

            const newFuncionario = {
                id_funcionario,
                id_jogo: id_jogo[0].id_jogo,
                tipo_funcao,
                obs_funcao
            };

            await pool.query('INSERT INTO tb_func_escala SET ?', [newFuncionario]);
        });

        req.flash('success', 'Escala editada com sucesso!');
        res.redirect('/profile');
    };
};

module.exports = new editarJogos();