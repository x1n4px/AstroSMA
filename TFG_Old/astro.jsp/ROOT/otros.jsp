<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<%@ page import ="java.sql.*" %>
<%@ page import ="java.sql.Connection" %>
<%@ page import ="java.sql.DriverManager" %>
<%@ page import ="java.sql.SQLException" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SMA - Observaciones</title>
    <link rel="stylesheet" href="style.css">
    <link rel="icon" href="images/logo.png">
</head>
<body>
    <header>
        <div class="logo">
            <a href="index.jsp" target="_blank">
                <img src="images/logo-sma.png">
            </a>
        </div>
        <div class="menu">
            <nav class="botones">
                <a href="meteoros.jsp" class="navlink">Meteoros</a>
                <a href="observatorios.jsp" class="navlink">Observatorios</a>
                <a href="lluvias.jsp" class="navlink">Lluvias</a>
                <a href="otros.jsp" class="navlink">Otros Informes</a>
            </nav>
        </div>
    </header>
        <% String dato = request.getParameter("id"); %>
    <div class="consulta">
		<h1>Informes - Fotometría</h1>
    	<table border="1">
		<tr>
			<th>  Fecha  </th>
			<th>  Hora  </th>
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
			PreparedStatement pst = con.prepareStatement("SELECT Identificador, Fecha, Hora FROM Informe_Fotometria ORDER BY Fecha");
			ResultSet resultado = pst.executeQuery();
			
			while(resultado.next()){
				String fecha = resultado.getString(2);
				String hora = resultado.getString(3);
				String id = resultado.getString(1);
				
			
			%>
				<tr>
					<td> <%= fecha %>	</td>
					<td> <a href="fotometria.jsp?id=<%=id%>"> <%= hora %> </a></td>
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
</body>
</html>
