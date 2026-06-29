"""
Endpoint que conecta el backend Python con los consumidores del front.

Expone:
- /detections para listar informes detectados en disco
- /report/<id>/SONIFICATION y aliases compatibles con AstroSMA
- /vids y /files para servir salidas de sonificacion
"""

from __future__ import annotations

import os
import re
import shutil
import subprocess
import traceback
from pathlib import Path

import mysql.connector
from dotenv import load_dotenv
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app)

ROOT_DIR = Path(__file__).resolve().parent
RUNTIME_DIR = ROOT_DIR / "runtime"
RUNTIME_PROJECT_DIR = RUNTIME_DIR / "proyecto"
RUNTIME_SONIFICATION_DIR = RUNTIME_DIR / "sonificacion"
RUNTIME_LOGS_DIR = RUNTIME_DIR / "logs"
ALLOWED_METHODS = {"simple", "midi"}
LAST_REPORT_ID: int | None = None


def env(name: str, fallback: str = "") -> str:
    value = os.getenv(name)
    return value if value is not None and value != "" else fallback


def path_exists(path: str | Path) -> bool:
    try:
        return Path(path).exists()
    except OSError:
        return False


def ensure_dir(path: str | Path) -> Path:
    target = Path(path)
    target.mkdir(parents=True, exist_ok=True)
    return target


def is_writable_dir(path: str | Path) -> bool:
    target = Path(path)
    try:
        if target.exists():
            return os.access(target, os.W_OK | os.X_OK)
        parent = target.parent if target.parent != target else target
        return parent.exists() and os.access(parent, os.W_OK | os.X_OK)
    except OSError:
        return False


def is_within_directory(path: str | Path, base: str | Path) -> bool:
    try:
        target = Path(path).expanduser().resolve(strict=False)
        root = Path(base).expanduser().resolve(strict=False)
        return target == root or target.is_relative_to(root)
    except OSError:
        return False


def get_source_root() -> Path | None:
    source_root = env("FULL_PATH", env("ruta_proyecto", "")).strip()
    return Path(source_root).expanduser() if source_root else None


def resolve_runtime_dir(configured_path: str, fallback_path: Path) -> Path:
    if configured_path:
        candidate = Path(configured_path).expanduser()
        try:
            candidate.mkdir(parents=True, exist_ok=True)
            if is_writable_dir(candidate):
                return candidate
        except OSError:
            pass

    fallback_path.mkdir(parents=True, exist_ok=True)
    return fallback_path


def resolve_runtime_file(configured_path: str, fallback_path: Path) -> Path:
    if configured_path:
        candidate = Path(configured_path).expanduser()
        try:
            candidate.parent.mkdir(parents=True, exist_ok=True)
            if is_writable_dir(candidate.parent):
                return candidate
        except OSError:
            pass

    fallback_path.parent.mkdir(parents=True, exist_ok=True)
    return fallback_path


def clear_directory_contents(directory: str | Path) -> None:
    if not str(directory):
        return

    target = Path(directory)
    if not target.exists():
        target.mkdir(parents=True, exist_ok=True)
        return

    for child in target.iterdir():
        if child.is_symlink():
            child.unlink()
        elif child.is_dir():
            shutil.rmtree(child)
        else:
            child.unlink()


def normalize_local_path(file_path: str | Path) -> str:
    normalized = str(file_path).replace("\\", "/").rstrip("/")
    if re.match(r"^[A-Za-z]:/", normalized):
        return normalized

    return Path(normalized).resolve().as_posix()


def detection_path_from_database_path(database_path: str | None) -> str | None:
    if not database_path:
        return None

    normalized = str(database_path).replace("\\", "/")
    source_root = get_source_root()
    if not source_root:
        return None

    match = re.search(r"(?:/(?:Meteoros/)?Detecciones|/Z)/(\d{4})/(.+)$", normalized)
    if not match:
        return None

    year, suffix = match.groups()
    base_name = source_root.name
    if re.fullmatch(r"\d{4}", base_name):
        candidate = source_root / suffix
    else:
        candidate = source_root / year / suffix

    if not is_within_directory(candidate, source_root):
        return None

    return candidate.resolve(strict=False).as_posix()


def parse_informe_timestamp(file_path: str | Path) -> dict[str, str] | None:
    match = re.search(r"Informe-Z-(\d{8})(\d{6})", Path(file_path).name)
    if not match:
        return None

    date_part, time_part = match.groups()
    return {
        "fecha": f"{date_part[:4]}-{date_part[4:6]}-{date_part[6:8]}",
        "hora_base": f"{time_part[:2]}:{time_part[2:4]}:{time_part[4:6]}",
        "timestamp": f"{date_part}{time_part}",
    }


