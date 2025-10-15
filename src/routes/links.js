const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../lib/auth');

//sistema headcount uptade (02/05)
const TaskContrato = require('../controllers/participante/cadastros/contrato');
const TaskLocalizacao = require('../controllers/participante/cadastros/localizacao');
const TaskDiretoria = require('../controllers/participante/cadastros/diretoria');
const TaskGerencia = require('../controllers/participante/cadastros/gerencia');
const TaskCoordenaca = require('../controllers/participante/cadastros/coordenacao');
const TaskSecao = require('../controllers/participante/cadastros/secao');
const TaskArea = require('../controllers/participante/cadastros/area');
const TaskCargo = require('../controllers/participante/cadastros/cargo');
const TaskColaborador = require('../controllers/participante/cadastros/colaborador');
const TaskHistorico = require('../controllers/gestor/editar/historico');
const listaColaboradoes = require('../controllers/gestor/consultas/colaboradores');
const editarColaboradores = require('../controllers/gestor/editar/colaboradores');
const listaDiretorias = require('../controllers/gestor/consultas/diretorias');
const cadastroEvento = require('../controllers/gestor/cadastros/evento');
const cadastroSetor = require('../controllers/gestor/cadastros/setor');
const cadastroPrograma = require('../controllers/gestor/cadastros/programa');
const cadastroOrigem = require('../controllers/gestor/cadastros/origem');
const cadastroFuncionario = require('../controllers/gestor/cadastros/funcionario');
const gerarRelatorio = require('../controllers/gestor/cadastros/relatorio');
const cadastroPlanejamento  = require('../controllers/gestor/cadastros/planejamento');

const consolidadoDiretoriaContrato = require('../controllers/gestor/editar/diretoria_tipo_contrato');
const consolidadoDiretoriaLocalizacao = require('../controllers/gestor/editar/diretoria_localizacao');
const { cadastroProgramaGet } = require('../controllers/gestor/cadastros/programa');

// Gerar Relatório
router.get('/consultas/consulta_relatorio', isLoggedIn, gerarRelatorio.consultaRelatorioGet);
router.get('/consultas/gerarRelatorio/:id', isLoggedIn, gerarRelatorio.gerarRelatorioGet);
router.post('/consultas/gerarPdfEvento', isLoggedIn, gerarRelatorio.gerarPdfEvento);
router.get('/consultas/consulta_finalizados', isLoggedIn, gerarRelatorio.consultaFinalizadosGet);

// Cadastrar Planejamento
router.get('/consultas/lista_eventos', isLoggedIn, cadastroPlanejamento.escolheEventoGet);
router.get('/cadastros/cadastro_planejamento/:id', isLoggedIn, cadastroPlanejamento.cadastroPlanejamentoGet);
router.get('/cadastros/cadastro_planejamento_ADM/:id', isLoggedIn, cadastroPlanejamento.cadastroPlanejamentoADM);
router.post('/cadastros/cadastroPlanejamentoPost/:id', isLoggedIn, cadastroPlanejamento.cadastroPlanejamentoPost);
router.post('/cadastros/cadastroPlanejamentoADMPost/:id', isLoggedIn, cadastroPlanejamento.cadastroPlanejamentoADMPost);
router.get('/consultas/consulta_planejamento', isLoggedIn, cadastroPlanejamento.consultarPlanejamento);
router.get('/editar/editar_planejamento/:id', isLoggedIn, cadastroPlanejamento.editarPlanejamentoGet);
router.get('/editar/editar_planejamento_ADM/:id', isLoggedIn, cadastroPlanejamento.editarPlanejamentoADMGet);
router.post('/editar/editarPlanejamentoPost/:id', isLoggedIn, cadastroPlanejamento.editarPlanejamentoPost);
router.post('/editar/editarPlanejamentoADMPost/:id', isLoggedIn, cadastroPlanejamento.editarPlanejamentoADMPost);
router.post('/editar/excluirPlanejamentos/:id', isLoggedIn, cadastroPlanejamento.excluirPlanejamentos)
router.post('/editar/excluirPlanejamentosADM/:id', isLoggedIn, cadastroPlanejamento.excluirPlanejamentosADM)

