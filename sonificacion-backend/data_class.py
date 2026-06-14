"""
Clase para realizar modificaciones a rutas, valores y otros datos
"""

import glob
import os
import re
import numpy as np
from datetime import datetime
import logging
logger = logging.getLogger(__name__)


def _obtener_ruta(ruta):
    """
        Parsea la ruta para encontrar un archivo del que solo se sabe la estructura regex del nombre y no el nombre al completo
        Ejemplo:
            /home/deteccion/Informe-Z-*
        Parametros:
            La ruta donde buscar el archivo, regex incluida
        Devuelve:
            La ruta del primer archivo que cumple con la regex
        Eleva todos los errores a los metodos publicos que invocan este
    """
    
    archivos = sorted(glob.glob(ruta, recursive=True))
    if(not archivos):
        raise FileNotFoundError(f"Archivo no existente en la ruta: {ruta}")
    return archivos[0]


def _obtener_ruta_opcional(ruta):
    archivos = sorted(glob.glob(ruta, recursive=True))
    return archivos[0] if archivos else None


def _buscar_en_ruta_y_padres(ruta, patron):
    ruta_abs = os.path.abspath(ruta)
    candidatos = [
        os.path.join(ruta_abs, patron),
        os.path.join(ruta_abs, "**", patron),
    ]

    padre = os.path.dirname(ruta_abs)
    if padre and padre != ruta_abs:
        candidatos.extend([
            os.path.join(padre, patron),
            os.path.join(padre, "**", patron),
        ])

    for candidato in candidatos:
        archivo = _obtener_ruta_opcional(candidato)
        if archivo:
            return archivo

    raise FileNotFoundError(f"Archivo no existente en la ruta ni en su padre: {ruta_abs}/{patron}")


def _extraer_timestamp(ruta_archivo):
    nombre = os.path.basename(ruta_archivo)
    match = re.search(r"(\d{14})", nombre)
    return match.group(1) if match else None


def _nombre_trayectoria(ruta):
    for parte in reversed(os.path.abspath(ruta).split(os.sep)):
        if parte.startswith("Trayectoria-"):
            return parte.replace("Trayectoria-", "")
    return ""


def _preferir_video_por_trayectoria(candidatos, ruta):
    trayectoria = _nombre_trayectoria(ruta).lower()
    if not trayectoria:
        return candidatos[0]

    estaciones = [parte for parte in trayectoria.split("-") if parte]
    for estacion in estaciones:
        for candidato in candidatos:
            if estacion.lower() in os.path.basename(candidato).lower():
                return candidato

    return candidatos[0]


def _buscar_video_por_timestamp(ruta, timestamp):
    ruta_abs = os.path.abspath(ruta)
    actual = ruta_abs
    while True:
        candidatos = sorted(glob.glob(os.path.join(actual, f"{timestamp}*.avi")))
        if candidatos:
            return _preferir_video_por_trayectoria(candidatos, ruta_abs)

        siguiente = os.path.dirname(actual)
        if siguiente == actual:
            break
        actual = siguiente

    raise FileNotFoundError(f"No se ha encontrado un video .avi relacionado con el timestamp {timestamp} desde {ruta_abs}")


def _procesar_brillos(magnitudes):
    """Aplica la funcion float a todos los valores para forzar el tipo, en caso de tener algun numero entero"""
    try:
        max_val = max(float(v) for v in magnitudes if str(v).lower() != 'nan')
        return [max_val if str(v).lower() == 'nan' else float(v) for v in magnitudes]
    except ValueError as e:
        raise ValueError(f"El contenido del archivo Magnitudes contiene algun texto:\n{str(e)}")



def obtener_fragmentacion(brillos):
    """
        Detecta si ha ocurrido fragmentacion en el bolido calculando valores que superen x3 el valor de la desviacion
        media del array de magnitudes. Si se ha producido, se devolvera un array con valores 0.5 en todos los indices
        correspondiente a cada valor que supere x3 la desviacion media, y 0 si no.
    """
    try:
        desv = np.std(brillos)
        media = np.mean(brillos)
        logger.info(f"Calculando fragmentacion:\n\\___ * Desviacion : {desv}\n\\___ * Media : {media}\n\\___ * Valor a superar : {media + desv * 2}")
        fragm = [1 if v - media > desv * 2 else 0 for v in brillos]
        logger.info(f"Array de fragmentacion:\n\\___ * {fragm}")
        return fragm
    except Exception as e:
        logger.error(str(e))
        raise



