import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

/* The built site goes to build/output/resume_html/. `build.format: 'file'` emits page-1.html
   rather than page-1/index.html, which keeps the PDF renderer, the artifact bundler, and
   file:// browsing all pointed at flat, predictable filenames. compressHTML stays off so the
   output is diffable against a previous build. */
export default defineConfig({
  outDir: './build/output/resume_html',
  build: { format: 'file' },
  compressHTML: false,
  // The dev toolbar overlays the bottom of the viewport, which sits on top of the rendered
  // sheet and makes it hard to judge page-bottom spacing.
  devToolbar: { enabled: false },
  vite: {
    plugins: [tailwindcss()],
  },
});
