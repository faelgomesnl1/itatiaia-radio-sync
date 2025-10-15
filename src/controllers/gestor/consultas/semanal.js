const pool = require('../../../database');
const puppeteer = require('puppeteer');

class detalhesColaboradores {
    async semanalGet(req, res) {
        const dt_start = req.query.dt_start;
        const dt_end = req.query.dt_end;
        console.log(`start: ${dt_start}; end: ${dt_end}`);

        const escala = await pool.query('SELECT e.nome nome_evento, GROUP_CONCAT(DISTINCT(p.nome) SEPARATOR ", ") nome_programa, ' +
            'GROUP_CONCAT(DISTINCT(f.nome) SEPARATOR ", ") nome_funcionario, ae.id_atividade_evento, DATE_FORMAT(a.dt_escala, "%d/%m/%Y") dt_escala, ' +
            'a.observacao observacao, DATE_FORMAT(ae.h_evento_inicio, "%H:%i") hr_inicio, DATE_FORMAT(ae.h_evento_fim, "%H:%i") hr_fim ' +
            'FROM tb_evento e ' +
            'INNER JOIN tb_atividade_evento ae ON e.id_evento = ae.id_evento ' +
            'INNER JOIN tb_atividade a ON ae.id_atividade = a.id_atividade ' +
            'LEFT JOIN tb_programacao_prog pp ON ae.id_atividade_evento = pp.id_atividade_evento ' +
            'LEFT OUTER JOIN tb_programa p ON pp.id_programa = p.id_programa ' +
            'INNER JOIN tb_func_escala fe ON ae.id_atividade_evento = fe.id_atividade_evento ' +
            'INNER JOIN tb_funcionario f ON fe.id_funcionario = f.id_funcionario ' +
            'WHERE a.dt_escala BETWEEN ? AND ? ' +
            'GROUP BY a.dt_escala, e.id_evento ' +
            'ORDER BY ae.id_atividade_evento;', [dt_start, dt_end]);

        const date = await pool.query('SELECT DISTINCT DATE_FORMAT(a.dt_escala, "%d/%m/%Y") AS dt_escala, ' +
            'UPPER(CONCAT(CASE  ' +
            'WHEN DAYOFWEEK(a.dt_escala) = 1 THEN "Domingo" ' +
            'WHEN DAYOFWEEK(a.dt_escala) = 2 THEN "Segunda-feira" ' +
            'WHEN DAYOFWEEK(a.dt_escala) = 3 THEN "Terça-feira" ' +
            'WHEN DAYOFWEEK(a.dt_escala) = 4 THEN "Quarta-feira" ' +
            'WHEN DAYOFWEEK(a.dt_escala) = 5 THEN "Quinta-feira" ' +
            'WHEN DAYOFWEEK(a.dt_escala) = 6 THEN "Sexta-feira" ' +
            'WHEN DAYOFWEEK(a.dt_escala) = 7 THEN "Sábado" ' +
            'END,  ' +
            '", ",  ' +
            'DATE_FORMAT(a.dt_escala, "%e DE "), ' +
            'CASE ' +
            'WHEN MONTH(a.dt_escala) = 1 THEN "Janeiro" ' +
            'WHEN MONTH(a.dt_escala) = 2 THEN "Fevereiro" ' +
            'WHEN MONTH(a.dt_escala) = 3 THEN "Março" ' +
            'WHEN MONTH(a.dt_escala) = 4 THEN "Abril" ' +
            'WHEN MONTH(a.dt_escala) = 5 THEN "Maio" ' +
            'WHEN MONTH(a.dt_escala) = 6 THEN "Junho" ' +
            'WHEN MONTH(a.dt_escala) = 7 THEN "Julho" ' +
            'WHEN MONTH(a.dt_escala) = 8 THEN "Agosto" ' +
            'WHEN MONTH(a.dt_escala) = 9 THEN "Setembro" ' +
            'WHEN MONTH(a.dt_escala) = 10 THEN "Outubro" ' +
            'WHEN MONTH(a.dt_escala) = 11 THEN "Novembro" ' +
            'WHEN MONTH(a.dt_escala) = 12 THEN "Dezembro" ' +
            'END,  ' +
            '" DE ",  ' +
            'DATE_FORMAT(a.dt_escala, "%Y"))) AS dt_escala1 ' +
            'FROM tb_evento e ' +
            'INNER JOIN tb_atividade_evento ae ON e.id_evento = ae.id_evento ' +
            'INNER JOIN tb_atividade a ON ae.id_atividade = a.id_atividade ' +
            'LEFT JOIN tb_programacao_prog pp ON ae.id_atividade_evento = pp.id_atividade_evento ' +
            'LEFT OUTER JOIN tb_programa p ON pp.id_programa = p.id_programa ' +
            'INNER JOIN tb_func_escala fe ON ae.id_atividade_evento = fe.id_atividade_evento ' +
            'INNER JOIN tb_funcionario f ON fe.id_funcionario = f.id_funcionario ' +
            'WHERE a.dt_escala BETWEEN ? AND ? ' +
            'GROUP BY a.dt_escala ' +
            'ORDER BY a.dt_escala;', [dt_start, dt_end]);

        res.render('links/consultas/consulta_semanal_funcionario', { escala, date });
    };

