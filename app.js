'use strict';
/* LineupLab – tactics board & lineup manager. No dependencies; data lives in localStorage. */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 9);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const STORE = 'lineuplab.v1';

/* ---------------------------------------------------------------- sports */
const row = (role, x, ys) => ys.map(y => [role, x, y]);
const SPORTS = {
  soccer: {
    name: 'Soccer', vb: [1100, 730], court: [25, 25, 1050, 680], r: 24, positions: ['GK', 'DF', 'MF', 'FW'], special: 'GK',
    fm: {
      '4-4-2': [['GK', .05, .5], ...row('DF', .22, [.12, .38, .62, .88]), ...row('MF', .5, [.12, .38, .62, .88]), ...row('FW', .75, [.38, .62])],
      '4-3-3': [['GK', .05, .5], ...row('DF', .22, [.12, .38, .62, .88]), ...row('MF', .48, [.25, .5, .75]), ...row('FW', .75, [.18, .5, .82])],
      '4-2-3-1': [['GK', .05, .5], ...row('DF', .22, [.12, .38, .62, .88]), ...row('MF', .4, [.35, .65]), ...row('MF', .58, [.2, .5, .8]), ...row('FW', .78, [.5])],
      '3-5-2': [['GK', .05, .5], ...row('DF', .2, [.25, .5, .75]), ...row('MF', .48, [.1, .3, .5, .7, .9]), ...row('FW', .75, [.38, .62])],
      '3-4-3': [['GK', .05, .5], ...row('DF', .2, [.25, .5, .75]), ...row('MF', .47, [.12, .38, .62, .88]), ...row('FW', .75, [.2, .5, .8])],
      '5-3-2': [['GK', .05, .5], ...row('DF', .2, [.1, .3, .5, .7, .9]), ...row('MF', .5, [.25, .5, .75]), ...row('FW', .75, [.38, .62])],
    },
  },
  soccer7: {
    name: 'Soccer 7-a-side', vb: [1100, 730], court: [25, 25, 1050, 680], r: 26, positions: ['GK', 'DF', 'MF', 'FW'], special: 'GK',
    fm: {
      '2-3-1': [['GK', .05, .5], ...row('DF', .24, [.3, .7]), ...row('MF', .5, [.15, .5, .85]), ...row('FW', .76, [.5])],
      '3-2-1': [['GK', .05, .5], ...row('DF', .22, [.2, .5, .8]), ...row('MF', .5, [.32, .68]), ...row('FW', .76, [.5])],
      '2-2-2': [['GK', .05, .5], ...row('DF', .24, [.3, .7]), ...row('MF', .5, [.3, .7]), ...row('FW', .76, [.3, .7])],
      '3-1-2': [['GK', .05, .5], ...row('DF', .22, [.2, .5, .8]), ...row('MF', .48, [.5]), ...row('FW', .76, [.32, .68])],
      '1-3-2': [['GK', .05, .5], ...row('DF', .22, [.5]), ...row('MF', .5, [.15, .5, .85]), ...row('FW', .76, [.32, .68])],
      '2-1-2-1': [['GK', .05, .5], ...row('DF', .22, [.3, .7]), ...row('MF', .42, [.5]), ...row('MF', .6, [.25, .75]), ...row('FW', .8, [.5])],
    },
  },
  basketball: {
    name: 'Basketball', vb: [900, 510], court: [30, 30, 840, 450], r: 22, positions: ['PG', 'SG', 'SF', 'PF', 'C'], special: null,
    fm: {
      '5-Out': [['PG', .6, .5], ['SG', .7, .18], ['SF', .7, .82], ['PF', .84, .07], ['C', .84, .93]],
      '4-Out 1-In': [['PG', .6, .5], ['SG', .72, .15], ['SF', .72, .85], ['PF', .84, .07], ['C', .9, .5]],
      'High Post': [['PG', .6, .5], ['SG', .72, .1], ['SF', .72, .9], ['PF', .8, .5], ['C', .91, .3]],
      'Box Set': [['PG', .58, .5], ['SG', .78, .35], ['SF', .78, .65], ['PF', .9, .35], ['C', .9, .65]],
      '2-3 Zone (D)': [['PG', .22, .3], ['SG', .22, .7], ['SF', .1, .15], ['PF', .1, .85], ['C', .08, .5]],
      'Man D': [['PG', .3, .5], ['SG', .25, .2], ['SF', .25, .8], ['PF', .14, .35], ['C', .12, .65]],
    },
  },
  volleyball: {
    name: 'Volleyball', vb: [840, 480], court: [60, 60, 720, 360], r: 22, positions: ['S', 'OH', 'MB', 'OPP', 'L'], special: 'L',
    fm: {
      'Base 5-1': [['OH', .38, .15], ['MB', .38, .5], ['OPP', .38, .85], ['OH', .12, .2], ['L', .12, .5], ['S', .12, .82]],
      'Serve Receive W': [['OH', .27, .1], ['MB', .42, .5], ['OPP', .42, .88], ['OH', .27, .9], ['L', .2, .5], ['S', .42, .15]],
      'Perimeter Defense': [['OH', .4, .12], ['MB', .4, .5], ['OPP', .4, .88], ['OH', .1, .12], ['L', .12, .5], ['S', .1, .88]],
      'Blockers Up': [['OH', .44, .15], ['MB', .44, .5], ['OPP', .44, .85], ['OH', .22, .1], ['L', .18, .5], ['S', .22, .9]],
    },
  },
  handball: {
    name: 'Handball', vb: [940, 500], court: [30, 30, 880, 440], r: 20, positions: ['GK', 'LW', 'LB', 'CB', 'RB', 'RW', 'P'], special: 'GK',
    fm: {
      'Attack 3-3': [['GK', .04, .5], ['LW', .88, .07], ['LB', .66, .2], ['CB', .62, .5], ['RB', .66, .8], ['RW', .88, .93], ['P', .84, .5]],
      'Attack 2-4': [['GK', .04, .5], ['LW', .88, .07], ['LB', .68, .3], ['CB', .7, .5], ['RB', .68, .7], ['RW', .88, .93], ['P', .86, .5]],
      'Defense 6-0': [['GK', .04, .5], ['LW', .1, .12], ['LB', .16, .3], ['CB', .19, .44], ['P', .19, .56], ['RB', .16, .7], ['RW', .1, .88]],
      'Defense 5-1': [['GK', .04, .5], ['LW', .1, .12], ['LB', .15, .3], ['P', .17, .5], ['RB', .15, .7], ['RW', .1, .88], ['CB', .3, .5]],
    },
  },
};

