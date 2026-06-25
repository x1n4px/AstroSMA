"""
Clase para aplicar calculos o modificaciones de vision por computador al video de la deteccion
"""

import numpy as np
import cv2
import glob
import os
import logging
logger = logging.getLogger(__name__)


def dibujar_trayectoria(ruta_video, destino, puntos, tam=30, color=[250,250,250]):
    """
        Dibuja un cuadrado que sigue al bolido a lo largo de su trayectoria
            Parametros:
                ruta_video  : ubicacion del video de la deteccion
                destino     : ruta donde se guardara el nuevo video
                puntos      : vector con los puntos [x_inicial, y_inicial, x_final, y_final]
                tam         : tamano del cuadrado, por defecto 30
                color       : color del cuadrado en [R,G,B], por defecto [250,250,250] es un blanco suave
    """
    try:
        if(not ruta_video or not destino or not puntos):
            raise ValueError(f"Faltan valores...\n\\___ * Ruta del video : {destino}...\n\\___ * Puntos de trayectoria : {puntos}")
        
        logger.info(f"Ruta del video: {ruta_video}")
        vid = cv2.VideoCapture(ruta_video)
        ancho  = int(vid.get(cv2.CAP_PROP_FRAME_WIDTH))
        altura = int(vid.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps    = vid.get(cv2.CAP_PROP_FPS)
        n_frames  = int(vid.get(cv2.CAP_PROP_FRAME_COUNT))

        logger.info(f"Metadata del video...\n\\___ * Dimensiones :  {ancho}x{altura}\n\\___ * FPS : {fps}\n\\___ * Numero de frames : {n_frames}")
        salida = cv2.VideoWriter(f"{destino}/deteccion-trayectoria.mp4", cv2.VideoWriter_fourcc(*'mp4v'), fps, (ancho, altura))

        # Punto A y punto B (centro del cuadrado) forzando el tipo int
        x1 ,y1, x2, y2 = map(int, puntos)
        
        logger.info(f"Dibujando la trayectoria entre los puntos...\n\\___ * Inicio = ({x1},{y1})\n\\___ * Fin = ({x2},{y2})")

        # Por cada fotograma del video se dibuja el cuadrado en el archivo de salida
        frame_indice = 0
        while vid.isOpened():
            ret, frame = vid.read()
            if not ret:
                break

            t = frame_indice / n_frames  # 0.0 -> 1.0
            cx = int(x1 + (x2 - x1) * t)
            cy = int(y1 + (y2 - y1) * t)

            cv2.rectangle(frame, (cx - tam, cy - tam), (cx + tam, cy + tam), color, 1)
            salida.write(frame)
            frame_indice += 1

        vid.release()
        salida.release()
        logger.info(f"Dibujada la trayectoria")
        print(f"Tamaño archivo: {os.path.getsize(f"{destino}/deteccion-trayectoria.mp4")} bytes")

    
    except Exception as e:
        logger.error(f"Error inesperado al dibujar la trayectoria")
        logger.error(str(e))
        raise