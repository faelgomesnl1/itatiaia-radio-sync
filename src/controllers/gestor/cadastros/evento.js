const pool = require('../../../database');

class cadastroEvento {

    //CADASTRAR EVENTOS
    async cadastroEventoGet(req, res) {
        const origem = await pool.query('SELECT id, nome FROM tb_origem ORDER BY nome;')
        res.render('links/cadastros/cadastro_evento', { origem });
    };

    async cadastroEventoPost(req, res) {
        const { nome, dt_inicio, h_inicio, h_fim, local, origem, diretriz, Plataforma, Dial, PreEvento, Editorial, Divulgacao, Observacao } = req.body;
        try {
            const result = await pool.query(`
            INSERT INTO tb_evento (titulo, data, h_inicio, h_fim, local, diretriz, plataforma, dial, antes_evento, linha_editorial, divulgacao, observacao, copiados_vinculado) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [nome, dt_inicio, h_inicio, h_fim, local, diretriz, Plataforma, Dial, PreEvento, Editorial, Divulgacao, Observacao, 0]);

            const idEvento = result.insertId;

            const origens = Array.isArray(origem) ? origem : [origem];
            for (let idOrigem of origens) {
                await pool.query(
                    'INSERT INTO tb_origem_eventos (id_evento, id_origem) VALUES (?, ?)',
                    [idEvento, idOrigem]
                );
            }

            req.flash('success', 'Evento cadastrado com sucesso!');
            res.redirect('/profile');

        } catch (err) {
            console.error('Erro ao cadastrar evento:', err);
            req.flash('error', 'Erro ao cadastrar evento.');
            res.redirect('/links/cadastros/cadastro_evento');
        }
    }

    async consultarEventosIncGet(req, res) {
        const eventos = await pool.query(`SELECT ev.id, ev.titulo, ev.data FROM tb_evento ev WHERE ev.data >= CURDATE() ORDER BY ev.data;`);

        // Formata a data para 'dd/mm/aaaa'
        eventos.forEach(evento => {
            const data = new Date(evento.data);
            evento.dataFormatada = data.toLocaleDateString('pt-BR');
        });
        res.render('links/consultas/consulta_eventosIncompletos', { eventos });
    }

    async cadastrarEmailGet(req, res) {
        const { id } = req.params;

        try {
            const funcionarios = await pool.query(`SELECT f.id, f.nome, f.email FROM tb_funcionario f ORDER BY f.email`);
            const selecionados = await pool.query(`SELECT f.id, f.nome, f.email FROM tb_funcionario f 
                JOIN tb_copiados c ON f.id = c.id_funcionario WHERE c.id_evento = ?`, [id])

            res.render('links/cadastros/cadastro_copiados', { funcionarios: JSON.stringify(funcionarios), idEvento: id, selecionados: JSON.stringify(selecionados) });
        } catch (err) {
            console.error('Erro ao buscar emails:', err);
            res.status(500).send('Erro interno no servidor');
        }
    }

    async cadastrarEmailPost(req, res) {
        const { idEvento, funcionariosSelecionados } = req.body;
        console.log(req.body)
        if (!idEvento || !Array.isArray(funcionariosSelecionados)) {
            return res.status(400).json({ erro: 'Dados inválidos' });
        }

        try {
            // Busca os IDs atuais já armazenados para esse evento
            const rows = await pool.query(`
            SELECT id_funcionario FROM tb_copiados WHERE id_evento = ?
        `, [idEvento]);

            const idsNoBanco = rows.map(row => row.id_funcionario);

            // Transforma em Set para facilitar comparação
            const setBanco = new Set(idsNoBanco);
            const setFront = new Set(funcionariosSelecionados);

            // Determina os que devem ser inseridos e os que devem ser removidos
            const inserir = funcionariosSelecionados.filter(id => !setBanco.has(id));
            const remover = idsNoBanco.filter(id => !setFront.has(id));

            // Inserções
            if (inserir.length > 0) {
                const values = inserir.map(id => `(${id}, ${idEvento})`).join(',');
                await pool.query(`
                INSERT INTO tb_copiados (id_funcionario, id_evento)
                VALUES ${values}
            `);
            }

            // Remoções
            if (remover.length > 0) {
                const placeholders = remover.map(() => '?').join(',');
                await pool.query(`
                DELETE FROM tb_copiados
                WHERE id_evento = ? AND id_funcionario IN (${placeholders})
            `, [idEvento, ...remover]);
            }

            // Atualiza flag na tabela tb_evento
            await pool.query(`
            UPDATE tb_evento SET copiados_vinculado = 1 WHERE id = ?
        `, [idEvento]);

            res.status(200).json({ sucesso: true });
        } catch (err) {
            console.error('Erro ao salvar copiados:', err);
            res.status(500).json({ erro: 'Erro ao salvar dados' });
        }
    }

    async editarEventosIncGet(req, res) {
        const userId = req.session.userId;
        try {
            const [user] = await pool.query(`SELECT ADMIN FROM users WHERE id = ?`, [userId]);
            const eventos = await pool.query(`
            SELECT ev.id, ev.titulo, ev.data
            FROM tb_evento ev
            WHERE ev.data >= CURDATE()
            ORDER BY ev.data;
        `);

            eventos.forEach(evento => {
                const data = new Date(evento.data);
                evento.dataFormatada = data.toLocaleDateString('pt-BR');
            });
            res.render('links/editar/editar_eventosIncompletos', { eventos, user });
        } catch (err) {
            console.error('Erro ao buscar eventos:', err);
            res.status(500).render('erro', { mensagem: 'Erro ao carregar eventos incompletos.' });
        }
    }

    async editarEventoGet(req, res) {
        const { id } = req.params;

        try {
            const [evento] = await pool.query(`
            SELECT id, titulo, data, h_inicio, h_fim, local, diretriz, dial, plataforma, antes_evento, linha_editorial, divulgacao, observacao
            FROM tb_evento 
            WHERE id = ?
        `, [id]);
            const origens = await pool.query('SELECT id, nome FROM tb_origem');
            const origensSelecionadas = await pool.query('SELECT id_origem FROM tb_origem_eventos WHERE id_evento = ?', [id]);

            // Converter para array de IDs
            const origensSelecionadasIds = origensSelecionadas.map(o => o.id_origem);

            // Marcar as origens como selecionadas diretamente no objeto
            const origensComSelecao = origens.map(origem => ({
                ...origem,
                selecionada: origensSelecionadasIds.includes(origem.id)
            }));

            res.render('links/editar/editar_eventos', {
                evento: {
                    ...evento,
                    dataFormatada: new Date(evento.data).toISOString().split('T')[0],
                    h_inicio: evento.h_inicio?.toString().substring(0, 5) || '',
                    h_fim: evento.h_fim?.toString().substring(0, 5) || ''
                },
                origens: origensComSelecao,
                idEvento: id
            });
        } catch (err) {
            console.error('Erro ao buscar evento:', err);
            res.status(500).send('Erro interno no servidor');
        }
    }

    async editarEventoPost(req, res) {
    const { id } = req.params;
    const { 
        nome, dt_inicio, h_inicio, h_fim, local, diretriz, 
        Dial, Plataforma, PreEvento, Editorial, Divulgacao, Observacao,
        origens // Array com IDs das origens selecionadas
    } = req.body;

    try {

        // 1. Atualiza dados básicos do evento
        await pool.query(`
            UPDATE tb_evento SET 
                titulo = ?, data = ?, h_inicio = ?, h_fim = ?, local = ?, 
                diretriz = ?, dial = ?, plataforma = ?, antes_evento = ?, 
                linha_editorial = ?, divulgacao = ?, observacao = ?
            WHERE id = ?
        `, [
            nome, dt_inicio, h_inicio, h_fim, local, 
            diretriz, Dial, Plataforma, PreEvento, 
            Editorial, Divulgacao, Observacao, id
        ]);

        // 2. Remove associações antigas de origens
        await pool.query('DELETE FROM tb_origem_eventos WHERE id_evento = ?', [id]);
        // 3. Adiciona novas associações (se houver origens selecionadas)
        if (origens) {
            const origensArray = Array.isArray(origens) ? origens : [origens];
            for (const id_origem of origensArray) {
                await pool.query(`
                    INSERT INTO tb_origem_eventos (id_evento, id_origem)
                    VALUES (?, ?)
                `, [id, id_origem]);
            }
        }
        
        req.flash('success', 'Evento atualizado com sucesso!');
        res.redirect('/profile');
    } catch (err) {
        console.error('Erro ao atualizar evento:', err);
        req.flash('error', 'Erro ao atualizar evento');
        res.redirect('back');
    }
}

    async iniciarPlanejamento(req, res) {
        const { id } = req.params;

        try {
            const result = await pool.query(`
            UPDATE tb_evento SET copiados_vinculado = 1 WHERE id = ?
        `, [id]);

            if (result.affectedRows === 0) {
                return res.status(404).send('Evento não encontrado.');
            }

            res.redirect('/links/editar/editar_eventosIncompletos'); 
        } catch (err) {
            console.error('Erro ao iniciar planejamento:', err);
            res.status(500).send('Erro ao iniciar planejamento.');
        }
    }

    async excluirEvento(req, res) {
        const { id } = req.params;
        console
        try {
            // Remove os registros de tb_origem_eventos
            await pool.query(`
            DELETE FROM tb_origem_eventos WHERE id_evento = ?
        `, [id]);

            // Remove os registros de tb_copiados
            await pool.query(`
            DELETE FROM tb_copiados WHERE id_evento = ?
        `, [id]);

            // Por fim, remove o evento
            const result = await pool.query(`
            DELETE FROM tb_evento WHERE id = ?
        `, [id]);

            if (result.affectedRows === 0) {
                return res.status(404).send('Evento não encontrado ou já excluído.');
            }

            res.redirect('/links/editar/editar_eventosIncompletos');
        } catch (err) {
            console.error('Erro ao excluir evento:', err);
            res.status(500).send('Erro ao excluir evento.');
        }
    }


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


module.exports = new cadastroEvento();