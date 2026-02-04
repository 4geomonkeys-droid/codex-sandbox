const api = {
  async getSongs() {
    const response = await fetch('/api/songs');
    if (!response.ok) throw new Error('Nepodařilo se načíst seznam.');
    return response.json();
  },
  async getSong(id) {
    const response = await fetch(`/api/songs/${id}`);
    if (!response.ok) throw new Error('Nepodařilo se načíst píseň.');
    return response.json();
  },
  async createSong(payload) {
    const response = await fetch('/api/songs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Nepodařilo se uložit píseň.');
    return response.json();
  },
  async getNowPlaying() {
    const response = await fetch('/api/now-playing');
    if (!response.ok) throw new Error('Nepodařilo se načíst přehrávanou píseň.');
    return response.json();
  },
  async setNowPlaying(songId) {
    const response = await fetch('/api/now-playing', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songId }),
    });
    if (!response.ok) throw new Error('Nepodařilo se nastavit přehrávanou píseň.');
    return response.json();
  },
};

const NOTES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const normalizeNote = (note) => {
  const sharpIndex = NOTES_SHARP.indexOf(note);
  if (sharpIndex !== -1) return { index: sharpIndex, prefersFlat: false };
  const flatIndex = NOTES_FLAT.indexOf(note);
  if (flatIndex !== -1) return { index: flatIndex, prefersFlat: true };
  return null;
};

const transposeChord = (chord, steps) => {
  if (!chord || chord === 'N.C.') return chord;
  const match = chord.match(/^([A-G])(#|b)?(.*)$/);
  if (!match) return chord;
  const [, letter, accidental, suffix] = match;
  const note = `${letter}${accidental || ''}`;
  const normalized = normalizeNote(note);
  if (!normalized) return chord;
  const targetIndex = (normalized.index + steps + NOTES_SHARP.length) % NOTES_SHARP.length;
  const target = normalized.prefersFlat ? NOTES_FLAT[targetIndex] : NOTES_SHARP[targetIndex];
  return `${target}${suffix}`;
};

const chordTokenRegex = /\b([A-G](?:#|b)?(?:maj|min|m|dim|aug|sus|add)?\d*(?:\/[A-G](?:#|b)?)?)\b/g;

const transposeLine = (line, steps) =>
  line.replace(chordTokenRegex, (match) => transposeChord(match, steps));

const renderSongLines = (lines, steps = 0) =>
  lines
    .map((line) => {
      if (line.type === 'chords') {
        return `<div class="song-line chords">${transposeLine(line.text, steps)}</div>`;
      }
      return `<div class="song-line lyrics">${line.text}</div>`;
    })
    .join('');

window.songApp = {
  api,
  renderSongLines,
  transposeLine,
};