def parse_idInforme(ruta):
    """
        Parsea la ruta para encontrar el informe y obtiene los datos necesarios para identificar el ID en la base de datos
        Parametros:
            ruta    : ruta del proyecto
        Devuelve:
            archivo     : ruta directa al archivo del Informe-Z
            fecha, hora : valores detectados en la primera linea del Informe que posteriormente se usaran para obtener el Id en la BD
    """

    try:
        if (not ruta):
            raise ValueError(f"Ruta no especificada:\n\\___ * Ruta: {ruta}")
        logger.info(f"Buscando ruta del proyecto: {ruta}/Informe-Z-*")
        archivo = _buscar_en_ruta_y_padres(ruta, "Informe-Z-*")
        logger.info(f"Archivo del Informe-Z: {archivo}")
        archivo = archivo.replace('\\', '/')
        
        with open(archivo, "r", encoding="utf-8") as f:
            linea = f.readline().strip()

        tiempo = linea.split('T')
        fecha = tiempo[0] if len(tiempo) > 0 else None
        hora = tiempo[1] if len(tiempo) > 1 else None
        if (not fecha or not hora):
            raise ValueError(f"El archivo esta vacio o no se encuentran fecha u hora en la primera linea:\n\\___ * Primera linea: {linea}\n\\___ * Fecha : {fecha}\n\\___ * Hora: {hora}")
        
        logger.info(f"Encontrado Informe-Z: fecha = {fecha} hora = {hora}")
        return archivo, fecha, hora

    except ValueError as e:
        raise Exception
    except FileNotFoundError as e:
        logger.error(f"No se ha encontrado el proyecto en la ruta esperada: {ruta}\n" +
                    "Puede no haber sido cargado correctamente desde el servidor al contenedor")
        logger.error(str(e))
        raise
    except Exception as e:
        logger.error(f"Error inesperado al parsear el Informe-Z {archivo}")
        logger.error(str(e))
        raise



def corregir_puntos(puntos,dimension):
    """
        Recalibra los puntos de la deteccion, ya que en FITS el origen (0,0) esta
        en la esquina inferior izquierda y en PNG esta en la superior izquierda.
        Solo hay que invertir el eje Y.
        Parametros:
            puntos      : puntos de la trayectoria detectada en la BD
            dimension   : dimension del video (ancho x alto)
        Devuelve:
            puntos : array puntos de la trayectoria corregidos
    """
    try:
        if(puntos and dimension):
            logger.info(f"Invirtiendo coordenadas:\n\\___ * Coordenadas : {puntos}\n\\___ * Dimension total : {dimension}")
            puntos = [ puntos[0], dimension[1]-puntos[1], puntos[2], dimension[1]-puntos[3] ]
            logger.info(f"Nuevas coordenadas:\n\\___ * Coordenadas : {puntos}")
            return puntos
    except Exception:
        logger.error(f"Error inesperado al leer el archivo Magnitues {archivo}")
        raise



