const pool = require('../../../database');
const puppeteer = require('puppeteer');

class gerarRelatorio {

    async consultaRelatorioGet(req, res) {
        try {
            const eventos = await pool.query(`
                SELECT ev.id, ev.titulo, DATE_FORMAT(ev.data, '%d/%m/%Y') AS data_formatada
                FROM tb_evento ev
                INNER JOIN tb_planejamento p ON p.id_evento = ev.id
                WHERE ev.data >= CURDATE()
                GROUP BY ev.id
                ORDER BY ev.data ASC;`);

            res.render('links/consultas/consulta_relatorio', { eventos });
        } catch (err) {
            console.error('Erro ao consultar relatório:', err);
            res.status(500).send('Erro ao gerar relatório');
        }
    }

    async gerarRelatorioGet(req, res) {
        const { id } = req.params; // id_evento

        try {
            // Buscar dados do evento
            const eventoRow = await pool.query(`SELECT * FROM tb_evento WHERE id = ?`, [id]);
            const evento = eventoRow[0];

            const data = new Date(evento.data);
            evento.data_formatada = data.toLocaleDateString('pt-BR', { timeZone: 'UTC' });

            // Formatando horário para tirar os segundos (de "15:30:00" → "15:30")
            evento.h_inicio_formatado = evento.h_inicio.slice(0, 5);
            evento.h_fim_formatado = evento.h_fim.slice(0, 5);

            if (!evento) {
                return res.status(404).send("Evento não encontrado.");
            }

            // Buscar origem do evento
            const origem = await pool.query(`
                SELECT o.nome
                FROM tb_origem_eventos oe
                INNER JOIN tb_origem o ON o.id = oe.id_origem
                WHERE oe.id_evento = ?`, [id]);

            // Buscar dados de cópias relacionadas
            const copiados = await pool.query(`
                SELECT f.email
                FROM tb_copiados c
                INNER JOIN tb_funcionario f ON f.id = c.id_funcionario
                WHERE c.id_evento = ? `, [id]);

            // Buscar planejamentos relacionados ao evento
            const planejamentos = await pool.query(`
                SELECT p.* 
                FROM tb_planejamento p  
                INNER JOIN tb_setor s ON (p.id_setor=s.id) 
                WHERE id_evento = ? ORDER BY exibicao`, [id]);

            const idsPlanejamento = planejamentos.map(p => p.id);

            let funcsSetor = [];
            let programasConteudo = [];

            if (idsPlanejamento.length > 0) {
                const placeholders = idsPlanejamento.map(() => '?').join(',');

                funcsSetor = await pool.query(`
                    SELECT fs.id, fs.id_funcionario, fs.id_setor, fs.id_planejamento,
                    f.nome AS nome_funcionario,
                    s.nome AS nome_setor
                    FROM tb_func_setor fs
                    JOIN tb_funcionario f ON fs.id_funcionario = f.id
                    JOIN tb_setor s ON fs.id_setor = s.id
                    WHERE fs.id_planejamento IN (${placeholders})`, idsPlanejamento);

                programasConteudo = await pool.query(`
              SELECT pc.id, pc.id_programa, pc.observacao, pc.id_planejamento, pc.id_setor,
              p.nome AS nome_programa
              FROM tb_prog_conteudo pc
              LEFT JOIN tb_programa p ON pc.id_programa = p.id
              WHERE pc.id_planejamento IN (${placeholders})
            `, idsPlanejamento);
            }

            const funcsMap = {};

            funcsSetor.forEach(f => {
                if (!funcsMap[f.id_planejamento]) funcsMap[f.id_planejamento] = {};

                if (!funcsMap[f.id_planejamento][f.nome_setor]) {
                    funcsMap[f.id_planejamento][f.nome_setor] = [];
                }

                funcsMap[f.id_planejamento][f.nome_setor].push(f.nome_funcionario);
            });

            const programasMap = {};
            programasConteudo.forEach(p => {
                if (!programasMap[p.id_planejamento]) programasMap[p.id_planejamento] = [];
                programasMap[p.id_planejamento].push({
                    nome: p.nome_programa || null,
                    observacao: p.observacao
                });
            });

            //console.log('Funcionários por setor:', funcsSetor);
            //console.log('Programas e conteúdos:', programasConteudo);

            return res.render('links/consultas/gerarRelatorio', {
                evento, origem, copiados, planejamentos, funcionariosPorPlanejamento: funcsMap,
                programasPorPlanejamento: programasMap
            });

        } catch (err) {
            console.error("Erro ao gerar relatório do evento:", err);
            return res.status(500).send("Erro interno ao gerar relatório do evento.");
        }
    }

    async gerarPdfEvento(req, res) {
        try {
            const { html } = req.body;

            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            const page = await browser.newPage();

            // Configurar o conteúdo HTML
            await page.setContent(html, {
                waitUntil: 'networkidle0'
            });

            // Gerar o PDF
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '20mm',
                    right: '20mm',
                    bottom: '20mm',
                    left: '20mm'
                },
                displayHeaderFooter: false,
                preferCSSPageSize: true
            });

            await browser.close();

            // Enviar o PDF
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename=planejamento_evento.pdf');
            res.send(pdfBuffer);

        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            res.status(500).send('Erro ao gerar PDF');
        }
    };

    async consultaFinalizadosGet(req, res) {
        try {
            const eventos = await pool.query(`
                SELECT ev.id, ev.titulo, DATE_FORMAT(ev.data, '%d/%m/%Y') AS data_formatada
                FROM tb_evento ev
                INNER JOIN tb_planejamento p ON p.id_evento = ev.id
                WHERE ev.data < CURDATE()
                GROUP BY ev.id
                ORDER BY ev.data ASC;`);
            res.render('links/consultas/consulta_finalizados', { eventos });
        } catch (err) {
            console.error('Erro ao consultar relatório:', err);
            res.status(500).send('Erro ao gerar relatório');
        }
    }
}



module.exports = new gerarRelatorio();