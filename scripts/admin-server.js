/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║   MUSIDACTICA — Panel de Administración Local           ║
 * ║   Servidor Node.js sin dependencias externas            ║
 * ║   Uso: npm run admin                                    ║
 * ╚══════════════════════════════════════════════════════════╝
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const CANCIONES_PATH = path.join(ROOT, 'src', 'cancionero', 'data', 'canciones.js');
const UI_PATH = path.join(__dirname, 'admin-ui.html');
const PORT = 3131;

// ── Prevenir caídas del proceso por errores no capturados ──
process.on('uncaughtException', (err) => {
  console.error('\n[ERROR no capturado]', err.message);
  console.error(err.stack);
  // NO terminamos el proceso: el servidor sigue vivo
});

process.on('unhandledRejection', (reason) => {
  console.error('\n[Promise sin capturar]', reason);
});

// ═══════════════════════════════════════════════════════════
// HELPERS — Extracción de IDs desde URLs de streaming
// ═══════════════════════════════════════════════════════════

function extractSpotifyId(url) {
  const match = url.match(/\/track\/([A-Za-z0-9]+)/);
  return match ? match[1] : null;
}

function extractYoutubeId(url) {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return match ? match[1] : null;
}

function detectStreamingType(url) {
  if (url.includes('spotify.com'))                      return 'spotify';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  return 'unknown';
}

// ═══════════════════════════════════════════════════════════
// HELPERS — Lectura del archivo canciones.js
// ═══════════════════════════════════════════════════════════

function readFile() {
  return fs.readFileSync(CANCIONES_PATH, 'utf-8');
}

