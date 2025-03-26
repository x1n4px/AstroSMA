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
    <div class="conjunto" style="margin-left: 75px; margin-right: 75px;">
    <h3 class="titulodiv">Welcome to the web site of the observations made by the University of Málaga and the Sociedad Malagueña de Astronomía.</h3>
    <h4 style="text-align: center;"></h4>
	</div>
	
	<div class="defini" style="margin-left: 250px; margin-right: 250px;">
	<div class="botexp">
    <nav class="botones"><a href="meteoros.jsp" class="navlink" style="padding-left: 31px; padding-right: 31px;">Meteors</a></nav>
    </div>
    <h4 class="ayuda2"> In this section you will find a list of all the meteors sighted.</h4>
	</div>
	
	<div class="defini" style="margin-left: 250px; margin-right: 250px;">
	<div class="botexp">
    <nav class="botones"><a href="observatorios.jsp" class="navlink">Observatories</a></nav>
    </div>
    <h4 class="ayuda2">In this section you will find a list of all active observatories in the system.</h4>
	</div>
	
	<div class="defini" style="margin-left: 250px; margin-right: 250px;">
	<div class="botexp">
    <nav class="botones"><a href="lluvias.jsp" class="navlink" style="padding-left: 30px; padding-right: 30px;">Showers</a></nav>
    </div>
    <h4 class="ayuda2"> In this section you will find all the calendars registered in the system.</h4>
	</div>
	
	
</body>
</html>
