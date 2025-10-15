const pool = require('../../database');
const nodemailer = require("nodemailer");
const AWS = require("aws-sdk");
//const { defaultProvider } = require("@aws-sdk/credential-provider-node");

class envioEmail {

    async recuperaSenhaGet(req, res) {
        /* const { email } = req.body;
        const recuperaSenha = await pool.query('SELECT email FROM users WHERE email = ? AND bd_promo = 1;', [email]); */

        res.render('links/consultas/recuperar_senha');
    };

    async recuperaSenhaPost(req, res) {
        const { email } = req.body;
        const validaEmail = await pool.query('SELECT email FROM users WHERE email = ? AND bd_promo = 1;', [email]);
        //console.log(validaEmail);
        const link = "/links/cadastros/cadastro_nova_senha";
        validaEmail.map((pessoa) => {
            const pessoa1 = (pessoa.email)

            if (pessoa1 === email) {

                //Função para o envio do e-mail de recuperação
                const transport = nodemailer.createTransport({
                    //service: "AWS_SES",
                    host: 'email-smtp.us-east-1.amazonaws.com',
                    port: 587,
                    //port: 25,
                    //port: 2587,
                    requireTLS: true,
                    secure: false, // true para 465, false para outras
                    auth: {
                        user: 'AKIAZH2N75ZJCLHQDZLI ',
                        pass: 'BAeb9hGvCHF3TdmjPZLHlqEJ8oWPZ5t4lI8q8Du824co',

                        /* user: 'AKIAZH2N75ZJL3NAT3UC',
                        pass: 'BD7AB7LB5k9zrq+HAiRiqEes9zddyebt/EuXX+KAbycI', */
                    },
                    tls: {
                        rejectUnauthorized: false // don't verify certificates
                    },
                    ignoreTLS: false // don't turn off STARTTLS support
                });

                transport.sendMail({
                    from: "Promoções - Notify <promocoes@notify.itatiaia.com.br>",
                    to: email,
                    subject: "Click no link para cadastro de uma nova senha",
                    html: "<h3>Prezado!</h3><p>Acesse o link para cadastro de nova senha <a href=" + link + ">Link </a></p>",
                    text: "Acesse o site de promoções da Itatiaia para recuperar a sua senha ."
                })
                    .then(() => console.log('E-mail enviado com sucesso!'))
                    .catch((err) => console.log('Erro ao enviar E-mail: ', err));

            } else {
                console.log("Erro ao enviar E-mal");
            }
        });

        req.flash('success', 'Foi enviado um e-mail para recuperação da senha, veifique sua caixa de entrada.');
        res.redirect('./email_enviado_alerta');

    };

};

module.exports = new envioEmail();