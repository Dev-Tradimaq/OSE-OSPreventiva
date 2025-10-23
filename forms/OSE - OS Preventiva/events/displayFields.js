function displayFields(form,customHTML){
	
	form.setShowDisabledFields(true);
	form.setHidePrintLink(true);
	
	customHTML.append('<script>$(function () { $("#TABELA_MAODEOBRA .bpm-mobile-trash-column").hide(); });</script>');
	
	if (getValue("WKNumState") != "18"){
		
		customHTML.append("<script>$('#TABELA_MAODEOBRA_BOTAO').prop('disabled', true);</script>");

		customHTML.append("<script>$('.btn-block').prop('disabled', true);</script>");
		customHTML.append("<script>$('.btn-block').hide();</script>");

		customHTML.append("<script>$('.btn-to-hide').prop('disabled', true);</script>");
		
	}
	
	if (getValue("WKNumState") != "14" && getValue("WKNumState") != "16"){
		customHTML.append("<script>$('#RMCONSULTARAPROVACAO').prop('disabled', true);</script>");
	}
	
}