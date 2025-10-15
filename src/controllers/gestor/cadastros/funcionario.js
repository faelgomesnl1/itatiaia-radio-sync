const pool = require('../../../database');

class cadastroFuncionario {

    //Cadastrar Funcionario
    async cadastroFuncionarioGet(req, res) {
        const setores = await pool.query(`SELECT s.id, s.nome AS name FROM tb_setor s ORDER BY s.nome;`)
        res.render('links/cadastros/cadastro_funcionario', { setores });
    };

    async cadastroFuncionarioPost(req, res) {
        const { nome, email, setor } = req.body;
        try {
            // Verifica se o e-mail já está cadastrado
            const rows = await pool.query('SELECT id FROM tb_funcionario WHERE email = ?', [email]);

            if (rows.length > 0) {
                req.flash('message', 'Este e-mail já está cadastrado!');
                return res.redirect('/links/cadastros/cadastro_funcionario');
            }

            // Monta o objeto com o campo "ativo = 1"
            const novoFuncionario = {
                nome,
                email,
                setor,
                ativo: 1
            };

            await pool.query('INSERT INTO tb_funcionario SET ?', [novoFuncionario]);

            req.flash('success', 'Funcionário cadastrado com sucesso!');
            res.redirect('/profile');

        } catch (error) {
            console.error('Erro ao cadastrar funcionário:', error);
            req.flash('error', 'Erro ao cadastrar funcionário!');
            res.redirect('/links/cadastros/cadastro_funcionario');
        }
    }

    async consultaFuncionario(req, res) {
        const userId = req.session.userId;
        const [user] = await pool.query(`SELECT permissao FROM users WHERE id = ?`, [userId]);
        const funcionarios = await pool.query(`SELECT f.id, f.ativo, f.nome AS name FROM tb_funcionario f ORDER BY f.nome;`)
        res.render('links/consultas/consulta_funcionario', { funcionarios, user });
    }

    async editarFuncionarioGet(req, res) {
        const { id } = req.params; // Pega o ID da URL

        try {
            // Busca o funcionario no banco
            const [funcionario] = await pool.query('SELECT id, nome, email, setor, ativo FROM tb_funcionario WHERE id = ?', [id]);
            const setores = await pool.query('SELECT s.id, s.nome AS name FROM tb_setor s ORDER BY s.nome;');
            if (!funcionario) {
                req.flash('error', 'Funcionario não encontrado!');
                return res.redirect('/consulta_funcionario');
            }
            // Renderiza a página de edição com os dados
            res.render('links/editar/editar_funcionario', { funcionario, setores });
        } catch (err) {
            console.error(err);
            req.flash('error', 'Erro ao carregar funcionario.');
            res.redirect('/consulta_funcionario');
        }
    }

    async editarFuncionarioPost(req, res) {
    const { id } = req.params;
    const { nome, email, setor } = req.body;

    try {
        // Verifica se o e-mail já está cadastrado por outro funcionário
        const rows = await pool.query(
            'SELECT id FROM tb_funcionario WHERE email = ? AND id != ?',
            [email, id]
        );  

        if (rows.length > 0) {
            req.flash('message', 'Este e-mail já está sendo utilizado por outro funcionário!');
            return res.redirect(`/links/editar/editar_funcionario/${id}`);
        }

        // Atualiza os dados do funcionário
        await pool.query(
            'UPDATE tb_funcionario SET nome = ?, email = ?, setor = ? WHERE id = ?',
            [nome, email, setor, id]
        );

        req.flash('success', 'Funcionário atualizado com sucesso!');
        res.redirect('/links/consultas/consulta_funcionario');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Erro ao atualizar funcionário.');
        res.redirect(`/links/editar/editar_funcionario/${id}`);
    }
}

    async excluirFuncionario(req, res) {
    const { id } = req.params;

    try {
        // Pega o valor atual de 'ativo'
        const rows = await pool.query('SELECT ativo FROM tb_funcionario WHERE id = ?', [id]);

        if (rows.length === 0) {
            req.flash('error', 'Funcionário não encontrado.');
            return res.redirect('/links/consultas/consulta_funcionario');
        }

        const ativoAtual = rows[0].ativo;
        const novoStatus = ativoAtual === 1 ? 0 : 1;

        await pool.query('UPDATE tb_funcionario SET ativo = ? WHERE id = ?', [novoStatus, id]);

        req.flash('success', `Funcionário ${novoStatus === 1 ? 'ativado' : 'desativado'} com sucesso!`);
    } catch (err) {
        console.error(err);
        req.flash('error', 'Erro ao atualizar status do funcionário.');
    }

    res.redirect('/links/consultas/consulta_funcionario');
}
};

module.exports = new cadastroFuncionario();




