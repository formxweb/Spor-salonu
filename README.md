# Swiss Fit Club — Web Sitesi

Beylikdüzü / Beykent Paradise AVM'deki **Swiss Fit Club** için hazırlanmış, animasyonlu, premium tek sayfa web sitesi.
Marka kimliği (siyah zemin + neon kırmızı, geometrik "W" logo) mevcut siteden ve görsellerden alınmıştır.

## Öne çıkanlar

- **Açılış animasyonu:** logo çizilerek belirir, yüzde sayacı ve perde açılışı.
- **WebGL hero:** fotoğraf üzerinde imleci takip eden dalga/kırılma, renk ayrışması, nefes alan kırmızı neonlar, film greni. WebGL yoksa normal görsele düşer.
- **Akıcı kaydırma** (Lenis) ve GSAP ScrollTrigger ile kaydırmaya bağlı animasyonlar.
- **Kaydırma hızına tepki veren şeritler**, kelime kelime aydınlanan manifesto, sayaçlar.
- **"Neden Swiss Fit":** masaüstünde sabitlenen yatay kaydırma, mobilde parmakla kaydırılan karusel.
- **Bento hizmet kartları:** imleci takip eden ışık ve 3B eğim.
- **2500 m² zoom:** küçük pencereden tam ekrana açılan görsel.
- **Grup dersleri:** kategori filtresi (FLIP animasyonu), açılır satırlar, imleci takip eden görsel önizleme.
- **Canlı çalışma saatleri:** İstanbul saatine göre "Şu an açık/kapalı", kapanışa kalan süre ve haftalık zaman çizelgesi.
- **Üyelik seçici** (Aylık / 3 / 6 / Yıllık) — "Teklif Al" butonu seçili süreyle hazır WhatsApp mesajı açar.
- **İletişim formu sunucu gerektirmez:** bilgiler doğrulanır ve mesaj WhatsApp'ta hazır olarak açılır.
- Özel imleç, mıknatıslı butonlar, tam ekran mobil menü, yüzen Ara / WhatsApp butonları.
- SEO: meta etiketleri, Open Graph görseli, `ExerciseGym` yapısal verisi, `sitemap.xml`, `robots.txt`.
- Erişilebilirlik: anlamsal HTML, klavye ile kullanım, "hareketi azalt" tercihine uyum.

## Kurulum

Node.js 18+ gerekir.

```bash
npm install
npm run dev       # geliştirme sunucusu: http://localhost:5173
npm run build     # yayına hazır dosyalar dist/ klasörüne çıkar
npm run preview   # derlenmiş siteyi yerelde önizle
```

## Yayına alma

`npm run build` sonrası oluşan **`dist/`** klasörünün içeriğini hosting'e (cPanel `public_html`, Netlify, Vercel, Cloudflare Pages vb.) yüklemeniz yeterli.
Yollar göreli olduğundan site alt klasörde de çalışır.

## İçeriği düzenleme

| Ne | Nerede |
| --- | --- |
| Metinler, hizmetler, dersler, SSS, adres | `index.html` |
| Çalışma saatleri (canlı durum + çizelge) | `src/js/hours.js` (ayrıca `index.html` içindeki metinler ve JSON-LD) |
| Üyelik paketlerinin açıklamaları | `src/js/plans.js` |
| WhatsApp numarası | `src/js/utils.js` (`WHATSAPP_NUMBER`) ve `index.html` içindeki `wa.me` bağlantıları |
| Renkler, yazı tipleri, boşluklar | `src/styles/base.css` → `:root` |
| Görseller | `src/assets/images/` (WebP) |

İkonlar derleme sırasında satır içi SVG'ye çevrilir: HTML'de `<i data-icon="dumbbell"></i>` yazmanız yeterli
([Lucide](https://lucide.dev/icons) adları veya `src/icons/` içindeki özel ikonlar).

## Notlar

- Üyelik fiyatları mevcut sitede yayınlanmadığı için "Sana özel teklif" olarak gösteriliyor; fiyat eklenmek istenirse `index.html` → `.plan__price` bölümüne yazılabilir.
- Instagram akışı resmi API anahtarı gerektirdiği için gömülmedi; bölüm profile yönlendirir.
- Görseller mevcut swissfitclub.com sitesinden alınmıştır; kulübün gerçek fotoğraflarıyla değiştirilmesi önerilir.

## Teknolojiler

[Vite](https://vite.dev) · [GSAP](https://gsap.com) (ScrollTrigger, SplitText, Flip) · [Lenis](https://lenis.darkroom.engineering) · saf WebGL · [Lucide](https://lucide.dev) ikonları
