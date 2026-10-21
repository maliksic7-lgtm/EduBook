// Paket konten terkurasi untuk EduPlay.
// Soal disusun & ditinjau manual, bukan dibuat AI saat permainan berlangsung.
// mcq: pertanyaan pilihan ganda dengan penjelasan untuk Learning Review.
// vocab: khusus Word Rush (tebak istilah dari definisi/petunjuk).
// factbluff: pernyataan Fakta/Bluff beserta penjelasan.

const mcq = [
    // ===== PENGETAHUAN UMUM =====
    { cat: 'umum', q: 'Apa lambang negara Indonesia?', options: ['Garuda Pancasila', 'Bhinneka Tunggal Ika', 'Bendera Merah Putih', 'Monas'], answer: 'Garuda Pancasila', exp: 'Garuda Pancasila adalah lambang negara Indonesia, sedangkan Bhinneka Tunggal Ika adalah semboyannya.' },
    { cat: 'umum', q: 'Semboyan "Bhinneka Tunggal Ika" memiliki arti ...', options: ['Berbeda-beda tetapi tetap satu', 'Bersatu kita teguh', 'Satu nusa satu bangsa', 'Indonesia tanah air beta'], answer: 'Berbeda-beda tetapi tetap satu', exp: 'Semboyan ini menegaskan persatuan dalam keberagaman suku, budaya, dan agama.' },
    { cat: 'umum', q: 'Proklamasi Kemerdekaan Indonesia dibacakan pada tanggal ...', options: ['17 Agustus 1945', '28 Oktober 1928', '1 Juni 1945', '10 November 1945'], answer: '17 Agustus 1945', exp: 'Proklamasi dibacakan oleh Soekarno didampingi Mohammad Hatta pada 17 Agustus 1945.' },
    { cat: 'umum', q: 'Ada berapa sila dalam Pancasila?', options: ['5', '4', '6', '3'], answer: '5', exp: 'Pancasila terdiri dari lima sila yang menjadi dasar negara Indonesia.' },
    { cat: 'umum', q: 'ASEAN didirikan di kota ...', options: ['Bangkok', 'Jakarta', 'Manila', 'Kuala Lumpur'], answer: 'Bangkok', exp: 'ASEAN didirikan di Bangkok, Thailand, pada 8 Agustus 1967.' },
    { cat: 'umum', q: 'Mata uang Jepang adalah ...', options: ['Yen', 'Won', 'Ringgit', 'Baht'], answer: 'Yen', exp: 'Yen (¥) adalah mata uang resmi Jepang.' },
    { cat: 'umum', q: 'Benua terluas di dunia adalah ...', options: ['Asia', 'Afrika', 'Amerika Utara', 'Eropa'], answer: 'Asia', exp: 'Asia adalah benua terluas sekaligus berpenduduk terbanyak di dunia.' },
    { cat: 'umum', q: 'Gunung tertinggi di Pulau Jawa adalah ...', options: ['Gunung Semeru', 'Gunung Merapi', 'Gunung Bromo', 'Gunung Slamet'], answer: 'Gunung Semeru', exp: 'Semeru (3.676 mdpl) adalah gunung tertinggi di Pulau Jawa.' },
    { cat: 'umum', q: 'Hari Pendidikan Nasional diperingati setiap tanggal ...', options: ['2 Mei', '17 Agustus', '1 Juni', '28 Oktober'], answer: '2 Mei', exp: 'Hardiknas diperingati pada 2 Mei, bertepatan dengan hari lahir Ki Hajar Dewantara.' },
    { cat: 'umum', q: 'Danau terluas di Indonesia adalah ...', options: ['Danau Toba', 'Danau Sentani', 'Danau Singkarak', 'Danau Batur'], answer: 'Danau Toba', exp: 'Danau Toba di Sumatra Utara adalah danau terluas di Indonesia.' },
    { cat: 'umum', q: 'Pahlawan nasional dari Maluku yang memimpin perlawanan terhadap Belanda adalah ...', options: ['Pattimura', 'Pangeran Diponegoro', 'Cut Nyak Dien', 'Sultan Hasanuddin'], answer: 'Pattimura', exp: 'Thomas Matulessy atau Pattimura memimpin perlawanan rakyat Maluku tahun 1817.' },
    { cat: 'umum', q: 'Organisasi yang mengesahkan UUD 1945 setelah proklamasi adalah ...', options: ['PPKI', 'BPUPKI', 'KNIP', 'Dewan Konstituante'], answer: 'PPKI', exp: 'PPKI mengesahkan UUD 1945 pada 18 Agustus 1945.' },

    // ===== SAINS =====
    { cat: 'sains', q: 'Proses fotosintesis menghasilkan ...', options: ['Oksigen dan glukosa', 'Karbon dioksida dan air', 'Nitrogen dan protein', 'Oksigen dan karbon dioksida'], answer: 'Oksigen dan glukosa', exp: 'Tumbuhan mengubah CO₂ dan air menjadi glukosa dengan bantuan cahaya, lalu melepaskan oksigen.' },
    { cat: 'sains', q: 'Satuan SI untuk gaya adalah ...', options: ['Newton', 'Joule', 'Watt', 'Pascal'], answer: 'Newton', exp: 'Gaya diukur dalam newton (N), sesuai Hukum Newton.' },
    { cat: 'sains', q: 'Planet terdekat dengan Matahari adalah ...', options: ['Merkurius', 'Venus', 'Bumi', 'Mars'], answer: 'Merkurius', exp: 'Merkurius berada paling dekat dengan Matahari dalam tata surya.' },
    { cat: 'sains', q: 'Organ utama sistem pernapasan manusia adalah ...', options: ['Paru-paru', 'Jantung', 'Hati', 'Ginjal'], answer: 'Paru-paru', exp: 'Paru-paru berperan dalam pertukaran oksigen dan karbon dioksida.' },
    { cat: 'sains', q: 'Rumus kimia air adalah ...', options: ['H₂O', 'CO₂', 'O₂', 'H₂O₂'], answer: 'H₂O', exp: 'Satu molekul air terdiri dari dua atom hidrogen dan satu atom oksigen.' },
    { cat: 'sains', q: 'Perubahan wujud dari padat langsung menjadi gas disebut ...', options: ['Sublimasi', 'Evaporasi', 'Kondensasi', 'Deposisi'], answer: 'Sublimasi', exp: 'Contoh sublimasi adalah kapur barus yang lama-lama habis di udara terbuka.' },
    { cat: 'sains', q: 'Bagian sel yang berperan sebagai penghasil energi adalah ...', options: ['Mitokondria', 'Ribosom', 'Nukleus', 'Vakuola'], answer: 'Mitokondria', exp: 'Mitokondria disebut "rumah pembangkit sel" karena menghasilkan ATP.' },
    { cat: 'sains', q: 'Kecepatan cahaya di ruang hampa sekitar ...', options: ['300.000 km/detik', '30.000 km/detik', '3.000 km/detik', '300 km/detik'], answer: '300.000 km/detik', exp: 'Cahaya merambat sekitar 299.792 km/detik di vakum.' },
    { cat: 'sains', q: 'Zat hijau daun yang berperan dalam fotosintesis disebut ...', options: ['Klorofil', 'Karoten', 'Hemoglobin', 'Xantofil'], answer: 'Klorofil', exp: 'Klorofil menangkap energi cahaya untuk proses fotosintesis.' },
    { cat: 'sains', q: 'Gerhana bulan terjadi ketika ...', options: ['Bumi berada di antara Matahari dan Bulan', 'Bulan berada di antara Matahari dan Bumi', 'Matahari berada di antara Bumi dan Bulan', 'Bulan dan Matahari sejajar di sisi yang sama'], answer: 'Bumi berada di antara Matahari dan Bulan', exp: 'Bayangan Bumi menutupi Bulan sehingga terjadi gerhana bulan.' },
    { cat: 'sains', q: 'Nilai pH untuk larutan netral adalah ...', options: ['7', '0', '14', '1'], answer: '7', exp: 'pH 7 menandakan netral; di bawah 7 asam dan di atas 7 basa.' },
    { cat: 'sains', q: 'Hewan mamalia yang bertelur adalah ...', options: ['Platipus', 'Kanguru', 'Lumba-lumba', 'Kelelawar'], answer: 'Platipus', exp: 'Platipus adalah mamalia monotremata yang berkembang biak dengan bertelur.' },

    // ===== MATEMATIKA =====
    { cat: 'matematika', q: '12 × 8 = ...', options: ['96', '84', '108', '92'], answer: '96', exp: '12 × 8 = 96.' },
    { cat: 'matematika', q: '√144 = ...', options: ['12', '14', '16', '11'], answer: '12', exp: '12 × 12 = 144, jadi akar kuadrat 144 adalah 12.' },
    { cat: 'matematika', q: 'Luas persegi dengan panjang sisi 7 cm adalah ...', options: ['49 cm²', '14 cm²', '28 cm²', '56 cm²'], answer: '49 cm²', exp: 'Luas persegi = sisi × sisi = 7 × 7 = 49 cm².' },
    { cat: 'matematika', q: '25% dari 200 adalah ...', options: ['50', '25', '75', '40'], answer: '50', exp: '25% = 1/4, sehingga 200 ÷ 4 = 50.' },
    { cat: 'matematika', q: 'Jumlah sudut dalam segitiga adalah ...', options: ['180°', '360°', '90°', '270°'], answer: '180°', exp: 'Sudut dalam segitiga selalu berjumlah 180 derajat.' },
    { cat: 'matematika', q: 'Keliling lingkaran berjari-jari 7 cm (π = 22/7) adalah ...', options: ['44 cm', '22 cm', '154 cm', '49 cm'], answer: '44 cm', exp: 'Keliling = 2πr = 2 × 22/7 × 7 = 44 cm.' },
    { cat: 'matematika', q: 'Nilai 2⁵ adalah ...', options: ['32', '16', '25', '64'], answer: '32', exp: '2⁵ = 2 × 2 × 2 × 2 × 2 = 32.' },
    { cat: 'matematika', q: 'Modus dari data 2, 3, 3, 5, 7 adalah ...', options: ['3', '2', '5', '7'], answer: '3', exp: 'Modus adalah nilai yang paling sering muncul, yaitu 3.' },
    { cat: 'matematika', q: 'Rata-rata dari 4, 6, dan 8 adalah ...', options: ['6', '5', '7', '4'], answer: '6', exp: '(4 + 6 + 8) ÷ 3 = 18 ÷ 3 = 6.' },
    { cat: 'matematika', q: 'Hasil dari 3/4 + 1/4 adalah ...', options: ['1', '1/2', '3/8', '1 1/4'], answer: '1', exp: '3/4 + 1/4 = 4/4 = 1.' },

    // ===== LOGIKA =====
    { cat: 'logika', q: 'Semua mamalia bernapas dengan paru-paru. Paus adalah mamalia. Kesimpulan yang tepat adalah ...', options: ['Paus bernapas dengan paru-paru', 'Paus bernapas dengan insang', 'Paus bukan mamalia', 'Paus tidak bernapas'], answer: 'Paus bernapas dengan paru-paru', exp: 'Silogisme: jika semua mamalia bernapas dengan paru-paru dan paus mamalia, maka paus bernapas dengan paru-paru.' },
    { cat: 'logika', q: 'Jika A > B dan B > C, maka ...', options: ['A > C', 'A < C', 'A = C', 'Tidak dapat ditentukan'], answer: 'A > C', exp: 'Sifat transitif pertidaksamaan: A > B > C sehingga A > C.' },
    { cat: 'logika', q: 'Lanjutkan pola: 2, 4, 8, 16, ...', options: ['32', '24', '20', '18'], answer: '32', exp: 'Setiap angka dikali 2 dari angka sebelumnya.' },
    { cat: 'logika', q: 'Lanjutkan pola: 1, 4, 9, 16, ...', options: ['25', '20', '24', '36'], answer: '25', exp: 'Pola bilangan kuadrat: 1², 2², 3², 4², maka berikutnya 5² = 25.' },
    { cat: 'logika', q: 'Ingkaran dari "Semua siswa suka matematika" adalah ...', options: ['Ada siswa yang tidak suka matematika', 'Semua siswa tidak suka matematika', 'Tidak ada siswa yang suka matematika', 'Semua siswa suka semua pelajaran'], answer: 'Ada siswa yang tidak suka matematika', exp: 'Ingkaran "semua A adalah B" adalah "ada A yang bukan B".' },
    { cat: 'logika', q: '3 mobil dan 2 sepeda motor memiliki total ... roda.', options: ['16', '14', '12', '18'], answer: '16', exp: '3 mobil × 4 roda = 12, 2 motor × 2 roda = 4, total 16 roda.' },
    { cat: 'logika', q: 'Jika 5 mesin membuat 5 kue dalam 5 menit, maka 100 mesin membuat berapa kue dalam 100 menit?', options: ['2000', '100', '500', '200'], answer: '2000', exp: '1 mesin membuat 1 kue per 5 menit. Dalam 100 menit, 1 mesin membuat 20 kue, sehingga 100 mesin membuat 2000 kue.' },
    { cat: 'logika', q: 'Ali lebih tua dari Budi, dan Budi lebih tua dari Cici. Siapa yang paling tua?', options: ['Ali', 'Budi', 'Cici', 'Tidak bisa ditentukan'], answer: 'Ali', exp: 'Urutan usia: Ali > Budi > Cici, jadi Ali paling tua.' },

    // ===== TEKNOLOGI & AIoT =====
    { cat: 'teknologi', q: 'IoT adalah singkatan dari ...', options: ['Internet of Things', 'Internet of Technology', 'Integrated Online Tools', 'Information of Things'], answer: 'Internet of Things', exp: 'IoT menghubungkan perangkat fisik ke internet agar bisa saling bertukar data.' },
    { cat: 'teknologi', q: 'Perangkat yang digunakan untuk mengukur suhu disebut ...', options: ['Sensor suhu', 'Aktuator', 'Relay', 'Buzzer'], answer: 'Sensor suhu', exp: 'Sensor suhu mengubah besaran suhu menjadi sinyal listrik yang bisa dibaca mikrokontroler.' },
    { cat: 'teknologi', q: 'Arduino merupakan contoh ...', options: ['Mikrokontroler', 'Sistem operasi', 'Bahasa pemrograman', 'Server web'], answer: 'Mikrokontroler', exp: 'Arduino adalah papan mikrokontroler yang populer untuk proyek elektronika dan IoT.' },
    { cat: 'teknologi', q: 'Protokol komunikasi ringan yang banyak dipakai pada perangkat IoT adalah ...', options: ['MQTT', 'HTTP', 'FTP', 'SMTP'], answer: 'MQTT', exp: 'MQTT dirancang hemat bandwidth dan cocok untuk perangkat IoT dengan koneksi terbatas.' },
    { cat: 'teknologi', q: '1 byte sama dengan ...', options: ['8 bit', '4 bit', '16 bit', '10 bit'], answer: '8 bit', exp: 'Satu byte terdiri dari 8 bit.' },
    { cat: 'teknologi', q: 'RAM termasuk memori yang bersifat ...', options: ['Volatile, data hilang saat daya mati', 'Non-volatile, data tetap tersimpan', 'Hanya bisa dibaca', 'Hanya untuk grafis'], answer: 'Volatile, data hilang saat daya mati', exp: 'RAM menyimpan data sementara selama perangkat menyala.' },
    { cat: 'teknologi', q: 'Berikut yang termasuk perangkat input adalah ...', options: ['Keyboard', 'Monitor', 'Printer', 'Speaker'], answer: 'Keyboard', exp: 'Keyboard memasukkan data ke komputer, sedangkan monitor dan printer adalah output.' },
    { cat: 'teknologi', q: 'AI adalah singkatan dari ...', options: ['Artificial Intelligence', 'Automated Internet', 'Advanced Input', 'Artificial Interface'], answer: 'Artificial Intelligence', exp: 'Artificial Intelligence atau kecerdasan buatan meniru kemampuan berpikir manusia.' },
    { cat: 'teknologi', q: 'Enkripsi bertujuan untuk ...', options: ['Mengubah data menjadi kode rahasia agar aman', 'Mempercepat koneksi internet', 'Menghapus data secara permanen', 'Mengompres ukuran gambar'], answer: 'Mengubah data menjadi kode rahasia agar aman', exp: 'Dengan enkripsi, data hanya bisa dibaca oleh pihak yang memiliki kunci.' },
    { cat: 'teknologi', q: 'Sensor yang mendeteksi gerakan tubuh untuk lampu otomatis adalah ...', options: ['Sensor PIR', 'Sensor LDR', 'Sensor suhu', 'Sensor gas'], answer: 'Sensor PIR', exp: 'Sensor PIR (Passive Infrared) mendeteksi radiasi inframerah dari gerakan manusia.' },

    // ===== LITERASI & BAHASA =====
    { cat: 'literasi', q: 'Penulisan yang efektif dan baku adalah ...', options: ['Para siswa mengikuti upacara.', 'Para siswa-siswa mengikuti upacara.', 'Para siswa-siswa pada mengikuti upacara.', 'Siswa-siswa para mengikuti upacara.'], answer: 'Para siswa mengikuti upacara.', exp: 'Kata "para" sudah bermakna jamak, jadi tidak perlu diulang dengan "siswa-siswa".' },
    { cat: 'literasi', q: 'Antonim dari kata "optimis" adalah ...', options: ['Pesimis', 'Yakin', 'Semangat', 'Ceria'], answer: 'Pesimis', exp: 'Optimis berarti yakin akan hasil baik, sedangkan pesimis berarti ragu/pesimis.' },
    { cat: 'literasi', q: 'Sinonim dari kata "inovatif" adalah ...', options: ['Kreatif', 'Konservatif', 'Statis', 'Rutin'], answer: 'Kreatif', exp: 'Inovatif berkaitan dengan kemampuan menciptakan hal baru, dekat maknanya dengan kreatif.' },
    { cat: 'literasi', q: 'Teks yang berisi langkah-langkah untuk melakukan sesuatu disebut teks ...', options: ['Prosedur', 'Narasi', 'Deskripsi', 'Argumentasi'], answer: 'Prosedur', exp: 'Teks prosedur berisi tujuan dan langkah-langkah berurutan.' },
    { cat: 'literasi', q: 'Gagasan utama sebuah paragraf disebut ...', options: ['Ide pokok', 'Kalimat penjelas', 'Kesimpulan', 'Judul'], answer: 'Ide pokok', exp: 'Ide pokok adalah inti pembahasan yang didukung kalimat penjelas.' },
    { cat: 'literasi', q: 'Kata baku yang benar adalah ...', options: ['Praktik', 'Praktek', 'Praktiek', 'Praktekk'], answer: 'Praktik', exp: 'Menurut KBBI, bentuk baku adalah "praktik".' },
    { cat: 'literasi', q: 'Majas pada kalimat "Angin berbisik lembut di telingaku" adalah ...', options: ['Personifikasi', 'Hiperbola', 'Metafora', 'Simile'], answer: 'Personifikasi', exp: 'Personifikasi memberi sifat manusia kepada benda, seperti angin yang "berbisik".' },
    { cat: 'literasi', q: 'Kalimat tanya diakhiri dengan tanda ...', options: ['Tanya (?)', 'Titik (.)', 'Seru (!)', 'Koma (,)'], answer: 'Tanya (?)', exp: 'Kalimat tanya diakhiri tanda tanya.' },

    // ===== SEJARAH & GEOGRAFI =====
    { cat: 'sejarah', q: 'Candi Borobudur dibangun pada masa Dinasti ...', options: ['Syailendra', 'Sanjaya', 'Mataram Islam', 'Majapahit'], answer: 'Syailendra', exp: 'Borobudur dibangun oleh Dinasti Syailendra pada abad ke-8.' },
    { cat: 'sejarah', q: 'Kerajaan maritim Sriwijaya berpusat di ...', options: ['Palembang', 'Majapahit', 'Kutai', 'Tarumanegara'], answer: 'Palembang', exp: 'Sriwijaya berkembang sebagai kerajaan maritim besar berpusat di Palembang.' },
    { cat: 'sejarah', q: 'Sumpah Pemuda dinyatakan pada tanggal ...', options: ['28 Oktober 1928', '17 Agustus 1945', '2 Mei 1908', '1 Juni 1945'], answer: '28 Oktober 1928', exp: 'Sumpah Pemuda menjadi tonggak persatuan pemuda Indonesia.' },
    { cat: 'geografi', q: 'Garis khayal yang membagi Bumi menjadi belahan utara dan selatan disebut ...', options: ['Ekuator', 'Meridian', 'Garis bujur', 'Garis balik'], answer: 'Ekuator', exp: 'Ekuator atau garis khatulistiwa berada pada lintang 0°.' },
    { cat: 'geografi', q: 'Indonesia memiliki dua musim karena dipengaruhi angin ...', options: ['Muson', 'Pasat', 'Fohn', 'Gunung'], answer: 'Muson', exp: 'Angin muson berganti arah setiap setengah tahun sehingga terjadi musim hujan dan kemarau.' },
    { cat: 'geografi', q: 'Indonesia terletak pada jalur ... yang menyebabkan banyak gunung berapi.', options: ['Cincin Api Pasifik', 'Garis Khatulistiwa', 'Jalur Sutra', 'Sabuk Alpide'], answer: 'Cincin Api Pasifik', exp: 'Indonesia berada di pertemuan lempeng tektonik yang membentuk Cincin Api Pasifik.' },

    // ===== LITERASI DIGITAL =====
    { cat: 'literasi_digital', q: 'Ciri berita hoaks yang paling menonjol adalah ...', options: ['Judul provokatif dan meminta segera disebarkan', 'Sumber dan penulis jelas', 'Data dan tanggal terverifikasi', 'Mengutip lembaga resmi'], answer: 'Judul provokatif dan meminta segera disebarkan', exp: 'Hoaks sering memancing emosi dan mendesak orang menyebarkan tanpa verifikasi.' },
    { cat: 'literasi_digital', q: 'Password yang paling kuat adalah ...', options: ['Kombinasi huruf besar-kecil, angka, dan simbol', 'Tanggal lahir', 'Nama sendiri', '12345678'], answer: 'Kombinasi huruf besar-kecil, angka, dan simbol', exp: 'Kata sandi panjang dan beragam karakter lebih sulit ditebak.' },
    { cat: 'literasi_digital', q: 'Phishing adalah ...', options: ['Penipuan untuk mencuri data pribadi', 'Cara mempercepat internet', 'Aplikasi edit foto', 'Metode belajar online'], answer: 'Penipuan untuk mencuri data pribadi', exp: 'Phishing menyamar sebagai pihak resmi untuk memancing korban menyerahkan data.' },
    { cat: 'literasi_digital', q: 'Jejak digital adalah ...', options: ['Data yang tertinggal dari aktivitas kita di internet', 'File yang dihapus dari komputer', 'Koneksi internet yang lambat', 'Alamat IP rumah'], answer: 'Data yang tertinggal dari aktivitas kita di internet', exp: 'Setiap unggahan, komentar, dan pencarian meninggalkan jejak digital.' },
    { cat: 'literasi_digital', q: 'Langkah pertama memverifikasi berita adalah ...', options: ['Cek sumber dan bandingkan dengan media kredibel', 'Langsung menyebarkan ke grup', 'Percaya karena banyak yang membagikan', 'Melihat jumlah komentar'], answer: 'Cek sumber dan bandingkan dengan media kredibel', exp: 'Verifikasi sumber adalah kunci sebelum mempercayai atau menyebarkan informasi.' },
    { cat: 'literasi_digital', q: 'Menggunakan karya orang lain tanpa izin dan mengakuinya sebagai milik sendiri disebut ...', options: ['Plagiarisme', 'Parafrase', 'Sitasi', 'Apresiasi'], answer: 'Plagiarisme', exp: 'Plagiarisme melanggar hak cipta dan etika akademik.' }
];