/* ---- pitch artwork (viewBox units). Half-court is drawn once and mirrored. */
const L = (extra = '') => `fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="3" ${extra}`;
const mirror = (W, inner) => `<g transform="translate(${W} 0) scale(-1 1)">${inner}</g>`;
function pitchMarkup(key) {
  const sp = SPORTS[key], [W, H] = sp.vb, [x0, y0, w, h] = sp.court, cy = y0 + h / 2, cx = x0 + w / 2;
  let s = '';
  if (key === 'soccer7') {
    s += `<rect width="${W}" height="${H}" fill="#1f6b3a"/>`;
    for (let i = 0; i < 8; i++) s += `<rect x="${x0 + i * w / 8}" y="${y0}" width="${w / 8}" height="${h}" fill="${i % 2 ? '#247c45' : '#1f6b3a'}"/>`;
    const half = `<rect x="${x0}" y="${cy - 190}" width="190" height="380"/><rect x="${x0}" y="${cy - 95}" width="70" height="190"/>
      <rect x="${x0 - 14}" y="${cy - 45}" width="14" height="90"/><circle cx="${x0 + 130}" cy="${cy}" r="3.5" fill="#fff" stroke="none"/>`;
    s += `<g ${L()}><rect x="${x0}" y="${y0}" width="${w}" height="${h}"/><path d="M${cx} ${y0}V${y0 + h}"/><circle cx="${cx}" cy="${cy}" r="85"/>${half}${mirror(W, half)}</g>
      <circle cx="${cx}" cy="${cy}" r="4" fill="#fff"/>`;
  } else if (key === 'soccer') {
    s += `<rect width="${W}" height="${H}" fill="#1f6b3a"/>`;
    for (let i = 0; i < 10; i++) s += `<rect x="${x0 + i * w / 10}" y="${y0}" width="${w / 10}" height="${h}" fill="${i % 2 ? '#247c45' : '#1f6b3a'}"/>`;
    const half = `<rect x="${x0}" y="${cy - 201.5}" width="165" height="403"/><rect x="${x0}" y="${cy - 91.5}" width="55" height="183"/>
      <rect x="${x0 - 14}" y="${cy - 36.6}" width="14" height="73.2"/><path d="M${x0 + 165} ${cy - 73.1}A91.5 91.5 0 0 1 ${x0 + 165} ${cy + 73.1}"/>
      <circle cx="${x0 + 110}" cy="${cy}" r="3.5" fill="#fff" stroke="none"/>`;
    s += `<g ${L()}><rect x="${x0}" y="${y0}" width="${w}" height="${h}"/><path d="M${cx} ${y0}V${y0 + h}"/><circle cx="${cx}" cy="${cy}" r="91.5"/>${half}${mirror(W, half)}</g>
      <circle cx="${cx}" cy="${cy}" r="4" fill="#fff"/>`;
  } else if (key === 'basketball') {
    s += `<rect width="${W}" height="${H}" fill="#a9733c"/><rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="#c98f52"/>`;
    const half = `<rect x="${x0}" y="${cy - 73.5}" width="174" height="147" fill="#b2402d" fill-opacity=".35"/><circle cx="${x0 + 174}" cy="${cy}" r="54"/>
      <path d="M${x0} ${cy - 198}H119.5A202.5 202.5 0 0 1 119.5 ${cy + 198}H${x0}"/><path d="M${x0 + 36} ${cy - 27}V${cy + 27}"/>
      <path d="M${x0 + 47} ${cy - 37.5}A37.5 37.5 0 0 1 ${x0 + 47} ${cy + 37.5}"/><circle cx="${x0 + 47}" cy="${cy}" r="7" stroke="#ff8a3d"/>`;
    s += `<g ${L()}><rect x="${x0}" y="${y0}" width="${w}" height="${h}"/><path d="M${cx} ${y0}V${y0 + h}"/><circle cx="${cx}" cy="${cy}" r="54"/>${half}${mirror(W, half)}</g>`;
  } else if (key === 'volleyball') {
    s += `<rect width="${W}" height="${H}" fill="#2c5b8a"/><rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="#d98a45"/>
      <rect x="${cx - 120}" y="${y0}" width="240" height="${h}" fill="#000" fill-opacity=".07"/>`;
    s += `<g ${L()}><rect x="${x0}" y="${y0}" width="${w}" height="${h}"/><path d="M${cx - 120} ${y0}V${y0 + h}M${cx + 120} ${y0}V${y0 + h}"/></g>
      <path d="M${cx} ${y0 - 14}V${y0 + h + 14}" stroke="#fff" stroke-width="7"/><circle cx="${cx}" cy="${y0 - 14}" r="6" fill="#ddd"/><circle cx="${cx}" cy="${y0 + h + 14}" r="6" fill="#ddd"/>`;
  } else {
    s += `<rect width="${W}" height="${H}" fill="#1d4f80"/><rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="#2f78bd"/>`;
    const six = `M${x0} ${cy - 165}A132 132 0 0 1 ${x0 + 132} ${cy - 33}V${cy + 33}A132 132 0 0 1 ${x0} ${cy + 165}`;
    const half = `<path d="${six}" fill="#e9573f" fill-opacity=".4"/><path d="M${x0 + 65.1} ${y0}A198 198 0 0 1 ${x0 + 198} ${cy - 33}V${cy + 33}A198 198 0 0 1 ${x0 + 65.1} ${y0 + h}" stroke-dasharray="12 9"/>
      <path d="M${x0 + 154} ${cy - 11}V${cy + 11}M${x0 + 88} ${cy - 8}V${cy + 8}"/><rect x="${x0 - 12}" y="${cy - 33}" width="12" height="66"/>`;
    s += `<g ${L()}><rect x="${x0}" y="${y0}" width="${w}" height="${h}"/><path d="M${cx} ${y0}V${y0 + h}"/>${half}${mirror(W, half)}</g>`;
  }
  return s;
}

/* ----------------------------------------------------------- sample data */
const SAMPLES = {
  soccer: [[1, 'Alex Rivera', 'GK', 78], [13, 'Sam Okoye', 'GK', 70], [2, 'Marco Silva', 'DF', 80], [3, 'Jonas Weber', 'DF', 77], [4, 'Liam Carter', 'DF', 82], [5, 'Diego Torres', 'DF', 79], [15, 'Ravi Patel', 'DF', 72], [22, 'Nico Brandt', 'DF', 71],
    [6, 'Kenji Mori', 'MF', 81], [8, 'Luca Bianchi', 'MF', 84], [10, 'Mateo Cruz', 'MF', 88], [14, 'Omar Haddad', 'MF', 76], [17, 'Ben Foster', 'MF', 73], [7, 'Andre Costa', 'FW', 85], [9, 'Viktor Novak', 'FW', 86], [11, 'Tomas Lind', 'FW', 79], [19, 'Yusuf Demir', 'FW', 74], [20, 'Eli Santos', 'FW', 70]],
  soccer7: [[1, 'Alex Rivera', 'GK', 78], [12, 'Sam Okoye', 'GK', 69], [2, 'Marco Silva', 'DF', 80], [4, 'Liam Carter', 'DF', 82], [5, 'Diego Torres', 'DF', 77], [3, 'Ravi Patel', 'DF', 71],
    [6, 'Kenji Mori', 'MF', 81], [8, 'Luca Bianchi', 'MF', 84], [10, 'Mateo Cruz', 'MF', 87], [14, 'Omar Haddad', 'MF', 75], [7, 'Andre Costa', 'FW', 85], [9, 'Viktor Novak', 'FW', 86], [11, 'Tomas Lind', 'FW', 76]],
  basketball: [[1, 'Jordan Hayes', 'PG', 84], [7, 'Cam Reed', 'PG', 76], [2, 'Tyrese Cole', 'SG', 82], [11, 'Dre Walker', 'SG', 74], [3, 'Malik Brown', 'SF', 85], [8, 'Evan Park', 'SF', 73], [4, 'Chris Bell', 'PF', 79], [14, 'Leo Grant', 'PF', 72], [5, 'Isaiah Stone', 'C', 83], [15, 'Tom Novak', 'C', 71]],
  volleyball: [[1, 'Aiko Tanaka', 'S', 82], [9, 'Mia Rossi', 'S', 74], [3, 'Sara Lindqvist', 'OH', 85], [6, 'Ana Costa', 'OH', 80], [11, 'Kim Ha', 'OH', 76], [4, 'Lena Fischer', 'MB', 83], [8, 'Priya Nair', 'MB', 78], [12, 'Zoe Martin', 'MB', 72], [10, 'Eva Novak', 'OPP', 84], [14, 'Tia Brooks', 'OPP', 73], [2, 'Noa Cohen', 'L', 79], [7, 'Ines Duarte', 'L', 70]],
  handball: [[1, 'Mads Holm', 'GK', 83], [16, 'Jan Kowal', 'GK', 74], [7, 'Emil Berg', 'LW', 80], [17, 'Oskar Lund', 'LW', 72], [5, 'Nils Aas', 'LB', 84], [10, 'Theo Marin', 'LB', 75], [6, 'Karl Voss', 'CB', 86], [13, 'Ivo Petrov', 'CB', 73], [9, 'Luka Babic', 'RB', 82], [19, 'Marc Dubois', 'RB', 71], [11, 'Finn Olsen', 'RW', 79], [18, 'Sven Roth', 'RW', 70], [3, 'Tim Vogel', 'P', 83], [14, 'Hugo Salas', 'P', 74]],
};
const sampleRoster = k => SAMPLES[k].map(([num, name, pos, rating]) => ({ id: uid(), num, name, pos, rating, status: 'ok', notes: '' }));
const emptyFrame = () => ({ pos: {}, opp: [], ball: null, draws: [] });
const COLORS = ['#ffe14d', '#ffffff', '#ff5d5d', '#4db8ff', '#ff9f43', '#c08cff', '#111111'];

