// mediaService.js
// - Ilustrasi halaman buku: cari gambar yang relevan dari Wikipedia/Commons
//   (gratis, hasil nyata & sesuai topik), cache ke disk, fallback SVG cover.
//   Bingung? Tidak: 1) artikel Wikipedia (id lalu en) -> 2) Commons search ->
//   3) SVG cover judul halaman (selalu cocok karena memuat judul).
// - Video pembelajaran: cari via yt-dlp (tanpa API key), hasil disimpan ke DB.

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');
const Book = require('../models/Book');

const ILLUSTRATION_DIR = path.join(__dirname, '..', 'public', 'illustrations');
fs.mkdirSync(ILLUSTRATION_DIR, { recursive: true });

const YTDLP = path.join(__dirname, '..', 'tools', 'yt-dlp.exe');
const WIKI_UA = 'EduBookBot/1.0 (aplikasi edukasi; kontak: admin-edubook@example.com)';
const DOWNLOAD_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) EduBookBot/1.0';

const imgInflight = new Map();
const imgNegative = new Map();
const videoInflight = new Map();
const videoNegative = new Map();
const NEGATIVE_TTL = 5 * 60 * 1000;

function keyFor(book) {
    return `${book.subject_id}_k${book.kelas}_p${book.page_number}`;
}

function fileFor(book) {
    return path.join(ILLUSTRATION_DIR, keyFor(book) + '.jpg');
}

function metaFileFor(book) {
    return path.join(ILLUSTRATION_DIR, keyFor(book) + '.json');
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

const STOPWORDS = new Set(['yang', 'dan', 'untuk', 'dengan', 'pada', 'kelas', 'materi', 'smp', 'sma', 'smk', 'sd', 'bab', 'kurikulum', 'tema', 'unit', 'dalam', 'dari', 'the', 'and', 'with', 'for', 'part', 'texts', 'text', 'dalam', 'serta', 'atau', 'dasar', 'lanjut', 'mengenal', 'memahami', 'pengenalan', 'penerapan', 'pentingnya', 'konsep', 'teknik', 'proses', 'struktur', 'aktivitas', 'latihan', 'praktik', 'contoh', 'tentang', 'secara', 'kegiatan', 'pembelajaran', 'penyusunan', 'pengelolaan', 'manajemen', 'panduan', 'langkah', 'macam', 'jenis', 'bagian', 'berbagai', 'menggunakan', 'membuat', 'menyusun', 'menerapkan', 'memilih', 'tingkat', 'eksplorasi', 'bermain', 'memainkan', 'bernyanyi', 'menyanyikan', 'menggambar', 'mewarnai', 'menari', 'mengamati', 'mempraktikkan', 'mendemonstrasikan', 'menampilkan', 'menghayati', 'merancang', 'merawat', 'menjaga', 'memenuhi', 'mengelola', 'menyajikan', 'mengembangkan', 'membangun', 'memahami']);

function tokenize(text) {
    return String(text || '')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase().replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length >= 4 && !STOPWORDS.has(w));
}

function coreKeywords(title) {
    return tokenize(title);
}

