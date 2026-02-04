const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const SONGS_FILE = path.join(DATA_DIR, 'songs.json');
const NOW_PLAYING_FILE = path.join(DATA_DIR, 'now-playing.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

const ensureDataFiles = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(SONGS_FILE)) {
    fs.writeFileSync(SONGS_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(NOW_PLAYING_FILE)) {
    fs.writeFileSync(NOW_PLAYING_FILE, JSON.stringify({ songId: null }, null, 2));
  }
};

const readJson = (filePath, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    return fallback;
  }
};

const writeJson = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

const getSongs = () => readJson(SONGS_FILE, []);
const saveSongs = (songs) => writeJson(SONGS_FILE, songs);

const getNowPlaying = () => readJson(NOW_PLAYING_FILE, { songId: null });
const saveNowPlaying = (nowPlaying) => writeJson(NOW_PLAYING_FILE, nowPlaying);

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
};

const sendText = (res, statusCode, payload) => {
  res.writeHead(statusCode, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(payload);
};

const readBody = (req) => new Promise((resolve, reject) => {
  let data = '';
  req.on('data', (chunk) => {
    data += chunk;
  });
  req.on('end', () => resolve(data));
  req.on('error', reject);
});

const parseSongLines = (content) => {
  const lines = content.split(/\r?\n/);
  return lines.map((line, index) => ({
    id: index,
    type: index % 2 === 0 ? 'chords' : 'lyrics',
    text: line,
  }));
};

const handleApi = async (req, res, url) => {
  if (req.method === 'GET' && url.pathname === '/api/songs') {
    const songs = getSongs()
      .map(({ id, title }) => ({ id, title }))
      .sort((a, b) => a.title.localeCompare(b.title, 'cs'));
    return sendJson(res, 200, { songs });
  }

  if (req.method === 'POST' && url.pathname === '/api/songs') {
    const body = await readBody(req);
    const payload = body ? JSON.parse(body) : {};
    const { title, content } = payload;
    if (!title || !content) {
      return sendJson(res, 400, { error: 'Missing title or content.' });
    }
    const songs = getSongs();
    const id = Date.now().toString();
    const lines = parseSongLines(content);
    const song = {
      id,
      title,
      lines,
      createdAt: new Date().toISOString(),
    };
    songs.push(song);
    saveSongs(songs);
    return sendJson(res, 201, { song });
  }

  if (req.method === 'GET' && url.pathname.startsWith('/api/songs/')) {
    const id = url.pathname.split('/').pop();
    const song = getSongs().find((entry) => entry.id === id);
    if (!song) {
      return sendJson(res, 404, { error: 'Song not found.' });
    }
    return sendJson(res, 200, { song });
  }

  if (req.method === 'GET' && url.pathname === '/api/now-playing') {
    const nowPlaying = getNowPlaying();
    const song = nowPlaying.songId
      ? getSongs().find((entry) => entry.id === nowPlaying.songId)
      : null;
    return sendJson(res, 200, { nowPlaying, song });
  }

  if (req.method === 'PUT' && url.pathname === '/api/now-playing') {
    const body = await readBody(req);
    const payload = body ? JSON.parse(body) : {};
    const { songId } = payload;
    if (!songId) {
      return sendJson(res, 400, { error: 'Missing songId.' });
    }
    const songs = getSongs();
    const songExists = songs.some((entry) => entry.id === songId);
    if (!songExists) {
      return sendJson(res, 404, { error: 'Song not found.' });
    }
    const nowPlaying = { songId };
    saveNowPlaying(nowPlaying);
    return sendJson(res, 200, { nowPlaying });
  }

  return false;
};

const getContentType = (filePath) => {
  const ext = path.extname(filePath);
  if (ext === '.html') return 'text/html; charset=utf-8';
  if (ext === '.css') return 'text/css; charset=utf-8';
  if (ext === '.js') return 'application/javascript; charset=utf-8';
  if (ext === '.json') return 'application/json; charset=utf-8';
  return 'text/plain; charset=utf-8';
};

const serveStatic = (req, res, url) => {
  let filePath = url.pathname === '/' ? '/master.html' : url.pathname;
  if (filePath.includes('..')) {
    sendText(res, 400, 'Bad Request');
    return;
  }
  const resolvedPath = path.join(PUBLIC_DIR, filePath);
  if (!resolvedPath.startsWith(PUBLIC_DIR)) {
    sendText(res, 403, 'Forbidden');
    return;
  }
  fs.readFile(resolvedPath, (error, data) => {
    if (error) {
      sendText(res, 404, 'Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': getContentType(resolvedPath) });
    res.end(data);
  });
};

ensureDataFiles();

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname.startsWith('/api/')) {
    try {
      const handled = await handleApi(req, res, url);
      if (handled === false) {
        sendJson(res, 404, { error: 'Not Found' });
      }
    } catch (error) {
      sendJson(res, 500, { error: 'Server error.' });
    }
    return;
  }

  serveStatic(req, res, url);
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
