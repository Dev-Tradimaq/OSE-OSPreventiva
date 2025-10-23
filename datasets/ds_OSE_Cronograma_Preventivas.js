function createDataset(fields, constraints, sortFields) {
    var newDataset = DatasetBuilder.newDataset();
    log.info("QUERY: " + myQuery);
    var dataSource = "/jdbc/Banco RM";
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

function getQuery(LOCAL){
	
	return "" +
	"SELECT * FROM(\
	SELECT LOCAL,\
	IDOBJOF,\
	ULTIMO_VENCIMENTO,\
	ULTIMA_PREVENTIVA_TERMINADA,\
	\
	CASE\
	WHEN ULTIMO_VENCIMENTO LIKE '%-%' THEN ULTIMO_VENCIMENTO\
	ELSE CONVERT(VARCHAR, (ULTIMO_VENCIMENTO+250))\
	END AS HORIMETRO_1_PREV,\
	\
	CASE\
	WHEN ULTIMO_VENCIMENTO NOT LIKE '%-%' THEN CONVERT(VARCHAR, ((ULTIMO_VENCIMENTO+250) - 90 - HOR_FINAL))\
	ELSE ULTIMO_VENCIMENTO\
	END AS HORAS_1_PREV,\
	\
	CASE\
	WHEN ULTIMO_VENCIMENTO NOT LIKE '%-%' THEN CONVERT(VARCHAR, (\
		CASE MEDIA\
		WHEN 0 THEN 0\
		ELSE (\
			CASE\
			WHEN ((ULTIMO_VENCIMENTO+250) - 90 - HOR_FINAL) LIKE '%-%' THEN 0\
			ELSE FLOOR( CONVERT(DECIMAL(20,2),((ULTIMO_VENCIMENTO+250) - 90 - HOR_FINAL))/MEDIA ) END\
		)\
		END))\
	ELSE ULTIMO_VENCIMENTO END AS DIAS_1_PREV\
	\
	FROM\
	(SELECT *,\
	\
			DATEDIFF(day,  DATA_INICIAL, DATA_FINAL) AS DIAS_RODADOS,\
	\
			CASE DATEDIFF(day,  DATA_INICIAL, DATA_FINAL)\
			WHEN 0 THEN 0\
			ELSE ((HOR_FINAL - HOR_INICIAL ) / (DATEDIFF(day,  DATA_INICIAL, DATA_FINAL))) END AS MEDIA\
	\
	FROM\
	(SELECT a.IDOBJOF,\
		    b.DESCRICAO                                         AS TIPO,\
		    d.NOME                                              AS LOCAL,\
		    MIN(c.DATACOLETA)                                   AS DATA_INICIAL,\
		    MIN(c.VALORACUMULADO1)                              AS HOR_INICIAL,\
		    MAX(c.DATACOLETA)                                   AS DATA_FINAL,\
		    MAX(c.VALORACUMULADO1)                              HOR_FINAL,\
		    ( MAX(c.VALORACUMULADO1) - MIN(c.VALORACUMULADO1) ) AS HORAS_RODADAS,\
		    ISNULL((SELECT CASE\
		                WHEN ( TMOV.IDOBJOF LIKE '%AGR%' ) THEN LEFT(CONVERT(VARCHAR, DATACRIACAO, 120), 10)\
		                ELSE CAMPOLIVRE3\
		            END\
		    FROM   TMOV (NOLOCK)\
		    WHERE  IDMOV = (SELECT MAX(IDMOV)\
		                    FROM   TMOV (NOLOCK)\
		                    WHERE  a.CODCOLIGADA = TMOV.CODCOLIGADA\
		                            AND a.IDOBJOF = TMOV.IDOBJOF\
		                            AND TMOV.CODTMV = '1.1.22'\
		                            AND TMOV.STATUS <> 'C')\
									AND TMOV.IDOBJOF NOT IN ('%TCR%', '%TPE%', '%TPG%', '%TLA%', '%TGG%')), 0)    AS ULTIMO_VENCIMENTO,\
		    (SELECT DATAEXTRA2 FROM TMOV (NOLOCK) WHERE IDMOV = (SELECT MAX(IDMOV)\
		    FROM   TMOV (NOLOCK)\
		    WHERE  a.CODCOLIGADA = TMOV.CODCOLIGADA\
		            AND a.IDOBJOF = TMOV.IDOBJOF\
		            AND TMOV.CODTMV = '1.1.22'\
		            AND TMOV.STATUS <> 'C'))                     AS ULTIMA_PREVENTIVA,\
		    (SELECT MAX(NUMEROMOV)\
		    FROM   TMOV (NOLOCK)\
		    WHERE  a.CODCOLIGADA = TMOV.CODCOLIGADA\
		            AND a.IDOBJOF = TMOV.IDOBJOF\
		            AND TMOV.CODTMV = '1.1.22'\
		            AND TMOV.STATUS <> 'C')                      AS ULTIMA_PREVENTIVA_TERMINADA\
	\
	FROM   OFOBJOFICINA a (NOLOCK)\
	\
	LEFT OUTER JOIN OFOBJOFICINACOMPL (NOLOCK)\
	ON (A.CODCOLIGADA = OFOBJOFICINACOMPL.CODCOLIGADA AND A.IDOBJOF = OFOBJOFICINACOMPL.IDOBJOF)\
	\
	LEFT OUTER JOIN  OFTIPOOBJ b (NOLOCK)\
	ON (a.IDTIPOOBJ = b.IDTIPOOBJ)\
	\
	LEFT OUTER JOIN OFHISTINDICADOR c (NOLOCK)\
	ON (a.CODCOLIGADA = c.CODCOLIGADA AND a.IDOBJOF = c.IDOBJOF)\
	\
	LEFT OUTER JOIN ILOCAL d (NOLOCK)\
	ON (a.CODCOLIGADA = d.CODCOLIGADA AND a.CODLOCAL = d.CODLOCAL)\
	\
	LEFT OUTER JOIN GCONSIST (NOLOCK)\
	ON (OFOBJOFICINACOMPL.TIPOPREV = GCONSIST.CODCLIENTE AND GCONSIST.CODCOLIGADA = 0)\
	\
	WHERE  ( a.CODCOLIGADA = 1 )\
		    AND (( a.IDOBJOF LIKE 'T%' )\
		       	OR ( a.IDOBJOF LIKE 'L%' ))\
		    AND ( a.STATUS <> '9' )\
		    AND ( b.DESCRICAO NOT LIKE 'transmi%' )\
		    AND ( b.DESCRICAO NOT LIKE 'mot%' )\
		    AND ( b.DESCRICAO NOT LIKE 'caçam%' )\
		    AND ( c.DATACOLETA >= GETDATE() - 30 )\
			AND GCONSIST.CODCLIENTE = 'A1'\
	\
	GROUP  BY a.IDOBJOF, b.DESCRICAO, d.NOME, a.CODCOLIGADA) AS TABELA) AS TABELA\
	\
	WHERE LOCAL LIKE '%"+LOCAL+"%') AS TABELA\
	WHERE DIAS_1_PREV <= 45\
	ORDER BY LEN(DIAS_1_PREV), DIAS_1_PREV ASC, IDOBJOF ASC";

	
}