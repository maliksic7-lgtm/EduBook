# EduBook — Smart Learning Book (AIoT)

Prototype untuk **Samsung Innovation Campus (SIC) Batch 8**.

EduBook adalah **sistem buku pembelajaran pintar** yang menggabungkan buku fisik
berbasis ESP32-S3 dengan platform web multi-user. Sistem mengevaluasi hafalan
lisan siswa, memberikan kuis adaptif & latihan mendengarkan, menyediakan tutor AI
(Google Gemini), serta gamifikasi lengkap (XP, level, achievement, misi, streak)
dan fitur sosial — semua terintegrasi real-time melalui IoT (MQTT) dan cloud (MongoDB).

## Fitur Utama

- **4 mode belajar**: Materi Literasi (ebook), Smart-Review Lisan (hafalan via suara),
  Tantangan Kuis, dan Latihan Mendengarkan.
- **Evaluasi & Progress**: dashboard dengan kartu statistik (hafalan/kuis/dengar/streak/rank),
  Ringkasan Hari Ini, lingkaran progress per halaman, dan grafik nilai.
- **EduBot Tutor AI**: chat berbasis Google Gemini dengan memori konteks, caching,
  dan knowledge-base fallback yang tetap bekerja saat API AI down.
- **AI Content Insight**: sederhanakan / bedah ilmiah materi + rekomendasi belajar personal (RAG).
- **Gamifikasi**: XP & level/rank, Achievement Center, misi harian/mingguan/bulanan,
  streak bonus harian, dan badge.
- **Fitur Sosial**: cari & tambah teman, profil siswa, notifikasi, leaderboard (multi-kategori),
  showcase badge, album foto, dan **DM/chat antar user** (personal message real-time).
- **Otentikasi multi-user**: login email+password (bcrypt) dan Google OAuth (passport/JWT),
  profil dengan upload foto.
- **Integrasi hardware**: ESP32-S3 (MQTT + TTS/STT), sinkronisasi halaman real-time via SSE,
  status device di dashboard, dan simulator untuk pengujian tanpa komponen fisik.
- **Mode gelap & mikro-interaksi**: dark mode, animasi, konfirmasi XP & efek suara.

## Struktur Repository

```
edubook/
├── backend/                     Server API (Express + MongoDB + Gemini AI + MQTT + SSE)
│   ├── routes/                  Routing endpoint (auth, book, activity, chat, quest, social…)
│   ├── controllers/             Logic per request
│   ├── models/                  Mongoose schema
│   │   ├── User.js              Akun, profil, jenis_kelamin, streak, XP
│   │   ├── Activity.js          Log belajar (hafalan/quiz/listening)
│   │   ├── Book.js              Materi 10 halaman + bank soal
│   │   ├── ChatHistory.js       Riwayat percakapan EduBot
│   │   ├── DailyQuest.js        Misi harian/mingguan/bulanan
│   │   ├── Notification.js      Notifikasi (follow, achievement, streak…)
│   │   ├── Friendship.js        Relasi teman
│   │   ├── Message.js           DM antar user (personal chat)
│   │   └── Album.js             Album foto siswa
│   ├── middleware/              auth (JWT), requireAdminKey, upload
│   └── seeds/seed.js            Data buku (10 halaman, 10 soal/halaman)
├── config/                      config/db.js (koneksi MongoDB)
├── config.js                    URL backend produksi (satu-satunya tempat override untuk non-lokal)
├── firmware/                    ESP32-S3 firmware (PlatformIO)
│   ├── src/                     main.cpp, AudioManager(.cpp/.h)
│   └── include/Config.h         pinout, WiFi, MQTT
├── hardware/simulators/         Simulator MQTT (uji alur tanpa device fisik)
├── docs/ARCHITECTURE.md         Detail keputusan teknis
├── archive/                     File duplikat legacy
├── index.html                   Dashboard utama (modul: literasi, hafalan, kuis, listening, dashboard)
├── login.html                   Halaman login/registrasi + Google OAuth
├── book-viewer.html             Viewer materi (versi alternatif)
└── server.js                    Delegator → backend/server.js
```

`backend/` adalah backend aktif. `frontend/dashboard/` adalah folder statis opsional;
halaman utama (`index.html`, `login.html`) berada di root project.

## Menjalankan Backend

