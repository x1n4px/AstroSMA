const express = require("express");
const cors = require('cors'); 
const app = express();
const StationRoute = require('./routes/stationRoute')
const BolideRoute = require('./routes/bolideRoute')
app.use(cors());

app.get("/", (req, res) => {
    res.send("Express on Vercel");
});

app.use('/api', StationRoute);  // La ruta api ya está en la función
app.use('/api', BolideRoute);
 
const port = 3005;

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
  });
 

module.exports = app;