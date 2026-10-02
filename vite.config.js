import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));

/**
 * HTML içindeki <i data-icon="isim" class="..."></i> etiketlerini derleme
 * sırasında satır içi SVG'ye çevirir. Önce src/icons klasörüne, sonra
 * lucide-static paketine bakar. Böylece çalışma anında ikon kütüphanesi yüklenmez.
 */
function inlineIcons() {
  const cache = new Map();

  const load = (name) => {
    if (cache.has(name)) return cache.get(name);
    const candidates = [
      `${root}src/icons/${name}.svg`,
      `${root}node_modules/lucide-static/icons/${name}.svg`,
    ];
    const file = candidates.find((path) => existsSync(path));
    if (!file) throw new Error(`İkon bulunamadı: ${name}`);
    const svg = readFileSync(file, 'utf8')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\s*\n\s*/g, ' ')
      .replace(/\s+class="[^"]*"/, '')
      .trim();
    cache.set(name, svg);
    return svg;
  };

  return {
    name: 'inline-icons',
    transformIndexHtml(html) {
      return html.replace(
        /<i data-icon="([\w-]+)"(?: class="([^"]*)")?><\/i>/g,
        (_, name, extra) =>
          load(name).replace(
            '<svg',
            `<svg class="icon${extra ? ` ${extra}` : ''}" aria-hidden="true" focusable="false"`,
          ),
      );
    },
  };
}

/** Tek dosya modunda favicon da HTML'in içine gömülür (çift tıkla açılan sürüm için). */
function inlineFavicon() {
  return {
    name: 'inline-favicon',
    transformIndexHtml(html) {
      const svg = readFileSync(`${root}public/favicon.svg`, 'utf8');
      const dataUri = `data:image/svg+xml,${encodeURIComponent(svg)}`;
      return html
        .replace('href="favicon.svg"', `href="${dataUri}"`)
        .replace(/\s*<link rel="(?:apple-touch-icon|manifest)"[^>]*>/g, '');
    },
  };
}

export default defineConfig(({ mode }) => {
  // `npm run build:single` → tüm CSS, JS ve görseller tek bir HTML dosyasına gömülür.
  const single = mode === 'single';

  return {
    base: './',
    plugins: single ? [inlineIcons(), inlineFavicon(), viteSingleFile()] : [inlineIcons()],
    build: {
      outDir: single ? 'dist-single' : 'dist',
      assetsInlineLimit: single ? Number.MAX_SAFE_INTEGER : 0,
      cssCodeSplit: false,
      copyPublicDir: !single,
    },
  };
});
