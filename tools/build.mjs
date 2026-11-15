// Bundles site/ into dist/: a normal build (index.html + assets) and a single-file preview
// with everything inlined, placeholders included (dist/preview.html, plus a body-only fragment).
import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const site = path.join(root, 'site'), dist = path.join(root, 'dist');
fs.mkdirSync(dist, { recursive: true });

const js = (await build({ entryPoints: [path.join(site, 'js/main.js')], bundle: true, minify: true, format: 'iife', write: false, target: 'es2020' })).outputFiles[0].text;
const css = (await build({ entryPoints: [path.join(site, 'css/site.css')], bundle: true, minify: true, write: false, loader: { '.css': 'css' } })).outputFiles[0].text;
const tokens = (await build({ entryPoints: [path.join(site, 'css/tokens.css')], minify: true, write: false })).outputFiles[0].text;
const html = fs.readFileSync(path.join(site, 'index.html'), 'utf8');
const body = html.split('<!--BODY-->')[1].split('<!--/BODY-->')[0].replace(/<script type="module"[^>]*><\/script>/, '');
const fonts = html.match(/<link rel="stylesheet" href="https:\/\/fonts[^>]+>/)[0];

// normal build
fs.mkdirSync(path.join(dist, 'assets'), { recursive: true });
fs.writeFileSync(path.join(dist, 'assets/site.js'), js);
fs.writeFileSync(path.join(dist, 'assets/site.css'), tokens + css);
fs.writeFileSync(path.join(dist, 'index.html'), html
  .replace(/<link rel="stylesheet" href="css\/tokens.css">\s*/, '')
  .replace('css/site.css', 'assets/site.css')
  .replace('<script type="module" src="js/main.js"></script>', '<script defer src="assets/site.js"></script>'));

// single-file preview
const phDir = path.join(site, 'placeholder');
const ph = {};
if (fs.existsSync(phDir)) for (const f of fs.readdirSync(phDir)) if (f.endsWith('.jpg')) ph[f.replace('.jpg', '')] = 'data:image/jpeg;base64,' + fs.readFileSync(path.join(phDir, f)).toString('base64');
const fragment = `<title>Cosmin Mann Art</title>
${fonts}
<style>${tokens}${css}</style>
${body}
<script>window.__PH=${JSON.stringify(ph)};</script>
<script>${js}</script>
`;
fs.writeFileSync(path.join(dist, 'preview.fragment.html'), fragment);
fs.writeFileSync(path.join(dist, 'preview.html'), `<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body>${fragment}</body></html>`);
const gz = (await import('node:zlib')).gzipSync(js).length;
console.log(`js ${(js.length / 1024).toFixed(0)} KB (${(gz / 1024).toFixed(0)} KB gzip), css ${(css.length / 1024).toFixed(1)} KB, preview ${(fragment.length / 1024).toFixed(0)} KB`);
