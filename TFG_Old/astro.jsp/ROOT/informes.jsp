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
<body style="min-width: 900px;">
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
    
    <div class="descarga" style="margin-right:15px">
		<div class="menu">
            <nav class="botones">
            	<a class="navlink">Download</a>
            </nav>
        </div>
	</div>
    
		<% String dato = request.getParameter("id"); %>
	<div class="conjunto">
    <h3 class="titulodiv"><abbr title="Report generated when the same fireball or meteor is captured by two or more observatories. For each pair of stations that capture it, two different reports will be generated. These reports contain much more information than the following ones, so they are the ones used to draw conclusions and check data from them.">Two stations reports</abbr></h3>
	<div class="datos">
    	<table>
		<tr>
			<th><abbr title="Identifier of the report generated on the selected meteor.">ID</abbr></th>
			<th>Date</th>
			<th>Hour</th>
			<th><abbr title="First observatory to participate in the report">First observatory</abbr></th>
			<th><abbr title="Second observatory to participate in the report">Second observatory</abbr></th>				
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
			PreparedStatement pst = con.prepareStatement("SELECT * FROM Informe_Z WHERE Meteoro_Identificador="+dato+"");
			ResultSet resultado = pst.executeQuery();
			
			while(resultado.next()){
				String id = resultado.getString(1);
				String obsv2 = resultado.getString(2);
				String obsv1 = resultado.getString(3);
				String fecha = resultado.getString(4);
				String hora = "";
				if (resultado.getString(5).length() == 8){
					hora = resultado.getString(5);
				} else {
					hora = resultado.getString(5).substring(0, resultado.getString(5).length() - 5);
				}		
			%>
				<tr>
					<td> <a href="datos.jsp?id=<%=id%>"> <%= id %> </a></td>
					<td> <%= fecha %></td>
					<td> <%= hora %></td>
					<td> <%= obsv1 %></td>
					<td> <%= obsv2 %></td>
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
    <h3 class="titulodiv"><abbr title="Report generated when a fireball or meteor is captured only by an observatory. There are two types of reports: if the meteor was not associated with any of the active showers close to that date, a very brief report is generated. On the other hand, if this meteor has been associated with any of the rains, a more extensive report is generated.
        These reports, containing much less information than the previous ones, are usually used to calculate regions from which it should have been seen at other observatories, to check by hand at these observatories and to generate Z-Reports in case it is visible at one of them. Of these there are three types: 1. Those in which the meteor has not been associated with any rain. 2. 2. Those that have been associated with a rainfall and, in addition, the weather is known.
		weather is known. 3. Those associated with a rainfall with no known weather.">One station report</abbr></h3>
    <div class="datos">
    	<table>
		<tr>
			<th><abbr title="Identifier of the report generated on the selected meteor.">ID</abbr></th>
			<th>Date</th>
			<th>Hour</th>
			<th><abbr title="Observatory participates in the generation of the report">Observatory</abbr></th>
			<th><abbr title="Shower with which the meteor has been associated."></abbr>Associated Rain</th>
			<th><abbr title="Three possibilities for trajectory estimation: Height range, Time, No measurements.">Estimated trajectories for</abbr></th>
			<th><abbr title="Angular distance between start and end. Measured in radians">Angular distance (Radians)</abbr></th>
			<th><abbr title="Angular distance between start and end. Measured in degrees">Angular distance (Degrees)</abbr></th>
			<th><abbr title="A measure of how fast a star moves across the sky. It is expressed in degrees per second, and is used to describe the apparent motion of a star on the celestial sphere.">Angular velocity (Degrees/s)</abbr></th>			
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
			PreparedStatement pst = con.prepareStatement("SELECT * FROM Informe_Radiante WHERE Meteoro_Identificador="+dato+"");
			ResultSet resultado = pst.executeQuery();
			
			while(resultado.next()){
				String id = resultado.getString(1);
				String fecha = resultado.getString(2);
				String hora = "";
				if (resultado.getString(3).length() == 8){
					hora = resultado.getString(3);
				} else {
					hora = resultado.getString(3).substring(0, resultado.getString(3).length() - 5);
				}
				String vll = resultado.getString(4);
				String trayec = resultado.getString(5);
				String distR = resultado.getString(7);
				String distG = resultado.getString(8);
				String vAng = resultado.getString(9);	
				String obsv = resultado.getString(10);
				String lluvia = resultado.getString(11);
			%>
				<tr>
					<td> <a href="datosRad.jsp?id=<%=id%>"> <%= id %> </a></td>
					<td> <%= fecha %></td>
					<td> <%= hora %></td>
					<td> <%= obsv %></td>
					<td> <%= lluvia %></td>
					<td> <%= trayec %></td>
					<td> <%= distR %></td>
					<td> <%= distG %></td>
					<td> <%= vAng %></td>
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
    </div> </div>
    
    <div class="conjunto">
    <h3 class="titulodiv"><abbr title="Report generated only when there is a photo of the meteor. In these reports, from all the points extracted from the trajectory in that image, they are used to calculate values such as the Bouger line and the photometric mass of the bolide.">Photometry report</abbr></h3>
    <div class="datos">
    	<table>
		<tr>
			<th><abbr title="Identifier of the report generated on the selected meteor.">ID</abbr></th>
			<th>Date</th>
			<th>Hour</th>
			<th><abbr title="Visible stars at the time of generating the report">Visible starss</abbr></th>
			<th><abbr title="Of the set of visible stars, which ones were used for the regression calculation">Stars used in regression</abbr></th>		
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
			PreparedStatement pst = con.prepareStatement("SELECT * FROM Informe_Fotometria WHERE Meteoro_Identificador="+dato+"");
			ResultSet resultado = pst.executeQuery();

			
			while(resultado.next()){
				String id = resultado.getString(1);
				String fecha = resultado.getString(2);
				String hora = "";
				if (resultado.getString(3).length() == 8){
					hora = resultado.getString(3);
				} else {
					hora = resultado.getString(3).substring(0, resultado.getString(3).length() - 5);
				}
				String str = resultado.getString(4);
				String strV = resultado.getString(5);
				
			%>
				<tr>
					<td> <a href="fotometria.jsp?id=<%=id%>"> <%= id %> </a></td>
					<td> <%= fecha %></td>
					<td> <%= hora %></td>
					<td> <%= str %></td>
					<td> <%= strV %></td>

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
