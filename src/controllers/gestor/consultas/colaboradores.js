const pool = require('../../../database');

class listaColaboradores {
    //Exibe log Belo horizonte
    async dadosColaboradoresGet(req, res) {
        const id = req.body;

        const colaboradores = await pool.query(`
            SELECT
                c.id,
                c.nome AS name,
                l.nome AS localizacao,
                s.nome AS secao,
                a.nome AS area,
                t.nome AS contrato,
                cg.nome AS cargo,
                DATE_FORMAT(ch.data_inicio, '%d/%m/%Y') AS data_inicio,
                DATE_FORMAT(ch.data_fim, '%d/%m/%Y') AS data_fim
            FROM colaborador_historico ch
            INNER JOIN colaborador c ON c.id = ch.colaborador_id
            INNER JOIN localizacao l ON l.id = ch.localizacao_id
            INNER JOIN area a ON a.id = ch.area_id
            INNER JOIN secao s ON s.id = a.secao_id
            INNER JOIN tipo_contrato t ON t.id = ch.tipo_contrato_id
            LEFT JOIN cargo cg ON cg.id = ch.cargo_id
            WHERE (c.nome, ch.data_inicio) IN (
                SELECT c2.nome, MAX(ch2.data_inicio)
                FROM colaborador_historico ch2
                INNER JOIN colaborador c2 ON c2.id = ch2.colaborador_id
                GROUP BY c2.nome)
            ORDER BY c.nome;`); 

        res.render('links/consultas/colaboradores' , { colaboradores });
    };

};

module.exports = new listaColaboradores();