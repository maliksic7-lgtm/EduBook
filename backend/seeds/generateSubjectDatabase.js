const fs = require('fs');
const path = require('path');
const SUBJECTS = require('./subjects');

const fs = require('fs');
const path = require('path');
const SUBJECTS = require('./subjects');

const fs = require('fs');
const path = require('path');
const SUBJECTS = require('./subjects');

const fs = require('fs');
const path = require('path');
const SUBJECTS = require('./subjects');

const fs = require('fs');
const path = require('path');
const SUBJECTS = require('./subjects');

const fs = require('fs');
const path = require('path');
const SUBJECTS = require('./subjects');

const fs = require('fs');
const path = require('path');
const SUBJECTS = require('./subjects');

const fs = require('fs');
const path = require('path');
const SUBJECTS = require('./subjects');

const fs = require('fs');
const path = require('path');
const SUBJECTS = require('./subjects');

const fs = require('fs');
const path = require('path');
const SUBJECTS = require('./subjects');

const fs = require('fs');
const path = require('path');
const SUBJECTS = require('./subjects');

const fs = require('fs');
const path = require('path');
const SUBJECTS = require('./subjects');

const fs = require('fs');
const path = require('path');
const SUBJECTS = require('./subjects');

const fs = require('fs');
const path = require('path');
const SUBJECTS = require('./subjects');

const fs = require('fs');
const path = require('path');
const SUBJECTS = require('./subjects');

const fs = require('fs');
const path = require('path');
const SUBJECTS = require('./subjects');

const fs = require('fs');
const path = require('path');
const SUBJECTS = require('./subjects');

const fs = require('fs');
const path = require('path');
const SUBJECTS = require('./subjects');

const fs = require('fs');
const path = require('path');
const SUBJECTS = require('./subjects');

const fs = require('fs');
const path = require('path');
const SUBJECTS = require('./subjects');

const fs = require('fs');
const path = require('path');
const SUBJECTS = require('./subjects');

const fs = require('fs');
const path = require('path');
const SUBJECTS = require('./subjects');

const fs = require('fs');
const path = require('path');
const SUBJECTS = require('./subjects');

const fs = require('fs');
const path = require('path');
const SUBJECTS = require('./subjects');

const fs = require('fs');
const path = require('path');
const SUBJECTS = require('./subjects');

