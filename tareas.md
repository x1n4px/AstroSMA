# Tareas

> Cola viva del proyecto. Cuando no haya tareas `En progreso`, toma la primera `Pendiente` de mayor prioridad.

## Metadatos
- Fecha de creación: 2026-06-28
- Última actualización: 2026-08-07

## Instrucciones
- Actualiza esta lista cada vez que cambie el estado de una tarea.
- Si detectas trabajo nuevo, añade un nuevo elemento en `Pendientes`.
- Si una tarea queda parcialmente resuelta, mantenla en `En progreso` con contexto explícito.
- Si una tarea no puede continuar, muévela a `Bloqueadas` y explica el motivo.

## En progreso
- Trayectoria atmosférica y recursos: revisión de etiquetas, formato y nombres de descarga; ya se ajustaron textos de la proyección y de los vectores, y queda por revisar el valor de tiempo, la visualización 3D y las descargas restantes.

## Pendientes

- Todas las siguientes tareas hacen referencias a Front, dentro del /report:


Fotogramas:
* La fecha/hora en formato FITS sale partida por el guión del día. ¿No se podría achuchar un poco el resto de las columnas para dejar espacio a esta primera columna y la fecha/hora se viera en juna sola línea?
* En el recuadro "Trayectoria" los títulos de las columnas T, V, lambda, phi deberían estar en minúsculas. Las letras griegas lambda y phi también, porque así es como se denotan universalmente a la longitud y la latitud. 
* En el recuadro "Ajuste de velocidades" los títulos de las columnas T, S y V deberían estar en minúsculas.

Recursos:
* No funciona la descarga de "Medidas en bruto". El texto está bien, pero habría que añadir "a J2000", es decir, donde pone "...declinación a la fecha", debería poner "...declinación a la fecha, no a J2000". Fichero a enlazar: está en el subdirectorio de la pareja de estaciones con patrón 
Coordenadas-<AAAAMMDDhhmmss>-<Nobs1>.csv
* No funciona la descarga de UFOORBIT.  Fichero a enlazar: UFOORBIT.tgz (está en el directorio del evento.) En el evento que he usado de ejemplo, estaría en 
/home/sma/Meteoros/Detecciones/2026/20260618/033005
El enlace a 
http://sonotaco.com/soft/e_index.html 
no está activo.
* No funciona la descarga de "Líneas de visión". Fichero a enlazar: El archivo responde al patrón
rozador-<AAAAMMDDhhmmss>-<Nobs1-<Nobs2>
Y está en el subdirectorio de la pareja de estaciones
* No funciona la descarga de "Western Meteor PyLib". Fichero a enlazar: wmpl.txt  (está en el directorio del evento). En el ejemplo que he seguido sería el directorio
/home/sma/Meteoros/Detecciones/2026/20260618/033005
El enlace a 
https://github.com/wmpg/WesternMeteorPyLib 
no está activo
La descarga del programa Python sí que funciona.
* No funciona la descarga de "Meteor ToolKit". Fichero a enlazar: El archivo responde al patrón
Gritsevivh-<AAAAMMDDhhmmss>-Nobs1>-<Nobs2>
Y está en el subdirectorio de la pareja de estaciones. El enlace a
https://sourceforge.net/projects/meteortoolkit/
no está activo
* No funciona la descarga de "Parámetros alpha-beta". Fichero a enlazar: El archivo responde al patrón
alpha-beta-<AAAAMMDDhhmmss>-Nobs1>-<Nobs2>.csv
Y está en el subdirectorio de la pareja de estaciones. El enlace a
https://github.com/desertfireballnetwork/alpha_beta_module
no está activo



## Bloqueadas
- `T-0012` | Prioridad: Alta | Estado: Bloqueada | Contexto: El backend y el frontend ya exponen `azimuth` y `zenithDistance`, pero no puedo confirmar el caso `0.000` sin un `IdInforme` concreto o una traza reproducible del evento afectado. | Criterios de aceptación: con un evento reproducible, localizar si el valor malo viene de BD, API o parseo y corregirlo sin cambiar otros informes. | Archivos relacionados: [`Backend/api/controllers/reportZController.js`](/home/in4p/git/sma/AstroSMA/Backend/api/controllers/reportZController.js), [`Backend/api/mappers/reportZMapper.js`](/home/in4p/git/sma/AstroSMA/Backend/api/mappers/reportZMapper.js), [`Frontend/src/pages/astronomy/report/pages/inferredDataReport.jsx`](/home/in4p/git/sma/AstroSMA/Frontend/src/pages/astronomy/report/pages/inferredDataReport.jsx) | Creación: 2026-06-28 | Última actualización: 2026-06-28

## Completadas
- Lluvias activas: renovada la UI/UX de `/active-rain` con resumen de catálogos, búsqueda común, años seleccionables mediante chips, estados completos y representación interactiva reutilizable. Los registros se agrupan en desplegables por familia de identificador (`CAP`, `ANT1`/`ANT2` → `ANT`), manteniendo Informes y la visualización común visibles en la cabecera; las visualizaciones específicas quedan en su variante.
- Información de lluvias: renovada por completo la UI/UX de `/shower-info/:code` con búsqueda jerarquizada, resumen, gráfico y cards responsive; la guía de ocho fases lunares permite selección múltiple, reúne los controles de personalización y mantiene contadores dinámicos. Las características científicas detalladas quedan ocultas en esta vista.
- Asociación a lluvia activa: resuelta en `/report` con deduplicación por código canónico de familia para IMO y filtro IAU basado en longitud eclíptica solar calculada en backend.
- Fotogramas: fecha/hora FITS en una sola línea y cabeceras de `Trayectoria` y `Ajuste de velocidades` ajustadas a minúsculas, con `lambda` y `phi` también en minúsculas.
- Vídeos e imágenes: nueva pestaña en `/report` con lectura de `videos-e-imagenes.txt`, listado de enlaces y previsualización básica de vídeos e imágenes asociadas al evento.
- `T-0013` | Prioridad: Alta | Estado: Completada | Contexto: La activación IAU en `/report` ya no depende de un CSV externo; ahora se calcula en backend con longitud eclíptica solar y se filtra por `LoSb`/`LoSe`. | Criterios de aceptación: mostrar lluvias IAU activas en la fecha sin inventar datos externos. | Archivos relacionados: [`Backend/api/controllers/reportZController.js`](/home/in4p/git/sma/AstroSMA/Backend/api/controllers/reportZController.js), [`Backend/api/utils/activeShowerHelpers.js`](/home/in4p/git/sma/AstroSMA/Backend/api/utils/activeShowerHelpers.js), [`Frontend/src/pages/astronomy/report/pages/activeRain.jsx`](/home/in4p/git/sma/AstroSMA/Frontend/src/pages/astronomy/report/pages/activeRain.jsx) | Creación: 2026-06-28 | Última actualización: 2026-06-28
