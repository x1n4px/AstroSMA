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
        <% String dato = request.getParameter("id"); %>
	
	<div class="descarga" style="margin-right:15px">
		<div class="menu">
            <nav class="botones">
            	<a class="navlink">Download</a>
            </nav>
        </div>
	</div>
	
	<div class="conjunto">
    <h3 class="titulodiv">Report data</h3>
	<div class="datos">
    	<table>
		<tr>
			<th><abbr title="Date on which the photometry report was generated">Date</abbr></th>
			<th><abbr title="Time at which the photometry report was generated">Hour</abbr></th>
			<th><abbr title="Visible stars at the time of generating the report">Visible stars</abbr></th>
			<th><abbr title="Of the set of visible stars, which ones were used for the regression calculation">Stars used in regression</abbr></th>
			<th><abbr title="Bouger's line: Correction made to the light intensity measurements of a celestial object.">Bouger's line: External coefficient</abbr></th>
			<th><abbr title="Bouger's line: Correction made to the light intensity measurements of a celestial object.">Bouger's line: Zero point</abbr></th>
			<th><abbr title="Standard error in the regression calculation">Regression standard error</abbr></th>
			<th><abbr title="Standard error in the calculation of the zero point">Standard zero point error</abbr></th>
			<th><abbr title="Standard error in the calculation of the external coefficient">Standard error external coefficient</abbr></th>
			<th><abbr title="Coefficients corresponding to the equation of the parabola of the meteor's trajectory">Path parabola coefficients</abbr></th>
			<th>MagMax</th>
			<th>MagMin</th>
			<th><abbr title="The mass of a celestial object estimated from its brightness or luminosity measured at a given wavelength.">Photometric mass</abbr></th>
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
			PreparedStatement pst = con.prepareStatement("SELECT * FROM Informe_Fotometria WHERE Identificador="+dato+"");
			ResultSet resultado = pst.executeQuery();
			
			while(resultado.next()){
				String fecha = resultado.getString(2);
				String hora = "";
				if (resultado.getString(3).length() == 8){
					hora = resultado.getString(3);
				} else {
					hora = resultado.getString(3).substring(0, resultado.getString(3).length() - 5);
				}
				String est = resultado.getString(4);
				String estV = resultado.getString(5);
				String coe = resultado.getString(6);
				String p0 = resultado.getString(7);
				String erR = resultado.getString(8);
				String erP = resultado.getString(9);
				String erC = resultado.getString(10);
				String coePa = resultado.getString(11);
				String maMax = resultado.getString(12);
				String maMin = resultado.getString(13);
				String maFo = resultado.getString(14);
			%>
				<tr>
					<td> <%= fecha %></td>
					<td> <%= hora %></td>
					<td> <%= est %></td>
					<td> <%= estV %></td>
					<td> <%= coe %></td>
					<td> <%= p0 %></td>
					<td> <%= erR %></td>
					<td> <%= erP %></td>
					<td> <%= erC %></td>
					<td> <%= coePa %></td>
					<td> <%= maMax %></td>
					<td> <%= maMin %></td>
					<td> <%= maFo %></td>
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
    <h3 class="titulodiv">Stars used in regression</h3>
    <div class="datos">
    	<table>
		<tr>
			<th><abbr title="Star identifier">Star id</abbr></th>
			<th><abbr title="Amount of matter that makes up the star measured in units of solar mass.">Air mass</abbr></th>
			<th><abbr title="Value used to describe the brightness of a star relative to other stars.">Catalog magnitude</abbr></th>
			<th><abbr title="Measurement of the brightness of a star obtained through an observation instrument.">Instrumental magnitude</abbr></th>
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
			PreparedStatement pst = con.prepareStatement("SELECT * FROM Estrellas_usadas_para_regresión WHERE Informe_Fotometria_Identificador="+dato+"");
			ResultSet resultado = pst.executeQuery();
			
			while(resultado.next()){
				String id = resultado.getString(2);
				String ma = resultado.getString(3);
				String magc = resultado.getString(4);
				String magi = resultado.getString(5);
			%>
				<tr>
					<td> <%= id %></td>
					<td> <%= ma %></td>
					<td> <%= magc %></td>
					<td> <%= magi %></td>
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
    <h3 class="titulodiv">Meteor data</h3>
    <div class="datos">
    	<table>
		<tr>
			<th> X (Start) </th>
			<th> Y (Start) </th>
			<th> Air mass (Start) </th>
			<th> Distance (Start) </th>
			<th> X (End) </th>
			<th> Y (End) </th>
			<th> Air mass (End) </th>
			<th> Distance (End) </th>
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
			PreparedStatement pst = con.prepareStatement("SELECT * FROM Datos_meteoro_fotometria WHERE Informe_Fotometria_Identificador="+dato+"");
			ResultSet resultado = pst.executeQuery();
			
			while(resultado.next()){
				String xI = resultado.getString(1);
				String yI = resultado.getString(2);
				String mI = resultado.getString(3);
				String dI = resultado.getString(4);
				String xF = resultado.getString(5);
				String yF = resultado.getString(6);
				String mF = resultado.getString(7);
				String dF = resultado.getString(8);
			%>
				<tr>
					<td> <%= xI %></td>
					<td> <%= yI %></td>
					<td> <%= mI %></td>
					<td> <%= dI %></td>
					<td> <%= xF %></td>
					<td> <%= yF %></td>
					<td> <%= mF %></td>
					<td> <%= dF %></td>
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
    <h3 class="titulodiv">Adjustment points</h3>
    <div class="datos">
    	<table>
		<tr>
			<th> t </th>
			<th> Distance </th>
			<th> Mc </th>
			<th> Ma </th>
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
			PreparedStatement pst = con.prepareStatement("SELECT * FROM Puntos_del_ajuste WHERE Informe_Fotometria_Identificador="+dato+"");
			ResultSet resultado = pst.executeQuery();
			
			while(resultado.next()){
				String t = resultado.getString(1);
				String dis = resultado.getString(2);
				String mc = resultado.getString(3);
				String ma = resultado.getString(4);
			%>
				<tr>
					<td> <%= t %></td>
					<td> <%= dis %></td>
					<td> <%= mc %></td>
					<td> <%= ma %></td>
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
