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
- **`routes/`** — pemetaan URL dan handler tipis; fitur yang logic-nya pendek
  (mis. chat global, komunitas, EduPlay metadata) ditangani langsung di route.
- **`controllers/`** — logic per request untuk domain yang lebih besar
  (validasi input, panggil service, bentuk response).
- **`services/`** — logic murni yang tidak tahu apa-apa soal HTTP (AI calls,
  caching, MQTT, broadcast SSE, room Socket.IO). Bisa dipakai ulang dari
  controller/route mana pun.

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
Repo juga menyertakan varian sketsa Arduino IDE untuk ESP32 DevKit V1 di
`ESP32_EduBook/ESP32_EduBook.ino`; keduanya memakai protokol MQTT yang sama.

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

## 8. Otentikasi multi-user (Google OAuth + JWT)

Sebelumnya `student_name` di frontend `hardcoded` dan endpoint aktivitas/chat
belum diamankan. Sejak v2.x arsitektur migrasi ke **multi-user**:

- **Auth flow**: login melalui **Google OAuth** (Passport). Callback membuat akun
  baru bila belum ada, lalu mengarahkan user ke halaman pelengkapan profil.
  Sukses login menghasilkan **JWT** (`JWT_SECRET`) yang dipakai frontend sebagai
  `Authorization: Bearer`.
- **Middleware `authenticateToken`**: memverifikasi JWT dan mengisi `req.user`
  (termasuk `nama`, `user_id`, `jenis_kelamin`, dst). Middleware `optionalAuth`
  dipakai untuk endpoint yang boleh kosong sesi.
- **Model `User`**: menyimpan `nama`, `email`, `user_id`, `kelas`, `semester`,
  `jenis_kelamin`, `foto_profil`, `bio`, `title`, `last_active`, `streak`,
  `game_xp`, `game_rating`, dan `game_matches`.
- Semua endpoint aktivitas, kuis, listening, chat, misi, sosial, DM, chat
  global, komunitas, dan EduPlay membutuhkan autentikasi (`401` bila token tidak
  ada/tidak valid).
- Karena identitas kini per-akun, `student_name` tidak lagi hardcoded; aktivitas
  disimpan per siswa berdasarkan `student_name` yang terasosiasi dengan akun.


## 9. Gamifikasi, profil, dan fitur sosial

- **XP / Level / Rank**: total XP dihitung dari hafalan, kuis, listening, bonus
  streak (7 hari +50, 30 hari +300) dan direpresentasikan sebagai "Learning Rank".
- **Misi (`DailyQuest` & `dailyQuest.routes.js`)**: daftar misi harian,
  mingguan, dan bulanan dengan progress + klaim hadiah XP.
- **Achievement Center**: achievement dihitung dari data prestasi (XP, waktu,
  hafalan, kuis, streak) dan divisualkan di frontend.
- **Gelar leaderboard**: `titleService.js` menghitung gelar yang diraih dari
  posisi di leaderboard. `GET /users/earned-titles` mengembalikan gelar yang
  valid; `POST /users/set-title` menyimpan pilihan ke `User.title`. Nilai title
  disanitasi di `auth.controller.js` saat profil dibaca/diperbarui agar user
  tidak bisa memakai gelar yang belum diraih.
- **Profil dan avatar**: foto profil di-upload melalui `PUT /auth/profile`
  (maks. 2MB). Helper frontend `userPhotoUrl`/`userAvatarInner`/`userAvatarHtml`
  dipakai konsisten di chat, DM, leaderboard, EduPlay, dan EduTest.
- **Fitur sosial**: cari user (`/users/search`), follow/follower
  (`Friendship`), notifikasi, leaderboard multi-kategori, showcase badge,
  komparasi profil, dan album foto (`/album/...`).

### Chat Global dan Komunitas

- **Chat Global** (`GlobalMessage`): satu kanal untuk semua siswa, mendukung
  teks/gambar, indikator online in-memory, dan rate limit sederhana. Frontend
  melakukan polling ringan ±4 detik selama tab aktif.
- **Komunitas** (`CommunityMessage`): ruang diskusi otomatis berdasarkan mapel
  yang tersedia untuk jenjang/agama/jurusan siswa; tidak perlu join. Pesan
  dipisahkan oleh `community_id`.
