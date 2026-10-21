const JENJANG_MAP = {
    'SD': 'sd', 'SDN': 'sd', 'MI': 'sd',
    'SMP': 'smp', 'SMPLB': 'smp', 'MTS': 'smp',
    'SMA': 'sma', 'SMALB': 'sma', 'MA': 'sma',
    'SMK': 'smk', 'MAK': 'smk',
    'MAN': 'sma', 'MAK': 'smk'
};

function validateSchoolName(nama) {
    const trimmed = nama.trim().toUpperCase();

    let detectedJenjang = null;
    for (const [prefix, jenjang] of Object.entries(JENJANG_MAP)) {
        if (trimmed.startsWith(prefix + ' ') || trimmed === prefix) {
            detectedJenjang = jenjang;
            break;
        }
    }

    if (!detectedJenjang) {
        return { valid: false, error: 'Nama sekolah harus diawali jenjang (SD/SMP/SMA/SMK/MAN/MAK/MI/MTS)' };
    }

    const isNegeri = /\bNEGERI\b/.test(trimmed);
    const status = isNegeri ? 'negeri' : 'swasta';

    if (isNegeri) {
        const negeriMatch = trimmed.match(/\bNEGERI\s+(\d+)\b/);
        if (!negeriMatch) {
            return { valid: false, error: 'Format sekolah negeri harus: <JENJANG> NEGERI <NOMOR> <KOTA>. Contoh: SMA NEGERI 1 PEKANBARU' };
        }
    }

    if (trimmed.length < 10) {
        return { valid: false, error: 'Nama sekolah terlalu pendek' };
    }

    return {
        valid: true,
        jenjang: detectedJenjang,
        status: status,
        normalized: trimmed
    };
}

module.exports = { validateSchoolName };
