const pool = require('../../../database');

class showEquipamentos {

    // Listar Equipamentos Retirados
    async listarEquipamentosFinalizados(req, res) {
        const evtId = req.params.evtId;  // Recebe o ID do evento da URL

        // Consulta o evento pelo ID
        const [gestor] = await pool.query(`
            SELECT id, local, endereco, dt_inicio, dt_fim, status 
            FROM glpi_loc_evt 
            WHERE id = ?;
        `, [evtId]);

        if (!gestor) {
            return res.status(404).json({ error: 'Evento não encontrado.' });
        }

        const operador = await pool.query(`
                    SELECT distinct id, local, endereco, DATE_FORMAT(dt_inicio, '%d/%m/%Y') AS dt_inicio, 
                DATE_FORMAT(dt_fim, '%d/%m/%Y') AS dt_fim, status 
                    FROM glpi_loc_evt 
                    WHERE id = ?;
                `, [evtId]);

        const usuarios = await pool.query(`
                    SELECT distinct CONCAT(u.firstname, ' ', u.realname) AS full_name 
                    FROM glpi_eqpretirada r
                    JOIN glpi_peripherals p ON p.id = r.peripherals_id 
                    JOIN glpi_users u ON u.id = r.user_id 
                    WHERE r.id_evento = ?;
                `, [evtId]);

        // Consulta os equipamentos retirados para esse evento
        const equipamentos = await pool.query(`
            SELECT glpi_peripherals.id, glpi_peripherals.name, glpi_peripherals.otherserial, glpi_peripherals.serial, glpi_eqpretirada.observacao,
            CASE 
                WHEN glpi_eqpretirada.tipo_ndev IS NOT NULL AND glpi_eqpretirada.tipo_ndev <> '' 
                THEN 'Não Devolvido' 
                ELSE 'Devolvido' 
            END AS status_devolucao
            FROM glpi_eqpretirada 
            JOIN glpi_peripherals ON glpi_peripherals.id = glpi_eqpretirada.peripherals_id 
            WHERE glpi_eqpretirada.id_evento = ?;
        `, [evtId]);

        // Verifica se há equipamentos retirados
        if (equipamentos.length === 0) {
            return res.status(404).json({ error: 'Nenhum equipamento encontrado para esse evento.' });
        }

        // Renderiza a página de devolução, passando os dados de equipamentos retirados
        res.render('links/consultas/lista_finalizados', { gestor, equipamentos, usuarios, operador });
    }
}

module.exports = new showEquipamentos();

//Somente mostra dados por isso não tem rota