// Kamus frasa (dicek dulu, paling panjang menang) lalu kata tunggal.
const TOPIC_DICT = {
    'bentuk aljabar': 'algebraic expression', 'persamaan linear': 'linear equation',
    'pertidaksamaan linear': 'linear inequality', 'operasi hitung': 'arithmetic operations',
    'bilangan bulat': 'integer numbers', 'bilangan pecahan': 'fractions mathematics',
    'bangun datar': 'plane shapes geometry', 'bangun ruang': 'solid geometry shapes',
    'garis dan sudut': 'lines and angles', 'teorema pythagoras': 'pythagorean theorem',
    'statistika': 'statistics chart', 'peluang': 'probability dice', 'himpunan': 'set theory venn',
    'perbandingan': 'ratio proportion', 'skala': 'map scale', 'aritmetika sosial': 'social arithmetic money',
    'operasi': 'operation', 'operasinya': 'operation', 'fungsi': 'function graph math',
    'fungsi kuadrat': 'quadratic function', 'barisan': 'sequence series math', 'deret': 'series math',
    'logaritma': 'logarithm', 'eksponen': 'exponent math', 'trigonometri': 'trigonometry',
    'vektor': 'vector math', 'matriks': 'matrix math', 'program linear': 'linear programming',
    'limit': 'limit calculus', 'turunan': 'derivative calculus', 'integral': 'calculus integral',
    'persamaan': 'equation math', 'pertidaksamaan': 'inequality math', 'relasi': 'relation function math',
    'pola bilangan': 'number pattern sequence', 'perubahan': 'changes transformation',
    'aljabar': 'algebra', 'pecahan': 'fraction', 'bilangan': 'numbers', 'matematika': 'mathematics',
    'zat dan perubahannya': 'matter and its changes', 'suhu kalor': 'heat temperature',
    'pemuaian': 'thermal expansion', 'gaya dan gerak': 'force and motion', 'gerak benda': 'motion object',
    'pesawat sederhana': 'simple machines', 'tekanan': 'pressure physics', 'getaran': 'vibration',
    'gelombang': 'wave physics', 'bunyi': 'sound wave', 'cahaya': 'light optics', 'alat optik': 'optical instrument',
    'listrik': 'electricity', 'magnet': 'magnet', 'energi': 'energy', 'usaha dan energi': 'work and energy',
    'tata surya': 'solar system', 'bumi': 'earth planet', 'cuaca': 'weather', 'iklim': 'climate',
    'ekosistem': 'ecosystem', 'lingkungan': 'environment nature', 'pencemaran': 'pollution',
    'klasifikasi makhluk hidup': 'classification living things', 'sel': 'cell biology',
    'tumbuhan': 'plants', 'hewan': 'animals', 'fotosintesis': 'photosynthesis',
    'sistem pencernaan': 'human digestive system', 'sistem pernapasan': 'human respiratory system',
    'peredaran darah': 'human circulatory system', 'sistem gerak': 'human skeletal system',
    'reproduksi': 'human reproduction', 'pubertas': 'puberty', 'gizi': 'nutrition food',
    'kesehatan': 'health', 'penyakit': 'disease', 'imun': 'immune system',
    'unsur': 'chemical element', 'senyawa': 'chemical compound', 'campuran': 'mixture chemistry',
    'asam basa': 'acid base chemistry', 'reaksi kimia': 'chemical reaction', 'tabel periodik': 'periodic table',
    'larutan': 'solution chemistry', 'atom': 'atom', 'ikatan kimia': 'chemical bond',
    'teks narasi': 'narrative story text', 'cerita': 'story telling', 'dongeng': 'fairy tale',
    'puisi': 'poem poetry', 'pantun': 'pantun rhyme', 'syair': 'poem verse', 'reportase': 'news report',
    'wawancara': 'interview', 'iklan': 'advertisement poster', 'slogan': 'slogan poster',
    'surat': 'letter writing', 'prosedur': 'procedure steps tutorial', 'eksposisi': 'exposition essay',
    'argumentasi': 'argumentation debate', 'deskripsi': 'description', 'resensi': 'book review',
    'pidato': 'speech podium', 'diskusi': 'discussion group', 'debat': 'debate',
    'daily routines': 'daily routine activities', 'telling time': 'clock time', 'greeting': 'greeting people',
    'introducing': 'introduction people', 'descriptive': 'describing people', 'recount': 'recount text',
    'procedure text': 'procedure text recipe', 'narrative text': 'narrative text story',
    'announcement': 'announcement board', 'invitation': 'invitation card', 'letter': 'letter writing',
    'pancasila': 'pancasila garuda', 'norma': 'social norms', 'hak dan kewajiban': 'rights and obligations',
    'kewarganegaraan': 'citizenship', 'demokrasi': 'democracy voting', 'ham': 'human rights',
    'keberagaman': 'indonesian diversity culture', 'gotong royong': 'gotong royong community',
    'integrasi nasional': 'national integration indonesia', 'otonomi daerah': 'regional autonomy',
    'ekonomi': 'economy business', 'pasar': 'market economy', 'keuangan': 'finance money',
    'pajak': 'tax', 'perdagangan': 'trade', 'koperasi': 'cooperative indonesia',
    'sejarah': 'history', 'kerajaan': 'kingdom temple', 'hindu buddha': 'hindu buddhist temple indonesia',
    'islam': 'islamic history mosque', 'kolonial': 'colonial history indonesia', 'kemerdekaan': 'indonesian independence',
    'perang dunia': 'world war', 'orde baru': 'indonesian history', 'reformasi': 'indonesian reformation',
    'peta': 'map', 'geografi': 'geography', 'benua': 'continent', 'samudra': 'ocean',
    'negara': 'country', 'asean': 'asean countries', 'globalisasi': 'globalization world',
    'penduduk': 'population', 'migrasi': 'migration', 'sumber daya': 'natural resources',
    'seni': 'art', 'ragam hias': 'ornament batik pattern', 'motif': 'motif pattern',
    'lukisan': 'painting', 'patung': 'sculpture', 'batik': 'batik', 'tenun': 'woven fabric',
    'tari': 'traditional dance', 'musik': 'music instrument', 'lagu': 'song singing',
    'alat musik': 'musical instrument', 'teater': 'theater stage', 'pameran': 'art exhibition',
    'pjok': 'sport physical education', 'sepak bola': 'soccer football', 'bola voli': 'volleyball',
    'bola basket': 'basketball', 'bulu tangkis': 'badminton', 'atletik': 'athletics running',
    'renang': 'swimming', 'senam': 'gymnastics', 'pencak silat': 'pencak silat martial arts',
    'kebugaran': 'fitness exercise', 'komputer': 'computer', 'jaringan komputer': 'computer network',
    'internet': 'internet', 'algoritma': 'algorithm flowchart', 'pemrograman': 'programming code',
    'data': 'data chart', 'spreadsheet': 'spreadsheet table', 'presentasi': 'presentation slide',
    'keamanan digital': 'digital security padlock', 'media sosial': 'social media',
    'perkakas': 'engineering tools', 'gambar teknik': 'technical drawing', 'mesin': 'machine',
    'kelistrikan': 'electrical wiring', 'elektronika': 'electronics circuit', 'las': 'welding',
    'bubut': 'lathe machine', 'frais': 'milling machine', 'otomotif': 'automotive engine',
    'sepeda motor': 'motorcycle', 'mobil': 'car engine', 'bangunan': 'building construction',
    'furniture': 'woodworking furniture', 'jahit': 'sewing', 'kecantikan': 'beauty salon',
    'kuliner': 'culinary cooking', 'perhotelan': 'hotel reception', 'pariwisata': 'tourism travel',
    'keperawatan': 'nursing care', 'farmasi': 'pharmacy medicine', 'agribisnis': 'agriculture farming',
    'upanishad': 'upanishad hindu scripture', 'upanisad': 'upanishad hindu scripture',
    'wedā': 'vedas hindu', 'veda': 'vedas hindu', 'hindu': 'hinduism', 'buddha': 'buddhism',
    'yoga': 'yoga', 'puja': 'hindu worship', 'tri hita karana': 'tri hita karana',
    'iman': 'faith religion', 'akhlak': 'islamic morality', 'salat': 'islamic prayer',
    'zakat': 'zakat charity', 'puasa': 'ramadan fasting', 'haji': 'hajj mecca',
    'alkitab': 'bible', 'doa': 'prayer', 'gereja': 'church', 'natal': 'christmas',
    'paskah': 'easter', 'persekutuan': 'fellowship church',
    'tata panggung': 'stage theater design', 'seni pertunjukan': 'performing arts',
    'tata rias': 'makeup face art', 'tata busana': 'fashion dress design',
    'panggung': 'stage theater', 'desain': 'design', 'kemasan': 'packaging product',
    'notula': 'meeting minutes notes', 'rapat': 'business meeting',
    'pengukuran': 'measurement instrument', 'presisi': 'precision instrument',
    'hijaiyah': 'arabic hijaiyah letters', 'anemia': 'anemia blood',
    'stunting': 'stunting child growth', 'senam lantai': 'floor gymnastics',
    'florikultura': 'floriculture flowers', 'hidroponik': 'hydroponics plants',
    'pupuk': 'fertilizer plants', 'hama': 'pest insect plant',
    'budidaya': 'cultivation farming', 'peternakan': 'livestock farming',
    'perikanan': 'fish farming aquaculture', 'perkebunan': 'plantation crops',
    'tanaman pangan': 'food crops', 'tanaman hias': 'ornamental plants',
    'tata krama': 'etiquette manners', 'rotasi': 'rotation physics',
    'kesetimbangan': 'equilibrium physics', 'benda tegar': 'rigid body physics',
    'transmisi': 'transmission signal', 'saraf': 'nervous system nerve',
    'bioelektrisitas': 'bioelectricity', 'etos kerja': 'work ethic',
    'kerajinan': 'handicraft craft', 'kewirausahaan': 'entrepreneurship business',
    'wirausaha': 'entrepreneurship business', 'pemasaran': 'marketing',
    'perkantoran': 'office administration', 'akuntansi': 'accounting bookkeeping',
    'logistik': 'logistics warehouse', 'gudang': 'warehouse storage',
    'kasir': 'cashier retail', 'bisnis': 'business', 'promosi': 'promotion advertising',
    'pariwisata': 'tourism travel destination', 'wisata': 'tourism destination',
    'pola irama': 'rhythm pattern music', 'irama': 'rhythm music', 'ketukan': 'musical beat',
    'boneka': 'puppet doll', 'warna primer': 'primary colors', 'warna': 'colors palette',
    'gradasi': 'color gradient', 'menggambar bentuk': 'drawing shapes', 'anyaman': 'woven craft',
    'membatik': 'batik making', 'kolase': 'collage art', 'origami': 'origami paper craft',
    'pubertas': 'puberty adolescent', 'menstruasi': 'menstruation health', 'imunisasi': 'immunization vaccine',
    'kesehatan reproduksi': 'reproductive health', 'napza': 'drug abuse prevention',
    'rokok': 'smoking cigarette', 'narkoba': 'drugs narcotics',
    'pengelasan': 'welding steel sparks', 'smaw': 'shielded metal arc welding', 'mig': 'MIG welding machine', 'tig': 'TIG welding',
    'mesin bubut': 'lathe machine workshop', 'mesin frais': 'milling machine workshop', 'cnc': 'CNC machine control',
    'ototronik': 'car electronic control unit', 'motor bensin': 'gasoline engine', 'injeksi': 'fuel injection engine',
    'servis sepeda motor': 'motorcycle repair workshop', 'chasis': 'car chassis suspension',
    'konstruksi': 'building construction site', 'perumahan': 'residential house construction', 'beton': 'concrete construction',
    'pondasi': 'building foundation', 'besi': 'steel rebar construction', 'kayu': 'wood timber workshop',
    'interior': 'interior design room', 'furnitur': 'furniture woodworking', 'ukir': 'wood carving craft',
    'geomatika': 'surveying instrument geodesy', 'survei': 'land surveying instrument', 'pemetaan': 'mapping cartography',
    'theodolite': 'theodolite surveying', 'alat berat': 'heavy equipment excavator', 'excavator': 'excavator digging',
    'mekatronika': 'mechatronics robotics arm', 'robotik': 'robotics automation', 'plc': 'programmable logic controller',
    'pneumatik': 'pneumatic cylinder', 'hidrolik': 'hydraulic machinery', 'sensor': 'electronic sensor',
    'elektronika industri': 'industrial electronics panel', 'motor listrik': 'electric motor', 'generator': 'electric generator',
    'inverter': 'power inverter electronic', 'audio video': 'audio video equipment', 'amplifier': 'audio amplifier',
    'radio': 'radio broadcasting studio', 'televisi': 'television broadcast', 'kimia industri': 'chemical industry plant',
    'reaktor': 'chemical reactor', 'destilasi': 'distillation apparatus', 'laboratorium': 'laboratory glassware',
    'energi terbarukan': 'renewable energy solar panel', 'panel surya': 'solar panel installation', 'turbin': 'wind turbine',
    'biomassa': 'biomass energy plant', 'tata rias': 'makeup artistry', 'hairdo': 'hair styling salon',
    'skincare': 'skincare beauty products', 'salon': 'beauty salon interior', 'perjalanan wisata': 'travel agency tour',
    'tour guide': 'tour guide tourism', 'hotel': 'hotel lobby reception', 'reservasi': 'hotel reservation desk',
    'tata cahaya': 'stage lighting', 'tata suara': 'stage sound system', 'koreografi': 'dance choreography',
    'animasi 2d': '2d animation drawing', 'animasi 3d': '3d animation computer', 'storyboard': 'storyboard sketch',
    'kamera': 'video camera filming', 'videografi': 'videography camera', 'penyiaran': 'broadcast studio television',
    'perfilman': 'film production clapperboard', 'hutan': 'forest trees indonesia', 'reboisasi': 'tree planting reforestation',
    'konservasi': 'nature conservation forest', 'ternak': 'livestock farm cattle', 'sapi': 'cattle cow farm',
    'ayam': 'chicken poultry farm', 'kandang': 'animal barn farm', 'akuakultur': 'aquaculture fish farming',
    'kolam': 'fish pond aquaculture', 'pascapanen': 'post harvest agriculture', 'pengolahan pangan': 'food processing factory',
    'fermentasi': 'food fermentation', 'pengemasan': 'food packaging product', 'rantai pasok': 'supply chain warehouse',
    'ekspedisi': 'freight truck logistics', 'forklift': 'forklift warehouse', 'mikroskop': 'microscope laboratory',
    'hematologi': 'blood test laboratory', 'mikrobiologi': 'microbiology petri dish', 'gigi': 'dental teeth care',
    'dental': 'dental clinic equipment', 'bisnis digital': 'e-commerce online shopping', 'startup': 'startup business team',
    'digital marketing': 'digital marketing analytics'
};

