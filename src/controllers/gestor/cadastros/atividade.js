const pool = require('../../../database');

class cadastroAtividade {

    //CADASTRAR PROMOÇÕES
    async cadastroAtividadeGet(req, res) {
        const dt_escala = req.query

        const funcionario = await pool.query('SELECT id_funcionario, nome FROM tb_funcionario ORDER BY nome;');
        const evento = await pool.query('SELECT id_evento, nome FROM tb_evento WHERE info_manual IS NULL ORDER BY nome');
        const programa = await pool.query('SELECT id_programa, nome FROM tb_programa ORDER BY nome;');
        const clube = await pool.query('SELECT id_clubes, nome FROM tb_clubes ORDER BY nome');
        const campeonato = await pool.query('SELECT id_campeonato, nome FROM tb_campeonato ORDER BY nome');
        const local = await pool.query('SELECT id_local, nome FROM tb_local ORDER BY nome');

        const dt = dt_escala.dt_escala

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

        res.render('links/cadastros/cadastro_atividade', { evento, funcionario, programa, clube, campeonato, local, informativos });
    };

    async cadastroAtividadePost(req, res) {
        const { tipoEscala } = req.body;

        // Cadastro escala tipo escala
        if (tipoEscala == 1) {
            const { dt_escala, eventomanual,
                id_funcionario_escala_1, id_funcionario_escala_2, id_funcionario_escala_3, id_funcionario_escala_4, id_funcionario_escala_5,
                id_funcionario_escala_6, id_funcionario_escala_7, id_funcionario_escala_8, id_funcionario_escala_9, id_funcionario_escala_10,
                observacao, h_evento_inicio, h_evento_fim, id_programa1, id_programa2, id_programa3, id_programa4,
                id_programa5, id_programa6, id_programa7, id_programa8, id_programa9, id_programa10, auxProg } = req.body;

            let { id_evento, auxFunc } = req.body;

            const id_funcionarios = [id_funcionario_escala_1, id_funcionario_escala_2, id_funcionario_escala_3, id_funcionario_escala_4,
                id_funcionario_escala_5, id_funcionario_escala_6, id_funcionario_escala_7, id_funcionario_escala_8, id_funcionario_escala_9,
                id_funcionario_escala_10];

            const id_programas = [id_programa1, id_programa2, id_programa3, id_programa4, id_programa5,
                id_programa6, id_programa7, id_programa8, id_programa9, id_programa10];

            const atv_evento = 1;

            const novaAtividade = {
                dt_escala,
                atv_evento,
                observacao
            };

            console.log(`idevento: ${id_evento}`)

            auxFunc = auxFunc.split(',')[0];


            if (eventomanual == '') {
            } else {
                const nome = eventomanual;
                const info_manual = 1;
                const newEvent = { nome, info_manual }

                await pool.query('INSERT INTO tb_evento SET ?', [newEvent]);
                const aux = await pool.query('SELECT id_evento FROM tb_evento ORDER BY id_evento DESC');
                id_evento = aux[0].id_evento;
            }

            const id = req.user.id;

            const dt_update_evento = new Date();

            await pool.query('INSERT INTO tb_atividade set ?', [novaAtividade]);

            const id_atv = await pool.query('SELECT id_atividade FROM tb_atividade ORDER BY id_atividade DESC');
            const id_atividade = id_atv[0].id_atividade;
            const comum = { id_evento, id, id_atividade, dt_update_evento }
            const atividadeEvento = h_evento_inicio === '' ? { ...comum } : h_evento_fim === '' ? { ...comum, h_evento_inicio } : { ...comum, h_evento_inicio, h_evento_fim };

            console.log(atividadeEvento);

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

            // Cadastro de escala tipo jogo
        } else if (tipoEscala == 2) {
            const {
                dt_escala, jornada, id_campeonato, id_clube1, id_clube2, horario_abertura, horario_jogo, id_local,
                id_programa, saida, retorno, encerramento, importantej, atencaoj, observacaoj,
                ...rest // Destructure the rest of the properties to handle dynamically
            } = req.body;

            const id_clubes = [id_clube1, id_clube2];

            const atv_programa = 1;

            // Define categories and the number of items per category
            const categories = [
                "narrador", "ancora", "comentarista", "arbitragem", "numeros", "reporter", "operador", "producao", "torcida", "dial", "cinegrafista", "digital"
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

            const newAtividade = {
                dt_escala,
                atv_programa
            };

            await pool.query('INSERT INTO tb_atividade SET ?', [newAtividade]);

            const id_atividade = await pool.query('SELECT id_atividade FROM tb_atividade ORDER BY id_atividade DESC');

            await pool.query('UPDATE tb_atividade SET importantej = ?, atencaoj = ?, observacaoj = ? WHERE dt_escala = ?', [importantej, atencaoj, observacaoj, dt_escala])

            const newJornada = {
                id_campeonato,
                id_atividade: id_atividade[0].id_atividade
            };

            await pool.query('INSERT INTO tb_atividade_jornada SET ?', [newJornada]);

            const id_atividade_jrd = await pool.query('SELECT id_atividade_jrd FROM tb_atividade_jornada ORDER BY id_atividade_jrd DESC');

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

            await pool.query('INSERT INTO tb_jogo SET ?', [newJogo]);

            const id_jogo = await pool.query('SELECT id_jogo FROM tb_jogo ORDER BY id_jogo DESC');

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

            /* novos cargos */
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
        }
        req.flash('success', 'Atividade cadastrada com sucesso!');
        res.redirect('/profile');
    };
};

module.exports = new cadastroAtividade();