### 1. Prasyarat
- Node.js 18+
- MongoDB berjalan lokal (atau ganti `MONGODB_URI` ke MongoDB Atlas)
- API key Google Gemini ([dapatkan di sini](https://aistudio.google.com/apikey))

### 2. Instalasi

```bash
cd backend
npm install
cp .env.example .env
# lalu isi .env dengan GEMINI_API_KEY milikmu
```

### 3. Seed database (isi 10 halaman buku + bank soal)

```bash
npm run seed
```

Seeder menghapus data buku lama sebelum memasukkan baru. Jangan dijalankan di
production kecuali `ALLOW_DESTRUCTIVE_SEED=true` disetel secara sengaja.

### 4. Jalankan server

```bash
npm run dev    # auto-reload (nodemon)
# atau
npm start
```

Server berjalan di `http://localhost:5000` (cara lain: `node server.js` dari root).

### 5. Buka dashboard

Buka `index.html` (root project) di browser, daftar/login akun, lalu dashboard
otomatis terhubung ke `http://127.0.0.1:5000/api`.

**Akses non-lokal (HP/STB/link demo):** frontend otomatis memakai URL di
`config.js` (`window.EDUBOOK_API_URL`) saat diakses dari domain selain
`localhost`/`127.0.0.1`. Saat ini mengarah ke ngrok
`https://blazer-repaying-backlight.ngrok-free.dev/api`. Jika URL berubah,
ganti satu baris di `config.js`.

## Menguji Alur Hardware Tanpa Komponen Fisik

Komponen IoT (ESP32-S3, INMP441, dll) belum selalu tersedia saat development.
Folder `hardware/simulators/` mem-publish pesan MQTT identik dengan yang dikirim
device asli — sehingga seluruh alur device → server → web dashboard bisa divalidasi.

```bash
cd hardware/simulators
npm install mqtt   # sekali saja
node test-hardware.js              # simulasi perpindahan halaman otomatis
node simulate-voice-command.js     # trigger start_voice/stop_voice/next_tab interaktif
```

Jalankan backend di terminal lain, buka dashboard, lalu jalankan salah satu
simulator — dashboard bereaksi seolah-olah ada device fisik.

## Firmware ESP32-S3

Proyek PlatformIO di `firmware/` (dukung ESP32-S3, koneksi WiFi + MQTT, kontrol
TFT & audio). Ubah kredensial di `firmware/include/Config.h`, build & upload lewat
PlatformIO. Lihat `firmware/README.md`.

## API Ringkasan (prefix `/api`)

| Area            | Route utama |
|-----------------|---------------------------------------------|
| Auth            | `/auth/*` (login/register/OAuth/profile)     |
| Buku            | `/book/*` (konten + soal per halaman) |
| Aktivitas       | `/activity/*` (hafalan, quiz, listening) |
| Chat EduBot     | `/chat/*` (session, pesan) |
| Explainer       | `/explain/*` (simplify/detail AI), `/quiz/feedback` (feedback jawaban kuis) |
| Device          | `/device/keyword`, `/device/info` |
| Leaderboard     | `/leaderboard/*` |
| Misi            | `/quests/*` (harian/mingguan/bulanan) |
| Sosial          | `/social/*`, `/album/*` |
| DM              | `/dm/*` (send, conversations, thread, read, stream SSE realtime) |
| Cache/Stream    | `/cache/*`, `/stream/*` (SSE real-time) |

## Ketentuan yang perlu diketahui (Prototype)

- **Cache in-memory**: cache jawaban AI & knowledge base hilang tiap restart dan
  belum distributed. Cukup untuk demo single-server.
- Endpoint administratif (reset data, mutasi cache, penambahan buku) memerlukan
  header `x-admin-key` yang cocok dengan `ADMIN_API_KEY`.
- Upload foto dibatasi ukuran (profil ≤2MB, album ≤5MB) dan format (JPG/PNG/GIF/WebP).

Lihat `docs/ARCHITECTURE.md` untuk detail keputusan teknis.

## Tim

Samsung Innovation Campus Batch 8 — 3 Teknik Jaringan Komputer dan Telekomunikasi, 1 Teknik Elektronika Industri.
1. Zsi Malik Aqilla Mustaqim - Teknik Jaringan Komputer dan Telekomunikasi
2. A.Rohman Bagus Aji Tajiwo - Teknik Elektronika Industri
3. Muhammad Raffa Nurhalim - Teknik Jaringan Komputer dan Telekomunikasi
4. Hadi Mishal Ramadhan - Teknik Jaringan Komputer dan Telekomunikasi