function getExistingIds(content) {
  return [...content.matchAll(/id:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
}

function generateNewId(categoria, existingIds) {
  const prefixMap = { infantil: 'inf', folclore: 'fol', rock: 'rock', patria: 'pat' };
  const prefix = prefixMap[categoria] || 'gen';
  const nums = existingIds
    .filter(id => id.startsWith(prefix + '-'))
    .map(id => parseInt(id.split('-')[1], 10))
    .filter(n => !isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `${prefix}-${String(next).padStart(3, '0')}`;
}

// ═══════════════════════════════════════════════════════════
// HELPERS — Construcción de la entrada de canción
// ═══════════════════════════════════════════════════════════

function buildCancionEntry(data, newId) {
  const streamingType = detectStreamingType(data.streamingUrl || '');
  const spotifyId = streamingType === 'spotify' ? extractSpotifyId(data.streamingUrl) : null;
  const youtubeId = streamingType === 'youtube' ? extractYoutubeId(data.streamingUrl) : null;

  // Helper para escapar comillas simples dentro de strings JS
  const esc = (s) => (s || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");

  const lines = [`  {`, `    id: '${newId}',`];

  lines.push(`    titulo: '${esc(data.titulo)}',`);
  lines.push(`    artista: '${esc(data.artista)}',`);
  lines.push(`    categoria: '${esc(data.categoria)}',`);

  if (spotifyId) lines.push(`    spotifyId: '${spotifyId}',`);
  if (youtubeId) lines.push(`    youtubeId: '${youtubeId}',`);

  lines.push(`    resena: '${esc(data.resena)}',`);

  if (data.pdfLetra)     lines.push(`    pdfLetra: '${esc(data.pdfLetra)}',`);
  if (data.pdfActividad) lines.push(`    pdfActividad: '${esc(data.pdfActividad)}',`);
  if (data.audioMp3)     lines.push(`    audioMp3: '${esc(data.audioMp3)}',`);

  lines.push(`  },`);
  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════
// HELPERS — Escritura en canciones.js
//   Estrategia simple: insertar justo antes del cierre `];`
//   Dentro de la sección correcta si el comentario existe.
// ═══════════════════════════════════════════════════════════

function injectCancion(newEntry, categoria) {
  const content = readFile();

  const sectionComments = {
    infantil: '// --- INFANTIL / GENERAL ---',
    folclore: '// --- FOLCLORE NACIONAL ---',
    rock:     '// --- ROCK NACIONAL ---',
    patria:   '// --- CANCIONES PATRIAS ---',
  };

  const sectionKeys = Object.keys(sectionComments);
  const thisSectionComment = sectionComments[categoria];
  const thisSectionIdx = content.indexOf(thisSectionComment);

  let insertionPoint;

  if (thisSectionIdx === -1) {
    // No encontró el comentario de sección → insertar antes del cierre del array
    insertionPoint = content.lastIndexOf('];');
  } else {
    // Buscar cuál es la siguiente sección (o el fin del array)
    let nextIdx = Infinity;
    for (const key of sectionKeys) {
      if (key === categoria) continue;
      const idx = content.indexOf(sectionComments[key], thisSectionIdx + 1);
      if (idx !== -1 && idx < nextIdx) nextIdx = idx;
    }

    if (nextIdx === Infinity) {
      // Es la última sección → insertar antes del cierre `];`
      insertionPoint = content.lastIndexOf('];');
    } else {
      // Insertar justo antes de la siguiente sección
      // Retroceder hasta el inicio de esa línea
      const lineStart = content.lastIndexOf('\n', nextIdx - 1);
      insertionPoint = lineStart !== -1 ? lineStart + 1 : nextIdx;
    }
  }

  if (insertionPoint === -1) {
    throw new Error('No se encontró el punto de inserción en canciones.js. ¿El archivo tiene el formato correcto?');
  }

  const newContent =
    content.slice(0, insertionPoint) +
    newEntry + '\n\n' +
    content.slice(insertionPoint);

  // Escribir a disco (sobrescribir)
  fs.writeFileSync(CANCIONES_PATH, newContent, 'utf-8');
  console.log(`  ✅ Canción inyectada. Punto de inserción: ${insertionPoint}`);
}

// ═══════════════════════════════════════════════════════════
// HELPERS — Listado de canciones actuales (parseo simple)
// ═══════════════════════════════════════════════════════════

function listCanciones() {
  const content = readFile();
  const songs = [];

  // Dividir por bloques que empiecen con `  {` y terminen con `  },`
  const lines = content.split('\n');
  let inBlock = false;
  let block = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '{') { inBlock = true; block = []; continue; }
    if (inBlock) {
      if (trimmed === '},' || trimmed === '}') {
        // Parsear el bloque
        const obj = {};
        for (const bLine of block) {
          const m = bLine.match(/^\s*(\w+):\s*'([^']*)'/);
          if (m) obj[m[1]] = m[2];
        }
        if (obj.id) songs.push(obj);
        inBlock = false;
        block = [];
      } else {
        block.push(line);
      }
    }
  }

  return songs;
}

// ═══════════════════════════════════════════════════════════
// HELPERS — Eliminar canción por ID
// ═══════════════════════════════════════════════════════════

function deleteSong(songId) {
  const content = readFile();
  const lines = content.split('\n');
  const result = [];
  let skip = false;
  let depth = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!skip && trimmed === '{') {
      // Chequear si este bloque contiene nuestro ID mirando líneas siguientes
      let j = i + 1;
      let found = false;
      while (j < lines.length && lines[j].trim() !== ',' && lines[j].trim() !== '},') {
        if (lines[j].includes(`id: '${songId}'`) || lines[j].includes(`id: "${songId}"`)) {
          found = true;
          break;
        }
        j++;
      }
      if (found) {
        skip = true;
        depth = 1;
        continue;
      }
    }

    if (skip) {
      if (trimmed === '{') depth++;
      if (trimmed === '},' || trimmed === '}') {
        depth--;
        if (depth <= 0) {
          skip = false;
          // También saltar la línea en blanco siguiente si existe
          if (i + 1 < lines.length && lines[i + 1].trim() === '') i++;
        }
      }
      continue;
    }

    result.push(line);
  }

  fs.writeFileSync(CANCIONES_PATH, result.join('\n'), 'utf-8');
  console.log(`  🗑  Canción ${songId} eliminada.`);
}

