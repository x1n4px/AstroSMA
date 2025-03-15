const express = require("express");
const cors = require('cors'); 
const app = express();
const StationRoute = require('./routes/stationRoute')
const BolideRoute = require('./routes/bolideRoute')
const AuthRoute = require('./routes/authRoute')
const UserRoute = require('./routes/userRoute')
const ReportZRoute = require('./routes/reportZRoute')
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
 
const port = 3005;

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
  });
 

module.exports = app;