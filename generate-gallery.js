/*
 * Scans /gallery/visitors and /gallery/heritage and writes gallery/gallery.json and gallery/gallery-data.js.
 * Every sub-folder becomes a gallery item; every image inside becomes a photo.
 * Usage (from the site root):  node generate-gallery.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, 'gallery');
const SECTIONS = ['visitors', 'heritage'];
const IMAGE = /\.(jpe?g|png|gif|webp|avif|svg)$/i;
const sorter = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

const out = {};
SECTIONS.forEach((section) => {
  const dir = path.join(ROOT, section);
  out[section] = [];
  if (!fs.existsSync(dir)) return;

  fs.readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort(sorter.compare)
    .forEach((name) => {
      const images = fs.readdirSync(path.join(dir, name))
        .filter((f) => IMAGE.test(f))
        .sort(sorter.compare);
      if (images.length) out[section].push({ name, images });
    });
});

const json = JSON.stringify(out, null, 2);
fs.writeFileSync(path.join(ROOT, 'gallery.json'), json);
// Script-tag version so the gallery also works when index.html is opened directly (file://)
fs.writeFileSync(path.join(ROOT, 'gallery-data.js'), 'window.GALLERY_DATA = ' + json + ';\n');
SECTIONS.forEach((s) => {
  const photos = out[s].reduce((n, f) => n + f.images.length, 0);
  console.log(`${s}: ${out[s].length} folder(s), ${photos} image(s)`);
});
console.log('gallery/gallery.json and gallery/gallery-data.js updated.');
