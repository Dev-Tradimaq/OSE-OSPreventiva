function enableFields(form){

	form.setEnhancedSecurityHiddenInputs(true);

	if (getValue("WKNumState") != "0" && getValue("WKNumState") != "12"){
        form.setEnabled("OBJETODEMANUTENCAO",false);
        form.setEnabled("LOCALESTOQUE",false);
        form.setEnabled("PLANODEMANUTENCAO",false);
	}
	
	if (getValue("WKNumState") != "16"){
        form.setEnabled("PREVISAOEXECUCAOSERVICO",false);
        form.setEnabled("FOLLOWUP",false);
	}

	if (getValue("WKNumState") != "18"){
        form.setEnabled("HORIMETROMEDIDOR",false);
        form.setEnabled("VALORMEDIDOR5",false);
		var indexes = form.getChildrenIndexes("TABELA_MAODEOBRA");
        for (var i = 0; i < indexes.length; i++) {
            form.setEnabled("MAODEOBRANOME___" + indexes[i], false);
        }
	} else {
		if (form.getValue("USAINDICADORUSO5") != "1"){
	        form.setEnabled("VALORMEDIDOR5",false);
	    }
	}
	
}