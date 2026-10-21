# EduBook — Smart Learning Book (AIoT)

Prototype untuk **Samsung Innovation Campus (SIC) Batch 8**.

EduBook adalah sistem buku pembelajaran pintar yang menggabungkan buku fisik
berbasis ESP32 dengan dashboard web multi-user. Siswa dapat membaca materi,
mengevaluasi hafalan lisan, mengerjakan kuis dan latihan mendengarkan,
bermain arena kuis real-time, membuat ujian online, serta berinteraksi di chat
global, komunitas mapel, dan DM. Tutor AI (Google Gemini), gamifikasi, fitur
sosial, dan integrasi hardware IoT (MQTT) melengkapi pengalaman belajar.

## Fitur Utama

- **Multi-jenjang**: SD, SMP, SMA, dan SMK dengan materi yang disesuaikan.
- **Materi personal**: agama menentukan mapel agama; jurusan SMK (TKJ, RPL, DKV,
  TEI, dll.) menentukan mapel kejuruan; peminatan SMA (MIPA, IPS, Bahasa)
  menentukan mapel peminatan.
- **Validasi sekolah**: format nama sekolah negeri/swasta dengan auto-detect
  jenjang dan status sekolah.
- **Empat modul belajar inti**:
  - Materi Literasi (ebook per mapel/kelas/halaman),
  - Smart-Review Lisan (hafalan via mikrofon, dinilai AI),
  - Tantangan Kuis,
  - Latihan Mendengarkan.
- **EduPlay Arena**: enam game kuis multiplayer real-time — EduBattle, Word
  Rush, Brain Defense, Knowledge Quest, Fact or Bluff, dan Escape the
  Classroom. Mendukung room dengan kode, quick match, bot pengganti, XP game,
  rating, dan riwayat pertandingan.
- **EduTest**: pembuat ujian online live. Host membuat room, mengatur jumlah
  soal/opsi, durasi, dan batas peserta; peserta join dengan kode. Menyediakan
  monitor progres real-time, timer, resume setelah reconnect, hasil host, dan
  review jawaban peserta.
- **Chat Global**: obrolan seluruh siswa dengan indikator online, kirim gambar,
  polling ringan, dan balasan pesan (quote/reply).
- **Komunitas mapel**: ruang diskusi otomatis sesuai mapel yang dapat diakses
  siswa, tanpa perlu join. Mendukung gambar dan balasan pesan.
- **DM antar siswa**: personal chat real-time via SSE, pesan gambar, status
  dibaca, notifikasi, dan balasan pesan.
- **EduBot Tutor AI**: chat berbasis Google Gemini dengan memori konteks,
  caching, knowledge-base fallback, serta pemrosesan gambar.
- **AI Content Insight**: ringkas/bedah materi dan rekomendasi belajar personal.
- **Gamifikasi**: XP, level/rank, achievement, misi harian/mingguan/bulanan,
  streak, badge, gelar leaderboard, dan leaderboard multi-kategori.
- **Fitur sosial**: cari teman, follow/follower, profil siswa, notifikasi,
  komparasi profil, showcase badge, dan album foto.
- **Profil**: avatar hasil upload, bio, mapel favorit, gelar yang bisa dipilih
  dari gelar yang diraih, dan statistik belajar/game.
- **Otentikasi**: Google OAuth dengan JWT. Akun baru melengkapi profil setelah
  login pertama.
- **Integrasi hardware**: ESP32/ESP32-S3, MQTT, TTS/STT, sinkronisasi halaman,
  dan simulator untuk pengujian tanpa perangkat fisik.
- **UI**: dashboard responsif, dark mode, animasi, konfirmasi XP, dan efek suara.

## Modul Dashboard

1. **Materi Literasi** — ebook, gambar/ilustrasi, video, dan pelafalan teks.
2. **Smart-Review Lisan** — rekam hafalan, kirim ke server, terima skor dan
   umpan balik AI.
3. **Tantangan Kuis** — soal pilihan ganda per halaman/mapel dengan pembahasan.
4. **Latihan Mendengarkan** — audio, transkrip, dan soal pemahaman.
5. **Dashboard** — statistik hafalan/kuis/listening, streak, rank, progress,
   grafik nilai, dan ringkasan aktivitas.
6. **EduPlay** — arena game real-time.
7. **EduTest** — ujian online real-time.
8. **Chat Global** — obrolan publik antar siswa.
9. **Komunitas** — diskusi per mapel.

## Struktur Repository

