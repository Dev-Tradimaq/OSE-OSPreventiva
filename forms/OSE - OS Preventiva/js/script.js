$(document).ready(function() {

    $('.PREVENTIVA').hide();
    $('.CRONOGRAMA').hide();
    
  $('li').click(function() {
    // Remover classe "active" de outros itens da lista
    $('li').removeClass('active');

    // Adicionar classe "active" no item clicado
    $(this).addClass('active');

    var opcaoEscolhida = $(this).text();
    if(opcaoEscolhida == "OS"){
        $('.OS').show();
        $('.PREVENTIVA').hide();
        $('.CRONOGRAMA').hide();
    } else if(opcaoEscolhida == "CHECKLIST PREVENTIVA"){
        $('.OS').hide();
        $('.PREVENTIVA').show();
        $('.CRONOGRAMA').hide();
    } else if(opcaoEscolhida == "PROGRAMAÇÃO DE PREVENTIVAS"){
        $('.OS').hide();
        $('.PREVENTIVA').hide();
        $('.CRONOGRAMA').show();
    }
  });
  
  FLUIGC.switcher.initAll('#ITENSPLANOMAN');
  
  var table = document.getElementById("TABELA_RMOS").rows.length;
  table < 1 ? addLinhaTabela("TABELA_RMOS") : consultaRMdaOS("TABELA_RMOS");
});
//==============================================================================================================================================
function showCamera(param) { 
	JSInterface.showCamera(param);
}
//==============================================================================================================================================
function addLinhaTabela(tabela){

	wdkAddChild(tabela);

}
//==============================================================================================================================================
function deleteLinhaTabela(campo, tabela){
	
	if (tabela != "TABELA_MAODEOBRA"){
		fnWdkRemoveChild(campo);
	} else {
		if ((campo.closest('tr').querySelectorAll('.form-group.col-md-2 input')[0].value) == ""){
			fnWdkRemoveChild(campo);
		} else {
			FLUIGC.toast({
				title: 'Atenção: ',
				message: 'Você não pode exluir um HHT que foi iniciado e pausado!',
				type: 'info'
			});
		}
	}

}
//==============================================================================================================================================
function iniciaOS(campo){

	var index = $(campo).closest('.row').prev().find('input[id^="MAODEOBRAHORAINICIO___"]').attr('id').split("___")[1];
	if ((document.getElementById('MAODEOBRAHORAINICIO___'+index).value != "" && document.getElementById('MAODEOBRAHORAFIM___'+index).value != "")
		|| (document.getElementById('MAODEOBRAHORAINICIO___'+index).value == "" && document.getElementById('MAODEOBRAHORAFIM___'+index).value == "")){
		document.getElementById('MAODEOBRAHORAINICIO___'+index).value = moment().format('DD/MM/YYYY HH:mm:ss');
		document.getElementById('MAODEOBRAHORAFIM___'+index).value = "";
	} else {
		FLUIGC.toast({
			title: 'Atenção: ',
			message: 'Você já iniciou a OS!',
			type: 'info'
		});
	}	
	
}
//==============================================================================================================================================
function finalizaOS(campo){
	
	var index = $(campo).closest('.row').prev().find('input[id^="MAODEOBRAHORAINICIO___"]').attr('id').split("___")[1];
	
	// Obter os valores dos campos de texto
	var dataInicialStr = document.getElementById('MAODEOBRAHORAINICIO___'+index).value;
	

	if (dataInicialStr != "" && document.getElementById('MAODEOBRAHORAFIM___'+index).value == ""){
		
		document.getElementById('MAODEOBRAHORAFIM___'+index).value = moment().format('DD/MM/YYYY HH:mm:ss');
		var dataFinalStr = document.getElementById('MAODEOBRAHORAFIM___'+index).value;
		
		// Converter as datas em objetos Moment
		var dataInicial = moment(dataInicialStr, 'DD/MM/YYYY HH:mm:ss');
		var dataFinal = moment(dataFinalStr, 'DD/MM/YYYY HH:mm:ss');
	
		// Calcular a diferença em horas e minutos
		var diferencaHoras = dataFinal.diff(dataInicial, 'hours');
		var diferencaMinutos = dataFinal.diff(dataInicial, 'minutes') % 60;
		
		diferencaMinutos = diferencaMinutos < 10 ? "0" + diferencaMinutos : diferencaMinutos;
			
		
		addLinhaTabela("MAODEOBRAHHT");
		
		$('input[id^="MAODEOBRANOMEHHT___"]:last').val(document.getElementById('MAODEOBRANOME___'+index).value);
		$('input[id^="MAODEOBRAHORAINICIOHHT___"]:last').val(document.getElementById('MAODEOBRAHORAINICIO___'+index).value); 
		$('input[id^="MAODEOBRAHORAFIMHHT___"]:last').val(document.getElementById('MAODEOBRAHORAFIM___'+index).value);
		$('input[id^="MAODEOBRAHORASTOTAISHHT___"]:last').val(diferencaHoras+":"+diferencaMinutos);
		
		var horasTotais = "00:00"
		$('#MAODEOBRAHHT tr').each(function() {
		    var nome = $(this).find('input[name^="MAODEOBRANOMEHHT"]').val(); // Obter o valor da coluna "MAODEOBRANOMEHHT"
		    var horas = $(this).find('input[name^="MAODEOBRAHORASTOTAISHHT"]').val(); // Obter o valor da coluna "MAODEOBRAHORASTOTAISHHT"
		    
		    
		    if (nome == document.getElementById('MAODEOBRANOME___'+index).value){
		    // Converter os valores para objetos Moment.js
		    	
		    horas = horas.split(":")[0] == "0" ? "0"+horas : horas;
		    
		    var momento1 = moment(horasTotais, 'HH:mm')
		    var momento2 = moment(horas, 'HH:mm');
		    
		    // Somar os momentos
		    var duracao = moment.duration(momento1).add(momento2);
		    var segundos = duracao.asSeconds();
		    var resultado = moment.utc(segundos * 1000).format('HH:mm');

		    horasTotais = resultado;
		    }
		});
		document.getElementById('MAODEOBRAHORASTOTAIS___'+index).value = horasTotais;
		

		var horasTotais = "00:00"
		$('#MAODEOBRAHHT tr').each(function() {
		    var horas = $(this).find('input[name^="MAODEOBRAHORASTOTAISHHT___"]').val(); // Obter o valor da coluna "MAODEOBRAHORASTOTAISHHT"
			if (horas != undefined){
		    	horas = horas.split(":")[0] == "0" ? "0"+horas : horas;
			    
			    var momento1 = moment(horasTotais, 'HH:mm')
			    var momento2 = moment(horas, 'HH:mm');
			    // Somar os momentos
			    var duracao = moment.duration(momento1).add(momento2);
			    var segundos = duracao.asSeconds();
			    horasTotais = moment.utc(segundos * 1000).format('HH:mm');
			}
		});
	    document.getElementById("TOTALHORASEXECUTADAS").value = horasTotais;
		
	} else {
		FLUIGC.toast({
			title: 'Atenção: ',
			message: 'Você precisa iniciar a OS para poder pausar!',
			type: 'info'
		});
	}
}
//==============================================================================================================================================
function criarTabelaItensManutencao(IDPLANO){
	
	var c1 = DatasetFactory.createConstraint("IDPLANO", IDPLANO, IDPLANO, ConstraintType.MUST);
	var constraints = new Array(c1);
	try{
		var dataset = DatasetFactory.getDataset("ds_OSE_Preventiva_Itens_PlanosManutencao", null, constraints, null);
		
		for(var i=0;i<dataset.values.length;i++){
			
			wdkAddChild('TABELA_PLANOMANUTENCAO');

	        var row = dataset.values[i];
			
			$('textarea[id^="PLANOMANATIVIDADE___"]:last').val( row["ATIVIDADE"] );
			$('input[id^="PLANOMANIDPRD___"]:last').val( row["IDPRD"] );
			$('input[id^="PLANOMANQUANTIDADE___"]:last').val( row["QUANTIDADE"] );
			$('input[id^="PLANOMANPRECOUNITARIO___"]:last').val( row["PRECOUNITARIO"] );
			
		}
		
		FLUIGC.switcher.initAll('#ITENSPLANOMAN');
	}catch(e){
		console.log("Erro ao consultar dataset: " + e);
	}
}
//==============================================================================================================================================
function deleteRows(idtabela){
	
	var tableHeaderRowCount = 2;
	var table = document.getElementById(idtabela);
	var rowCount = table.rows.length;

	for (var i = tableHeaderRowCount; i < rowCount; i++) {
	    table.deleteRow(tableHeaderRowCount);
	}
		
}
//==============================================================================================================================================
function justificaPlano(campo){
	/*
	var id = campo.id.substring(14,campo.id.length);
	
	if (!campo.checked){
		document.getElementById('PLANOMANJUSTIFICA'+id).disabled = false;
	} else {
		document.getElementById('PLANOMANJUSTIFICA'+id).disabled = true;
	}
	*/
}
//==============================================================================================================================================
function consultaRMdaOS(tabela){

	try{
		var c1 = DatasetFactory.createConstraint("IDMOVOS", document.getElementById('OSIDMOV').value,
																document.getElementById('OSIDMOV').value, ConstraintType.MUST);
		
		var constraints = new Array(c1);
		var dataset = DatasetFactory.getDataset('ds_OSE_RM_Status',null,constraints,null);
		
		if(dataset.values.length>0){
			
			var table = document.getElementById(tabela);
			var rowCount = table.rows.length;

			for (var i = 1; i < rowCount; i++) {
		    	fnWdkRemoveChild($('input[id^="RMNUMEROMOV___"]:last')[0]);
		    }
			
			for(var i=0;i<dataset.values.length;i++){
					
				wdkAddChild(tabela);
	
		        var row = dataset.values[i];

				$('input[id^="RMIDMOV___"]:last').val( row["IDMOV"] );
				$('input[id^="RMNUMEROMOV___"]:last').val( row["NUMEROMOV"] );
				$('input[id^="RMSTATUS___"]:last').val( row["STATUS"] );
				$('input[id^="RMAPROVACAO___"]:last').val( row["DATAAPROVACAO"] );
				
			}
			
		}
	} catch (e){
		console.log("error: "+e);
	}
	
}
//==============================================================================================================================================
async function consultaPreventivas(){

	var myLoading2 = FLUIGC.loading(window);
	// We can show the message of loading
	myLoading2.show();
    deleteRows("TABELA_CRONOGRAMAMANUTENCAO");
    deleteRows("TABELA_HISTORICOPREVENTIVAS");
    deleteRows("TABELA_EQUIPAMENTOSEMPREV");
	var result1 = await cronogramaDeManutencao();
	var result2 = await historicoPreventivas();
	var result3 = await equipamentosSemPrev();
	myLoading2.hide();
}
//==============================================================================================================================================
async function cronogramaDeManutencao(){
	var idtabela = "TABELA_CRONOGRAMAMANUTENCAO";
	var local = document.getElementById("CRONOGRAMAOCAL").value;
    try {
        var dataset = await getDataset(
            "ds_OSE_Cronograma_Preventivas", 
            null, 
            [DatasetFactory.createConstraint("NOME", local, local, ConstraintType.MUST)],
            null
        );

        // resto do código
    		for(var i=0;i<dataset.values.length;i++){
    			wdkAddChild(idtabela);
    			var row = dataset.values[i];
    		
    		    var tabela = document.getElementById(idtabela);
    		    // Acessa a última linha da tabela
    		    var ultimaLinha = tabela.rows[tabela.rows.length - 1];
    		    
    		    ultimaLinha.cells[0].textContent = row["IDOBJOF"];
    		    ultimaLinha.cells[1].textContent = row["ULTIMO_VENCIMENTO"];
    		    ultimaLinha.cells[2].textContent = row["ULTIMA_PREVENTIVA_TERMINADA"];
    		    ultimaLinha.cells[3].textContent = row["HORIMETRO_1_PREV"];
    		    ultimaLinha.cells[4].textContent = row["HORAS_1_PREV"];
    		    ultimaLinha.cells[5].textContent = row["DIAS_1_PREV"];

    		    if (parseInt(row["DIAS_1_PREV"]) <= 15){
    			    ultimaLinha.classList.add("danger")
    		    } else if (parseInt(row["DIAS_1_PREV"]) > 15 && parseInt(row["DIAS_1_PREV"]) <= 45){
    			    ultimaLinha.classList.add("warning")
    		    } else {
    		    	//ultimaLinha.classList.add("active")
    		    }
    		}
    		return true
    } catch (error) {
        console.error(error);
		return true
    }
    
}
//==============================================================================================================================================
async function historicoPreventivas(){
	var idtabela = "TABELA_HISTORICOPREVENTIVAS";
	var local = document.getElementById("CRONOGRAMAOCAL").value;
    try {
        var dataset = await getDataset(
            "ds_OSE_Historico_Preventivas", 
            null, 
            [DatasetFactory.createConstraint("NOME", local, local, ConstraintType.MUST)],
            null
        );

        // resto do código
    		for(var i=0;i<dataset.values.length;i++){
    			wdkAddChild(idtabela);
    			var row = dataset.values[i];
    		
    		    var tabela = document.getElementById(idtabela);
    		    // Acessa a última linha da tabela
    		    var ultimaLinha = tabela.rows[tabela.rows.length - 1];
    		    
    		    ultimaLinha.cells[0].textContent = row["IDOBJOF"];
    		    ultimaLinha.cells[1].textContent = row["CENTRO_CUSTO"];
    		    ultimaLinha.cells[2].textContent = row["DATACRIACAO"];
    		    ultimaLinha.cells[3].textContent = row["NUMERO_OS"];
    		    ultimaLinha.cells[4].textContent = row["ITEM"];
    		    
    		}
    		return true
    } catch (error) {
        console.error(error);
		return true
    }

}
//==============================================================================================================================================
async function equipamentosSemPrev(){
	var idtabela = "TABELA_EQUIPAMENTOSEMPREV";
	var local = document.getElementById("CRONOGRAMAOCAL").value;
    try {
        var dataset = await getDataset(
            "ds_OSE_Equipamentos_Sem_Preventiva", 
            null, 
            [DatasetFactory.createConstraint("NOME", local, local, ConstraintType.MUST)],
            null
        );

        // resto do código
    		for(var i=0;i<dataset.values.length;i++){
    			wdkAddChild(idtabela);
    			var row = dataset.values[i];
    		
    		    var tabela = document.getElementById(idtabela);
    		    // Acessa a última linha da tabela
    		    var ultimaLinha = tabela.rows[tabela.rows.length - 1];
    		    
    		    ultimaLinha.cells[0].textContent = row["IDOBJOF"];
    		    ultimaLinha.cells[1].textContent = row["HORIMETRO"];
    		    ultimaLinha.cells[2].textContent = row["DATACOLETA"];
    		    
    		}
    		return true
    } catch (error) {
        console.error(error);
		return true
    }

}
//=/=/=/=/==/==/==//=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=//=/=/=/=/=/=/=/=/=//=/=/=
function getDataset(dataset, fields, constraints, sorters) {
    return new Promise(function (resolve, reject) {
        DatasetFactory.getDataset(
            dataset,
            fields,
            constraints,
            sorters,
            {
                success: data => resolve(data),
                error: () => reject(arguments)
            }
        );
    });
}
//=/=/=/=/==/==/==//=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=//=/=/=/=/=/=/=/=/=//=/=/=




