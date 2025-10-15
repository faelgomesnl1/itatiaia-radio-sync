const express = require('express');
const pool = require('../../../database');

class TaskArea {

    //Cadastrar Participantes
    async cadastroAreaGet(req, res) {

        const secao = await pool.query(`
            SELECT s.id , s.nome ,
            CASE 
                WHEN s.nome IN ('ADMINISTRATIVO', 'CONTABILIDADE' , 'FINANCEIRO', 'ITASAT') 
                THEN CONCAT(s.nome, ' - ', c.nome)
                ELSE s.nome
            END AS nome_final
            FROM coordenacao c
            INNER JOIN secao s on (c.id=s.coordenacao_id)
            ORDER BY nome_final;`);
        res.render('links/cadastros/cadastro_area', { secao })
    };

    async cadastroAreaPost(req, res) {
        const { nome, secao } = req.body;
        const secao_id = parseInt(secao);

        if (secao_id >= 0 && secao_id <= 39) {
            const newArea = { nome, secao_id };
            await pool.query('INSERT INTO area SET ?', [newArea]);
            req.flash('success', 'Área Cadastrada com Sucesso!');
            res.redirect('/profile');
        } else {
            req.flash('error', 'Área inválida!');
            res.redirect('/profile');
        }
    }

};

module.exports = new TaskArea();