/* ----------------------------------------------------------------- state */
let state;
const ui = { view: 'board', tool: 'move', color: COLORS[0], sel: null, frame: 0, playing: false, loop: false, speed: 1, undo: [], redo: [], names: true, search: '', sort: 'num', pbFilter: 'all', raf: 0, editId: null };

function defaultState() {
  const st = { team: { name: 'My Team', color: '#d62839', color2: '#ffffff', opp: '#2a6fd6' }, sport: 'soccer', rosters: { soccer: sampleRoster('soccer'), soccer7: [], basketball: [], volleyball: [], handball: [] }, plays: [], currentPlayId: null };
  const p = { id: uid(), name: 'Starting XI', sport: 'soccer', formation: '', frames: [emptyFrame()], updated: Date.now() };
  fillFormation(p.frames[0], 'soccer', st.rosters.soccer, '4-4-2', 'auto');
  p.formation = '4-4-2';
  st.plays.push(p); st.currentPlayId = p.id;
  return st;
}
function load() {
  try { const s = JSON.parse(localStorage.getItem(STORE)); if (s && s.plays?.length && s.rosters && s.team) { for (const k in SPORTS) s.rosters[k] ||= []; return s; } } catch { /* ignore */ }
  return defaultState();
}
const save = () => { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch { toast('Could not save (storage full?)'); } };
const SP = () => SPORTS[state.sport];
const play = () => state.plays.find(p => p.id === state.currentPlayId);
const rosterOf = k => state.rosters[k || state.sport];
const frameOf = p => p.frames[clamp(ui.frame, 0, p.frames.length - 1)];
const player = (id, k) => rosterOf(k).find(p => p.id === id);
const unavailable = pl => pl.status === 'injured' || pl.status === 'suspended';

function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2600); }

/* --------------------------------------------------------- history/mutate */
function pushUndo(snap) { ui.undo.push(snap); if (ui.undo.length > 100) ui.undo.shift(); ui.redo = []; }
function mutate(fn) {
  stopPlay(true);
  const p = play(), snap = JSON.stringify(p);
  fn(p, frameOf(p));
  pushUndo(snap); p.updated = Date.now(); save(); renderAll();
}
function replacePlay(json) {
  const i = state.plays.findIndex(p => p.id === state.currentPlayId);
  state.plays[i] = JSON.parse(json);
  ui.frame = clamp(ui.frame, 0, state.plays[i].frames.length - 1);
  save(); renderAll();
}
function undo() { if (!ui.undo.length) return; stopPlay(true); ui.redo.push(JSON.stringify(play())); replacePlay(ui.undo.pop()); }
function redo() { if (!ui.redo.length) return; stopPlay(true); ui.undo.push(JSON.stringify(play())); replacePlay(ui.redo.pop()); }

/* ------------------------------------------------------------- formations */
function pickLineup(slots, roster, current, mode) {
  const avail = roster.filter(p => !unavailable(p)).sort((a, b) => b.rating - a.rating);
  const cand = mode === 'keep' ? [...avail.filter(p => current[p.id]), ...avail.filter(p => !current[p.id])] : avail;
  const used = new Set(), out = Array(slots.length).fill(null);
  slots.forEach((s, i) => { const c = cand.find(p => !used.has(p.id) && p.pos === s[0]); if (c) { used.add(c.id); out[i] = c; } });
  slots.forEach((s, i) => { if (out[i]) return; const c = cand.find(p => !used.has(p.id)); if (c) { used.add(c.id); out[i] = c; } });
  return out;
}
const toNormPt = (sp, fx, fy) => [(sp.court[0] + fx * sp.court[2]) / sp.vb[0], (sp.court[1] + fy * sp.court[3]) / sp.vb[1]];
function fillFormation(frame, sportKey, roster, name, mode) {
  const sp = SPORTS[sportKey], slots = sp.fm[name];
  const picked = pickLineup(slots, roster, frame.pos, mode);
  frame.pos = {};
  slots.forEach((s, i) => { if (picked[i]) frame.pos[picked[i].id] = toNormPt(sp, s[1], s[2]); });
}
function placeOpp(frame, name) {
  const sp = SP();
  frame.opp = sp.fm[name].map(s => toNormPt(sp, 1 - s[1], 1 - s[2]));
}