// Cadastrar Evento
router.get('/cadastros/cadastro_evento', isLoggedIn, cadastroEvento.cadastroEventoGet);
router.post('/cadastros/cadastro_evento', isLoggedIn, cadastroEvento.cadastroEventoPost);
router.get('/consultas/consulta_eventosIncompletos', isLoggedIn, cadastroEvento.consultarEventosIncGet);
router.get('/cadastros/cadastro_copiados/:id', isLoggedIn, cadastroEvento.cadastrarEmailGet);
router.post('/cadastros/cadastrarEmailPost', isLoggedIn, cadastroEvento.cadastrarEmailPost);
router.get('/editar/editar_eventosIncompletos', isLoggedIn, cadastroEvento.editarEventosIncGet);
router.get('/editar/editar_eventos/:id', isLoggedIn, cadastroEvento.editarEventoGet);
router.post('/editar/editarEventoPost/:id', isLoggedIn, cadastroEvento.editarEventoPost);
router.post('/editar/iniciarPlanejamento/:id', isLoggedIn, cadastroEvento.iniciarPlanejamento);
router.post('/editar/excluirEvento/:id', isLoggedIn, cadastroEvento.excluirEvento);


// Cadastrar Setor
router.get('/cadastros/cadastro_setor', isLoggedIn, cadastroSetor.cadastroSetorGet);
router.post('/cadastros/cadastro_setor', isLoggedIn, cadastroSetor.cadastroSetorPost);
router.get('/consultas/consulta_setor', isLoggedIn, cadastroSetor.consultaSetor);
router.get('/editar/editar_setor/:id', isLoggedIn, cadastroSetor.editarSetorGet);
router.post('/editar/editar_setor/:id', isLoggedIn, cadastroSetor.editarSetorPost);
router.get('/editar/excluir_setor/:id', isLoggedIn, cadastroSetor.excluirSetor);

// Cadastrar Programa
router.get('/cadastros/cadastro_programa', isLoggedIn, cadastroPrograma.cadastroProgramaGet);
router.post('/cadastros/cadastro_programa', isLoggedIn, cadastroPrograma.cadastroProgramaPost);
router.get('/consultas/consulta_programa', isLoggedIn, cadastroPrograma.consultaPrograma);
router.get('/editar/editar_programa/:id', isLoggedIn, cadastroPrograma.editarProgramaGet);
router.post('/editar/editar_programa/:id', isLoggedIn, cadastroPrograma.editarProgramaPost);
router.get('/editar/excluir_programa/:id', isLoggedIn, cadastroPrograma.excluirPrograma);

// Cadastrar Origem
router.get('/cadastros/cadastro_origem', isLoggedIn, cadastroOrigem.cadastroOrigemGet);
router.post('/cadastros/cadastro_origem', isLoggedIn, cadastroOrigem.cadastroOrigemPost);
router.get('/consultas/consulta_origem', isLoggedIn, cadastroOrigem.consultaOrigem);
router.get('/editar/editar_origem/:id', isLoggedIn, cadastroOrigem.editarOrigemGet);
router.post('/editar/editar_origem/:id', isLoggedIn, cadastroOrigem.editarOrigemPost);
router.get('/editar/excluir_origem/:id', isLoggedIn, cadastroOrigem.excluirOrigem);

// Cadastro Funcionario
router.get('/cadastros/cadastro_funcionario', isLoggedIn, cadastroFuncionario.cadastroFuncionarioGet);
router.post('/cadastros/cadastro_funcionario', isLoggedIn, cadastroFuncionario.cadastroFuncionarioPost);
router.get('/consultas/consulta_funcionario', isLoggedIn, cadastroFuncionario.consultaFuncionario);
router.get('/editar/editar_funcionario/:id', isLoggedIn, cadastroFuncionario.editarFuncionarioGet);
router.post('/editar/editar_funcionario/:id', isLoggedIn, cadastroFuncionario.editarFuncionarioPost);
router.get('/editar/excluir_funcionario/:id', isLoggedIn, cadastroFuncionario.excluirFuncionario);