def find_source_video(project_path: str | Path) -> Path | None:
    project_root = Path(project_path).resolve()
    informe_files = [
        file_path
        for file_path in project_root.rglob("Informe-Z-*")
        if file_path.suffix != ".kml"
    ]

    if not informe_files:
        return None

    parsed = parse_informe_timestamp(informe_files[0])
    if not parsed:
        return None

    timestamp = parsed["timestamp"].lower()
    trajectory_name = project_root.name.lower()
    search_roots = [project_root]
    if project_root.parent != project_root:
        search_roots.append(project_root.parent)
    if project_root.parent.parent != project_root.parent:
        search_roots.append(project_root.parent.parent)

    for root in search_roots:
        candidates = [
            candidate
            for candidate in root.rglob(f"{timestamp}*.avi")
            if candidate.is_file()
        ]
        if not candidates:
            continue

        if trajectory_name.startswith("trayectoria-"):
            trajectory_tokens = [
                token.lower()
                for token in re.split(r"[-_]", trajectory_name.removeprefix("trayectoria-"))
                if token and token.lower() not in {"trayectoria", "vm"}
            ]
            for token in trajectory_tokens:
                if len(token) < 3:
                    continue
                for candidate in candidates:
                    if token in candidate.name.lower():
                        return candidate

        return candidates[0]

    return None


def populate_runtime_project(project_path: str | Path, runtime_project_path: str | Path) -> None:
    source_project = Path(project_path)
    runtime_project = Path(runtime_project_path)
    allowed_root = get_source_root()

    if not source_project.exists():
        raise FileNotFoundError("La ruta de deteccion no existe")
    if allowed_root and not is_within_directory(source_project, allowed_root):
        raise PermissionError("La ruta de deteccion queda fuera del directorio permitido")

    ensure_dir(runtime_project)
    clear_directory_contents(runtime_project)
    shutil.copytree(source_project, runtime_project, dirs_exist_ok=True)

    source_video = find_source_video(source_project)
    if source_video is None:
        raise FileNotFoundError(f"No se ha encontrado un video .avi relacionado con el timestamp en {source_project}")

    shutil.copy2(source_video, runtime_project / source_video.name)


def read_informe_datetime(file_path: str | Path) -> dict[str, str] | None:
    try:
        with open(file_path, "r", encoding="utf-8") as handle:
            first_line = handle.readline().strip()
        fecha, hora = first_line.split("T", 1)
        if fecha and hora:
            return {"fecha": fecha, "hora": hora}
    except Exception:
        # Si el contenido no se puede leer, recurrimos al nombre del archivo.
        pass

    return parse_informe_timestamp(file_path)


def query_one(sql: str, params: tuple | list = ()) -> tuple | None:
    cursor = db.cursor()
    try:
        cursor.execute(sql, params)
        return cursor.fetchone()
    finally:
        cursor.close()


def query_all(sql: str, params: tuple | list = ()) -> list[tuple]:
    cursor = db.cursor()
    try:
        cursor.execute(sql, params)
        return cursor.fetchall()
    finally:
        cursor.close()


def get_ruta_server(id_ec: int | str) -> str | None:
    row = query_one(
        "SELECT Ruta_del_informe FROM Informe_Z WHERE IdInforme = %s",
        (id_ec,),
    )
    if not row:
        return None

    ruta = detection_path_from_database_path(row[0])
    print(f"Ruta obtenida en la BD:\n{row[0]}")
    print(f"Ruta local resuelta:\n{ruta}")
    return ruta


def resolve_report_context(id_ec: int | str) -> dict | None:
    row = query_one(
        "SELECT Fecha, Hora, Ruta_del_informe FROM Informe_Z WHERE IdInforme = %s LIMIT 1",
        (id_ec,),
    )
    if not row:
        return None

    report_path = detection_path_from_database_path(row[2])
    if not report_path:
        return None

    return {
        "reportId": int(id_ec),
        "date": row[0],
        "time": row[1],
        "ruta": report_path,
    }


