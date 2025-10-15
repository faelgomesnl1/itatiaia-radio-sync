const pool = require('../../../database');
const dayjs = require('dayjs');
require('dayjs/locale/pt-br');
dayjs.locale('pt-br');

class consolidadoDiretoriaContrato {

    async listaContratosGet(req, res) {
        const evtId = req.params.evtId;  // Recebe o ID do evento da URL

        const end = dayjs().subtract(1, 'month').endOf('month');
        let cases = [];

        // Meses fixos de maio e dezembro entre 2021 e 2024
        const historicoFixos = [
            '2021-05-01', '2021-12-01',
            '2022-05-01', '2022-12-01',
            '2023-05-01', '2023-12-01',
            '2024-05-01', '2024-12-01'
        ];

        for (const dateStr of historicoFixos) {
            const current = dayjs(dateStr);
            const column = current.format('MMM-YY').toLowerCase().replace('.', '');
            cases.push(`SUM(CASE WHEN mes = '${dateStr}' THEN 1 ELSE 0 END) AS \`${column}\``);
        }

        // Todos os meses a partir de jan/2025 até 8 meses à frente
        let current = dayjs('2025-01-01');
        while (current.isBefore(end) || current.isSame(end, 'month')) {
            const column = current.format('MMM-YY').toLowerCase().replace('.', '');
            const date = current.format('YYYY-MM-01');
            cases.push(`SUM(CASE WHEN mes = '${date}' THEN 1 ELSE 0 END) AS \`${column}\``);
            current = current.add(1, 'month');
        }

        const dynamicCases = cases.join(',\n                ');

        const query = `
        WITH RECURSIVE meses AS (
            SELECT DATE('2021-05-01') AS mes
            UNION ALL
            SELECT DATE_ADD(mes, INTERVAL 1 MONTH)
            FROM meses
            WHERE mes <= '${end.format('YYYY-MM-DD')}'
        ),
        dados AS (
            SELECT 
                t.id,
                t.nome AS contrato, 
                m.mes
            FROM meses m
            JOIN colaborador_historico ch 
                ON ch.data_inicio <= LAST_DAY(m.mes)
            AND (ch.data_fim IS NULL OR ch.data_fim >= m.mes)
            INNER JOIN tipo_contrato t ON t.id = ch.tipo_contrato_id
            INNER JOIN localizacao l ON l.id = ch.localizacao_id
            INNER JOIN area a ON a.id = ch.area_id
            INNER JOIN secao s ON a.secao_id=s.id
            INNER JOIN coordenacao co ON co.id = s.coordenacao_id
            INNER JOIN gerencia g ON g.id = co.gerencia_id
            INNER JOIN diretoria d ON d.id = g.diretoria_id
            INNER JOIN cargo cg ON cg.id = ch.cargo_id
            WHERE d.id = ?  -- Filtro com o parâmetro evtId
        )
        SELECT 
            id,
            contrato,
            ${dynamicCases}
        FROM dados
        GROUP BY contrato
        ORDER BY contrato;`;

        const diretorias = await pool.query(query, [evtId]);

        // Extrai os nomes das colunas formatadas
        const colunas = cases.map(c => {
            const match = c.match(/AS `(.+?)`/);
            return match ? match[1] : null;
        }).filter(Boolean);

        /* const [contrato] = await pool.query(query, [evtId]);

        // Extrai os nomes das colunas formatadas
        const colunas = cases.map(c => {
            const match = c.match(/AS `(.+?)`/);
            return match ? match[1] : null;
        }).filter(Boolean); */

        // Renderiza a página de devolução, passando os dados de contratos
        res.render('links/consultas/tipo_contrato', { diretorias, colunas });
    }
}


module.exports = new consolidadoDiretoriaContrato();