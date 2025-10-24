function displayFields(form,customHTML){
	form.setShowDisabledFields(true);
	form.setHidePrintLink(true);
	
	if ((getValue("WKNumState") == "0" || getValue("WKNumState") == "12") && form.getValue("DATAINICIOOS") == "") {preencheDataInicio(form,customHTML);}
	
	if (getValue("WKNumState") != "18") {
		var script = '<script>\
		setTimeout(function () {\
		  $(\'input[id^="PLANOMANSTTS___"]\').each(function () {\
			$(this).prop(\'checked\', false);\
            $(this).prop(\'disabled\', true);\
			\
			$(this).closest(\'label\')\
            .removeClass(\'active\')\
            .addClass(\'disabled\')\
            .css({\'pointer-events\': \'none\', \'opacity\': \'0.6\', \'cursor\': \'not-allowed\'});\
		  });\
		}, 500);\
		</script>';
		
		customHTML.append(script);
	}
	
	if (getValue("WKNumState") != "0" && getValue("WKNumState") != "12") {
		var script = '<script>\
		setTimeout(function () {\
		  $(\'input[id^="PLANOMANSTATUS___"]\').each(function () {\
		    var id = $(this).attr("id");\
		    var index = id.split("___")[1]\
		    var valor = $(this).val();\
			\
		    if (valor) {\
		      $(\'input[name="PLANOMANSTTS___\' + index + \'"][value="\' + valor + \'"]\').prop("checked", true);\
		      $(\'input[name="PLANOMANSTTS___\' + index + \'"][value="\' + valor + \'"]\').closest("label").addClass("active");\
		    }\
		  });\
		}, 500);\
		</script>';
		
		customHTML.append(script);
	}
	
	
	var indexes = form.getChildrenIndexes("TABELA_PLANOMANUTENCAO");
		
	customHTML.append('<script>$(function () { $("#TABELA_MAODEOBRA .bpm-mobile-trash-column").hide(); });</script>');
	
	if (getValue("WKNumState") != "18") {		
		customHTML.append("<script>$('#TABELA_MAODEOBRA_BOTAO').prop('disabled', true);</script>");
		customHTML.append("<script>$('.btn-block').prop('disabled', true);</script>");
		customHTML.append("<script>$('.btn-block').hide();</script>");
		customHTML.append("<script>$('.btn-to-hide').prop('disabled', true);</script>");
		
        for (var i = 0; i < indexes.length; i++) {
        	form.setEnabled("PLANOMANSTTS___" + indexes[i], false);
        }
    } else {
    	for (var i = 0; i < indexes.length; i++) {
    		form.setEnabled("PLANOMANSTTS___" + indexes[i], true);
    	}
    }
	
	if (getValue("WKNumState") != "14" && getValue("WKNumState") != "16") {customHTML.append("<script>$('#RMCONSULTARAPROVACAO').prop('disabled', true);</script>");}
}

function preencheDataInicio(form, customHTML) {
	var dataAtual = new Date();
	
	var dia = dataAtual.getDate() < 10 ? '0' + dataAtual.getDate() : dataAtual.getDate();
	var mes = (dataAtual.getMonth() + 1) < 10 ? '0' + (dataAtual.getMonth() + 1) : (dataAtual.getMonth() + 1); // Mês começa em zero
	var ano = dataAtual.getFullYear();
	var hora = dataAtual.getHours() < 10 ? '0' + dataAtual.getHours() : dataAtual.getHours();
	var minutos = dataAtual.getMinutes() < 10 ? '0' + dataAtual.getMinutes() : dataAtual.getMinutes();
	
	var dataFormatada = dia + '/' + mes + '/' + ano + ' - ' + hora + ':' + minutos;
	
	form.setValue("DATAINICIOOS", dataFormatada);
}