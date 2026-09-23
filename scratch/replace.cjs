const fs = require('fs');
let code = fs.readFileSync('client/src/pages/Home.tsx', 'utf8');
const start = code.indexOf('{/* ── CONTINENTS ──');
const end = code.indexOf('{/* ── TRADE ROUTES');
if (start > -1 && end > -1) {
  code = code.substring(0, start) + '{/* ── BACKGROUND MAP ── */}\n                    <image href="/images/world-map-bg.jpg" width="1000" height="500" opacity="0.3" style={{ mixBlendMode: "screen", pointerEvents: "none" }} />\n\n                    ' + code.substring(end);
  fs.writeFileSync('client/src/pages/Home.tsx', code);
  console.log('Replaced successfully');
} else {
  console.log('Tags not found');
}
