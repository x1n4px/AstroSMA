const express = require("express");
const cors = require('cors');
const app = express();
const StationRoute = require('./routes/stationRoute')
const BolideRoute = require('./routes/bolideRoute')
const AuthRoute = require('./routes/authRoute')
const UserRoute = require('./routes/userRoute')
const ReportZRoute = require('./routes/reportZRoute')
const SonificationRoute = require('./routes/sonificationRoute')
const AuxiliaryRoute = require('./routes/auxiliaryRoute')
const DashboardRoute = require('./routes/dashboardRoute')
const PhotometryRoute = require('./routes/photometryRoute')
const ActiveShowerRoute = require('./routes/activeShowerRoute')
const RadiantReportRoute = require('./routes/radiantReportRoute')
const auditRoute = require('./routes/auditRoute')
const EventRoute = require('./routes/eventRoute')
const FileRoute = require ('./routes/fileRoute')
const RequestRoute = require('./routes/requestRoute') 
const WorkflowsRoute = require('./routes/workflowsRoute')
const AdminScientificTableRoute = require('./routes/adminScientificTableRoute')

app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3005;

const logUnhandledError = (label, error) => {
  const message = error instanceof Error ? error.stack || error.message : String(error);
  console.error(`[${new Date().toISOString()}] ${label}`, message);
};

process.on('unhandledRejection', (reason) => {
  logUnhandledError('unhandledRejection', reason);
});

process.on('uncaughtException', (error) => {
  logUnhandledError('uncaughtException', error);
});


app.get("/", (req, res) => {
  res.send("Express on Vercel");
});

app.use('/api', StationRoute);  // La ruta api ya está en la función
app.use('/api', BolideRoute);
app.use('/api', AuthRoute);
app.use('/api', UserRoute);
app.use('/api', ReportZRoute);
app.use('/api', SonificationRoute);
app.use('/api', AuxiliaryRoute);
app.use('/api', DashboardRoute);
app.use('/api', PhotometryRoute);
app.use('/api', ActiveShowerRoute);
app.use('/api', RadiantReportRoute);
app.use('/api', auditRoute);
app.use('/api', EventRoute);
app.use('/api', FileRoute);
app.use('/api', RequestRoute);
app.use('/api', WorkflowsRoute);
app.use('/api', AdminScientificTableRoute);

app.use((err, req, res, next) => {
  logUnhandledError('expressError', err);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).json({
    ok: false,
    msg: 'Internal server error',
  });
});



app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


module.exports = app;
