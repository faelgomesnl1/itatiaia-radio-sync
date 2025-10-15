const express = require('express');
const helpers = require('../../../lib/helpers');
const pool = require('../../../database');
const app = express();

class TaskDiretoria {

    //Cadastrar Participantes
    async cadastroDiretoriaGet(req, res) {
        res.render('links/cadastros/cadastro_diretoria');
    };

    async cadastroDiretoriaPost(req, res) {
        const { nome } = req.body;
        const novaDiretoria = { nome };

        await pool.query('INSERT INTO diretoria set ?', [novaDiretoria]);

        req.flash('success', 'Diretoria cadastrada com sucesso!');
        res.redirect("/profile");

    };
};

module.exports = new TaskDiretoria();