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
<body style="min-width: 600px;">
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
    	String lluvia = request.getParameter("lluvia");
	    String yearF = request.getParameter("year");
		String todos = "todos";
    %>
    <div class="filtro">
    <form action="lluvias.jsp">
		  <div class="seleccion"><label for="filtro">Shower:</label>
		  <select id="lluvia" name="lluvia">
		  	<%
			if(lluvia == null){
				lluvia = "todos";
			}
		  	if(yearF == null){
		  		yearF = "2023";
		  	}
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
					PreparedStatement pst = con.prepareStatement("SELECT DISTINCT Identificador FROM Lluvia");
					ResultSet resultado = pst.executeQuery();
					
					while(resultado.next()){
						String id = resultado.getString(1);
						
						if(id.equals(lluvia)) {
						%>		
							<option value="<%=id %>" selected="selected"><%=id %></option>
						<%
							
						} else {
						%>
							<option value="<%=id %>"><%=id %></option>
						<%
						}
						}
				} catch(SQLException ex) {
					System.out.println(ex.toString());
				}
			if(todos.equals(lluvia)){
				%> 
					<option value="todos" selected="selected">All</option>
				<% 
			} else{
				%> 
				<option value="todos">All</option>
				<% 
			}
			%>
		  </select></div>
		  <div class="seleccion"><label for="filtro">Year:</label>
		  <select id="year" name="year">
		  	<%
				try { 
             				 Class.forName("com.mysql.jdbc.Driver");
				} catch (ClassNotFoundException e) {
					System.out.println("Error: " + e.getMessage()); 
				}
				
				try {
					Connection con = DriverManager.getConnection(ConexionUrl);
					PreparedStatement pst = con.prepareStatement("SELECT DISTINCT A�o FROM Lluvia");
					ResultSet resultado = pst.executeQuery();
					
					while(resultado.next()){
						String id = resultado.getString(1);
										
						if(id.equals(yearF)) {
						%>		
							<option value="<%=id %>" selected="selected"><%=id %></option>
						<%
							
						} else {
						%>
							<option value="<%=id %>"><%=id %></option>
						<%
						}
						}
				} catch(SQLException ex) {
					System.out.println(ex.toString());
				}
			if(todos.equals(yearF)){
				%> 
					<option value="todos" selected="selected">All</option>
				<% 
			} else{
				%> 
				<option value="todos">All</option>
				<% 
			}
			%>
		  </select></div>
		  <button type="submit">Filter</button>
	</form>
	</div>
	
	<div class="conjunto">
    <div class="datos">
    	<table>
		<tr>
			<th><abbr title="Year of the calendar">Year</abbr></th>
			<th><abbr title="Abbreviated name used to identify shower">Identifier</abbr></th>
			<th><abbr title="Full name of the shower">Name</abbr></th>
			<th><abbr title="Date on which the shower starts (YYYYY-MM-DD)">Start date</abbr></th>
			<th><abbr title="Date on which shower ends (YYYYY-MM-DD)">End date</abbr></th>
			<th><abbr title="Shower velocity">Velocity</abbr></th>
		</tr>
	<tbody>
	<%
		try { 
       		         Class.forName("com.mysql.jdbc.Driver");
		} catch (ClassNotFoundException e) {
			System.out.println("Error: " + e.getMessage()); 
		}
		
		try {
			Connection con = DriverManager.getConnection(ConexionUrl);
			int contador = 0;
			String consulta = "SELECT A�o, Identificador, Nombre, Fecha_Inicio, Fecha_Fin, Velocidad FROM Lluvia ORDER BY A�o DESC, Fecha_Inicio";		
			if(!todos.equals(lluvia) && !todos.equals(yearF) && lluvia != null && yearF != null){
				consulta = "SELECT A�o, Identificador, Nombre, Fecha_Inicio, Fecha_Fin, Velocidad FROM Lluvia WHERE Identificador = '"+lluvia+"' AND A�o = '"+yearF+"' ORDER BY A�o DESC, Fecha_Inicio";
			} else if (todos.equals(lluvia) && !todos.equals(yearF)){
				consulta = "SELECT A�o, Identificador, Nombre, Fecha_Inicio, Fecha_Fin, Velocidad FROM Lluvia WHERE A�o = '"+yearF+"' ORDER BY Fecha_Inicio";
			} else if (!todos.equals(lluvia) && todos.equals(yearF)) {
				consulta = "SELECT A�o, Identificador, Nombre, Fecha_Inicio, Fecha_Fin, Velocidad FROM Lluvia WHERE Identificador = '"+lluvia+"' ORDER BY A�o DESC";
			}
			PreparedStatement pst = con.prepareStatement(consulta);
			ResultSet resultado = pst.executeQuery();
			
			while(resultado.next()){
				String year = resultado.getString(1);
				String id = resultado.getString(2);
				String nomb = resultado.getString(3);
				String inicio = resultado.getString(4);
				String fin = resultado.getString(5);
				String v = resultado.getString(6);
				
				if(nomb.equals("Alfa-capric�rnidas"))nomb="Alpha-Capricornids";
				if(nomb.equals("Alfa-cent�uridas"))nomb="Alpha-Centaurides";
				if(nomb.equals("Alfa-monocer�tidas"))nomb="Alpha-Monocerotids";
				if(nomb.equals("Antihelio"))nomb="Antihelium";
				if(nomb.equals("Ari�tidas diurnas"))nomb="Daytime Arietids";
				if(nomb.equals("Aur�gdas"))nomb="Aurigids";
				if(nomb.equals("Aur�gidas"))nomb="Aurigids";
				if(nomb.equals("Bo�tidas de junio"))nomb="June Bootids";
				if(nomb.equals("Camelop�rcidas de octubre"))nomb="October Camelopardalids";
				if(nomb.equals("Comaberen�cidas"))nomb="Comae Berenicids";
				if(nomb.equals("Cuadr�ntidas"))nomb="Quadrantids";
				if(nomb.equals("Delta-acu�ridas Sur"))nomb="Southern delta-Aquariids";
				if(nomb.equals("Delta-aur�gidas"))nomb="October delta-Aurigids";
				if(nomb.equals("Diurnas de Aries"))nomb="Daytime Arietids";
				if(nomb.equals("Diurnas de Sextante"))nomb="Daytime Sextantids";
				if(nomb.equals("Drag�nidas"))nomb="October Draconids";
				if(nomb.equals("�psilon-gem�nidas"))nomb="epsilon-Geminids";
				if(nomb.equals("�psilon-perseidas de septiembre"))nomb="September epsilon-Perseids";
				if(nomb.equals("Eta-acu�ridas"))nomb="eta-Aquariids";
				if(nomb.equals("Eta-lyridas"))nomb="eta-Lyrids";
				if(nomb.equals("Fen�cidas"))nomb="Phoenicids";
				if(nomb.equals("Foen�cidas"))nomb="Phoenicids";
				if(nomb.equals("Gamma-Drag�nidas de julio"))nomb="July gamma-Draconids";
				if(nomb.equals("Gamma-n�rmidas"))nomb="Gamma-Normids";
				if(nomb.equals("Gamma-�rsidas-min�ridas"))nomb="Gamma-Ursae Minorids";
				if(nomb.equals("Gem�nidas"))nomb="Geminids";
				if(nomb.equals("Kappa-cygnidas"))nomb="Kappa-Cygnids";
				if(nomb.equals("Leomen�ridas"))nomb="Leonis Minorids";
				if(nomb.equals("Leomen�ridas de diciembre"))nomb="December Leonis Minorids";
				if(nomb.equals("Leomin�ridas"))nomb="Leonis Minorids";
				if(nomb.equals("Leomin�ridas de diciembre"))nomb="December Leonis Minorids";
				if(nomb.equals("Le�nidas"))nomb="Leonids";
				if(nomb.equals("Lyridas"))nomb="April Lyrids";
				if(nomb.equals("Monocer�tidas"))nomb="December Monocerotids";
				if(nomb.equals("N-t�uridas"))nomb="Northern Taurids";
				if(nomb.equals("Ori�nidas"))nomb="Orionids";
				if(nomb.equals("Ori�nidas de noviembre"))nomb="November Orionids";
				if(nomb.equals("Peg�sidas de julio"))nomb="July Pegasids";
				if(nomb.equals("Perseidas"))nomb="Perseids";
				if(nomb.equals("Pi-p�pidas"))nomb="pi-Puppids";
				if(nomb.equals("Piscisaustr�lidas"))nomb="Piscis Austrinids";
				if(nomb.equals("Pupid-C�lidas"))nomb="Gamma-Puppids";
				if(nomb.equals("Pupid-V�lidas"))nomb="Gamma-Puppids";
				if(nomb.equals("Quadr�ntidas"))nomb="Quadrantids";
				if(nomb.equals("Sext�ntidas diurnas"))nomb="Daytime Sextantids";
				if(nomb.equals("Sigma-hydridas"))nomb="sigma-Hydrids";
				if(nomb.equals("T�uridas Norte"))nomb="Southern Taurids";
				if(nomb.equals("T�uridas Sur"))nomb="Northern Taurids";
				if(nomb.equals("�rsidas"))nomb="Ursids";
				
			
			%>
				<tr>
					<td> <%= year %>	</td>
					<td> <%= id %> </td>
					<td> <%= nomb %> </td>
					<td> <%= inicio %> </td>
					<td> <%= fin %> </td>
					<td> <%= v %> </td>
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
