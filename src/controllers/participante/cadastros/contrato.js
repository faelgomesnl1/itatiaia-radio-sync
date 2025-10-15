const express = require('express');
const helpers = require('../../../lib/helpers');
const pool = require('../../../database');
const app = express();

class TaskContrato {

    //Cadastrar Participantes
    async cadastroContratoGet(req, res) {
        res.render('links/cadastros/cadastro_contrato');
    };

    async cadastroContratoPost(req, res) {
        const { nome } = req.body;
        const novoContrato = { nome };

        await pool.query('INSERT INTO tipo_contrato set ?', [novoContrato]);

        req.flash('success', 'Tipo de Contrato cadastrado com sucesso!');
        res.redirect("/profile");

    };
};

module.exports = new TaskContrato();