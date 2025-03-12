const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');
const StationRoute = require('./routes/StationRoute')


// Cargar las variables de entorno
dotenv.config();
app.use(express.json()); // Middleware para procesar JSON
app.use(cors());


const port = process.env.PORT || 3001;




// Usar las rutas de tienda
//app.use('/api', StationRoute)

app.get("/", (req, res) => {

  const htmlResponse = `
    <html>
      <head>
        <title> NodeJs y Express en Vercel </title>
      </head>
      <body>
        <h1>Soy un proyecto back en vercel </h1>
      </body>
    </html>
  `

  res.send(htmlResponse);

}
);


// Iniciar el servidor

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
  
});
