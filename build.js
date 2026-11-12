// ONN Agency site derleyicisi.
// content/*.json içindeki metinleri src/index.html şablonuna yerleştirir, sonucu dist/ klasörüne yazar.
// GitHub Actions her yayında bunu çalıştırır: "node build.js". Ek paket gerektirmez.
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// **kalın** yazımı <strong> olur, gerisi düz metin.
const rich = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

const iletisim = read('content/iletisim.json');
const wa = (text) => `https://wa.me/${iletisim.whatsapp}?text=${encodeURIComponent(text)}`;

const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="#FF7A59" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

function cell(v) {
  const no = /^(yok|-|—)?$/i.test(String(v || '').trim());
  return `<td class="${no ? 'no' : 'yes'}">${esc(v || 'Yok')}</td>`;
}

function renderPricing(f) {
  const plans = (f.paketler || []).map((p) => `      <article class="plan${p.one_cikan ? ' featured' : ''} reveal">
        ${p.rozet ? `<span class="badge">${esc(p.rozet)}</span>\n        ` : ''}<h3>${esc(p.ad)}</h3>
        <p class="for">${esc(p.kimin_icin)}</p>
        <div class="price"><span class="big">${esc(p.fiyat)} <small>${esc(p.fiyat_birimi)}</small></span><span class="sub">${rich(p.fiyat_alt_yazi)}</span></div>
        <ul>${(p.ozellikler || []).map((o) => `<li>${CHECK}<span>${esc(o)}</span></li>`).join('')}</ul>
        <a class="btn ${p.one_cikan ? 'btn-coral' : 'btn-ghost'}" href="${esc(wa(`Merhaba, ${p.ad} paketi hakkında bilgi almak istiyorum.`))}">Teklif alın</a>
      </article>`).join('\n');

  const names = (f.paketler || []).map((p) => p.ad);
  const rows = (f.karsilastirma || []).map((r) =>
    `<tr><td>${esc(r.ozellik)}</td>${cell(r.vitrin)}${cell(r.sahne)}${cell(r.prestij)}</tr>`).join('');

  const extras = (f.ek_hizmetler || []).map((x) =>
    `      <div class="extra reveal"><h3>${esc(x.ad)}</h3><span class="from">${esc(x.fiyat)}</span>${x.fiyat_notu ? `<span class="alt">${esc(x.fiyat_notu)}</span>` : ''}<p>${esc(x.aciklama)}</p><a href="${esc(wa(`Merhaba, ${x.ad} için bilgi almak istiyorum.`))}">${esc(x.buton_yazisi || 'Teklif alın')} →</a></div>`).join('\n');

  const notes = (f.notlar || []).map((n) => `      <li>${esc(n)}</li>`).join('\n');

  return `    <div class="plans">
${plans}
    </div>

    <p class="common reveal">${esc(f.ortak_not)}</p>

    <div class="compare reveal">
      <h3>Paketlerde neler var</h3>
      <table>
        <thead><tr><th scope="col"><span class="visually-hidden">Özellik</span></th>${names.slice(0, 3).map((n) => `<th scope="col">${esc(n)}</th>`).join('')}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>

    <div class="extras">
${extras}
    </div>

    <ul class="notes">
${notes}
    </ul>`;
}

function renderFaq(s) {
  return (s.sorular || []).map((q) =>
    `<details class="qa reveal"><summary>${esc(q.soru)}<span class="pm" aria-hidden="true"></span></summary><p>${esc(q.cevap)}</p></details>`).join('');
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, e.name), b = path.join(to, e.name);
    e.isDirectory() ? copyDir(a, b) : fs.copyFileSync(a, b);
  }
}

fs.rmSync(DIST, { recursive: true, force: true });
copyDir(SRC, DIST);
copyDir(path.join(ROOT, 'admin'), path.join(DIST, 'admin'));

let html = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8');
const need = ['<!--CMS:fiyatlar-->', '<!--CMS:sss-->'];
for (const m of need) if (!html.includes(m)) throw new Error('Şablonda işaret yok: ' + m);
html = html.replace('<!--CMS:fiyatlar-->', renderPricing(read('content/fiyatlar.json')));
html = html.replace('<!--CMS:sss-->', renderFaq(read('content/sss.json')));
fs.writeFileSync(path.join(DIST, 'index.html'), html);
console.log('Site derlendi: dist/');
