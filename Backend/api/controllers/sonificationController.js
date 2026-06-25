require('dotenv').config();

const http = require('node:http');
const https = require('node:https');
const path = require('node:path');
const { pipeline } = require('node:stream/promises');

const serviceBaseUrl = (
  process.env.SONIFICATION_SERVICE_URL
  || process.env.SONIFICATION_PYTHON_URL
  || 'http://127.0.0.1:5000'
).replace(/\/$/, '');
const requestTimeoutMs = Number(process.env.SONIFICATION_PYTHON_TIMEOUT_MS || 600000) || 600000;
const ALLOWED_METHODS = new Set(['simple', 'midi']);

function buildPythonUrl(resourcePath) {
  return new URL(resourcePath, `${serviceBaseUrl}/`);
}

function filterHopByHopHeaders(headers) {
  const ignoredHeaders = new Set([
    'connection',
    'keep-alive',
    'proxy-authenticate',
    'proxy-authorization',
    'te',
    'trailer',
    'transfer-encoding',
    'upgrade',
  ]);

  return Object.entries(headers).reduce((acc, [key, value]) => {
    if (!ignoredHeaders.has(key.toLowerCase())) {
      acc[key] = value;
    }
    return acc;
  }, {});
}

function rewritePathValue(value) {
  if (typeof value !== 'string' || !value) {
    return value;
  }

  if (value.startsWith('/sonification/')) {
    return value;
  }

  if (value.startsWith('/vids/')) {
    return `/sonification${value}`;
  }

  return value;
}

function rewriteSonificationPayload(payload) {
  if (Array.isArray(payload)) {
    return payload.map((item) => rewriteSonificationPayload(item));
  }

  if (!payload || typeof payload !== 'object') {
    return payload;
  }

  return Object.entries(payload).reduce((acc, [key, value]) => {
    if (key === 'vid' || key === 'streamPath') {
      acc[key] = rewritePathValue(value);
      return acc;
    }

    acc[key] = rewriteSonificationPayload(value);
    return acc;
  }, {});
}

function proxyJson(resourcePath) {
  return new Promise((resolve, reject) => {
    const target = buildPythonUrl(resourcePath);
    const client = target.protocol === 'https:' ? https : http;

    const request = client.request(
      target,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      },
      (response) => {
        let raw = '';

        response.setEncoding('utf8');
        response.on('data', (chunk) => {
          raw += chunk;
        });
        response.on('end', () => {
          let body = null;

          if (raw) {
            try {
              body = JSON.parse(raw);
            } catch {
              body = { message: raw };
            }
          }

          resolve({
            statusCode: response.statusCode || 502,
            body,
          });
        });
      },
    );

    request.setTimeout(requestTimeoutMs, () => {
      request.destroy(new Error(`Timeout al contactar con el servidor Python tras ${requestTimeoutMs} ms`));
    });
    request.on('error', reject);
    request.end();
  });
}

function proxyStream(resourcePath, res) {
  return new Promise((resolve, reject) => {
    const target = buildPythonUrl(resourcePath);
    const client = target.protocol === 'https:' ? https : http;

    const request = client.request(
      target,
      {
        method: 'GET',
        headers: {
          Accept: '*/*',
        },
      },
      async (response) => {
        try {
          res.status(response.statusCode || 502);

          const headers = filterHopByHopHeaders(response.headers);
          for (const [key, value] of Object.entries(headers)) {
            if (typeof value !== 'undefined') {
              res.setHeader(key, value);
            }
          }

          await pipeline(response, res);
          resolve();
        } catch (error) {
          reject(error);
        }
      },
    );

    request.setTimeout(requestTimeoutMs, () => {
      request.destroy(new Error(`Timeout al contactar con el servidor Python tras ${requestTimeoutMs} ms`));
    });
    request.on('error', reject);
    request.end();
  });
}

async function forwardJson(res, resourcePath) {
  try {
    const { statusCode, body } = await proxyJson(resourcePath);
    const payload = rewriteSonificationPayload(body);
    return res.status(statusCode).json(payload);
  } catch (error) {
    console.error('Error al reenviar la respuesta de sonificación:', error);
    return res.status(502).json({
      message: 'No se pudo conectar con el servicio de sonificación',
      details: error.message,
    });
  }
}

async function forwardStream(res, resourcePath) {
  try {
    await proxyStream(resourcePath, res);
    return undefined;
  } catch (error) {
    console.error('Error al reenviar un recurso binario de sonificación:', error);
    if (res.headersSent) {
      return undefined;
    }

    return res.status(502).json({
      message: 'No se pudo conectar con el servicio de sonificación',
      details: error.message,
    });
  }
}

async function getSonificationOverview(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ message: 'ID de informe invalido' });
  }

  return forwardJson(res, `/reportz/${id}/sonification`);
}

async function getSonificationMethod(req, res) {
  const id = Number(req.params.id);
  const method = String(req.params.metodo || '').trim().toLowerCase();

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ message: 'ID de informe invalido' });
  }

  if (!ALLOWED_METHODS.has(method)) {
    return res.status(400).json({ message: 'Metodo de sonificacion invalido' });
  }

  return forwardJson(res, `/reportz/${id}/sonification/${method}`);
}

async function downloadSourceFile(req, res) {
  const id = Number(req.params.id);
  const filename = path.basename(String(req.params.filename || ''));

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ message: 'ID de informe invalido' });
  }

  if (filename !== 'deteccion-trayectoria.mp4') {
    return res.status(400).json({ message: 'Archivo no permitido' });
  }

  return forwardStream(res, `/reportz/${id}/sonification/source/${encodeURIComponent(filename)}`);
}

async function serveVideo(req, res) {
  const filename = path.basename(String(req.params.filename || ''));

  if (!filename) {
    return res.status(400).json({ message: 'Video no encontrado' });
  }

  return forwardStream(res, `/vids/${encodeURIComponent(filename)}`);
}

async function serveGeneratedFile(req, res) {
  const filename = path.basename(String(req.params.filename || ''));

  if (!filename) {
    return res.status(400).json({ message: 'Archivo no encontrado' });
  }

  return forwardStream(res, `/files/sonif/${encodeURIComponent(filename)}`);
}

module.exports = {
  getSonificationOverview,
  getSonificationMethod,
  downloadSourceFile,
  serveVideo,
  serveGeneratedFile,
};