    async jogosGet(req, res) {
        const dt_start = req.query.dt_start;
        const dt_end = req.query.dt_end;

        const fixos = await pool.query(`
            SELECT DATE_FORMAT(a.dt_escala, "%d/%m/%Y") AS dt_escala,
            UPPER(c.nome) AS nome_campeonato, UPPER(GROUP_CONCAT(DISTINCT cl.nome SEPARATOR ' X ')) AS nome_times,
            DATE_FORMAT(j.horario_abertura, '%Hh%i') AS abertura,
            DATE_FORMAT(j.horario_jogo, '%Hh%i') AS h_jogo, DATE_FORMAT(j.encerramento, '%Hh%i') AS encerramento,
            l.nome AS local, pg.nome AS seguir,
            j.saida,j.retorno,
            GROUP_CONCAT(DISTINCT(narrador.nome) SEPARATOR ", ") narrador,
            CASE
                WHEN GROUP_CONCAT(DISTINCT fe_narrador.obs_funcao SEPARATOR ", ") IS NULL
                OR GROUP_CONCAT(DISTINCT fe_narrador.obs_funcao SEPARATOR ", ") = '' THEN ''
                ELSE CONCAT('(',GROUP_CONCAT(DISTINCT fe_narrador.obs_funcao SEPARATOR ", "),')')
            END AS obs_narrador,
            GROUP_CONCAT(DISTINCT(ancora.nome) SEPARATOR ", ") ancora,
            CASE
                WHEN GROUP_CONCAT(DISTINCT fe_ancora.obs_funcao SEPARATOR ", ") IS NULL
                OR GROUP_CONCAT(DISTINCT fe_ancora.obs_funcao SEPARATOR ", ") = '' THEN ''
                ELSE CONCAT('(',GROUP_CONCAT(DISTINCT fe_ancora.obs_funcao SEPARATOR ", "),')')
            END AS obs_ancora,
            GROUP_CONCAT(DISTINCT(comentarista.nome) SEPARATOR ", ") comentarista,
            CASE
                WHEN GROUP_CONCAT(DISTINCT fe_comentarista.obs_funcao SEPARATOR ", ") IS NULL
                OR GROUP_CONCAT(DISTINCT fe_comentarista.obs_funcao SEPARATOR ", ") = '' THEN ''
                ELSE CONCAT('(',GROUP_CONCAT(DISTINCT fe_comentarista.obs_funcao SEPARATOR ", "),')')
            END AS obs_comentarista,
            GROUP_CONCAT(DISTINCT(arbitragem.nome) SEPARATOR ", ") arbitragem,
            CASE
                WHEN GROUP_CONCAT(DISTINCT fe_arbitragem.obs_funcao SEPARATOR ", ") IS NULL
                OR GROUP_CONCAT(DISTINCT fe_arbitragem.obs_funcao SEPARATOR ", ") = '' THEN ''
                ELSE CONCAT('(',GROUP_CONCAT(DISTINCT fe_arbitragem.obs_funcao SEPARATOR ", "),')')
            END AS obs_arbitragem,
            GROUP_CONCAT(DISTINCT(numeros.nome) SEPARATOR ", ") numeros,
            CASE
                WHEN GROUP_CONCAT(DISTINCT fe_numeros.obs_funcao SEPARATOR ", ") IS NULL
                OR GROUP_CONCAT(DISTINCT fe_numeros.obs_funcao SEPARATOR ", ") = '' THEN ''
                ELSE CONCAT('(',GROUP_CONCAT(DISTINCT fe_numeros.obs_funcao SEPARATOR ", "),')')
            END AS obs_numeros,
            GROUP_CONCAT(DISTINCT(reporter.nome) SEPARATOR ", ") reporter,
            CASE
                WHEN GROUP_CONCAT(DISTINCT fe_reporter.obs_funcao SEPARATOR ", ") IS NULL
                OR GROUP_CONCAT(DISTINCT fe_reporter.obs_funcao SEPARATOR ", ") = '' THEN ''
                ELSE CONCAT('(',GROUP_CONCAT(DISTINCT fe_reporter.obs_funcao SEPARATOR ", "),')')
            END AS obs_reporter,
            GROUP_CONCAT(DISTINCT(operador.nome) SEPARATOR ", ") operador,
            CASE
                WHEN GROUP_CONCAT(DISTINCT fe_operador.obs_funcao SEPARATOR ", ") IS NULL
                OR GROUP_CONCAT(DISTINCT fe_operador.obs_funcao SEPARATOR ", ") = '' THEN ''
                ELSE CONCAT('(',GROUP_CONCAT(DISTINCT fe_operador.obs_funcao SEPARATOR ", "),')')
            END AS obs_operador,
            GROUP_CONCAT(DISTINCT(producao.nome) SEPARATOR ", ") producao,
            CASE
                WHEN GROUP_CONCAT(DISTINCT fe_producao.obs_funcao SEPARATOR ", ") IS NULL
                OR GROUP_CONCAT(DISTINCT fe_producao.obs_funcao SEPARATOR ", ") = '' THEN ''
                ELSE CONCAT('(',GROUP_CONCAT(DISTINCT fe_producao.obs_funcao SEPARATOR ", "),')')
            END AS obs_producao,
            GROUP_CONCAT(DISTINCT(torcida.nome) SEPARATOR ", ") torcida,
            CASE
                WHEN GROUP_CONCAT(DISTINCT fe_torcida.obs_funcao SEPARATOR ", ") IS NULL
                OR GROUP_CONCAT(DISTINCT fe_torcida.obs_funcao SEPARATOR ", ") = '' THEN ''
                ELSE CONCAT('(',GROUP_CONCAT(DISTINCT fe_torcida.obs_funcao SEPARATOR ", "),')')
            END AS obs_torcida,
            GROUP_CONCAT(DISTINCT(dial.nome) SEPARATOR ", ") dial,
            CASE
                WHEN GROUP_CONCAT(DISTINCT fe_dial.obs_funcao SEPARATOR ", ") IS NULL
                OR GROUP_CONCAT(DISTINCT fe_dial.obs_funcao SEPARATOR ", ") = '' THEN ''
                ELSE CONCAT('(',GROUP_CONCAT(DISTINCT fe_dial.obs_funcao SEPARATOR ", "),')')
            END AS obs_dial,
            GROUP_CONCAT(DISTINCT(cinegrafista.nome) SEPARATOR ", ") cinegrafista,
            CASE
                WHEN GROUP_CONCAT(DISTINCT fe_cinegrafista.obs_funcao SEPARATOR ", ") IS NULL
                OR GROUP_CONCAT(DISTINCT fe_cinegrafista.obs_funcao SEPARATOR ", ") = '' THEN ''
                ELSE CONCAT('(',GROUP_CONCAT(DISTINCT fe_cinegrafista.obs_funcao SEPARATOR ", "),')')
            END AS obs_cinegrafista,
            GROUP_CONCAT(DISTINCT(digital.nome) SEPARATOR ", ") digital,
            CASE
                WHEN GROUP_CONCAT(DISTINCT fe_digital.obs_funcao SEPARATOR ", ") IS NULL
                OR GROUP_CONCAT(DISTINCT fe_digital.obs_funcao SEPARATOR ", ") = '' THEN ''
                ELSE CONCAT('(',GROUP_CONCAT(DISTINCT fe_digital.obs_funcao SEPARATOR ", "),')')
            END AS obs_digital
        FROM
            tb_campeonato c
            INNER JOIN tb_atividade_jornada aj ON c.id_campeonato = aj.id_campeonato
            INNER JOIN tb_atividade a ON aj.id_atividade = a.id_atividade
            INNER JOIN tb_jogo j ON aj.id_atividade_jrd = j.id_atividade_jrd
            INNER JOIN tb_clubes_jogos cj ON j.id_jogo = cj.id_jogo
            INNER JOIN tb_clubes cl ON cj.id_clube = cl.id_clubes
            LEFT JOIN tb_local l ON j.id_local = l.id_local
            LEFT JOIN tb_programa pg ON j.seguir = pg.id_programa
            LEFT JOIN tb_func_escala fe_narrador ON fe_narrador.id_jogo = j.id_jogo AND fe_narrador.tipo_funcao = 1
            LEFT JOIN tb_funcionario narrador ON fe_narrador.id_funcionario = narrador.id_funcionario
            LEFT JOIN tb_func_escala fe_ancora ON fe_ancora.id_jogo = j.id_jogo AND fe_ancora.tipo_funcao = 2
            LEFT JOIN tb_funcionario ancora ON fe_ancora.id_funcionario = ancora.id_funcionario
            LEFT JOIN tb_func_escala fe_comentarista ON fe_comentarista.id_jogo = j.id_jogo AND fe_comentarista.tipo_funcao = 3
            LEFT JOIN tb_funcionario comentarista ON fe_comentarista.id_funcionario = comentarista.id_funcionario
            LEFT JOIN tb_func_escala fe_arbitragem ON fe_arbitragem.id_jogo = j.id_jogo AND fe_arbitragem.tipo_funcao = 4
            LEFT JOIN tb_funcionario arbitragem ON fe_arbitragem.id_funcionario = arbitragem.id_funcionario
            LEFT JOIN tb_func_escala fe_numeros ON fe_numeros.id_jogo = j.id_jogo AND fe_numeros.tipo_funcao = 5
            LEFT JOIN tb_funcionario numeros ON fe_numeros.id_funcionario = numeros.id_funcionario
            LEFT JOIN tb_func_escala fe_reporter ON fe_reporter.id_jogo = j.id_jogo AND fe_reporter.tipo_funcao = 6
            LEFT JOIN tb_funcionario reporter ON fe_reporter.id_funcionario = reporter.id_funcionario
            LEFT JOIN tb_func_escala fe_operador ON fe_operador.id_jogo = j.id_jogo AND fe_operador.tipo_funcao = 7
            LEFT JOIN tb_funcionario operador ON fe_operador.id_funcionario = operador.id_funcionario
            LEFT JOIN tb_func_escala fe_producao ON fe_producao.id_jogo = j.id_jogo AND fe_producao.tipo_funcao = 8
            LEFT JOIN tb_funcionario producao ON fe_producao.id_funcionario = producao.id_funcionario
            LEFT JOIN tb_func_escala fe_torcida ON fe_torcida.id_jogo = j.id_jogo AND fe_torcida.tipo_funcao = 9
            LEFT JOIN tb_funcionario torcida ON fe_torcida.id_funcionario = torcida.id_funcionario
            LEFT JOIN tb_func_escala fe_dial ON fe_dial.id_jogo = j.id_jogo AND fe_dial.tipo_funcao = 10
            LEFT JOIN tb_funcionario dial ON fe_dial.id_funcionario = dial.id_funcionario            
            LEFT JOIN tb_func_escala fe_cinegrafista ON fe_cinegrafista.id_jogo = j.id_jogo AND fe_cinegrafista.tipo_funcao = 11
            LEFT JOIN tb_funcionario cinegrafista ON fe_cinegrafista.id_funcionario = cinegrafista.id_funcionario            
            LEFT JOIN tb_func_escala fe_digital ON fe_digital.id_jogo = j.id_jogo AND fe_digital.tipo_funcao = 12
            LEFT JOIN tb_funcionario digital ON fe_digital.id_funcionario = digital.id_funcionario
            
        WHERE a.dt_escala BETWEEN ? AND ?
        GROUP BY a.dt_escala, c.nome
        ORDER BY j.horario_jogo;`, [dt_start, dt_end]);

        const escala = await pool.query(`
            SELECT GROUP_CONCAT(DISTINCT(narrador.nome) SEPARATOR ", ") narrador,GROUP_CONCAT(DISTINCT(ancora.nome) SEPARATOR ", ") ancora,  
            GROUP_CONCAT(DISTINCT(comentarista.nome) SEPARATOR ", ") comentarista, GROUP_CONCAT(DISTINCT(arbitragem.nome) SEPARATOR ", ") arbitragem,  
            GROUP_CONCAT(DISTINCT(numeros.nome) SEPARATOR ", ") numeros,  GROUP_CONCAT(DISTINCT(reporter.nome) SEPARATOR ", ") reporter,  
            GROUP_CONCAT(DISTINCT(operador.nome) SEPARATOR ", ") operador,  GROUP_CONCAT(DISTINCT(producao.nome) SEPARATOR ", ") producao
            FROM 
                tb_campeonato c
                INNER JOIN tb_atividade_jornada aj ON c.id_campeonato = aj.id_campeonato
                INNER JOIN tb_atividade a ON aj.id_atividade = a.id_atividade
                INNER JOIN tb_jogo j ON aj.id_atividade_jrd = j.id_atividade_jrd
                INNER JOIN tb_clubes_jogos cj ON j.id_jogo = cj.id_jogo
                INNER JOIN tb_clubes cl ON cj.id_clube = cl.id_clubes
                INNER JOIN tb_local l ON j.id_local = l.id_local
                LEFT JOIN tb_func_escala fe_narrador ON fe_narrador.id_jogo = j.id_jogo AND fe_narrador.tipo_funcao = 1
                LEFT JOIN tb_funcionario narrador ON fe_narrador.id_funcionario = narrador.id_funcionario
                LEFT JOIN tb_func_escala fe_ancora ON fe_ancora.id_jogo = j.id_jogo AND fe_ancora.tipo_funcao = 2
                LEFT JOIN tb_funcionario ancora ON fe_ancora.id_funcionario = ancora.id_funcionario
                LEFT JOIN tb_func_escala fe_comentarista ON fe_comentarista.id_jogo = j.id_jogo AND fe_comentarista.tipo_funcao = 3
                LEFT JOIN tb_funcionario comentarista ON fe_comentarista.id_funcionario = comentarista.id_funcionario
                LEFT JOIN tb_func_escala fe_arbitragem ON fe_arbitragem.id_jogo = j.id_jogo AND fe_arbitragem.tipo_funcao = 4
                LEFT JOIN tb_funcionario arbitragem ON fe_arbitragem.id_funcionario = arbitragem.id_funcionario
                LEFT JOIN tb_func_escala fe_numeros ON fe_numeros.id_jogo = j.id_jogo AND fe_numeros.tipo_funcao = 5
                LEFT JOIN tb_funcionario numeros ON fe_numeros.id_funcionario = numeros.id_funcionario
                LEFT JOIN tb_func_escala fe_reporter ON fe_reporter.id_jogo = j.id_jogo AND fe_reporter.tipo_funcao = 6
                LEFT JOIN tb_funcionario reporter ON fe_reporter.id_funcionario = reporter.id_funcionario
                LEFT JOIN tb_func_escala fe_operador ON fe_operador.id_jogo = j.id_jogo AND fe_operador.tipo_funcao = 7
                LEFT JOIN tb_funcionario operador ON fe_operador.id_funcionario = operador.id_funcionario
                LEFT JOIN tb_func_escala fe_producao ON fe_producao.id_jogo = j.id_jogo AND fe_producao.tipo_funcao = 8
                LEFT JOIN tb_funcionario producao ON fe_producao.id_funcionario = producao.id_funcionario
            WHERE 
                a.dt_escala BETWEEN ? AND ?
            GROUP BY DATE_FORMAT(a.dt_escala, "%d/%m/%Y");`, [dt_start, dt_end]);

        const date = await pool.query('SELECT DISTINCT DATE_FORMAT(a.dt_escala, "%d/%m/%Y") AS dt_escala, ' +
            'UPPER(CONCAT(CASE ' +
            'WHEN DAYOFWEEK(a.dt_escala) = 1 THEN "Domingo" ' +
            'WHEN DAYOFWEEK(a.dt_escala) = 2 THEN "Segunda-feira" ' +
            'WHEN DAYOFWEEK(a.dt_escala) = 3 THEN "Terça-feira" ' +
            'WHEN DAYOFWEEK(a.dt_escala) = 4 THEN "Quarta-feira" ' +
            'WHEN DAYOFWEEK(a.dt_escala) = 5 THEN "Quinta-feira" ' +
            'WHEN DAYOFWEEK(a.dt_escala) = 6 THEN "Sexta-feira" ' +
            'WHEN DAYOFWEEK(a.dt_escala) = 7 THEN "Sábado" ' +
            'END, ' +
            '", ",  ' +
            'DATE_FORMAT(a.dt_escala, "%e DE "), ' +
            'CASE ' +
            'WHEN MONTH(a.dt_escala) = 1 THEN "Janeiro" ' +
            'WHEN MONTH(a.dt_escala) = 2 THEN "Fevereiro" ' +
            'WHEN MONTH(a.dt_escala) = 3 THEN "Março" ' +
            'WHEN MONTH(a.dt_escala) = 4 THEN "Abril" ' +
            'WHEN MONTH(a.dt_escala) = 5 THEN "Maio" ' +
            'WHEN MONTH(a.dt_escala) = 6 THEN "Junho" ' +
            'WHEN MONTH(a.dt_escala) = 7 THEN "Julho" ' +
            'WHEN MONTH(a.dt_escala) = 8 THEN "Agosto" ' +
            'WHEN MONTH(a.dt_escala) = 9 THEN "Setembro" ' +
            'WHEN MONTH(a.dt_escala) = 10 THEN "Outubro" ' +
            'WHEN MONTH(a.dt_escala) = 11 THEN "Novembro" ' +
            'WHEN MONTH(a.dt_escala) = 12 THEN "Dezembro" ' +
            'END, ' +
            '" DE ", ' +
            'DATE_FORMAT(a.dt_escala, "%Y"))) AS dt_escala1 ' +
            'FROM tb_atividade a ' +
            'WHERE a.dt_escala BETWEEN ? AND ? AND atv_programa = 1 ' +
            'GROUP BY a.dt_escala ' +
            'ORDER BY DATE_FORMAT(a.dt_escala, "%d/%m/%Y");', [dt_start, dt_end]);

        const informativos = await pool.query(`
                SELECT a.observacaoj,a.atencaoj,a.importantej
                FROM 
                tb_campeonato c
                INNER JOIN tb_atividade_jornada aj ON c.id_campeonato = aj.id_campeonato
                INNER JOIN tb_atividade a ON aj.id_atividade = a.id_atividade
                INNER JOIN tb_jogo j ON aj.id_atividade_jrd = j.id_atividade_jrd
                INNER JOIN tb_clubes_jogos cj ON j.id_jogo = cj.id_jogo
                INNER JOIN tb_clubes cl ON cj.id_clube = cl.id_clubes
                LEFT JOIN tb_local l ON j.id_local = l.id_local
                LEFT JOIN tb_programa pg ON j.seguir = pg.id_programa
                LEFT JOIN tb_func_escala fe_narrador ON fe_narrador.id_jogo = j.id_jogo AND fe_narrador.tipo_funcao = 1
                LEFT JOIN tb_funcionario narrador ON fe_narrador.id_funcionario = narrador.id_funcionario
                LEFT JOIN tb_func_escala fe_ancora ON fe_ancora.id_jogo = j.id_jogo AND fe_ancora.tipo_funcao = 2
                LEFT JOIN tb_funcionario ancora ON fe_ancora.id_funcionario = ancora.id_funcionario
                LEFT JOIN tb_func_escala fe_comentarista ON fe_comentarista.id_jogo = j.id_jogo AND fe_comentarista.tipo_funcao = 3
                LEFT JOIN tb_funcionario comentarista ON fe_comentarista.id_funcionario = comentarista.id_funcionario
                LEFT JOIN tb_func_escala fe_arbitragem ON fe_arbitragem.id_jogo = j.id_jogo AND fe_arbitragem.tipo_funcao = 4
                LEFT JOIN tb_funcionario arbitragem ON fe_arbitragem.id_funcionario = arbitragem.id_funcionario
                LEFT JOIN tb_func_escala fe_numeros ON fe_numeros.id_jogo = j.id_jogo AND fe_numeros.tipo_funcao = 5
                LEFT JOIN tb_funcionario numeros ON fe_numeros.id_funcionario = numeros.id_funcionario
                LEFT JOIN tb_func_escala fe_reporter ON fe_reporter.id_jogo = j.id_jogo AND fe_reporter.tipo_funcao = 6
                LEFT JOIN tb_funcionario reporter ON fe_reporter.id_funcionario = reporter.id_funcionario
                LEFT JOIN tb_func_escala fe_operador ON fe_operador.id_jogo = j.id_jogo AND fe_operador.tipo_funcao = 7
                LEFT JOIN tb_funcionario operador ON fe_operador.id_funcionario = operador.id_funcionario
                LEFT JOIN tb_func_escala fe_producao ON fe_producao.id_jogo = j.id_jogo AND fe_producao.tipo_funcao = 8
                LEFT JOIN tb_funcionario producao ON fe_producao.id_funcionario = producao.id_funcionario
                WHERE 
                    a.dt_escala BETWEEN ? AND ?
                GROUP BY a.observacaoj,a.atencaoj,a.importantej;`, [dt_start, dt_end]);

        const programasJornada = await pool.query(`
            SELECT a.id_atividade, 
            a.dt_escala, 
            a.atv_jornada ,
            ap.id_programa,
            UPPER(p.nome) as nomeprog,
            DATE_FORMAT(ap.hr_inicio, '%Hh%i') AS hr_inicio,
            DATE_FORMAT(ap.hr_final, '%Hh%i') AS hr_final,
            CASE
                WHEN GROUP_CONCAT(DISTINCT ap.local_programa SEPARATOR ", ") IS NULL
                OR GROUP_CONCAT(DISTINCT ap.local_programa SEPARATOR ", ") = '' THEN ''
                ELSE CONCAT('(',GROUP_CONCAT(DISTINCT ap.local_programa SEPARATOR ", "),')')
            END AS local_programa,
            fe.tipo_funcao,
            GROUP_CONCAT(CASE WHEN fe.tipo_funcao = 13 THEN f.nome END SEPARATOR '; ') AS apresentacao,
            GROUP_CONCAT(CASE WHEN fe.tipo_funcao = 14 THEN f.nome END SEPARATOR '; ') AS comentarios,
            GROUP_CONCAT(CASE WHEN fe.tipo_funcao = 15 THEN f.nome END SEPARATOR '; ') AS producao
            FROM tb_atividade a
            INNER JOIN tb_atividade_programa ap ON (a.id_atividade = ap.id_atividade)
            INNER JOIN tb_programa p ON (p.id_programa = ap.id_programa)
            LEFT JOIN tb_func_escala fe ON ( fe.id_atividade_prog = ap.id_atividade_prog)
            INNER JOIN tb_funcionario f ON (f.id_funcionario = fe.id_funcionario)
            WHERE atv_jornada = 1 AND hr_final < '16:00' AND a.dt_escala BETWEEN ? AND ?
            GROUP BY a.id_atividade,a.dt_escala,a.atv_jornada,ap.id_programa,nomeprog,hr_inicio,hr_final,ap.local_programa
            ORDER BY hr_inicio, hr_final;`, [dt_start, dt_end]);

        const programasJornadan = await pool.query(`
                SELECT a.id_atividade, 
                a.dt_escala, 
                a.atv_jornada ,
                ap.id_programa,
                UPPER(p.nome) as nomeprog,
                DATE_FORMAT(ap.hr_inicio, '%Hh%i') AS hr_inicio,
                DATE_FORMAT(ap.hr_final, '%Hh%i') AS hr_final,
                CASE
                    WHEN GROUP_CONCAT(DISTINCT ap.local_programa SEPARATOR ", ") IS NULL
                    OR GROUP_CONCAT(DISTINCT ap.local_programa SEPARATOR ", ") = '' THEN ''
                    ELSE CONCAT('(',GROUP_CONCAT(DISTINCT ap.local_programa SEPARATOR ", "),')')
                END AS local_programa,
                fe.tipo_funcao,
                GROUP_CONCAT(CASE WHEN fe.tipo_funcao = 13 THEN f.nome END SEPARATOR '; ') AS apresentacao,
                GROUP_CONCAT(CASE WHEN fe.tipo_funcao = 14 THEN f.nome END SEPARATOR '; ') AS comentarios,
                GROUP_CONCAT(CASE WHEN fe.tipo_funcao = 15 THEN f.nome END SEPARATOR '; ') AS producao
                FROM tb_atividade a
                INNER JOIN tb_atividade_programa ap ON (a.id_atividade = ap.id_atividade)
                INNER JOIN tb_programa p ON (p.id_programa = ap.id_programa)
                LEFT JOIN tb_func_escala fe ON ( fe.id_atividade_prog = ap.id_atividade_prog)
                INNER JOIN tb_funcionario f ON (f.id_funcionario = fe.id_funcionario)
                WHERE atv_jornada = 1 AND hr_final >= '16:00' AND a.dt_escala BETWEEN ? AND ?
                GROUP BY a.id_atividade,a.dt_escala,a.atv_jornada,ap.id_programa,nomeprog,hr_inicio,hr_final,ap.local_programa
                ORDER BY hr_inicio, hr_final;`, [dt_start, dt_end]);

        res.render('links/consultas/consulta_semanal_jogos', { date, escala, fixos, informativos, programasJornada, programasJornadan });
    };

