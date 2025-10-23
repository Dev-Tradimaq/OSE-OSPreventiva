function createDataset(fields, constraints, sortFields) {
    var newDataset = DatasetBuilder.newDataset();
    log.info("QUERY: " + myQuery);
    //var dataSource = "/jdbc/Banco RM";
    var dataSource = "/jdbc/Banco RM Teste";
    var ic = new javax.naming.InitialContext();
    var ds = ic.lookup(dataSource);
    var created = false;

    var LOCAL = "%"
		
		for (var i = 0; i < constraints.length; i++) {
			log.info("const " + i + "------");
			log.info("Chave " + i + ": " + constraints[i].fieldName);
			log.info("Valor " + i + ": " + constraints[i].initialValue);

			if (constraints[i].fieldName == "NOME") {
				LOCAL = constraints[i].initialValue;
			}
		}
    
    var myQuery = getQuery(LOCAL)
    	
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
                	if (i == columnCount){
                		Arr[i - 1] = converteDataBanco(rs.getObject(rs.getMetaData().getColumnName(i)).toString());
                	} else {
                		Arr[i - 1] = rs.getObject(rs.getMetaData().getColumnName(i)).toString();
                	}
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

function getQuery(LOCAL){
	
	return "" +
	"SELECT ILOCAL.CODLOCAL,\
	ILOCAL.NOME AS LOCAL,\
	OFOBJOFICINA.IDOBJOF,\
	MAX(OFHISTINDICADOR.VALORMEDIDOR1) AS HORIMETRO,\
	MAX(OFHISTINDICADOR.DATACOLETA) AS DATACOLETA\
	\
	FROM OFOBJOFICINA (NOLOCK)\
	\
	LEFT OUTER JOIN OFTIPOOBJ (NOLOCK)\
	ON OFOBJOFICINA.IDTIPOOBJ = OFTIPOOBJ.IDTIPOOBJ\
	\
	LEFT OUTER JOIN OFHISTINDICADOR (NOLOCK)\
	ON OFOBJOFICINA.CODCOLIGADA = OFHISTINDICADOR.CODCOLIGADA AND OFOBJOFICINA.IDOBJOF = OFHISTINDICADOR.IDOBJOF\
	\
	JOIN ILOCAL (NOLOCK)\
	ON OFOBJOFICINA.CODCOLIGADA = ILOCAL.CODCOLIGADA AND OFOBJOFICINA.CODLOCAL = ILOCAL.CODLOCAL\
	\
	WHERE OFOBJOFICINA.IDOBJOF NOT IN (SELECT OFOBJOFICINA.IDOBJOF\
						FROM OFOBJOFICINA (NOLOCK)\
						LEFT OUTER JOIN TMOV (NOLOCK)\
						ON OFOBJOFICINA.CODCOLIGADA = TMOV.CODCOLIGADA AND OFOBJOFICINA.IDOBJOF = TMOV.IDOBJOF\
						WHERE TMOV.CODTMV = '1.1.22'\
						  AND TMOV.CODTMV NOT IN ('C', 'N'))\
	  AND ( OFOBJOFICINA.IDOBJOF LIKE 'T%' )\
	  AND ( OFOBJOFICINA.STATUS <> '9' )\
	  AND ( OFTIPOOBJ.DESCRICAO NOT LIKE 'transmi%' )\
	  AND ( OFTIPOOBJ.DESCRICAO NOT LIKE 'mot%' )\
	  AND ( OFTIPOOBJ.DESCRICAO NOT LIKE 'caçam%' )\
	\
	  AND ILOCAL.NOME LIKE '%"+LOCAL+"%'\
	\
	GROUP BY ILOCAL.CODLOCAL, ILOCAL.NOME, OFOBJOFICINA.IDOBJOF\
	\
	ORDER BY ILOCAL.CODLOCAL ASC, ILOCAL.NOME ASC, OFOBJOFICINA.IDOBJOF ASC";

}


function converteDataBanco(dataBanco) {
	var splitData = dataBanco.split(" ");
	if (splitData[0] != undefined && splitData[0] != null && splitData[0] != "") {
		var dataAmericana = splitData[0];
		var splitDataAmericana = dataAmericana.split("-");
		return splitDataAmericana[2] + "/" + splitDataAmericana[1] + "/"
				+ splitDataAmericana[0];
	} else {
		return "";
	}
}