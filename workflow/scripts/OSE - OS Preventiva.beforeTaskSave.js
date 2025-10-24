function beforeTaskSave(colleagueId,nextSequenceId,userList) {
	var temacesso = true;
	var login = fluigAPI.getUserService().getCurrent().getLogin();
	var primeiraLetra = login.substring(0, 1).toUpperCase();
	var restoDaString = login.slice(1);
	var codusuario = primeiraLetra + restoDaString;
	
	var dataset = DatasetFactory.getDataset("ds_OSE_Valida_Acessos", null, [DatasetFactory.createConstraint("CODUSUARIO", codusuario, codusuario, ConstraintType.MUST)], null);
	
	for (var i = 0; i < dataset.rowsCount; i++) {
        if (dataset.getValue(i, "TEMACESSO") == 'FALSE') {temacesso = false};
    }
	
	if (getValue("WKNumState") == "12" && (getValue("WKNextState") == "16" || getValue("WKNextState") == "18")) {
		if (temacesso){criacaoOSPreventiva(codusuario)} else {throw "\n\nVocê não tem todos os acessos para proseguir com o processo!\n\n"}
	}
	
	if (getValue("WKNumState") == "18" && getValue("WKNextState") == "13") {
		//	Conforme alinhado com Jeferson Oliveira em 17/10/2025, para evitar erros de antecipação de OS Preventiva,
		//	realizaremos o lançamento do horímetro antes do encerramento da OS
		if (temacesso){lancamentoHorimetro(codusuario)} else {throw "\n\nVocê não tem todos os acessos para proseguir com o processo!\n\n"}
	}
	
}
function criacaoOSPreventiva(codusuario) {
    var nomeDataserver = "MOVMOVIMENTOTBCDATA";
	var user = DatasetFactory.getDataset("ds_connector", null, null, null);
	var usuario = user.getValue(0, "INTEGRADOR");
	var senha = user.getValue(0, "SENHA");
	var email = user.getValue(0, "EMAIL");
	var authService = getWebService(usuario, senha);
	
	var contexto = "codcoligada=1;codusuario="+ codusuario +";codsistema=N";

	//Criação do XML para envio
    var xml = "" + 
        "<MovMovimento>\
			<TMOV>\
				<CODCOLIGADA>1</CODCOLIGADA>\
				<IDMOV>-1</IDMOV>\
				<CODFILIAL>"+ hAPI.getCardValue("CODFILIAL") +"</CODFILIAL>\
				<CODTMV>1.1.22</CODTMV>\
				<CODLOC>"+ hAPI.getCardValue("CODLOCALESTOQUE").trim() +"</CODLOC>\
				<CODCCUSTO>"+ hAPI.getCardValue("CODCENTRODECUSTO") +"</CODCCUSTO>\
				<CODDEPARTAMENTO>"+ hAPI.getCardValue("CODDEPARTAMENTO") +"</CODDEPARTAMENTO>\
				<CODTB1FAT>02</CODTB1FAT>\
				<CODTB3FAT>05</CODTB3FAT>\
				<HISTORICOLONGO> </HISTORICOLONGO>\
				<CODAGENDAMENTO>"+ hAPI.getCardValue("IDPLANO") +"</CODAGENDAMENTO>\
				<IDOBJOF>"+ hAPI.getCardValue("OBJETODEMANUTENCAO") +"</IDOBJOF>\
				<CAMPOLIVRE3>"+ hAPI.getCardValue("HORIMETROVENCIMENTO") +"</CAMPOLIVRE3>\
			</TMOV>";

    var NSEQITMMOV = 1;
    var indexes = hAPI.getChildrenIndexes("TABELA_PLANOMANUTENCAO");

    for (var i = 1; i <= indexes.length; ++i) {
        hAPI.setCardValue("PLANOMANNSEQITEM___"+ i, NSEQITMMOV);
        xml = xml  + "" + 
			"<TITMMOV>\
				<CODCOLIGADA>1</CODCOLIGADA>\
				<IDMOV>-1</IDMOV>\
				<NSEQITMMOV>"+ NSEQITMMOV +"</NSEQITMMOV>\
				<CODCCUSTO>"+ hAPI.getCardValue("CODCENTRODECUSTO") +"</CODCCUSTO>\
				<CODDEPARTAMENTO>"+ hAPI.getCardValue("CODDEPARTAMENTO") +"</CODDEPARTAMENTO>\
				<IDPRD>"+ hAPI.getCardValue("PLANOMANIDPRD___"+ i) +"</IDPRD>\
				<QUANTIDADE>"+ hAPI.getCardValue("PLANOMANQUANTIDADE___"+ i).replace(".", ",") +"</QUANTIDADE>\
				<PRECOUNITARIO>"+ hAPI.getCardValue("PLANOMANPRECOUNITARIO___"+ i).replace(".", ",") +"</PRECOUNITARIO>\
				<CODTB2FAT>12</CODTB2FAT>\
				<CODTB3FAT>05</CODTB3FAT>\
				<IDOBJOFICINA>"+ hAPI.getCardValue("OBJETODEMANUTENCAO") +"</IDOBJOFICINA>\
				<IDTIPOOBJ>"+ hAPI.getCardValue("CODTIPOOBJ") +"</IDTIPOOBJ>\
			</TITMMOV>";

        NSEQITMMOV++;
    }

    xml = xml + "</MovMovimento>";

    log.error("XML de criação da OS: ");
    log.error(xml);

    var result = new String(authService.saveRecord(nomeDataserver, xml, contexto));

    if (result.split(";")[0] == "1") {
        hAPI.setCardValue("OSIDMOV", result.split(";")[1]);

        //	Alteração do status da OS de "Normal" para "Aguardando análise" e inclusão do Número da SL
        var xml = "" + 
			"<MovMovimento>\
				<TMOV>\
					<CODCOLIGADA>1</CODCOLIGADA>\
					<IDMOV>"+ result.split(";")[1] +"</IDMOV>\
					<STATUS>O</STATUS>\
				</TMOV>\
				<TMOVCOMPL>\
					<CODCOLIGADA>1</CODCOLIGADA>\
					<IDMOV>"+ result.split(";")[1] +"</IDMOV>\
					<NFLUIG>"+ getValue("WKNumProces").toString() +"</NFLUIG>\
            	</TMOVCOMPL>\
        	</MovMovimento>";

		log.info("XML de alteração da OS: ");
		log.info(xml);

        var result = new String(authService.saveRecord(nomeDataserver, xml, contexto));
       
        if (result.split(";")[0] != "1") {
            throw "ERRO AO PREENCHER O STATUS CORRETO DA OS\n\n"+ result.split("=")[0] +"\n\n"
        }

        try {
            var dataset = DatasetFactory.getDataset("ds_OSE_Numero_OS", null, [DatasetFactory.createConstraint("IDMOV", result.split(";")[1], result.split(";")[1], ConstraintType.MUST)], null);
            hAPI.setCardValue("OSNUMEROMOV", dataset.getValue(0, "NUMEROMOV"));
        } catch (e) {
            throw "ERRO AO CONSULTAR O NÚMERO DA OS:\n\n"+ result.split("=")[0] +"\n\n"
        }
    } else {
        throw "ERRO AO CRIAR A OS:\n\n"+ result.split("=")[0] +"\n\n"
    }
}