const SUBJECT_CONTENT = {
    sd_ppkn: {
        topics: ['Pengenalan Pancasila', 'Sila ke-1: Ketuhanan Yang Maha Esa', 'Sila ke-2: Kemanusiaan yang Adil dan Beradab', 'Sila ke-3: Persatuan Indonesia', 'Sila ke-4: Kerakyatan', 'Sila ke-5: Keadilan Sosial', 'Lambang Garuda Pancasila', 'Nilai-nilai Pancasila dalam Kehidupan', 'Penerapan Pancasila di Sekolah', 'Pancasila sebagai Dasar Negara'],
        facts: [
            'Pancasila adalah dasar negara Republik Indonesia yang terdiri dari lima sila.',
            'Pancasila disahkan pada tanggal 18 Agustus 1945 oleh Panitia Persiapan Kemerdekaan Indonesia.',
            'Lambang Pancasila adalah Garuda Pancasila dengan perisai berisi lima sila.',
            'Sila pertama Pancasila adalah Ketuhanan Yang Maha Esa dengan lambang bintang.',
            'Sila kedua adalah Kemanusiaan yang Adil dan Beradab dengan lambang rantai.',
            'Sila ketiga adalah Persatuan Indonesia dengan lambang pohon beringin.',
            'Sila keempat adalah Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan dalam Permusyawaratan/Perwakilan dengan lambang kepala banteng.',
            'Sila kelima adalah Keadilan Sosial bagi Seluruh Rakyat Indonesia dengan lambang padi dan kapas.',
            'Pancasila berasal dari bahasa Sanskerta: panca berarti lima, sila berarti prinsip atau asas.',
            'Ir. Soekarno adalah orang yang pertama kali mengemukakan istilah Pancasila pada sidang BPUPKI.',
            'Pancasila menjadi sumber dari segala sumber hukum di Indonesia.',
            'Nilai-nilai Pancasila harus diterapkan dalam kehidupan sehari-hari.',
            'Pancasila mengajarkan kita untuk saling menghormati dan mencintai sesama.',
            'Pancasila mengajarkan keadilan untuk semua rakyat Indonesia.',
            'Pancasila mengutamakan persatuan dan kesatuan bangsa.',
            'Pancasila mengajarkan untuk bermusyawarah dalam mengambil keputusan.',
            'Pancasila mengajarkan untuk berperilaku adil dan beradab.',
            'Pancasila mengajarkan untuk percaya kepada Tuhan Yang Maha Esa.',
            'Pancasila mengajarkan untuk mencintai tanah air Indonesia.'
        ],
        quiz: [
            { q: 'Apa dasar negara Indonesia?', options: ['Pancasila', 'UUD 1945', 'Bhineka Tunggal Ika', 'NKRI'], a: 0, type: 'mcq' },
            { q: 'Berapa jumlah sila dalam Pancasila?', options: ['3', '4', '5', '6'], a: 2, type: 'mcq' },
            { q: 'Kapan Pancasila disahkan?', options: ['17 Agustus 1945', '18 Agustus 1945', '20 Mei 1945', '1 Juni 1945'], a: 1, type: 'mcq' },
            { q: 'Apa lambang sila pertama Pancasila?', options: ['Rantai', 'Bintang', 'Pohon beringin', 'Kepala banteng'], a: 1, type: 'mcq' },
            { q: 'Apa lambang sila kedua Pancasila?', options: ['Bintang', 'Rantai', 'Padi dan kapas', 'Pohon beringin'], a: 1, type: 'mcq' },
            { q: 'Siapa yang pertama kali mengemukakan istilah Pancasila?', options: ['Mohammad Hatta', 'Ir. Soekarno', 'Soepomo', 'Tan Malaka'], a: 1, type: 'mcq' },
            { q: 'Apa lambang negara Indonesia?', options: ['Garuda Pancasila', 'Bendera Merah Putih', 'Lagu Indonesia Raya', 'Bahasa Indonesia'], a: 0, type: 'mcq' },
            { q: 'Sila ketiga Pancasila adalah?', options: ['Ketuhanan Yang Maha Esa', 'Kemanusiaan yang Adil dan Beradab', 'Persatuan Indonesia', 'Keadilan Sosial'], a: 2, type: 'mcq' },
            { q: 'Apa lambang sila keempat Pancasila?', options: ['Bintang', 'Rantai', 'Pohon beringin', 'Kepala banteng'], a: 3, type: 'mcq' },
            { q: 'Sila kelima Pancasila adalah?', options: ['Kerakyatan', 'Keadilan Sosial bagi Seluruh Rakyat Indonesia', 'Persatuan Indonesia', 'Kemanusiaan'], a: 1, type: 'mcq' },
            { q: 'Pancasila berasal dari bahasa apa?', options: ['Latin', 'Sanskerta', 'Arab', 'Jawa'], a: 1, type: 'mcq' },
            { q: 'Panca berarti?', options: ['Tiga', 'Empat', 'Lima', 'Enam'], a: 2, type: 'mcq' },
            { q: 'Sila berarti?', options: ['Prinsip atau asas', 'Aturan', 'Hukum', 'Perintah'], a: 0, type: 'mcq' },
            { q: 'Pancasila disahkan oleh?', options: ['MPR', 'PPKI', 'DPR', 'Presiden'], a: 1, type: 'mcq' },
            { q: 'Pancasila menjadi sumber dari?', options: ['Segala sumber hukum', 'UUD 1945', 'UU', 'PP'], a: 0, type: 'mcq' },
            { q: 'Nilai-nilai Pancasila harus diterapkan dalam?', options: ['Kehidupan sehari-hari', 'Sekolah saja', 'Kantor saja', 'Tidak perlu'], a: 0, type: 'mcq' },
            { q: 'Pancasila mengajarkan untuk?', options: ['Saling menghormati', 'Saling membenci', 'Saling menghindar', 'Saling mengabaikan'], a: 0, type: 'mcq' },
            { q: 'Pancasila mengajarkan keadilan untuk?', options: ['Semua rakyat Indonesia', 'Sebagian rakyat', 'Tidak ada', 'Hanya pejabat'], a: 0, type: 'mcq' },
            { q: 'Pancasila mengutamakan?', options: ['Persatuan dan kesatuan bangsa', 'Perpecahan', 'Konflik', 'Perbedaan'], a: 0, type: 'mcq' },
            { q: 'Pancasila mengajarkan untuk bermusyawarah dalam?', options: ['Mengambil keputusan', 'Bertengkar', 'Berdebat', 'Berhenti'], a: 0, type: 'mcq' }
        ]
    },
    sd_bindo: {
        topics: ['Pengenalan Huruf dan Kata', 'Membaca Kata Sederhana', 'Menulis Kalimat Sederhana', 'Jenis-jenis Kata', 'Kata Sifat dan Kata Kerja', 'Cerita Pendek', 'Puisi Anak', 'Tanda Baca', 'Sinonim dan Antonim', 'Menulis Surat Pribadi'],
        facts: [
            'Bahasa Indonesia adalah bahasa resmi Republik Indonesia.',
            'Bahasa Indonesia menggunakan huruf Latin yang terdiri dari 26 huruf.',
            'Kata adalah satuan bahasa terkecil yang memiliki makna.',
            'Kalimat adalah gabungan beberapa kata yang memiliki makna lengkap.',
            'Tanda baca digunakan untuk memberi jeda dan intonasi dalam membaca.',
            'Tanda titik (.) digunakan untuk mengakhiri kalimat.',
            'Tanda koma (,) digunakan untuk memisahkan kata dalam kalimat.',
            'Tanda tanya (?) digunakan untuk kalimat tanya.',
            'Tanda seru (!) digunakan untuk kalimat perintah atau seruan.',
            'Sinonim adalah kata yang memiliki makna sama atau mirip.',
            'Antonim adalah kata yang memiliki makna berlawanan.',
            'Cerita pendek adalah cerita yang singkat dan memiliki alur yang jelas.',
            'Puisi adalah karya sastra yang memiliki irama dan rima.',
            'Surat pribadi adalah surat yang ditulis untuk keperluan pribadi.',
            'Paragraf adalah bagian dari tulisan yang terdiri dari beberapa kalimat.',
            'Ide pokok adalah gagasan utama dalam sebuah paragraf.',
            'Kalimat utama adalah kalimat yang mengandung ide pokok.',
            'Kalimat penjelas adalah kalimat yang menjelaskan kalimat utama.',
            'Membaca adalah proses memahami makna tulisan.',
            'Menulis adalah proses mengungkapkan pikiran dalam bentuk tulisan.'
        ],
        quiz: [
            { q: 'Apa bahasa resmi Indonesia?', options: ['Bahasa Jawa', 'Bahasa Indonesia', 'Bahasa Inggris', 'Bahasa Melayu'], a: 1, type: 'mcq' },
            { q: 'Berapa jumlah huruf dalam abjad Indonesia?', options: ['24', '25', '26', '27'], a: 2, type: 'mcq' },
            { q: 'Tanda baca apa yang digunakan untuk mengakhiri kalimat?', options: ['Koma', 'Titik', 'Tanda tanya', 'Tanda seru'], a: 1, type: 'mcq' },
            { q: 'Apa sinonim dari kata "besar"?', options: ['Kecil', 'Luas', 'Tinggi', 'Panjang'], a: 1, type: 'mcq' },
            { q: 'Apa antonim dari kata "tinggi"?', options: ['Besar', 'Kecil', 'Rendah', 'Luas'], a: 2, type: 'mcq' },
            { q: 'Apa yang dimaksud dengan kalimat?', options: ['Gabungan huruf', 'Gabungan kata bermakna', 'Tanda baca', 'Paragraf'], a: 1, type: 'mcq' },
            { q: 'Apa ide pokok dalam sebuah paragraf?', options: ['Kalimat terakhir', 'Gagasan utama', 'Kalimat pertama', 'Tanda baca'], a: 1, type: 'mcq' },
            { q: 'Apa yang dimaksud dengan puisi?', options: ['Cerita panjang', 'Karya sastra berirama', 'Surat', 'Artikel'], a: 1, type: 'mcq' },
            { q: 'Apa fungsi tanda tanya?', options: ['Mengakhiri kalimat', 'Kalimat tanya', 'Memisahkan kata', 'Seruan'], a: 1, type: 'mcq' },
            { q: 'Apa yang dimaksud dengan membaca?', options: ['Menulis', 'Memahami tulisan', 'Mengucapkan', 'Mendengarkan'], a: 1, type: 'mcq' },
            { q: 'Huruf vokal dalam bahasa Indonesia ada berapa?', options: ['3', '4', '5', '6'], a: 2, type: 'mcq' },
            { q: 'Huruf vokal yang benar adalah?', options: ['A, I, U, E, O', 'A, B, C, D, E', 'A, I, U, O, P', 'A, E, I, O, U'], a: 0, type: 'mcq' },
            { q: 'Kata "buku" termasuk kata?', options: ['Kerja', 'Sifat', 'Benda', 'Keterangan'], a: 2, type: 'mcq' },
            { q: 'Kata "merah" termasuk kata?', options: ['Kerja', 'Sifat', 'Benda', 'Keterangan'], a: 1, type: 'mcq' },
            { q: 'Kata "lari" termasuk kata?', options: ['Kerja', 'Sifat', 'Benda', 'Keterangan'], a: 0, type: 'mcq' },
            { q: 'Kalimat "Adik membaca buku" termasuk kalimat?', options: ['Tanya', 'Perintah', 'Berita', 'Seruan'], a: 2, type: 'mcq' },
            { q: 'Kalimat "Tolong pintu!" termasuk kalimat?', options: ['Tanya', 'Perintah', 'Berita', 'Seruan'], a: 1, type: 'mcq' },
            { q: 'Kalimat "Berapa harga buku ini?" termasuk kalimat?', options: ['Tanya', 'Perintah', 'Berita', 'Seruan'], a: 0, type: 'mcq' },
            { q: 'Kalimat "Wah, indahnya pemandangan!" termasuk kalimat?', options: ['Tanya', 'Perintah', 'Berita', 'Seruan'], a: 3, type: 'mcq' }
        ]
    },
    sd_mtk: {
        topics: ['Pengenalan Bilangan', 'Penjumlahan', 'Pengurangan', 'Perkalian', 'Pembagian', 'Bilangan Ganjil dan Genap', 'Geometri Dasar', 'Pengukuran', 'Waktu dan Tanggal', 'Uang dan Berbelanja'],
        facts: [
            'Bilangan adalah angka yang digunakan untuk menghitung.',
            'Bilangan asli adalah bilangan yang dimulai dari 1, 2, 3, dan seterusnya.',
            'Bilangan genap adalah bilangan yang habis dibagi 2.',
            'Bilangan ganjil adalah bilangan yang tidak habis dibagi 2.',
            'Penjumlahan adalah operasi menambahkan bilangan.',
            'Pengurangan adalah operasi mengurangkan bilangan.',
            'Perkalian adalah operasi penjumlahan berulang.',
            'Pembagian adalah operasi membagi bilangan menjadi bagian yang sama.',
            'Segitiga adalah bangun datar yang memiliki tiga sisi.',
            'Persegi adalah bangun datar yang memiliki empat sisi sama panjang.',
            'Persegi panjang adalah bangun datar yang memiliki dua pasang sisi sama panjang.',
            'Lingkaran adalah bangun datar yang memiliki bentuk bulat.',
            'Satuan panjang adalah meter, centimeter, dan kilometer.',
            'Satuan berat adalah gram dan kilogram.',
            'Satuan waktu adalah detik, menit, jam, hari, minggu, bulan, dan tahun.',
            '1 jam sama dengan 60 menit.',
            '1 hari sama dengan 24 jam.',
            '1 minggu sama dengan 7 hari.',
            '1 tahun sama dengan 12 bulan.',
            'Uang adalah alat pembayaran yang sah di Indonesia.'
        ],
        quiz: [
            { q: 'Berapa hasil dari 5 + 3?', options: ['6', '7', '8', '9'], a: 2, type: 'mcq' },
            { q: 'Berapa hasil dari 10 - 4?', options: ['4', '5', '6', '7'], a: 2, type: 'mcq' },
            { q: 'Berapa hasil dari 3 x 4?', options: ['7', '10', '12', '14'], a: 2, type: 'mcq' },
            { q: 'Berapa hasil dari 12 : 3?', options: ['2', '3', '4', '6'], a: 2, type: 'mcq' },
            { q: 'Manakah bilangan genap?', options: ['3', '5', '7', '8'], a: 3, type: 'mcq' },
            { q: 'Manakah bilangan ganjil?', options: ['2', '4', '6', '7'], a: 3, type: 'mcq' },
            { q: 'Berapa sisi segitiga?', options: ['3', '4', '5', '6'], a: 0, type: 'mcq' },
            { q: 'Berapa sisi persegi?', options: ['3', '4', '5', '6'], a: 1, type: 'mcq' },
            { q: '1 jam sama dengan berapa menit?', options: ['30', '60', '100', '24'], a: 1, type: 'mcq' },
            { q: '1 minggu sama dengan berapa hari?', options: ['5', '6', '7', '10'], a: 2, type: 'mcq' },
            { q: 'Berapa hasil dari 7 + 8?', options: ['13', '14', '15', '16'], a: 2, type: 'mcq' },
            { q: 'Berapa hasil dari 15 - 7?', options: ['6', '7', '8', '9'], a: 2, type: 'mcq' },
            { q: 'Berapa hasil dari 6 x 3?', options: ['12', '15', '18', '21'], a: 2, type: 'mcq' },
            { q: 'Berapa hasil dari 20 : 4?', options: ['3', '4', '5', '6'], a: 2, type: 'mcq' },
            { q: 'Manakah bilangan genap?', options: ['11', '13', '15', '16'], a: 3, type: 'mcq' },
            { q: 'Manakah bilangan ganjil?', options: ['10', '12', '14', '17'], a: 3, type: 'mcq' },
            { q: 'Berapa sisi persegi panjang?', options: ['3', '4', '5', '6'], a: 1, type: 'mcq' },
            { q: '1 hari sama dengan berapa jam?', options: ['12', '18', '24', '36'], a: 2, type: 'mcq' },
            { q: '1 tahun sama dengan berapa bulan?', options: ['10', '11', '12', '13'], a: 2, type: 'mcq' }
        ]
    },
    sd_ipas: {
        topics: ['Alam Sekitar', 'Siklus Air', 'Sistem Tata Surya', 'Tubuh Manusia', 'Hewan dan Tumbuhan', 'Cuaca dan Iklim', 'Benda Mati dan Makhluk Hidup', 'Sumber Daya Alam', 'Lingkungan Hidup', 'Perubahan Benda'],
        facts: [
            'Alam sekitar adalah segala sesuatu yang ada di sekitar kita.',
            'Siklus air adalah perjalanan air dari bumi ke atmosfer dan kembali ke bumi.',
            'Sistem tata surya terdiri dari matahari dan planet-planet yang mengelilinginya.',
            'Bumi adalah planet ketiga dari matahari.',
            'Matahari adalah bintang di pusat tata surya.',
            'Tubuh manusia terdiri dari kepala, badan, tangan, dan kaki.',
            'Hewan adalah makhluk hidup yang dapat bergerak dan membutuhkan makanan.',
            'Tumbuhan adalah makhluk hidup yang dapat membuat makanan sendiri.',
            'Cuaca adalah keadaan atmosfer pada waktu dan tempat tertentu.',
            'Iklim adalah keadaan cuaca rata-rata dalam waktu lama.',
            'Benda mati adalah benda yang tidak hidup seperti batu dan air.',
            'Makhluk hidup adalah makhluk yang bernapas, makan, dan berkembang biak.',
            'Sumber daya alam adalah segala sesuatu yang ada di alam yang dapat dimanfaatkan.',
            'Lingkungan hidup adalah segala sesuatu yang ada di sekitar makhluk hidup.',
            'Perubahan benda dapat berupa perubahan bentuk, ukuran, atau wujud.',
            'Air dapat berubah menjadi es jika didinginkan.',
            'Air dapat berubah menjadi uap jika dipanaskan.',
            'Es dapat mencair jika dipanaskan.',
            'Uap dapat mengembun jika didinginkan.',
            'Pohon menghasilkan oksigen yang dibutuhkan manusia.'
        ],
        quiz: [
            { q: 'Apa pusat tata surya?', options: ['Bumi', 'Bulan', 'Matahari', 'Mars'], a: 2, type: 'mcq' },
            { q: 'Planet manakah yang terdekat dengan matahari?', options: ['Venus', 'Merkurius', 'Bumi', 'Mars'], a: 1, type: 'mcq' },
            { q: 'Berapa jumlah planet di tata surya?', options: ['7', '8', '9', '10'], a: 1, type: 'mcq' },
            { q: 'Apa yang dihasilkan tumbuhan dari fotosintesis?', options: ['Karbon dioksida', 'Oksigen', 'Nitrogen', 'Hidrogen'], a: 1, type: 'mcq' },
            { q: 'Hewan termasuk makhluk apa?', options: ['Benda mati', 'Makhluk hidup', 'Benda tak hidup', 'Benda alam'], a: 1, type: 'mcq' },
            { q: 'Apa yang dimaksud dengan cuaca?', options: ['Keadaan atmosfer', 'Keadaan tanah', 'Keadaan water', 'Keadaan udara'], a: 0, type: 'mcq' },
            { q: 'Air berubah menjadi es jika?', options: ['Dipanaskan', 'Didinginkan', 'Dibiarkan', 'Dikocok'], a: 1, type: 'mcq' },
            { q: 'Apa yang dibutuhkan manusia untuk bernapas?', options: ['Karbon dioksida', 'Oksigen', 'Nitrogen', 'Hidrogen'], a: 1, type: 'mcq' },
            { q: 'Tumbuhan membuat makanan melalui proses?', options: ['Respirasi', 'Fotosintesis', 'Fermentasi', 'Osmosis'], a: 1, type: 'mcq' },
            { q: 'Apa yang dimaksud dengan sumber daya alam?', options: ['Benda buatan', 'Benda alam yang bermanfaat', 'Benda mati', 'Benda tak hidup'], a: 1, type: 'mcq' },
            { q: 'Berapa jumlah planet di tata surya?', options: ['6', '7', '8', '9'], a: 2, type: 'mcq' },
            { q: 'Planet Bumi adalah planet ke?', options: ['1', '2', '3', '4'], a: 2, type: 'mcq' },
            { q: 'Matahari adalah?', options: ['Planet', 'Bintang', 'Satelit', 'Komet'], a: 1, type: 'mcq' },
            { q: 'Bulan adalah?', options: ['Planet', 'Bintang', 'Satelit', 'Komet'], a: 2, type: 'mcq' },
            { q: 'Tumbuhan membuat makanan menggunakan?', options: ['Akar', 'Daun', 'Batang', 'Bunga'], a: 1, type: 'mcq' },
            { q: 'Fotosintesis membutuhkan?', options: ['Air dan cahaya matahari', 'Air dan tanah', 'Tanah dan udara', 'Udara dan cahaya'], a: 0, type: 'mcq' },
            { q: 'Hewan bernapas menggunakan?', options: ['Paru-paru', 'Insang', 'Kulit', 'Semua benar'], a: 3, type: 'mcq' },
            { q: 'Ikan bernapas menggunakan?', options: ['Paru-paru', 'Insang', 'Kulit', 'Trakea'], a: 1, type: 'mcq' },
            { q: 'Manusia bernapas menggunakan?', options: ['Paru-paru', 'Insang', 'Kulit', 'Trakea'], a: 0, type: 'mcq' },
            { q: 'Cuaca adalah keadaan?', options: ['Atmosfer', 'Tanah', 'Air', 'Udara'], a: 0, type: 'mcq' }
        ]
    },
    sd_seni: {
        topics: ['Pengenalan Seni Musik', 'Lagu Anak-anak', 'Seni Rupa: Menggambar', 'Seni Rupa: Mewarnai', 'Seni Tari', 'Seni Teater', 'Alat Musik Tradisional', 'Kerajinan Tangan', 'Seni Patung', 'Seni Kriya'],
        facts: [
            'Seni adalah karya yang memiliki nilai keindahan.',
            'Seni musik adalah seni yang menggunakan suara dan irama.',
            'Lagu anak-anak adalah lagu yang dinyanyikan oleh anak-anak.',
            'Seni rupa adalah seni yang dapat dilihat dan diraba.',
            'Menggambar adalah kegiatan membuat gambar dengan pensil atau alat lain.',
            'Mewarnai adalah kegiatan memberi warna pada gambar.',
            'Seni tari adalah seni yang menggunakan gerakan tubuh.',
            'Seni teater adalah seni yang memainkan peran di depan penonton.',
            'Alat musik tradisional adalah alat musik yang berasal dari daerah tertentu.',
            'Kerajinan tangan adalah karya yang dibuat dengan tangan.',
            'Seni patung adalah seni membuat bentuk tiga dimensi.',
            'Seni kriya adalah seni membuat benda fungsional yang indah.',
            'Gitar adalah alat musik petik yang memiliki enam senar.',
            'Piano adalah alat musik tuts yang memiliki tuts hitam dan putih.',
            'Biola adalah alat musik gesek yang memiliki empat senar.',
            'Seruling adalah alat musik tiup yang terbuat dari bambu atau logam.',
            'Gendang adalah alat musik pukul yang dimainkan dengan tangan.',
            'Tari Saman adalah tari tradisional dari Aceh.',
            'Tari Kecak adalah tari tradisional dari Bali.',
            'Wayang adalah seni pertunjukan tradisional Indonesia.'
        ],
        quiz: [
            { q: 'Apa yang dimaksud dengan seni?', options: ['Benda mati', 'Karya bernilai indah', 'Benda fungsional', 'Benda alam'], a: 1, type: 'mcq' },
            { q: 'Seni musik menggunakan apa?', options: ['Warna', 'Suara dan irama', 'Gerakan', 'Bentuk'], a: 1, type: 'mcq' },
            { q: 'Apa yang dimaksud dengan seni rupa?', options: ['Seni suara', 'Seni yang dapat dilihat', 'Seni gerak', 'Seni peran'], a: 1, type: 'mcq' },
            { q: 'Alat musik petik adalah?', options: ['Gendang', 'Gitar', 'Seruling', 'Piano'], a: 1, type: 'mcq' },
            { q: 'Alat musik pukul adalah?', options: ['Gitar', 'Biola', 'Gendang', 'Seruling'], a: 2, type: 'mcq' },
            { q: 'Tari Saman berasal dari?', options: ['Bali', 'Jawa', 'Aceh', 'Sumatera'], a: 2, type: 'mcq' },
            { q: 'Tari Kecak berasal dari?', options: ['Bali', 'Jawa', 'Aceh', 'Sumatera'], a: 0, type: 'mcq' },
            { q: 'Apa yang dimaksud dengan seni patung?', options: ['Seni dua dimensi', 'Seni tiga dimensi', 'Seni suara', 'Seni gerak'], a: 1, type: 'mcq' },
            { q: 'Wayang adalah seni pertunjukan dari?', options: ['Indonesia', 'Malaysia', 'Thailand', 'Filipina'], a: 0, type: 'mcq' },
            { q: 'Apa yang dimaksud dengan kerajinan tangan?', options: ['Karya mesin', 'Karya tangan', 'Karya digital', 'Karya industri'], a: 1, type: 'mcq' },
            { q: 'Gitar memiliki berapa senar?', options: ['4', '5', '6', '7'], a: 2, type: 'mcq' },
            { q: 'Biola memiliki berapa senar?', options: ['3', '4', '5', '6'], a: 1, type: 'mcq' },
            { q: 'Piano memiliki tuts apa saja?', options: ['Hitam dan putih', 'Merah dan biru', 'Hijau dan kuning', 'Semua warna'], a: 0, type: 'mcq' },
            { q: 'Seruling terbuat dari?', options: ['Logam', 'Bambu atau logam', 'Plastik', 'Kaca'], a: 1, type: 'mcq' },
            { q: 'Gendang dimainkan dengan?', options: ['Tangan', 'Kaki', 'Tusukan', 'Gesekan'], a: 0, type: 'mcq' },
            { q: 'Seni tari menggunakan?', options: ['Suara', 'Gerakan tubuh', 'Warna', 'Bentuk'], a: 1, type: 'mcq' },
            { q: 'Seni teater memainkan?', options: ['Musik', 'Peran', 'Warna', 'Bentuk'], a: 1, type: 'mcq' },
            { q: 'Seni kriya adalah seni membuat?', options: ['Benda fungsional', 'Benda mati', 'Benda tak hidup', 'Benda alam'], a: 0, type: 'mcq' }
        ]
    },
    sd_pjok: {
        topics: ['Pengenalan Olahraga', 'Senam Pagi', 'Lari dan Jalan', 'Lompat dan Lempar', 'Bola Voli', 'Bola Basket', 'Sepak Bola', 'Kesehatan Tubuh', 'Kebugaran Jasmani', 'Permainan Tradisional'],
        facts: [
            'Olahraga adalah kegiatan fisik yang dilakukan untuk menjaga kesehatan.',
            'Senam pagi adalah olahraga yang dilakukan di pagi hari.',
            'Lari adalah olahraga dengan gerakan kaki cepat.',
            'Jalan adalah olahraga dengan gerakan kaki biasa.',
            'Lompat adalah olahraga dengan gerakan melompat.',
            'Lempar adalah olahraga dengan gerakan melempar.',
            'Bola voli adalah permainan bola yang dimainkan dengan tangan.',
            'Bola basket adalah permainan bola yang dimainkan dengan tangan dan dimasukkan ke ring.',
            'Sepak bola adalah permainan bola yang dimainkan dengan kaki.',
            'Kesehatan tubuh adalah keadaan tubuh yang sehat dan bugar.',
            'Kebugaran jasmani adalah kemampuan tubuh untuk melakukan aktivitas.',
            'Pemanasan dilakukan sebelum olahraga untuk menghindari cedera.',
            'Pendinginan dilakukan setelah olahraga untuk mengembalikan tubuh.',
            'Minum air putih setelah olahraga untuk mengganti cairan tubuh.',
            'Makan makanan bergizi untuk menjaga kesehatan tubuh.',
            'Tidur yang cukup untuk menjaga kesehatan tubuh.',
            'Cuci tangan sebelum dan sesudah makan.',
            'Gosok gigi dua kali sehari.',
            'Mandi dua kali sehari untuk menjaga kebersihan.',
            'Permainan tradisional adalah permainan yang berasal dari daerah tertentu.'
        ],
        quiz: [
            { q: 'Apa tujuan olahraga?', options: ['Bersenang-senang', 'Menjaga kesehatan', 'Berkompetisi', 'Berlatih'], a: 1, type: 'mcq' },
            { q: 'Kapan sebaiknya melakukan pemanasan?', options: ['Setelah olahraga', 'Sebelum olahraga', 'Saat olahraga', 'Tidak perlu'], a: 1, type: 'mcq' },
            { q: 'Bola voli dimainkan dengan?', options: ['Kaki', 'Tangan', 'Kepala', 'Tubuh'], a: 1, type: 'mcq' },
            { q: 'Sepak bola dimainkan dengan?', options: ['Tangan', 'Kaki', 'Kepala', 'Tubuh'], a: 1, type: 'mcq' },
            { q: 'Bola basket dimainkan dengan?', options: ['Kaki', 'Tangan', 'Kepala', 'Tubuh'], a: 1, type: 'mcq' },
            { q: 'Apa yang dilakukan setelah olahraga?', options: ['Pemanasan', 'Pendinginan', 'Makan', 'Tidur'], a: 1, type: 'mcq' },
            { q: 'Berapa kali sehari sebaiknya gosok gigi?', options: ['1', '2', '3', '4'], a: 1, type: 'mcq' },
            { q: 'Apa yang dimaksud dengan kebugaran jasmani?', options: ['Kemampuan tubuh', 'Kekuatan otot', 'Kelenturan tubuh', 'Kesehatan tubuh'], a: 0, type: 'mcq' },
            { q: 'Permainan tradisional berasal dari?', options: ['Luar negeri', 'Daerah tertentu', 'Sekolah', 'Olimpiade'], a: 1, type: 'mcq' },
            { q: 'Apa yang harus dilakukan sebelum makan?', options: ['Mandi', 'Cuci tangan', 'Olahraga', 'Tidur'], a: 1, type: 'mcq' },
            { q: 'Lari adalah olahraga dengan gerakan?', options: ['Kaki cepat', 'Kaki biasa', 'Melompat', 'Melempar'], a: 0, type: 'mcq' },
            { q: 'Jalan adalah olahraga dengan gerakan?', options: ['Kaki cepat', 'Kaki biasa', 'Melompat', 'Melempar'], a: 1, type: 'mcq' },
            { q: 'Lompat adalah olahraga dengan gerakan?', options: ['Kaki cepat', 'Kaki biasa', 'Melompat', 'Melempar'], a: 2, type: 'mcq' },
            { q: 'Lempar adalah olahraga dengan gerakan?', options: ['Kaki cepat', 'Kaki biasa', 'Melompat', 'Melempar'], a: 3, type: 'mcq' },
            { q: 'Bola voli dimainkan dengan?', options: ['Kaki', 'Tangan', 'Kepala', 'Tubuh'], a: 1, type: 'mcq' },
            { q: 'Sepak bola dimainkan dengan?', options: ['Tangan', 'Kaki', 'Kepala', 'Tubuh'], a: 1, type: 'mcq' },
            { q: 'Bola basket dimainkan dengan?', options: ['Kaki', 'Tangan', 'Kepala', 'Tubuh'], a: 1, type: 'mcq' },
            { q: 'Pemanasan dilakukan sebelum?', options: ['Olahraga', 'Makan', 'Tidur', 'Belajar'], a: 0, type: 'mcq' },
            { q: 'Pendinginan dilakukan setelah?', options: ['Olahraga', 'Makan', 'Tidur', 'Belajar'], a: 0, type: 'mcq' }
        ]
    },
    sd_bing: {
        topics: ['Pengenalan Bahasa Inggris', 'Alphabet', 'Greetings', 'Numbers', 'Colors', 'Family', 'Animals', 'Food and Drink', 'School Things', 'Simple Sentences'],
        facts: [
            'Bahasa Inggris adalah bahasa internasional yang digunakan di banyak negara.',
            'Alphabet dalam bahasa Inggris terdiri dari 26 huruf.',
            'A, E, I, O, U adalah huruf vokal dalam bahasa Inggris.',
            'B, C, D, F, G adalah huruf konsonan dalam bahasa Inggris.',
            'Hello adalah sapaan dalam bahasa Inggris.',
            'Goodbye adalah perpisahan dalam bahasa Inggris.',
            'Thank you adalah ucapan terima kasih dalam bahasa Inggris.',
            'One, two, three adalah angka dalam bahasa Inggris.',
            'Red, blue, green adalah warna dalam bahasa Inggris.',
            'Father, mother, brother adalah anggota keluarga dalam bahasa Inggris.',
            'Cat, dog, bird adalah hewan dalam bahasa Inggris.',
            'Rice, bread, milk adalah makanan dalam bahasa Inggris.',
            'Book, pencil, pen adalah alat sekolah dalam bahasa Inggris.',
            'I am a student adalah kalimat sederhana dalam bahasa Inggris.',
            'She is my mother adalah kalimat sederhana dalam bahasa Inggris.',
            'He is my father adalah kalimat sederhana dalam bahasa Inggris.',
            'We are friends adalah kalimat sederhana dalam bahasa Inggris.',
            'They are students adalah kalimat sederhana dalam bahasa Inggris.',
            'This is a book adalah kalimat sederhana dalam bahasa Inggris.',
            'That is a pen adalah kalimat sederhana dalam bahasa Inggris.'
        ],
        quiz: [
            { q: 'Apa sapaan dalam bahasa Inggris?', options: ['Goodbye', 'Hello', 'Thank you', 'Sorry'], a: 1, type: 'mcq' },
            { q: 'Apa perpisahan dalam bahasa Inggris?', options: ['Hello', 'Goodbye', 'Thank you', 'Please'], a: 1, type: 'mcq' },
            { q: 'Apa ucapan terima kasih dalam bahasa Inggris?', options: ['Hello', 'Goodbye', 'Thank you', 'Sorry'], a: 2, type: 'mcq' },
            { q: 'Berapa jumlah huruf dalam alphabet Inggris?', options: ['24', '25', '26', '27'], a: 2, type: 'mcq' },
            { q: 'Manakah huruf vokal?', options: ['B', 'C', 'A', 'D'], a: 2, type: 'mcq' },
            { q: 'Apa bahasa Inggris dari "satu"?', options: ['Two', 'One', 'Three', 'Four'], a: 1, type: 'mcq' },
            { q: 'Apa bahasa Inggris dari "merah"?', options: ['Blue', 'Green', 'Red', 'Yellow'], a: 2, type: 'mcq' },
            { q: 'Apa bahasa Inggris dari "ayah"?', options: ['Mother', 'Father', 'Brother', 'Sister'], a: 1, type: 'mcq' },
            { q: 'Apa bahasa Inggris dari "kucing"?', options: ['Dog', 'Cat', 'Bird', 'Fish'], a: 1, type: 'mcq' },
            { q: 'Apa bahasa Inggris dari "buku"?', options: ['Pen', 'Pencil', 'Book', 'Ruler'], a: 2, type: 'mcq' },
            { q: 'Apa bahasa Inggris dari "dua"?', options: ['One', 'Two', 'Three', 'Four'], a: 1, type: 'mcq' },
            { q: 'Apa bahasa Inggris dari "tiga"?', options: ['One', 'Two', 'Three', 'Four'], a: 2, type: 'mcq' },
            { q: 'Apa bahasa Inggris dari "empat"?', options: ['One', 'Two', 'Three', 'Four'], a: 3, type: 'mcq' },
            { q: 'Apa bahasa Inggris dari "lima"?', options: ['Four', 'Five', 'Six', 'Seven'], a: 1, type: 'mcq' },
            { q: 'Apa bahasa Inggris dari "ibu"?', options: ['Father', 'Mother', 'Brother', 'Sister'], a: 1, type: 'mcq' },
            { q: 'Apa bahasa Inggris dari "kakak"?', options: ['Brother', 'Sister', 'Father', 'Mother'], a: 0, type: 'mcq' },
            { q: 'Apa bahasa Inggris dari "adik"?', options: ['Brother', 'Sister', 'Father', 'Mother'], a: 1, type: 'mcq' },
            { q: 'Apa bahasa Inggris dari "anjing"?', options: ['Cat', 'Dog', 'Bird', 'Fish'], a: 1, type: 'mcq' },
            { q: 'Apa bahasa Inggris dari "burung"?', options: ['Cat', 'Dog', 'Bird', 'Fish'], a: 2, type: 'mcq' },
            { q: 'Apa bahasa Inggris dari "ikan"?', options: ['Cat', 'Dog', 'Bird', 'Fish'], a: 3, type: 'mcq' }
        ]
    },
    sd_agama_islam: {
        topics: ['Pengenalan Islam', 'Rukun Islam', 'Rukun Iman', 'Nabi dan Rasul', 'Al-Quran', 'Doa Sehari-hari', 'Sholat', 'Puasa', 'Zakat', 'Haji'],
        facts: [
            'Islam adalah agama yang mengajarkan keimanan dan ketaqwaan kepada Tuhan.',
            'Rukun Islam terdiri dari lima perkara.',
            'Rukun Islam pertama adalah syahadat.',
            'Rukun Islam kedua adalah sholat.',
            'Rukun Islam ketiga adalah zakat.',
            'Rukun Islam keempat adalah puasa.',
            'Rukun Islam kelima adalah haji.',
            'Rukun Iman terdiri dari enam perkara.',
            'Rukun Iman pertama adalah iman kepada Allah.',
            'Rukun Iman kedua adalah iman kepada malaikat.',
            'Rukun Iman ketiga adalah iman kepada kitab-kitab.',
            'Rukun Iman keempat adalah iman kepada nabi dan rasul.',
            'Rukun Iman kelima adalah iman kepada hari akhir.',
            'Rukun Iman keenam adalah iman kepada qada dan qadar.',
            'Nabi Muhammad adalah nabi terakhir dalam Islam.',
            'Al-Quran adalah kitab suci umat Islam.',
            'Sholat adalah ibadah yang dilakukan lima kali sehari.',
            'Puasa adalah menahan diri dari makan dan minum.',
            'Zakat adalah mengeluarkan sebagian harta untuk fakir miskin.'
        ],
        quiz: [
            { q: 'Berapa rukun Islam?', options: ['3', '4', '5', '6'], a: 2, type: 'mcq' },
            { q: 'Rukun Islam pertama adalah?', options: ['Sholat', 'Syahadat', 'Zakat', 'Puasa'], a: 1, type: 'mcq' },
            { q: 'Rukun Islam kedua adalah?', options: ['Syahadat', 'Sholat', 'Zakat', 'Puasa'], a: 1, type: 'mcq' },
            { q: 'Berapa rukun Iman?', options: ['4', '5', '6', '7'], a: 2, type: 'mcq' },
            { q: 'Nabi terakhir dalam Islam adalah?', options: ['Nabi Ibrahim', 'Nabi Musa', 'Nabi Muhammad', 'Nabi Isa'], a: 2, type: 'mcq' },
            { q: 'Kitab suci umat Islam adalah?', options: ['Al-Quran', 'Injil', 'Taurat', 'Zabur'], a: 0, type: 'mcq' },
            { q: 'Berapa kali sholat dalam sehari?', options: ['3', '4', '5', '6'], a: 2, type: 'mcq' },
            { q: 'Puasa dilakukan pada bulan?', options: ['Ramadhan', 'Syawal', 'Muharram', 'Rajab'], a: 0, type: 'mcq' },
            { q: 'Zakat adalah?', options: ['Ibadah', 'Mengeluarkan harta', 'Puasa', 'Haji'], a: 1, type: 'mcq' },
            { q: 'Haji adalah?', options: ['Ibadah ke Mekah', 'Ibadah ke Madinah', 'Ibadah ke Jerusalem', 'Ibadah ke Ka\'bah'], a: 0, type: 'mcq' },
            { q: 'Rukun Islam ketiga adalah?', options: ['Syahadat', 'Sholat', 'Zakat', 'Puasa'], a: 2, type: 'mcq' },
            { q: 'Rukun Islam keempat adalah?', options: ['Syahadat', 'Sholat', 'Zakat', 'Puasa'], a: 3, type: 'mcq' },
            { q: 'Rukun Islam kelima adalah?', options: ['Syahadat', 'Sholat', 'Zakat', 'Haji'], a: 3, type: 'mcq' },
            { q: 'Rukun Iman pertama adalah?', options: ['Iman kepada Allah', 'Iman kepada malaikat', 'Iman kepada kitab', 'Iman kepada nabi'], a: 0, type: 'mcq' },
            { q: 'Rukun Iman kedua adalah?', options: ['Iman kepada Allah', 'Iman kepada malaikat', 'Iman kepada kitab', 'Iman kepada nabi'], a: 1, type: 'mcq' },
            { q: 'Rukun Iman ketiga adalah?', options: ['Iman kepada Allah', 'Iman kepada malaikat', 'Iman kepada kitab', 'Iman kepada nabi'], a: 2, type: 'mcq' },
            { q: 'Rukun Iman keempat adalah?', options: ['Iman kepada Allah', 'Iman kepada malaikat', 'Iman kepada kitab', 'Iman kepada nabi'], a: 3, type: 'mcq' },
            { q: 'Rukun Iman kelima adalah?', options: ['Iman kepada hari akhir', 'Iman kepada malaikat', 'Iman kepada kitab', 'Iman kepada nabi'], a: 0, type: 'mcq' },
            { q: 'Rukun Iman keenam adalah?', options: ['Iman kepada qada dan qadar', 'Iman kepada malaikat', 'Iman kepada kitab', 'Iman kepada nabi'], a: 0, type: 'mcq' }
        ]
    },
    sd_agama_kristen: {
        topics: ['Pengenalan Kristen', 'Allah yang Maha Esa', 'Yesus Kristus', 'Alkitab', 'Doa', 'Gereja', 'Sakramen', 'Hari Raya', 'Nilai-nilai Kristen', 'Kehidupan Beriman'],
        facts: [
            'Kristen adalah agama yang mengajarkan kasih dan pengampunan.',
            'Allah yang Maha Esa adalah pencipta alam semesta.',
            'Yesus Kristus adalah putera Allah yang datang ke dunia.',
            'Alkitab adalah kitab suci umat Kristen.',
            'Doa adalah cara berkomunikasi dengan Allah.',
            'Gereja adalah tempat ibadah umat Kristen.',
            'Sakramen adalah upacara suci dalam agama Kristen.',
            'Natal adalah hari raya kelahiran Yesus Kristus.',
            'Paskah adalah hari raya kebangkitan Yesus Kristus.',
            'Nilai-nilai Kristen mengajarkan kasih dan pengampunan.',
            'Kehidupan beriman adalah kehidupan yang percaya kepada Allah.',
            'Yesus mengajarkan untuk mencintai sesama.',
            'Yesus mengajarkan untuk memaafkan orang lain.',
            'Yesus mengajarkan untuk berbuat baik kepada semua orang.',
            'Yesus mengajarkan untuk berdoa dan beribadah.',
            'Yesus mengajarkan untuk menaati orang tua.',
            'Yesus mengajarkan untuk jujur dan adil.',
            'Yesus mengajarkan untuk saling menghormati.',
            'Yesus mengajarkan untuk membantu orang lain.',
            'Yesus mengajarkan untuk bersyukur atas semua karunia.'
        ],
        quiz: [
            { q: 'Siapa pencipta alam semesta?', options: ['Yesus', 'Allah', 'Malaikat', 'Nabi'], a: 1, type: 'mcq' },
            { q: 'Siapa putera Allah yang datang ke dunia?', options: ['Allah', 'Yesus Kristus', 'Malaikat', 'Nabi'], a: 1, type: 'mcq' },
            { q: 'Kitab suci umat Kristen adalah?', options: ['Al-Quran', 'Alkitab', 'Taurat', 'Zabur'], a: 1, type: 'mcq' },
            { q: 'Apa cara berkomunikasi dengan Allah?', options: ['Doa', 'Ibadah', 'Sakramen', 'Perayaan'], a: 0, type: 'mcq' },
            { q: 'Tempat ibadah umat Kristen adalah?', options: ['Masjid', 'Gereja', 'Pura', 'Vihara'], a: 1, type: 'mcq' },
            { q: 'Hari raya kelahiran Yesus adalah?', options: ['Paskah', 'Natal', 'Pentakosta', 'Jumat Agung'], a: 1, type: 'mcq' },
            { q: 'Hari raya kebangkitan Yesus adalah?', options: ['Natal', 'Paskah', 'Pentakosta', 'Jumat Agung'], a: 1, type: 'mcq' },
            { q: 'Apa yang diajarkan Yesus tentang sesama?', options: ['Membenci', 'Mencintai', 'Mengabaikan', 'Menghindari'], a: 1, type: 'mcq' },
            { q: 'Apa yang diajarkan Yesus tentang pengampunan?', options: ['Membalas', 'Memaafkan', 'Melupakan', 'Menyimpan'], a: 1, type: 'mcq' },
            { q: 'Apa yang diajarkan Yesus tentang kejujuran?', options: ['Berbohong', 'Jujur', 'Menipu', 'Mengelabui'], a: 1, type: 'mcq' },
            { q: 'Yesus mengajarkan untuk mencintai?', options: ['Sesama', 'Diri sendiri', 'Harta', 'Kekuasaan'], a: 0, type: 'mcq' },
            { q: 'Yesus mengajarkan untuk memaafkan?', options: ['Orang lain', 'Diri sendiri', 'Tidak ada', 'Hanya keluarga'], a: 0, type: 'mcq' },
            { q: 'Yesus mengajarkan untuk berbuat baik kepada?', options: ['Semua orang', 'Hanya keluarga', 'Hanya teman', 'Tidak ada'], a: 0, type: 'mcq' },
            { q: 'Yesus mengajarkan untuk berdoa dan?', options: ['Beribadah', 'Bermain', 'Bekerja', 'Belajar'], a: 0, type: 'mcq' },
            { q: 'Yesus mengajarkan untuk menaati?', options: ['Orang tua', 'Teman', 'Guru', 'Tidak ada'], a: 0, type: 'mcq' },
            { q: 'Yesus mengajarkan untuk jujur dan?', options: ['Adil', 'Berbohong', 'Menipu', 'Mengelabui'], a: 0, type: 'mcq' },
            { q: 'Yesus mengajarkan untuk saling?', options: ['Menghormati', 'Membenci', 'Mengabaikan', 'Menghindari'], a: 0, type: 'mcq' },
            { q: 'Yesus mengajarkan untuk membantu?', options: ['Orang lain', 'Diri sendiri', 'Tidak ada', 'Hanya keluarga'], a: 0, type: 'mcq' },
            { q: 'Yesus mengajarkan untuk bersyukur atas?', options: ['Semua karunia', 'Harta', 'Kekuasaan', 'Kesehatan'], a: 0, type: 'mcq' }
        ]
    },
    sd_agama_katolik: {
        topics: ['Pengenalan Katolik', 'Allah Tritunggal', 'Yesus Kristus', 'Maria', 'Alkitab', 'Sakramen', 'Gereja', 'Doa', 'Hari Raya', 'Kehidupan Beriman'],
        facts: [
            'Katolik adalah agama yang mengajarkan kasih dan pengampunan.',
            'Allah Tritunggal adalah Allah Bapa, Allah Putera, dan Allah Roh Kudus.',
            'Yesus Kristus adalah putera Allah yang datang ke dunia.',
            'Maria adalah ibu Yesus Kristus.',
            'Alkitab adalah kitab suci umat Katolik.',
            'Sakramen adalah upacara suci dalam agama Katolik.',
            'Gereja adalah tempat ibadah umat Katolik.',
            'Doa adalah cara berkomunikasi dengan Allah.',
            'Natal adalah hari raya kelahiran Yesus Kristus.',
            'Paskah adalah hari raya kebangkitan Yesus Kristus.',
            'Kehidupan beriman adalah kehidupan yang percaya kepada Allah.',
            'Yesus mengajarkan untuk mencintai sesama.',
            'Yesus mengajarkan untuk memaafkan orang lain.',
            'Yesus mengajarkan untuk berbuat baik kepada semua orang.',
            'Yesus mengajarkan untuk berdoa dan beribadah.',
            'Yesus mengajarkan untuk menaati orang tua.',
            'Yesus mengajarkan untuk jujur dan adil.',
            'Yesus mengajarkan untuk saling menghormati.',
            'Yesus mengajarkan untuk membantu orang lain.',
            'Yesus mengajarkan untuk bersyukur atas semua karunia.'
        ],
        quiz: [
            { q: 'Siapa Allah Tritunggal?', options: ['Bapa, Putera, Roh Kudus', 'Bapa, Maria, Yesus', 'Yesus, Maria, Yohanes', 'Bapa, Yesus, Paulus'], a: 0, type: 'mcq' },
            { q: 'Siapa ibu Yesus Kristus?', options: ['Maria', 'Elisabet', 'Martha', 'Magdalena'], a: 0, type: 'mcq' },
            { q: 'Kitab suci umat Katolik adalah?', options: ['Al-Quran', 'Alkitab', 'Taurat', 'Zabur'], a: 1, type: 'mcq' },
            { q: 'Tempat ibadah umat Katolik adalah?', options: ['Masjid', 'Gereja', 'Pura', 'Vihara'], a: 1, type: 'mcq' },
            { q: 'Hari raya kelahiran Yesus adalah?', options: ['Paskah', 'Natal', 'Pentakosta', 'Jumat Agung'], a: 1, type: 'mcq' },
            { q: 'Hari raya kebangkitan Yesus adalah?', options: ['Natal', 'Paskah', 'Pentakosta', 'Jumat Agung'], a: 1, type: 'mcq' },
            { q: 'Apa yang diajarkan Yesus tentang sesama?', options: ['Membenci', 'Mencintai', 'Mengabaikan', 'Menghindari'], a: 1, type: 'mcq' },
            { q: 'Apa yang diajarkan Yesus tentang pengampunan?', options: ['Membalas', 'Memaafkan', 'Melupakan', 'Menyimpan'], a: 1, type: 'mcq' },
            { q: 'Apa yang diajarkan Yesus tentang kejujuran?', options: ['Berbohong', 'Jujur', 'Menipu', 'Mengelabui'], a: 1, type: 'mcq' },
            { q: 'Apa yang diajarkan Yesus tentang orang tua?', options: ['Mengabaikan', 'Menaati', 'Membenci', 'Menghindari'], a: 1, type: 'mcq' },
            { q: 'Allah Tritunggal terdiri dari?', options: ['Bapa, Putera, Roh Kudus', 'Bapa, Maria, Yesus', 'Yesus, Maria, Yohanes', 'Bapa, Yesus, Paulus'], a: 0, type: 'mcq' },
            { q: 'Maria adalah ibu dari?', options: ['Yesus', 'Yohanes', 'Petrus', 'Paulus'], a: 0, type: 'mcq' },
            { q: 'Sakramen adalah?', options: ['Upacara suci', 'Perayaan', 'Doa', 'Ibadah'], a: 0, type: 'mcq' },
            { q: 'Gereja adalah tempat?', options: ['Ibadah', 'Belajar', 'Bermain', 'Bekerja'], a: 0, type: 'mcq' },
            { q: 'Doa adalah cara?', options: ['Berkomunikasi dengan Allah', 'Bermain', 'Belajar', 'Bekerja'], a: 0, type: 'mcq' },
            { q: 'Natal adalah hari raya?', options: ['Kelahiran Yesus', 'Kebangkitan Yesus', 'Kenaikan Yesus', 'Wafat Yesus'], a: 0, type: 'mcq' },
            { q: 'Paskah adalah hari raya?', options: ['Kelahiran Yesus', 'Kebangkitan Yesus', 'Kenaikan Yesus', 'Wafat Yesus'], a: 1, type: 'mcq' },
            { q: 'Kehidupan beriman adalah kehidupan yang?', options: ['Percaya kepada Allah', 'Tidak percaya', 'Ragu-ragu', 'Tidak peduli'], a: 0, type: 'mcq' },
            { q: 'Yesus mengajarkan untuk mencintai?', options: ['Sesama', 'Diri sendiri', 'Harta', 'Kekuasaan'], a: 0, type: 'mcq' },
            { q: 'Yesus mengajarkan untuk memaafkan?', options: ['Orang lain', 'Diri sendiri', 'Tidak ada', 'Hanya keluarga'], a: 0, type: 'mcq' }
        ]
    },
    sd_agama_hindu: {
        topics: ['Pengenalan Hindu', 'Sang Hyang Widhi', 'Tri Murti', 'Kitab Suci Weda', 'Upacara Yadnya', 'Hari Raya Nyepi', 'Candi', 'Tri Hita Karana', 'Karma', 'Moksa'],
        facts: [
            'Hindu adalah agama yang berasal dari India.',
            'Sang Hyang Widhi adalah Tuhan Yang Maha Esa dalam agama Hindu.',
            'Tri Murti terdiri dari Brahma, Wisnu, dan Siwa.',
            'Brahma adalah dewa pencipta.',
            'Wisnu adalah dewa pemelihara.',
            'Siwa adalah dewa perusak.',
            'Kitab suci Hindu adalah Weda.',
            'Upacara Yadnya adalah upacara persembahan dalam agama Hindu.',
            'Hari Raya Nyepi adalah hari raya umat Hindu.',
            'Candi adalah tempat ibadah umat Hindu.',
            'Tri Hita Karana adalah tiga penyebab kebahagiaan.',
            'Tri Hita Karana pertama adalah hubungan dengan Tuhan.',
            'Tri Hita Karana kedua adalah hubungan dengan sesama.',
            'Tri Hita Karana ketiga adalah hubungan dengan alam.',
            'Karma adalah hukum sebab akibat perbuatan.',
            'Moksa adalah kebebasan dari samsara.',
            'Samsara adalah siklus kelahiran kembali.',
            'Dharma adalah kewajiban dan kebenaran.',
            'Ahimsa adalah prinsip tidak menyakiti makhluk hidup.',
            'Yoga adalah latihan spiritual dan fisik.'
        ],
        quiz: [
            { q: 'Siapa Tuhan Yang Maha Esa dalam agama Hindu?', options: ['Brahma', 'Wisnu', 'Sang Hyang Widhi', 'Siwa'], a: 2, type: 'mcq' },
            { q: 'Berapa jumlah Tri Murti?', options: ['2', '3', '4', '5'], a: 1, type: 'mcq' },
            { q: 'Siapa dewa pencipta?', options: ['Wisnu', 'Siwa', 'Brahma', 'Ganesha'], a: 2, type: 'mcq' },
            { q: 'Siapa dewa pemelihara?', options: ['Brahma', 'Wisnu', 'Siwa', 'Ganesha'], a: 1, type: 'mcq' },
            { q: 'Siapa dewa perusak?', options: ['Brahma', 'Wisnu', 'Siwa', 'Ganesha'], a: 2, type: 'mcq' },
            { q: 'Kitab suci Hindu adalah?', options: ['Al-Quran', 'Weda', 'Alkitab', 'Tripitaka'], a: 1, type: 'mcq' },
            { q: 'Hari raya umat Hindu adalah?', options: ['Natal', 'Nyepi', 'Waisak', 'Imlek'], a: 1, type: 'mcq' },
            { q: 'Tempat ibadah umat Hindu adalah?', options: ['Masjid', 'Gereja', 'Pura', 'Vihara'], a: 2, type: 'mcq' },
            { q: 'Apa yang dimaksud dengan Tri Hita Karana?', options: ['Tiga dewa', 'Tiga penyebab kebahagiaan', 'Tiga kitab', 'Tiga upacara'], a: 1, type: 'mcq' },
            { q: 'Apa yang dimaksud dengan karma?', options: ['Hukum sebab akibat', 'Upacara', 'Doa', 'Meditasi'], a: 0, type: 'mcq' },
            { q: 'Tri Murti terdiri dari?', options: ['Brahma, Wisnu, Siwa', 'Brahma, Wisnu, Ganesha', 'Wisnu, Siwa, Ganesha', 'Brahma, Siwa, Ganesha'], a: 0, type: 'mcq' },
            { q: 'Brahma adalah dewa?', options: ['Pencipta', 'Pemelihara', 'Perusak', 'Pencipta dan pemelihara'], a: 0, type: 'mcq' },
            { q: 'Wisnu adalah dewa?', options: ['Pencipta', 'Pemelihara', 'Perusak', 'Pencipta dan pemelihara'], a: 1, type: 'mcq' },
            { q: 'Siwa adalah dewa?', options: ['Pencipta', 'Pemelihara', 'Perusak', 'Pencipta dan pemelihara'], a: 2, type: 'mcq' },
            { q: 'Weda adalah?', options: ['Kitab suci', 'Upacara', 'Doa', 'Meditasi'], a: 0, type: 'mcq' },
            { q: 'Nyepi adalah?', options: ['Hari raya', 'Upacara', 'Doa', 'Meditasi'], a: 0, type: 'mcq' },
            { q: 'Candi adalah?', options: ['Tempat ibadah', 'Upacara', 'Doa', 'Meditasi'], a: 0, type: 'mcq' },
            { q: 'Tri Hita Karana pertama adalah?', options: ['Hubungan dengan Tuhan', 'Hubungan dengan sesama', 'Hubungan dengan alam', 'Hubungan dengan diri sendiri'], a: 0, type: 'mcq' },
            { q: 'Tri Hita Karana kedua adalah?', options: ['Hubungan dengan Tuhan', 'Hubungan dengan sesama', 'Hubungan dengan alam', 'Hubungan dengan diri sendiri'], a: 1, type: 'mcq' },
            { q: 'Tri Hita Karana ketiga adalah?', options: ['Hubungan dengan Tuhan', 'Hubungan dengan sesama', 'Hubungan dengan alam', 'Hubungan dengan diri sendiri'], a: 2, type: 'mcq' }
        ]
    },
    sd_agama_buddha: {
        topics: ['Pengenalan Buddha', 'Siddhattha Gotama', 'Empat Kebenaran Mulia', 'Jalan Delapan Kitab Suci', 'Nirwana', 'Karma', 'Samsara', 'Meditasi', 'Hari Raya Waisak', 'Lima Sila Buddha'],
        facts: [
            'Buddha adalah agama yang mengajarkan kebijaksanaan dan kasih sayang.',
            'Siddhattha Gotama adalah pendiri agama Buddha.',
            'Siddhattha Gotama lahir di Lumbini, Nepal.',
            'Siddhattha Gotama mencapai pencerahan di Bodh Gaya.',
            'Empat Kebenaran Mulia adalah dasar ajaran Buddha.',
            'Empat Kebenaran Mulia pertama adalah penderitaan.',
            'Empat Kebenaran Mulia kedua adalah sebab penderitaan.',
            'Empat Kebenaran Mulia ketiga adalah berakhirnya penderitaan.',
            'Empat Kebenaran Mulia keempat adalah jalan untuk mengakhiri penderitaan.',
            'Jalan Delapan Kitab Suci adalah jalan untuk mencapai nirwana.',
            'Nirwana adalah kebebasan dari penderitaan.',
            'Karma adalah hukum sebab akibat perbuatan.',
            'Samsara adalah siklus kelahiran kembali.',
            'Meditasi adalah latihan untuk mencapai pencerahan.',
            'Hari Raya Waisak adalah hari raya umat Buddha.',
            'Lima Sila Buddha adalah lima prinsip moral.',
            'Lima Sila Buddha pertama adalah tidak membunuh.',
            'Lima Sila Buddha kedua adalah tidak mencuri.',
            'Lima Sila Buddha ketiga adalah tidak berzina.',
            'Lima Sila Buddha keempat adalah tidak berbohong.',
            'Lima Sila Buddha kelima adalah tidak minum minuman keras.'
        ],
        quiz: [
            { q: 'Siapa pendiri agama Buddha?', options: ['Siddhattha Gotama', 'Buddha Gautama', 'Siddhartha', 'Gautama Buddha'], a: 0, type: 'mcq' },
            { q: 'Di mana Siddhattha Gotama lahir?', options: ['India', 'Nepal', 'Tibet', 'Sri Lanka'], a: 1, type: 'mcq' },
            { q: 'Di mana Siddhattha Gotama mencapai pencerahan?', options: ['Lumbini', 'Bodh Gaya', 'Sarnath', 'Kusinara'], a: 1, type: 'mcq' },
            { q: 'Berapa jumlah Empat Kebenaran Mulia?', options: ['2', '3', '4', '5'], a: 2, type: 'mcq' },
            { q: 'Apa Empat Kebenaran Mulia pertama?', options: ['Sebab penderitaan', 'Penderitaan', 'Berakhirnya penderitaan', 'Jalan'], a: 1, type: 'mcq' },
            { q: 'Apa yang dimaksud dengan nirwana?', options: ['Penderitaan', 'Kebebasan dari penderitaan', 'Kelahiran kembali', 'Karma'], a: 1, type: 'mcq' },
            { q: 'Apa yang dimaksud dengan karma?', options: ['Hukum sebab akibat', 'Upacara', 'Doa', 'Meditasi'], a: 0, type: 'mcq' },
            { q: 'Hari raya umat Buddha adalah?', options: ['Natal', 'Waisak', 'Nyepi', 'Imlek'], a: 1, type: 'mcq' },
            { q: 'Berapa jumlah Lima Sila Buddha?', options: ['3', '4', '5', '6'], a: 2, type: 'mcq' },
            { q: 'Lima Sila Buddha pertama adalah?', options: ['Tidak mencuri', 'Tidak membunuh', 'Tidak berzina', 'Tidak berbohong'], a: 1, type: 'mcq' },
            { q: 'Siddhattha Gotama lahir di?', options: ['Lumbini', 'Bodh Gaya', 'Sarnath', 'Kusinara'], a: 0, type: 'mcq' },
            { q: 'Siddhattha Gotama mencapai pencerahan di?', options: ['Lumbini', 'Bodh Gaya', 'Sarnath', 'Kusinara'], a: 1, type: 'mcq' },
            { q: 'Empat Kebenaran Mulia pertama adalah?', options: ['Penderitaan', 'Sebab penderitaan', 'Berakhirnya penderitaan', 'Jalan'], a: 0, type: 'mcq' },
            { q: 'Empat Kebenaran Mulia kedua adalah?', options: ['Penderitaan', 'Sebab penderitaan', 'Berakhirnya penderitaan', 'Jalan'], a: 1, type: 'mcq' },
            { q: 'Empat Kebenaran Mulia ketiga adalah?', options: ['Penderitaan', 'Sebab penderitaan', 'Berakhirnya penderitaan', 'Jalan'], a: 2, type: 'mcq' },
            { q: 'Empat Kebenaran Mulia keempat adalah?', options: ['Penderitaan', 'Sebab penderitaan', 'Berakhirnya penderitaan', 'Jalan'], a: 3, type: 'mcq' },
            { q: 'Jalan Delapan Kitab Suci adalah jalan untuk?', options: ['Mencapai nirwana', 'Mencapai penderitaan', 'Mencapai karma', 'Mencapai samsara'], a: 0, type: 'mcq' },
            { q: 'Nirwana adalah?', options: ['Kebebasan dari penderitaan', 'Penderitaan', 'Karma', 'Samsara'], a: 0, type: 'mcq' },
            { q: 'Karma adalah?', options: ['Hukum sebab akibat', 'Upacara', 'Doa', 'Meditasi'], a: 0, type: 'mcq' },
            { q: 'Samsara adalah?', options: ['Siklus kelahiran kembali', 'Upacara', 'Doa', 'Meditasi'], a: 0, type: 'mcq' }
        ]
    },
    sd_agama_khonghucu: {
        topics: ['Pengenalan Khonghucu', 'Kongzi', 'Konfusianisme', 'Limbus Hubungan', 'Ren', 'Li', 'Xiao', 'Junzi', 'Hari Raya Imlek', 'Kebajikan'],
        facts: [
            'Khonghucu adalah agama yang mengajarkan kebajikan dan harmoni.',
            'Kongzi adalah pendiri agama Khonghucu.',
            'Kongzi lahir di Tiongkok pada tahun 551 SM.',
            'Konfusianisme adalah ajaran Kongzi.',
            'Limbus Hubungan adalah lima hubungan sosial dalam Khonghucu.',
            'Limbus Hubungan pertama adalah rakyat dan pemerintah.',
            'Limbus Hubungan kedua adalah orang tua dan anak.',
            'Limbus Hubungan ketiga adalah suami dan istri.',
            'Limbus Hubungan keempat adalah kakak dan adik.',
            'Limbus Hubungan kelima adalah teman dan teman.',
            'Ren adalah kebajikan kasih sayang.',
            'Li adalah kebajikan sopan santun.',
            'Xiao adalah kebajikan bakti kepada orang tua.',
            'Junzi adalah orang yang memiliki kebajikan.',
            'Hari Raya Imlek adalah hari raya umat Khonghucu.',
            'Kebajikan adalah nilai-nilai moral yang baik.',
            'Harmoni adalah keadaan selaras dan seimbang.',
            'Kesetiaan adalah nilai penting dalam Khonghucu.',
            'Keadilan adalah nilai penting dalam Khonghucu.',
            'Kebijaksanaan adalah nilai penting dalam Khonghucu.'
        ],
        quiz: [
            { q: 'Siapa pendiri agama Khonghucu?', options: ['Kongzi', 'Laozi', 'Mengzi', 'Xunzi'], a: 0, type: 'mcq' },
            { q: 'Di mana Kongzi lahir?', options: ['India', 'Tiongkok', 'Jepang', 'Korea'], a: 1, type: 'mcq' },
            { q: 'Berapa jumlah Limbus Hubungan?', options: ['3', '4', '5', '6'], a: 2, type: 'mcq' },
            { q: 'Apa Limbus Hubungan pertama?', options: ['Orang tua dan anak', 'Rakyat dan pemerintah', 'Suami dan istri', 'Kakak dan adik'], a: 1, type: 'mcq' },
            { q: 'Apa yang dimaksud dengan Ren?', options: ['Kasih sayang', 'Sopan santun', 'Bakti', 'Kebajikan'], a: 0, type: 'mcq' },
            { q: 'Apa yang dimaksud dengan Li?', options: ['Kasih sayang', 'Sopan santun', 'Bakti', 'Kebajikan'], a: 1, type: 'mcq' },
            { q: 'Apa yang dimaksud dengan Xiao?', options: ['Kasih sayang', 'Sopan santun', 'Bakti', 'Kebajikan'], a: 2, type: 'mcq' },
            { q: 'Hari raya umat Khonghucu adalah?', options: ['Natal', 'Imlek', 'Nyepi', 'Waisak'], a: 1, type: 'mcq' },
            { q: 'Apa yang dimaksud dengan Junzi?', options: ['Orang jahat', 'Orang berbajikan', 'Orang kaya', 'Orang pintar'], a: 1, type: 'mcq' },
            { q: 'Apa yang dimaksud dengan harmoni?', options: ['Keadaan kacau', 'Keadaan selaras', 'Keadaan tidak seimbang', 'Keadaan buruk'], a: 1, type: 'mcq' },
            { q: 'Kongzi lahir pada tahun?', options: ['551 SM', '552 SM', '553 SM', '554 SM'], a: 0, type: 'mcq' },
            { q: 'Konfusianisme adalah ajaran?', options: ['Kongzi', 'Laozi', 'Mengzi', 'Xunzi'], a: 0, type: 'mcq' },
            { q: 'Limbus Hubungan kedua adalah?', options: ['Rakyat dan pemerintah', 'Orang tua dan anak', 'Suami dan istri', 'Kakak dan adik'], a: 1, type: 'mcq' },
            { q: 'Limbus Hubungan ketiga adalah?', options: ['Rakyat dan pemerintah', 'Orang tua dan anak', 'Suami dan istri', 'Kakak dan adik'], a: 2, type: 'mcq' },
            { q: 'Limbus Hubungan keempat adalah?', options: ['Rakyat dan pemerintah', 'Orang tua dan anak', 'Suami dan istri', 'Kakak dan adik'], a: 3, type: 'mcq' },
            { q: 'Limbus Hubungan kelima adalah?', options: ['Rakyat dan pemerintah', 'Orang tua dan anak', 'Suami dan istri', 'Teman dan teman'], a: 3, type: 'mcq' },
            { q: 'Ren adalah kebajikan?', options: ['Kasih sayang', 'Sopan santun', 'Bakti', 'Kebijaksanaan'], a: 0, type: 'mcq' },
            { q: 'Li adalah kebajikan?', options: ['Kasih sayang', 'Sopan santun', 'Bakti', 'Kebijaksanaan'], a: 1, type: 'mcq' },
            { q: 'Xiao adalah kebajikan?', options: ['Kasih sayang', 'Sopan santun', 'Bakti', 'Kebijaksanaan'], a: 2, type: 'mcq' },
            { q: 'Junzi adalah orang yang memiliki?', options: ['Kebajikan', 'Kekuasaan', 'Harta', 'Kekuatan'], a: 0, type: 'mcq' }
        ]
    }
};

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function generateSubjectContent(subject) {
    const content = SUBJECT_CONTENT[subject.subject_id];
    if (!content) {
        return generateGenericContent(subject);
    }
    const allQuestions = [...content.quiz];
    const shuffledQuestions = shuffleArray(allQuestions);
    return { topics: content.topics, facts: content.facts, quiz: shuffledQuestions };
}