/* --------------------------------------------------------------- markup */
const tokColors = (pl, sp) => {
  const t = state.team;
  return sp.special && pl.pos === sp.special ? { fill: '#f5c518', txt: '#111' } : { fill: t.color, txt: t.color2 };
};
function tokenG(k, x, y, r, label, fill, txt, name, sel, badge) {
  return `<g class="tok${sel ? ' sel' : ''}" data-k="${esc(k)}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">
    <circle class="body" r="${r}" fill="${fill}" stroke="rgba(0,0,0,.55)" stroke-width="3"/>
    <text text-anchor="middle" dy=".35em" font-size="${r * .95}" font-weight="800" fill="${txt}" font-family="system-ui,sans-serif" pointer-events="none">${esc(label)}</text>
    ${name ? `<text y="${r + r * .75}" text-anchor="middle" font-size="${r * .7}" font-weight="700" fill="#fff" stroke="rgba(0,0,0,.75)" stroke-width="4" paint-order="stroke" stroke-linejoin="round" font-family="system-ui,sans-serif" pointer-events="none">${esc(name)}</text>` : ''}
    ${badge ? `<circle cx="${r * .75}" cy="${-r * .75}" r="${r * .38}" fill="${badge}" stroke="#fff" stroke-width="2"/><text x="${r * .75}" y="${-r * .75}" dy=".35em" text-anchor="middle" font-size="${r * .5}" font-weight="800" fill="#fff" pointer-events="none">!</text>` : ''}
  </g>`;
}
function tokensMarkup(frame, sportKey, o = {}) {
  const sp = SPORTS[sportKey], [W, H] = sp.vb, r = sp.r, roster = o.roster || state.rosters[sportKey];
  let out = '';
  frame.opp.forEach((p, i) => { out += tokenG('o:' + i, p[0] * W, p[1] * H, r * .9, i + 1, state.team.opp, '#fff', '', o.sel === 'o:' + i); });
  for (const id in frame.pos) {
    const pl = roster.find(p => p.id === id); if (!pl) continue;
    const c = tokColors(pl, sp), badge = pl.status === 'ok' ? '' : { doubtful: '#ffb020', injured: '#ff5d5d', suspended: '#9b59d0' }[pl.status];
    const short = pl.name.trim().split(/\s+/).slice(-1)[0];
    out += tokenG('p:' + id, frame.pos[id][0] * W, frame.pos[id][1] * H, r, pl.num, c.fill, c.txt, o.names ? short : '', o.sel === 'p:' + id, badge);
  }
  if (frame.ball) {
    const bk = sportKey === 'basketball' ? '#ff8a3d' : sportKey.startsWith('soccer') ? '#fff' : sportKey === 'handball' ? '#f2d64b' : '#f4f1e6';
    out += `<g class="tok${o.sel === 'b' ? ' sel' : ''}" data-k="b" transform="translate(${frame.ball[0] * W} ${frame.ball[1] * H})"><circle class="body" r="${r * .5}" fill="${bk}" stroke="#111" stroke-width="2.5"/><path d="M${-r * .5} 0H${r * .5}M0 ${-r * .5}V${r * .5}" stroke="#111" stroke-width="1.5" opacity=".5" pointer-events="none"/></g>`;
  }
  return out;
}
function arrowHead(ax, ay, bx, by, size, c) {
  const a = Math.atan2(by - ay, bx - ax), s = size;
  const p = [[bx, by], [bx - s * Math.cos(a - .42), by - s * Math.sin(a - .42)], [bx - s * Math.cos(a + .42), by - s * Math.sin(a + .42)]];
  return `<polygon points="${p.map(q => q.map(v => v.toFixed(1)).join(',')).join(' ')}" fill="${c}" stroke="${c}" stroke-linejoin="round"/>`;
}
function drawsMarkup(draws, sportKey) {
  const [W, H] = SPORTS[sportKey].vb, sw = W / 260, hs = sw * 5;
  return draws.map((d, i) => {
    const P = q => [q[0] * W, q[1] * H], dash = d.dash ? `stroke-dasharray="${sw * 3} ${sw * 2.5}"` : '';
    const stroke = `stroke="${d.c}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" ${dash} fill="none"`;
    let inner = '';
    if (d.t === 'line') {
      const [a, b] = [P(d.a), P(d.b)];
      inner = `<line class="hit" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" ${stroke}/>${d.arrow ? arrowHead(a[0], a[1], b[0], b[1], hs, d.c) : ''}`;
    } else if (d.t === 'path') {
      const pts = d.pts.map(P);
      inner = `<path class="hit" d="M${pts.map(q => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join('L')}" ${stroke}/>`;
      if (d.arrow && pts.length > 1) {
        const e = pts[pts.length - 1]; let s = pts[0];
        for (let j = pts.length - 2; j >= 0; j--) { if (Math.hypot(e[0] - pts[j][0], e[1] - pts[j][1]) > hs) { s = pts[j]; break; } }
        inner += arrowHead(s[0], s[1], e[0], e[1], hs, d.c);
      }
    } else if (d.t === 'zone') {
      const a = P(d.a), b = P(d.b);
      inner = `<ellipse class="hit" cx="${(a[0] + b[0]) / 2}" cy="${(a[1] + b[1]) / 2}" rx="${Math.abs(a[0] - b[0]) / 2}" ry="${Math.abs(a[1] - b[1]) / 2}" fill="${d.c}" fill-opacity=".2" stroke="${d.c}" stroke-width="${sw}" stroke-dasharray="${sw * 3} ${sw * 2}"/>`;
    } else if (d.t === 'text') {
      const p = P(d.p);
      inner = `<text class="hit" x="${p[0]}" y="${p[1]}" text-anchor="middle" font-size="${W / 36}" font-weight="800" fill="${d.c}" stroke="rgba(0,0,0,.6)" stroke-width="4" paint-order="stroke" font-family="system-ui,sans-serif">${esc(d.s)}</text>`;
    }
    return `<g class="draw" data-i="${i}">${inner}</g>`;
  }).join('');
}
const boardInner = (frame, sportKey, o) => `${pitchMarkup(sportKey)}<g id="drawLayer">${drawsMarkup(frame.draws, sportKey)}</g><g id="tmpLayer"></g><g id="tokLayer">${tokensMarkup(frame, sportKey, o)}</g>`;

