# Catatan Arsitektur & Keputusan Teknis

Dokumen ini menjelaskan alasan di balik struktur project saat ini, terutama
perubahan dari versi awal (satu file `server.js` besar, semua logic campur
jadi satu) ke struktur modular sekarang.

## 1. Kenapa dipisah jadi routes/controllers/services?

Versi awal punya `server.js` tunggal ~700 baris berisi semua: koneksi DB,
inisialisasi AI client, caching, MQTT handling, dan belasan endpoint HTTP.
Ini menyulitkan kerja tim paralel — kalau 4 orang kerja di file yang sama,
risiko conflict tinggi.

Pemisahan sekarang:
- **`routes/`** — cuma pemetaan URL ke controller, tidak ada logic bisnis.
- **`controllers/`** — logic per request (validasi input, panggil service,
  bentuk response).
- **`services/`** — logic murni yang tidak tahu apa-apa soal HTTP (AI calls,
  caching, MQTT, broadcast SSE). Bisa dipakai ulang dari controller mana pun.

Konsekuensinya: menambah fitur baru = menambah file baru, bukan mengedit file
besar yang sudah ada. Tim bisa kerja di domain berbeda tanpa saling tabrakan.

## 2. Kenapa API key dipindah dari hardcode ke `.env`?

Versi awal:
```js
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AQ.Ab8...";
```
Kalau kode ini di-push ke repository publik (kemungkinan besar diminta untuk
submission SIC), key tersebut bocor ke publik dan siapa pun bisa
menyalahgunakan kuota API. Sekarang key **wajib** diisi lewat `.env` (yang
di-gitignore), dan `aiService.js` akan fallback ke jawaban lokal
(`fallbackService.js`) kalau key tidak tersedia — bukan crash.

## 3. Kenapa MQTT dipilih sebagai satu-satunya transport hardware?

Versi awal punya dua jalur paralel yang melakukan hal serupa: endpoint HTTP
`/api/hardware/page` dan subscriber MQTT ke broker publik. Ini membingungkan
— device asli nanti akan pakai jalur yang mana?

Keputusan: **MQTT-only**, karena:
- Standar industri untuk device tertanam (embedded) yang terhubung lewat
  internet publik.
- Model publish-subscribe lebih tahan terhadap koneksi yang naik-turun
  dibanding request-response HTTP biasa.
- Sekali broker & topic didefinisikan, menambah device baru (multi-unit
  EduBook) tidak perlu expose endpoint HTTP baru di server.

Konsekuensi: endpoint `/api/hardware/page` dan `/api/hardware/navbar` (HTTP)
dihapus. Simulator (`hardware/simulators/`) juga dimigrasi untuk publish
lewat MQTT, supaya cara mengetes selalu konsisten dengan cara kerja device
asli nanti.

## 4. Kenapa `/api/ai/content-insight` diubah dari fetch-ke-diri-sendiri?

Versi awal endpoint ini melakukan:
```js
const redirectFetch = await fetch(`http://localhost:5000/api/explain`, ...)
```
Server memanggil endpoint miliknya sendiri lewat HTTP — anti-pattern, karena:
- Lebih lambat (bulak-balik network stack untuk sesuatu yang bisa dipanggil
  langsung sebagai function).
- Rapuh — kalau PORT berubah, atau server diakses lewat domain/reverse proxy
  lain, panggilan `localhost:5000` ini bisa gagal diam-diam.

Sekarang kedua endpoint sama-sama memanggil `aiService.generateExplanation()`
langsung sebagai function call biasa.

## 5. Kenapa dua file seed (`seeder.js` + `seed.js`) dikonsolidasi jadi satu?

Versi awal punya dua script seeding dengan data buku yang mirip tapi tidak
identik, dan `package.json` cuma mengarah ke salah satunya (`seeder.js`) —
padahal `seed.js` datanya lebih lengkap (10 soal kuis/halaman). Ini berisiko
membingungkan "mana yang jadi sumber data asli?" terutama saat tim
bertambah anggota.

Backend aktif memakai `backend/seeds/seed.js` sebagai sumber seed resmi. File seed
di root hanya artefak legacy dan tidak lagi dipanggil oleh script package utama.

## 6. Firmware ESP32-S3 (`firmware/`)

Project ini memiliki kode firmware untuk ESP32-S3 di folder `firmware/`.
Ini adalah komponen hardware yang membuat EduBook menjadi buku fisik pintar.

### Spesifikasi Hardware
- **ESP32-S3** — mikrokontroler utama dengan Wi-Fi + BLE built-in
- **TFT 3.5"** — display untuk UI, QR code, dan feedback
- **INMP441** — I2S microphone untuk input suara
- **MAX98357 + Speaker** — audio amplifier untuk output suara
- **Tombol** — input fisik untuk navigasi

### State Machine Device
```
BOOT → CONNECTING → ASK_MODE →┬→ WEB_MODE (QR + IP)
                                └→ STANDALONE_MENU →┬→ VOICE_REVIEW
                                                     ├→ QUIZ
                                                     ├→ CHAT
                                                     └→ BACA_MATERI
