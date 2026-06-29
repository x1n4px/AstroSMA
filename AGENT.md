# AGENT.md

Este archivo es el punto de entrada único para entender y trabajar en AstroSMA.

## Alcance
- Para identidad y contexto del proyecto, usa solo `Backend/`, `DB/` y `Frontend/`.
- Ignora el resto de directorios salvo que la tarea lo pida de forma explícita.
- Si algo queda fuera de ese alcance, no lo mezcles en la documentación operativa.

## Qué es este proyecto
- Plataforma web para visualizar, consultar y analizar datos astronómicos de meteoros.
- Frontend: React + Vite.
- Backend: Node.js + Express.
- Base de datos principal: MariaDB/MySQL.
- Complementos relevantes: MongoDB para vistas de workflows y un servicio externo de sonificación proxyado por el backend.

## Cómo empezar siempre
1. Lee este archivo.
2. Revisa los documentos de contexto relevantes:
   - [arquitectura.md](docs/contexto/arquitectura.md)
   - [convenciones.md](docs/contexto/convenciones.md)
   - [decisiones.md](docs/contexto/decisiones.md)
   - [errores-conocidos.md](docs/contexto/errores-conocidos.md)
   - [flujo-de-trabajo.md](docs/contexto/flujo-de-trabajo.md)
   - [glosario.md](docs/contexto/glosario.md)
3. Consulta [tareas.md](tareas.md).
4. Ejecuta la siguiente tarea pendiente de mayor prioridad.
5. Actualiza el código y los documentos afectados.
6. Marca la tarea en `tareas.md`.
7. Si detectas trabajo nuevo, añádelo a `tareas.md`.

## Resumen del proyecto
- El backend concentra la lógica, la autenticación, la visibilidad de reportes y el acceso a datos.
- El frontend concentra rutas, visualización y flujos de usuario.
- `DB/` contiene dumps, vistas y parches SQL que describen el estado y evolución del esquema.
- La app usa JWT, máscaras de rol y consultas SQL directas en varios controladores.

## Arquitectura general
- Revisa [arquitectura.md](docs/contexto/arquitectura.md) para el mapa de carpetas, stack y flujo de datos.
- Regla operativa: el frontend consume al backend, el backend consulta MariaDB/MySQL y, en partes concretas, MongoDB.
- No asumas una capa única de persistencia: conviven SQL directo, Sequelize y Mongoose.
- La sonificación no se consume directamente desde el navegador: pasa por un proxy en el backend.

## Convenciones que debes respetar
- Sigue [convenciones.md](docs/contexto/convenciones.md).
- Mantén el estilo existente del repo.
- No introduzcas dependencias que rompan la compatibilidad con Node 17.9.1.
- No muevas secretos al frontend.
- No cambies las máscaras de rol ni el flujo de autenticación sin revisar el backend y el frontend juntos.

## Flujo de trabajo recomendado
- Sigue [flujo-de-trabajo.md](docs/contexto/flujo-de-trabajo.md).
- Antes de tocar nada, localiza la ruta, servicio, controlador o SQL afectados.
- Si el cambio toca UI y API, modifica ambos lados en la misma iteración.
- Si el cambio toca datos, actualiza también `DB/` y el contexto correspondiente.

## Qué revisar antes de implementar
- Qué archivo de entrada gobierna el flujo.
- Si existe una ruta o servicio ya preparado.
- Si el cambio afecta roles, auth, audit o visibilidad de reportes.
- Si el cambio altera SQL, claves, nombres de tabla o tipos de datos.
- Si el cambio rompe compatibilidad con lo que ya documenta el repo.

## Qué hacer durante la implementación
- Haz cambios pequeños y coherentes con la estructura actual.
- Mantén nombres descriptivos y consistentes.
- Si detectas un patrón repetido, reutilízalo antes de inventar uno nuevo.
- Si encuentras una ambigüedad, deja una nota breve o un `PENDIENTE` en el documento adecuado.

## Qué hacer después de implementar
- Verifica el cambio de la manera más directa posible.
- Revisa si el cambio obliga a actualizar:
  - `AGENT.md`
  - `tareas.md`
  - `docs/contexto/arquitectura.md`
  - `docs/contexto/convenciones.md`
  - `docs/contexto/decisiones.md`
  - `docs/contexto/errores-conocidos.md`
  - `docs/contexto/flujo-de-trabajo.md`
  - `docs/contexto/glosario.md`
- Marca la tarea como completada, bloqueada o en progreso, según corresponda.
- Si aparece un nuevo hallazgo, crea una tarea nueva en `tareas.md`.

## Cómo mantener actualizados los documentos de contexto
- `arquitectura.md`: actualízalo si cambia stack, carpetas, flujo de datos o piezas inexistentes.
- `convenciones.md`: actualízalo si cambia estilo, naming, pruebas, commits o patrones.
- `decisiones.md`: registra decisiones técnicas tomadas, con motivo y alternativa descartada.
- `errores-conocidos.md`: registra gotchas, límites y riesgos reales del código.
- `flujo-de-trabajo.md`: actualízalo si cambia el modo recomendado de trabajar o desplegar.
- `glosario.md`: añade o corrige términos del dominio, entidades y siglas.

## Cómo registrar cambios nuevos
- Nueva decisión técnica:
  - Añádela en `decisiones.md`.
  - Indica qué se eligió, por qué y qué se descartó.
- Nueva convención:
  - Añádela en `convenciones.md`.
  - Explica qué se debe hacer y qué se debe evitar.
- Nuevo error conocido:
  - Añádelo en `errores-conocidos.md`.
  - Describe el riesgo de forma concreta.
- Cambio de arquitectura:
  - Refleja el cambio en `arquitectura.md`.
  - Si modifica el flujo o la forma de trabajar, actualiza también `flujo-de-trabajo.md`.
- Nuevo término o sigla:
  - Añádelo en `glosario.md`.
  - Si no está verificado, deja `PENDIENTE`.

## Cómo usar `tareas.md`
- `tareas.md` es la cola viva del trabajo del proyecto.
- La sección `Pendientes` manda.
- La tarea que se ejecuta primero debe ser la de mayor prioridad que no esté bloqueada.
- Cada tarea debe indicar estado, contexto, criterios de aceptación, archivos relacionados y fechas.
- Si una tarea se completa, muévela a `Completadas`.
- Si una tarea se bloquea, explica el bloqueo y qué falta para desbloquearla.
- Si aparece trabajo nuevo, añádelo con prioridad y contexto mínimo suficiente.

## Instrucciones explícitas para futuras sesiones
- Lee primero `AGENT.md`.
- Revisa después los documentos de contexto relevantes.
- Consulta `tareas.md`.
- Ejecuta la siguiente tarea pendiente.
- Actualiza los documentos afectados tras implementar cambios.
- Marca el estado de la tarea en `tareas.md`.
- Añade nuevas tareas si detectas trabajo pendiente.

## Pendiente de completar
- Sin huecos críticos detectados ahora mismo en el alcance actual.