    async semanalPost(req, res) {
        let { layoutpdf } = req.body;

        console.log(layoutpdf)

        // Gera uma nova página HTML
        const browser = await puppeteer.launch({ headless: 'new', args: ['--allow-file-access-from-files', '--enable-local-file-accesses'] });
        const page = await browser.newPage();
        await page.setContent(layoutpdf);

        // Transforma a nova página em PDF com margens ajustadas
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {                
                right: '2mm',  // Margem direita
                left: '2mm'    // Margem esquerda
            }
        })

        await browser.close();

        // Envia o PDF ao client-side
        res.contentType('application/pdf')
        res.send(pdfBuffer);
    };

    async jogosPost(req, res) {
        let { layoutpdf } = req.body;

        console.log(layoutpdf);

        try {
            // Gera uma nova página HTML
            const browser = await puppeteer.launch({
                headless: 'new',
                args: ['--allow-file-access-from-files', '--enable-local-file-accesses'],
                timeout: 60000 // Aumentar o tempo limite para 60 segundos
            });

            const page = await browser.newPage();
            page.setDefaultNavigationTimeout(0); // Desativa o tempo limite de navegação

            // Adiciona handlers de erro para debugging
            page.on('error', (err) => {
                console.error('Page error:', err);
            });

            page.on('pageerror', (err) => {
                console.error('Page error:', err);
            });

            page.on('requestfailed', (req) => {
                console.error('Request failed:', req.url());
            });

            // Espera até que a rede esteja ociosa antes de continuar
            await page.setContent(layoutpdf, { waitUntil: 'networkidle0' });

            // Captura screenshots para debugging
            await page.screenshot({ path: 'debug-step1.png' });
            await page.waitForTimeout(10000); // Espera 10 segundos
            await page.screenshot({ path: 'debug-step2.png' });

            // Transforma a nova página em PDF
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true
            });

            await browser.close();

            // Envia o PDF ao client-side
            res.contentType('application/pdf');
            res.send(pdfBuffer);
        } catch (error) {
            console.error('Error generating PDF:', error);
            res.status(500).send('Error generating PDF');
        }
    };
};

module.exports = new detalhesColaboradores();