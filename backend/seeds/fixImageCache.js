const fs = require('fs');
const path = require('path');

const CACHE_FILE = path.join(__dirname, 'imageCache.json');

function loadJSON(file, fallback) {
    try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

function normaliseQuery(raw) {
    return String(raw || '')
        .replace(/[,;/|]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ')
        .filter(Boolean)
        .slice(0, 4)
        .join(' ');
}

async function findCommonsImage(rawQuery) {
    const key = normaliseQuery(rawQuery);
    if (!key) return '';

    let url = '';
    for (let attempt = 1; attempt <= 3 && !url; attempt++) {
        try {
            const api = 'https://commons.wikimedia.org/w/api.php?action=query&format=json'
                + '&generator=search&gsrnamespace=6&gsrlimit=6&prop=imageinfo'
                + '&iiprop=url&iiurlwidth=900'
                + `&gsrsearch=${encodeURIComponent(key + ' filetype:bitmap')}`;
            const res = await fetch(api, {
                headers: { 'User-Agent': 'EduBook/1.0 (educational prototype; contact: local dev)' },
                signal: AbortSignal.timeout(20000)
            });

            if (res.status === 429 || res.status === 503) {
                await new Promise(r => setTimeout(r, 2500 * attempt));
                continue;
            }

            const json = await res.json();
            const pages = json?.query?.pages ? Object.values(json.query.pages) : [];
            const terms = key.split(/\s+/).filter(w => w.length > 3);
            const scored = pages.map(p => {
                const title = (p.title || '').toLowerCase();
                const ii = p.imageinfo && p.imageinfo[0];
                const thumb = (ii && ii.thumburl) || (ii && ii.url) || '';
                if (!/\.(jpe?g|png|webp)(\?|$)/i.test(thumb)) return null;
                const score = terms.reduce((acc, t) => acc + (title.includes(t) ? 1 : 0), 0);
                return { score, thumb };
            }).filter(Boolean).sort((a, b) => b.score - a.score);

            if (scored.length) url = scored[0].thumb;
            else break;
        } catch {
            await new Promise(r => setTimeout(r, 1200 * attempt));
        }
    }

    return url;
}

async function main() {
    const cache = loadJSON(CACHE_FILE, {});
    const emptyKeys = Object.keys(cache).filter(k => !cache[k]);

    console.log(`Ditemukan ${emptyKeys.length} entry kosong di imageCache.json`);

    for (let i = 0; i < emptyKeys.length; i++) {
        const key = emptyKeys[i];
        console.log(`[${i + 1}/${emptyKeys.length}] Mencari gambar untuk: "${key}"`);

        const url = await findCommonsImage(key);
        if (url) {
            cache[key] = url;
            console.log(`  -> Ditemukan: ${url.substring(0, 80)}...`);
        } else {
            console.log(`  -> Tidak ditemukan, mencoba query alternatif...`);
            const altKey = key.split(',')[0].trim();
            const altUrl = await findCommonsImage(altKey);
            if (altUrl) {
                cache[key] = altUrl;
                console.log(`  -> Ditemukan (alt): ${altUrl.substring(0, 80)}...`);
            } else {
                console.log(`  -> Gagal menemukan gambar`);
            }
        }

        await new Promise(r => setTimeout(r, 500));
    }

    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
    console.log(`\nimageCache.json diperbarui. Total entry: ${Object.keys(cache).length}`);
    console.log(`Entry kosong tersisa: ${Object.keys(cache).filter(k => !cache[k]).length}`);
}

main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