const vocab = [
    { q: 'Istilah bahasa Inggris untuk "fotosintesis" adalah ...', options: ['Photosynthesis', 'Photography', 'Photon', 'Synthesis'], answer: 'Photosynthesis', exp: 'Photosynthesis = proses tumbuhan mengolah cahaya menjadi makanan.' },
    { q: 'Istilah bahasa Inggris untuk "gravitasi" adalah ...', options: ['Gravity', 'Gravy', 'Grave', 'Graph'], answer: 'Gravity', exp: 'Gravity adalah gaya tarik bumi terhadap benda.' },
    { q: 'Istilah bahasa Inggris untuk "ekosistem" adalah ...', options: ['Ecosystem', 'Economy', 'Ecology', 'System'], answer: 'Ecosystem', exp: 'Ecosystem = hubungan timbal balik makhluk hidup dengan lingkungannya.' },
    { q: 'Istilah bahasa Inggris untuk "energi terbarukan" adalah ...', options: ['Renewable energy', 'Reusable energy', 'Raw energy', 'Rapid energy'], answer: 'Renewable energy', exp: 'Renewable energy berasal dari sumber yang dapat diperbarui seperti matahari dan angin.' },
    { q: 'Istilah bahasa Inggris untuk "algoritma" adalah ...', options: ['Algorithm', 'Algorism', 'Logarithm', 'Rhythm'], answer: 'Algorithm', exp: 'Algorithm adalah urutan langkah logis untuk menyelesaikan masalah.' },
    { q: 'Istilah bahasa Inggris untuk "enkripsi" adalah ...', options: ['Encryption', 'Description', 'Decryption', 'Inscription'], answer: 'Encryption', exp: 'Encryption mengubah data menjadi kode agar tidak bisa dibaca sembarang orang.' },
    { q: 'Istilah bahasa Inggris untuk "basis data" adalah ...', options: ['Database', 'Datafile', 'Spreadsheet', 'Datastore'], answer: 'Database', exp: 'Database adalah kumpulan data terorganisasi yang dapat diakses secara elektronik.' },
    { q: 'Istilah bahasa Inggris untuk "kosakata" adalah ...', options: ['Vocabulary', 'Vocal', 'Dictionary', 'Grammar'], answer: 'Vocabulary', exp: 'Vocabulary adalah kumpulan kata yang dikuasai seseorang.' },
    { q: 'Istilah bahasa Inggris untuk "paragraf" adalah ...', options: ['Paragraph', 'Paraphrase', 'Passage', 'Phrase'], answer: 'Paragraph', exp: 'Paragraph adalah bagian teks yang berisi satu ide pokok.' },
    { q: 'Istilah bahasa Inggris untuk "hipotesis" adalah ...', options: ['Hypothesis', 'Hyperbole', 'Thesis', 'Synthesis'], answer: 'Hypothesis', exp: 'Hypothesis adalah dugaan sementara yang perlu diuji.' },
    { q: 'Istilah bahasa Inggris untuk "percobaan" adalah ...', options: ['Experiment', 'Experience', 'Example', 'Examination'], answer: 'Experiment', exp: 'Experiment adalah kegiatan uji coba untuk membuktikan hipotesis.' },
    { q: 'Istilah bahasa Inggris untuk "budaya" adalah ...', options: ['Culture', 'Cultivate', 'Custom', 'Ceremony'], answer: 'Culture', exp: 'Culture mencakup nilai, kebiasaan, dan hasil karya masyarakat.' },
    { q: 'Istilah bahasa Inggris untuk "lingkungan" adalah ...', options: ['Environment', 'Envelope', 'Equipment', 'Enterprise'], answer: 'Environment', exp: 'Environment adalah kondisi sekitar tempat makhluk hidup berada.' },
    { q: 'Istilah bahasa Inggris untuk "demokrasi" adalah ...', options: ['Democracy', 'Demography', 'Bureaucracy', 'Aristocracy'], answer: 'Democracy', exp: 'Democracy adalah sistem pemerintahan oleh rakyat.' },
    { q: 'Istilah bahasa Inggris untuk "mata uang" adalah ...', options: ['Currency', 'Current', 'Account', 'Capital'], answer: 'Currency', exp: 'Currency adalah alat pembayaran yang berlaku di suatu negara.' },
    { q: 'Istilah bahasa Inggris untuk "pewarisan sifat" adalah ...', options: ['Heredity', 'Heritage', 'History', 'Hierarchy'], answer: 'Heredity', exp: 'Heredity adalah penurunan sifat dari orang tua ke anak.' },
    { q: 'Istilah bahasa Inggris untuk "keliling lingkaran" adalah ...', options: ['Circumference', 'Circumstance', 'Diameter', 'Radius'], answer: 'Circumference', exp: 'Circumference adalah panjang garis tepi lingkaran.' },
    { q: 'Istilah bahasa Inggris untuk "bukti" adalah ...', options: ['Evidence', 'Evident', 'Event', 'Advice'], answer: 'Evidence', exp: 'Evidence adalah bukti yang mendukung suatu pernyataan.' },
    { q: 'Istilah bahasa Inggris untuk "jaringan komputer" adalah ...', options: ['Computer network', 'Computer system', 'Computer device', 'Computer science'], answer: 'Computer network', exp: 'Computer network menghubungkan beberapa komputer agar dapat bertukar data.' },
    { q: 'Istilah bahasa Inggris untuk "keamanan siber" adalah ...', options: ['Cybersecurity', 'Cybercrime', 'Cipher', 'Security guard'], answer: 'Cybersecurity', exp: 'Cybersecurity adalah upaya melindungi sistem dan data dari serangan digital.' }
];