function lancamentoHorimetro(codusuario) {
	var nomeDataserver = "MOVMOVIMENTOTBCDATA";
	var user = DatasetFactory.getDataset("ds_connector", null, null, null);
	var usuario = user.getValue(0, "INTEGRADOR");
	var senha = user.getValue(0, "SENHA");
	var email = user.getValue(0, "EMAIL");
	var authService = getWebService(usuario, senha);
	
	var contexto = "codcoligada=1;codusuario="+ codusuario +";codsistema=O";
	
	var regex = /^(TDE|TCM|TTP|TPE|TPA|TRB|TEH|TPC|TRE|TMH|TPH|TDV|TTT|LCM|LCR|LDE|LDV|LEH|LMN|LMP|LOB|LPC|LPE|LPG|LRC|LRE|LTE).*/;
	
	if (regex.test(hAPI.getCardValue("OBJETODEMANUTENCAO"))) {
		var nomeDataserver = "MntHistIndicadorData";

		var dataAtual = new Date();
		var ano = dataAtual.getFullYear();
		var mes = (dataAtual.getMonth() + 1) < 10 ? "0"+(dataAtual.getMonth() + 1) : (dataAtual.getMonth() + 1); // Os meses são indexados a partir de 0
		var dia = (dataAtual.getDate()) < 10 ? "0"+(dataAtual.getDate()) : (dataAtual.getDate());
		var horas = (dataAtual.getHours()) < 10 ? "0"+(dataAtual.getHours()) : (dataAtual.getHours());
		var minutos = (dataAtual.getMinutes()) < 10 ? "0"+(dataAtual.getMinutes()) : (dataAtual.getMinutes());
		var segundos = (dataAtual.getSeconds()) < 10 ? "0"+(dataAtual.getSeconds()) : (dataAtual.getSeconds());		
		var dataFormatada = ano+"-"+mes+"-"+dia+"T"+horas+":"+minutos+":"+segundos
				
		var dataColeta = hAPI.getCardValue("DATACOLETA").split(" ")[0]
		dataColeta = new Date(dataColeta.split("-")[0], dataColeta.split("-")[1]-1, dataColeta.split("-")[2]);
		log.error("DataColeta: "+  dataColeta);
		log.error("DataAtual: "+  new Date(ano, mes-1, dia));

		try {
			var c1_2 = DatasetFactory.createConstraint("IDOBJOF", hAPI.getCardValue("OBJETODEMANUTENCAO"), hAPI.getCardValue("OBJETODEMANUTENCAO"), ConstraintType.MUST);
			var constraints_2 = new Array(c1_2);
			var dataset_2 = DatasetFactory.getDataset("ds_OSE_HistoricoIndicadorDeUso", null, constraints_2, null);
			var horimetroAtual = dataset_2.getValue(0, "VALORMEDIDOR1");
			var horimetroAcumulado = dataset_2.getValue(0, "VALORACUMULADO1");
			var combustivelAtual = dataset_2.getValue(0, "VALORMEDIDOR5") == "null" ? 0 : dataset_2.getValue(0, "VALORMEDIDOR5");
			var combustivelAcumulado = dataset_2.getValue(0, "VALORACUMULADO5") == "null" ? 0 : dataset_2.getValue(0, "VALORACUMULADO5");
			var dataLancamento = dataset_2.getValue(0, "DATALANCAMENTO").split(" ")[0];
			var ultimoHistIndicador = dataset_2.getValue(0, "IDHISTINDICADOR");
		} catch(e) {
			log.error(e);
		}
		
		if (parseFloat(horimetroAtual) < parseFloat(hAPI.getCardValue("HORIMETROMEDIDOR"))) {
			horimetroAcumulado = parseFloat(horimetroAcumulado) + (parseFloat(hAPI.getCardValue("HORIMETROMEDIDOR")) - parseFloat(horimetroAtual));
		}
		if (parseFloat(combustivelAtual) < parseFloat(hAPI.getCardValue("VALORMEDIDOR5"))) {
			combustivelAcumulado = parseFloat(combustivelAcumulado) + (parseFloat(hAPI.getCardValue("VALORMEDIDOR5")) - parseFloat(combustivelAtual));
		}
		
		if ((new Date(ano, mes-1, dia).toISOString().split('T')[0] > dataLancamento) ||
				(dataLancamento == dataColeta.toISOString().split('T')[0] &&
						String(hAPI.getCardValue("HORIMETROMEDIDOR")).replace(".", ",") != horimetroAtual.replace(".", ","))) {

			var xml = "<NewDataSet>\
				<OFHistIndicador>\
					<CODCOLIGADA>1</CODCOLIGADA>\
					<IDOBJOF>"+ hAPI.getCardValue("OBJETODEMANUTENCAO") +"</IDOBJOF>\
					<IDHISTINDICADOR>-1</IDHISTINDICADOR>\
					<DATACOLETA>"+ dataFormatada +"</DATACOLETA>\
					<CODUSUARIO>"+ codusuario +"</CODUSUARIO>\
					<VALORMEDIDOR1>"+ hAPI.getCardValue("HORIMETROMEDIDOR").replace(".", ",") +"</VALORMEDIDOR1>\
					<VALORACUMULADO1>"+ String(horimetroAcumulado).replace(".", ",") +"</VALORACUMULADO1>";
					
					if (hAPI.getCardValue("USAINDICADORUSO5") == "1") {
						xml = xml + "" +
							"<VALORMEDIDOR5>"+ String(hAPI.getCardValue("VALORMEDIDOR5")).replace(".", ",") +"</VALORMEDIDOR5>\
							<VALORACUMULADO5>"+ String(combustivelAcumulado).replace(".", ",") +"</VALORACUMULADO5>";
					}
					
					xml = xml + "</OFHistIndicador>\
						</NewDataSet>";
						
			var result = new String(authService.saveRecord(nomeDataserver, xml, contexto));
			
			if (result.split(";")[1] != hAPI.getCardValue("OBJETODEMANUTENCAO")) {
				throw "ERRO AO LANÇAR O HORÍMETRO DA MÁQUINA\n\n"+result.split("=")[0]+"\n\n"
			}
			
			log.info("O horímetro foi lançado no IDHISTINDICADOR: "+ result.split(";")[2]);
			
			ultimoHistIndicador = result.split(";")[2];
		} else {
			log.error("O horímetro da máquina não foi lançado");
			log.error("=======================================================");
			log.error("new Date: "+new Date(ano, mes-1, dia).toISOString().split('T')[0]);
			log.error("dataLancamento: "+dataLancamento);
			log.error("datacoleta: "+dataColeta.toISOString().split('T')[0]);
			log.error("horimetroAtual: "+horimetroAtual.replace(".", ","));
			log.error("=======================================================");
		}

		finalizacaoOSPreventiva(codusuario, ultimoHistIndicador);
	}
}

