// ===== KONFIGURASI API PRODUKSI =====
// Satu-satunya tempat untuk mengatur URL backend.
// Saat diakses dari domain non-lokal (bukan localhost), frontend otomatis
// memakai URL di bawah ini.
//
// Dev domain ngrok saat ini: https://blazer-repaying-backlight.ngrok-free.dev
// (ditetapkan ngrok otomatis untuk akun ini — URL tetap selama akun ada).
// Kalau domain berubah, ganti satu baris di bawah.
(function () {
    if (!['localhost', '127.0.0.1'].includes(window.location.hostname) && !window.EDUBOOK_API_URL) {
        window.EDUBOOK_API_URL = 'https://blazer-repaying-backlight.ngrok-free.dev/api';
    }
})();
