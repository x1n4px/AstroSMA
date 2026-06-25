"""
Clase con los metodos crear una sonificacion
"""

import os
import subprocess
import numpy as np
from scipy.io import wavfile
from scipy.io.wavfile import write
from midiutil import MIDIFile
import sounddevice as sd
import logging
logger = logging.getLogger(__name__)

# Configuracion
sample_rate = 44100
pan    = 0.0
tempo  = 120
t_nota = 1 / 6

def _configuracion_canales(midi, canal, instrumento):
    """
        Aplica la configuracion interna de cada canal: instrumento, controlador del portamento, velocidad del portamento
        Las configuraciones son:
            Instrumento :   Se aplica un instrumento personalizado a cada canal para que el resultado de la sensacion de profundidad deseada.
                            Para el eje X se escoge un instrumento que transmita "horizontalidad" y para el eje Y uno que transmita "verticalidad"
                            La fragmentacion es el evento en el que el bolido se rompe, provocando un fuerte destello por encima de la media
                            La configuracion predeterminada que resulta en sensaciones satisfactorias son:
                                * Canal 0 = Eje X = 50 (cuerdas)
                                * Canal 1 = Eje Y = 75 (flauta de pico)
                                * Canal 2 = Fragmentacion = 127 (pistola)
            CC65 = 127  :   Activa el portamento, que es el barrido entre notas y ayuda a que el sonido suene continuo,
                            ya que la naturaleza de midi es usar notas discretas en lugar de una funcion continua como lo
                            era la funcion seno en el metodo sonido_simple.
            CC5 = 10    :   Aplica la velocidad del portamento, comprendida entre (0=instantáneo, 127=muy lento)
    """
    try:
        instrumento = int(instrumento)
        if not 0 <= instrumento <= 127:
            raise ValueError(f"Instrumento {instrumento} fuera de rango (0-127)")
        midi.addProgramChange(0, canal, 0, instrumento)

        # Activar portamento rapido para hacer que el sonido sea continuo en lugar de discreto
        midi.addControllerEvent(0, canal, 0, 65, 127)
        midi.addControllerEvent(0, canal, 0, 5,  10)
        logger.info(f"Valores internos de la clase MIDI:\n\\___ * Tempo = {tempo}\n\\___ * Duracion = {t_nota}"
                + f"\n\\___ * Instrumento: {instrumento}\n\\___ * Portamento activado (CC65): 127\n\\___ * Portamento velocidad (CC5): 10")    
    except Exception as e:
        logger.error(str(e))
        raise



def _paneo_lineal(midi, canal, freqs, vols, array_paneo):
    """
        Mapea un valor al rango de paneo MIDI [0, 127], siendo 0 = izquierda total y 127 = derecha total
        Parametros:
            midi        :   archivo midi sobre el que se escriben las notas
            canal       :   canal de audio. puede tomar dos valores: 0 = Eje X  o  1 = Eje Y
            freqs       :   array de frecuencias
            vols        :   array de volumenes
            array_paneo :   array con los valores de paneo a aplicar
    """
    try:
        for i, pan in enumerate(array_paneo):
            pan_midi = int(pan * 127)  # 0.0->0, 0.5->64, 1.0->127
            midi.addControllerEvent(0, canal, i * t_nota, 10, pan_midi)
        
        for i, (fr, vo) in enumerate(zip(freqs, vols)):
            vol_pond = int(min(127, max(0, vo * 127)))
            nota = _freq_a_nota(fr)
            midi.addNote(0, canal, nota, i * t_nota, t_nota, vol_pond)

        logger.info(f"Paneo aplicado en el canal {canal}:\n{array_paneo}")

        return midi
    except Exception as e:
        logger.error(str(e))
        raise



def _freq_a_nota(freq):
    """Transforma la frecuencia en la nota que se anade al archivo midi"""
    try:
        if freq <= 0: return 0
        return int(round(69 + 12 * np.log2(freq / 440.0)))
    except Exception as e:
        logger.error(str(e))
        raise