// Cadastrar Gestor/contratos
router.get('/cadastros/cadastro_contrato', isLoggedIn, TaskContrato.cadastroContratoGet);
router.post('/cadastros/cadastro_contrato', isLoggedIn, TaskContrato.cadastroContratoPost);

// Cadastrar Gestor/localizacao
router.get('/cadastros/cadastro_localizacao', isLoggedIn, TaskLocalizacao.cadastroLocalizacaoGet);
router.post('/cadastros/cadastro_localizacao', isLoggedIn, TaskLocalizacao.cadastroLocalizacaoPost);

// Cadastrar Gestor/diretoria
router.get('/cadastros/cadastro_diretoria', isLoggedIn, TaskDiretoria.cadastroDiretoriaGet);
router.post('/cadastros/cadastro_diretoria', isLoggedIn, TaskDiretoria.cadastroDiretoriaPost);

// Cadastrar Gestor/gerencia
router.get('/cadastros/cadastro_gerencia', isLoggedIn, TaskGerencia.cadastroGerenciaGet);
router.post('/cadastros/cadastro_gerencia', isLoggedIn, TaskGerencia.cadastroGerenciaPost);

// Cadastrar Gestor/coordenacao
router.get('/cadastros/cadastro_coordenacao', isLoggedIn, TaskCoordenaca.cadastroCoordenacaGet);
router.post('/cadastros/cadastro_coordenacao', isLoggedIn, TaskCoordenaca.cadastroCoordenacaPost);

// Cadastrar Gestor/secão
router.get('/cadastros/cadastro_secao', isLoggedIn, TaskSecao.cadastroSecaoaGet);
router.post('/cadastros/cadastro_secao', isLoggedIn, TaskSecao.cadastroSecaoaPost);

// Cadastrar Gestor/area
router.get('/cadastros/cadastro_area', isLoggedIn, TaskArea.cadastroAreaGet);
router.post('/cadastros/cadastro_area', isLoggedIn, TaskArea.cadastroAreaPost);

// Cadastrar Gestor/cargo
router.get('/cadastros/cadastro_cargo', isLoggedIn, TaskCargo.cadastroCargoGet);
router.post('/cadastros/cadastro_cargo', isLoggedIn, TaskCargo.cadastroCargoPost);

// Cadastrar Gestor/colaborador
router.get('/cadastros/cadastro_colaborador', isLoggedIn, TaskColaborador.cadastroColaboradorGet);
router.post('/cadastros/cadastro_colaborador', isLoggedIn, TaskColaborador.cadastroColaboradorPost);

// Editar Gestor/historico
router.get('/editar/historico_colaborador', isLoggedIn, TaskHistorico.EditarColaboradorGet);
router.post('/editar/historico_colaborador', isLoggedIn, TaskHistorico.EditarColaboradorPost);

//Listar Colaboradores Disponíveis
router.get('/consultas/colaboradores', isLoggedIn, listaColaboradoes.dadosColaboradoresGet);

//atualizar dados colaborador
router.get('/consultas/atualizar_colaboradores/:evtId', isLoggedIn, editarColaboradores.listaColaboradoresGet);
router.post('/consultas/acompanhamento', isLoggedIn, editarColaboradores.listaColaboradoresPost);

//CONSOLIDADOS
//VISÂO CONSOLIDADO DIRETORIA
//Listar Visão Consolidado Diretorias
router.get('/consultas/diretorias', isLoggedIn, listaDiretorias.dadosDiretoriasGet);

//listar tipos de contrato - Visão Consolidado Diretorias
router.get('/consultas/tipo_contrato/:evtId', isLoggedIn, consolidadoDiretoriaContrato.listaContratosGet);

//listar localizacao - Visão Consolidado Diretorias
router.get('/consultas/localizacao/:evtId', isLoggedIn, consolidadoDiretoriaLocalizacao.listaLocalizacaoGet);

//Listar Eventos PDF
router.get('/consultas/lista_saida', isLoggedIn, cadastroEvento.eventosPDF);

module.exports = router;