function topicQuery(book) {
    let text = ' ' + String(book.title || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ') + ' ';
    const phrases = [];
    const keys = Object.keys(TOPIC_DICT).sort((a, b) => b.length - a.length);
    for (const ph of keys) {
        const needle = ' ' + ph + ' ';
        if (text.includes(needle)) {
            phrases.push(TOPIC_DICT[ph]);
            text = text.split(needle).join(' ');
        }
    }
    const core = coreKeywords(book.title);
    let allowed = Array.from(new Set([...core, ...tokenize(phrases.join(' '))]));
    if (allowed.length === 0) {
        allowed = Array.from(new Set(String(book.title || '').toLowerCase().normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length >= 4)));
    }
    const queryPhrases = [...phrases];
    const sid = String(book.subject_id || '').toLowerCase();
    for (const [re, hint] of SUBJECT_HINTS) {
        if (re.test(sid)) { queryPhrases.push(hint); break; }
    }
    return { core, phrases, queryPhrases, allowed };
}

function stem(w) {
    let s = w;
    const prefixes = ['meny', 'meng', 'mem', 'peny', 'peng', 'pem', 'men', 'pen', 'ber', 'ter', 'per', 'di', 'ke', 'se'];
    for (const p of prefixes) {
        if (s.startsWith(p) && s.length - p.length >= 4) { s = s.slice(p.length); break; }
    }
    const suffixes = ['kan', 'nya', 'an', 'i'];
    for (const suf of suffixes) {
        if (s.endsWith(suf) && s.length - suf.length >= 4) { s = s.slice(0, -suf.length); break; }
    }
    return s;
}

