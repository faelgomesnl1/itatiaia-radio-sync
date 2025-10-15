const pool = require('../../../database');

class cadastroPlanejamento {
    async escolheEventoGet(req, res) {
        const userId = req.session.userId;
        const eventos = await pool.query(`SELECT ev.id, ev.titulo, ev.data FROM tb_evento ev WHERE copiados_vinculado = 1 ORDER BY ev.data;`);
        const [user] = await pool.query(`SELECT permissao, ADMIN FROM users WHERE id = ?`, [userId]);
        // Formata a data para 'dd/mm/aaaa'
        eventos.forEach(evento => {
            const data = new Date(evento.data);
            evento.dataFormatada = data.toLocaleDateString('pt-BR');
        });
        res.render('links/consultas/lista_eventos', { eventos, user })
    };

    async cadastroPlanejamentoGet(req, res) {
        const { id } = req.params;
        const userId = req.session.userId;

        try {
            // Buscar o setor do usuário
            const user = await pool.query(`SELECT setor FROM users WHERE id = ?`, [userId]);

            // Buscar dados do evento
            const [evento] = await pool.query(`SELECT ev.id, ev.titulo, ev.data FROM tb_evento ev WHERE id = ?`, [id]);

            // Buscar nome do setor
            const [setor] = await pool.query(`SELECT s.id, s.nome AS name FROM tb_setor s WHERE id = ?;`, [user[0].setor]);

            // Verifica se o setor é Rádio
            const ehRadio = setor.name.toLowerCase() === "rádio";

            const ehVideo = setor.name.toLowerCase() === "vídeo";

            // Buscar funcionários do mesmo setor
            const funcionarios = await pool.query(`
      SELECT f.id, f.ativo, f.nome AS name 
      FROM tb_funcionario f 
      WHERE f.setor = ? 
      ORDER BY f.nome;
    `, [user[0].setor]);

            // Buscar programas disponíveis
            const programas = await pool.query(`SELECT p.id, p.nome AS name FROM tb_programa p ORDER BY p.nome;`);

            // Buscar origens do evento
            const origens = await pool.query(`
      SELECT o.id, o.nome 
      FROM tb_origem_eventos oe 
      JOIN tb_origem o ON oe.id_origem = o.id 
      WHERE oe.id_evento = ?
    `, [id]);

            // Renderiza a view com as informações
            res.render('links/cadastros/cadastro_planejamento', {
                evento: JSON.stringify(evento),
                evento,
                setor,
                funcionarios: JSON.stringify(funcionarios),
                programas: JSON.stringify(programas),
                origens: JSON.stringify(origens),
                idEvento: id,
                ehRadio, // <- aqui vai a flag booleana
                ehVideo
            });

        } catch (err) {
            console.error('Erro ao buscar evento:', err);
            res.status(500).send('Erro interno no servidor');
        }
    }