def resolve_informe_id(fecha: str | None, hora: str | None, hora_base: str | None, ruta: str | Path) -> int | None:
    if not fecha:
        return None

    if hora:
        rows = query_all(
            "SELECT IdInforme, Ruta_del_informe FROM Informe_Z WHERE Fecha = %s AND Hora = %s",
            (fecha, hora),
        )
    else:
        if not hora_base:
            return None
        rows = query_all(
            "SELECT IdInforme, Ruta_del_informe FROM Informe_Z WHERE Fecha = %s AND Hora LIKE %s",
            (fecha, f"{hora_base}%"),
        )

    expected_path = normalize_local_path(ruta)

    for row in rows:
        resolved = detection_path_from_database_path(row[1])
        if not resolved:
            continue
        resolved_path = normalize_local_path(resolved)
        if resolved_path == expected_path:
            return int(row[0])

    for row in rows:
        resolved = detection_path_from_database_path(row[1])
        if not resolved:
            continue
        resolved_path = normalize_local_path(resolved)
        if Path(resolved_path).parent.as_posix() == expected_path or resolved_path == Path(expected_path).parent.as_posix():
            return int(row[0])

    if rows:
        return int(rows[0][0])

    return None


def find_files(base_dir: str | Path, predicate, limit: int = 500) -> list[str]:
    base_path = Path(base_dir)
    if not base_path.exists():
        return []

    found: list[str] = []
    for current, _dirs, files in os.walk(base_path):
        for name in files:
            full_name = Path(current, name).as_posix()
            if predicate(full_name, name):
                found.append(full_name)
                if len(found) >= limit:
                    return sorted(found)

    return sorted(found)


def list_detections() -> list[dict]:
    base_dir = env("FULL_PATH", env("ruta_proyecto", ""))
    if not base_dir:
        return []

    base_dir_path = Path(base_dir)
    detections = []
    informe_files = find_files(
        base_dir,
        lambda _full_name, name: name.startswith("Informe-Z-") and not name.endswith(".kml"),
        int(env("DETECTIONS_LIMIT", "300")),
    )

    for informe_path in informe_files:
        parsed_from_name = parse_informe_timestamp(informe_path)
        parsed = read_informe_datetime(informe_path)
        fecha = (parsed or {}).get("fecha") or (parsed_from_name or {}).get("fecha") or ""
        hora = (parsed or {}).get("hora") or (parsed_from_name or {}).get("hora_base") or ""
        hora_base = (parsed_from_name or {}).get("hora_base") or hora.split(".")[0]
        ruta = str(Path(informe_path).parent)
        id_informe = resolve_informe_id(fecha, hora, hora_base, ruta)
        try:
            ruta_relativa = Path(ruta).relative_to(base_dir_path).as_posix()
        except ValueError:
            ruta_relativa = ruta

        detections.append(
            {
                "id_z": id_informe,
                "fecha": fecha,
                "hora": hora,
                "ruta": ruta,
                "ruta_relativa": ruta_relativa,
                "informe": Path(informe_path).name,
                "disponible": bool(id_informe),
            }
        )

    detections.sort(key=lambda item: (f"{item['fecha']} {item['hora']}", item["ruta_relativa"]), reverse=True)
    return detections


def build_assets(report_id: int | str) -> list[dict]:
    report_id = int(report_id)
    simple_mp4 = f"sonificacion-simple-ID-{report_id}.mp4"
    midi_mp4 = f"sonificacion-midi-ID-{report_id}.mp4"
    simple_wav = f"sonido-simple-ID-{report_id}.wav"
    midi_wav = f"sonido-midi-ID-{report_id}.wav"
    midi_mid = f"sonido-midi-ID-{report_id}.mid"

    return [
        {
            "key": "simple_mp4",
            "filename": simple_mp4,
            "downloadPath": f"/files/sonif/{simple_mp4}",
            "streamPath": f"/vids/{simple_mp4}",
        },
        {
            "key": "midi_mp4",
            "filename": midi_mp4,
            "downloadPath": f"/files/sonif/{midi_mp4}",
            "streamPath": f"/vids/{midi_mp4}",
        },
        {
            "key": "simple_wav",
            "filename": simple_wav,
            "downloadPath": f"/files/sonif/{simple_wav}",
            "streamPath": None,
        },
        {
            "key": "midi_wav",
            "filename": midi_wav,
            "downloadPath": f"/files/sonif/{midi_wav}",
            "streamPath": None,
        },
        {
            "key": "midi_file",
            "filename": midi_mid,
            "downloadPath": f"/files/sonif/{midi_mid}",
            "streamPath": None,
        },
        {
            "key": "source_video",
            "filename": "deteccion-trayectoria.mp4",
            "downloadPath": f"/reportz/{report_id}/sonification/source/deteccion-trayectoria.mp4",
            "streamPath": None,
        },
    ]