```text
EduBook/
├── backend/                     Backend aktif (Express + MongoDB)
│   ├── server.js                Entry point, CORS, Socket.IO, mount route
│   ├── config/                  Koneksi DB dan konfigurasi Passport
│   ├── routes/                  auth, book, subject, activity, chat, quest,
│   │                            social, album, global chat, community,
│   │                            eduplay, media, region, stream, cache, device
│   ├── controllers/             Logic request untuk auth, book, activity, chat
│   ├── models/                  User, Subject, Book, Activity, ChatHistory,
│   │                            DailyQuest, Notification, Friendship, Message,
│   │                            GlobalMessage, CommunityMessage, GameResult,
│   │                            Album
│   ├── services/                AI, cache, MQTT, SSE, media, subject access,
│   │                            title, EduPlay, EduTest, STT/TTS, NLU
│   ├── data/                    Bank soal EduPlay dan data wilayah
│   ├── seeds/                   Seed mapel, buku, konten, media, wilayah
│   ├── middleware/              JWT auth, admin key, upload
│   ├── utils/                   Validasi sekolah dan helper
│   └── uploads/                 File upload runtime (profil/album/chat)
├── config.js                    URL backend untuk akses non-localhost
├── config/db.js                 Koneksi DB legacy di root
├── docs/ARCHITECTURE.md         Catatan arsitektur dan keputusan teknis
├── firmware/                    Firmware PlatformIO ESP32-S3
├── ESP32_EduBook/               Sketsa Arduino IDE untuk ESP32 DevKit V1
├── hardware/simulators/         Simulator MQTT untuk pengujian tanpa hardware
├── archive/                     File legacy yang tidak dipakai backend aktif
├── index.html                   Dashboard utama (9 modul)
├── login.html                   Login Google OAuth + pelengkapan profil
├── seed.html                    Redirect legacy (tidak dipakai alur utama)
└── server.js                    Delegator ke backend/server.js
```

`backend/` adalah backend aktif. Frontend utama berada di root project dan
memakai API di `http://127.0.0.1:5000/api` saat dijalankan secara lokal.

## Menjalankan Backend

### 1. Prasyarat

- Node.js 18+
- MongoDB lokal atau MongoDB Atlas
- Google OAuth Client ID/Secret (untuk login)
- Gemini API key (opsional; tanpa key, EduBot memakai fallback lokal)

### 2. Instalasi

```bash
cd backend
npm install
cp .env.example .env
```

Di PowerShell Windows:

```powershell
Copy-Item .env.example .env
```

Isi variabel penting di `backend/.env`:

| Variabel | Keterangan |
|----------|------------|
| `PORT` | Port backend, default `5000` |
| `MONGODB_URI` | URI MongoDB |
| `JWT_SECRET` | Secret JWT, gunakan string acak panjang |
| `SESSION_SECRET` | Secret session Express |
| `GEMINI_API_KEY` | API key Gemini (opsional) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Kredensial Google OAuth |
| `GOOGLE_CALLBACK_URL` | Callback OAuth, default `http://localhost:5000/api/auth/google/callback` |
| `FRONTEND_URL` | URL frontend untuk redirect setelah login |
| `CORS_ORIGINS` | Origin frontend yang diizinkan, pisahkan dengan koma |
| `ADMIN_API_KEY` | Key untuk endpoint administratif |
| `MQTT_BROKER_URL`, `MQTT_TOPIC_PREFIX` | Broker dan prefix topic hardware |

### 3. Seed database

```bash
npm run seed
```

Seeder membackup data `Book` lama ke `backend/seeds/backup/`, lalu mengganti
mapel dan buku. Untuk pengujian aman, gunakan `npm run seed -- --only=<subject_id>`
atau `npm run seed -- --keep-books`. Jangan menjalankan seed penuh di production
tanpa backup.

### 4. Jalankan server

```bash
npm run dev    # nodemon, auto-reload
# atau
npm start
```

Dari root project juga bisa memakai:

```bash
npm start
```

Server berjalan di `http://localhost:5000`.

### 5. Buka frontend

Cara paling mudah, dari root project (terminal terpisah):

```bash
python -m http.server 5500
```

Lalu buka `http://127.0.0.1:5500/index.html` dan login dengan Google. Membuka
`index.html` langsung dari filesystem juga didukung (`file://`), tetapi server
statis lokal lebih stabil untuk OAuth dan upload.

**Akses non-lokal:** frontend otomatis memakai `window.EDUBOOK_API_URL` dari
`config.js` ketika host bukan `localhost`/`127.0.0.1`. Saat ini nilainya
mengarah ke ngrok:

```text
https://blazer-repaying-backlight.ngrok-free.dev/api
```

Jika URL backend berubah, cukup ubah satu baris di `config.js`. Pastikan domain
frontend juga ditambahkan ke `CORS_ORIGINS` (domain `*.netlify.app` sudah
diizinkan oleh konfigurasi backend saat ini).

## Transport dan Realtime

EduBook memakai beberapa jalur komunikasi sesuai kebutuhan:

| Transport | Digunakan untuk |
|-----------|-----------------|
| HTTP REST | Auth, materi, aktivitas, profil, chat history, leaderboard, dsb. |
| MQTT | Pesan dari/ke ESP32: halaman, navigasi, voice, audio, config, sync |
| SSE | DM real-time per user (`/api/dm/stream`) |
| Socket.IO | Room EduPlay dan EduTest |
| Polling | Chat Global dan Komunitas (interval ringan ±4 detik) |

Socket.IO memakai JWT dari `handshake.auth.token`. Room EduPlay dan EduTest
disimpan **in-memory**; room akan hilang jika server restart.

