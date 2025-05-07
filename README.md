# AstroUMA
# Visualización e Inferencia de Datos de Lluvias de Meteoros

Este proyecto tiene como objetivo desarrollar una plataforma web interactiva para visualizar y analizar los datos de lluvias de meteoros recopilados por la Universidad de Málaga (UMA) y la Sociedad Malagueña de Astronomía (SMA), en colaboración con el profesor Alberto Castellón Serrano.

## Contexto

La UMA y la SMA han creado una base de datos que registra la información de la identificación y monitoreo de lluvias de meteoros. Sin embargo, el análisis y la representación gráfica de estos datos pueden ser complicados debido a su volumen, diversidad y formato. Este Trabajo de Fin de Grado (TFG) busca solucionar este problema mediante la creación de una plataforma web accesible e intuitiva.

## Objetivos

* Desarrollar una aplicación web interactiva que se conecte a la base de datos de la UMA/SMA.
* Implementar visualizaciones de datos sofisticadas para facilitar la comprensión de la información.
* Aplicar métodos de análisis de datos para identificar patrones y tendencias en las lluvias de meteoros.
* Promover la divulgación científica, permitiendo a investigadores y aficionados explorar los datos fácilmente.

## Tecnologías Utilizadas

* **Frontend:** React
* **Backend:** Node.js
* **Base de Datos:** MariaDB

## Funcionalidades Principales

* Visualización interactiva de datos de lluvias de meteoros.
* Herramientas de análisis para identificar patrones y tendencias.
* Interfaz intuitiva y fácil de usar para investigadores y aficionados.
* Divulgación científica a través de la exploración de datos.

## Contribución

Este TFG se basa en trabajos previos sobre recolección de datos astronómicos, pero va más allá al ofrecer una solución tecnológica que centraliza, procesa y muestra la información de manera eficiente. A diferencia de los métodos anteriores, esta plataforma proporciona una herramienta sofisticada para la interpretación de datos, impulsando el conocimiento en el campo de la astronomía y fomentando la divulgación científica.

## Instalación

1.  Clona el repositorio:

    ```
    git clone https://github.com/x1n4px/AstroUMA.git
    cd AstroUMA
    ```

2. Gestión de la base de datos:
   ```
   CREATE USER 'astro_user'@'localhost' IDENTIFIED BY '0000';
    CREATE DATABASE astro;
    GRANT ALL PRIVILEGES ON astro.* TO 'astro_user'@'localhost';
    FLUSH PRIVILEGES;

   ```    

3.  Instala las dependencias del backend:

    ```bash
    cd Backend
    npm install
    pwd -> /home/user/git/AstroUMA/Backend
    nano .env
    ```
    El .env:
    ```
    DB_HOST=localhost
    DB_USER=astro_user
    DB_PASSWORD=0000
    DB_NAME=astro
    JWT_SECRET=testingjwtpassword
    ```

    
   
    
4.  Inicia el servidor backend:
    ```
    npm run start
    ```

5.  Frontend:

    ```bash
    cd ../frontend
    npm install
    pwd -> /home/user/git/AstroUMA/Frontend
    nano .env

    ```
    El .env:
    ```
    VITE_API_URL=http://localhost:3005/api
    VITE_GEMINI_API_KEY=00
    VITE_GEMINI_MODEL=gemini-2.0-flash

    ```
    Habríar que generar una API key en https://aistudio.google.com/app/apikey, pero por el momento no lo vamos a hacer.


6.  Inicia la aplicación frontend:

    ```bash
    npm run start
    ```

## Uso

1.  Abre la aplicación web en tu navegador.
2.  Explora las visualizaciones de datos y utiliza las herramientas de análisis.
3.  Familiarízate con los patrones y tendencias de las lluvias de meteoros.