def build_video_filename(report_id: int | str, method: str) -> str:
    report_id = int(report_id)
    return f"sonificacion-midi-ID-{report_id}.mp4" if method == "midi" else f"sonificacion-simple-ID-{report_id}.mp4"


def run_python_sonification(project_path: str | Path, report_id: int | str) -> None:
    ensure_dir(config["sonificationPath"])
    main_script = ROOT_DIR / "main.py"

    env_vars = {
        **os.environ,
        "DB_HOST": config["db"]["host"],
        "DB_USER": config["db"]["user"],
        "DB_PASSWORD": config["db"]["password"],
        "DB_NAME": config["db"]["database"],
        "ID_INFORME": str(report_id),
        "ruta_proyecto": str(project_path),
        "ruta_sonificacion": config["sonificationPath"],
        "log_aplicacion": config["appLog"],
        "log_errores": config["errorLog"],
        "voz_1": env("voz_1", "50"),
        "voz_2": env("voz_2", "75"),
        "voz_fragmentacion": env("voz_fragmentacion", "127"),
        "voz_fondo": env("voz_fondo", "80"),
    }

    subprocess.run(
        [config["python"], str(main_script)],
        cwd=str(ROOT_DIR),
        env=env_vars,
        check=True,
    )


def ensure_sonification_outputs(report_id: int | str, project_path: str | Path) -> list[dict]:
    assets = build_assets(report_id)
    expected_files = [
        asset["filename"]
        for asset in assets
        if asset["streamPath"] or asset["filename"].endswith(".wav") or asset["filename"].endswith(".mid")
    ]

    missing = [filename for filename in expected_files if not path_exists(Path(config["sonificationPath"], filename))]
    if missing:
        populate_runtime_project(project_path, config["rutaProyecto"])
        run_python_sonification(config["rutaProyecto"], report_id)

    return assets


def normalize_method(method: str) -> str:
    method = (method or "").strip().lower()
    if method not in ALLOWED_METHODS:
        raise ValueError("Metodo de sonificacion invalido")
    return method


try:
    db = mysql.connector.connect(
        host=env("DB_HOST"),
        user=env("DB_USER"),
        password=env("DB_PASSWORD"),
        database=env("DB_NAME"),
    )
except Exception as exc:  # pragma: no cover - startup failure is intentional
    raise RuntimeError(f"No se pudo conectar a la base de datos: {exc}") from exc


config = {
    "port": int(env("PORT", "5000")),
    "db": {
        "host": env("DB_HOST"),
        "user": env("DB_USER"),
        "password": env("DB_PASSWORD"),
        "database": env("DB_NAME"),
    },
    "rutaProyecto": str(resolve_runtime_dir(env("ruta_proyecto", ""), RUNTIME_PROJECT_DIR)),
    "sonificationPath": str(resolve_runtime_dir(env("ruta_sonificacion", ""), RUNTIME_SONIFICATION_DIR)),
    "appLog": str(resolve_runtime_file(env("log_aplicacion", ""), RUNTIME_LOGS_DIR / "app-tfg.log")),
    "errorLog": str(resolve_runtime_file(env("log_errores", ""), RUNTIME_LOGS_DIR / "err-tfg.log")),
    "python": env("PYTHON", str(ROOT_DIR / ".venv" / "bin" / "python")),
}


def registrar_excepcion(ruta_err: str) -> None:
    with open(ruta_err, "a", encoding="utf-8") as handle:
        handle.write(traceback.format_exc())


@app.get("/health")
def health():
    return jsonify({"ok": True, "db": config["db"]["database"], "fullPath": env("FULL_PATH", "")})


@app.get("/detections")
def detections():
    try:
        data = list_detections()
        return jsonify({"basePath": env("FULL_PATH", env("ruta_proyecto", "")), "count": len(data), "data": data})
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


def _report_overview_response(id_ec: str):
    try:
        report_id = int(id_ec)
    except ValueError:
        return jsonify({"message": "ID de informe invalido"}), 400

    context = resolve_report_context(report_id)
    if not context:
        return jsonify({"message": "Informe no encontrado"}), 404

    return jsonify(
        {
            **context,
            "fecha": context["date"],
            "hora": context["time"],
            "assets": build_assets(report_id),
        }
    )


