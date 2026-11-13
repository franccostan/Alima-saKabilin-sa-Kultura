(function () {
    'use strict';

    // Work out the gallery folder from this script's own location (<site>/js/gallery.js -> <site>/gallery/),
    // so it works wherever gallery.html lives.
    var self = document.currentScript;
    var BASE = self && self.src ? new URL('../gallery/', self.src).href : '../../gallery/';
    var SECTIONS = ['visitors', 'heritage'];

    var data = { visitors: [], heritage: [] };
    var section = 'visitors';
    var folder = null;

    var grid = document.getElementById('galleryGrid');
    var toolbar = document.getElementById('galleryToolbar');
    var tabs = document.querySelectorAll('.gallery-tab');

    var lb = document.getElementById('lightbox');
    var lbImg = document.getElementById('lbImg');
    var lbCaption = document.getElementById('lbCaption');
    var current = [];
    var index = 0;
    var lbTitle = '';

    function el(tag, cls, text) {
        var e = document.createElement(tag);
        if (cls) e.className = cls;
        if (text !== undefined) e.textContent = text;
        return e;
    }

    function imgUrl(sec, folderName, file) {
        return BASE + sec + '/' + encodeURIComponent(folderName) + '/' + encodeURIComponent(file);
    }

    function go(sec, folderName) {
        location.hash = sec + (folderName ? '/' + encodeURIComponent(folderName) : '');
    }

    function parseHash() {
        var parts = location.hash.replace(/^#/, '').split('/');
        section = SECTIONS.indexOf(parts[0]) > -1 ? parts[0] : 'visitors';
        try {
            folder = parts[1] ? decodeURIComponent(parts[1]) : null;
        } catch (e) {
            folder = null;
        }
    }

    function render() {
        parseHash();
        tabs.forEach(function (t) {
            t.classList.toggle('active', t.dataset.section === section);
        });
        toolbar.innerHTML = '';
        grid.innerHTML = '';

        var list = data[section] || [];
        if (folder) {
            var found = list.filter(function (f) { return f.name === folder; })[0];
            if (found) return renderImages(found);
            folder = null;
        }
        renderFolders(list);
    }

    function plural(n) {
        return n + (n === 1 ? ' photo' : ' photos');
    }

    function renderFolders(list) {
        if (!list.length) {
            grid.appendChild(el('p', 'gallery-empty', 'No galleries here yet. Check back soon!'));
            return;
        }
        list.forEach(function (f) {
            var card = el('button', 'folder-card');
            card.type = 'button';
            var img = el('img');
            img.src = imgUrl(section, f.name, f.images[0]);
            img.alt = f.name;
            img.loading = 'lazy';
            var info = el('div', 'folder-info');
            info.appendChild(el('div', 'folder-name', f.name));
            info.appendChild(el('div', 'folder-count', plural(f.images.length)));
            card.appendChild(img);
            card.appendChild(info);
            card.addEventListener('click', function () { go(section, f.name); });
            grid.appendChild(card);
        });
    }

    function renderImages(f) {
        var back = el('button', 'btn btn-primary py-2 px-3', '\u2190 Back');
        back.type = 'button';
        back.addEventListener('click', function () { go(section); });
        toolbar.appendChild(back);
        toolbar.appendChild(el('h2', '', f.name));
        toolbar.appendChild(el('span', 'count', plural(f.images.length)));

        current = f.images.map(function (file) { return imgUrl(section, f.name, file); });
        current.forEach(function (src, i) {
            var card = el('button', 'photo-card');
            card.type = 'button';
            var img = el('img');
            img.src = src;
            img.alt = f.name + ' ' + (i + 1);
            img.loading = 'lazy';
            card.appendChild(img);
            card.addEventListener('click', function () { openLightbox(i, f.name); });
            grid.appendChild(card);
        });
    }

    /* Lightbox */
    function showLightbox() {
        lbImg.src = current[index];
        lbCaption.textContent = lbTitle + ' \u2022 ' + (index + 1) + ' / ' + current.length;
    }
    function openLightbox(i, title) {
        index = i;
        lbTitle = title;
        showLightbox();
        lb.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
    function closeLightbox() {
        lb.classList.remove('open');
        document.body.style.overflow = '';
    }
    function step(d) {
        index = (index + d + current.length) % current.length;
        showLightbox();
    }

    document.getElementById('lbClose').addEventListener('click', closeLightbox);
    document.getElementById('lbPrev').addEventListener('click', function () { step(-1); });
    document.getElementById('lbNext').addEventListener('click', function () { step(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLightbox(); });
    document.addEventListener('keydown', function (e) {
        if (!lb.classList.contains('open')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') step(-1);
        if (e.key === 'ArrowRight') step(1);
    });

    /* Tabs + routing */
    tabs.forEach(function (t) {
        t.addEventListener('click', function () { go(t.dataset.section); });
    });
    window.addEventListener('hashchange', render);

    function showError(msg) {
        grid.innerHTML = '';
        grid.appendChild(el('p', 'gallery-empty', msg));
    }

    function load(json) {
        data = json;
        render();
    }

    // Load the generated data file ourselves, so it no longer depends on a <script> tag in the HTML.
    if (window.GALLERY_DATA) {
        load(window.GALLERY_DATA);
    } else {
        var s = document.createElement('script');
        s.src = BASE + 'gallery-data.js' + (location.protocol === 'file:' ? '' : '?v=' + Date.now());
        s.onload = function () {
            if (window.GALLERY_DATA) load(window.GALLERY_DATA);
            else showError('gallery-data.js loaded but contains no gallery data. Re-run "node generate-gallery.js".');
        };
        s.onerror = function () {
            showError('Could not load ' + s.src + ' \u2014 check that this file exists (run "node generate-gallery.js" in the site folder).');
        };
        document.head.appendChild(s);
    }
})();