// ═══════════════════════════════════════════════════════════
// SERVIDOR HTTP
// ═══════════════════════════════════════════════════════════

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch (e) { reject(new Error('JSON inválido: ' + e.message)); }
    });
    req.on('error', reject);
  });
}

function sendJSON(res, status, data) {
  const json = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(json),
  });
  res.end(json);
}

const server = http.createServer(async (req, res) => {
  // Headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  console.log(`  → ${req.method} ${url.pathname}`);

  // ── GET / → Sirve la UI ──
  if (req.method === 'GET' && url.pathname === '/') {
    try {
      const html = fs.readFileSync(UI_PATH, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    } catch (e) {
      res.writeHead(500);
      res.end('Error: no se encontró admin-ui.html — ' + e.message);
    }
    return;
  }

  // ── GET /api/health → Chequeo de conexión ──
  if (req.method === 'GET' && url.pathname === '/api/health') {
    sendJSON(res, 200, { ok: true, cancionesPath: CANCIONES_PATH });
    return;
  }

  // ── GET /api/canciones → Lista canciones ──
  if (req.method === 'GET' && url.pathname === '/api/canciones') {
    try {
      const songs = listCanciones();
      sendJSON(res, 200, { success: true, canciones: songs });
    } catch (e) {
      console.error('  [ERROR listCanciones]', e.message);
      sendJSON(res, 500, { success: false, error: e.message });
    }
    return;
  }

  // ── POST /api/canciones → Agrega canción ──
  if (req.method === 'POST' && url.pathname === '/api/canciones') {
    try {
      const data = await parseBody(req);
      console.log('  [POST] datos recibidos:', JSON.stringify(data).slice(0, 120));

      const required = ['titulo', 'artista', 'categoria', 'streamingUrl', 'resena'];
      const missing = required.filter(k => !data[k] || !String(data[k]).trim());
      if (missing.length > 0) {
        sendJSON(res, 400, { success: false, error: `Campos requeridos faltantes: ${missing.join(', ')}` });
        return;
      }

      const content = readFile();
      const ids = getExistingIds(content);
      const newId = generateNewId(data.categoria, ids);
      const entry = buildCancionEntry(data, newId);

      console.log('  [POST] nuevo ID:', newId);
      console.log('  [POST] entry generada:\n', entry);

      injectCancion(entry, data.categoria);

      sendJSON(res, 200, {
        success: true,
        id: newId,
        message: `"${data.titulo}" agregada correctamente con ID ${newId}.`,
      });
    } catch (e) {
      console.error('  [ERROR POST]', e.message, '\n', e.stack);
      sendJSON(res, 500, { success: false, error: e.message });
    }
    return;
  }

  // ── DELETE /api/canciones/:id ──
  if (req.method === 'DELETE' && url.pathname.startsWith('/api/canciones/')) {
    try {
      const songId = decodeURIComponent(url.pathname.split('/').pop());
      deleteSong(songId);
      sendJSON(res, 200, { success: true, message: `Canción ${songId} eliminada.` });
    } catch (e) {
      console.error('  [ERROR DELETE]', e.message);
      sendJSON(res, 500, { success: false, error: e.message });
    }
    return;
  }

  res.writeHead(404);
  res.end('Ruta no encontrada');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n  ❌ El puerto ${PORT} ya está en uso.`);
    console.error(`  Cerrá la otra terminal con el admin corriendo y volvé a intentar.\n`);
    process.exit(1);
  } else {
    console.error('  [ERROR de servidor]', err);
  }
});

server.listen(PORT, () => {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║   🎵 Musidactica — Panel de Administración Local    ║');
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log(`║   🌐  http://localhost:${PORT}                         ║`);
  console.log('║   🛑  Ctrl+C para detener el servidor               ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log(`\n   canciones.js → ${CANCIONES_PATH}\n`);

  // Abrir el navegador automáticamente en Windows
  import('child_process')
    .then(({ exec }) => exec(`start http://localhost:${PORT}`))
    .catch(() => {});
});
