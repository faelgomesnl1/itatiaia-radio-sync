const pool = require('../../../database');

class equipamentosDefeito {

    async listaDefeitos(req, res) {
        const id = req.body;

        console.log(id);

        const equipamentos = await pool.query(`
                SELECT 
                    eq.peripherals_id, 
                    eq.observacao, 
                    eq.tipo_defeito,
                    eq.tipo_defeito AS is_defeito,
                    eq.tipo_ndev,
                    eq.tipo_ndev AS is_ndev,
                    p.name AS nome_equipamento, 
                    p.serial, 
                    p.otherserial AS patrimonio
                FROM 
                    glpi_eqpretirada AS eq
                JOIN 
                    glpi_peripherals AS p 
                ON 
                    eq.peripherals_id = p.id
                WHERE 
                    (
                        (eq.observacao IS NOT NULL AND eq.observacao <> '') 
                        OR eq.tipo_ndev = 1
                    )
                    AND eq.dt_devolucao = (
                        SELECT MAX(sub.dt_devolucao)
                        FROM glpi_eqpretirada AS sub
                        WHERE sub.peripherals_id = eq.peripherals_id
                    )
                    AND !(eq.tipo_ndev = 0 AND eq.tipo_defeito = 0);
            `);
            console.log("Equipamentos recuperados:", equipamentos);
        res.render('links/consultas/lista_eqpDefeito', { equipamentos });
    };

    async defeitosEquipamento(req, res) {
        const peripherals_id = req.params.peripherals_id;

        console.log('peripherals_id recebido:', peripherals_id); // Exibe o ID recebido

        const dadosCompletos = await pool.query(`
            SELECT 
                eq.peripherals_id,
                eq.id_evento,
                eq.image,
                loc.local AS local_evento,
                usr.name AS user_name,
                DATE_FORMAT(eq.dt_devolucao, '%d/%m/%Y') AS dt_devolucao,
                eq.observacao
            FROM 
                glpi_eqpretirada eq
            INNER JOIN 
                glpi_loc_evt loc ON eq.id_evento = loc.id
            INNER JOIN 
                glpi_users usr ON eq.user_id = usr.id
            WHERE 
                eq.peripherals_id = ?
                AND (eq.tipo_ndev = 1 OR eq.tipo_defeito = 1);
        `, [peripherals_id]);

        console.log("Dados completos recebidos:", dadosCompletos); // Exibe todos os dados recebidos
    console.log("Imagem da URL recuperada:", dadosCompletos[0]?.image); // Exibe a URL da imagem (se disponível)
        if (dadosCompletos.length === 0) {
            return res.status(404).json({ error: 'Equipamento não encontrado.' });
        }

        // Consulta os equipamentos retirados para esse evento
        const equipamentos = await pool.query(`
                SELECT name, serial, otherserial FROM bdglpi.glpi_peripherals
                WHERE bdglpi.glpi_peripherals.id = ?;
            `, [peripherals_id]);

        console.log('Equipamentos encontrados:', equipamentos); // Exibe o resultado da consulta de equipamentos

        // Verifica se há equipamentos retirados
        if (equipamentos.length === 0) {
            return res.status(404).json({ error: 'Nenhum equipamento encontrado para esse evento.' });
        }

        // Renderiza a página de devolução, passando os dados de equipamentos retirados
        res.render('links/consultas/conserto', { dados: dadosCompletos, equipamentos,peripherals_id });
    }

    async reparosFeitos(req, res) {
        const peripherals_id = req.body.peripheralsId || req.params.peripherals_id;

        console.log('peripherals_id recebidooo:', peripherals_id);
    
        if (!peripherals_id) {
            return res.status(400).send('peripherals_id não encontrado.');
        }
    
        try {
            // Primeiro UPDATE na tabela glpi_eqpretirada
            await pool.query(`
                UPDATE 
                    glpi_eqpretirada
                SET 
                    tipo_ndev = 0,
                    tipo_defeito = 0,
                    tipo_dev = 1
                WHERE 
                    peripherals_id = ?;
            `, [peripherals_id]);
    
            // Segundo UPDATE na tabela glpi_peripherals
            await pool.query(`
                UPDATE 
                    glpi_peripherals
                SET 
                    is_recursive = 0
                WHERE 
                    id = ?;
            `, [peripherals_id]);
    
            res.status(200).send('Devolução realizada com sucesso.');
        } catch (err) {
            console.error('Erro ao realizar devolução:', err);
            res.status(500).send('Erro ao processar a devolução.');
        }
    };
}
module.exports = new equipamentosDefeito();