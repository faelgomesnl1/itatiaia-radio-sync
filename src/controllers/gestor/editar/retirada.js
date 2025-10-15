const pool = require('../../../database');

class addEquipamentos {

    //List de Eventos e equipamentos
    async listarEventos(req, res) {
        const params = req.params.texto;

        const [operador] = await pool.query(`SELECT id, local, endereco, DATE_FORMAT(dt_inicio, '%d/%m/%Y') AS dt_inicio, DATE_FORMAT(dt_fim, '%d/%m/%Y') AS dt_fim, status FROM glpi_loc_evt WHERE id = ?;`, [params]);

        const equipamentos = await pool.query(`
            SELECT p.id,p.name, 
            IFNULL(p.serial, '') AS serial, 
            p.otherserial, p.is_recursive,
            (SELECT observacao FROM bdglpi.glpi_eqpretirada WHERE peripherals_id = p.id ORDER BY dt_devolucao DESC LIMIT 1) AS observacao,
            (SELECT CAST(tipo_dev AS UNSIGNED) FROM bdglpi.glpi_eqpretirada WHERE peripherals_id = p.id ORDER BY dt_devolucao DESC LIMIT 1) AS tipo_dev
            FROM 
            bdglpi.glpi_peripherals p;`);
        res.render('links/consultas/lista_retirada', { operador, equipamentos: JSON.stringify(equipamentos) });
    };

    // Atualizar equipamentos selecionados
    async atualizarEquipamentos(req, res) {
        const { ids, evt } = req.body; // Recebe os IDs dos equipamentos e o ID do evento

        // Validações de entrada
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'IDs inválidos ou não fornecidos.' });
        }
        if (!evt) {
            return res.status(400).json({ error: 'ID do evento (Evt) não fornecido.' });
        }
        if (!req.user || !req.user.id) {
            return res.status(403).json({ error: 'Usuário não autenticado.' });
        }

        try {

            // Atualiza os equipamentos para `is_recursive = 1`
            await pool.query(
                `UPDATE bdglpi.glpi_peripherals SET is_recursive = 1 WHERE id IN (?)`,
                [ids]
            );

            // Insere na tabela `glpi_eqpretirada` com `peripherals_id`, `date_creation`, e `id_evento` (evt)
            const currentTime = new Date(); // Hora atual do computador
            const equipamentosToInsert = ids.map(id => [id, evt, currentTime, req.user.id]); // Inclui o Evt em cada linha

            await pool.query(
                `INSERT INTO bdglpi.glpi_eqpretirada (peripherals_id, id_evento, date_creation, user_id, tipo_retirada) VALUES ?`,
                [equipamentosToInsert.map(item => [...item, 1])]
            );
            await pool.query(
                `UPDATE glpi_loc_evt SET status = 'n' WHERE id = ?`,
                [evt]
            );

            // Retorna sucesso
            res.json({ success: true });
        } catch (error) {
            console.error('Erro ao atualizar equipamentos:', error);
            res.status(500).json({ error: 'Erro ao atualizar equipamentos.' });
        }
    }

    async promocoesPost(req, res) {
        const { id, etapa } = req.body;

        const update = await pool.query('SELECT id_result FROM tb_resultado WHERE id = ?', [id]);
        console.log(update);

        try {
            if (update[0].id_result != undefined)
                await pool.query('UPDATE tb_resultado SET etapa = ? WHERE id_result = ?', [etapa, update[0].id_result])
        } catch (e) {
            console.log(e);
            const newEntry = {
                id,
                etapa
            };

            await pool.query('INSERT INTO tb_resultado SET ?', [newEntry]);
        }

        res.redirect('/profile');
    }
};

module.exports = new addEquipamentos();