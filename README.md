# ONN Agency web sitesi

- `src/` : sitenin dosyaları (tasarım, görseller, gizlilik sayfası)
- `content/` : panelden düzenlenen metinler (fiyatlar, SSS, WhatsApp numarası)
- `.pages.yml` : içerik paneli ayarları (app.pagescms.org)
- `.github/workflows/yayinla.yml` : her değişiklikte siteyi GitHub Pages’te yayınlar
- `build.js` : GitHub her yayında içerikleri siteye yerleştirir

Panelden yapılan her kayıt bu depoya otomatik kaydedilir ve GitHub siteyi 1–2 dakikada yeniden yayınlar.
