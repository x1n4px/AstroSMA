import mysql.connector

# Configuración de conexión a MariaDB
config = {
    "host": "localhost",
    "user": "in4p",
    "password": "0000",
    "database": "astro"
}

# Nombre del archivo de texto
file_path = "streamfulldata2022.txt"

# Conectar a MariaDB
conn = mysql.connector.connect(**config)
cursor = conn.cursor()

# Crear la tabla con columnas ajustadas para los datos
cursor.execute('''
    CREATE TABLE IF NOT EXISTS meteor_showers (
        LP INT PRIMARY KEY,
        IAUNo VARCHAR(10),
        AdNo VARCHAR(10),
        Code VARCHAR(10),
        Status INT,
        SubDate VARCHAR(20),
        ShowerDesignation VARCHAR(50),
        ShowerName VARCHAR(100),
        Activity VARCHAR(50),
        LoSb FLOAT,
        LoSe FLOAT,
        LoS FLOAT,
        Ra FLOAT,
        De FLOAT,
        dRa FLOAT,
        dDe FLOAT,
        Vg FLOAT,
        LoR FLOAT,
        S_LoR FLOAT,
        LaR FLOAT,
        Theta FLOAT,
        Phi FLOAT,
        Flags VARCHAR(50),
        A FLOAT,
        Q FLOAT,
        E FLOAT,
        Peri FLOAT,
        Node FLOAT,
        Incl FLOAT,
        N INT,
        GroupIAU INT,
        CG INT,
        Origin VARCHAR(200),  # Increased size for comet names
        Remarks TEXT,
        OTe VARCHAR(10),     # Kept at 10 but will truncate data
        LookupTable VARCHAR(100),
        ReferencesInfo TEXT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
''')

# Funciones de conversión mejoradas
def parse_float(value):
    value = str(value).strip()
    if value == "":
        return None
    try:
        return float(value)
    except ValueError:
        # Handle special cases like 'A', 'R', etc.
        if value in ['A', 'R']:
            return 0.0  # Default value for special flags
        return None

def parse_int(value):
    value = str(value).strip()
    if value == "":
        return None
    try:
        return int(value)
    except ValueError:
        # Skip conversion for fields that contain comet names
        return None

def truncate_string(value, max_length):
    if value is None:
        return None
    return value[:max_length]

# Leer el archivo y extraer los datos
with open(file_path, "r", encoding="utf-8") as file:
    lines = file.readlines()
    
    for line_num, line in enumerate(lines, 1):
        if line.startswith(":") or line.startswith("+"):
            continue  # Saltar comentarios y encabezados
        
        if "|" in line:
            fields = [field.strip().strip('"') for field in line.split("|")]
            
            # Ensure we have exactly 37 fields (0-36)
            if len(fields) < 37:
                fields += [""] * (37 - len(fields))
            
            try:
                processed_fields = [
                    parse_int(fields[0]),    # LP
                    truncate_string(fields[1], 10),  # IAUNo
                    truncate_string(fields[2], 10),  # AdNo
                    truncate_string(fields[3], 10),  # Code
                    parse_int(fields[4]),    # Status
                    truncate_string(fields[5], 20),  # SubDate
                    truncate_string(fields[6], 50),  # ShowerDesignation
                    truncate_string(fields[7], 100), # ShowerName
                    truncate_string(fields[8], 50),  # Activity
                    parse_float(fields[9]),  # LoSb
                    parse_float(fields[10]), # LoSe
                    parse_float(fields[11]), # LoS
                    parse_float(fields[12]), # Ra
                    parse_float(fields[13]), # De
                    parse_float(fields[14]), # dRa
                    parse_float(fields[15]), # dDe
                    parse_float(fields[16]), # Vg
                    parse_float(fields[17]), # LoR
                    parse_float(fields[18]), # S_LoR
                    parse_float(fields[19]), # LaR
                    parse_float(fields[20]), # Theta
                    parse_float(fields[21]), # Phi
                    truncate_string(fields[22], 50), # Flags
                    parse_float(fields[23]), # A
                    parse_float(fields[24]), # Q
                    parse_float(fields[25]), # E
                    parse_float(fields[26]), # Peri
                    parse_float(fields[27]), # Node
                    parse_float(fields[28]), # Incl
                    parse_int(fields[29]),   # N
                    parse_int(fields[30]),   # GroupIAU
                    parse_int(fields[31]),   # CG
                    truncate_string(fields[32], 200), # Origin
                    fields[33],              # Remarks
                    truncate_string(fields[34], 10),  # OTe (truncated to 10 chars)
                    truncate_string(fields[35], 100), # LookupTable
                    fields[36]               # References
                ]
                
                cursor.execute('''
                    INSERT INTO meteor_showers (
                        LP, IAUNo, AdNo, Code, Status, SubDate, ShowerDesignation, ShowerName, 
                        Activity, LoSb, LoSe, LoS, Ra, De, dRa, dDe, Vg, LoR, S_LoR, LaR, Theta, Phi, 
                        Flags, A, Q, E, Peri, Node, Incl, N, GroupIAU, CG, Origin, Remarks, OTe, LookupTable, ReferencesInfo
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ''', processed_fields)
            except Exception as e:
                print(f"Error processing line {line_num}: {str(e)[:200]}")
                print(f"Line content: {line[:200]}...")  # Print first 200 chars of line
                continue

# Guardar cambios y cerrar conexión
conn.commit()
cursor.close()
conn.close()

print("Datos insertados correctamente en la base de datos MariaDB.")