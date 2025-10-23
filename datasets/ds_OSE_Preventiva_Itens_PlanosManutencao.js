function createDataset(fields, constraints, sortFields) {
    var newDataset = DatasetBuilder.newDataset();
    log.info("QUERY: " + myQuery);
    //var dataSource = "/jdbc/Banco RM";
    var dataSource = "/jdbc/Banco RM Teste";
    var ic = new javax.naming.InitialContext();
    var ds = ic.lookup(dataSource);
    var created = false;

    var IDPLANO = "2631"
		
		for (var i = 0; i < constraints.length; i++) {
			log.info("const " + i + "------");
			log.info("Chave " + i + ": " + constraints[i].fieldName);
			log.info("Valor " + i + ": " + constraints[i].initialValue);

			if (constraints[i].fieldName == "IDPLANO") {
				IDPLANO = constraints[i].initialValue;
			}
		}
    
    var myQuery = getQuery(IDPLANO)
    	
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

function getQuery(IDPLANO){
	
	return "" +
	"SELECT TOP 1000 PLANO.IDPLANO,\
	PLANO.DESCRICAO,\
	ITEM.QUANTIDADE,\
	ITEM.CODUND,\
	PROD.NOMEFANTASIA,\
	PROD.CODIGOPRD,\
	(PROD.CODIGOPRD + '  -  ' + PROD.NOMEFANTASIA) AS ATIVIDADE,\
	PROD.IDPRD,\
	TPRODUTODEF.PRECO5 AS PRECOUNITARIO\
	\
	FROM OFPLANOMANUT (NOLOCK) AS PLANO,\
	OFITMPLANO (NOLOCK) AS ITEM,\
	TPRODUTO (NOLOCK) AS PROD\
	LEFT OUTER JOIN TPRODUTODEF (NOLOCK)\
	ON (PROD.IDPRD = TPRODUTODEF.IDPRD)\
	\
	WHERE PLANO.IDPLANO = ITEM.IDPLANO\
		AND ITEM.IDPRD = PROD.IDPRD\
		AND PLANO.ATIVO = 1\
		AND PLANO.IDPLANO = "+ IDPLANO +"\
		ORDER BY TPRODUTODEF.CODTB2FAT DESC "
	
	
}