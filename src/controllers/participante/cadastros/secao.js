const express = require('express');
const helpers = require('../../../lib/helpers');
const pool = require('../../../database');
const app = express();

class TaskSecao {

    //Cadastrar Participantes
    async cadastroSecaoaGet(req, res) {

        const coord = await pool.query(`
            SELECT c.id, c.nome, c.gerencia_id, g.nome as gerencia,
            CASE 
                WHEN c.nome IN ('GERENCIA TECNICA', 'COORDENACAO DE REDES E AFILIADAS') 
                THEN CONCAT(c.nome, ' - ', g.nome)
                ELSE c.nome
            END AS nome_final
            FROM coordenacao c
            INNER JOIN gerencia g ON (g.id=c.gerencia_id)
            ORDER BY c.nome;`);
        res.render('links/cadastros/cadastro_secao', { coord })
    };

    async cadastroSecaoaPost(req, res) {
        const { nome, coordenacao } = req.body;
        const coordenacao_id = parseInt(coordenacao);

        if (secao_id >= 0 && secao_id <= 21) {
            const newSecao = { nome, coordenacao_id };
            await pool.query('INSERT INTO secao SET ?', [newSecao]);
            req.flash('success', 'Seção Cadastrada com Sucesso!');
            res.redirect('/profile');
        } else {
            req.flash('error', 'Seção inválida!');
            res.redirect('/profile');
        }
    }
};

module.exports = new TaskSecao();