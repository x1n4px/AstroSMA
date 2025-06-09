CREATE TABLE Radiant (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alpha FLOAT NOT NULL,
  delta FLOAT NOT NULL,
  date DATE NOT NULL,
  Identificador VARCHAR(50) NOT NULL,
  Año INT NOT NULL,
  CONSTRAINT fk_radiant_lluvia FOREIGN KEY (Identificador, Año)
    REFERENCES Lluvia (Identificador, Año)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);