function matchCount(coreWords, candidateTitle) {
    if (!coreWords || coreWords.length === 0) return 0;
    const have = tokenize(candidateTitle);
    let n = 0;
    for (const want of coreWords) {
        const wStem = stem(want);
        let hit = false;
        for (const w of have) {
            if (w === want) { hit = true; break; }
            if (want.length >= 5 && w.length >= 5 && (w.startsWith(want.slice(0, 5)) || want.startsWith(w.slice(0, 5)))) { hit = true; break; }
            const hStem = stem(w);
            if (hStem === wStem) { hit = true; break; }
            if (hStem.length >= 4 && wStem.length >= 4 && (hStem.startsWith(wStem.slice(0, 4)) || wStem.startsWith(hStem.slice(0, 4)))) { hit = true; break; }
        }
        if (hit) n++;
    }
    return n;
}

function pickScored(cands, maxOut) {
    if (cands.length === 0) return [];
    cands.sort((a, b) => b.score - a.score);
    const min = cands[0].score >= 2 ? 2 : 1;
    return cands.filter(c => c.score >= min).slice(0, maxOut);
}

const SUBJECT_HINTS = [
    [/tkj|rpl|informatika|multimedia|animasi|dkv|komputer|sija|broadcasting|perfilman/, 'computer technology'],
    [/ipa|ipas|biologi/, 'biology'],
    [/smk_(tlm|dental)|keperawatan|farmasi/, 'health medical laboratory'],
    [/smk_(kehutanan|ternak|perikanan|tphp)|agribisnis/, 'agriculture farming indonesia'],
    [/smk_(pemesinan|pengelasan|otoronik|tsm|tab|mekatronika)|tkr|tmo/, 'engineering workshop machine'],
    [/smk_(tei|tav|tet)|itl/, 'electronics electrical engineering'],
    [/smk_(tkp|ditf|geomatika)/, 'construction surveying building'],
    [/smk_tki/, 'chemical industry laboratory'],
    [/smk_tata_kecantikan/, 'beauty salon cosmetics'],
    [/smk_upw|perhotelan/, 'tourism hotel indonesia'],
    [/smk_seni_pertunjukan/, 'performing arts stage'],
    [/smk_(logistik|bd|ak|otkp)/, 'business logistics office']
];

