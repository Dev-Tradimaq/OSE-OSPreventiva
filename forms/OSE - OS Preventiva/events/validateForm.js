function validateForm(form){
	var numState = getValue("WKNumState");
	var nextState = getValue("WKNextState");

	if (numState == "0" || numState == "12") {
		if (form.getValue("OBJETODEMANUTENCAO") == "") {
			throw "É obrigatório preencher o Objeto de Manutenção!"
		}
		if (form.getValue("LOCALESTOQUE") == "") {
			throw "É obrigatório preencher o Local de Estoque!"
		}
		if (form.getValue("PLANODEMANUTENCAO") == "") {
			throw "É obrigatório selecionar o Plano de Manutenção!"
		}
		
		if (nextState == "39") {
			var indexes = form.getChildrenIndexes("TABELA_PLANOMANUTENCAO");
			for (var i = 0; i < indexes.length; i++) {
				if (form.getValue("PLANOMANATIVIDADE___" + indexes[i]).substring(0, 2) != "1.") {
					throw "Este plano de manutenção possui peças. Devido a isso, você não pode enviar direto para a Execução do Serviço!"
				}
		    }
		}
	}
	
	if (numState == "16") {
		if (form.getValue("PREVISAOEXECUCAOSERVICO") == "") {
			throw "É obrigatório preencher a Previsão Execução Serviço Programado!"
		}
		if (form.getValue("FOLLOWUP") == "") {
			throw "É obrigatório preencher o campo de Follow up!"
		}
		
		if (nextState == "18") {
			validacaoRMRSPendente(form);
		}
	}
	
	if (numState == "18" && nextState == "13"){
		if (form.getValue("HORIMETROMEDIDOR") == "") {
			throw "É obrigatorio preencher o horímetro atual do equipamento!"
		}

	    if (form.getValue("VALORMEDIDOR5") == "" && form.getValue("USAINDICADORUSO5") == "1") {
	    	throw "É obrigatório preencher o campo Diesel/Gasolina/Álcool!"
	    }
		
		var maodeobra = form.getChildrenIndexes("TABELA_MAODEOBRA");
		if (maodeobra.length < 1){
			throw "É obrigatório ter pelo menos um registro de Mão de Obra!";
		} else {
		    for (var i = 0; i < maodeobra.length; i++) {
		        if (form.getValue("MAODEOBRANOME___" + maodeobra[i]) == ""){ throw "Favor preencher o campo 'Nome' da tabela de mão de obra!" }
		        if (form.getValue("MAODEOBRAHORAINICIO___" + maodeobra[i]) == ""){ throw "Favor iniciar a OS!" }
		        if (form.getValue("MAODEOBRAHORASTOTAIS___" + maodeobra[i]) == ""){ throw "Favor pausar a OS!" }
		    }
		}
		
		validacaoHorimetroCorreto(form);
		validacaoRMRSPendente(form)
		
		var indexes = form.getChildrenIndexes("TABELA_PLANOMANUTENCAO");
		for (var i = 0; i < indexes.length; i++) {
			if (form.getValue("PLANOMANSTATUS___" + indexes[i]) == "") {
				throw "É necessário que você preencha o checklist do item: "+ form.getValue("PLANOMANATIVIDADE___"+indexes[i]);
			} else {
				if (form.getValue("PLANOMANSTATUS___" + indexes[i]) != "OK") {
					if (form.getValue("PLANOMANJUSTIFICA___" + indexes[i]) == "") {
						throw "Favor justificar o motivo de estar Não OK ou N/A no item "+ form.getValue("PLANOMANATIVIDADE___"+indexes[i])
					}
				}
			}
		}
	}
}

function validacaoHorimetroCorreto(form) {
	var regex = /^(TDE|TCM|TTP|TPE|TPA|TRB|TEH|TPC|TRE|TMH|TPH|TDV|TTT|LCM|LCR|LDE|LDV|LEH|LMN|LMP|LOB|LPC|LPE|LPG|LRC|LRE|LTE).*/;
	
	if (regex.test(form.getValue("OBJETODEMANUTENCAO"))) {
		try {
			var c1 = DatasetFactory.createConstraint("IDOBJOF", form.getValue("OBJETODEMANUTENCAO"), form.getValue("OBJETODEMANUTENCAO"), ConstraintType.MUST);
			var constraints = new Array(c1);
			var dataset = DatasetFactory.getDataset('ds_OSE_Objeto_de_Manutencao_Horimetro', null, constraints, null);
			
			var horimetroAtual = +(form.getValue("HORIMETROMEDIDOR"));
			var horimetroMaximo = +(dataset.getValue(0, "HORASMAXIMAS"));
			var horimetroAcumulado = +(dataset.getValue(0, "HORIMETRO"));
			
			log.error("horimetroAtual: "+horimetroAtual);
			log.error("horimetroMaximo: "+horimetroMaximo);
			log.error("horimetroAcumulado: "+horimetroAcumulado);
			
			if (horimetroAtual > horimetroMaximo) {
				throw "\n\nO horímetro digitado é maior que o prazo desde a última medição!\n\n"; 
			}
			if (horimetroAtual < horimetroAcumulado){
				throw "\n\nO horímetro digitado é menor que o horímetro acumulado!\n\n"; 
			}
		} catch (e){
			log.error("Erro ao validar horímetro, favor tente novamente online\n\n"+e);
			throw e;
		}	
  }
}

function validacaoRMRSPendente(form) {
	try {
		var c1 = DatasetFactory.createConstraint("IDMOVOS", form.getValue("OSIDMOV"), form.getValue("OSIDMOV"), ConstraintType.MUST);
		var constraints = new Array(c1);
		var dataset = DatasetFactory.getDataset('ds_OSE_RMRS_Pendente',null,constraints,null);

		var status = dataset.getValue(0, "STATUS");
		var descricao = dataset.getValue(0, "DESCRICAO");

        if(dataset.rowsCount > 0) {
        	throw "\n\nVocê não pode finalizar uma OS com RM Pendente!\n\n"
        } else {
			if (status == "G" || status == "A" || status == "B" || status == "U") {
				throw "Há RM/RS com status "+ descricao +".\nA OS não pode ser enviada para o técnico ou encerrada!"
			}
		}
	}catch (e){
		log.error(e)
	}	
}
