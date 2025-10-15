const pool = require('../../../database');

class cadastroPrograma {

    //CADASTRAR PROGRAMA
    async cadastroProgramaGet(req, res) {
        res.render('links/cadastros/cadastro_programa');
    };

    async cadastroProgramaPost(req, res) {
        const { nome } = req.body;
        const novoPrograma = { nome };

        await pool.query('INSERT INTO tb_programa set ?', [novoPrograma]);

        req.flash('success', 'Programa cadastrado com sucesso!');
        res.redirect('/profile');
    };

    async consultaPrograma(req, res) {
        const userId = req.session.userId;
        const [user] = await pool.query(`SELECT permissao FROM users WHERE id = ?`, [userId]);
        const programas = await pool.query(`SELECT p.id, p.nome AS name FROM tb_programa p ORDER BY p.nome;`)
        res.render('links/consultas/consulta_programa', { programas, user });
    };

    async editarProgramaGet(req, res) {
        const { id } = req.params; // Pega o ID da URL

        try {
            // Busca o programa no banco
            const [programa] = await pool.query('SELECT id, nome FROM tb_programa WHERE id = ?', [id]);

            if (!programa) {
                req.flash('error', 'Programa não encontrado!');
                return res.redirect('/consulta_programa');
            }
            // Renderiza a página de edição com os dados
            res.render('links/editar/editar_programa', { programa });
        } catch (err) {
            console.error(err);
            req.flash('error', 'Erro ao carregar programa.');
            res.redirect('/consulta_programa');
        }
    }

    async editarProgramaPost(req, res) {
        const { id } = req.params;
        const { nome } = req.body;

        try {
            await pool.query('UPDATE tb_programa SET nome = ? WHERE id = ?', [nome, id]);
            req.flash('success', 'Programa atualizado com sucesso!');
            res.redirect('/links/consultas/consulta_programa');
        } catch (err) {
            console.error(err);
            req.flash('error', 'Erro ao atualizar programa.');
            res.redirect(`/links/editar/editar_programa/${id}`);
        }
    }

    async excluirPrograma(req, res) {
        const { id } = req.params;

        try {
            await pool.query('DELETE FROM tb_programa WHERE id = ?', [id]);
            req.flash('success', 'Programa excluído com sucesso!');
        } catch (err) {
            console.error(err);
            req.flash('error', 'Erro ao excluir programa.');
        }
        res.redirect('/links/consultas/consulta_programa');
    }


};

module.exports = new cadastroPrograma();