# Swiss Fit Club

Swiss Fit Club (Beykent Paradise AVM, Beylikdüzü) için tek sayfalık tanıtım sitesi.

Vite, GSAP (ScrollTrigger, SplitText, Flip), Lenis ve kütüphanesiz bir WebGL hero efektiyle yazıldı.
İletişim formu ve tüm "bilgi al" butonları hazır mesajla WhatsApp'a yönlendirir; sunucu tarafı yoktur.

## Komutlar

Node.js 18+ gerekir.

```bash
npm install
npm run dev           # http://localhost:5173
npm run build         # dist/ → hosting'e yüklenecek klasör
npm run preview       # derlenmiş siteyi yerelde aç
npm run build:single  # dist-single/index.html → her şey gömülü, çift tıklayınca açılır
```

`dist/` içindeki yollar göreli olduğundan site alt klasörde de çalışır (cPanel, Netlify, Vercel, Cloudflare Pages vb.).

## Yapı

```
index.html              içerik, SEO etiketleri ve JSON-LD
src/main.js             modüllerin başlatılma sırası
src/js/lib/             ortak yardımcılar (DOM, kaydırma, WhatsApp, akordeon, seçim göstergesi)
src/js/components/      sayfa geneli: preloader, nav/menü, imleç, şeritler, kaydırma animasyonları
src/js/sections/        bölüm bazlı davranışlar (hero, dersler, saatler, üyelik, SSS, iletişim…)
src/styles/main.css     stil dosyalarının sırası (tokens → base → components → sections)
src/assets/images/      WebP görseller
src/icons/              Lucide'da olmayan özel ikonlar
```

HTML'deki `<i data-icon="dumbbell"></i>` etiketleri derleme sırasında satır içi SVG'ye çevrilir
([Lucide](https://lucide.dev/icons) adları veya `src/icons/` içindeki dosyalar).

## İçerik güncelleme

| Ne | Nerede |
| --- | --- |
| Metinler, hizmetler, dersler, SSS, adres | `index.html` |
| Çalışma saatleri | `src/js/sections/hours.js` + `index.html` içindeki metinler ve JSON-LD |
| Üyelik açıklamaları | `src/js/sections/plans.js` |
| WhatsApp numarası | `src/js/lib/whatsapp.js` + `index.html` içindeki `wa.me` bağlantıları |
| Renk, font, boşluk değişkenleri | `src/styles/tokens.css` |

## Notlar

- Üyelik fiyatları yayınlanmadığı için kartta "Sana özel teklif" yazıyor; fiyat `.plan__price` bloğuna eklenebilir.
- Instagram akışı API anahtarı gerektirdiğinden gömülmedi, bölüm profile yönlendiriyor.
- Görseller mevcut swissfitclub.com sitesinden alındı; kulübün kendi çekimleriyle değiştirilmesi önerilir.