@app.get("/report/<id_ec>/SONIFICATION/")
@app.get("/reportz/<id_ec>/sonification")
def get_datos(id_ec):
    return _report_overview_response(id_ec)


@app.get("/report/<id_ec>/SONIFICATION/<metodo>")
@app.get("/reportz/<id_ec>/sonification/<metodo>")
def get_archivos(id_ec, metodo):
    global LAST_REPORT_ID

    try:
        report_id = int(id_ec)
    except ValueError:
        return jsonify({"message": "ID de informe invalido"}), 400

    try:
        method = normalize_method(metodo)
        ruta_pry_server = get_ruta_server(report_id)
        if not ruta_pry_server:
            return jsonify({"message": "Ruta del informe no encontrada"}), 404

        if not path_exists(ruta_pry_server):
            return jsonify({"message": "La ruta de deteccion no existe", "ruta": ruta_pry_server}), 404

        ensure_dir(config["sonificationPath"])
        if LAST_REPORT_ID != report_id:
            clear_directory_contents(config["sonificationPath"])
            LAST_REPORT_ID = report_id
        populate_runtime_project(ruta_pry_server, config["rutaProyecto"])

        video_filename = build_video_filename(report_id, method)
        video_path = Path(config["sonificationPath"], video_filename)
        print(f"Obteniendo archivo: {video_path}")
        if not path_exists(video_path):
            print("Regenerando archivo...")
            run_python_sonification(config["rutaProyecto"], report_id)

        context = resolve_report_context(report_id) or {
            "reportId": report_id,
            "date": None,
            "time": None,
            "ruta": ruta_pry_server,
        }

        return jsonify(
            {
                **context,
                "fecha": context.get("date"),
                "hora": context.get("time"),
                "method": method,
                "vid": f"/vids/{video_filename}",
                "videoFilename": video_filename,
                "assets": build_assets(report_id),
            }
        )
    except ValueError as exc:
        return jsonify({"message": str(exc)}), 400
    except subprocess.CalledProcessError as exc:
        return jsonify({"message": "No se pudo generar la sonificacion", "details": str(exc)}), 500
    except FileNotFoundError as exc:
        return jsonify({"message": str(exc), "ruta": getattr(exc, "filename", None)}), getattr(exc, "status_code", 404)
    except Exception as exc:
        registrar_excepcion(config["errorLog"])
        return jsonify({"message": str(exc)}), 500


@app.get("/reportz/<id_ec>/sonification/source/<filename>")
@app.get("/report/<id_ec>/SONIFICATION/source/<filename>")
def download_source_file(id_ec, filename):
    if filename != "deteccion-trayectoria.mp4":
        return jsonify({"message": "Archivo no encontrado"}), 404

    ruta = Path(config["rutaProyecto"], filename)
    if not path_exists(ruta):
        return jsonify({"message": "Archivo no encontrado"}), 404

    return send_from_directory(str(config["rutaProyecto"]), filename, as_attachment=True)


@app.get("/vids/<filename>")
@app.get("/sonification/vids/<filename>")
def serve_video(filename):
    try:
        return send_from_directory(str(config["sonificationPath"]), filename)
    except Exception as exc:
        return jsonify({"message": str(exc)}), 400


@app.get("/files/<route>/<filename>")
def serve_file(route, filename):
    if route == "app" and filename == "app-log":
        return send_from_directory(str(Path(config["appLog"]).parent), Path(config["appLog"]).name, as_attachment=False)

    if route == "app" and filename == "error-log":
        return send_from_directory(str(Path(config["errorLog"]).parent), Path(config["errorLog"]).name, as_attachment=False)

    if route == "pry":
        if not path_exists(Path(config["rutaProyecto"], filename)):
            return jsonify({"message": "Archivo no encontrado"}), 404
        return send_from_directory(str(config["rutaProyecto"]), filename, as_attachment=True)

    if route == "sonif":
        if not path_exists(Path(config["sonificationPath"], filename)):
            return jsonify({"message": "Archivo no encontrado"}), 404
        return send_from_directory(str(config["sonificationPath"]), filename, as_attachment=True)

    return jsonify({"message": "Archivo no encontrado"}), 404


if __name__ == "__main__":
    ensure_dir(config["rutaProyecto"])
    ensure_dir(config["sonificationPath"])
    ensure_dir(Path(config["appLog"]).parent)
    ensure_dir(Path(config["errorLog"]).parent)
    app.run(host="0.0.0.0", port=config["port"])
