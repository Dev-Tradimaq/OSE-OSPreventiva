function createDataset(fields, constraints, sortFields) {
    var newDataset = DatasetBuilder.newDataset();
    log.info("QUERY: " + myQuery);
    //var dataSource = "/jdbc/Banco RM";
    var dataSource = "/jdbc/Banco RM Teste";
    var ic = new javax.naming.InitialContext();
    var ds = ic.lookup(dataSource);
    var created = false;

    var IDOBJOF = "%"
		
		for (var i = 0; i < constraints.length; i++) {
			log.info("const " + i + "------");
			log.info("Chave " + i + ": " + constraints[i].fieldName);
			log.info("Valor " + i + ": " + constraints[i].initialValue);

			if (constraints[i].fieldName == "IDOBJOF") {
				IDOBJOF = constraints[i].initialValue;
			}
		}
    
    var myQuery = getQuery(IDOBJOF)
    	
    try {
        var conn = ds.getConnection();
        var stmt = conn.createStatement();
        var rs = stmt.executeQuery(myQuery); 
        var columnCount = rs.getMetaData().getColumnCount();
        while (rs.next()) {
            if (!created) {
            	var i = 1
            	do{

                    newDataset.addColumn(rs.getMetaData().getColumnName(i));

                i++
            	} while (i <= columnCount)
                created = true;
            }
            var Arr = new Array();
            var i = 1
            
            do{

                var obj = rs.getObject(rs.getMetaData().getColumnName(i));
                if (null != obj) {
                    Arr[i - 1] = rs.getObject(rs.getMetaData().getColumnName(i)).toString();
                } else {
                    Arr[i - 1] = "null";
                }
                
            i++
            } while (i <= columnCount)
            newDataset.addRow(Arr);
        }
    } catch (e) {
        log.error("ERRO==============> " + e.message);
    } finally {
        if (rs != null) {
            rs.close();
        }
        if (stmt != null) {
            stmt.close();
        }
        if (conn != null) {
            conn.close();
        }
    }
    return newDataset;
}

function getQuery(IDOBJOF){
	
	return "" +
	"SELECT DISTINCT TOP 100 PLANO.IDPLANO," +
	" CONCAT(MAQ.IDOBJOF,'  -  ',MAQ.IDOBJOF2,'  -  ',PLANO.IDPLANO,'  -  ',TPLANO.DESCRICAO) AS PLANO" +
	" FROM OFOBJOFICINA (NOLOCK) AS MAQ," +
	" OFLOGGERPLANO (NOLOCK) AS PLANO," +
	" OFPLANOMANUT (NOLOCK) AS TPLANO" +
	
	" WHERE MAQ.CODCOLIGADA = PLANO.CODCOLIGADA" +
	" 	AND MAQ.IDOBJOF = PLANO.IDOBJOF" +
	" 	AND PLANO.IDPLANO = TPLANO.IDPLANO" +
	" 	AND MAQ.CODSUBMODELO = TPLANO.CODSUBMODELO" +
	" 	AND TPLANO.ATIVO = 1" +
	" 	AND MAQ.STATUS NOT IN ('6', '9', 'T')" +
	" 	AND CONCAT(MAQ.IDOBJOF,' - ',MAQ.IDOBJOF2,' - ',PLANO.IDPLANO,' - ',TPLANO.DESCRICAO) LIKE '%"+ IDOBJOF +"%'";
	
	
}