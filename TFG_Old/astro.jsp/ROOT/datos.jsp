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
	
	<div class="descarga" style="margin-right:15px">
		<div class="menu">
            <nav class="botones">
            	<a class="navlink">Download</a>
            </nav>
        </div>
	</div>
	
	<% String dato = request.getParameter("id"); 
	
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
		PreparedStatement pst = con.prepareStatement("SELECT Observatorio_Número, Fecha, Hora FROM Informe_Z WHERE IdInforme="+dato+"");
		ResultSet resultado = pst.executeQuery();
		String obs = "", fecha, hora = "";
		
		while(resultado.next()){
			obs = resultado.getString(1);
			fecha = resultado.getString(2);
			hora = resultado.getString(3);
			
			pst = con.prepareStatement("SELECT Nombre_Observatorio FROM Observatorio WHERE Número="+obs+"");
			ResultSet resultado2 = pst.executeQuery();
			while(resultado2.next()){
				String nomCam = resultado2.getString(1);
				String Viso = "El Viso de Cordoba";
				String sant = "Satn Marti de Sesgueioles";
				nomCam = nomCam.replace("á", "a").replace("é", "e").replace("í", "i").replace("ó", "o").replace("ú", "u");
				nomCam = nomCam.replace("Á", "A").replace("É", "E").replace("Í", "I").replace("Ó", "O").replace("Ú", "U");
				nomCam = nomCam.replace("à", "a").replace("è", "e").replace("ì", "i").replace("ò", "o").replace("ù", "u");
				nomCam = nomCam.replace("À", "A").replace("È", "E").replace("Ì", "I").replace("Ò", "O").replace("Ù", "U");
				
				
				if(nomCam.equals(Viso)){
					nomCam = "El Viso";
				}
				if(nomCam.equals(sant)){
					nomCam = "Sant Marti de Sesgueioles";
				}
				String url = "http://www.astromalaga.es/sapito/" + fecha.substring(0, 4) + "/" + fecha.replaceAll("-", "") + hora.replaceAll(":", "").substring(0, 6) + "-" + nomCam.replaceAll(" ", "_").replaceAll("-", "_") + ".mp4"; 
				
				String dosuno = "2021";
				if(!fecha.substring(0, 4).equals(dosuno)){
				%>
				<div class="conjunto">
				<h3 class="ayuda"><a href=<%=url %> target="_blank">Meteor video</a></h3>
				</div>
				<%
				}
			}
		}
		
		


		
	} catch(SQLException ex) {
		System.out.println(ex.toString());
	}
	%>
	
	
	
	<div class="conjunto">
	<h3 class="titulodiv">Report Data</h3>
		<div class="datos">
    	<table>
		<tr>
			<th> Date </th>
			<th> Hour </th>
			<th><abbr title="First observatory to participate in the generation of the report">First observatory</abbr></th>
			<th><abbr title="Second observatory to participate in the generation of the report">Second observatory</abbr></th>
			<th><abbr title="Frames used in the generation of the report">Used frames</abbr></th>
			<th><abbr title="Dihedral angle between the planes determined by the trajectory and the stations">Dihedral angle between path planes</abbr></th>
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
			PreparedStatement pst = con.prepareStatement("SELECT * FROM Informe_Z WHERE IdInforme="+dato+"");
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
				String fotog = resultado.getString(8);
				String angDied = resultado.getString(11);
			%>
				<tr>
					<td> <%= fecha %></td>
					<td> <%= hora %></td>
					<td> <%= obsv1 %></td>
					<td> <%= obsv2 %></td>
					<td> <%= fotog %></td>
					<td> <%= angDied.substring(0, angDied.length() - 11) %></td>
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
    </div>
	
		<div class="datos">
		<h3 class="subt">Radiant</h3>
    	<table>
		<tr>
			<th><abbr title="Right ascension and declination of the radiant to date in degrees.">Coordinates to date</abbr></th>
			<th><abbr title="Right ascension and declination of the radiant at J2000 in degrees">Coordinates to J2000</abbr></th>	
			<th><abbr title="Azimuth of the radiant in degrees to the East">Azimuth</abbr></th>
			<th><abbr title="Zenith distance in degrees">Zenithal distance</abbr></th>	
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
			PreparedStatement pst = con.prepareStatement("SELECT * FROM Informe_Z WHERE IdInforme="+dato+"");
			ResultSet resultado = pst.executeQuery();
			
			while(resultado.next()){
				String azimut = resultado.getString(16);
				String distCen = resultado.getString(17);
				String eclipt = resultado.getString(14);
				String j2000 = resultado.getString(15);
			%>
				<tr>
					<td> <%= eclipt.substring(eclipt.lastIndexOf(":")+7, eclipt.length()) %></td>
					<td> <%= j2000.substring(j2000.lastIndexOf(":")+7, j2000.length()) %></td>
					<td> <%= azimut %></td>
					<td> <%= distCen %></td>
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
    </div>
    
    <div class="datos">
    	<h3 class="subt">Atmospheric Trajectory</h3>
    	<table>
		<tr>
			<th><abbr title="Geographical coordinates: Longitude and latitude">Start (station 1) </abbr></th>
			<th><abbr title="Distance in kilometers to station 1">Initial distance (station 1)</abbr></th>
			<th><abbr title="Altitude in kilometers as seen from station 1">Initial Altitude (station 1)</abbr></th>
			<th><abbr title="Geographical coordinates: Longitude and latitude">End (station 1) </abbr></th>
			<th><abbr title="Distance in kilometers to station 1">Final Distance (station 1)</abbr></th>
			<th><abbr title="Altitude in kilometers as seen from station 1">Final Altitude (station 1)</abbr></th>	
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
			PreparedStatement pst = con.prepareStatement("SELECT * FROM Informe_Z WHERE IdInforme="+dato+"");
			ResultSet resultado = pst.executeQuery();
			
			while(resultado.next()){
				String inTr1 = resultado.getString(18);
				String in11 = inTr1.substring(0,inTr1.indexOf(" ")-3);
				String in21 = inTr1.substring(inTr1.indexOf(" "),inTr1.lastIndexOf(":")+3);
				String d1 = inTr1.substring(inTr1.lastIndexOf(":")+7,inTr1.lastIndexOf(" ")-9);
				String h1 = inTr1.substring(inTr1.lastIndexOf(" ")+1,inTr1.length()-9);
				inTr1 = in11 + " " + in21;
				
				
				String fnTr1 = resultado.getString(19);
				String fn11 = fnTr1.substring(0,fnTr1.indexOf(" ")-3);
				String fn21 = fnTr1.substring(fnTr1.indexOf(" "),fnTr1.lastIndexOf(":")+3);
				String d2 = fnTr1.substring(fnTr1.lastIndexOf(":")+7,fnTr1.lastIndexOf(" ")-9);
				String h2 = fnTr1.substring(fnTr1.lastIndexOf(" ")+1,fnTr1.length()-9);
				fnTr1 = fn11 + " " + fn21;
				

			%>
				<tr>
					<td> <%= inTr1 %></td>
					<td> <%= d1 %></td>
					<td> <%= h1 %></td>
					<td> <%= fnTr1 %></td>
					<td> <%= d2 %></td>
					<td> <%= h2 %></td>
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
    </div>
    <div class="datos">
    	<table>
		<tr>
			<th><abbr title="Geographical coordinates: Longitude and latitude">Start (station 2) </abbr></th>
			<th><abbr title="Distance in kilometers to station 1">Initial distance (station 2)</abbr></th>
			<th><abbr title="Altitude in kilometers as seen from station 1">Initial Altitude (station 2)</abbr></th>
			<th><abbr title="Geographical coordinates: Longitude and latitude">End (station 2) </abbr></th>
			<th><abbr title="Distance in kilometers to station 1">Final Distance (station 2)</abbr></th>
			<th><abbr title="Altitude in kilometers as seen from station 1">Final Altitude (station 2)</abbr></th>		
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
			PreparedStatement pst = con.prepareStatement("SELECT * FROM Informe_Z WHERE IdInforme="+dato+"");
			ResultSet resultado = pst.executeQuery();
			
			while(resultado.next()){
				String inTr2 = resultado.getString(20);
				String in12 = inTr2.substring(0,inTr2.indexOf(" ")-3);
				String in22 = inTr2.substring(inTr2.indexOf(" "),inTr2.lastIndexOf(":")+3);
				String d1 = inTr2.substring(inTr2.lastIndexOf(":")+7,inTr2.lastIndexOf(" ")-9);
				String h1 = inTr2.substring(inTr2.lastIndexOf(" ")+1,inTr2.length()-9);
				inTr2 = in12 + " " + in22;
				
				String fnTr2 = resultado.getString(21);
				String fn12 = fnTr2.substring(0,fnTr2.indexOf(" ")-3);
				String fn22 = fnTr2.substring(fnTr2.indexOf(" "),fnTr2.lastIndexOf(":")+3);
				String d2 = fnTr2.substring(fnTr2.lastIndexOf(":")+7,fnTr2.lastIndexOf(" ")-9);
				String h2 = fnTr2.substring(fnTr2.lastIndexOf(" ")+1,fnTr2.length()-9);
				fnTr2 = fn12 + " " + fn22;
				

			%>
				<tr>
					<td> <%= inTr2 %></td>
					<td> <%= d1 %></td>
					<td> <%= h1 %></td>
					<td> <%= fnTr2 %></td>
					<td> <%= d2 %></td>
					<td> <%= h2 %></td>
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
    </div>
    		<div class="datos">
    	<table>
		<tr>
			<th><abbr title="Geographical coordinates of the intersection of the trajectory with the Earth.">Intersection with the earth</abbr></th>
			<th><abbr title="Distance traveled by the meteor at station 1">Distance traveled (station 1)</abbr></th>
			<th><abbr title="Distance traveled by the meteor at station 2">Distance traveled (station 2)</abbr></th>		
			<th><abbr title="Time in seconds that the meteor was present at station 1">Time at station 1</abbr></th>
			<th><abbr title="Time in seconds that the meteor was present at station 2">Time at station 2</abbr></th>
			<th><abbr title="Calculated average meteor velocity">Average velocity</abbr></th>
			<th><abbr title="Initial velocity calculated by regressionn">Initial velocity (station 2)</abbr></th>
			<th> Acceleration in Km/sec<sup>2</sup></th>	
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
			PreparedStatement pst = con.prepareStatement("SELECT * FROM Informe_Z WHERE IdInforme="+dato+"");
			ResultSet resultado = pst.executeQuery();
			
			while(resultado.next()){
				String dist1 = resultado.getString(23).substring(0,resultado.getString(23).length()-15);
				String dist2 = resultado.getString(26).substring(0,resultado.getString(26).length()-15);	
				
				String impacto = resultado.getString(22);
				String imp1 = impacto.substring(0,impacto.indexOf(" ")-3);
				String imp2 = impacto.substring(impacto.indexOf(" ")+1,impacto.length()-3);
				impacto = imp1 + " " + imp2;
				
				String tmest1 = resultado.getString(29);
				String vmedia = resultado.getString(30);
				String tmest2 = resultado.getString(31);
				String vIn2 = resultado.getString(35);
				String acKms = resultado.getString(36);
				
				String tmed2 = "No medida";
				String v2 = "No medida";
				String ak = "No medida";
				
				if(tmest2 != null){
					tmed2 = tmest2.substring(0,tmest2.length()-5);
				}
				if(vIn2 != null){
					v2 = vIn2.substring(0,vIn2.length()-13);
				}
				if(acKms != null){
					ak = acKms.substring(0,acKms.length()-7);
				}
			%>
				<tr>
					<td> <%= impacto %></td>
					<td> <%= dist1 %></td>
					<td> <%= dist2 %></td>
					<td> <%= tmest1.substring(0,tmest1.length()-5) %></td>
					<td> <%= tmed2 %></td>
					<td> <%= vmedia.substring(0,vmedia.length()-7) %></td>
					<td> <%= v2 %></td>
					<td> <%= ak %></td>
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
    </div>
</div>
	
	<div class="conjunto">
	<h3 class="titulodiv"><abbr title="Coordinates on the chip of the centroid of the trace left by the meteor.">Frames</abbr></h3>
	<div class="datos">
    	<table>
		<tr>
			<th> Date </th>
			<th> Hour </th>
			<th><abbr title="Coordinates of Right Ascension in sexagesimal">Ra Sexagesimal</abbr></th>
			<th><abbr title="Declination coordinates in sexagesimal">De Sexagesimal</abbr></th>
		
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
			PreparedStatement pst = con.prepareStatement("SELECT * FROM Puntos_ZWO WHERE Informe_Z_IdInforme="+dato+" ORDER BY Hora");
			ResultSet resultado = pst.executeQuery();
			
			while(resultado.next()){
				String fecha = resultado.getString(1);
				String hora = resultado.getString(2);
				String arS = resultado.getString(7);
				String deS = resultado.getString(8);
			
			%>
				<tr>
					<td> <%= fecha %></td>
					<td> <%= hora %></td>
					<td> <%= arS %></td>
					<td> <%= deS %></td>
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
    <h3 class="titulodiv">Trajectory</h3>
    <div class="datos">
    	<table>
		<tr>
			<th> Date </th>
			<th> Hour </th>
			<th><abbr title ="Distance traveled in kilometers">s</abbr></th>
			<th><abbr title ="Time between frames">t</abbr></th>
			<th><abbr title ="Velocity in the frame">v</abbr></th>
			<th><abbr title ="Geographic longitude">lambda</abbr></th>
			<th><abbr title ="Geographic Latitude">phi</abbr></th>
			<th><abbr title="Coordinates of Right ascension in sexagesimal from station 1">Ra (Station 1)</abbr></th>
			<th><abbr title="Declination coordinates in sexagesimal from station 1">De (Station 1)</abbr></th>
			<th><abbr title="Right ascension coordinates in sexagesimal from station 2">Ra (Station 2)</abbr></th>
			<th><abbr title="Right declination coordinates in sexagesimal from station 2">De (Station 2)</abbr></th>
		
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
			PreparedStatement pst = con.prepareStatement("SELECT * FROM Trayectoria_medida WHERE Informe_Z_IdInforme="+dato+"");
			ResultSet resultado = pst.executeQuery();
			
			while(resultado.next()){
				String fecha = resultado.getString(1);
				String hora = resultado.getString(2);
				String s = resultado.getString(3);
				String t = resultado.getString(4);
				String v = resultado.getString(5);
				String lambda = resultado.getString(6);
				String phi = resultado.getString(7);
				String ar1 = resultado.getString(8);
				String de1 = resultado.getString(9);
				String ar2 = resultado.getString(10);
				String de2 = resultado.getString(11);
			
			%>
				<tr>
					<td> <%= fecha %></td>
					<td> <%= hora %></td>
					<td> <%= s %></td>
					<td> <%= t %></td>
					<td> <%= v %></td>
					<td> <%= lambda %></td>
					<td> <%= phi %></td>
					<td> <%= ar1 %></td>
					<td> <%= de1 %></td>
					<td> <%= ar2 %></td>
					<td> <%= de2 %></td>
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
    <h3 class="titulodiv">Regression trajectory</h3>
    <div class="datos">
		
    	<table>
		<tr>
			<th> Date </th>
			<th> Hour </th>
			<th><abbr title ="Time between frames">t</abbr></th>
			<th><abbr title ="Distance traveled in kilometers">s</abbr></th>
			<th><abbr title ="Velocity in the frame">v (Km/s)</abbr></th>
		
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
			PreparedStatement pst = con.prepareStatement("SELECT * FROM Trayectoria_por_regresion WHERE Informe_Z_IdInforme="+dato+"");
			ResultSet resultado = pst.executeQuery();
			
			while(resultado.next()){
				String fecha = resultado.getString(1);
				String hora = resultado.getString(2);
				String t = resultado.getString(3);
				String s = resultado.getString(4);
				String v1 = resultado.getString(5);
				String v2 = resultado.getString(6);
			
			%>
				<tr>
					<td> <%= fecha %></td>
					<td> <%= hora %></td>
					<td> <%= t %></td>
					<td> <%= s %></td>
					<td> <%= v1 %></td>
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
    <h3 class="titulodiv">Active showers</h3>
    <div class="datos">
		
    	<table>
		<tr>
			<th><abbr title="Abbreviated name used to identify shower">Identifier</abbr></th>
			<th> Minimum distance between radians and trajectory </th>	
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
			PreparedStatement pst = con.prepareStatement("SELECT * FROM Lluvia_activa WHERE Informe_Z_IdInforme="+dato+"");
			ResultSet resultado = pst.executeQuery();
			
			while(resultado.next()){
				String id = resultado.getString(2);
				String dist = resultado.getString(1);
			
			%>
				<tr>
					<td> <%= id %></td>
					<td> <%= dist.substring(0,dist.length()-11) %></td>
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
    <h3 class="titulodiv">Orbital elements</h3>
    <div class="datos">
    	<table>
		<tr>
			<th><abbr title="For some reports, the orbital elements are calculated for the average velocity (vm) and for the initial velocity (vi).">Calculated using</abbr></th>
			<th><abbr title="Velocity at infinity in Km/s">Inf. Vel.</abbr></th>
			<th><abbr title="Geocentric velocity">Geo. Vel.</abbr></th>
			<th><abbr title="Right ascension of true radiant">Ra</abbr></th>
			<th><abbr title="Declination of the true radiant">De</abbr></th>
			<th><abbr title="Inclination">i</abbr></th>
			<th><abbr title="a*(1-e*e)">p</abbr></th>
		
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
			PreparedStatement pst = con.prepareStatement("SELECT * FROM Elementos_Orbitales WHERE Informe_Z_IdInforme="+dato+"");
			ResultSet resultado = pst.executeQuery();
			
			while(resultado.next()){
				String cc = resultado.getString(2);
				String vI = resultado.getString(3);
				String vG = resultado.getString(4);
				String ar = resultado.getString(5);
				String de = resultado.getString(6);
				String i = resultado.getString(7);
				String p = resultado.getString(8);
			
			%>
				<tr>
					<td> <%= cc %></td>
					<td> <%= vI.substring(0,vI.indexOf(" ")) %></td>
					<td> <%= vG.substring(0,vG.indexOf(" ")) %></td>
					<td> <%= ar.substring(0,ar.indexOf(" ")) %></td>
					<td> <%= de.substring(0,de.indexOf(" ")) %></td>
					<td> <%= i.substring(0,i.indexOf(" ")) %></td>
					<td> <%= p.substring(0,p.indexOf(" ")).substring(0,p.substring(0,p.indexOf(" ")).length()-14) %></td>
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
    </div>
       <div class="datos">
    	<table>
		<tr>
			<th>a</th>
			<th><abbr title="Eccentricity">e</abbr></th>
			<th><abbr title="Perihelic distance">q</abbr></th>
			<th><abbr title="Perihelion weather">T</abbr></th>
			<th><abbr title="Perihelion argument">omega</abbr></th>
			<th><abbr title="Rising Node Argument">Omega</abbr></th>
		
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
			PreparedStatement pst = con.prepareStatement("SELECT * FROM Elementos_Orbitales WHERE Informe_Z_IdInforme="+dato+"");
			ResultSet resultado = pst.executeQuery();
			
			while(resultado.next()){
				String a = resultado.getString(9);
				String e = resultado.getString(10);
				String q = resultado.getString(11);
				String T = resultado.getString(12);
				String om = resultado.getString(13);
				String OM = resultado.getString(14);
				String OM1 = OM.substring(1, OM.lastIndexOf("(")-5);
			
			%>
				<tr>
					<td> <%= a.substring(0,a.indexOf(" ")) %></td>
					<td> <%= e.substring(0,e.indexOf(" ")) %></td>
					<td> <%= q.substring(0,q.indexOf(" ")) %></td>
					<td> <%= T.substring(0,T.indexOf(" ")) %></td>
					<td> <%= om.substring(0,om.indexOf(" ")) %></td>
					<td> <%= OM1 %></td>
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