/* ---------------------------------------------------------------- render */
function renderBoard(view) {
  const svg = $('#board'), sp = SP(), f = view || frameOf(play());
  svg.setAttribute('viewBox', `0 0 ${sp.vb[0]} ${sp.vb[1]}`);
  svg.setAttribute('data-tool', ui.tool);
  svg.innerHTML = boardInner(f, state.sport, { names: ui.names, sel: ui.playing ? null : ui.sel });
}
function renderBench() {
  const p = play(), f = frameOf(p), ro = rosterOf();
  const bench = ro.filter(x => !f.pos[x.id]).sort((a, b) => a.num - b.num);
  const countTxt = `(${bench.length})`;
  // Update all benchCount spans (there may be one in the drawer heading and one in the toggle button)
  $$('#benchCount').forEach(el => el.textContent = countTxt);
  // Keep toggle button label fresh
  const btn = $('#btnBenchToggle');
  if (btn) {
    const open = $('#benchDrawer').classList.contains('open');
    btn.innerHTML = `Bench <span id="benchCount" class="muted">${countTxt}</span> ${open ? '▴' : '▾'}`;
  }
  $('#bench').innerHTML = bench.map(pl => {
    const c = tokColors(pl, SP()), na = unavailable(pl);
    return `<div class="chip${na ? ' na' : ''}" data-id="${pl.id}" title="${na ? esc(pl.status) + ' – unavailable' : 'Drag to pitch'}">
      <span class="num" style="background:${c.fill};color:${c.txt}">${esc(pl.num)}</span><span class="nm">${esc(pl.name)}</span>
      <span class="meta">${pl.status !== 'ok' ? `<span class="badge ${pl.status}">${pl.status}</span> ` : ''}${esc(pl.pos)} · ${pl.rating}</span></div>`;
  }).join('') || '<p class="hint">Everyone is on the pitch.</p>';
}
function lineupPlayers() { const f = frameOf(play()); return Object.keys(f.pos).map(id => player(id)).filter(Boolean); }
function renderStats() {
  const lp = lineupPlayers(), avg = lp.length ? Math.round(lp.reduce((s, p) => s + p.rating, 0) / lp.length) : 0;
  const flagged = lp.filter(p => p.status !== 'ok').length, f = frameOf(play());
  $('#lineupStats').innerHTML = `<span>On pitch <b>${lp.length}</b></span><span>Avg rating <b>${avg || '–'}</b></span>${f.opp.length ? `<span>Opp <b>${f.opp.length}</b></span>` : ''}${flagged ? `<span style="color:var(--warn)">⚠ ${flagged} flagged</span>` : ''}`;
}
function renderInfo() {
  const el = $('#infoBar'), k = ui.sel, f = frameOf(play());
  if (ui.playing) { el.innerHTML = 'Playing animation…'; return; }
  if (k && k[0] === 'p' && f.pos[k.slice(2)]) {
    const pl = player(k.slice(2)); if (!pl) { el.innerHTML = ''; return; }
    el.innerHTML = `<b>#${esc(pl.num)} ${esc(pl.name)}</b><span>${esc(pl.pos)} · rating ${pl.rating}</span><span class="badge ${pl.status}">${pl.status}</span>${pl.notes ? `<span>${esc(pl.notes)}</span>` : ''}<span class="spacer"></span>
      <button class="btn small" data-act="edit">Edit</button><button class="btn small" data-act="bench">Send to bench</button>`;
  } else if (k && k[0] === 'o') {
    el.innerHTML = `<b>Opponent ${+k.slice(2) + 1}</b><span class="spacer"></span><button class="btn small" data-act="rm">Remove</button>`;
  } else if (k === 'b') {
    el.innerHTML = `<b>Ball</b><span class="spacer"></span><button class="btn small" data-act="rm">Remove</button>`;
  } else {
    el.textContent = ui.tool === 'move' ? 'Drag players to move them. Drop a player on another to swap. Select a player for details. Double-tap empty field to go back one step.' :
      ui.tool === 'erase' ? 'Click a drawing to erase it.' : ui.tool === 'text' ? 'Click on the pitch to place a label.' : 'Drag on the pitch to draw.';
  }
}
function renderFrames() {
  const p = play();
  $('#frameBtns').innerHTML = p.frames.map((_, i) => `<button class="fbtn" data-f="${i}" ${i === ui.frame ? 'aria-current="true"' : ''}>${i + 1}</button>`).join('');
  $('#btnDelFrame').disabled = p.frames.length < 2;
  $('#btnPlay').textContent = ui.playing ? '■ Stop' : '▶ Play';
  $('#btnUndo').disabled = !ui.undo.length; $('#btnRedo').disabled = !ui.redo.length;
}
function renderToolbar() {
  $$('.tool').forEach(b => b.setAttribute('aria-pressed', b.dataset.tool === ui.tool));
  $$('.swatch').forEach(b => b.setAttribute('aria-checked', b.dataset.c === ui.color));
}
function renderTop() {
  $('#brandName').textContent = state.team.name;
  document.title = `${state.team.name} – LineupLab`;
  $('#sportSel').value = state.sport;
  $$('.tab').forEach(t => t.toggleAttribute('aria-current', t.dataset.view === ui.view)); $$('.tab').forEach(t => { if (t.dataset.view === ui.view) t.setAttribute('aria-current', 'page'); });
  $$('.view').forEach(v => v.hidden = v.id !== 'view-' + ui.view);
}
function renderBoardView() {
  const p = play(), sp = SP();
  $('#playName').value = p.name;
  $('#fmSel').innerHTML = Object.keys(sp.fm).map(n => `<option>${esc(n)}</option>`).join('');
  $('#fmSel').value = sp.fm[p.formation] ? p.formation : Object.keys(sp.fm)[0];
  $('#btnNames').setAttribute('aria-pressed', ui.names);
  $('#chkLoop').checked = ui.loop; $('#speedSel').value = ui.speed;
  renderBoard(); renderBench(); renderStats(); renderInfo(); renderFrames(); renderToolbar();
}
function renderRoster() {
  const ro = rosterOf(), f = state.plays.length && play().sport === state.sport ? frameOf(play()) : emptyFrame();
  $('#rosterSport').textContent = '· ' + SP().name;
  const q = ui.search.trim().toLowerCase();
  const posIdx = p => SP().positions.indexOf(p.pos);
  const rows = ro.filter(p => !q || p.name.toLowerCase().includes(q) || String(p.num) === q).sort({
    num: (a, b) => a.num - b.num, name: (a, b) => a.name.localeCompare(b.name), pos: (a, b) => posIdx(a) - posIdx(b) || a.num - b.num, rating: (a, b) => b.rating - a.rating,
  }[ui.sort]);
  const avail = ro.filter(p => !unavailable(p));
  $('#rosterStats').innerHTML = `<span>Players <b>${ro.length}</b></span><span>Available <b>${avail.length}</b></span><span>Avg rating <b>${ro.length ? Math.round(ro.reduce((s, p) => s + p.rating, 0) / ro.length) : '–'}</b></span>`;
  $('#rosterEmpty').hidden = rows.length > 0;
  $('#rosterTable tbody').innerHTML = rows.map(pl => {
    const c = tokColors(pl, SP());
    return `<tr data-id="${pl.id}"><td><span class="numdot" style="background:${c.fill};color:${c.txt}">${esc(pl.num)}</span></td><td><b>${esc(pl.name)}</b></td><td>${esc(pl.pos)}</td>
      <td>${pl.rating}<span class="rbar" style="width:${pl.rating * .6}px"></span></td><td><span class="badge ${pl.status}">${pl.status}</span></td>
      <td>${f.pos[pl.id] ? '<span class="badge ok">On pitch</span>' : '<span class="muted">Bench</span>'}</td><td class="notes" title="${esc(pl.notes)}">${esc(pl.notes)}</td>
      <td class="acts"><button class="btn small" data-act="edit">Edit</button> <button class="btn small danger" data-act="del">Delete</button></td></tr>`;
  }).join('');
}
function renderPlaybook() {
  $('#pbFilter').innerHTML = `<option value="all">All sports</option>` + Object.entries(SPORTS).map(([k, s]) => `<option value="${k}">${s.name}</option>`).join('');
  $('#pbFilter').value = ui.pbFilter;
  const list = state.plays.filter(p => ui.pbFilter === 'all' || p.sport === ui.pbFilter).sort((a, b) => b.updated - a.updated);
  $('#playGrid').innerHTML = list.map(p => {
    const sp = SPORTS[p.sport];
    return `<article class="pcard${p.id === state.currentPlayId ? ' cur' : ''}" data-id="${p.id}">
      <svg viewBox="0 0 ${sp.vb[0]} ${sp.vb[1]}" data-act="open" aria-label="Open ${esc(p.name)}">${boardInner(p.frames[0], p.sport, { roster: state.rosters[p.sport] })}</svg>
      <div class="body"><div class="t">${esc(p.name)}</div><div class="muted">${sp.name}${p.formation ? ' · ' + esc(p.formation) : ''} · ${p.frames.length} step${p.frames.length > 1 ? 's' : ''}</div>
      <div class="acts"><button class="btn small primary" data-act="open">Open</button><button class="btn small" data-act="dup">Duplicate</button><button class="btn small" data-act="export">Export</button><button class="btn small danger" data-act="del">Delete</button></div></div></article>`;
  }).join('') || '<p class="empty">No plays yet.</p>';
}
function renderAll() {
  renderTop();
  if (ui.view === 'board') renderBoardView();
  else if (ui.view === 'roster') renderRoster();
  else renderPlaybook();
  renderFrames();
}

/* ------------------------------------------------------------- pointer */
const boardEl = () => $('#board');
function toNorm(e) {
  const svg = boardEl(), pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
  const q = pt.matrixTransform(svg.getScreenCTM().inverse()), [W, H] = SP().vb;
  return [clamp(q.x / W, 0, 1), clamp(q.y / H, 0, 1)];
}
const overEl = (e, sel) => { const el = document.elementFromPoint(e.clientX, e.clientY); return !!(el && el.closest(sel)); };
const tokKey = k => k === 'b' ? { t: 'b' } : { t: k[0], id: k.slice(2) };
const getPos = (f, k) => k === 'b' ? f.ball : k[0] === 'o' ? f.opp[+k.slice(2)] : f.pos[k.slice(2)];