function finalizacaoOSPreventiva(codusuario, ultimoHistIndicador) {
	var nomeDataserver = "MOVMOVIMENTOTBCDATA";
	var user = DatasetFactory.getDataset("ds_connector", null, null, null);
	var usuario = user.getValue(0, "INTEGRADOR");
	var senha = user.getValue(0, "SENHA");
	var email = user.getValue(0, "EMAIL");
	var authService = getWebService(usuario, senha);

	var contexto = "codcoligada=1;codusuario="+ codusuario +";codsistema=N";
	
	var dataAtual = new Date();
	var ano = dataAtual.getFullYear();
	var mes = (dataAtual.getMonth() + 1) < 10 ? "0"+(dataAtual.getMonth() + 1) : (dataAtual.getMonth() + 1); // Os meses são indexados a partir de 0
	var dia = (dataAtual.getDate()) < 10 ? "0"+(dataAtual.getDate()) : (dataAtual.getDate());
	var horas = (dataAtual.getHours()) < 10 ? "0"+(dataAtual.getHours()) : (dataAtual.getHours());
	var minutos = (dataAtual.getMinutes()) < 10 ? "0"+(dataAtual.getMinutes()) : (dataAtual.getMinutes());
	var segundos = (dataAtual.getSeconds()) < 10 ? "0"+(dataAtual.getSeconds()) : (dataAtual.getSeconds());
	var dataFormatada = ano+"-"+mes+"-"+dia+"T"+horas+":"+minutos+":"+segundos
	
	var historicoLongo = String(hAPI.getCardValue("SERVICOASEREXECUTADO")).replace(/\r?\n/g, '\n') + '\n' + String(hAPI.getCardValue("SOLUCAO")).replace(/\r?\n/g, '\n');
	
	//	Criação do XML para encerramento da OS
	var xml = "<MovMovimento>\
		<TMOV>\
			<CODCOLIGADA>1</CODCOLIGADA>\
			<IDMOV>"+ hAPI.getCardValue("OSIDMOV") +"</IDMOV>\
			<STATUS>Z</STATUS>\
			<DATAEXTRA1>"+ dataFormatada +"</DATAEXTRA1>\
			<DATAEXTRA2>"+ dataFormatada +"</DATAEXTRA2>\
			<HISTORICOLONGO>"+ historicoLongo +"</HISTORICOLONGO>\
		</TMOV>\
		<TMOVCOMPL>\
			<CODCOLIGADA>1</CODCOLIGADA>\
			<IDMOV>"+ hAPI.getCardValue("OSIDMOV") +"</IDMOV>\
			<ATUALIZACAO2>"+ dataFormatada +"</ATUALIZACAO2>\
		</TMOVCOMPL>";

	var NSEQITMMOV = 1;
	var indexes = hAPI.getChildrenIndexes("TABELA_PLANOMANUTENCAO");

	for (var i = 0; i < indexes.length; ++i) {
		var status = hAPI.getCardValue("PLANOMANSTATUS___"+  indexes[i]);
		var stts = '';
		
		if (status == "OK") {stts = "01";} else {stts = "02";}
		
		xml = xml  + "" + 
			"<TITMMOVCOMPL>\
				<CODCOLIGADA>1</CODCOLIGADA>\
				<IDMOV>"+ hAPI.getCardValue("OSIDMOV") +"</IDMOV>\
				<NSEQITMMOV>"+ NSEQITMMOV +"</NSEQITMMOV>\
				<PREV_CNC>"+ stts +"</PREV_CNC>\
			</TITMMOVCOMPL>"

		NSEQITMMOV++;
	}
 	
	xml = xml + "" +
			"<OFORDEMSERVICO>\
				<CODCOLIGADA>1</CODCOLIGADA>\
				<IDMOV>"+ hAPI.getCardValue("OSIDMOV") +"</IDMOV>\
				<IDHISTINDICADOR>"+ ultimoHistIndicador +"</IDHISTINDICADOR>\
			</OFORDEMSERVICO>\
		</MovMovimento>";
			
	log.error("XML para encerramento da OS: ")
	log.error(xml)
			
	var result = new String(authService.saveRecord(nomeDataserver, xml, contexto));

	if (result != ("1;"+ hAPI.getCardValue("OSIDMOV"))) {
		throw "ERRO AO FINALIZAR OS:\n\n"+result.split("=")[0]+"\n\n"
	}
}
function getWebService(usuario, senha) {
	var nomeServico = "wsDataServer";
	var caminhoServico = "com.totvs.WsDataServer";
	var dataServerService = ServiceManager.getServiceInstance(nomeServico);
	var locator = dataServerService.instantiate(caminhoServico);
	var service = locator.getRMIwsDataServer();
	var serviceHelper = dataServerService.getBean();
	var authService = serviceHelper.getBasicAuthenticatedClient(service, "com.totvs.IwsDataServer", usuario, senha);

	if (dataServerService == null) {throw "Erro ao encontrar serviço!";}
	if (locator == null) {throw "Erro ao instanciar serviço!";}
	if (service == null) {throw "Erro de instância incorreta ou com problemas!";}
	if (serviceHelper == null) {throw "Erro no serviço de autenticação!";}
	if (authService == null) {throw "Erro ao autenticar DataServer!";}
	
	return authService;
}