// ==== Akses API Wikimedia: serialisasi + hormati rate limit (429) ====
let lastWikiReq = 0;
async function wikiJson(url) {
    for (let attempt = 1; attempt <= 3; attempt++) {
        const gap = Math.max(0, 1150 - (Date.now() - lastWikiReq));
        if (gap > 0) await sleep(gap);
        lastWikiReq = Date.now();
        try {
            const res = await fetch(url, { headers: { 'User-Agent': WIKI_UA } });
            if (res.status === 429) { await sleep(4000 * attempt); continue; }
            if (!res.ok) return null;
            return await res.json();
        } catch (e) {
            if (attempt === 3) return null;
            await sleep(1500 * attempt);
        }
    }
    return null;
}

async function wikiPageImages(lang, query, allowed) {
    const url = `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&origin=*` +
        '&generator=search&gsrlimit=8&gsrsearch=' + encodeURIComponent(query) +
        '&prop=pageimages&piprop=thumbnail&pithumbsize=1000';
    const j = await wikiJson(url);
    const pages = Object.values((j && j.query && j.query.pages) || {});
    pages.sort((a, b) => (a.index || 9) - (b.index || 9));
    const cands = [];
    for (const p of pages) {
        if (!p.thumbnail || !p.thumbnail.source) continue;
        const score = matchCount(allowed, p.title);
        if (score < 1) continue;
        cands.push({
            score,
            img: p.thumbnail.source,
            credit: `Wikipedia: ${p.title}`,
            page: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(p.title)}`,
            source: `${lang}.wikipedia.org`
        });
    }
    return pickScored(cands, 3);
}

async function findWikipediaImage(book, subjectName) {
    const { core, queryPhrases, allowed } = topicQuery(book);
    if (allowed.length === 0) return [];
    const coreTop = core.slice(0, 4).join(' ');
    const coreAll = core.join(' ');
    const idVariants = [];
    if (coreTop) idVariants.push(coreTop);
    if (coreAll && coreAll !== coreTop) idVariants.push(coreAll);
    for (const q of idVariants) {
        const out = await wikiPageImages('id', q, allowed);
        if (out.length > 0) return out;
    }
    const enVariants = [];
    if (queryPhrases.length > 0) {
        const joined = queryPhrases.join(' ');
        enVariants.push(joined);
        const first = queryPhrases[0].split(' ').slice(0, 4).join(' ');
        if (first && first !== joined) enVariants.push(first);
    }
    for (const q of enVariants) {
        const out = await wikiPageImages('en', q, allowed);
        if (out.length > 0) return out;
    }
    return [];
}

async function findCommonsImage(book) {
    const { core, queryPhrases, allowed } = topicQuery(book);
    if (allowed.length === 0) return [];
    const variants = [];
    const seenQuery = new Set();
    for (const ph of queryPhrases.slice(0, 2)) {
        if (!seenQuery.has(ph)) { variants.push(ph); seenQuery.add(ph); }
    }
    if (queryPhrases.length > 1) {
        const joined = queryPhrases.slice(0, 2).join(' ');
        if (!seenQuery.has(joined)) { variants.push(joined); seenQuery.add(joined); }
    }
    const coreTop = core.slice(0, 3).join(' ');
    if (coreTop && !seenQuery.has(coreTop)) { variants.push(coreTop); seenQuery.add(coreTop); }
    const out = [];
    const seen = new Set();

    for (const q of variants.slice(0, 3)) {
        const url = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*' +
            '&generator=search&gsrnamespace=6&gsrlimit=10' +
            '&gsrsearch=' + encodeURIComponent('filetype:bitmap ' + q) +
            '&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=1000';
        const j = await wikiJson(url);
        const pages = Object.values((j && j.query && j.query.pages) || {});
        pages.sort((a, b) => (a.index || 9) - (b.index || 9));
        for (const p of pages) {
            const ii = (p.imageinfo || [])[0];
            if (!ii || !ii.thumburl || !/jpeg|png/i.test(ii.mime || '')) continue;
            if (!ii.width || ii.width < 500) continue;
            const ratio = ii.width / (ii.height || 1);
            if (ratio < 0.55 || ratio > 2.2) continue;
            const score = matchCount(allowed, String(p.title).replace(/^File:/, ''));
            if (score < 1) continue;
            const key = ii.thumburl;
            if (seen.has(key)) continue;
            seen.add(key);
            out.push({
                score,
                img: ii.thumburl,
                credit: `Wikimedia Commons: ${String(p.title).replace(/^File:/, '')}`,
                page: ii.descriptionurl || 'https://commons.wikimedia.org',
                source: 'commons.wikimedia.org'
            });
        }
        if (out.some(c => c.score >= 2)) break;
    }
    return pickScored(out, 3);
}

async function findOpenverseImage(book) {
    const { core, queryPhrases, allowed } = topicQuery(book);
    if (allowed.length === 0) return [];
    const variants = [];
    const seenQuery = new Set();
    for (const ph of queryPhrases.slice(0, 2)) {
        if (!seenQuery.has(ph)) { variants.push(ph); seenQuery.add(ph); }
    }
    const coreTop = core.slice(0, 3).join(' ');
    if (coreTop && !seenQuery.has(coreTop)) { variants.push(coreTop); seenQuery.add(coreTop); }
    const hits = [];
    for (const q of variants.slice(0, 3)) {
        try {
            const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(q)}&page_size=10&mature=false`;
            const r = await fetch(url, { headers: { 'User-Agent': WIKI_UA } });
            if (!r.ok) continue;
            const j = await r.json();
            for (const x of (j.results || [])) {
                if (!x.url) continue;
                if (x.width && x.width < 500) continue;
                const h = x.height || (x.width || 1000) / 1.5;
                const ratio = (x.width || 1000) / h;
                if (ratio < 0.55 || ratio > 2.2) continue;
                const label = (x.title || '') + ' ' + (x.tags || []).map(t => t.name).join(' ');
                const score = matchCount(allowed, label);
                if (score < 1) continue;
                hits.push({
                    score,
                    img: x.url,
                    credit: `${x.title || 'Foto'}${x.creator ? ' oleh ' + x.creator : ''} (${(x.license || 'CC').toUpperCase()}, Openverse)`,
                    page: x.foreign_landing_url || x.url,
                    source: 'openverse.org'
                });
            }
            if (hits.some(h => h.score >= 2)) break;
        } catch (e) { /* lanjut query berikutnya */ }
    }
    return pickScored(hits, 1);
}