const factbluff = [
    { statement: 'Air mendidih pada suhu 100°C di tekanan udara 1 atm.', isFact: true, exp: 'Pada tekanan 1 atm, titik didih air memang 100°C.' },
    { statement: 'Manusia hanya menggunakan 10% otaknya.', isFact: false, exp: 'Mitos. Pemindaian otak menunjukkan seluruh bagian otak aktif digunakan.' },
    { statement: 'Cahaya bergerak lebih cepat daripada suara.', isFact: true, exp: 'Cahaya ±300.000 km/s, jauh lebih cepat dari suara ±343 m/s di udara.' },
    { statement: 'Bumi adalah planet terdekat dari Matahari.', isFact: false, exp: 'Planet terdekat dari Matahari adalah Merkurius.' },
    { statement: 'Antibiotik efektif untuk mengobati penyakit yang disebabkan virus.', isFact: false, exp: 'Antibiotik membunuh bakteri, bukan virus seperti flu atau pilek.' },
    { statement: 'Satu byte sama dengan 8 bit.', isFact: true, exp: 'Satu byte terdiri dari 8 bit.' },
    { statement: 'MQTT adalah protokol ringan yang banyak dipakai pada perangkat IoT.', isFact: true, exp: 'MQTT hemat bandwidth dan cocok untuk komunikasi perangkat IoT.' },
    { statement: 'DNA hanya ditemukan pada hewan, tidak pada tumbuhan.', isFact: false, exp: 'Semua makhluk hidup, termasuk tumbuhan, memiliki DNA.' },
    { statement: 'Paus termasuk mamalia, bukan ikan.', isFact: true, exp: 'Paus bernapas dengan paru-paru dan menyusui anaknya, ciri mamalia.' },
    { statement: 'Semboyan Bhinneka Tunggal Ika diambil dari Kakawin Sutasoma karya Mpu Tantular.', isFact: true, exp: 'Semboyan tersebut berasal dari Kakawin Sutasoma.' },
    { statement: 'Semua jenis logam dapat ditarik oleh magnet.', isFact: false, exp: 'Hanya logam feromagnetik seperti besi, nikel, dan kobalt yang kuat ditarik magnet.' },
    { statement: 'Matahari mengelilingi Bumi.', isFact: false, exp: 'Bumi dan planet lain mengelilingi Matahari.' },
    { statement: 'Fotosintesis terjadi di mitokondria.', isFact: false, exp: 'Fotosintesis terjadi di kloroplas, sedangkan mitokondria menghasilkan energi.' },
    { statement: 'Indonesia memiliki lebih dari 17.000 pulau.', isFact: true, exp: 'Data resmi mencatat lebih dari 17.000 pulau di Indonesia.' }
];

module.exports = { mcq, vocab, factbluff };
