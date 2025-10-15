const pool = require('../../../database');

class editarColaboradores {

    async listaColaboradoresGet(req, res) {
        const evtId = req.params.evtId;  // Recebe o ID do evento da URL

        // Consulta o evento pelo ID
        const colaborador = await pool.query(`
            SELECT 
                c.id, 
                c.nome AS name, 
                l.nome AS localizacao,
                a.nome AS area,
                t.nome AS contrato,
                cg.nome AS cargo,
                DATE_FORMAT(ch.data_inicio, '%d/%m/%Y') AS data_inicio,
                DATE_FORMAT(ch.data_fim, '%d/%m/%Y') AS data_fim
            FROM colaborador c
            INNER JOIN colaborador_historico ch ON c.id = ch.colaborador_id
            INNER JOIN localizacao l ON l.id = ch.localizacao_id
            INNER JOIN area a ON a.id = ch.area_id
            INNER JOIN tipo_contrato t ON t.id = ch.tipo_contrato_id
            INNER JOIN cargo cg ON cg.id = ch.cargo_id
            WHERE c.id = ?
            AND (
                ch.data_fim IS NULL OR
                ch.data_fim = (
                    SELECT MAX(data_fim)
                    FROM colaborador_historico
                    WHERE colaborador_id = c.id
                    AND data_fim IS NOT NULL
                )
            )
            ORDER BY ch.data_fim IS NULL DESC, ch.data_fim DESC
            LIMIT 1;`, [evtId]);

        if (!colaborador) {
            return res.status(404).json({ error: 'Evento não encontrado.' });
        }

        const contrato = await pool.query('SELECT id, nome FROM tipo_contrato ORDER BY nome;');

        const localizacao = await pool.query('SELECT id, nome FROM localizacao ORDER BY nome;');

        const area = await pool.query(`
            SELECT a.id as area_id, a.nome, a.secao_id, 
                s.id, s.nome,
                CONCAT(s.nome, ' / ', a.nome) as nome_final 
            FROM db_headcount_prod.area a
            INNER JOIN db_headcount_prod.secao s ON (a.secao_id=s.id);`);

        const cargo = await pool.query('SELECT id, nome FROM cargo ORDER BY nome;');

        // Renderiza a página de devolução, passando os dados de equipamentos retirados
        res.render('links/consultas/atualizar_colaboradores', { colaborador, contrato, localizacao, area, cargo });
    }

    async listaColaboradoresPost(req, res) {
        const { colaborador_id, localizacao_id, area_id, tipo_contrato_id, cargo_id, origem, data_inicio, data_fim } = req.body;
        const novaColaborador = { colaborador_id, localizacao_id, area_id, tipo_contrato_id, cargo_id, origem, data_inicio };

        if (!data_inicio) {
            await pool.query(`
                UPDATE colaborador_historico
                    SET data_fim = ?
                WHERE colaborador_id = ?
                AND id = ( SELECT MAX(id) FROM colaborador_historico WHERE colaborador_id = ?)`, [data_fim, colaborador_id, colaborador_id]);
        } else {
            await pool.query(`
                UPDATE colaborador_historico
                    SET data_fim = ?
                WHERE colaborador_id = ?
                AND id = ( SELECT MAX(id) FROM colaborador_historico WHERE colaborador_id = ?)`, [data_fim, colaborador_id, colaborador_id]);
            await pool.query('INSERT INTO colaborador_historico set ?', [novaColaborador]);
        }

        req.flash('success', 'Colaborador atualizado com sucesso!');
        res.redirect("/profile");

    };

}

module.exports = new editarColaboradores();