```

### Topik MQTT
| Topic | Direction | Fungsi |
|-------|-----------|--------|
| `edubook/demo/page` | ESP32 → Server | Kirim nomor halaman |
| `edubook/demo/navbar` | ESP32 → Server | Aksi navigasi (start/stop voice, next_tab) |
| `edubook/demo/voice` | ESP32 → Server | Data suara / teks hafalan |
| `edubook/demo/audio` | Server → ESP32 | Feedback AI (score + komentar) |
| `edubook/demo/sync` | Bi-directional | Sinkronisasi status device |
| `edubook/demo/config` | Server → ESP32 | Konfigurasi / provisioning device |

### Mode Operasi
1. **Mode Web** — TFT tampilkan QR code + IP, user buka dashboard di browser,
   gunakan mic laptop/HP untuk fitur smart-review.
2. **Mode Mandiri** — Semua interaksi via device: INMP mic sebagai input suara,
   speaker sebagai output audio, TFT sebagai display. Server tetap memproses AI.

## 7. Cleanup Duplikasi (v2.1.0)

File-file berikut telah diarsipkan ke `archive/` untuk menghilangkan
kebingungan dual-codebase:
- `server.js` root → disederhanakan jadi delegator ke `backend/server.js`
- `models/` root → duplikat dari `backend/models/` (skema lebih lama)
- `seed.js` dan `seeder.js` root → duplikat dari `backend/seeds/seed.js`

## 8. Otentikasi multi-user (JWT + Google OAuth)

Sebelumnya `student_name` di frontend `hardcoded` dan endpoint aktivitas/chat
belum diamankan. Sejak v2.x arsitektur migrasi ke **multi-user**:

- **Auth flow**: daftar/login email+password (bcrypt) atau **Google OAuth**
  (Passport). Sukses login menghasilkan **JWT** (`JWT_SECRET`) yang dipakai
  frontend sebagai `Authorization: Bearer`.
- **Middleware `authenticateToken`**: mem-verifikasi JWT dan mengisi `req.user`
  (termasuk `nama`, `user_id`, `jenis_kelamin`, dst). Middleware `optionalAuth`
  dipakai untuk endpoint yang boleh kosong sesi.
- **Model `User`**: menyimpan `nama`, `email`, `user_id`, `kelas`, `semester`,
  `jenis_kelamin`, `foto_profil`, `bio`, `title`, `last_active`, `streak` dst.
- Semua endpoint aktivitas, kuis, listening, chat, misi, sosial kini butuh
  autentikasi (`401` bila token tidak ada/tidak valid).
- Karena identitas kini per-akun, `student_name` tidak lagi hardcoded; aktivitas
  disimpan per siswa berdasarkan `student_name` yang terasosiasi dengan akun.

## 9. Gamifikasi & fitur sosial

- **XP / Level / Rank**: total XP dihitung dari hafalan, kuis, listening, bonus
  streak (7 hari +50, 30 hari +300) dan direpresentasikan sebagai "Learning Rank".
- **Misi (`DailyQuest` & `dailyQuest.routes.js`)**: daftar misi harian (6),
  mingguan (12), bulanan (18) dengan progress + klaim hadiah XP.
- **Achievement Center**: achievement dihitung dari data prestasi
  (XP, waktu, hafalan, kuis, streak) dan divisualkan di frontend.
- **Fitur sosial**: cari user (`/social/...`), teman (`Friendship`),
  mengikut, `Notification` (tipe: follow, achievement, streak_reminder,
  quest_reminder, fun), leaderboard multi-kategori (hafalan, kuis, listening),
  showcase badge, dan album foto (`/album/...` + upload).
- **DM / personal chat antar user**: model `Message` (`sender_id`,
  `receiver_id`, `text`, `read`) dipakai untuk percakapan 1-on-1. Endpoint
  `/dm/send` (kirim pesan, cek penerima valid & bukan diri sendiri),
  `/dm/conversations` (daftar percakapan + pesan terakhir + unread count),
  `/dm/:userId` (thread dengan satu user, otomatis menandai notifikasi & pesan
  sebagai `read`), `/dm/read`, dan `/dm/stream` (SSE realtime per-user).
  **Realtime via SSE**: frontend membuka `EventSource` ke `/dm/stream` (token
  lewat query karena EventSource tidak bisa kirim header Authorization);
  server memakai `streamService.sendToUser()` untuk mendorong event
  `DM_MESSAGE` saat pesan terkirim dan `DM_READ` saat pesan dibaca. Thread
  dirender **incremental** — hanya pesan baru yang di-append, bukan re-render
  seluruh DOM, sehingga chat lama tidak hilang/tertimbun (perilaku ala
  WhatsApp). `EventSource` terhubung sejak login sukses, jadi pesan masuk tetap
  muncul meski modal chat tertutup. Polling lama (5 detik) diganti; kini hanya
  fallback ringan (20 detik) bila SSE putus. Notifikasi bertipe `message` bisa
  diklik untuk membuka thread DM.

## 10. Ringkasan lapisan & nama domain

Tabel ringkas area API (prefix `/api`):

| Area | Route | Tujuan |
|------|-------|--------|
| Auth | `auth/*` | login/register/OAuth/profile |
| Buku | `book/*` | konten + bank soal per halaman |
| Aktivitas | `activity/*` | hafalan, kuis, listening |
| Chat | `chat/*` | sesi & pesan EduBot (AI + fallback) |
| Explainer | `explain/*`, `/quiz/feedback` | simplify/detail materi via AI + feedback jawaban kuis |
| Device | `device/keyword`, `device/info` | deteksi keyword suara & info device |
| Leaderboard | `leaderboard/*` | ranking multi-kategori |
| Misi | `quests/*` | harian/mingguan/bulanan |
| Sosial | `social/*`, `album/*` | teman, notifikasi, profil, album |
| DM | `dm/*` | personal chat antar user (send/thread/read) |
| Cache/Stream | `cache/*`, `stream/*` | caching AI & SSE real-time |

Kunci transport async: MQTT (`mqttService.js`) untuk arah device, dan SSE
(`streamService.js`) untuk dorongan real-time ke dashboard — mode *broadcast*
(device/mode ke semua client) dan *per-user* (`sendToUser()`, dipakai DM
realtime). AI di-konsolidasi di `aiService.js` (Gemini) dengan
`fallbackService.js` sebagai knowledge-base cadangan saat API AI gagal/timeout.

## 11. URL backend non-lokal (`config.js`)

Awalnya frontend hardcode `http://localhost:5000/api` di banyak tempat — gagal
saat dashboard diakses dari HP/STB atau link demo karena `localhost` menunjuk ke
device user. Sekarang `config.js` (root) menjadi **satu-satunya tempat** mengatur
URL backend: saat diakses dari domain selain `localhost`/`127.0.0.1`, frontend
otomatis memakai `window.EDUBOOK_API_URL` (saat ini ngrok
`https://blazer-repaying-backlight.ngrok-free.dev/api`). Menambah domain baru
cukup dengan mengatur `EDUBOOK_API_URL` lebih dulu.

## 12. Known trade-off yang belum diperbaiki (sengaja, untuk versi prototype)

- Cache in-memory (`cacheService.js`) tidak persist antar restart server dan
  tidak scalable ke multi-instance (misal kalau nanti deploy dengan load
  balancer). Untuk prototype single-server demo ini bukan masalah, tapi
  dicatat sebagai item "strategi scaling" untuk versi pasca-lomba.
- Achievement/badge saat ini sebagian dihitung di frontend (dari data agregat),
  bukan disimpan sebagai riwayat per-user; bisa dimigrasi ke snapshot DB bila
  ingin progres lintas-device yang tahan lama.
- Endpoint administratif (reset data siswa, mutasi cache, penambahan buku)
  dilindungi header `x-admin-key` yang cocok dengan `ADMIN_API_KEY`.
- Upload foto dibatasi ukuran & format (profil ≤2MB, album ≤5MB, hanya
  JPG/PNG/GIF/WebP).
- Firmware ESP32-S3 saat ini menggunakan WiFi statis (`WIFI_SSID`/`WIFI_PASSWORD`
  di `Config.h`). Untuk deployment nyata, perlu ditambahkan WiFi Manager
  (AP mode untuk konfigurasi) atau provisioning via BLE.
