-- 1. Modificar tablas existentes
ALTER TABLE pais 
ADD PRIMARY KEY (id),
ADD UNIQUE KEY pais_unique_nombre (nombre),
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE user 
MODIFY password VARCHAR(100) NOT NULL,
ADD COLUMN rol VARCHAR(100) DEFAULT NULL,
ADD COLUMN institucion VARCHAR(100) DEFAULT NULL,
ADD PRIMARY KEY (id),
ADD UNIQUE KEY user_unique_email (email),
ADD KEY user_pais_FK (pais_id),
ADD CONSTRAINT user_pais_FK FOREIGN KEY (pais_id) REFERENCES pais (id),
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE Ecuacion_parametrica 
MODIFY IdEc INT(11) NOT NULL,
MODIFY a DECIMAL(21,18) DEFAULT NULL,
MODIFY b DECIMAL(21,18) DEFAULT NULL,
MODIFY c DECIMAL(21,18) DEFAULT NULL,
MODIFY Inicio_Estacion_1 VARCHAR(200) DEFAULT NULL,
MODIFY Fin_Estacion_1 VARCHAR(200) DEFAULT NULL,
MODIFY Inicio_Estacion_2 VARCHAR(200) DEFAULT NULL,
MODIFY Fin_Estacion_2 VARCHAR(200) DEFAULT NULL,
ADD PRIMARY KEY (IdEc),
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE Lluvia 
MODIFY Identificador VARCHAR(20) NOT NULL,
MODIFY Año INT(11) NOT NULL,
ADD COLUMN src VARCHAR(255) DEFAULT NULL,
ADD PRIMARY KEY (Identificador, Año),
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE Meteoro 
MODIFY Identificador INT(11) NOT NULL,
ADD PRIMARY KEY (Identificador),
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE Observatorio 
MODIFY Número INT(11) NOT NULL,
ADD PRIMARY KEY (Número),
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Modificar tablas con nuevas claves foráneas
ALTER TABLE Informe_Fotometria 
MODIFY Identificador INT(11) NOT NULL,
ADD PRIMARY KEY (Identificador),
ADD KEY Informe_Fotometria_Meteoro_FK (Meteoro_Identificador),
ADD CONSTRAINT Informe_Fotometria_Meteoro_FK FOREIGN KEY (Meteoro_Identificador) REFERENCES Meteoro (Identificador),
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE Informe_Radiante 
MODIFY Identificador INT(11) NOT NULL,
ADD PRIMARY KEY (Identificador),
ADD KEY Informe_Radiante_Meteoro_FK (Meteoro_Identificador),
ADD KEY Informe_Radiante_Observatorio_FK (Observatorio_Número),
ADD CONSTRAINT Informe_Radiante_Meteoro_FK FOREIGN KEY (Meteoro_Identificador) REFERENCES Meteoro (Identificador),
ADD CONSTRAINT Informe_Radiante_Observatorio_FK FOREIGN KEY (Observatorio_Número) REFERENCES Observatorio (Número),
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE Informe_Z 
MODIFY IdInforme INT(11) NOT NULL,
ADD PRIMARY KEY (IdInforme),
ADD KEY Informe_Z_Ecuacion_parametrica_FK (Ecuacion_parametrica_IdEc),
ADD KEY Informe_Z_Meteoro_FK (Meteoro_Identificador),
ADD KEY Informe_Z_Observatorio_FK (Observatorio_Número),
ADD KEY Informe_Z_Observatorio_FKv2 (Observatorio_Número2),
ADD CONSTRAINT Informe_Z_Ecuacion_parametrica_FK FOREIGN KEY (Ecuacion_parametrica_IdEc) REFERENCES Ecuacion_parametrica (IdEc),
ADD CONSTRAINT Informe_Z_Meteoro_FK FOREIGN KEY (Meteoro_Identificador) REFERENCES Meteoro (Identificador),
ADD CONSTRAINT Informe_Z_Observatorio_FK FOREIGN KEY (Observatorio_Número) REFERENCES Observatorio (Número),
ADD CONSTRAINT Informe_Z_Observatorio_FKv2 FOREIGN KEY (Observatorio_Número2) REFERENCES Observatorio (Número),
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Modificar tablas dependientes
ALTER TABLE Lluvia_Activa_InfRad 
MODIFY Informe_Radiante_Identificador INT(11) NOT NULL,
MODIFY Lluvia_Identificador VARCHAR(20) NOT NULL,
MODIFY Lluvia_Año INT(11) NOT NULL,
ADD PRIMARY KEY (Informe_Radiante_Identificador, Lluvia_Identificador, Lluvia_Año),
ADD KEY Lluvia_Activa_InfRad_Lluvia_FK (Lluvia_Identificador, Lluvia_Año),
ADD CONSTRAINT Lluvia_Activa_InfRad_Informe_Radiante_FK FOREIGN KEY (Informe_Radiante_Identificador) REFERENCES Informe_Radiante (Identificador),
ADD CONSTRAINT Lluvia_Activa_InfRad_Lluvia_FK FOREIGN KEY (Lluvia_Identificador, Lluvia_Año) REFERENCES Lluvia (Identificador, Año),
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE Lluvia_activa 
MODIFY Lluvia_Identificador VARCHAR(20) NOT NULL,
MODIFY Informe_Z_IdInforme INT(11) NOT NULL,
ADD PRIMARY KEY (Lluvia_Identificador, Informe_Z_IdInforme),
ADD KEY Lluvia_activa_Informe_Z_FK (Informe_Z_IdInforme),
ADD KEY Lluvia_activa_Lluvia_FK (Lluvia_Identificador, Lluvia_Año),
ADD CONSTRAINT Lluvia_activa_Informe_Z_FK FOREIGN KEY (Informe_Z_IdInforme) REFERENCES Informe_Z (IdInforme),
ADD CONSTRAINT Lluvia_activa_Lluvia_FK FOREIGN KEY (Lluvia_Identificador, Lluvia_Año) REFERENCES Lluvia (Identificador, Año),
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE Puntos_ZWO 
MODIFY X DECIMAL(9,4) NOT NULL,
MODIFY Y DECIMAL(9,4) NOT NULL,
MODIFY Informe_Z_IdInforme INT(11) NOT NULL,
ADD PRIMARY KEY (X, Y, Informe_Z_IdInforme),
ADD KEY Puntos_ZWO_Informe_Z_FK (Informe_Z_IdInforme),
ADD CONSTRAINT Puntos_ZWO_Informe_Z_FK FOREIGN KEY (Informe_Z_IdInforme) REFERENCES Informe_Z (IdInforme),
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE Puntos_del_ajuste 
MODIFY t DECIMAL(6,4) NOT NULL,
MODIFY Informe_Fotometria_Identificador INT(11) NOT NULL,
ADD PRIMARY KEY (t, Informe_Fotometria_Identificador),
ADD KEY Puntos_del_ajuste_Informe_Fotometria_FK (Informe_Fotometria_Identificador),
ADD CONSTRAINT Puntos_del_ajuste_Informe_Fotometria_FK FOREIGN KEY (Informe_Fotometria_Identificador) REFERENCES Informe_Fotometria (Identificador),
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE Seccion 
MODIFY Fecha DATE NOT NULL,
MODIFY Lluvia_Identificador VARCHAR(20) NOT NULL,
MODIFY Lluvia_Año INT(11) NOT NULL,
ADD PRIMARY KEY (Fecha, Lluvia_Identificador, Lluvia_Año),
ADD KEY Seccion_Lluvia_FK (Lluvia_Identificador, Lluvia_Año),
ADD CONSTRAINT Seccion_Lluvia_FK FOREIGN KEY (Lluvia_Identificador, Lluvia_Año) REFERENCES Lluvia (Identificador, Año),
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE Trayectoria_estimada 
MODIFY Lon_Inicio VARCHAR(20) NOT NULL,
MODIFY Informe_Radiante_Identificador INT(11) NOT NULL,
ADD PRIMARY KEY (Lon_Inicio, Informe_Radiante_Identificador),
ADD KEY Trayectoria_estimada_Informe_Radiante_FK (Informe_Radiante_Identificador),
ADD CONSTRAINT Trayectoria_estimada_Informe_Radiante_FK FOREIGN KEY (Informe_Radiante_Identificador) REFERENCES Informe_Radiante (Identificador),
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE Trayectoria_medida 
MODIFY Hora VARCHAR(20) NOT NULL,
MODIFY Informe_Z_IdInforme INT(11) NOT NULL,
ADD PRIMARY KEY (Hora, Informe_Z_IdInforme),
ADD KEY Trayectoria_medida_Informe_Z_FK (Informe_Z_IdInforme),
ADD CONSTRAINT Trayectoria_medida_Informe_Z_FK FOREIGN KEY (Informe_Z_IdInforme) REFERENCES Informe_Z (IdInforme),
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE Trayectoria_por_regresion 
MODIFY t DECIMAL(8,5) NOT NULL,
MODIFY Informe_Z_IdInforme INT(11) NOT NULL,
ADD PRIMARY KEY (t, Informe_Z_IdInforme),
ADD KEY Trayectoria_por_regresion_Informe_Z_FK (Informe_Z_IdInforme),
ADD CONSTRAINT Trayectoria_por_regresion_Informe_Z_FK FOREIGN KEY (Informe_Z_IdInforme) REFERENCES Informe_Z (IdInforme),
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE Velociades_Angulares 
MODIFY hi DECIMAL(5,2) NOT NULL,
MODIFY Informe_Radiante_Identificador INT(11) NOT NULL,
ADD PRIMARY KEY (hi, Informe_Radiante_Identificador),
ADD KEY Velociades_Angulares_Informe_Radiante_FK (Informe_Radiante_Identificador),
ADD CONSTRAINT Velociades_Angulares_Informe_Radiante_FK FOREIGN KEY (Informe_Radiante_Identificador) REFERENCES Informe_Radiante (Identificador),
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE Datos_meteoro_fotometria 
MODIFY Informe_Fotometria_Identificador INT(11) NOT NULL,
ADD PRIMARY KEY (Informe_Fotometria_Identificador),
ADD CONSTRAINT Datos_meteoro_fotometria_Informe_Fotometria_FK FOREIGN KEY (Informe_Fotometria_Identificador) REFERENCES Informe_Fotometria (Identificador),
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE Elementos_Orbitales 
MODIFY Informe_Z_IdInforme INT(11) NOT NULL,
MODIFY Calculados_con VARCHAR(20) NOT NULL,
ADD PRIMARY KEY (Informe_Z_IdInforme, Calculados_con),
ADD CONSTRAINT Elementos_Orbitales_Informe_Z_FK FOREIGN KEY (Informe_Z_IdInforme) REFERENCES Informe_Z (IdInforme),
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE Estrellas_usadas_para_regresión 
MODIFY Identificador INT(11) NOT NULL,
ADD PRIMARY KEY (Identificador),
ADD KEY Estrellas_usadas_para_regresión_Informe_Fotometria_FK (Informe_Fotometria_Identificador),
ADD CONSTRAINT Estrellas_usadas_para_regresión_Informe_Fotometria_FK FOREIGN KEY (Informe_Fotometria_Identificador) REFERENCES Informe_Fotometria (Identificador),
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Crear nuevas tablas
CREATE TABLE astro_insert (
  Column1 VARCHAR(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE auditing (
  id INT(11) NOT NULL AUTO_INCREMENT,
  event_type VARCHAR(255) NOT NULL,
  user_id INT(11) NOT NULL,
  button_name VARCHAR(255) DEFAULT NULL,
  report_id INT(11) DEFAULT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP(),
  PRIMARY KEY (id)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE event_config (
  event_date DATE DEFAULT NULL,
  description VARCHAR(250) DEFAULT NULL,
  active TINYINT(1) DEFAULT NULL,
  id INT(11) NOT NULL AUTO_INCREMENT,
  startTime VARCHAR(100) DEFAULT NULL,
  endTime VARCHAR(100) DEFAULT NULL,
  isWebOpen TINYINT(1) DEFAULT 0,
  PRIMARY KEY (id)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE meteor_showers (
  LP INT(11) NOT NULL,
  IAUNo VARCHAR(10) DEFAULT NULL,
  AdNo VARCHAR(10) DEFAULT NULL,
  Code VARCHAR(10) DEFAULT NULL,
  Status INT(11) DEFAULT NULL,
  SubDate VARCHAR(20) DEFAULT NULL,
  ShowerNameDesignation VARCHAR(100) DEFAULT NULL,
  Activity VARCHAR(50) DEFAULT NULL,
  LoSb FLOAT DEFAULT NULL,
  LoSe FLOAT DEFAULT NULL,
  LoS FLOAT DEFAULT NULL,
  Ra FLOAT DEFAULT NULL,
  De FLOAT DEFAULT NULL,
  dRa FLOAT DEFAULT NULL,
  dDe FLOAT DEFAULT NULL,
  Vg FLOAT DEFAULT NULL,
  LoR FLOAT DEFAULT NULL,
  S_LoR FLOAT DEFAULT NULL,
  LaR FLOAT DEFAULT NULL,
  Theta FLOAT DEFAULT NULL,
  Phi FLOAT DEFAULT NULL,
  Flags VARCHAR(50) DEFAULT NULL,
  A FLOAT DEFAULT NULL,
  Q FLOAT DEFAULT NULL,
  E FLOAT DEFAULT NULL,
  Peri FLOAT DEFAULT NULL,
  Node FLOAT DEFAULT NULL,
  Incl FLOAT DEFAULT NULL,
  N INT(11) DEFAULT NULL,
  GroupIAU INT(11) DEFAULT NULL,
  CG INT(11) DEFAULT NULL,
  Origin VARCHAR(200) DEFAULT NULL,
  Remarks TEXT DEFAULT NULL,
  OTe VARCHAR(10) DEFAULT NULL,
  LookupTable VARCHAR(100) DEFAULT NULL,
  ReferencesInfo TEXT DEFAULT NULL,
  src VARCHAR(100) DEFAULT NULL,
  PRIMARY KEY (LP)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE Informe_Error (
  Id INT(11) NOT NULL AUTO_INCREMENT,
  Informe_Z_Id INT(11) NOT NULL,
  Tab VARCHAR(255) NOT NULL,
  Description TEXT NOT NULL,
  user_Id INT(11) DEFAULT NULL,
  status INT(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (Id),
  KEY Informe_Z_Id (Informe_Z_Id),
  KEY Informe_Error_ibfk_2 (user_Id),
  CONSTRAINT Informe_Error_ibfk_1 FOREIGN KEY (Informe_Z_Id) REFERENCES Informe_Z (IdInforme) ON DELETE CASCADE,
  CONSTRAINT Informe_Error_ibfk_2 FOREIGN KEY (user_Id) REFERENCES user (id) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;