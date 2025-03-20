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
    
    <div class="conjunto">
    <h3 class="titulodiv" style="text-decoration: underline;">Two-station reports:</h3>
    <p style = "margin: 25px">Two-station reports or Z-Reports are reports generated for 
    	reports generated for meteors detected with two or more stations.
		For each unordered pair of stations detecting the meteor, two reports are generated.
		two reports are generated. From the first station, the video frames are used to calculate the velocities.
		video frames are used to calculate the velocities. From the second station, the average image of all frames is used to calculate the velocities.
		average image of all frames, if it is a video recording station, or the captured image, if it is a video recording station, or the captured image, if it is a video recording station.
		or the captured image, in case of a station that only captures images.
		only captures images. For example, if a meteor has been detected by
		stations 18, 65 and 44, reports are generated for the pairs (18,
		65), (18, 44), (65, 18), (65, 44), (44, 18) y (44,65). The method of
		calculation of atmospheric trajectories. The video stations
		record with exposures of 0.05s, 0.10s, 0.15s or 0.20s depending on the download and processing capacity of their
		depending on the download and processing capability of your Raspberry PI. For the timestamp of the
		time of the first frame is taken as returned by the operating system clock.
		operating system clock. For the rest, the time of the exposures is added to this time,
		the exposure times of the camera are taken as good.
		The relevant data collected in the report are:</p>
	<p style = "margin-left:25px; margin-bottom:-10px">For the report:</p>
	<ul>
    <li>Date and time in UTC</li>
    <li>Identifiers of the two stations B</li>
    <li>Used frames from the video of the first station</li>
    <li>Dihedral angle between the planes determined by the trajectory and the stations</li>
    <li>Right ascension and declination of the apparent radiant sun at the date and at J2000</li>
    <li>Azimuth and zenith distance of the radiator</li>
	</ul>
	
	<p style = "margin-left:25px; margin-bottom:-10px">For the radiant:</p>
	<ul>
    <li>Right ascension and declination to date and J2000</li>
    <li>Azimuth and zenith distance (as seen from first station)</li>
	</ul>
	
	<p style = "margin-left:25px; margin-bottom:-10px">For atmospheric trajectory:</p>
	<ul>
    <li>Geographical coordinates distance and altitude of the start and the end</li>
    <li>Geographical coordinates of the intersection with the Earth of the straight line trajectory prolongation</li>
	<li>Distance traveled as seen from both stations</li>
    <li>Time spent at the first station</li>
    <li>Mean velocity, initial velocity and acceleration measured from the first station. (Velocities measured from one frame to the next are fitted by least squares to a second degree polynomial. From this the initial velocity and acceleration are inferred).</li>
    <li>Estimated time and initial velocity at the second station (from the previous setting)</li>
	</ul>
	
	<p style = "margin-left:25px; margin-bottom:-10px">Frames:</p>
	<ul>
	<li>Time stamps in UTC</li>
    <li>Right ascension and declination of the centroid of the meteor trace</li>
	</ul>
	
	<p style = "margin-left:25px; margin-bottom:-10px">Trajectory. For each frame:</p>
	<ul>
	<li>Time stamp in UTC</li>
   	<li>Distance traveled in Km</li>
    <li>Time elapsed since first frame in seconds</li>
    <li>Velocity in Km/s</li>
    <li>Geographical coordinates</li>
    <li>Right ascension and declination to date as viewed from each station</li>
	</ul>
	
	<p style = "margin-left:25px; margin-bottom:-10px">Regression trajectory:</p>
	<ul>
	<li>Time stamps in UTC</li>
    <li>Distance traveled in Km</li>
    <li>Time elapsed since first frame in seconds</li>
    <li>Velocity in Km/s</li>
    </ul>
    
    <p style = "margin-left:25px; margin-bottom:-10px">Active showers to date:</p>
	<ul>
	<li>Catalog identifier IMO</li>
    <li>Distance between the radiant to date and the calculated radiant</li>
	</ul>
	
	<p style = "margin-left:25px; margin-bottom:-10px">Orbital elements. Calculated with the inferred initial velocity and with the calculated average velocity:</p>
	<ul>
	<li>v_i (velocity at infinity in Km/s)</li>
    <li>v_g (geocentric velocity in Km/s)</li>
    <li>Ra and De of radiant in degrees with decimals</li>
    <li>i (inclination in degrees with decimals)</li>
    <li>p (a(1-e^2) in astronomical units)</li>
    <li>a (semi-major axis in astronomical units)</li>
    <li>e (eccentricity)</li>
    <li>q (periellic distance in astronomical units)</li>
    <li>T (Perihelion weather)</li>
    <li>omega (perihelion argument)</li>
    <li>Omega (argument of the ascending node)</li>
	</ul>
	
	<p style = "margin: 25px"> Some reports are truncated because, with the measured velocities, they do not pass the verification tests of the calculation of the elements of the
	measured, do not pass the verification tests of the calculation of the orbital elements.
	orbitals.</p>
	</div>
	
	<div class="conjunto">
    <h3 class="titulodiv" style="text-decoration: underline;">Reports from one station:</h3>
    <p style = "margin: 25px">
	Single-station reports or radiant reports are
	reports for meteors detected by a single station.
	station. There are two types, those that are associated with an active shower in the IMO catalog, and those that are not.
	from the IMO catalog, and those that are not. Para asociarlos o no a una
	lluvia activa a la fecha, se prolonga hacia atrás su trayectoria en la
	esfera celeste y se calcula la distancia angular a los radiantes de las
	lluvias activas. If the trajectory passes within 5º of one of these radiators
	radiant, one type of report is generated, and if not, another type of report is generated.</p>
	
	<ul>
	<li style="margin-bottom:10px; margin-right:10px">Radiant report with no association to an active rainfall. 
	It simply shows the active rainfall at that date, the radiant coordinates at that date, the coordinates of the 
	coordinates of the radiant at that date, the coordinates of the point on the trajectory closest to the 
	the coordinates of the point of the trajectory closest to the
	the radiant and the angular distance between that point and the trajectory.
	an example of a Radiant-Report without association to active rain).</li>
	<li style="margin-right:10px">Radiant report with possible association to active rain. When the
	trajectory prolongation passes within 5º of an active radiant (10º for the Taurids and Antihelion), a report with the same
	(10º for the Taurids and Antihelion), a report is generated with the same information as above, plus trajectory
	information as above, plus estimates of the atmospheric trajectory calculated from the
	calculated from the catalog velocity of the meteors.
	meteors. If the time is known, because it has been recorded on video, three trajectories are estimated with the
	three trajectories are estimated with the catalog velocity v, and the velocities v+3Km/s and
	velocities v+3Km/s and v-3Km/s. And if it has been captured in an image, with a reasonable range of
	reasonable range of altitudes. </li>
	</ul>
	<p style = "margin: 25px">
	Both reports contain the altitude, geographic coordinates, distance traveled and distance to station for each of the trajectories.
	distance traveled and distance to the station for each of the estimated trajectories.
	estimated. If it was recorded on video, it gives the measured angular velocity and
	the estimated ones for the three calculated estimated trajectories, both from the catalog radiant and the
	the catalog radiant and from the apparent radiant. If it was captured on
	image, for each of the possible initial altitudes are given the velocity corresponding to the rain and the
	velocity corresponding to the rain and the estimated trajectory are given for each possible initial altitude.</p>
	</div>
	
	<div class="conjunto">
    <h3 class="titulodiv" style="text-decoration: underline;">Photometry reports</h3>
    <p style = "margin: 25px">	If the meteor has been detected by video and imaging stations, photometry reports are generated.
	video and image stations, photometry reports are generated. The photometry is
	V magnitudes from a sample of stars in the Hipparcos-Tycho catalog field.
	of the Hipparcos-Tycho catalog. It contains the data:</p>
	
	<p style = "margin-left:25px; margin-bottom:-10px">Report:</p>
	<ul>
	<li>Date and time in UTC</li>
    <li>Visible stars</li>
    <li>Estrellas used for the calculation of the bouger line (regression line)</li>
    <li>Extinction coefficient</li>
    <li>Zero point</li>
    <li>Standard error of regression</li>
    <li>Standard error of the extinction coefficient</li>
    <li>Standard zero point error</li>
    <li>Coefficients of the trajectory fit to a second degree polynomial.</li>
    <li>Maximum and minimum magnitudes</li>
    <li>Photometric mass</li>
	</ul>
	
	<p style = "margin-left:25px; margin-bottom:-10px">Stars used in the regression. Data per star:</p>
	<ul>
	<li>Hipparcos identifier</li>
    <li>Air mass</li>
    <li>Catalog magnitude</li>
    <li>Instrumental magnitude</li>
	</ul>
	
	<p style = "margin-left:25px; margin-bottom:-10px">Meteor:</p>
	<ul>
	<li>(x,y) starting coordinates on the chip</li>
    <li>Starting air mass</li>
    <li>Distance to home station</li>
    <li>Coordinates (x,y) of end on chip</li>
    <li>End air mass</li>
    <li>Distance to end station</li>
	</ul>
	
	<p style = "margin-left:25px; margin-bottom:-10px">Fitting points. Data per line:</p>
	<ul>
	<li>Time since inception</li>
    <li>Distance</li>
    <li>Catalog magnitude</li>
    <li>Instrumental magnitude</li>
	</ul>
	</div>
	
	
	
</body>
</html>
