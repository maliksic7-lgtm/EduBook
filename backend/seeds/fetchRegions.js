const fs = require('fs');
const path = require('path');

function titleCase(s) {
    return String(s || '').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

(async () => {
    console.log('Fetch provinsi...');
    const provRes = await fetch('https://wilayah.id/api/provinces.json');
    const provJson = await provRes.json();
    const provinces = provJson.data || [];
    console.log('Provinsi:', provinces.length);
    const regions = [];
    for (const p of provinces) {
        const pname = titleCase(p.name);
        try {
            const r = await fetch(`https://wilayah.id/api/regencies/${p.code}.json`);
            const rj = await r.json();
            const regs = rj.data || [];
            for (const r of regs) regions.push({ provinsi: pname, kota: titleCase(r.name) });
            console.log(`  ${pname}: ${regs.length} kab/kota`);
        } catch (e) {
            console.log(`  ${pname}: GAGAL ${e.message}`);
        }
        await new Promise(s => setTimeout(s, 150));
    }
    const out = path.join(__dirname, '..', 'data', 'regions.json');
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(regions));
    console.log(`Tersimpan: ${out} (${regions.length} wilayah)`);
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
