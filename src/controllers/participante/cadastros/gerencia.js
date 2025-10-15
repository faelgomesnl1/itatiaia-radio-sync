const express = require('express');
const helpers = require('../../../lib/helpers');
const pool = require('../../../database');
const app = express();

class TaskGerencia {

    //Cadastrar Participantes
    async cadastroGerenciaGet(req, res) {

        const diretoria = await pool.query('SELECT id, nome FROM diretoria ORDER BY nome;');
        res.render('links/cadastros/cadastro_gerencia', { diretoria })
    };

    async cadastroGerenciaPost(req, res) {
        const { nome, diretoria } = req.body;
        const diretoria_id = parseInt(diretoria);

        if (secao_id >= 0 && secao_id <= 4) {
            const newGerencia = { nome, diretoria_id };
            await pool.query('INSERT INTO gerencia SET ?', [newGerencia]);
            req.flash('success', 'Gerência Cadastrada com Sucesso!');
            res.redirect('/profile');
        } else {
            req.flash('error', 'Gerência inválida!');
            res.redirect('/profile');
        }
    }
};

module.exports = new TaskGerencia();