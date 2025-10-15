const pool = require('../../../database');

class cadastroOrigem {

    //Cadastrar Origem
    async cadastroOrigemGet(req, res) {
        res.render('links/cadastros/cadastro_origem');
    };

    async cadastroOrigemPost(req, res) {
        const { nome } = req.body;
        const novaPromocao = { nome };

        await pool.query('INSERT INTO tb_origem set ?', [novaPromocao]);

        req.flash('success', 'Origem cadastrado com sucesso!');
        res.redirect('/profile');
    };

    async consultaOrigem(req, res) {
        const userId = req.session.userId;
        const [user] = await pool.query(`SELECT permissao FROM users WHERE id = ?`, [userId]);
        const Origens = await pool.query(`SELECT o.id, o.nome AS name FROM tb_origem o ORDER BY o.nome;`)
        res.render('links/consultas/consulta_origem', { Origens, user });
    }

    async editarOrigemGet(req, res) {
        const { id } = req.params; // Pega o ID da URL

        try {
            // Busca o origem no banco
            const [origem] = await pool.query('SELECT id, nome FROM tb_origem WHERE id = ?', [id]);

            if (!origem) {
                req.flash('error', 'Origem não encontrado!');
                return res.redirect('/consulta_origem');
            }
            // Renderiza a página de edição com os dados
            res.render('links/editar/editar_origem', { origem });
        } catch (err) {
            console.error(err);
            req.flash('error', 'Erro ao carregar origem.');
            res.redirect('/consulta_origem');
        }
    }

    async editarOrigemPost(req, res) {
        const { id } = req.params;
        const { nome } = req.body;

        try {
            await pool.query('UPDATE tb_origem SET nome = ? WHERE id = ?', [nome, id]);
            req.flash('success', 'Origem atualizada com sucesso!');
            res.redirect('/links/consultas/consulta_origem');
        } catch (err) {
            console.error(err);
            req.flash('error', 'Erro ao atualizar origem.');
            res.redirect(`/links/editar/editar_origem/${id}`);
        }
    }

    async excluirOrigem(req, res) {
        const { id } = req.params;

        try {
            await pool.query('DELETE FROM tb_origem WHERE id = ?', [id]);
            req.flash('success', 'Origem excluído com sucesso!');
        } catch (err) {
            console.error(err);
            req.flash('error', 'Erro ao excluir origem.');
        }
        res.redirect('/links/consultas/consulta_origem');
    }

};

module.exports = new cadastroOrigem();