def obtener_brillos(ruta):
    """
        Parsea la ruta para obtener los brillos del archivo Magnitudes que se encuentra en cada deteccion
        Parametros:
            ruta    : ruta del proyecto
        Devuelve:
            brillos : array de brillos encontrados en el archivo Magnitudes
    """

    try:
        if(not ruta):
            raise ValueError(f"Ruta no especificada:\n\\___ * Ruta: {ruta}")
        brillos = []
        logger.info(f'Buscando ruta de las Magnitudes: {ruta}/Magnitudes*')
        archivo = _buscar_en_ruta_y_padres(ruta, "Magnitudes*")
        logger.info(f"Archivo de las Magnitudes: {archivo}")

        with open(archivo, 'r') as f:
            contenido = f.read()
        
        if (not contenido):
            raise ValueError(f"El archivo esta vacio:\n\\___ * Contenido: {contenido}")
        
        numeros_str = contenido.split()
        brillos = _procesar_brillos(numeros_str) # Se ejecuta en una funcion interna para controlar el error de tipado
        logger.info(f"Encontradas Magnitudes:\n{brillos}")
        return brillos
        
    except ValueError:
        raise
    except FileNotFoundError as e:
        logger.error(f"No se ha encontrado el archivo Magnitues en la ruta esperada: {ruta}\n" +
                    "Puede no haber sido cargado correctamente desde el servidor al contenedor")
        logger.error(str(e))
        raise
    except Exception:
        logger.error(f"Error inesperado al leer el archivo Magnitues {archivo}")
        raise



def obtener_video(ruta):
    """
        Parsea la ruta para encontrar el video de la deteccion usando una expresion regex
        Parametros:
            ruta    : ruta del proyecto
        Devuelve:
            archivo : ruta completa del video
    """
    try:
        if(not ruta):
            raise ValueError(f"Ruta no especificada:\n\\___ * Ruta: {ruta}")
        
        informe = _buscar_en_ruta_y_padres(ruta, "Informe-Z-*")
        timestamp = _extraer_timestamp(informe)
        if not timestamp:
            raise ValueError(f"No se ha podido extraer timestamp del Informe-Z: {informe}")

        archivo = _buscar_video_por_timestamp(ruta, timestamp)
        logger.info(f"Encontrado el video: {archivo}")
        return archivo

    except ValueError:
        raise
    except FileNotFoundError as e:
        logger.error(f"No se ha encontrado el archivo del video en la ruta esperada: {ruta}\n" +
                    "Puede no haber sido cargado correctamente desde el servidor al contenedor")
        logger.error(str(e))
        raise
    except Exception:
        logger.error(f"Error inesperado al leer el video de la deteccion {archivo}")
        raise



def igualar(velocidades, brillos, tiempos):
    """Normaliza los tres arrays a la longitud del array de tiempos, necesario para aplicar la sonificacion"""
    try:
        if(not velocidades or not brillos or not tiempos):
            raise ValueError(f"Uno de los arrays esta vacio\n\\___ * velocidades : {velocidades}\n\n\\___ * brillos : {brillos}\n\n\\___ * tiempos : {tiempos}")
        
        n_tiempos = len(tiempos)
        logger.info(f"Igualando al tamano del array de tiempos detectados = {n_tiempos} ...")
        logger.info(f"Arrays con tamano inicial...\n\\___ * velocidades : {len(velocidades)}\n\\___ * brillos : {len(brillos)}\n\\___ * tiempos : {len(tiempos)}")
        logger.info(f"Espaciando los arrays hasta la longitud deseada...")
        velocidades_espaciadas = np.linspace(0, len(velocidades)-1, n_tiempos)
        brillos_espaciados = np.linspace(0, len(brillos)-1, n_tiempos)

        logger.info(f"Interpolando arrays...")
        velocidades = np.interp(velocidades_espaciadas, np.arange(len(velocidades)), velocidades)
        brillos     = np.interp(brillos_espaciados, np.arange(len(brillos)), brillos)
        tiempos     = np.linspace(tiempos[0], tiempos[-1], n_tiempos)
        logger.info(f"Nuevos arrays con tamano...\n\\___ * velocidades : {len(velocidades)}\n\\___ * brillos : {len(brillos)}\n\\___ * tiempos : {len(tiempos)}")

        return velocidades.tolist(), brillos.tolist(), tiempos.tolist()
    
    except ValueError:
        raise
    except Exception:
        logger.error(f"Error inesperado al igualar la longitud de los arrays")
        raise