    async cadastroPlanejamentoPost(req, res) {
        const id_evento = req.params.id;
        try {
            const { id_setor, producao, escala, logistica, outros, conteudo_radio } = req.body;

            // Inserir planejamento
            const result = await pool.query(`
            INSERT INTO tb_planejamento (id_evento, id_setor, producao, escala, logistica, outros)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [id_evento, id_setor, producao, escala, logistica, outros]);
            const idPlanejamento = result.insertId;

            // === FUNCIONÁRIOS ===
            let funcionarios =
                req.body['funcionarios_ids[]'] ||
                req.body['funcionarios_ids'] ||
                req.body.funcionarios_ids ||
                req.body.funcionarios ||
                [];

            // achata caso venha [["11","9"]]
            if (Array.isArray(funcionarios) && Array.isArray(funcionarios[0])) funcionarios = funcionarios[0];
            if (!Array.isArray(funcionarios)) funcionarios = funcionarios ? [funcionarios] : [];

            for (const idFuncionario of funcionarios) {
                if (!idFuncionario) continue;
                await pool.query(`
                INSERT INTO tb_func_setor (id_funcionario, id_planejamento, id_setor)
                VALUES (?, ?, ?)
            `, [idFuncionario, idPlanejamento, id_setor]);
                console.log(`  → Funcionário ${idFuncionario} vinculado ao planejamento ${idPlanejamento}`);
            }

            // === PROGRAMAS + OBSERVAÇÕES ===
            let programas =
                req.body['programas_ids[]'] ||
                req.body['programas_ids'] ||
                req.body.programas_ids ||
                req.body.programas_nomes || // caso venha nome em vez de id
                req.body.programas ||
                [];

            let observacoes =
                req.body['obs_programa[]'] ||
                req.body['obs_programa'] ||
                req.body.obs_programa ||
                req.body.observacoes ||
                [];

            // achatar se preciso
            if (Array.isArray(programas) && Array.isArray(programas[0])) programas = programas[0];
            if (Array.isArray(observacoes) && Array.isArray(observacoes[0])) observacoes = observacoes[0];

            if (!Array.isArray(programas)) programas = programas ? [programas] : [];
            if (!Array.isArray(observacoes)) observacoes = observacoes ? [observacoes] : [];

            // Garantir que observacoes tenha pelo menos o mesmo tamanho de programas
            while (observacoes.length < programas.length) observacoes.push('');

            if (programas.length === 0) {
                // Nenhum programa selecionado, salvar só observação (conteúdo livre)
                await pool.query(`
                INSERT INTO tb_prog_conteudo (id_programa, id_setor, id_planejamento, observacao)
                VALUES (?, ?, ?, ?)
            `, [null, id_setor, idPlanejamento, conteudo_radio || '']);
            } else {
                // Salvar programas com observações correspondentes (mesmo índice)
                for (let i = 0; i < programas.length; i++) {
                    const idProg = programas[i];
                    const obs = observacoes[i] || '';
                    await pool.query(`
                    INSERT INTO tb_prog_conteudo (id_programa, id_setor, id_planejamento, observacao)
                    VALUES (?, ?, ?, ?)
                `, [idProg, id_setor, idPlanejamento, obs]);
                }
            }

            req.flash('success', 'Planejamento salvo com sucesso!');
            return res.redirect('/profile');

        } catch (err) {
            console.error('Erro detalhado ao salvar planejamento:', err);
            req.flash('error', `Erro ao salvar planejamento: ${err.message}`);
            return res.redirect(req.get('Referrer') || '/');
        }
    }


    async cadastroPlanejamentoADM(req, res) {
        const { id } = req.params;
        const userId = req.session.userId;

        try {
            // Setor do usuário
            const [user] = await pool.query(`SELECT setor FROM users WHERE id = ?`, [userId]);
            const [setorUsuario] = await pool.query(
                `SELECT s.id, s.nome AS name FROM tb_setor s WHERE id = ?`,
                [user.setor]
            );

            // Evento
            const [evento] = await pool.query(
                `SELECT ev.id, ev.titulo, ev.data FROM tb_evento ev WHERE id = ?`,
                [id]
            );

            // Flags de setor
            const ehRadio = setorUsuario.name.toLowerCase() === "rádio";
            const ehVideo = setorUsuario.name.toLowerCase() === "vídeo";

            // Todos os setores
            const setores = await pool.query(`
            SELECT s.id, s.nome AS name 
            FROM tb_setor s 
            ORDER BY s.nome
        `);

            // Todos os funcionários
            const funcionarios = await pool.query(`
            SELECT 
                f.id, 
                f.ativo, 
                f.nome AS name,
                f.setor AS setor_id,
                s.nome AS setor_nome
            FROM tb_funcionario f 
            LEFT JOIN tb_setor s ON f.setor = s.id
            ORDER BY f.nome
        `);

            // Programas disponíveis
            const programas = await pool.query(`SELECT p.id, p.nome AS name FROM tb_programa p ORDER BY p.nome`);

            // Origens do evento
            const origens = await pool.query(`
            SELECT o.id, o.nome 
            FROM tb_origem_eventos oe 
            JOIN tb_origem o ON oe.id_origem = o.id 
            WHERE oe.id_evento = ?
        `, [id]);

            // Buscar planejamentos existentes (similar ao editarPlanejamentoADMGet)
            const dadosPlanejamentos = await pool.query(`
            SELECT DISTINCT p.id AS id_planejamento, p.producao, p.escala, p.logistica, p.outros,
                   p.id_setor AS id_setor_planejamento, s3.nome AS nome_setor_planejamento,
                   fs.id_funcionario, f.nome AS nome_funcionario, 
                   pc.id_programa, pr.nome AS nome_programa, pc.observacao AS obs_programa
            FROM tb_planejamento p
            LEFT JOIN tb_setor s3 ON s3.id = p.id_setor              
            LEFT JOIN tb_func_setor fs ON fs.id_planejamento = p.id
            LEFT JOIN tb_funcionario f ON f.id = fs.id_funcionario
            LEFT JOIN tb_prog_conteudo pc ON pc.id_planejamento = p.id
            LEFT JOIN tb_programa pr ON pr.id = pc.id_programa
            WHERE p.id_evento = ?
            ORDER BY p.id
        `, [id]);

            // Processar planejamentos
            const planejamentosMap = new Map();

            for (const row of dadosPlanejamentos) {
                if (!row.id_planejamento) continue;

                if (!planejamentosMap.has(row.id_planejamento)) {
                    const ehRadioSetor = row.nome_setor_planejamento?.toLowerCase() === "rádio";

                    planejamentosMap.set(row.id_planejamento, {
                        id: row.id_planejamento,
                        id_setor: row.id_setor_planejamento,
                        producao: row.producao,
                        escala: row.escala,
                        logistica: row.logistica,
                        outros: row.outros,
                        funcionarios: [],
                        programas: [],
                        observacao_geral: "",
                        ehRadio: ehRadioSetor
                    });
                }

                const planejamento = planejamentosMap.get(row.id_planejamento);

                // Funcionários
                if (row.id_funcionario && !planejamento.funcionarios.some(f => f.id === row.id_funcionario)) {
                    planejamento.funcionarios.push({
                        id: row.id_funcionario,
                        nome: row.nome_funcionario
                    });
                }

                // Programas
                if (planejamento.ehRadio && row.id_programa) {
                    // Verifica se o programa já não foi adicionado
                    const programaJaExiste = planejamento.programas.some(p => p.id === row.id_programa);
                    if (!programaJaExiste) {
                        planejamento.programas.push({
                            id: row.id_programa,
                            nome: row.nome_programa,
                            observacao: row.obs_programa
                        });
                    }
                }
            }

            const planejamentos = Array.from(planejamentosMap.values());

            // Juntar setores + funcionários + planejamento
            const setoresComPlanejamento = setores.map(setor => {
                const funcsDoSetor = funcionarios.filter(f => f.setor_id === setor.id);
                const planejamento = planejamentos.find(p => p.id_setor === setor.id);

                return {
                    ...setor,
                    funcionarios: funcsDoSetor,
                    ehRadio: setor.name?.toLowerCase() === "rádio",
                    planejamento: planejamento || null
                };
            });

            res.render('links/cadastros/cadastro_planejamento_ADM', {
                evento,
                setores: setoresComPlanejamento,
                programas: JSON.stringify(programas),
                origens,
                funcionarios,                      // caso precise server-side
                funcionariosJson: JSON.stringify(funcionarios),
                idEvento: id,
                ehRadio,
                ehVideo
            });

        } catch (err) {
            console.error('Erro ao buscar evento:', err);
            res.status(500).send('Erro interno no servidor');
        }
    }
    async cadastroPlanejamentoADMPost(req, res) {
        const id_evento = req.params.id;

        try {
            const { planejamentos } = req.body;

            if (!planejamentos || !Array.isArray(planejamentos)) {
                req.flash('error', 'Dados de planejamento inválidos');
                return res.redirect('back');
            }

            // Processar cada planejamento individualmente
            for (const [index, planejamento] of planejamentos.entries()) {
                const {
                    id_setor,
                    id_planejamento,
                    producao,
                    escala,
                    logistica,
                    outros,
                    funcionarios = [],
                    conteudos = [],
                    conteudos_ids = [],
                    conteudos_nomes = [],
                    obs_conteudo = [],
                    conteudo_radio,
                    funcionarios_ids = [],
                    funcionarios_nomes = []
                } = planejamento;

                if (!id_setor) {
                    continue;
                }

                // VERIFICAR SE O SETOR ESTÁ COMPLETAMENTE VAZIO
                const isEmpty =
                    (!producao || producao.trim() === '') &&
                    (!escala || escala.trim() === '') &&
                    (!logistica || logistica.trim() === '') &&
                    (!outros || outros.trim() === '') &&
                    (!conteudo_radio || conteudo_radio.trim() === '') &&
                    (!funcionarios || funcionarios.length === 0 || (funcionarios.length === 1 && funcionarios[0] === '')) &&
                    (!funcionarios_ids || funcionarios_ids.length === 0 || (funcionarios_ids.length === 1 && funcionarios_ids[0] === '')) &&
                    (!conteudos || conteudos.length === 0 || (conteudos.length === 1 && conteudos[0] === '')) &&
                    (!conteudos_ids || conteudos_ids.length === 0 || (conteudos_ids.length === 1 && conteudos_ids[0] === ''));

                if (isEmpty) {
                    continue;
                }

                let idPlanejamento;

                // Verificar se já existe planejamento (edição) ou se é novo
                if (id_planejamento) {
                    // ATUALIZAR apenas os campos básicos do planejamento
                    idPlanejamento = id_planejamento;
                    await pool.query(`
                    UPDATE tb_planejamento 
                    SET producao = ?, escala = ?, logistica = ?, outros = ?
                    WHERE id = ?
                `, [producao || '', escala || '', logistica || '', outros || '', idPlanejamento]);


                } else {
                    // NOVO planejamento
                    const result = await pool.query(`
                    INSERT INTO tb_planejamento (id_evento, id_setor, producao, escala, logistica, outros)
                    VALUES (?, ?, ?, ?, ?, ?)
                `, [id_evento, id_setor, producao || '', escala || '', logistica || '', outros || '']);

                    idPlanejamento = result.insertId;
                }

                // 1. INSERIR FUNCIONÁRIOS - COM VERIFICAÇÃO DE DUPLICATAS
                let funcionariosParaInserir = [];

                if (funcionarios_ids && funcionarios_ids.length > 0) {
                    funcionariosParaInserir = Array.isArray(funcionarios_ids) ? funcionarios_ids : [funcionarios_ids];
                }
                else if (funcionarios && funcionarios.length > 0) {
                    funcionariosParaInserir = Array.isArray(funcionarios) ? funcionarios : [funcionarios];
                }

                if (funcionariosParaInserir.length > 0) {

                    // Buscar funcionários já existentes no banco para este planejamento
                    const funcionariosExistentes = await pool.query(
                        `SELECT id_funcionario FROM tb_func_setor WHERE id_planejamento = ?`,
                        [idPlanejamento]
                    );

                    const funcionariosExistentesIds = funcionariosExistentes.map(f => f.id_funcionario.toString());
                    let novosInseridos = 0;

                    for (const idFuncionario of funcionariosParaInserir) {
                        if (idFuncionario && idFuncionario !== '' && idFuncionario !== '0') {
                            // Verificar se o funcionário já existe no banco
                            if (!funcionariosExistentesIds.includes(idFuncionario.toString())) {
                                await pool.query(`
                                INSERT INTO tb_func_setor (id_funcionario, id_planejamento, id_setor)
                                VALUES (?, ?, ?)
                            `, [idFuncionario, idPlanejamento, id_setor]);
                                novosInseridos++;
                            } else {

                            }
                        }
                    }
                }

                // 2. INSERIR PROGRAMAS/CONTEÚDO - COM VERIFICAÇÃO DE DUPLICATAS
                const [setorInfo] = await pool.query(`SELECT nome FROM tb_setor WHERE id = ?`, [id_setor]);
                const ehRadio = setorInfo?.nome?.toLowerCase().includes("rádio");

                if (ehRadio) {
                    let conteudosParaInserir = [];
                    let observacoesParaInserir = [];

                    if (conteudos_ids && conteudos_ids.length > 0) {
                        conteudosParaInserir = Array.isArray(conteudos_ids) ? conteudos_ids : [conteudos_ids];
                    }
                    else if (conteudos && conteudos.length > 0) {
                        conteudosParaInserir = Array.isArray(conteudos) ? conteudos : [conteudos];
                    }

                    if (obs_conteudo && obs_conteudo.length > 0) {
                        observacoesParaInserir = Array.isArray(obs_conteudo) ? obs_conteudo : [obs_conteudo];
                    } else {
                        observacoesParaInserir = new Array(conteudosParaInserir.length).fill('');
                    }

                    if (conteudosParaInserir.length > 0) {

                        // Buscar programas já existentes no banco para este planejamento
                        const programasExistentes = await pool.query(
                            `SELECT id_programa FROM tb_prog_conteudo WHERE id_planejamento = ?`,
                            [idPlanejamento]
                        );

                        const programasExistentesIds = programasExistentes.map(p => p.id_programa.toString());
                        let novosInseridos = 0;

                        for (let i = 0; i < conteudosParaInserir.length; i++) {
                            const idConteudo = conteudosParaInserir[i];
                            const observacao = observacoesParaInserir[i] || '';

                            if (idConteudo && idConteudo !== '' && idConteudo !== '0') {
                                // Verificar se o programa já existe no banco
                                if (!programasExistentesIds.includes(idConteudo.toString())) {
                                    await pool.query(`
                                    INSERT INTO tb_prog_conteudo (id_programa, id_setor, id_planejamento, observacao)
                                    VALUES (?, ?, ?, ?)
                                `, [idConteudo, id_setor, idPlanejamento, observacao]);
                                    novosInseridos++;
                                } else {
                                }
                            }
                        }
                    }
                } else {
                    // Lógica para OUTROS SETORES
                    if (conteudo_radio && conteudo_radio.trim() !== '') {
                        // Verificar se já existe observação para este setor/planejamento
                        const [obsExistente] = await pool.query(
                            `SELECT id FROM tb_prog_conteudo WHERE id_planejamento = ? AND id_setor = ? AND id_programa IS NULL`,
                            [idPlanejamento, id_setor]
                        );

                        if (obsExistente.length === 0) {
                            await pool.query(`
                            INSERT INTO tb_prog_conteudo (id_setor, id_planejamento, observacao)
                            VALUES (?, ?, ?)
                        `, [id_setor, idPlanejamento, conteudo_radio]);
                        } else {
                        }
                    }
                }
            }

            req.flash('success', 'Planejamentos salvos com sucesso!');
            return res.redirect('/profile');

        } catch (err) {
            console.error('❌ Erro detalhado ao salvar planejamentos:', err);
            req.flash('error', `Erro ao salvar planejamentos: ${err.message}`);
            return res.redirect('back');
        }
    }

    async consultarPlanejamento(req, res) {
        const userId = req.session.userId;
        try {
            const [user] = await pool.query(`SELECT permissao, ADMIN FROM users WHERE id = ?`, [userId]);
            const setorUsuario = req.user.setor;

            let eventos;
            let query;

            // Se for ADMIN = 2, busca todos os eventos sem filtro de setor
            if (user.ADMIN === 2) {
                query = `
                SELECT DISTINCT ev.id, ev.titulo, ev.data
                FROM tb_evento ev
                INNER JOIN tb_planejamento p ON p.id_evento = ev.id
                WHERE ev.data >= CURDATE()
                ORDER BY ev.data;
            `;
                eventos = await pool.query(query);
            } else {
                query = `
                SELECT DISTINCT ev.id, ev.titulo, ev.data
                FROM tb_evento ev
                INNER JOIN tb_planejamento p ON p.id_evento = ev.id
                WHERE p.id_setor = ? AND ev.data >= CURDATE()
                ORDER BY ev.data;
            `;
                eventos = await pool.query(query, [setorUsuario]);
            }

            // Formata a data para 'dd/mm/aaaa'
            eventos.forEach(evento => {
                const data = new Date(evento.data);
                evento.dataFormatada = data.toLocaleDateString('pt-BR');
            });

            res.render('links/consultas/consulta_planejamento', { eventos, user });
        } catch (err) {
            console.error('Erro ao buscar eventos com planejamento:', err);
            req.flash('error', 'Erro ao buscar eventos.');
            res.redirect('back');
        }
    }

    async editarPlanejamentoADMGet(req, res) {
        const { id } = req.params;

        try {
            // 1. Busca os dados principais
            const dados = await pool.query(`
            SELECT e.id AS id_evento, e.titulo, e.data, e.h_inicio, e.h_fim, e.local, 
                   e.diretriz, e.antes_evento, e.linha_editorial, e.divulgacao, e.observacao,
                   p.id AS id_planejamento, p.producao, p.escala, p.logistica, p.outros,
                   p.id_setor AS id_setor_planejamento, s3.nome AS nome_setor_planejamento,
                   fs.id_funcionario, f.nome AS nome_funcionario, 
                   fs.id_setor AS id_setor_func, s1.nome AS nome_setor_func,
                   pc.id_programa, pr.nome AS nome_programa, pc.observacao AS obs_programa, 
                   pc.id_setor AS id_setor_prog, s2.nome AS nome_setor_prog
            FROM tb_evento e
            LEFT JOIN tb_planejamento p ON p.id_evento = e.id
            LEFT JOIN tb_setor s3 ON s3.id = p.id_setor              
            LEFT JOIN tb_func_setor fs ON fs.id_planejamento = p.id
            LEFT JOIN tb_funcionario f ON f.id = fs.id_funcionario
            LEFT JOIN tb_setor s1 ON s1.id = fs.id_setor
            LEFT JOIN tb_prog_conteudo pc ON pc.id_planejamento = p.id
            LEFT JOIN tb_programa pr ON pr.id = pc.id_programa
            LEFT JOIN tb_setor s2 ON s2.id = pc.id_setor
            WHERE e.id = ?
            ORDER BY p.id;
        `, [id]);

            if (dados.length === 0) {
                req.flash('error', 'Nenhum planejamento encontrado para este evento.');
                return res.redirect('back');
            }

            // Busca TODOS os programas (apenas id e nome)
            const todosProgramas = await pool.query('SELECT id, nome FROM tb_programa ORDER BY nome');

            // Busca TODOS os funcionários (apenas id e nome)
            const todosFuncionarios = await pool.query('SELECT id, nome FROM tb_funcionario ORDER BY nome');

            // 2. Processa os dados
            const evento = {
                id: dados[0].id_evento,
                titulo: dados[0].titulo,
                data: dados[0].data.toISOString().split('T')[0],
                h_inicio: dados[0].h_inicio?.substring(0, 5) || '',
                h_fim: dados[0].h_fim?.substring(0, 5) || '',
                local: dados[0].local,
                diretriz: dados[0].diretriz,
                antes_evento: dados[0].antes_evento,
                linha_editorial: dados[0].linha_editorial,
                divulgacao: dados[0].divulgacao,
                observacao: dados[0].observacao
            };

            const planejamentosMap = new Map();

            for (const row of dados) {
                if (!row.id_planejamento) continue;

                if (!planejamentosMap.has(row.id_planejamento)) {
                    // VERIFICA SE O PLANEJAMENTO É DO SETOR RÁDIO
                    const ehRadio = row.nome_setor_planejamento?.toLowerCase() === "rádio";

                    planejamentosMap.set(row.id_planejamento, {
                        id: row.id_planejamento,
                        id_setor: row.id_setor_planejamento, // ✅ Adiciona o id_setor aqui
                        producao: row.producao,
                        escala: row.escala,
                        logistica: row.logistica,
                        outros: row.outros,
                        setorPlanejamento: row.nome_setor_planejamento,
                        ehRadio: ehRadio,
                        funcionarios: [],
                        programas: [],
                        observacao_geral: ""
                    });
                }

                const planejamento = planejamentosMap.get(row.id_planejamento);

                // Adicionar funcionário, se ainda não adicionado
                if (row.id_funcionario && !planejamento.funcionarios.some(f => f.id === row.id_funcionario)) {
                    planejamento.funcionarios.push({
                        id: row.id_funcionario,
                        nome: row.nome_funcionario,
                        setor: row.nome_setor_func
                    });
                }

                // Adicionar programa (lógica baseada no setor do planejamento)
                if (planejamento.ehRadio && row.id_programa &&
                    !planejamento.programas.some(p => p.id === row.id_programa && p.observacao === row.obs_programa)) {
                    planejamento.programas.push({
                        id: row.id_programa,
                        nome: row.nome_programa,
                        observacao: row.obs_programa,
                        setor: row.nome_setor_prog
                    });
                }
                else if (!planejamento.ehRadio && row.obs_programa) {
                    planejamento.observacao_geral = row.obs_programa;
                }
            }

            // Converte o Map para array
            const planejamentos = Array.from(planejamentosMap.values());

            res.render('links/editar/editar_planejamento_ADM', {
                evento,
                planejamentos,
                todosProgramas,
                todosFuncionarios,
                idEvento: id
            });

        } catch (error) {
            console.error('Erro ao buscar planejamento:', error);
            req.flash('error', 'Erro interno do servidor.');
            res.redirect('back');
        }
    }

    async editarPlanejamentoGet(req, res) {
        const { id } = req.params;
        const userSetor = req.user.setor;
        const userId = req.session.userId

        try {
            // 1. Busca os dados principais filtrando pelo setor do usuário no planejamento
            const dados = await pool.query(`
            SELECT e.id AS id_evento, e.titulo, e.data, e.h_inicio, e.h_fim, e.local, 
                   e.diretriz, e.antes_evento, e.linha_editorial, e.divulgacao, e.observacao,
                   p.id AS id_planejamento, p.producao, p.escala, p.logistica, p.outros,
                   fs.id_funcionario, f.nome AS nome_funcionario, 
                   fs.id_setor AS id_setor_func, s1.nome AS nome_setor_func,
                   pc.id_programa, pr.nome AS nome_programa, pc.observacao AS obs_programa, 
                   pc.id_setor AS id_setor_prog, s2.nome AS nome_setor_prog
            FROM tb_evento e
            LEFT JOIN tb_planejamento p ON p.id_evento = e.id
            LEFT JOIN tb_func_setor fs ON fs.id_planejamento = p.id
            LEFT JOIN tb_funcionario f ON f.id = fs.id_funcionario
            LEFT JOIN tb_setor s1 ON s1.id = fs.id_setor
            LEFT JOIN tb_prog_conteudo pc ON pc.id_planejamento = p.id
            LEFT JOIN tb_programa pr ON pr.id = pc.id_programa
            LEFT JOIN tb_setor s2 ON s2.id = pc.id_setor
            WHERE e.id = ? AND p.id_setor = ?
            ORDER BY p.id;
        `, [id, userSetor]);

            // Buscar o setor do usuário
            const user = await pool.query(`SELECT setor FROM users WHERE id = ?`, [userId]);

            // Buscar nome do setor
            const [setor] = await pool.query(`SELECT s.id, s.nome AS name FROM tb_setor s WHERE id = ?;`, [user[0].setor]);

            // Verifica se o setor é Rádio
            const ehRadio = setor.name.toLowerCase() === "rádio";

            if (dados.length === 0) {
                req.flash('error', 'Nenhum planejamento do seu setor encontrado para este evento.');
                return res.redirect('back');
            }
            // Busca TODOS os programas (apenas id e nome)
            const todosProgramas = await pool.query('SELECT id, nome FROM tb_programa ORDER BY nome');

            // Busca TODOS os funcionários (apenas id e nome)
            const todosFuncionarios = await pool.query('SELECT id, nome FROM tb_funcionario ORDER BY nome');

            // 3. Processa os dados (mantendo sua lógica original)
            const evento = {
                id: dados[0].id_evento,
                titulo: dados[0].titulo,
                data: dados[0].data.toISOString().split('T')[0], // Formato para input date
                h_inicio: dados[0].h_inicio?.substring(0, 5) || '',
                h_fim: dados[0].h_fim?.substring(0, 5) || '',
                local: dados[0].local,
                diretriz: dados[0].diretriz,
                antes_evento: dados[0].antes_evento,
                linha_editorial: dados[0].linha_editorial,
                divulgacao: dados[0].divulgacao,
                observacao: dados[0].observacao
            };

            const planejamentosMap = new Map();
            for (const row of dados) {
                if (!row.id_planejamento) continue;

                if (!planejamentosMap.has(row.id_planejamento)) {
                    planejamentosMap.set(row.id_planejamento, {
                        id: row.id_planejamento,
                        producao: row.producao,
                        escala: row.escala,
                        logistica: row.logistica,
                        outros: row.outros,
                        funcionarios: [],
                        programas: [],
                        observacao_geral: ""
                    });
                }

                const planejamento = planejamentosMap.get(row.id_planejamento);

                // Adicionar funcionário, se ainda não adicionado
                if (
                    row.id_funcionario &&
                    !planejamento.funcionarios.some(f => f.id === row.id_funcionario)
                ) {
                    planejamento.funcionarios.push({
                        id: row.id_funcionario,
                        nome: row.nome_funcionario,
                        setor: row.nome_setor_func
                    });
                }

                // Adicionar programa, se ainda não adicionado
                if (ehRadio && row.id_programa && !planejamento.programas.some(p => p.id === row.id_programa && p.observacao === row.obs_programa)) {
                    planejamento.programas.push({
                        id: row.id_programa,
                        nome: row.nome_programa,
                        observacao: row.obs_programa,
                        setor: row.nome_setor_prog
                    });
                }
                else if (!ehRadio && row.obs_programa) {
                    planejamento.observacao_geral = row.obs_programa;
                }
            }
            //console.log("Dados dos planejamentos:", JSON.stringify(Array.from(planejamentosMap.values()), null, 2));
            res.render('links/editar/editar_planejamento', {
                evento,
                planejamentos: Array.from(planejamentosMap.values()),
                todosProgramas,
                todosFuncionarios,
                idEvento: id,
                ehRadio
            });

        } catch (err) {
            console.error('Erro ao buscar dados para edição:', err);
            req.flash('error', 'Erro ao carregar dados para edição');
            res.redirect('back');
        }
    }

    async editarPlanejamentoPost(req, res) {
        try {
            const { id_setor, planejamentoId, producao, escala, logistica, outros } = req.body;
            const userId = req.session.userId;
            // Buscar setor do usuário
            const user = await pool.query(`SELECT setor FROM users WHERE id = ?`, [userId]);
            const [setor] = await pool.query(`SELECT nome FROM tb_setor WHERE id = ?`, [user[0].setor]);
            const ehRadio = setor.nome.toLowerCase() === "rádio";

            // Atualiza planejamento principal
            await pool.query(
                `UPDATE tb_planejamento SET producao = ?, escala = ?, logistica = ?, outros = ? WHERE id = ?`,
                [producao, escala, logistica, outros, planejamentoId]
            );

            // === FUNCIONÁRIOS ===
            await pool.query(`DELETE FROM tb_func_setor WHERE id_planejamento = ?`, [planejamentoId]);

            // Tenta achar funcionários com ou sem índice [id]
            let funcionarios =
                req.body[`funcionarios[${planejamentoId}][]`] ||
                req.body[`funcionarios[${planejamentoId}]`] ||
                req.body.funcionarios ||
                [];

            // Se vier array dentro de array (ex: [["11","9"]]), achata:
            if (Array.isArray(funcionarios[0])) funcionarios = funcionarios[0];
            if (!Array.isArray(funcionarios)) funcionarios = [funcionarios];

            for (const id_funcionario of funcionarios) {
                if (!id_funcionario) continue;
                await pool.query(
                    `INSERT INTO tb_func_setor (id_planejamento, id_funcionario, id_setor) VALUES (?, ?, ?)`,
                    [planejamentoId, id_funcionario, id_setor]
                );
            }

            // === PROGRAMAS / CONTEÚDO ===
            await pool.query(`DELETE FROM tb_prog_conteudo WHERE id_planejamento = ?`, [planejamentoId]);

            if (ehRadio) {
                // Caso o front envie como: programas: [[ { id, observacao }, { id, observacao } ]]
                let programas = req.body.programas || [];

                // Se vier duplo array, achata
                if (Array.isArray(programas) && Array.isArray(programas[0])) programas = programas[0];

                for (const prog of programas) {
                    if (!prog || !prog.id) continue;

                    const id_programa = prog.id;
                    const observacao = prog.observacao || '';

                    await pool.query(
                        `INSERT INTO tb_prog_conteudo (id_planejamento, id_programa, observacao, id_setor) 
             VALUES (?, ?, ?, ?)`,
                        [planejamentoId, id_programa, observacao, id_setor]
                    );
                }
            } else {
                // Outros setores: texto simples
                let observacaoGeral =
                    req.body[`programas_texto[${planejamentoId}]`] ||
                    req.body.programas_texto ||
                    '';

                if (Array.isArray(observacaoGeral)) observacaoGeral = observacaoGeral[0];

                if (observacaoGeral) {
                    await pool.query(
                        `INSERT INTO tb_prog_conteudo (id_planejamento, observacao, id_setor) 
             VALUES (?, ?, ?)`,

                        [planejamentoId, observacaoGeral, id_setor]
                    );
                }
            }

            req.flash('success', 'Planejamento atualizado com sucesso!');
            res.redirect(`/links/consultas/consulta_planejamento`);
        } catch (err) {
            console.error("❌ Erro ao atualizar planejamento:", err);
            req.flash('error', 'Erro ao atualizar planejamento');
            res.redirect('back');
        }
    }

    async editarPlanejamentoADMPost(req, res) {
        try {
            const { planejamentos } = req.body;
            const userId = req.session.userId;

            if (!planejamentos || !Array.isArray(planejamentos)) {
                req.flash('error', 'Dados de planejamento inválidos');
                return res.redirect('back');
            }



            for (const planejamento of planejamentos) {
                const {
                    id,
                    id_setor,
                    producao,
                    escala,
                    logistica,
                    outros,
                    funcionarios,
                    programas,
                    programas_texto
                } = planejamento;

                if (!id) continue;

                // Buscar o setor do planejamento para verificar se é Rádio
                const [setorInfo] = await pool.query(`SELECT nome FROM tb_setor WHERE id = ?`, [id_setor]);
                const ehRadio = setorInfo?.nome?.toLowerCase().includes("rádio");

                // Atualiza tb_planejamento
                await pool.query(
                    `UPDATE tb_planejamento SET producao = ?, escala = ?, logistica = ?, outros = ? WHERE id = ?`,
                    [producao || '', escala || '', logistica || '', outros || '', id]
                );

                // Atualiza tb_func_setor
                await pool.query(`DELETE FROM tb_func_setor WHERE id_planejamento = ?`, [id]);

                if (funcionarios) {
                    const listaFuncionarios = Array.isArray(funcionarios) ? funcionarios : (funcionarios ? [funcionarios] : []);
                    for (const id_funcionario of listaFuncionarios) {
                        if (id_funcionario && id_funcionario !== '') {
                            await pool.query(
                                `INSERT INTO tb_func_setor (id_planejamento, id_funcionario, id_setor) VALUES (?, ?, ?)`,
                                [id, id_funcionario, id_setor]
                            );
                        }
                    }
                }

                // Atualiza tb_prog_conteudo
                await pool.query(`DELETE FROM tb_prog_conteudo WHERE id_planejamento = ?`, [id]);

                if (ehRadio) {
                    // Lógica para Rádio (com programas)
                    if (programas && typeof programas === 'object') {


                        for (const id_programa in programas) {
                            const programa = programas[id_programa];

                            // VALIDAÇÃO CRÍTICA: Verificar se o ID do programa é válido
                            if (!programa || !programa.id || programa.id === '0' || programa.id === 0) {

                                continue;
                            }

                            // Verificar se o programa existe na tabela tb_programa
                            const [programaExiste] = await pool.query(
                                `SELECT id FROM tb_programa WHERE id = ?`,
                                [programa.id]
                            );

                            if (programaExiste.length === 0) {

                                continue;
                            }



                            // Inserir mesmo se a observação estiver vazia
                            await pool.query(
                                `INSERT INTO tb_prog_conteudo (id_planejamento, id_programa, observacao, id_setor) 
                             VALUES (?, ?, ?, ?)`,
                                [id, programa.id, programa.observacao || '', id_setor]
                            );
                        }
                    }
                } else {
                    // Lógica para outros setores (apenas observação geral)
                    const observacaoGeral = programas_texto || '';

                    if (observacaoGeral.trim()) {
                        await pool.query(
                            `INSERT INTO tb_prog_conteudo (id_planejamento, observacao, id_setor) 
                         VALUES (?, ?, ?)`,
                            [id, observacaoGeral, id_setor]
                        );
                    }
                }
            }

            req.flash('success', 'Planejamentos atualizados com sucesso!');
            res.redirect(`/links/consultas/consulta_planejamento`);
        } catch (err) {
            console.error("❌ Erro ao atualizar planejamentos:", err);
            req.flash('error', 'Erro ao atualizar planejamentos');
            res.redirect('back');
        }
    }

    async excluirPlanejamentos(req, res) {
        const { id } = req.params; // id do evento
        const userSetor = req.user.setor;

        try {
            // Buscar todos os planejamentos relacionados ao evento e setor
            const planejamentos = await pool.query(
                `SELECT id FROM tb_planejamento WHERE id_evento = ? AND id_setor = ?`,
                [id, userSetor]
            );

            if (planejamentos.length === 0) {
                //console.log(`Nenhum planejamento encontrado para evento ${id} e setor ${userSetor}.`);
                return res.status(404).send("Nenhum planejamento encontrado para este evento e setor.");
            }

            const idsPlanejamento = planejamentos.map(p => p.id);
            const placeholders = idsPlanejamento.map(() => '?').join(',');

            // Deletar registros de tb_func_setor
            await pool.query(
                `DELETE FROM tb_func_setor WHERE id_planejamento IN (${placeholders})`,
                idsPlanejamento
            );

            // Deletar registros de tb_prog_conteudo
            await pool.query(
                `DELETE FROM tb_prog_conteudo WHERE id_planejamento IN (${placeholders})`,
                idsPlanejamento
            );

            // Deletar os planejamentos
            await pool.query(
                `DELETE FROM tb_planejamento WHERE id IN (${placeholders})`,
                idsPlanejamento
            );

            //console.log(`Planejamentos (IDs: ${idsPlanejamento}) e dados relacionados foram excluídos.`);
            return res.send("Planejamentos e dados relacionados excluídos com sucesso.");

        } catch (err) {
            console.error("Erro ao excluir planejamentos:", err);
            return res.status(500).send("Erro interno ao excluir planejamentos.");
        }
    }

    async excluirPlanejamentosADM(req, res) {
        const { id } = req.params; // id do evento

        try {
            console.log('=== EXCLUSÃO REAL INICIADA ===');

            // Buscar todos os planejamentos relacionados ao evento
            const planejamentos = await pool.query(
                `SELECT id, id_setor FROM tb_planejamento WHERE id_evento = ?`,
                [id]
            );

            if (planejamentos.length === 0) {
                console.log(`❌ Nenhum planejamento encontrado para evento ${id}.`);
                return res.status(404).send("Nenhum planejamento encontrado para este evento.");
            }

            const idsPlanejamento = planejamentos.map(p => p.id);
            const placeholders = idsPlanejamento.map(() => '?').join(',');



            console.log(`📊 Iniciando exclusão de:`);
            console.log(`   - ${planejamentos.length} planejamentos`);
            // Deletar registros de tb_func_setor
            await pool.query(
                `DELETE FROM tb_func_setor WHERE id_planejamento IN (${placeholders})`,
                idsPlanejamento
            );
            console.log('✅ Funcionários desvinculados');

            // Deletar registros de tb_prog_conteudo
            await pool.query(
                `DELETE FROM tb_prog_conteudo WHERE id_planejamento IN (${placeholders})`,
                idsPlanejamento
            );
            console.log('✅ Programas/conteúdos excluídos');

            // Deletar os planejamentos
            await pool.query(
                `DELETE FROM tb_planejamento WHERE id IN (${placeholders})`,
                idsPlanejamento
            );
            console.log('✅ Planejamentos excluídos');

            console.log('=== EXCLUSÃO CONCLUÍDA COM SUCESSO ===');

            return res.json({
                success: true,
                message: 'Todos os planejamentos e dados relacionados foram excluídos com sucesso',
                excluidos: {
                    planejamentos: planejamentos.length,
                }
            });

        } catch (err) {
            console.error("❌ Erro ao excluir planejamentos:", err);
            return res.status(500).json({
                success: false,
                error: 'Erro interno ao excluir planejamentos',
                detalhes: err.message
            });
        }
    }

}

module.exports = new cadastroPlanejamento();