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
<body style="min-width: 800px;">
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
    <div class="conjunto">
    <h3 class="titulodiv">List of active observatories</h3>
    <div class="datos">
    	<table>
		<tr>
			<th><abbr title="Number assigned to the observatory, this number will appear in the reports as a reference to the observatory.">Camera identifier</abbr></th>
			<th><abbr title="Observatory name">Observatory</abbr></th>
			<th><abbr title="Longitude referring to the coordinates where the observatory is located">Longitude</abbr></th>
			<th><abbr title="Latitude referring to the coordinates where the observatory is located">Latitude</abbr></th>
			<th><abbr title="Altitude referring to the coordinates where the observatory is located">Altitude</abbr></th>
			<th><abbr title="Persons or institutions to be cited in images and videos">Credits</abbr></th>
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
			PreparedStatement pst = con.prepareStatement("Select Número, Nombre_Observatorio, Longitud_Sexagesimal, Latitud_Sexagesimal, Altitud, Créditos from Observatorio WHERE Activo = 1");
			ResultSet resultado = pst.executeQuery();
			
			while(resultado.next()){
				String num = resultado.getString(1);
				String nombre = resultado.getString(2);
				String longt = resultado.getString(3);
				String lat = resultado.getString(4);
				String alt = resultado.getString(5);
				String cred = resultado.getString(6);
				
			
			%>
				<tr>
					<td> <%= num %>	</td>
					<td> <%= nombre %> </td>
					<td> <%= longt %> </td>
					<td> <%= lat %> </td>
					<td> <%= alt %> </td>
					<td> <%= cred %> </td>
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
