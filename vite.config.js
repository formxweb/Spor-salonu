import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));

// Replaces <i data-icon="name"></i> with inline SVG at build time (src/icons first, then Lucide).
function inlineIcons() {
  const cache = new Map();

  const load = (name) => {
    if (cache.has(name)) return cache.get(name);
    const candidates = [
      `${root}src/icons/${name}.svg`,
      `${root}node_modules/lucide-static/icons/${name}.svg`,
    ];
    const file = candidates.find((path) => existsSync(path));
    if (!file) throw new Error(`Unknown icon: ${name}`);
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

// The single-file build is opened from disk, so the favicon is embedded and unresolvable links are dropped.
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
  const single = mode === 'single';

  return {
    base: './',
    plugins: single ? [inlineIcons(), inlineFavicon(), viteSingleFile()] : [inlineIcons()],
    build: {
      outDir: single ? 'dist-single' : 'dist',
      assetsInlineLimit: single ? Number.MAX_SAFE_INTEGER : 0,
      copyPublicDir: !single,
    },
  };
});
