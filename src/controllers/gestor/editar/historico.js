const express = require('express');
const helpers = require('../../../lib/helpers');
const pool = require('../../../database');
const app = express();

class TaskHistorico {

    //Cadastrar Participantes
    async EditarColaboradorGet(req, res) {
        const equipamentos = await pool.query(`
        SELECT c.nome as name, 
        l.nome as localizacao,
        a.nome as area,
        t.nome as contrato,
        cg.nome as cargo,
        DATE_FORMAT(c.data_inicio, '%d/%m/%Y') AS data_inicio
        FROM colaborador c
        INNER JOIN localizacao l ON (l.id=c.localizacao_id)
        INNER JOIN area a ON (a.id=c.area_id)
        INNER JOIN tipo_contrato t ON (t.id=c.tipo_contrato_id)
        INNER JOIN cargo cg ON (cg.id=c.cargo_id);`);

        const cargo = await pool.query('SELECT id, nome FROM cargo ORDER BY nome;');

        const secao = await pool.query('SELECT id, nome FROM secao ORDER BY nome;');

        const area = await pool.query(`
                    SELECT s.id , s.nome ,
                    CONCAT(s.nome, ' / ', a.nome) as nome_final 
                    FROM secao s
                    INNER JOIN area a on (s.id=a.secao_id)
                    ORDER BY nome_final;`);

        res.render('links/editar/historico_colaborador', {
            cargo: JSON.stringify(cargo),
            area: JSON.stringify(area),
            secao: JSON.stringify(secao),
            equipamentos: JSON.stringify(equipamentos)
        });
    };

    async EditarColaboradorPost(req, res) {
        const { nome } = req.body;
        const novaLocalizacao = { nome };

        await pool.query('INSERT INTO localizacao set ?', [novaLocalizacao]);

        req.flash('success', 'Localização cadastrada com sucesso!');
        res.redirect("/profile");

    };
};

module.exports = new TaskHistorico();