async function downloadImage(url) {
    for (let attempt = 1; attempt <= 2; attempt++) {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), 45000);
        try {
            const res = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': DOWNLOAD_UA } });
            if (res.status === 429 && attempt === 1) {
                clearTimeout(t);
                await sleep(6000);
                continue;
            }
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const type = res.headers.get('content-type') || '';
            if (!type.includes('image') && !type.includes('octet-stream')) throw new Error('bukan gambar: ' + type);
            const buf = Buffer.from(await res.arrayBuffer());
            if (buf.length < 4000) throw new Error('terlalu kecil: ' + buf.length);
            return buf;
        } catch (e) {
            if (attempt === 2) throw e;
            await sleep(3000);
        } finally {
            clearTimeout(t);
        }
    }
}

// Mengembalikan { file } bila gambar siap di disk, atau null (pakai SVG cover).
async function getIllustration(book, subjectName) {
    const k = keyFor(book);
    const file = fileFor(book);
    if (fs.existsSync(file)) return { file };

    const failAt = imgNegative.get(k);
    if (failAt && Date.now() - failAt < NEGATIVE_TTL) return null;

    if (imgInflight.has(k)) return imgInflight.get(k);

    const p = (async () => {
        try {
            const candidates = [];
            candidates.push(...await findWikipediaImage(book, subjectName));
            if (candidates.length === 0) candidates.push(...await findCommonsImage(book));
            if (candidates.length === 0) candidates.push(...await findOpenverseImage(book));
            if (candidates.length === 0) {
                imgNegative.set(k, Date.now());
                console.error(`[media] Tanpa kandidat ${k} | ${book.title}`);
                return null;
            }
            let found = null, buf = null;
            for (const cand of candidates.slice(0, 3)) {
                try {
                    buf = await downloadImage(cand.img);
                    found = cand;
                    break;
                } catch (e) {
                    console.error(`[media] Download gagal ${k} (${cand.credit}): ${e.message}`);
                }
            }
            if (!found || !buf) {
                imgNegative.set(k, Date.now());
                return null;
            }
            await fsp.writeFile(file, buf);
            await fsp.writeFile(metaFileFor(book), JSON.stringify({
                credit: found.credit,
                source_url: found.page,
                source: found.source
            }, null, 1));
            imgNegative.delete(k);
            try {
                await Book.updateOne({ _id: book._id }, { $set: { image_credit: found.credit, image_source_url: found.page } });
            } catch (e) { /* best effort */ }
            return { file };
        } catch (e) {
            imgNegative.set(k, Date.now());
            console.error(`[media] Ilustrasi gagal ${k}: ${e.message}`);
            return null;
        } finally {
            imgInflight.delete(k);
        }
    })();
    imgInflight.set(k, p);
    return p;
}