function generateGenericContent(subject) {
    const topics = [
        Pengenalan \,
        Dasar-dasar \,
        Konsep \,
        Penerapan \,
        Sejarah \,
        Manfaat \,
        Jenis-jenis \,
        Contoh \,
        Latihan \,
        Kesimpulan \
    ];
    const facts = [
        \ merupakan bidang penting dalam pendidikan .,
        Pembelajaran  bertujuan mengembangkan pemahaman siswa tentang konsep-konsep kunci.,
        Dalam , terdapat beberapa komponen utama yang perlu dikuasai.,
        Penerapan  dalam kehidupan nyata sangat beragam.,
        Untuk menguasai , diperlukan latihan konsisten dan pemahaman mendalam.,
        \ memiliki peran penting dalam pengembangan keterampilan siswa.,
        Konsep dasar  menjadi fondasi untuk pembelajaran lebih lanjut.,
        Siswa diajak memahami bagaimana  bermanfaat dalam berbagai situasi.,
        Evaluasi berkala membantu mengukur kemajuan belajar .,
        \ mengajarkan nilai-nilai penting yang diterapkan dalam kehidupan sehari-hari.\n    ];
    const quiz = [];
    for (let i = 0; i < 20; i++) {
        quiz.push({ q: Apa yang dipelajari dalam ?, options: ['Konsep dasar', 'Tidak ada', 'Hanya teori', 'Hanya praktik'], a: 0, type: 'mcq' });
    }
    return { topics, facts, quiz };
}

function main() {
    const fs = require('fs');
    const path = require('path');
    let output = 'const SUBJECT_CONTENT = {\n';
    for (const subject of SUBJECTS) {
        const content = generateSubjectContent(subject);
        output +=     : {\n;
        output +=         topics: ,\n;
        output +=         facts: ,\n;
        output +=         quiz: \
;
        output +=     },\n;
    }
    output += ';\n\nmodule.exports = { SUBJECT_CONTENT };\n';
    fs.writeFileSync(path.join(__dirname, 'subjectDatabase.js'), output, 'utf8');
    console.log(Generated subjectDatabase.js with  subjects);
}

main();