function startTokenDrag(e, k) {
  e.preventDefault();
  const p = play(), f = frameOf(p), pos = getPos(f, k); if (!pos) return;
  const [W, H] = SP().vb, r = SP().r / W; // normalised-x radius
  ui.sel = k; const snap = JSON.stringify(p), origin = [...pos], start = toNorm(e), off = [pos[0] - start[0], pos[1] - start[1]];
  $$('#tokLayer .tok.sel').forEach(g => g.classList.remove('sel'));
  const g = e.target.closest('[data-k]'); g.classList.add('sel'); renderInfo();
  let moved = false;
  const move = ev => {
    const q = toNorm(ev); pos[0] = clamp(q[0] + off[0], 0, 1); pos[1] = clamp(q[1] + off[1], 0, 1);
    if (Math.hypot((pos[0] - origin[0]) * W, (pos[1] - origin[1]) * H) > 4) moved = true;
    g.setAttribute('transform', `translate(${(pos[0] * W).toFixed(1)} ${(pos[1] * H).toFixed(1)})`);
    $('#bench').classList.toggle('dropping', k !== 'b' && overEl(ev, '#bench'));
  };
  const up = ev => {
    document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); document.removeEventListener('pointercancel', up);
    $('#bench').classList.remove('dropping');
    if (!moved) { renderAll(); return; }
    if (k !== 'b' && overEl(ev, '#bench')) {
      if (k[0] === 'p') delete f.pos[k.slice(2)]; else f.opp.splice(+k.slice(2), 1);
      ui.sel = null;
    } else if (k[0] === 'p') {
      const id = k.slice(2);
      const hit = Object.keys(f.pos).find(o => o !== id && Math.hypot((f.pos[o][0] - pos[0]) * W, (f.pos[o][1] - pos[1]) * H) < SP().r * 1.1);
      if (hit) { const tmp = [...f.pos[hit]]; f.pos[hit] = origin; f.pos[id] = tmp; }
    }
    p.formation = ''; p.updated = Date.now(); pushUndo(snap); save(); renderAll();
  };
  document.addEventListener('pointermove', move); document.addEventListener('pointerup', up); document.addEventListener('pointercancel', up);
}

/* drag from bench */
function startBenchDrag(e, id) {
  const pl = player(id); if (!pl) return;
  if (unavailable(pl)) { toast(`${pl.name} is ${pl.status}.`); return; }
  const chip = e.target.closest('.chip'), sx = e.clientX, sy = e.clientY; let ghost = null;
  const move = ev => {
    if (!ghost && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 5) {
      ghost = chip.cloneNode(true); ghost.classList.add('ghost-chip'); ghost.style.width = chip.offsetWidth + 'px'; document.body.append(ghost);
    }
    if (ghost) { ghost.style.left = ev.clientX - 20 + 'px'; ghost.style.top = ev.clientY - 14 + 'px'; }
  };
  const up = ev => {
    document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); document.removeEventListener('pointercancel', up);
    ghost?.remove();
    const f = frameOf(play()), [W, H] = SP().vb;
    if (!ghost) { // click => drop near centre
      return mutate((p, fr) => { fr.pos[id] = [.5 + (Math.random() - .5) * .14, .5 + (Math.random() - .5) * .3]; p.formation = ''; });
    }
    if (!overEl(ev, '#board')) return;
    const q = toNorm(ev);
    const hit = Object.keys(f.pos).find(o => Math.hypot((f.pos[o][0] - q[0]) * W, (f.pos[o][1] - q[1]) * H) < SP().r * 1.2);
    mutate((p, fr) => { if (hit) { fr.pos[id] = fr.pos[hit]; delete fr.pos[hit]; } else fr.pos[id] = q; p.formation = ''; });
    if (hit) toast(`${pl.name} replaces ${player(hit)?.name}`);
  };
  document.addEventListener('pointermove', move); document.addEventListener('pointerup', up); document.addEventListener('pointercancel', up);
}

/* drawing */
function startDraw(e) {
  e.preventDefault();
  const tool = ui.tool, a = toNorm(e), [W, H] = SP().vb; let b = a, pts = [a], cur = null;
  const build = () => {
    if (tool === 'pass' || tool === 'run') return { t: 'line', a, b, arrow: true, dash: tool === 'run', c: ui.color };
    if (tool === 'zone') return { t: 'zone', a, b, c: ui.color };
    return { t: 'path', pts, arrow: tool === 'curve', dash: false, c: ui.color };
  };
  const move = ev => {
    b = toNorm(ev); if (tool === 'pen' || tool === 'curve') { const l = pts[pts.length - 1]; if (Math.hypot((b[0] - l[0]) * W, (b[1] - l[1]) * H) > 5) pts.push(b); }
    cur = build(); $('#tmpLayer').innerHTML = drawsMarkup([cur], state.sport);
  };
  const up = () => {
    document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); document.removeEventListener('pointercancel', up);
    $('#tmpLayer').innerHTML = '';
    if (!cur) return;
    const len = Math.hypot((b[0] - a[0]) * W, (b[1] - a[1]) * H);
    if ((tool === 'pass' || tool === 'run' || tool === 'zone') && len < 12) return;
    if ((tool === 'pen' || tool === 'curve') && pts.length < 2) return;
    mutate((p, f) => f.draws.push(cur));
  };
  document.addEventListener('pointermove', move); document.addEventListener('pointerup', up); document.addEventListener('pointercancel', up);
}

function onBoardDown(e) {
  if (ui.playing) return;
  // Ignore right / middle mouse clicks but allow all touch-driven pointer events
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  if (ui.tool === 'move') {
    const g = e.target.closest('[data-k]');
    if (g) startTokenDrag(e, g.dataset.k);
    else { ui.sel = null; renderBoard(); renderInfo(); }
  } else if (ui.tool === 'erase') {
    const d = e.target.closest('.draw'); if (d) mutate((p, f) => f.draws.splice(+d.dataset.i, 1));
  } else if (ui.tool === 'text') {
    e.preventDefault(); const pt = toNorm(e), s = prompt('Label text:');
    if (s && s.trim()) mutate((p, f) => f.draws.push({ t: 'text', p: pt, s: s.trim().slice(0, 40), c: ui.color }));
  } else startDraw(e);
}

/* Two-finger double-tap on the board → undo
   We track native touchstart events (higher fidelity than pointer for multi-touch).
   Two fingers down twice within 500 ms triggers undo. */
function initTwoFingerDoubleTap(el) {
  let last = 0;
  el.addEventListener('touchstart', e => {
    if (ui.playing) return;
    if (e.touches.length === 2) {
      const now = performance.now();
      if (now - last < 500) {
        e.preventDefault();
        last = 0;
        if (ui.undo.length) { undo(); toast('↶ Went back one step'); }
        else toast('Nothing to go back to');
      } else {
        last = now;
      }
    } else {
      last = 0; // reset if single finger or 3+
    }
  }, { passive: false });
}

