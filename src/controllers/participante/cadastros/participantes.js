const express = require('express');
const helpers = require('../../../lib/helpers');
const pool = require('../../../database');
const app = express();

class TaskParticipante {

    //Cadastrar Participantes
    async cadastroParticipanteGet(req, res) {
        res.render('links/cadastros/cadastro_participante');
    };

    async cadastroParticipantePost(req, res) {
        const { password, username, filial } = req.body;
        const fop = 1;
        const fjf = 1;
        const fmoc = 1;
        const fipt = 1;
        const fvrg = 1;
        

        try {
            if (filial == 1) {
                const newUsuario = { password, username, fipt };
                newUsuario.password = await helpers.encryptPassword(password);
                await pool.query('INSERT INTO users SET ?', [newUsuario]);
                req.flash('success', 'Usuário Ipatinga Cadastrado com Sucesso!');
                res.redirect('/profile');
            } else if (filial == 2) {
                const newUsuario = { password, username, fjf };
                newUsuario.password = await helpers.encryptPassword(password);
                await pool.query('INSERT INTO users SET ?', [newUsuario]);
                req.flash('success', 'Usuário Juiz De Fora Cadastrado com Sucesso!');
                res.redirect('/profile');
            } else if (filial == 3) {
                const newUsuario = { password, username, fmoc };
                newUsuario.password = await helpers.encryptPassword(password);
                await pool.query('INSERT INTO users SET ?', [newUsuario]);
                req.flash('success', 'Usuário Montes Claros Cadastrado com Sucesso!');
                res.redirect('/profile');
            } else if (filial == 4) {
                const newUsuario = { password, username, fop };
                newUsuario.password = await helpers.encryptPassword(password);
                await pool.query('INSERT INTO users SET ?', [newUsuario]);
                req.flash('success', 'Usuário Ouro Preto Cadastrado com Sucesso!');
                res.redirect('/profile');
            } else if (filial == 5) {
                const newUsuario = { password, username, fvrg };
                await pool.query('INSERT INTO users SET ?', [newUsuario]);
                newUsuario.password = await helpers.encryptPassword(password);
                req.flash('success', 'Usuário Varginha Cadastrado com Sucesso!');
                res.redirect('/profile');
            } else {
                req.flash('message', 'Filial inválida.');
                res.redirect('/links/cadastros/cadastro_participante');
            }
        } catch (err) {
            let msg = err.toString();

            console.log(msg);

            if (msg.includes("username"))
                req.flash("message", "Nome de usuário já cadastrado em nosso sistema.");
            if (msg.includes("email"))
                req.flash("message", "Email já cadastrado em nosso sistema.");
            if (msg.includes("CPF"))
                req.flash("message", "CPF já cadastrado em nosso sistema.");

            res.redirect("/links/cadastros/cadastro_participante");
        };
    };
};

module.exports = new TaskParticipante();