"""
Clase para la conexion a la base de datos
"""

import mysql
import sys
import mysql.connector
import logging
logger = logging.getLogger(__name__)


def conexion_basica(host, database, user, password):
    """
        Establece la conexion basica a la BD
        Devuelve:
            db      : conexion a la base de datos
            cursor  : cursor para ejecutar las consultas query
    """
    try:
        if not user or not password or not database:
            raise ValueError(f"No se encontraron las variables de entorno.\n\\___ * Host = {host} (por defecto localhost:3306)\n\\___ * Database = {database}\n\\___ * User = {user}\n\\___ * Password = {password}")
        db = mysql.connector.connect(
            host = host,
            user=user,
            password=password,
            database=database);
        basic = db.cursor();
        logger.info(f"Conectado a la BD '{database}' en el host '{host}' con...\n\\___ * usuario '{user}'\n\\___ * contraseña '{password}'\n" +
                    "Tenga en cuenta que si no usa un valor para host el valor predeterminado es 'localhost:3306'")
        return(db, basic)

    except mysql.connector.ProgrammingError as e:
        logger.error(f"Error en la sintaxis al conectar a la base de datos query con...\n\\___ * base = '{database}'\n\\___ * host = '{host}'\n\\___ * usuario = '{user}'\n\\___ * contraseña = '{password}'\n---> {str(e)}")
        logger.error(str(e))
        raise e
    except ValueError:
        raise
    except Exception as e:
        logger.error(f"Error inesperado al conectarse a la base de datos:\n---> {str(e)}")
        logger.error(str(e))
        raise e



def ejecutar(query, cursor, verbose=False):
    """
        Ejecuta una query en la BD. 
        Parametros:
            query   : sentencia a ejecutar
            cursor  : cursor para ejecutar las consultas query
            verbose : opcionalmente, se muestran por pantalla los resultados obtenidos. Por defecto es False
        Devuelve:
            column_names    : lista con los nombres de las columnas, para logs, debug...
            tupla           : vector que contiene los valores obtenidos
            size            : numero de filas obtenidas
    """
    try:
        logger.info("-- Ejecutando QUERY --")
        cursor.execute(query)
        logger.info(query)


        tuplas = cursor.fetchall()
        column_names = [column[0] for column in cursor.description]
        size = len(tuplas)

        if(verbose):
            for tupla in tuplas:
                for n in range(len(column_names)):
                    print(f"{column_names[n]}: {tupla[n]}")

                print("\n-------------------------------")

        return (column_names, tuplas, size)

    except mysql.connector.ProgrammingError as e:
        logger.error(f"Error en la sintaxis de la sentencia query\n\\___ {query}\n---> {str(e)}")
        logger.error(str(e))
        raise e
    except mysql.connector.DatabaseError as e:
        logger.error(f"Error en los datos usados para la sentencia query\n\\___ {query}\n---> {str(e)}")
        logger.error(str(e))
        raise e
    except Exception as e:
        logger.error(f"Error inesperado al ejecutar la query: {query}")
        logger.error(str(e))
        raise e