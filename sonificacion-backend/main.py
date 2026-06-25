import os
import traceback
import glob
import logging
import db_class as dbclass
import vision_class as visionclass
import sound_class as soundclass
import data_class as dataclass
from moviepy import VideoFileClip, AudioFileClip

logger = logging.getLogger(__name__)

def registrar_excepcion(ruta_err):
    with open(ruta_err, "a") as f:
            f.write(traceback.format_exc())

def registrar_paso(paso, ruta_log):
    print(paso)
    with open(ruta_log, "a") as f:
            f.write(paso)

if __name__ == "__main__":
    db = None
    cursor = None
    try:
        print("\n======================================================================================\n"
        + "PASO 0 : Variables internas y conexion con la BD\n"
        + "======================================================================================\n")
        
        # Variables de entorno
        host = os.getenv("DB_HOST")
        db_user = os.getenv("DB_USER")
        db_password = os.getenv("DB_PASSWORD")
        database = os.getenv("DB_NAME")
        ruta_log = os.getenv("log_aplicacion")
        ruta_err = os.getenv("log_errores")
        midi_voz_1 = os.getenv("voz_1")
        midi_voz_2 = os.getenv("voz_2")
        midi_voz_fragmentacion = os.getenv("voz_fragmentacion")
        midi_voz_fondo = os.getenv("voz_fondo")

        # Iniciar el logger y la conexion a la BD
        logging.basicConfig(
            level=logging.INFO,
            format="%(asctime)s [%(levelname)s] %(message)s",
            handlers=[
                logging.FileHandler(ruta_log),
                logging.StreamHandler()
            ]
        )

        logger.info(f"--------------- Iniciando aplicacion ---------------\n\\___ * ruta de logs : {ruta_log}\n\\___ * ruta de errores : {ruta_err}")

        db, cursor = dbclass.conexion_basica(host, database, db_user, db_password)

        # Obtener id del Informe-Z en la BD
        ruta_pry=os.getenv("ruta_proyecto") #variable en el docker-compose, actualizado por endpoint
        ruta_sonif=os.getenv("ruta_sonificacion") #variable en el docker-compose, actualizado por endpoint
        ruta_informe, fecha, hora = dataclass.parse_idInforme(ruta_pry)
        QUERY = f"SELECT IdInforme FROM Informe_Z where Fecha='{fecha}' and Hora='{hora}'";
        column_names, tupla, size = dbclass.ejecutar(QUERY, cursor)
        id_ec = tupla[0][0]


        registrar_paso("\n======================================================================================\n"
        + "PASO 1 : Datos del informe Z\n"
        + "======================================================================================\n", ruta_log)

        QUERY = f"SELECT * from Ecuacion_parametrica ec JOIN Informe_Z inf ON ec.IdEc = inf.Ecuacion_parametrica_IdEc WHERE IdEc = {id_ec}";
        column_names, tupla, size = dbclass.ejecutar(QUERY, cursor)

        # Ejecutar consulta y obtener datos
        v_posicion = [tupla[0][1], tupla[0][2], tupla[0][3]] #ecuacion_parametrica -> a, b, c
        estaciones = [tupla[0][10], tupla[0][9]] #Informe_Z -> Observatorio_Número2, Observatorio_Número
        velocidad = tupla[0][37] #Informe_Z -> Velocidad_media


        registrar_paso("\n======================================================================================\n"
        + "PASO 2 : Datos de la deteccion\n"
        + "======================================================================================\n", ruta_log)

        QUERY = f"SELECT * FROM Trayectoria_por_regresion where Informe_Z_IdInforme = {id_ec}"
        column_names, tuplas, size = dbclass.ejecutar(QUERY, cursor)

        # Normalizacion de arrays para poder intercambiar facilmente
        velocidades = [float((tupla[4])*100) for tupla in tuplas]
        velocidades = [round(v * 0.001, 5) for v in velocidades]
        tiempos = [float(tupla[2]) for tupla in tuplas]
        
        # Obtener el array de brillos 
        brillos = dataclass.obtener_brillos(ruta_pry)
        brillos = [b * -1 for b in brillos]
        velocidades, brillos, tiempos = dataclass.igualar(velocidades, brillos, tiempos)
        logger.info(f"Arrays igualados...\n\\___ * velocidades = {velocidades}\n\\___ * brillos = {brillos}\n\\___ * tiempos = {tiempos}")

        # Detectar si hay fragmentacion y obtener el array con volumenes
        fragmentacion = dataclass.obtener_fragmentacion(brillos)
        if any(fragmentacion):
            i = next((i for i, v in enumerate(fragmentacion) if v != 0), None)
            logger.info(f"Se ha detectado fragmentacion en el instante {tiempos[i]}")

        registrar_paso("\n======================================================================================\n"
        + "PASO 3 : Espacio de sonificacion\n"
        + "======================================================================================\n", ruta_log)

        logger.info(f"Se utiliza esta equivalencia:\n\\___ * velocidad=frecuencia\n\\___ * brillo=volumen")
        frecuencias = dataclass.procesar_freq(velocidades, (64, 4096)) #trayectoria_por_regresion, rango sonoro agradable
        volumenes = dataclass.procesar_vol(brillos)
        logger.info(f"Arrays ajustados:\n\\___ * frecuencias = {frecuencias}\n\\___ * volumenes = {volumenes}")

        registrar_paso("\n======================================================================================\n"
        + "PASO 4 : Sonificacion wav\n"
        + "======================================================================================\n", ruta_log)

        ruta_video = dataclass.obtener_video(ruta_pry)
        video_clip = VideoFileClip(ruta_video)
        ancho, altura = video_clip.size

        QUERY = f"SELECT X, Y FROM Puntos_ZWO WHERE Informe_Z_IdInforme = {id_ec} ORDER BY Hora ASC"
        column_names, tupla, size = dbclass.ejecutar(QUERY, cursor)
        puntos_deteccion = [tupla[0][0], tupla[0][1], tupla[-1][0], tupla[-1][1]]
        puntos_deteccion = dataclass.corregir_puntos(puntos_deteccion, [ancho, altura])
        visionclass.dibujar_trayectoria(ruta_video, ruta_pry, puntos_deteccion)

        QUERY = f"SELECT Fotogramas_usados FROM Informe_Z WHERE IdInforme = {id_ec}"
        column_names, tupla, size = dbclass.ejecutar(QUERY, cursor)
        fotogramas = tupla[0][0]

        ruta_video = f'{ruta_pry}/deteccion-trayectoria.mp4'
        video_clip = VideoFileClip(ruta_video)
        
        logger.info(f"Sonificando usando del audio simple...")
        nombre_archivo = f"sonido-simple-ID-{id_ec}.wav"
        ruta_archivo = f'{ruta_sonif}/{nombre_archivo}'
        soundclass.sonido_simple(tiempos, frecuencias, volumenes, video_clip.duration , ruta_archivo)
        audio_clip = AudioFileClip(ruta_archivo)

        nombre_archivo = f"sonificacion-simple-ID-{id_ec}.mp4"
        ruta_archivo = f'{ruta_sonif}/{nombre_archivo}'
        video_clip = video_clip.with_audio(audio_clip)
        video_clip.write_videofile(ruta_archivo, codec='libx264', audio_codec='aac')
        logger.info(f"Sonificacion completada: {ruta_archivo}")

        logger.info(f'Ultimo tiempo en BD: {tiempos[len(tiempos)-1]}')
        logger.info(f'Metadatos del video\n\\___ * Duracion del video: {video_clip.duration}\n\\___ * Duracion del audio: {audio_clip.duration}\n\\___ * Fotogramas: {fotogramas}\n\\___ * FPS: {video_clip.fps}')
       
        registrar_paso("\n==============================================================================\n"
        + "PASO 5 : Sonificacion midi usando la ecuacion de la trayectoria\n"
        + "==============================================================================\n", ruta_log)

        logger.info(f"Sonificando usando el archivo midi...")
        
        # Guardamos la duracion real del video porque midi extiene el audio mas de lo necesario
        video_clip = VideoFileClip(ruta_video)
        duracion_real = video_clip.duration

        #Sonificacion midi
        ruta_archivo = f'{ruta_sonif}/sonido-midi-ID-{id_ec}'
    #    ancho, altura = video_clip.size
        puntos_deteccion = [float(p) for p in puntos_deteccion]
        logger.info(f"Eje X")
        coordenadas_X = [(puntos_deteccion[0],puntos_deteccion[1]),(0,ancho)]# obtener de la BD
        logger.info(f"Eje Y")
    #    coordenadas_Y = [(puntos_deteccion[2],puntos_deteccion[3]),(0,altura)]# obtener de la BD
        paneo = dataclass.obtener_paneo(frecuencias, coordenadas_X[0], coordenadas_X[1])
        soundclass.midi_v1(frecuencias, volumenes, fragmentacion, paneo, midi_voz_1, midi_voz_2, midi_voz_fragmentacion, midi_voz_fondo, ruta_archivo)
        audio_clip = AudioFileClip(f'{ruta_archivo}.wav')

        #Recortamos los segundos sobrantes...
        logger.info(f"Recortando la salida midi a la duracion real del video ( {audio_clip.duration} -> {duracion_real} )...")
        audio_clip = audio_clip.subclipped(0, duracion_real)
        audio_clip.write_audiofile(f'{ruta_archivo}.wav')
        audio_clip = AudioFileClip(f'{ruta_archivo}.wav')

        logger.info(f"Exportando el audio midi al video de la deteccion...")
        video_clip = video_clip.with_audio(audio_clip)
        ruta_archivo = f'{ruta_sonif}/sonificacion-midi-ID-{id_ec}.mp4'
        video_clip.write_videofile(ruta_archivo, codec='libx264', audio_codec='aac')
        logger.info(f"Sonificacion midi completada: {ruta_archivo}")


        logger.info("--------------- Fin de la aplicacion ---------------")

    except ValueError as e:
        logger.error(f"Error al acceder a un valor. Puede ser un error con el tipo, un valor vacio o no un valor dentro de un rango no valido\n---> {str(e)}")
        registrar_excepcion(ruta_err)
    except TypeError as e:
        logger.error(f"Se ha ejecutado una operacion numerica sobre un valor no integer\n---> {str(e)}")
        registrar_excepcion(ruta_err)
    except IndexError as e:
        logger.error(f"Indice fuera de rango\n---> {str(e)}")
        registrar_excepcion(ruta_err)
    except UnboundLocalError as e:
        logger.error(f"No se pudo cargar el valor de una variable interna\n---> {str(e)}")
        registrar_excepcion(ruta_err)
    except ModuleNotFoundError as e:
        logger.error(f"Clase no encontrada\n---> {str(e)}")
        registrar_excepcion(ruta_err)
    except Exception as e:
        logger.error(f"Error inesperado\n---> {str(e)}")
        registrar_excepcion(ruta_err)

    finally: 
        if cursor is not None:
            try:
                cursor.close()
            except Exception:
                pass
        if db is not None:
            try:
                db.close()
            except Exception:
                pass
