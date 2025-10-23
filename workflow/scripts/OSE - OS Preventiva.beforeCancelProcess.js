function beforeCancelProcess(colleagueId,processId){
	
	try{
	    var c1 = DatasetFactory.createConstraint("workflowColleagueRolePK.roleId", "GestorOSE","GestorOSE" , ConstraintType.MUST);
	    var c2 = DatasetFactory.createConstraint("workflowColleagueRolePK.colleagueId", getValue("WKUser"), getValue("WKUser"), ConstraintType.MUST);
		var constraints = new Array(c1, c2);
		var dataset = DatasetFactory.getDataset("workflowColleagueRole", null, constraints, null);
    	var chapaDoPapel = dataset.getValue(0, "workflowColleagueRolePK.colleagueId")
	}catch (e){
		throw "\n  Você não pode cancelar esta solicitação  \n";
	}
	
}