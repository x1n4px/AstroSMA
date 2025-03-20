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
<body style="min-width: 1000px;">
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
        <% String dato = request.getParameter("id"); %>
	
	<div class="descarga" style="margin-right:15px">
		<div class="menu">
            <nav class="botones">
            	<a class="navlink">Download</a>
            </nav>
        </div>
	</div>
	
	<div class="conjunto">
    <h3 class="titulodiv">Lluvias activas</h3>
	<div class="datos">
    	<table>
		<tr>
			<th> Identifier </th>
			<th> Minimum distance (Ra of date)  </th>
			<th> Minimum distance (De of date) </th>
			<th> Minimum distance (Closer Ra) </th>
			<th> Minimum distance (Closer De) </th>
			<th> Distance </th>
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
			PreparedStatement pst = con.prepareStatement("SELECT * FROM Lluvia_Activa_InfRad WHERE Informe_Radiante_Identificador="+dato+"");
			ResultSet resultado = pst.executeQuery();
			
			while(resultado.next()){
				String arf = resultado.getString(1);
				String def = resultado.getString(2);
				String arc = resultado.getString(3);
				String dec = resultado.getString(4);
				String dist = resultado.getString(5);
				String id = resultado.getString(7);
			%>
				<tr>
					<td> <%= id %></td>
					<td> <%= arf %></td>
					<td> <%= def %></td>
					<td> <%= arc %></td>
					<td> <%= dec %></td>
					<td> <%= dist %></td>
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
    
    <div class="conjunto">
    <h3 class="titulodiv">Estimated trajectory</h3>
    <div class="datos">
    	<table>
		<tr>
			<th><abbr title="Estimated meteor velocity">Velocity</abbr></th>
			<th><abbr title="Initial longitude of meteor coordinates">Lon (Start)</abbr></th>
			<th><abbr title="Initial latitude of meteor coordinates">Lat (Start)</abbr></th>
			<th><abbr title="Initial altitude of meteor coordinates">Alt (Start)</abbr></th>
			<th><abbr title="Initial distance of meteor coordinates">Dist (Start)</abbr></th>
			<th><abbr title="Final longitude of meteor coordinates">Lon (End)</abbr></th>
			<th><abbr title="Final latitude of meteor coordinates">Lat (End)</abbr></th>
			<th><abbr title="Final altitude of meteor coordinates">Alt (End)</abbr></th>
			<th><abbr title="Final distance of meteor coordinates">Dist (End)</abbr></th>
			<th><abbr title="Distance traveled">Recor</abbr></th>
			<th><abbr title="Estimated distance traveled">e</abbr></th>
			<th><abbr title="Estimated time">t</abbr></th>
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
			PreparedStatement pst = con.prepareStatement("SELECT * FROM Trayectoria_estimada WHERE Informe_Radiante_Identificador="+dato+"");
			ResultSet resultado = pst.executeQuery();
			
			while(resultado.next()){
				String vel = resultado.getString(1);
				String lonI = resultado.getString(2);
				String latI = resultado.getString(3);
				String altI = resultado.getString(4);
				String distI = resultado.getString(5);
				String lonF = resultado.getString(6);
				String latF = resultado.getString(7);
				String altF = resultado.getString(8);
				String distF = resultado.getString(9);
				String rec = resultado.getString(10);
				String e = resultado.getString(11);
				String t = resultado.getString(12);
			%>
				<tr>
					<td> <%= vel %></td>
					<td> <%= lonI %></td>
					<td> <%= latI %></td>
					<td> <%= altI %></td>
					<td> <%= distI %></td>
					<td> <%= lonF %></td>
					<td> <%= latF %></td>
					<td> <%= altF %></td>
					<td> <%= distF %></td>
					<td> <%= rec %></td>
					<td> <%= e %></td>
					<td> <%= t %></td>
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
    
    <div class="conjunto">
    <h3 class="titulodiv">Angular velocities</h3>
    <div class="datos">
    	<table border="1">
		<tr>
			<th><abbr title="Estimated height">hi</abbr></th>
			<th>Shower</th>
			<th>Meteor</th>
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
			PreparedStatement pst = con.prepareStatement("SELECT * FROM Velociades_Angulares WHERE Informe_Radiante_Identificador="+dato+"");
			ResultSet resultado = pst.executeQuery();
			
			while(resultado.next()){
				String hi = resultado.getString(1);
				String llu = resultado.getString(2);
				String met = resultado.getString(3);
			%>
				<tr>
					<td> <%= hi %></td>
					<td> <%= llu %></td>
					<td> <%= met %></td>
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
