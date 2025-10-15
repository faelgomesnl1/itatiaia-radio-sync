const pool = require('../../../database');

class cadastroSetor {

    //Cadastrar Setor
    async cadastroSetorGet(req, res) {
        res.render('links/cadastros/cadastro_setor');
    };

    async cadastroSetorPost(req, res) {
        const { nome } = req.body;
        const novaPromocao = { nome };

        await pool.query('INSERT INTO tb_setor set ?', [novaPromocao]);

        req.flash('success', 'Setor cadastrado com sucesso!');
        res.redirect('/profile');
    };

    async consultaSetor(req, res) {
        const userId = req.session.userId;
        const [user] = await pool.query(`SELECT permissao FROM users WHERE id = ?`, [userId]);
        const setores = await pool.query(`SELECT s.id, s.nome AS name FROM tb_setor s ORDER BY s.nome;`)
        res.render('links/consultas/consulta_setor', { setores, user });
    }

    async editarSetorGet(req, res) {
        const { id } = req.params; // Pega o ID da URL

        try {
            // Busca o setor no banco
            const [setor] = await pool.query('SELECT id, nome FROM tb_setor WHERE id = ?', [id]);

            if (!setor) {
                req.flash('error', 'Setor não encontrado!');
                return res.redirect('/consulta_setor');
            }
            // Renderiza a página de edição com os dados
            res.render('links/editar/editar_setor', { setor });
        } catch (err) {
            console.error(err);
            req.flash('error', 'Erro ao carregar setor.');
            res.redirect('/consulta_setor');
        }
    }

    async editarSetorPost(req, res) {
        const { id } = req.params;
        const { nome } = req.body;

        try {
            await pool.query('UPDATE tb_setor SET nome = ? WHERE id = ?', [nome, id]);
            req.flash('success', 'Setor atualizado com sucesso!');
            res.redirect('/links/consultas/consulta_setor');
        } catch (err) {
            console.error(err);
            req.flash('error', 'Erro ao atualizar setor.');
            res.redirect(`/links/editar/editar_setor/${id}`);
        }
    }

    async excluirSetor(req, res) {
        const { id } = req.params;

        try {
            await pool.query('DELETE FROM tb_setor WHERE id = ?', [id]);
            req.flash('success', 'Setor excluído com sucesso!');
        } catch (err) {
            console.error(err);
            req.flash('error', 'Erro ao excluir setor.');
        }
        res.redirect('/links/consultas/consulta_setor');
    }

};

module.exports = new cadastroSetor();



