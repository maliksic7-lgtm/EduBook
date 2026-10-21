/**
 * Membangun katalog sumber referensi untuk seluruh mapel.
 *
 * Hanya/reference yang misichen: judul artikel dicari lewat API Wikipedia dan
 * diverifikasi benar-benar ada sebelum disimpan. Ini jauh lebih cepat dan
 *(andai) lebih bisa dipercaya daripada menebak URL.
 *
 * Jalankan:  node seeds/buildMediaCatalog.js
 * Hasil  :  seeds/mediaCatalog.json
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const SUBJECTS = require('./subjects');

const CACHE_FILE = path.join(__dirname, 'mediaCatalog.json');
const sleep = ms => new Promise(r => setTimeout(r, ms));

function loadCache() {
    try { return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')); } catch { return {}; }
}

/** Fetch JSON dengan penanganan rate-limit + backoff. Wikimedia membalas 429 kalau terlalu cepat. */
async function wikiJson(url, attempt = 1) {
    try {
        const res = await fetch(url, {
            headers: { 'User-Agent': 'EduBook/1.0 (educational prototype)' },
            signal: AbortSignal.timeout(20000)
        });
        if (res.status === 429 || res.status === 503) {
            if (attempt >= 4) return null;
            await sleep(3000 * attempt);
            return wikiJson(url, attempt + 1);
        }
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

/** Satu round: cek apakah artikel dengan judul persis ini ada. */
async function articleExists(title, lang) {
    const url = `https://${lang}.wikipedia.org/w/api.php?action=query&format=json`
        + `&redirects=1&titles=${encodeURIComponent(title)}`;
    const json = await wikiJson(url);
    if (!json) return undefined; // undefined = gagal jaringan/rate limit (bukan "tidak ada")
    const page = Object.values(json?.query?.pages || {})[0];
    if (!page || page.missing !== undefined || !page.pageid) return null; // null = memang tidak ada
    return {
        title: page.title,
        link: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`
    };
}

/** Cari artikel lewat pencarian Wikipedia, ambil yang paling上层o. */
async function searchArticle(term, lang) {
    const url = `https://${lang}.wikipedia.org/w/api.php?action=query&format=json`
        + `&list=search&srsearch=${encodeURIComponent(term)}&srlimit=1`;
    const json = await wikiJson(url);
    if (!json) return undefined;
    const hit = json?.query?.search?.[0];
    return hit ? hit.title : null;
}

// Padanan nama mapel ke istilah yang benar-benar ada di Wikipedia.
const SEARCH_TERMS = {
    ppkn: ['Pancasila', 'Pancasila'],
    bindo: ['Bahasa Indonesia', 'Bahasa Indonesia'],
    mtk: ['Matematika', 'Matematika'],
    ipa: ['Ilmu Pengetahuan Alam', 'Sains'],
    ips: ['Ilmu Pengetahuan Sosial', 'Sains sosial'],
    ipas: ['Ilmu Pengetahuan Alam dan Sosial', 'Sains'],
    bing: ['Bahasa Inggris', 'English language'],
    inf: ['Informatika', 'Informatika'],
    prakarya: ['Keterampilan hidup', 'Kerajinan'],
    seni: ['Seni', 'Seni'],
    pjok: ['Olahraga', 'Pendidikan Jasmani'],
    sejarah: ['Sejarah', 'Sejarah'],
    mipa: ['Matematika', 'Matematika'],
    fisika: ['Fisika', 'Fisika'],
    kimia: ['Kimia', 'Kimia'],
    biologi: ['Biologi', 'Biologi'],
    sosiologi: ['Sosiologi', 'Sosiologi'],
    ekonomi: ['Ekonomi', 'Ekonomi'],
    geografi: ['Geografi', 'Geografi'],
    antropologi: ['Antropologi', 'Antropologi'],
    bahasa: ['Bahasa Indonesia', 'Bahasa'],
    asing: ['Lingua franca', 'Bahasa asing'],
    agama_islam: ['Islam', 'Agama Islam'],
    agama_kristen: ['Kristen', 'Agama Kristen'],
    agama_katolik: ['Katolik', 'Gereja Katolik'],
    agama_hindu: ['Hindu', 'Agama Hindu'],
    agama_buddha: ['Buddha', 'Agama Buddha'],
    agama_khonghucu: ['Taoisme', 'Agama Khonghucu'],
    jaringan: ['Jaringan komputer', 'Jaringan komputer'],
    sistem_operasi: ['Sistem operasi', 'Sistem operasi komputer'],
    perangkat_keras: ['Perangkat keras komputer', 'Komputer'],
    pemrograman: ['Pemrograman komputer', 'Pemrograman komputer'],
    database: ['Basis data', 'Basis data'],
    web: ['Pengembangan web', 'World Wide Web'],
    desain: ['Desain grafis', 'Desain'],
    multimedia: ['Multimedia', 'Multimedia'],
    animasi: ['Animasi', 'Animasi'],
    akuntansi: ['Akuntansi', 'Akuntansi'],
    keuangan: ['Keuangan', 'Ilmu keuangan'],
    perpajakan: ['Pajak', 'Perpajakan'],
    administrasi: ['Administrasi bisnis', 'Administrasi'],
    korrespondensi: ['Surat', 'Korespondensi'],
    kearsipan: ['Arsip', 'Kearsipan'],
    pemasaran: ['Pemasaran', 'Pemasaran'],
    ecommerce: ['Perdagangan elektronik', 'Perdagangan'],
    konten: ['Konten', 'Kreation'],
    mesin: ['Teknik mesin', 'Mesin'],
    kelistrikan: ['Kelistrikan', 'Listrik'],
    chasis: ['Otomotif', 'Body mobil'],
    instalasi: ['Instalasi listrik', 'Kabel listrik'],
    tenaga: ['Tenaga listrik', 'Pembangkit listrik'],
    proteksi: ['Pengaman listrik', 'Fuse'],
    otomotif: ['Teknik otomotif', 'Otomotif'],
    diagnostik: ['Diagnosis', 'Diagnostik'],
    perawatan: ['Perawatan', 'Pemeliharaan'],
    perhotelan: ['Perhotelan', 'Perhotelan'],
    housekeeping: ['Housekeeping', 'Hotel'],
    fb: ['Kuliner', 'Masakan'],
    tata_boga: ['Masakan', 'Kuliner'],
    pastry: ['Pastri', 'Kue'],
    gizi: ['Gizi', 'Gizi'],
    busana: ['Busana', 'Busana'],
    pola: ['Menjahit', 'Jahitan'],
    menjahit: ['Menjahit', 'Jahitan'],
    keperawatan: ['Keperawatan', 'Keperawatan'],
    anatomi: ['Anatomi', 'Anatomi manusia'],
    kesehatan: ['Kesehatan masyarakat', 'Kesehatan'],
    farmasi: ['Farmasi', 'Farmasi'],
    obat: ['Farmakologi', 'Obat'],
    agribisnis: ['Pertanian', 'Pertanian'],
    bubut: ['Mesin bubut', 'Bubut'],
    frais: ['Mesin frais', 'Frais'],
    cnc: ['Mesin perkakas', 'CNC'],
    las: ['Pengelasan', 'Las'],
    pengelasan: ['Pengelasan', 'Las'],
    smaw: ['Pengelasan', 'Las'],
    ototronik: ['Teknik otomotif', 'Otomotif'],
    tsm: ['Sepeda motor', 'Motor'],
    tkp: ['Teknik sipil', 'Konstruksi'],
    konstruksi: ['Konstruksi', 'Teknik sipil'],
    ditf: ['Desain interior', 'Furnitur'],
    geomatika: ['Geodesi', 'Pemetaan'],
    tab: ['Alat berat', 'Ekskavator'],
    mekatronika: ['Mekatronika', 'Robotika'],
    tei: ['Elektronika', 'Elektronika industri'],
    tav: ['Audio video', 'Elektronika'],
    tki: ['Teknik kimia', 'Industri kimia'],
    tet: ['Energi terbarukan', 'Energi surya'],
    tata_kecantikan: ['Tata rias', 'Kecantikan'],
    kecantikan: ['Tata rias', 'Kecantikan'],
    upw: ['Pariwisata', 'Perjalanan wisata'],
    seni_pertunjukan: ['Seni pertunjukan', 'Teater'],
    pertunjukan: ['Seni pertunjukan', 'Teater'],
    broadcasting: ['Penyiaran', 'Televisi'],
    perfilman: ['Perfilman', 'Film'],
    kehutanan: ['Kehutanan', 'Hutan'],
    ternak: ['Peternakan', 'Ternak'],
    perikanan: ['Perikanan', 'Akuakultur'],
    tphp: ['Teknologi pangan', 'Pascapanen'],
    logistik: ['Logistik', 'Manajemen logistik'],
    tlm: ['Teknologi laboratorium medik', 'Laboratorium klinik'],
    dental: ['Kedokteran gigi', 'Gigi']
};

/**iation ordered kandidat istilah dari nama mapel. */
function candidateTerms(subject) {
    const id = subject.subject_id;
    const tokens = id.split('_');

    // 1) Cocokkan token PERSIS dulu. Tanpa ini "sma_mipa_fisika" akan kena key
    //    "ipa" (huruf 'ipa' ada di 'mipa') dan referensi-nya jadi artikel umum.
    for (const token of tokens) {
        if (SEARCH_TERMS[token]) {
            const v = SEARCH_TERMS[token];
            return Array.isArray(v) ? v : [v];
        }
    }

    // 2) Kalau tidak ada, pakai substring tapi urutkan key dari yang paling panjang
    //    supaya key yang lebih spesifik selalu dicek lebih dulu.
    const keys = Object.keys(SEARCH_TERMS).sort((a, b) => b.length - a.length);
    for (const key of keys) {
        if (id.includes(key)) {
            const v = SEARCH_TERMS[key];
            return Array.isArray(v) ? v : [v];
        }
    }

    return [subject.nama];
}

async function resolveSubject(subject) {
    const terms = candidateTerms(subject);
    let networkFailed = false;

    for (const term of terms) {
        const exact = await articleExists(term, 'id');
        if (exact === undefined) networkFailed = true;
        if (exact) {
            return { subject_id: subject.subject_id, nama: subject.nama, reference: { ...exact, author: 'Wikipedia', year: '2025' } };
        }
        const found = await searchArticle(term, 'id');
        if (found === undefined) networkFailed = true;
        if (found) {
            const art = await articleExists(found, 'id');
            if (art) {
                return { subject_id: subject.subject_id, nama: subject.nama, reference: { ...art, author: 'Wikipedia', year: '2025' } };
            }
        }
        await sleep(400); // jeda antar mapel, hjaban rate limit
    }

    // Fallback bahasa Inggris
    const en = await articleExists(subject.nama, 'en');
    if (en) return { subject_id: subject.subject_id, nama: subject.nama, reference: { ...en, author: 'Wikipedia', year: '2025' } };

    return { subject_id: subject.subject_id, nama: subject.nama, reference: null, retry: networkFailed };
}

async function main() {
    const cache = loadCache();
    console.log(`Membangun katalog referensi untuk ${SUBJECTS.length} mapel...`);
    let done = 0;
    let round = 1;
    let pending = SUBJECTS;

    // Beberapa putaran: mapel yang gagal karena rate limit dicoba lagi di ronde berikutnya.
    while (pending.length && round <= 4) {
        console.log(`\nRonde ${round}: ${pending.length} mapel`);
        const stillMissing = [];
        let idx = 0;
        for (const subject of pending) {
            idx++;
            const existing = cache[subject.subject_id];
            if (existing && existing.reference) { done++; continue; }
            const entry = await resolveSubject(subject);
            if (entry.reference) done++;
            else stillMissing.push(subject);
            cache[subject.subject_id] = entry;
            fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
            process.stdout.write(`\r  ${idx}/${pending.length}  ref=${entry.reference ? 'OK' : '---'}  ${subject.subject_id.padEnd(26)}   `);
        }
        process.stdout.write('\n');
        pending = stillMissing;
        round++;
        if (pending.length) await sleep(5000); //Istirahat sejenak sebelum ronde berikutnya
    }

    const all = Object.values(cache);
    console.log(`\n  dengan referensi tervalidasi: ${all.filter(e => e.reference).length}/${SUBJECTS.length}`);
    if (pending.length) console.log(`  masih tanpa referensi (${pending.length}): ${pending.map(s => s.subject_id).join(', ')}`);
    console.log(`  ditulis ke ${CACHE_FILE}`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