def sonido_simple(marcas_t, freqs, volumes, duracion, destino, fade=False):
    """
        Crea el archivo .wav de la sonificacion simple, es decir, sin paneo y usando una funcion seno para el sonido
        en lugar de soundfonts de MIDI.
            Parametros:
                marcas_t    : array con las marcas de tiempo correspondientes a cada valor brillo/velocidad en la BD
                freqs       : array con las frecuencias tras aplicar la conversion
                volumenes   : array con los volumenes tras aplicar la conversion
                duracion    : duracion total del video de la deteccion, necesaria para unir el sonido al video
                destino     : ruta donde se exportara el archivo .wav
                fade        : opcionalmente, se podra aplicar un efecto fade para suavizar las ultimas notas.
                            por defecto esta desactivado
    """
    try:
        if(not marcas_t or not freqs or not volumes or not duracion):
            raise IndexError(f"El array esta vacio\n\\___ * tiempos = {marcas_t}\n\\___ * frecuencias = {freqs}"+
                                f"\n\\___ * volumenes = {volumes}\n\\___ * duracion = {duracion}")
        
        # Tiempo total y vector de muestras
        tiempos = np.linspace(0, duracion, int(sample_rate * duracion), endpoint=False)
        logger.info(f"Marcas de tiempo del video:\n{tiempos}")
        if(len(tiempos)==0):
            info.warning("El array de las marcas de tiempo esta vacio")
        
        # Interpolar frecuencias y volumenes
        freq_interp = np.interp(tiempos, marcas_t, freqs, right=0.0)
        vol_interp  = np.interp(tiempos, marcas_t, volumes, right=0.0)
        logger.info(f"Marcas de frecuencias interpoladas:\n{freq_interp}")
        if(len(freq_interp)==0):
            info.warning("El array de las marcas de tiempo esta vacio")
        
        vol_interp = np.interp(tiempos, marcas_t, volumes)
        logger.info(f"Marcas de volumenes interpoladas:\n{vol_interp}")
        if(len(vol_interp)==0):
            info.warning("El array de las marcas de tiempo esta vacio")
        
        # Señal modulada con funcion seno simple
        fase = np.cumsum(freq_interp) / sample_rate
        audio = np.sin(2 * np.pi * fase) * vol_interp
        logger.info(f"Onda de funcion seno: {audio}")

        if fade:
            logger.info("El efecto fade esta ACTIVADO")
            # Fade-out suave (100 ms)
            fade_samples = int(0.01 * sample_rate)
            fade_out = np.linspace(1, 0, fade_samples)
            audio_out = fade_out
            audio = np.append(audio, audio_out)
        else:
            logger.info("El efecto fade esta DESACTIVADO")

        # Paneo estereo corregido, esta funcion tiene por objetivo una sonificacion sencilla y
        # por tanto no se aplica, queda anotado por motivos de historial o futuro uso
        # audio_left = audio * (1 - pan)
        # audio_right = audio * (1 + pan) / 2
        # audio = np.column_stack((audio_left, audio_right))
        audio_int16 = (audio * 32767).astype(np.int16)

        # Solo se puede reproducir el sonido si no es headless.
        # Tanto el contenedor como el servidor lo son y por tanto esta desactivado,
        # queda anotado por motivos de historial o futuro uso
        # sd.play(audio_stereo, sample_rate)
        # sd.wait()

        if(not destino):
            raise ValueError(f"Al intentar escribir el archivo de audio simple: la ruta de destino no ha sido especificada:\n\\___ * Ruta de destino = {nombre_archivo}")

        write(destino, sample_rate, audio_int16)
        logger.info(f"Sonido simple .wav creado en: {destino}")

    except ValueError as e:
        logger.error(str(e))
        raise
    except FileNotFoundError as e:
        logger.error(f"No se ha encontrado el archivo del video en la ruta esperada\n" +
                    "Puede no haber sido cargado correctamente desde el servidor al contenedor")
        logger.error(str(e))
        raise
    except Exception as e:
        logger.error(str(e))
        raise



