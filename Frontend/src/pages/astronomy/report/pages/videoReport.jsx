import React from 'react';

const VideoReport = ({ report, nombreCamara }) => {

  console.log("Nombre camara: ", nombreCamara)


  const formatearNombreCamara = (nomCam) => {
    let nombreFormateado = nomCam;
    nombreFormateado = nombreFormateado
      .replace('á', 'a')
      .replace('é', 'e')
      .replace('í', 'i')
      .replace('ó', 'o')
      .replace('ú', 'u');
    nombreFormateado = nombreFormateado
      .replace('Á', 'A')
      .replace('É', 'E')
      .replace('Í', 'I')
      .replace('Ó', 'O')
      .replace('Ú', 'U');
    nombreFormateado = nombreFormateado
      .replace('à', 'a')
      .replace('è', 'e')
      .replace('ì', 'i')
      .replace('ò', 'o')
      .replace('ù', 'u');
    nombreFormateado = nombreFormateado
      .replace('À', 'A')
      .replace('È', 'E')
      .replace('Ì', 'I')
      .replace('Ò', 'O')
      .replace('Ù', 'U');

    if (nombreFormateado === 'El Viso de Córdoba') {
      nombreFormateado = 'El Viso';
    }
    if (nombreFormateado === 'Satn Martì de Sesgueioles') {
      nombreFormateado = 'Sant Marti de Sesgueioles';
    }
    return nombreFormateado;
  };

  const generarUrlVideo = (fecha, hora) => {
    const nomCamFormateado = formatearNombreCamara(nombreCamara);
    const url = `http://www.astromalaga.es/sapito/${fecha.substring(
      0,
      4
    )}/${fecha.replaceAll('-', '')}${hora
      .replaceAll(':', '')
      .substring(0, 6)}-${nomCamFormateado.replaceAll(' ', '_').replaceAll('-', '_')}.mp4`;
    return url;
  };

  const mostrarVideo = () => {
    // Simulación de la obtención de fecha y hora desde la base de datos
    if (report && report.Fecha && report.Hora) {
      console.log(report)

      const fecha = report.Fecha
      const hora = report.Hora


      const anio = fecha.substring(0, 4);
      if (fecha.substring(0, 4) !== anio) {
        return (
          <div className="conjunto">
            <h3 className="ayuda">
              <a href={generarUrlVideo(fecha, hora)} target="_blank">
                Meteor video
              </a>
            </h3>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="d-flex justify-content-center align-items-center" >
      {mostrarVideo()}
    </div>
  );

};

export default VideoReport;