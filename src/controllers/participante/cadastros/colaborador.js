const express = require('express');
const helpers = require('../../../lib/helpers');
const pool = require('../../../database');
const app = express();

class TaskColaborador {

    //Cadastrar Participantes
    async cadastroColaboradorGet(req, res) {
        const contrato = await pool.query('SELECT id, nome FROM tipo_contrato ORDER BY nome;');
        const localizacao = await pool.query('SELECT id, nome FROM localizacao ORDER BY nome;');
        const area = await pool.query(`
            SELECT a.id as area_id, a.nome, a.secao_id, 
                s.id, s.nome,
                CONCAT(s.nome, ' / ', a.nome) as nome_final 
            FROM db_headcount_prod.area a
            INNER JOIN db_headcount_prod.secao s ON (a.secao_id=s.id);`);
        const cargo = await pool.query('SELECT id, nome FROM cargo ORDER BY nome;');

        res.render('links/cadastros/cadastro_colaborador', { contrato, localizacao, area, cargo });
    };

    async cadastroColaboradorPost(req, res) {
        const { nome, localizacao_id, area_id, tipo_contrato_id, cargo_id, origem, data_inicio } = req.body;
        console.log('area_id')
        console.log(area_id)


        const nomeColaborador = { nome };

        await pool.query('INSERT INTO colaborador set ?', [nomeColaborador]);

        //verifica o ultimo colaborador cadastrado
        const lastocr1 = await pool.query('SELECT MAX(id) as id_colaborador FROM colaborador;');
        var colaborador_id = JSON.stringify(JSON.parse(lastocr1[0].id_colaborador));

        const historicoColaborador = { colaborador_id, localizacao_id, area_id, tipo_contrato_id, cargo_id, origem, data_inicio };

        await pool.query('INSERT INTO colaborador_historico set ?', [historicoColaborador]);

        req.flash('success', 'Colaborador cadastrado com sucesso!');
        res.redirect("/profile");

    };
};

module.exports = new TaskColaborador();