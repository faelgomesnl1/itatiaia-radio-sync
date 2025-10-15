const express = require('express');
const helpers = require('../../../lib/helpers');
const pool = require('../../../database');
const app = express();

class TaskCoordenaca {

    //Cadastrar Participantes
    async cadastroCoordenacaGet(req, res) {

        const coord = await pool.query('SELECT id, nome FROM gerencia ORDER BY nome;');
        res.render('links/cadastros/cadastro_coordenacao', { coord })
    };

    async cadastroCoordenacaPost(req, res) {
        const { nome, diretoria } = req.body;
        const gerencia_id = parseInt(gerencia);

        if (secao_id >= 0 && secao_id <= 4) {
            const newCoordenacao = { nome, gerencia_id };
            await pool.query('INSERT INTO coordenacao SET ?', [newCoordenacao]);
            req.flash('success', 'Coordenação Cadastrada com Sucesso!');
            res.redirect('/profile');
        } else {
            req.flash('error', 'Coordenação inválida!');
            res.redirect('/profile');
        }
    }
};

module.exports = new TaskCoordenaca();