- Keduanya menyimpan snapshot quote saat membalas pesan (lihat bagian reply).

### DM dan reply

- **DM / personal chat**: model `Message` (`sender_id`, `receiver_id`, `text`,
  `image`, `read`, `reply_to`) untuk percakapan 1-on-1.
- Endpoint `/dm/send`, `/dm/conversations`, `/dm/:userId`, `/dm/read`, dan
  `/dm/stream`. Realtime memakai SSE per user: `streamService.sendToUser()`
  mengirim `DM_MESSAGE` saat pesan terkirim dan `DM_READ` saat dibaca.
- Thread dirender incremental agar pesan baru tidak menghapus riwayat lama.
  EventSource terhubung sejak login, sehingga pesan masuk tetap diterima saat
  modal DM tertutup. Polling 20 detik hanya menjadi fallback bila SSE putus.
- **Reply/quote** tersedia untuk DM, Chat Global, dan Komunitas. Saat user
  membalas, frontend mengirim `reply_to_id`; server memvalidasi bahwa pesan asli
  berada di percakapan/komunitas yang sama, lalu menyimpan snapshot
  `{ message_id, sender_id, nama, text, has_image }`. Snapshot membuat quote
  tetap tampil walau pesan asli berubah atau dihapus. Teks quote dibatasi 160
  karakter dan di-escape saat dirender.


## 10. Ringkasan lapisan & nama domain

Tabel ringkas area API (prefix `/api`):

| Area | Route | Tujuan |
|------|-------|--------|
| Auth | `auth/*` | login Google OAuth, profil, mapel aktif, hapus akun |
| Buku | `book/*` | konten + bank soal per halaman |
| Subject | `subjects/*` | mapel yang tersedia per siswa |
| Media | `media/*` | ilustrasi, metadata gambar, video |
| Wilayah | `regions/*` | pencarian provinsi/kota |
| Aktivitas | `activity/*`, `analytics/*`, `recommendation/*` | hafalan, kuis, listening |
| Chat | `chat/*` | sesi & pesan EduBot (AI + fallback) |
| Explainer | `explain/*`, `/quiz/feedback` | simplify/detail materi via AI + feedback jawaban kuis |
| Device | `device/keyword`, `device/info` | deteksi keyword suara & info device |
| Leaderboard | `leaderboard` | ranking multi-kategori |
| Misi | `quests/*` | harian/mingguan/bulanan |
| Sosial | `users/*`, `friendship/*`, `notifications/*` | teman, notifikasi, profil, gelar |
| Album | `album/*` | album foto siswa |
| Chat Global | `global-chat/messages` | obrolan publik semua siswa |
| Komunitas | `communities/*` | diskusi per mapel |
| DM | `dm/*` | personal chat antar user (send/thread/read/SSE) |
| EduPlay | `eduplay/meta` | metadata game; permainan via Socket.IO |
| EduTest | Socket.IO | alur ujian real-time |
| Cache/Stream | `cache/*`, `stream/*` | caching AI & SSE real-time |

Kunci transport async:
- **MQTT** (`mqttService.js`) untuk arah device.
- **SSE** (`streamService.js`) untuk broadcast dashboard dan pesan DM per-user.
- **Socket.IO** untuk room EduPlay/EduTest, dengan JWT di `handshake.auth.token`.
- **HTTP polling** ringan untuk Chat Global dan Komunitas.

AI dikonsolidasi di `aiService.js` (Gemini) dengan `fallbackService.js` sebagai
knowledge-base cadangan saat API AI gagal/timeout.


## 11. URL backend non-lokal (`config.js`)

Awalnya frontend hardcode `http://localhost:5000/api` di banyak tempat — gagal
saat dashboard diakses dari HP/STB atau link demo karena `localhost` menunjuk ke
device user. Sekarang `config.js` (root) menjadi **satu-satunya tempat** mengatur
URL backend: saat diakses dari domain selain `localhost`/`127.0.0.1`, frontend
otomatis memakai `window.EDUBOOK_API_URL` (saat ini ngrok
`https://blazer-repaying-backlight.ngrok-free.dev/api`). Menambah domain baru
cukup dengan mengatur `EDUBOOK_API_URL` dan memastikan domain frontend ada di
`CORS_ORIGINS` backend.