/* -------------------------------------------------------------- animation */
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
function lerpFrame(A, B, t) {
  const v = { pos: {}, opp: [], ball: null, draws: t < .5 ? A.draws : B.draws };
  for (const id in B.pos) { const a = A.pos[id], b = B.pos[id]; v.pos[id] = a ? [lerp(a[0], b[0], t), lerp(a[1], b[1], t)] : b; }
  v.opp = B.opp.map((b, i) => { const a = A.opp[i]; return a ? [lerp(a[0], b[0], t), lerp(a[1], b[1], t)] : b; });
  v.ball = B.ball ? (A.ball ? [lerp(A.ball[0], B.ball[0], t), lerp(A.ball[1], B.ball[1], t)] : B.ball) : null;
  return v;
}
function startPlay() {
  const p = play(); if (p.frames.length < 2) { toast('Add at least two steps to animate.'); return; }
  ui.playing = true; ui.sel = null; let seg = 0, t0 = null; const dur = 1700 / ui.speed; ui.frame = 0; renderBoard(); renderFrames(); renderInfo();
  const tick = ts => {
    if (!ui.playing) return;
    if (t0 === null) t0 = ts;
    let t = (ts - t0) / dur;
    if (t >= 1) {
      seg++; t0 = ts; t = 0;
      if (seg >= p.frames.length - 1) { if (ui.loop) { seg = 0; } else { ui.frame = p.frames.length - 1; stopPlay(); return; } }
      ui.frame = seg; renderFrames();
    }
    renderBoard(lerpFrame(p.frames[seg], p.frames[seg + 1], ease(t)));
    ui.raf = requestAnimationFrame(tick);
  };
  ui.raf = requestAnimationFrame(tick);
}
function stopPlay(silent) {
  if (!ui.playing) return;
  ui.playing = false; cancelAnimationFrame(ui.raf);
  if (!silent) renderAll();
}

/* ----------------------------------------------------------------- export */
function download(name, text, type = 'application/json') {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'play';
function exportPng() {
  const p = play(), sp = SP(), [W, H] = sp.vb, f = frameOf(p), bar = 60;
  const body = boardInner(f, state.sport, { names: true, sel: null });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H + bar}" viewBox="0 0 ${W} ${H + bar}"><rect width="${W}" height="${bar}" fill="#0e1116"/>
    <text x="20" y="38" font-size="28" font-weight="800" fill="#e8ecf4" font-family="system-ui,sans-serif">${esc(state.team.name)} — ${esc(p.name)}${p.frames.length > 1 ? ` (step ${ui.frame + 1}/${p.frames.length})` : ''}</text>
    <svg y="${bar}" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${body}</svg></svg>`;
  const img = new Image();
  img.onload = () => {
    const c = document.createElement('canvas'); c.width = W * 2; c.height = (H + bar) * 2; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    c.toBlob(b => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = slug(p.name) + '.png'; a.click(); }, 'image/png');
  };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
async function copyLineup() {
  const p = play(), sp = SP(), f = frameOf(p), lp = lineupPlayers();
  lp.sort((a, b) => sp.positions.indexOf(a.pos) - sp.positions.indexOf(b.pos) || a.num - b.num);
  const txt = `${state.team.name} – ${p.name}${p.formation ? ` (${p.formation})` : ''}\n` + lp.map(x => `${x.pos.padEnd(3)} #${x.num} ${x.name}`).join('\n') +
    `\nBench: ` + (rosterOf().filter(x => !f.pos[x.id]).map(x => `#${x.num} ${x.name}`).join(', ') || '–');
  try { await navigator.clipboard.writeText(txt); toast('Lineup copied to clipboard'); } catch { prompt('Copy lineup:', txt); }
}
function pickFile(cb) {
  const inp = $('#fileIn'); inp.value = '';
  inp.onchange = async () => { const fl = inp.files[0]; if (!fl) return; try { cb(JSON.parse(await fl.text())); } catch { toast('Invalid file'); } };
  inp.click();
}

/* ------------------------------------------------------------- operations */
function newPlay(sportKey, name, fm) {
  const p = { id: uid(), name: name || 'New play', sport: sportKey, formation: '', frames: [emptyFrame()], updated: Date.now() };
  const first = fm || Object.keys(SPORTS[sportKey].fm)[0];
  fillFormation(p.frames[0], sportKey, state.rosters[sportKey], first, 'auto'); p.formation = first;
  state.plays.push(p); openPlay(p.id);
}
function openPlay(id) {
  stopPlay(true); const p = state.plays.find(x => x.id === id); if (!p) return;
  state.currentPlayId = id; state.sport = p.sport; ui.frame = 0; ui.sel = null; ui.undo = []; ui.redo = []; ui.view = 'board'; save(); renderAll();
}
function changeSport(k) {
  if (k === state.sport) return;
  stopPlay(true);
  if (!state.rosters[k].length) { state.rosters[k] = sampleRoster(k); toast(`Sample ${SPORTS[k].name.toLowerCase()} squad loaded – edit it in Roster`); }
  const existing = state.plays.filter(p => p.sport === k).sort((a, b) => b.updated - a.updated)[0];
  state.sport = k;
  if (existing) openPlay(existing.id); else newPlay(k, 'Starting lineup');
}
function openPlayerDlg(id) {
  const dlg = $('#playerDlg'), f = $('#playerForm'), pl = id && player(id);
  ui.editId = id || null;
  $('#playerDlgTitle').textContent = pl ? 'Edit player' : 'Add player';
  f.pos.innerHTML = SP().positions.map(x => `<option>${x}</option>`).join('');
  f.name.value = pl?.name || ''; f.num.value = pl?.num ?? ''; f.pos.value = pl?.pos || SP().positions[0];
  f.rating.value = pl?.rating ?? 70; f.status.value = pl?.status || 'ok'; f.notes.value = pl?.notes || '';
  dlg.showModal(); f.name.focus();
}
function removeFromBench(id) { mutate((p, f) => { delete f.pos[id]; p.formation = ''; }); ui.sel = null; renderAll(); }
function deleteSelected() {
  const k = ui.sel; if (!k || ui.playing) return;
  if (k[0] === 'p') mutate((p, f) => { delete f.pos[k.slice(2)]; p.formation = ''; });
  else if (k[0] === 'o') mutate((p, f) => f.opp.splice(+k.slice(2), 1));
  else if (k === 'b') mutate((p, f) => { f.ball = null; });
  ui.sel = null; renderAll();
}