### Event Socket.IO utama

- **EduPlay**: `eduplay:resume`, `eduplay:create`, `eduplay:join`,
  `eduplay:quick`, `eduplay:ready`, `eduplay:start`, `eduplay:answer`,
  `eduplay:rematch`, `eduplay:leave`.
- **EduTest**: `edutest:create`, `edutest:join`, `edutest:resume`,
  `edutest:start`, `edutest:answer`, `edutest:end`, `edutest:leave`.

## API Ringkasan (prefix `/api`)

| Area | Route utama |
|------|-------------|
| Auth | `/auth/google`, `/auth/google/callback`, `/auth/profile`, `/auth/me`, `/auth/mapel-aktif` |
| Subject | `/subjects/available`, `/subjects/all`, `/subjects/:id` |
| Buku | `/book/subject/:subjectId/:page`, `/book/subject/:subjectId/kelas/:kelas/:page` |
| Media | `/media/illustration/...`, `/media/imageinfo/...`, `/media/video/...` |
| Wilayah | `/regions`, `/regions/provinces` |
| Aktivitas | `/activity/:student`, `/analytics/:student`, `/recommendation/:student` |
| Chat EduBot | `/chat/*` (sesi dan pesan) |
| Explainer | `/explain/*`, `/quiz/feedback` |
| Device | `/device/keyword`, `/device/info` |
| Leaderboard | `/leaderboard` |
| Misi | `/quests/:student` |
| Sosial | `/users/search`, `/users/profile/:userId`, `/friendship/*`, `/notifications/*`, `/users/earned-titles`, `/users/set-title` |
| Album | `/album/*` |
| Chat Global | `GET/POST /global-chat/messages` |
| Komunitas | `GET /communities`, `GET/POST /communities/:id/messages` |
| DM | `/dm/send`, `/dm/conversations`, `/dm/:userId`, `/dm/read`, `/dm/stream` (SSE) |
| EduPlay | `GET /eduplay/meta`; permainan via Socket.IO |
| EduTest | Tidak ada REST khusus; seluruh alur via Socket.IO |
| Cache/Stream | `/cache/*`, `/stream/*` (SSE broadcast real-time) |

## Integrasi Hardware dan Simulator

ESP32 terhubung ke broker MQTT. Backend berlangganan topik `page`, `navbar`,
`voice`, dan `sync`, lalu mengirim hasil ke `audio`/`sync`/`config`. Dashboard
menerima update halaman secara real-time.

Tanpa perangkat fisik, gunakan simulator:

```bash
cd hardware/simulators
npm install mqtt
node test-hardware.js
node simulate-voice-command.js
```

Jalankan backend dan dashboard terlebih dahulu, lalu simulator akan memicu
perubahan halaman/navigasi seperti device asli.

## Firmware

- `firmware/` — project PlatformIO untuk ESP32-S3 (TFT 3.5", INMP441,
  MAX98357). Lihat `firmware/README.md`.
- `ESP32_EduBook/ESP32_EduBook.ino` — varian sketsa Arduino IDE untuk ESP32
  DevKit V1 dengan fitur voice assistant.

Ubah kredensial WiFi/MQTT di konfigurasi masing-masing varian sebelum upload.

## Deployment Singkat

1. Backend: deploy `backend/` ke Node.js host yang mendukung persistent
   filesystem (uploads) dan MongoDB. Isi environment production.
2. Frontend: deploy `index.html`, `login.html`, dan `config.js` ke Netlify.
3. Set `FRONTEND_URL`, `GOOGLE_CALLBACK_URL`, dan `CORS_ORIGINS` sesuai domain
   produksi.
4. Ubah `EDUBOOK_API_URL` di `config.js` ke URL backend produksi.

## Catatan Prototype

- Cache AI, rate limit, indikator online, room EduPlay, dan room EduTest
  disimpan in-memory. Hilang saat restart dan belum mendukung multi-instance.
- Chat Global dan Komunitas memakai polling, belum push real-time.
- Endpoint administratif memerlukan header `x-admin-key` yang cocok dengan
  `ADMIN_API_KEY`.
- Upload dibatasi ukuran dan format (profil ≤2MB, album ≤5MB; JPG/PNG/GIF/WebP).
- Jangan commit `backend/.env`; gunakan `.env.example` sebagai template.
- `archive/` dan `hardware/archive/` berisi file legacy, bukan bagian runtime.

Lihat `docs/ARCHITECTURE.md` untuk detail keputusan teknis.

## Tim

Samsung Innovation Campus Batch 8 — 3 Teknik Jaringan Komputer dan
Telekomunikasi, 1 Teknik Elektronika Industri.

1. Zsi Malik Aqilla Mustaqim - Teknik Jaringan Komputer dan Telekomunikasi
2. A.Rohman Bagus Aji Tajiwo - Teknik Elektronika Industri
3. Muhammad Raffa Nurhalim - Teknik Jaringan Komputer dan Telekomunikasi
4. Hadi Mishal Ramadhan - Teknik Jaringan Komputer dan Telekomunikasi