## 12. EduPlay dan EduTest (Socket.IO)

Kedua modul memakai Socket.IO pada HTTP server yang sama dengan REST API.
Autentikasi dilakukan dari `handshake.auth.token`; server memverifikasi JWT,
mengambil `User` dari database, lalu menyimpan identitas di `socket.data.user`.
Dengan begitu room tidak bisa diikuti tanpa token yang valid.

### EduPlay (`services/eduplayService.js`)

- Enam game: EduBattle, Word Rush, Brain Defense, Knowledge Quest, Fact or
  Bluff, dan Escape the Classroom.
- Host membuat room dengan kode 6 karakter atau memakai quick match. Jumlah
  pemain 1-6 tergantung game; bot disiapkan bila lawan tidak cukup.
- Soal diambil dari bank soal mapel/Buku dan paket konten terkurasi di
  `backend/data/eduplayQuestions.js`.
- Skor mempertimbangkan jawaban benar, kecepatan, dan streak. Hasil disimpan
  ke `GameResult`; `User.game_xp`, `game_rating`, dan `game_matches`
  diperbarui setelah pertandingan.
- Event client: `eduplay:resume`, `eduplay:create`, `eduplay:join`,
  `eduplay:quick`, `eduplay:ready`, `eduplay:start`, `eduplay:answer`,
  `eduplay:rematch`, `eduplay:leave`.
- Room, queue matchmaking, dan pool soal disimpan in-memory.

### EduTest (`services/edutestService.js`)

- Host membuat ujian dengan judul, durasi, batas peserta, serta 2-6 opsi
  jawaban per soal. Durasi `0` berarti tanpa batas; maks. peserta `0` berarti
  unlimited.
- Peserta join memakai kode 6 karakter. Host dapat memulai ujian, memantau
  progres jawaban, dan mengakhiri lebih awal.
- Timer berjalan di server; ujian otomatis selesai saat waktu habis. Peserta
  yang reconnect dapat melanjutkan lewat `edutest:resume`.
- Payload peserta tidak memuat kunci jawaban. Hasil host menampilkan ranking,
  skor, dan rekap soal; peserta menerima review jawaban sendiri.
- Event client: `edutest:create`, `edutest:join`, `edutest:resume`,
  `edutest:start`, `edutest:answer`, `edutest:end`, `edutest:leave`.
- Room dan jawaban peserta disimpan in-memory; tidak ada model database khusus
  EduTest.

## 13. Known trade-off yang belum diperbaiki (sengaja, untuk versi prototype)

- Cache in-memory (`cacheService.js`) tidak persist antar restart server dan
  tidak scalable ke multi-instance (misal kalau nanti deploy dengan load
  balancer). Untuk prototype single-server demo ini bukan masalah, tapi
  dicatat sebagai item "strategi scaling" untuk versi pasca-lomba.
- Room EduPlay/EduTest, antrean matchmaking, indikator online chat global, dan
  rate limit disimpan in-memory. Restart server menghapus semuanya dan
  deployment multi-instance membutuhkan store bersama (mis. Redis).
- Chat Global dan Komunitas masih memakai polling ±4 detik, belum push
  real-time; DM sudah memakai SSE per user.
- Achievement/badge saat ini sebagian dihitung di frontend (dari data agregat),
  bukan disimpan sebagai riwayat per-user; bisa dimigrasi ke snapshot DB bila
  ingin progres lintas-device yang tahan lama.
- Endpoint administratif (reset data siswa, mutasi cache, penambahan buku)
  dilindungi header `x-admin-key` yang cocok dengan `ADMIN_API_KEY`.
- Upload foto dibatasi ukuran & format (profil ≤2MB, album ≤5MB, hanya
  JPG/PNG/GIF/WebP). File upload disimpan di filesystem lokal `backend/uploads`.
- Firmware ESP32-S3 saat ini menggunakan WiFi statis (`WIFI_SSID`/`WIFI_PASSWORD`
  di `Config.h`). Untuk deployment nyata, perlu ditambahkan WiFi Manager
  (AP mode untuk konfigurasi) atau provisioning via BLE.
