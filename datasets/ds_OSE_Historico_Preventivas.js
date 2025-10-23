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
	"SELECT	DISTINCT '1' AS QUANTIDADE,\
			G.IDOBJOF,\
			A.CODCCUSTO,\
			H.NOME AS CENTRO_CUSTO,\
			MAX(A.NUMEROMOV) AS NUMERO_OS,\
			M.NOME AS LOCALIZACAO,\
			(SELECT TOP 1 NOMEFANTASIA FROM TITMMOV (NOLOCK), TPRODUTO (NOLOCK) WHERE TITMMOV.CODCOLIGADA = TPRODUTO.CODCOLPRD AND TITMMOV.IDPRD = TPRODUTO.IDPRD AND TPRODUTO.NOMEFANTASIA LIKE '%REVISAO%' AND TITMMOV.CODCOLIGADA = A.CODCOLIGADA AND TITMMOV.IDMOV = MAX(A.IDMOV)) AS ITEM,\
			MAX(A.DATACRIACAO) AS DATACRIACAO\
	FROM TMOV A (NOLOCK), OFORDEMSERVICO G (NOLOCK) LEFT OUTER JOIN OFHISTINDICADOR F (NOLOCK) ON G.CODCOLIGADA = F.CODCOLIGADA AND G.IDOBJOF = F.IDOBJOF,\
	GCCUSTO H (NOLOCK), TMOVCOMPL K (NOLOCK), OFOBJOFICINA Z (NOLOCK) LEFT OUTER JOIN ILOCAL M (NOLOCK) ON Z.CODCOLIGADA = M.CODCOLIGADA AND Z.CODLOCAL = M.CODLOCAL\
	WHERE\
	A.CODCOLIGADA = G.CODCOLIGADA AND\
	A.IDMOV = G.IDMOV AND\
	A.CODCOLIGADA = H.CODCOLIGADA  AND\
	A.CODCCUSTO = H.CODCCUSTO  AND\
	A.CODCOLIGADA = H.CODCOLIGADA AND\
	A.IDMOV = K.IDMOV AND\
	A.CODCOLIGADA = Z.CODCOLIGADA AND\
	A.IDOBJOF = Z.IDOBJOF AND\
	A.CODTMV = '1.1.22' AND\
	(G.IDOBJOF IN (SELECT IDOBJOF FROM OFOBJOFICINACOMPL (NOLOCK) WHERE TIPOPREV = 'A2')) AND\
	A.DATACRIACAO BETWEEN  DATEADD(MONTH, -3, (GETDATE()- DAY(GETDATE()) +1) ) AND GETDATE()\
	\
	AND M.NOME LIKE '%"+LOCAL+"%'\
	GROUP BY G.IDOBJOF, A.CODCOLIGADA, A.CODCCUSTO, H.NOME, M.NOME\
	ORDER BY MAX(A.DATACRIACAO) ASC, MAX(A.NUMEROMOV) ASC";

	
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