function readIllustrationMeta(book) {
    try {
        const raw = fs.readFileSync(metaFileFor(book), 'utf8');
        return JSON.parse(raw);
    } catch (e) {
        return null;
    }
}

function emojiFor(subjectId) {
    const s = (subjectId || '').toLowerCase();
    const table = [
        ['fisika', '⚛️'], ['kimia', '🧪'], ['biologi', '🧬'], ['matematika', '🔢'],
        ['bing', '🔤'], ['bahasa_inggris', '🔤'], ['indonesia', '📚'], ['bahasa_indonesia', '📚'],
        ['ipa', '🔬'], ['ipas', '🔬'], ['pjok', '⚽'], ['seni', '🎨'], ['prakarya', '🛠️'],
        ['pkn', '⚖️'], ['ppkn', '⚖️'], ['sejarah', '🏛️'], ['geografi', '🌏'], ['ekonomi', '💰'],
        ['sosiologi', '👥'], ['informatika', '💻'], ['tik', '💻'], ['tkj', '🖥️'], ['rpl', '💻'],
        ['dkv', '🎨'], ['akuntansi', '🧾'], ['pai', '🕌'], ['agama', '🕌'], ['hindu', '🕉️'],
        ['buddha', '☸️'], ['kristen', '✝️'], ['katolik', '✝️'], ['khonghucu', '☯️'],
        ['bahasa', '🗣️'], ['peminatan', '🎓'], ['kejuruan', '🏭'], ['mulok', '📖']
    ];
    for (const [frag, emoji] of table) {
        if (s.includes(frag)) return emoji;
    }
    return '📖';
}

function hashPick(str, arr) {
    const h = parseInt(crypto.createHash('md5').update(str || 'x').digest('hex').slice(0, 8), 16);
    return arr[h % arr.length];
}

