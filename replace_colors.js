const fs = require('fs');
const path = require('path');

function r(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      r(p);
    } else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
      let c = fs.readFileSync(p, 'utf8');
      
      // Replace Hex colors with custom CSS variables
      c = c.replace(/#A3FF12/gi, 'var(--lime)');
      c = c.replace(/#f0f0f0/gi, 'var(--gray)');
      c = c.replace(/_#000\]/g, '_var(--black)]');
      c = c.replace(/_#000000\]/g, '_var(--black)]');
      c = c.replace(/_#fff\]/gi, '_var(--white)]');
      c = c.replace(/_#ffffff\]/gi, '_var(--white)]');

      fs.writeFileSync(p, c);
    }
  }
}

r('./app');
r('./components');
console.log('Replaced all Hex Codes!');
