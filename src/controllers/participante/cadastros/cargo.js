const express = require('express');
const helpers = require('../../../lib/helpers');
const pool = require('../../../database');
const app = express();

class TaskCargo {

    //Cadastrar Participantes
    async cadastroCargoGet(req, res) {
        res.render('links/cadastros/cadastro_cargo');
    };

    async cadastroCargoPost(req, res) {
        const { nome } = req.body;
        const novaCargo = { nome };

        await pool.query('INSERT INTO cargo set ?', [novaCargo]);

        req.flash('success', 'Posição/ Cargo cadastrado com sucesso!');
        res.redirect("/profile");

    };
};

module.exports = new TaskCargo();