function escapeXml(t) {
    return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function wrapText(text, perLine, maxLines) {
    const words = String(text).split(/\s+/);
    const lines = [];
    let cur = '';
    for (const w of words) {
        if ((cur + ' ' + w).trim().length > perLine) {
            if (cur) lines.push(cur.trim());
            cur = w;
            if (lines.length >= maxLines) break;
        } else {
            cur = (cur + ' ' + w).trim();
        }
    }
    if (cur && lines.length < maxLines) lines.push(cur.trim());
    return lines;
}

// Cover SVG (selalu cocok karena memuat judul halaman) — fallback bila tidak ada gambar.
function svgCover(book, subjectName) {
    const palettes = [
        ['#6366f1', '#8b5cf6'], ['#0ea5e9', '#22d3ee'], ['#f59e0b', '#f97316'],
        ['#10b981', '#34d399'], ['#ec4899', '#f472b6'], ['#14b8a6', '#06b6d4']
    ];
    const [c1, c2] = hashPick(book.subject_id + book.title, palettes);
    const emoji = emojiFor(book.subject_id);
    const titleLines = wrapText(book.title || 'Materi', 24, 3);
    const titleSvg = titleLines.map((line, i) =>
        `<text x="512" y="${390 + i * 54}" font-family="Segoe UI, Arial, sans-serif" font-size="44" font-weight="bold" fill="#ffffff" text-anchor="middle">${escapeXml(line)}</text>`
    ).join('');
    const label = escapeXml(`${subjectName || book.subject_id} · Kelas ${book.kelas} · Hal ${book.page_number}`);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 576">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="576" fill="url(#bg)"/>
  <circle cx="140" cy="120" r="180" fill="#ffffff" opacity="0.08"/>
  <circle cx="900" cy="470" r="220" fill="#ffffff" opacity="0.08"/>
  <text x="512" y="230" font-size="120" text-anchor="middle">${emoji}</text>
  ${titleSvg}
  <text x="512" y="540" font-family="Segoe UI, Arial, sans-serif" font-size="22" font-weight="600" fill="#ffffff" opacity="0.85" text-anchor="middle">${label}</text>
</svg>`;
}

// ================= VIDEO =================
function scoreTitle(pageTitle, subjectName, videoTitle) {
    const wanted = new Set(tokenize(pageTitle + ' ' + subjectName));
    const have = tokenize(videoTitle);
    let score = 0;
    for (const w of have) {
        if (wanted.has(w)) score += 1;
        else {
            for (const want of wanted) {
                if (want.length >= 5 && (w.startsWith(want.slice(0, 5)) || want.startsWith(w.slice(0, 5)))) { score += 0.5; break; }
            }
        }
    }
    return score;
}

function runYtDlpSearch(query) {
    return new Promise((resolve) => {
        const args = ['--no-warnings', '--skip-download', '--flat-playlist', '--print', '%(id)s|%(duration)s|%(title)s', `ytsearch5:${query}`];
        let out = '';
        let done = false;
        const child = spawn(YTDLP, args, { windowsHide: true });
        const timer = setTimeout(() => {
            if (!done) { done = true; try { child.kill(); } catch (e) {} resolve(''); }
        }, 60000);
        child.stdout.on('data', d => { out += d.toString(); });
        child.stderr.on('data', () => {});
        child.on('close', () => {
            if (done) return;
            done = true;
            clearTimeout(timer);
            resolve(out);
        });
        child.on('error', () => {
            if (done) return;
            done = true;
            clearTimeout(timer);
            resolve('');
        });
    });
}

function pickBestVideo(rawOutput, pageTitle, subjectName) {
    const rows = String(rawOutput || '').split('\n').map(l => l.trim()).filter(Boolean).map(line => {
        const parts = line.split('|');
        if (parts.length < 3) return null;
        const id = parts[0].trim();
        const duration = parseFloat(parts[1]);
        const title = parts.slice(2).join('|').trim();
        if (!/^[a-zA-Z0-9_-]{6,20}$/.test(id)) return null;
        return { id, duration: isNaN(duration) ? 0 : duration, title };
    }).filter(Boolean);

    const filtered = rows.filter(r => r.duration >= 45 && r.duration <= 2400);
    if (filtered.length === 0) return null;

    let best = filtered[0];
    let bestScore = -1;
    for (const r of filtered) {
        const sc = scoreTitle(pageTitle, subjectName, r.title);
        if (sc > bestScore) { bestScore = sc; best = r; }
    }
    return { url: `https://www.youtube.com/watch?v=${best.id}`, title: best.title, duration: Math.round(best.duration) };
}

async function resolveVideo(book, subjectName) {
    if (book.video_url) return { video_url: book.video_url, video_title: book.video_title || '', video_duration: book.video_duration || 0 };

    const k = keyFor(book);
    const failAt = videoNegative.get(k);
    if (failAt && Date.now() - failAt < 15 * 60 * 1000) return { video_url: '' };

    if (videoInflight.has(k)) return videoInflight.get(k);

    const p = (async () => {
        try {
            const name = subjectName || book.subject_id;
            const short = tokenize(book.title || '').slice(0, 3).join(' ');
            const queries = Array.from(new Set([
                `${name} kelas ${book.kelas} ${book.title} materi`,
                short ? `${name} kelas ${book.kelas} ${short}` : '',
                short ? `${short} kelas ${book.kelas}` : '',
                `${name} kelas ${book.kelas} materi pembelajaran`
            ].filter(Boolean)));
            let picked = null;
            for (const q of queries) {
                const out = await runYtDlpSearch(q);
                picked = pickBestVideo(out, book.title, subjectName);
                if (picked) break;
            }
            if (picked) {
                await Book.updateOne({ _id: book._id }, { $set: { video_url: picked.url, video_title: picked.title, video_duration: picked.duration } });
                videoNegative.delete(k);
                return { video_url: picked.url, video_title: picked.title, video_duration: picked.duration };
            }
            videoNegative.set(k, Date.now());
            return { video_url: '' };
        } catch (e) {
            videoNegative.set(k, Date.now());
            console.error(`[media] Video gagal ${k}: ${e.message}`);
            return { video_url: '' };
        } finally {
            videoInflight.delete(k);
        }
    })();
    videoInflight.set(k, p);
    return p;
}

module.exports = {
    getIllustration,
    readIllustrationMeta,
    svgCover,
    resolveVideo,
    ILLUSTRATION_DIR,
    _diag: { topicQuery, matchCount, findWikipediaImage, findCommonsImage, findOpenverseImage, downloadImage }
};
