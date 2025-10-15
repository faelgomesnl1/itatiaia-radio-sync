const express = require('express');
const helpers = require('../../../lib/helpers');
const pool = require('../../../database');
const app = express();

class TaskLocalizacao {

    //Cadastrar Participantes
    async cadastroLocalizacaoGet(req, res) {
        res.render('links/cadastros/cadastro_localizacao');
    };

    async cadastroLocalizacaoPost(req, res) {
        const { nome } = req.body;
        const novaLocalizacao = { nome };

        await pool.query('INSERT INTO localizacao set ?', [novaLocalizacao]);

        req.flash('success', 'Localização cadastrada com sucesso!');
        res.redirect("/profile");

    };
};

module.exports = new TaskLocalizacao();