def procesar_vol(array):
    """Procesa el array de brillos para convertir los valores al rango permitido de volumenes [0,1]"""
    try:
        if(not array):
            raise IndexError(f"El array esta vacio\n\\___ * array = {array}")
        if(not isinstance(array[0], float)):
            raise TypeError(f"El array no contiene punto flotante (float)\n\\___ * array = {array}")
        
        logger.info(f"Ajustando... brillos->volumenes")
        max_val = max(array)
        
        array = [round(b / max_val, 3) for b in array] # se pondera cada valor sobre el valor maximo del array
        
        return array

    except Exception as e:
        logger.error(f"Error inesperado al procesar el array\n * array = {array}")
        logger.error(str(e))
        raise



def procesar_freq(array, espectro=(20, 20000)):
    """
        Procesa el array de velocidades para convertir los valores al rango frecuencias del espectro sonoro
            Parametros:
                array       : array con las velocidades del bolido
                espectro    : rango de valores del espectro sonoro, por defecto [20,20.000] Hz
                            para un sonido mas agradable se puede modificar a [64, 4.096] Hz
            Devuelve:
                array       : array con las frecuencias ya procesadas
    """
    try:
        if(not array):
            raise IndexError(f"El array esta vacio\n\\___ * array = {array}")
        if(not isinstance(array[0], float)):
            raise TypeError(f"El array no contiene punto flotante (float)\n\\___ * array = {array}")
        
        logger.info(f"Ajustando... velocidades->frecuencias")
        
        max_val = max(array)
        min_val = min(array)
        pond = espectro[1] - espectro[0]

        if(min_val * pond < espectro[0]):
            logger.warning(f"El valor minimo es inferior al valor permitido {min_val}<{espectro[0]}. Se han ajustado los valores al rango permitido")
            array = [round(f + espectro[0] - min_val, 1) for f in array] # si es inferior (por ejemplo, v=12 < 20=espectro[0]), se ajusta a [min_val->espectro[0]]
        if(max_val <= espectro[1]/pond):
            array = [round(f * pond, 1) for f in array] # frecuencias pertenecientes al rango del espectro
        else:
            logger.warning(f"El valor maximo supera el valor permitido. Se han ajustado los valores al rango permitido")
            array = [round(f * espectro[1] / max_val, 1) for f in array] # si se supera (por ejemplo, v=22 * 1000 = 22000 > espectro[1]=20000), se ajusta a [max_val->espectro[1]

        print(array)
        return array

    except Exception as e:
        logger.error(f"Error inesperado al procesar el array\n\\___ * array = {array}")
        logger.error(str(e))
        raise



def obtener_paneo(freqs, rango_paneo, rango_total):
    """
        Pondera el rango de paneo sobre el total para obtner el array de paneo necesario para la sonificacion midi bidimensional.
        El main usa este metodo dos veces, la primera sobre el eje horizontal y la segunda sobre el eje vertical
        Parametros:
            freqs       : array de frecuencias para obtener su tamano
            rango_paneo : valores de inicio y fin de la trayectoria del meteoro, obtenidos desde la BD
            rango_total : valores de la dimension del video, para ponderar la trayectoria
        Devuelve:
            paneo_pond  : array con valores entre 0 (totalmente izquierda) y 1 (totalmente derecha) para cada una de las frecuencias
    """
    try:
        if(not freqs or not rango_paneo or not rango_total):
            raise ValueError(f"Uno de los arrays esta vacio\n\\___ * Frecuencias : {freqs}\n\\___ * Rango de paneo : {rango_paneo}\n\\___ * Dimensiones totales : {rango_total}")
        
        logger.info(f"Rango para paneo a ponderar sobre el total\n\\___ * Rango : {rango_paneo}\n\\___ * Total: {rango_total}")
        rango = np.linspace(rango_paneo[0], rango_paneo[1], len(freqs))
        paneo_pond = [round(float(r / (rango_total[1] - rango_total[0])), 2) for r in rango]
        logger.info(f"Rango para paneo ponderado:\n{paneo_pond}")

        return paneo_pond

    except ValueError:
        raise      
    except TypeError as e:
        logger.error("Se ha aplicado una funcion matematica a un valor no numerico")
        logger.error(str(e))
        raise
    except Exception:
        logger.error("Error inesperado al igualar la longitud de los arrays")
        raise
