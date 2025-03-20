<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<%@ page import ="java.sql.*" %>
<%@ page import ="java.sql.Connection" %>
<%@ page import ="java.sql.DriverManager" %>
<%@ page import ="java.sql.SQLException" %>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SMA - Observaciones</title>
    <link rel="stylesheet" href="style.css">
    <link rel="icon" href="images/logo.png">
</head>
<body style="min-width: 500px;">
    <header>
        <div class="logo">
            <a href="https://www.astromalaga.es/" target="_blank">
                <img src="images/logo-sma.png">
            </a>
        </div>
        <div class="menu">
            <nav class="botones">
            	<a href="index.jsp" class="navlink">Home</a>
                <a href="meteoros.jsp" class="navlink">Meteors</a>
                <a href="observatorios.jsp" class="navlink">Observatories</a>
                <a href="lluvias.jsp" class="navlink">Showers</a>
                <a href="ayuda.jsp" class="navlink">?</a>
            </nav>
        </div>
    </header>
    <% 
    	String dateIn = request.getParameter("fechaIn"); 
    	String dateFin = request.getParameter("fechaFin"); 
    	String inf = request.getParameter("informe");
		String todos = "todos"; String z = "Z"; String r = "R"; String f = "F";
    %>
    
    <div class="filtro">
    <form action="meteoros.jsp">
    
    <div class="seleccion"><label for="fecha">Select a start date:</label>
			<input type="date" id="fechaIn" name="fechaIn">
		  </div>
		  
	<div class="seleccion"><label for="fecha">Select an end date:</label>
			<input type="date" id="fechaFin" name="fechaFin">
		  </div>
		  
	<div class="seleccion"><label for="filtro">Type of report:</label>
		  <select id="informe" name="informe" class="informes">
		  <%   if (z.equals(inf)){  %>
		    <option value="Z" selected="selected">Two stations</option>
		  <% } else { %>
		  	<option value="Z">Two stations</option>
		  <% } if (r.equals(inf)){  %>
		    <option value="R" selected="selected">One station</option>
		  <% } else { %>
		  	<option value="R">One station</option>
		  <% } if (f.equals(inf)){  %>
		    <option value="F" selected="selected">Photometry</option>
		  <% } else { %>
		  	<option value="F">Photometry</option>
		  <% } if (todos.equals(inf)){  %>
		    <option value="todos" selected="selected">All types</option>
		  <% } else { %>
		  	<option value="todos">All types</option>
		  <% } %>
		  </select></div>
		  <button type="submit">Filterr</button>  
	</form></div>
	
	<div class="descarga" style="margin-right:15px">
		<div class="menu">
            <nav class="botones">
            	<a class="navlink">Download</a>
            </nav>
        </div>
	</div>
	
	<div class="conjunto">
    <div class="datos">
    	<table>
		<tr>
			<th>  Date  </th>
			<th>  Hour  </th>
		</tr>
	<tbody>
	<%
	
        String ConexionUrl = "jdbc:mysql://localhost:3306/informes"
                    + "?user=sma"
                    + "&password=sma2025"
                    ;
        try {
                Class.forName("com.mysql.jdbc.Driver");
        } catch (ClassNotFoundException e) {
                System.out.println("Error al cargar el driver: " + e.getMessage());
        }
		
		try {
			Connection con = DriverManager.getConnection(ConexionUrl);
			String consulta = "SELECT Identificador, Fecha, Hora FROM Meteoro ORDER BY Fecha";
			
			if ((todos.equals(inf) || todos == null ) && (dateIn == null || dateIn == "") && (dateFin == null || dateFin == "")){
				consulta = "SELECT Identificador, Fecha, Hora FROM Meteoro ORDER BY Fecha";
			} else if (todos.equals(inf)){
				consulta = "SELECT Identificador, Fecha, Hora FROM Meteoro WHERE Fecha > '"+dateIn+"' and Fecha < '"+dateFin+"' ORDER BY Fecha";
			} else if (z.equals(inf) && (dateIn == null || dateIn == "") && (dateFin == null || dateFin == "")){
				consulta = "SELECT DISTINCT z.Meteoro_Identificador, m.Fecha, m.hora FROM Informe_Z z JOIN Meteoro m ON m.Identificador = z.Meteoro_Identificador ORDER BY Fecha";
			} else if (r.equals(inf) && (dateIn == null || dateIn == "") && (dateFin == null || dateFin == "")){
				consulta = "SELECT DISTINCT r.Meteoro_Identificador, m.Fecha, m.hora FROM Informe_Radiante r JOIN Meteoro m ON m.Identificador = r.Meteoro_Identificador ORDER BY Fecha";
			} else if (f.equals(inf) && (dateIn == null || dateIn == "") && (dateFin == null || dateFin == "")){
				consulta = "SELECT DISTINCT f.Meteoro_Identificador, m.Fecha, m.hora FROM Informe_Fotometria f JOIN Meteoro m ON m.Identificador = f.Meteoro_Identificador ORDER BY Fecha";
			} else if (z.equals(inf)){
				consulta = "SELECT DISTINCT z.Meteoro_Identificador, m.Fecha, m.hora FROM Informe_Z z JOIN Meteoro m ON m.Identificador = z.Meteoro_Identificador WHERE m.Fecha > '"+dateIn+"' and m.Fecha < '"+dateFin+"' ORDER BY Fecha";
			} else if (r.equals(inf)){
				consulta = "SELECT DISTINCT r.Meteoro_Identificador, m.Fecha, m.hora FROM Informe_Radiante r JOIN Meteoro m ON m.Identificador = r.Meteoro_Identificador WHERE m.Fecha > '"+dateIn+"' and m.Fecha < '"+dateFin+"' ORDER BY Fecha";
			} else if (f.equals(inf)){
				consulta = "SELECT DISTINCT f.Meteoro_Identificador, m.Fecha, m.hora FROM Informe_Fotometria f JOIN Meteoro m ON m.Identificador = f.Meteoro_Identificador WHERE m.Fecha > '"+dateIn+"' and m.Fecha < '"+dateFin+"' ORDER BY Fecha";
			}

			PreparedStatement pst = con.prepareStatement(consulta);
			ResultSet resultado = pst.executeQuery();
			
			while(resultado.next()){
				String fecha = resultado.getString(2);
				String hora = "";
				if (resultado.getString(3).length() == 8){
					hora = resultado.getString(3);
				} else {
					hora = resultado.getString(3).substring(0, resultado.getString(3).length() - 5);
				}
				String id = resultado.getString(1);
				
			
			%>
				<tr>
					<td> <%= fecha %>	</td>
					<td> <a href="informes.jsp?id=<%=id%>"> <%= hora %> </a></td>
				</tr>
			<%
				}
	%>
		</table>
	<%
		} catch(SQLException ex) {
			System.out.println(ex.toString());
		}
	%>
    </div></div>
</body>
</html>