def midi_v1(freqs, vols, fragm, paneo, voz_1, voz_2, voz_fragm, voz_fondo, ruta):
    """
        Crea el archivo .mid de la sonificacion, usando dos voces (soundfonts) y paneo.
            Parametros:
                freqs   : array con las frecuencias para cada nota
                vols    : array con los volumenes para cada nota
                fragm   : array con los instantes en los que se ha detectado una fragmentacion.
                        Se aplica la voz_fragm con volumen 0 si no hay fragmentacion y con volumen 0,5 si la hay
                paneo   : array con la posicion del paneo para cada nota para la dimension X.
                        Se aplica unicamente sobre el eje horizontal ya que la sensacion vertical
                        ya la aporta el instrumento seleccionado y la diferencia entre valores X e Y
                        resulta en valores de paneo distintos, lo que causa que las dos voces no esten
                        coordinadas, sino que se muevan entre rangos distintos, y perdiendo asi el efecto deseado
                voz_1   : programa midiutil para la voz del eje X
                voz_2   : programa midiutil para la voz del eje Y
                voz_fragm :  programa midiutil para la voz de fragmentaciones
                voz_fondo :  programa midiutil para la voz de fondo
                ruta    : ruta donde se guardara el archivo .mid
    """
    try:
        if(not freqs or not vols):
            raise ValueError(f"Uno de los arrays esta vacio\n\\___ * frecuencias = {freqs}\n\\___ * volumenes = {vols}")
        if (not voz_1 or not voz_2 or not ruta):
            raise ValueError(f"Ruta no especificada:\n\\___ * Voz 1: {voz_1}\n\\___ * Voz 2: {voz_2}\n\\___ * Ruta destino mid/wav: {ruta}")


        midi = MIDIFile(1)
        midi.addTempo(0, 0, tempo)

        _configuracion_canales(midi, 0, voz_1)
        _configuracion_canales(midi, 1, voz_2)
    #    _configuracion_canales(midi, 3, voz_fondo)
        if any(fragm):
            logger.info("Se ha detectado fragmentacion")
            _configuracion_canales(midi, 2, voz_fragm)
        else:
            logger.info("No se ha detectado fragmentacion")
        
        if(len(paneo)!=len(freqs)):
            raise ValueError(f"La longitud de los valores de paneo no coincide con la longitud de las frecuencias:"
            + f"\n\\___ * Frecuencias = {len(freqs)}\n\\___ * Paneo = {len(paneo)}")

        logger.info(f"Aplicando paneo...\n\\___ * Canal 0 -> Eje X\n\\___ * Canal 1 -> Eje Y")
        logger.info(f"Paneo horizontal...")
        midi = _paneo_lineal(midi, 0, freqs, vols, paneo)
        logger.info(f"Paneo vertical...")
        midi = _paneo_lineal(midi, 1, freqs, vols, paneo)
        
        if any(fragm):
            logger.info(f"Paneo de fragmentacion...")
            midi = _paneo_lineal(midi, 2, freqs, fragm, paneo)
            
    #    Comentado para futuras pruebas de sensaciones...
    #    logger.info(f"Sonido de fondo...")
    #    midi = _paneo_lineal(midi, 3, freqs, vols, paneo)


        with open(f"{ruta}.mid", "wb") as f:
            midi.writeFile(f)

        logger.info(f"Ruta del archivo midi: {ruta}.mid")

        
        subprocess.run([
            "fluidsynth", "-a", "alsa", "-g", "1.0",
            "-o", "synth.audio-channels=2",
            "-o", "synth.chorus.active=0",
        #    "-o", "synth.reverb.active=0",   # desactivado el reverb para mayor claridad
            "-T", "wav",
            "-F", f"{ruta}.wav",
            f"{ruta}.mid"
        ])

        '''
        # Para el uso de soundfonts, habria que incluirlos de esta forma:
        subprocess.run([
            ...
            "-F", f"{ruta}.wav",
            voz_canal0, voz_canalN,
            f"{ruta}.mid"
        ])
        '''

        logger.info(f"Sintetizado el archivo midi -> wav: {ruta}.wav")

        _forzar_paneo(ruta, paneo)
        
    except ValueError as e:
        raise Exception
    except FileNotFoundError as e:
        logger.error(f"No se ha encontrado el archivo en la ruta esperada: {ruta}\n" +
                    "Puede haber ocurrido algun problema con las rutas o que no se haya creado debido a falta de espacio")
        logger.error(str(e))
        raise
    except Exception as e:
        logger.error(f"Error inesperado al ejecutar la sonificacion midi")
        logger.error(str(e))
        raise



def _forzar_paneo(ruta_archivo, array_paneo):
    """
        En caso de que la sonificacion midi no ejecute correctamente el paneo, se puede aplicar a posteriori,
        sobreescribiendo el archivo .wav sintetizado
    """
    try:
        sr, datos = wavfile.read(f"{ruta_archivo}.wav")
        datos = datos.astype(np.float32)
        n_samples = len(datos)

        for i, pan in enumerate(array_paneo):
            pan = max(0.0, min(1.0, pan))
            inicio = int(i * n_samples / len(array_paneo))
            fin    = int((i+1) * n_samples / len(array_paneo))
            # Multiplicamos los datos por el paneo al cuadrado, ya que si no el efecto es demasiado sutil y no se percibe
            datos[inicio:fin, 0] *= (1 - pan)*(1 - pan)  # izq
            datos[inicio:fin, 1] *= pan * pan            # der

        wavfile.write(f"{ruta_archivo}.wav", sr, datos.astype(np.int16))
        logger.info(f"Paneo sobreescrito al wav: {ruta_archivo}.wav")
    except Exception as e:
        logger.error(str(e))
        raise