/* ----------------------------------------------------------------- wiring */
function init() {
  state = load();
  $('#sportSel').innerHTML = Object.entries(SPORTS).map(([k, s]) => `<option value="${k}">${s.name}</option>`).join('');
  $('#colors').innerHTML = COLORS.map(c => `<button class="swatch" role="radio" data-c="${c}" style="background:${c}" aria-label="Colour ${c}"></button>`).join('');

  $('.tabs').addEventListener('click', e => { const b = e.target.closest('.tab'); if (b) { stopPlay(true); ui.view = b.dataset.view; renderAll(); } });
  $('#sportSel').addEventListener('change', e => changeSport(e.target.value));

  // board
  boardEl().addEventListener('pointerdown', onBoardDown);
  initTwoFingerDoubleTap(boardEl());

  // Drawing tools and colour swatches live inside .controlrow now
  $('.controlrow').addEventListener('click', e => {
    const t = e.target.closest('.tool'); if (t) { ui.tool = t.dataset.tool; ui.sel = null; renderBoard(); renderToolbar(); renderInfo(); }
    const s = e.target.closest('.swatch'); if (s) { ui.color = s.dataset.c; renderToolbar(); }
  });
  $('#btnClearDraw').onclick = () => { if (frameOf(play()).draws.length) mutate((p, f) => { f.draws = []; }); };

  // Bench drawer toggle
  $('#btnBenchToggle').addEventListener('click', () => {
    const drawer = $('#benchDrawer'), btn = $('#btnBenchToggle');
    const open = !drawer.classList.contains('open');
    drawer.classList.toggle('open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    btn.setAttribute('aria-expanded', String(open));
    btn.innerHTML = `Bench <span id="benchCount" class="muted">${$('#benchCount')?.textContent || ''}</span> ${open ? '▴' : '▾'}`;
  });

  $('#playName').addEventListener('input', e => { play().name = e.target.value; play().updated = Date.now(); save(); });
  $('#btnUndo').onclick = undo; $('#btnRedo').onclick = redo;
  $('#btnNames').onclick = () => { ui.names = !ui.names; renderBoardView(); };
  $('#btnCopy').onclick = copyLineup; $('#btnPng').onclick = exportPng;
  $('#btnFmKeep').onclick = () => mutate((p, f) => { const n = $('#fmSel').value; fillFormation(f, state.sport, rosterOf(), n, 'keep'); p.formation = n; });
  $('#btnFmAuto').onclick = () => mutate((p, f) => { const n = $('#fmSel').value; fillFormation(f, state.sport, rosterOf(), n, 'auto'); p.formation = n; });
  $('#btnOppFm').onclick = () => mutate((p, f) => placeOpp(f, $('#fmSel').value));
  $('#btnOppAdd').onclick = () => mutate((p, f) => f.opp.push([.7 + Math.random() * .2, .2 + Math.random() * .6]));
  $('#btnOppClear').onclick = () => { if (frameOf(play()).opp.length) mutate((p, f) => { f.opp = []; }); };
  $('#btnBall').onclick = () => mutate((p, f) => { f.ball = f.ball ? null : [.5, .5]; });
  $('#bench').addEventListener('pointerdown', e => { const c = e.target.closest('.chip'); if (c) { e.preventDefault(); startBenchDrag(e, c.dataset.id); } });
  $('#infoBar').addEventListener('click', e => {
    const a = e.target.closest('[data-act]')?.dataset.act; if (!a) return;
    if (a === 'edit') openPlayerDlg(ui.sel.slice(2)); else if (a === 'bench' || a === 'rm') deleteSelected();
  });

  // frames
  $('#frameBtns').addEventListener('click', e => { const b = e.target.closest('.fbtn'); if (b) { stopPlay(true); ui.frame = +b.dataset.f; ui.sel = null; renderAll(); } });
  $('#btnAddFrame').onclick = () => { stopPlay(true); const p = play(), snap = JSON.stringify(p); p.frames.splice(ui.frame + 1, 0, JSON.parse(JSON.stringify(frameOf(p)))); ui.frame++; pushUndo(snap); save(); renderAll(); };
  $('#btnDelFrame').onclick = () => { const p = play(); if (p.frames.length < 2) return; mutate((pp) => { pp.frames.splice(ui.frame, 1); ui.frame = Math.max(0, ui.frame - 1); }); };
  $('#btnPlay').onclick = () => ui.playing ? stopPlay() : startPlay();
  $('#chkLoop').onchange = e => ui.loop = e.target.checked;
  $('#speedSel').onchange = e => ui.speed = +e.target.value;

  // roster
  $('#btnAddPlayer').onclick = () => openPlayerDlg();
  $('#btnSample').onclick = () => { if (!rosterOf().length || confirm('Add sample players to the current roster?')) { state.rosters[state.sport].push(...sampleRoster(state.sport)); save(); renderAll(); } };
  $('#btnClearRoster').onclick = () => { if (rosterOf().length && confirm('Remove ALL players from this roster? Plays will lose their lineups.')) { state.rosters[state.sport] = []; save(); renderAll(); } };
  $('#rSearch').addEventListener('input', e => { ui.search = e.target.value; renderRoster(); });
  $('#rSort').addEventListener('change', e => { ui.sort = e.target.value; renderRoster(); });
  $('#rosterTable').addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (!b) return; const id = b.closest('tr').dataset.id;
    if (b.dataset.act === 'edit') openPlayerDlg(id);
    else if (confirm(`Delete ${player(id).name}?`)) {
      state.rosters[state.sport] = rosterOf().filter(p => p.id !== id);
      state.plays.forEach(p => p.frames.forEach(f => delete f.pos[id])); save(); renderAll();
    }
  });
  $('#playerForm').addEventListener('submit', e => {
    if (e.submitter?.value !== 'ok') return;
    const f = e.target, data = { name: f.name.value.trim(), num: +f.num.value, pos: f.pos.value, rating: clamp(+f.rating.value || 70, 1, 99), status: f.status.value, notes: f.notes.value.trim() };
    if (ui.editId) Object.assign(player(ui.editId), data); else rosterOf().push({ id: uid(), ...data });
    save(); renderAll();
  });

  // playbook
  $('#pbFilter').addEventListener('change', e => { ui.pbFilter = e.target.value; renderPlaybook(); });
  $('#btnNewPlay').onclick = () => { const n = prompt('Play name:', 'New play'); if (n === null) return; if (!rosterOf().length) state.rosters[state.sport] = sampleRoster(state.sport); newPlay(state.sport, n.trim() || 'New play'); };
  $('#btnImportPlay').onclick = () => pickFile(d => {
    if (!d.frames || !SPORTS[d.sport]) return toast('Not a play file');
    d.id = uid(); d.updated = Date.now(); d.name = (d.name || 'Imported') + ' (import)'; state.plays.push(d); openPlay(d.id);
    toast('Imported. Players not in your roster will be missing from the pitch.');
  });
  $('#playGrid').addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (!b) return; const id = b.closest('.pcard').dataset.id, p = state.plays.find(x => x.id === id);
    switch (b.dataset.act) {
      case 'open': openPlay(id); break;
      case 'dup': { const c = JSON.parse(JSON.stringify(p)); c.id = uid(); c.name += ' copy'; c.updated = Date.now(); state.plays.push(c); save(); renderPlaybook(); break; }
      case 'export': download(slug(p.name) + '.play.json', JSON.stringify(p, null, 1)); break;
      case 'del':
        if (state.plays.length < 2) return toast('Keep at least one play.');
        if (confirm(`Delete "${p.name}"?`)) { state.plays = state.plays.filter(x => x.id !== id); if (id === state.currentPlayId) { openPlay(state.plays[0].id); ui.view = 'playbook'; renderAll(); } else { save(); renderPlaybook(); } }
    }
  });

  // team dialog
  $('#btnTeam').onclick = () => { const f = $('#teamForm'), t = state.team; f.name.value = t.name; f.color.value = t.color; f.color2.value = t.color2; f.opp.value = t.opp; $('#teamDlg').showModal(); };
  $('#teamForm').addEventListener('submit', e => {
    if (e.submitter?.value !== 'ok') return; const f = e.target;
    state.team = { name: f.name.value.trim() || 'My Team', color: f.color.value, color2: f.color2.value, opp: f.opp.value }; save(); renderAll();
  });
  $('#btnExportAll').onclick = () => download(slug(state.team.name) + '-lineuplab.json', JSON.stringify(state, null, 1));
  $('#btnImportAll').onclick = () => pickFile(d => {
    if (!d.plays?.length || !d.rosters || !d.team) return toast('Not a LineupLab backup');
    for (const k in SPORTS) d.rosters[k] ||= [];
    state = d; ui.undo = []; ui.redo = []; ui.frame = 0; $('#teamDlg').close(); save(); renderAll(); toast('Backup restored');
  });
  $('#btnReset').onclick = () => { if (confirm('Erase all rosters and plays?')) { state = defaultState(); ui.undo = []; ui.redo = []; ui.frame = 0; $('#teamDlg').close(); save(); renderAll(); } };

  document.addEventListener('keydown', e => {
    if (e.target.closest('input,textarea,select,dialog') || ui.view !== 'board') return;
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
    else if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
    else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); deleteSelected(); }
    else if (e.key === ' ') { e.preventDefault(); ui.playing ? stopPlay() : startPlay(); }
    else if (e.key.toLowerCase() === 'v') { ui.tool = 'move'; renderBoard(); renderToolbar(); renderInfo(); }
  });
  renderAll();
}
init();
