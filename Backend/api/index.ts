const express = require("express");
const cors = require('cors'); 
const app = express();
const StationRoute = require('./routes/stationRoute')
const BolideRoute = require('./routes/bolideRoute')
const AuthRoute = require('./routes/authRoute')
const UserRoute = require('./routes/userRoute')
const ReportZRoute = require('./routes/reportZRoute')
const AuxiliaryRoute = require('./routes/auxiliaryRoute')
const DashboardRoute = require('./routes/dashboardRoute')
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Express on Vercel");
});

app.use('/api', StationRoute);  // La ruta api ya está en la función
app.use('/api', BolideRoute);
app.use('/api', AuthRoute);
app.use('/api', UserRoute);
app.use('/api', ReportZRoute);
app.use('/api', AuxiliaryRoute);
app.use('/api', DashboardRoute);

 
const port = 3005;

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
  });
 

module.exports = app;