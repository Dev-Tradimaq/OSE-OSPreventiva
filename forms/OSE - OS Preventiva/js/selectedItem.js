//==============================================================================================================================================
function setSelectedZoomItem(selectedItem) {

	if (selectedItem.inputId == "OBJETODEMANUTENCAO") {
		var c1 = DatasetFactory.createConstraint("IDOBJOF", selectedItem["IDOBJOF"], selectedItem["IDOBJOF"], ConstraintType.MUST);
		var constraints = new Array(c1);
		try{
			var dataset = DatasetFactory.getDataset("ds_OSE_Objeto_de_Manutencao", null, constraints, null);
			var row = dataset.values[0];
			document.getElementById("SERIE").value = row["SERIE"]
			document.getElementById("STATUS").value = row["STATUS"]
			document.getElementById("CODMODELO").value = row["CODMODELO"]
			document.getElementById("MODELO").value = row["MODELO"]
			document.getElementById("CODSUBMODELO").value = row["CODSUBMODELO"]
			document.getElementById("SUBMODELO").value = row["SUBMODELO"]
			document.getElementById("CODTIPOOBJ").value = row["CODTIPOOBJ"]
			document.getElementById("TIPOOBJ").value = row["TIPOOBJ"]
			document.getElementById("CODFABRICANTE").value = row["CODFABRICANTE"]
			document.getElementById("FABRICANTE").value = row["FABRICANTE"]
			document.getElementById("HORIMETROACUMULADO").value = row["HOTRIMETRO"]
			document.getElementById("HORIMETROMAXIMO").value = row["HORASMAXIMAS"]
			document.getElementById("DATACOLETA").value = row["DATACOLETA"]
			document.getElementById("CODFILIAL").value = row["CODFILIAL"]
			document.getElementById("FILIAL").value = row["FILIAL"]
			document.getElementById("CODCENTRODECUSTO").value = row["CODCENTRODECUSTO"]
			document.getElementById("CENTRODECUSTO").value = row["CENTRODECUSTO"]
			document.getElementById("CODDEPARTAMENTO").value = row["CODDEPARTAMENTO"]
			document.getElementById("DEPARTAMENTO").value = row["DEPARTAMENTO"]
			document.getElementById("CODLOCALIZACAO").value = row["CODLOCALIZACAO"]
			document.getElementById("LOCALIZACAO").value = row["LOCALIZACAO"]
			document.getElementById("CHAPARESP").value = row["CHAPARESP"]
			document.getElementById("USAINDICADORUSO5").value = row["USAINDICADORUSO5"]
			if (row["USAINDICADORUSO5"] != "1"){
				document.getElementById("VALORMEDIDOR5").value = "";
			}

			try{
				var c1 = DatasetFactory.createConstraint("IDOBJOF", row["IDOBJOF"], row["IDOBJOF"], ConstraintType.MUST);
				var constraints = new Array(c1);
				var dataset = DatasetFactory.getDataset("ds_OSE_Valida_HorimetroVencimento", null, constraints, null);
				var linha = dataset.values[0];
				if (linha["CAMPOLIVRE3"] == null || linha["CAMPOLIVRE3"] == "null"){
					throw "null";
				} else {
					document.getElementById("HORIMETROVENCIMENTO").value = +(linha["CAMPOLIVRE3"]) + 250;
				}
			} catch (e) {
					var valor;
					try {
						valor = +(row["ULTIMO_VENCIMENTO"]) + 250;
						if (valor+" " == "NaN "){ throw "NaN" }
					} catch (e){
						valor = row["ULTIMO_VENCIMENTO"];
					}
					document.getElementById("HORIMETROVENCIMENTO").value = valor;
			}
			
			reloadZoomFilterValues("PLANODEMANUTENCAO", "IDOBJOF," + row["IDOBJOF"]);
			

			var c1 = DatasetFactory.createConstraint("CODLOCAL", row["CODLOCALIZACAO"], row["CODLOCALIZACAO"], ConstraintType.MUST);
			var constraints = new Array(c1);
			var dataset = DatasetFactory.getDataset("ds_OSE_Local_de_Estoque", null, constraints, null);
			var row = dataset.values[0];
			document.getElementById("CODLOCALESTOQUE").value = row["CODLOC"];
			document.getElementById("LOCALESTOQUE").value = row["LOCALDEESTOQUE"];
			
		}catch(e){
			console.log("Erro ao consultar dataset: " + e);
		}
		
		
		var c1 = DatasetFactory.createConstraint("IDOBJOF", selectedItem["IDOBJOF"], selectedItem["IDOBJOF"], ConstraintType.MUST);
		var constraints = new Array(c1);
		try{
			var dataset = DatasetFactory.getDataset("ds_OSE_Preventiva_UltimoPlano", null, constraints, null);
	        var row = dataset.values[0];

	        document.getElementById("ULTIMOPLANOREALIZADO").value = row["DESCRICAO"]
		}catch(e){
			console.log("Erro ao consultar dataset: " + e);
		}
		
	}
	
	if (selectedItem.inputId == "LOCALESTOQUE") {
		document.getElementById("CODLOCALESTOQUE").value = selectedItem["CODLOC"]
	}
	
	if (selectedItem.inputId == "PLANODEMANUTENCAO") {
		document.getElementById("IDPLANO").value = selectedItem["IDPLANO"]
		criarTabelaItensManutencao(selectedItem["IDPLANO"])
	}
	
}
//==============================================================================================================================================
function setZoomData(instance, value) {
	window[instance].setValue(value);
}
//==============================================================================================================================================
function removedZoomItem(removedItem) {

	if (removedItem.inputId == "OBJETODEMANUTENCAO") {
		document.getElementById("SERIE").value = ""
		document.getElementById("STATUS").value = ""
		document.getElementById("CODMODELO").value = ""
		document.getElementById("MODELO").value = ""
		document.getElementById("CODSUBMODELO").value = ""
		document.getElementById("SUBMODELO").value = ""
		document.getElementById("CODTIPOOBJ").value = ""
		document.getElementById("TIPOOBJ").value = ""
		document.getElementById("CODFABRICANTE").value = ""
		document.getElementById("FABRICANTE").value = ""
		document.getElementById("HORIMETROACUMULADO").value = ""
		document.getElementById("HORIMETROMAXIMO").value = ""
		document.getElementById("CODFILIAL").value = ""
		document.getElementById("FILIAL").value = ""
		document.getElementById("CODCENTRODECUSTO").value = ""
		document.getElementById("CENTRODECUSTO").value = ""
		document.getElementById("CODDEPARTAMENTO").value = ""
		document.getElementById("DEPARTAMENTO").value = ""
		document.getElementById("CODLOCALIZACAO").value = ""
		document.getElementById("LOCALIZACAO").value = ""
		document.getElementById("ULTIMOPLANOREALIZADO").value = ""
		document.getElementById("HORIMETROVENCIMENTO").value = ""
	}
	
	if (removedItem.inputId == "LOCALESTOQUE") {
		document.getElementById("CODLOCALESTOQUE").value = ""
	}
	
	if (removedItem.inputId == "PLANODEMANUTENCAO") {
		deleteRows("TABELA_PLANOMANUTENCAO")
	}


}
//==============================================================================================================================================