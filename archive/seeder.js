const mongoose = require('mongoose');
const Book = require('./models/Book');

// Data buku lengkap 10 halaman
const bookData = [
    // --- HALAMAN 1 ---
    {
        page_number: 1,
        title: "Pengenalan Artificial Intelligence & IoT",
        image_url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=600",
        reference_link: "https://www.ibm.com/topics/artificial-intelligence",
        paragraphs: [
            { paragraph_id: 1, text: "Artificial Intelligence atau Kecerdasan Buatan adalah cabang ilmu komputer yang berfokus pada pengembangan sistem yang mampu meniru kecerdasan manusia." },
            { paragraph_id: 2, text: "Internet of Things atau IoT adalah jaringan perangkat fisik yang terhubung ke internet untuk saling bertukar data secara real-time tanpa intervensi manusia." },
            { paragraph_id: 3, text: "Sinergi antara AI dan IoT melahirkan teknologi baru bernama AIoT yang memungkinkan perangkat keras berpikir secara mandiri melalui analisis data sensor." }
        ],
        quiz_questions: [
            { question: "Apa kepanjangan dari IoT?", options: ["Internet of Team", "Internet of Things", "Integration of Technology", "Internal of Things"], correct_answer: "Internet of Things" },
            { question: "Teknologi gabungan antara AI dan IoT disebut...", options: ["Cybernetics", "Robotics Cloud", "AIoT", "Deep Learning Device"], correct_answer: "AIoT" },
            { question: "Siapa yang bertindak memproses data sensor secara pintar pada AIoT?", options: ["Kabel Data", "Algoritma AI", "Baterai", "Layar LCD"], correct_answer: "Algoritma AI" },
            { question: "Perangkat IoT mengirim data secara...", options: ["Real-time", "Manual seminggu sekali", "Lewat surat", "Menggunakan bluetooth saja"], correct_answer: "Real-time" },
            { question: "Contoh implementasi AIoT di kehidupan sehari-hari adalah...", options: ["Lampu minyak", "Smart Thermostat dengan AI", "Buku cetak biasa", "Sepeda ontel"], correct_answer: "Smart Thermostat dengan AI" },
            { question: "Cabang ilmu komputer yang meniru kecerdasan manusia disebut...", options: ["Hardware Engineering", "Artificial Intelligence", "Database Administrator", "Networking"], correct_answer: "Artificial Intelligence" },
            { question: "Apa fungsi utama dari sensor pada perangkat IoT?", options: ["Menghasilkan listrik", "Mengumpulkan data lingkungan fisik", "Mempercantik casing", "Menghapus database"], correct_answer: "Mengumpulkan data lingkungan fisik" },
            { question: "Manakah yang BUKAN merupakan komponen utama IoT?", options: ["Sensor", "Konektivitas Internet", "Cloud/Broker", "Mesin Uap"], correct_answer: "Mesin Uap" },
            { question: "Di ekosistem SmartBook kita, MQTT berperan sebagai...", options: ["Sistem operasi laptop", "Protokol pengiriman data ringan", "Bahasa pemrograman AI", "Penyimpan gambar"], correct_answer: "Protokol pengiriman data ringan" },
            { question: "Mengapa AI dibutuhkan dalam pengolahan data IoT?", options: ["Agar perangkat jadi mahal", "Untuk menganalisis pola data besar yang rumit", "Mempersingkat kabel", "Membuat ESP32 bergetar"], correct_answer: "Untuk menganalisis pola data besar yang rumit" }
        ]
    },
    // --- HALAMAN 2 ---
    {
        page_number: 2,
        title: "Sensor Sebagai Panca Indra Ekosistem IoT",
        image_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600",
        reference_link: "https://www.sciencedirect.com/topics/engineering/iot-sensors",
        paragraphs: [
            { paragraph_id: 1, text: "Dalam ekosistem IoT, komponen sensor memegang peranan krusial sebagai panca indra fisik yang bertugas menangkap fenomena alam di dunia nyata." },
            { paragraph_id: 2, text: "Contoh sensor pasaran yang sering digunakan meliputi sensor suhu kelembaban udara DHT11, sensor cahaya LDR, dan sensor jarak ultrasonik HC-SR04." },
            { paragraph_id: 3, text: "Data analog yang ditangkap oleh sensor tersebut kemudian dikonversi menjadi sinyal digital agar bisa diolah lebih lanjut oleh otak sistem mikrokontroler." }
        ],
        quiz_questions: [
            { question: "Komponen apa yang bertindak sebagai panca indra fisik pada IoT?", options: ["Aktuator", "Sensor", "Buzzer", "Kabel Pelangi"], correct_answer: "Sensor" },
            { question: "Sensor DHT11 digunakan untuk membaca parameter apa saja?", options: ["Jarak dan Kecepatan", "Suhu dan Kelembaban Udara", "Intensitas Cahaya", "Detak Jantung"], correct_answer: "Suhu dan Kelembaban Udara" },
            { question: "Sensor LDR bekerja mendeteksi perubahan apa di lingkungannya?", options: ["Getaran Tanah", "Gas Bocor", "Intensitas Cahaya", "Tegangan Aki"], correct_answer: "Intensitas Cahaya" },
            { question: "HC-SR04 adalah jenis sensor yang memanfaatkan gelombang apa?", options: ["Sinar Inframerah", "Ultrasonik/Suara", "Gelombang Radio", "Sinar Ultraviolet"], correct_answer: "Ultrasonik/Suara" },
            { question: "Proses merubah data alam analog menjadi besaran angka komputer disebut...", options: ["Formatting", "Analog to Digital Conversion", "Downloading", "Debugging"], correct_answer: "Analog to Digital Conversion" },
            { question: "Mengapa sensor diletakkan di bagian paling depan sirkuit IoT?", options: ["Biar kelihatan rapi", "Sebagai sumber energi utama", "Untuk menangkap parameter fisik lingkungan", "Menahan lonjakan arus"], correct_answer: "Untuk menangkap parameter fisik lingkungan" },
            { question: "Jenis sensor apa yang tepat untuk mendeteksi adanya kebocoran gas di rumah?", options: ["DHT11", "MQ-2", "LDR", "HC-SR04"], correct_answer: "MQ-2" },
            { question: "Sensor PIR digunakan manusia dalam sistem pintar untuk mendeteksi...", options: ["Warna benda", "Kecepatan angin", "Pergerakan makhluk hidup/makro", "Kelembaban tanah"], correct_answer: "Pergerakan makhluk hidup/makro" },
            { question: "Jika intensitas cahaya redup, resistansi pada sensor LDR akan...", options: ["Berubah drastis", "Menjadi nol", "Tetap konstan", "Menghilang"], correct_answer: "Berubah drastis" },
            { question: "Data dari sensor dikirimkan ke mikrokontroler dalam bentuk sinyal...", options: ["Mekanik", "Surat", "Elektrik Digital/Analog", "Gelombang Air"], correct_answer: "Elektrik Digital/Analog" }
        ]
    },
    // --- HALAMAN 3 ---
    {
        page_number: 3,
        title: "Mikrokontroler ESP32 Sebagai Otak Pengendali",
        image_url: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?q=80&w=600",
        reference_link: "https://docs.espressif.com/projects/esp-idf/en/latest/esp32/",
        paragraphs: [
            { paragraph_id: 1, text: "ESP32 adalah modul mikrokontroler berbiaya rendah yang sangat populer dan handal untuk mengembangkan sistem purwarupa berbasis IoT." },
            { paragraph_id: 2, text: "Kelebihan utama chip ESP32 terletak pada integrasi modul konektivitas Wi-Fi dan Bluetooth Low Energy (BLE) langsung di dalam satu papan tunggal." },
            { paragraph_id: 3, text: "Dengan kecepatan clock mencapai 240 MHz and arsitektur dual-core, ESP32 mampu mengeksekusi kompilasi kode program pintar secara cepat." }
        ],
        quiz_questions: [
            { question: "Apa kelebihan utama dari mikrokontroler ESP32?", options: ["Ukurannya besar", "Dilengkapi Wi-Fi dan Bluetooth internal", "Harganya jutaan rupiah", "Bisa menggantikan kulkas"], correct_answer: "Dilengkapi Wi-Fi dan Bluetooth internal" },
            { question: "Berapakah kecepatan clock maksimal dari chip prosesor ESP32?", options: ["16 MHz", "240 MHz", "3.5 GHz", "9600 Hz"], correct_answer: "240 MHz" },
            { question: "Arsitektur inti prosesor (core) yang dimiliki oleh ESP32 adalah...", options: ["Single-core", "Dual-core", "Quad-core", "Octa-core"], correct_answer: "Dual-core" },
            { question: "Perusahaan manakah yang memproduksi chip modul ESP32?", options: ["Intel", "Espressif Systems", "Arduino LLC", "AMD"], correct_answer: "Espressif Systems" },
            { question: "Pin GPIO pada ESP32 berfungsi utama untuk apa?", options: ["Menyalakan kipas internal", "Jalur Input dan Output data digital", "Menyimpan file foto", "Pendingin chip"], correct_answer: "Jalur Input dan Output data digital" },
            { question: "Tegangan operasi yang aman dan disarankan untuk board ESP32 adalah...", options: ["5V atau 3.3V", "220V AC", "12V murni", "1.5V baterai jam"], correct_answer: "5V atau 3.3V" },
            { question: "Software open-source yang paling umum dipakai menulis kode ESP32 adalah...", options: ["Photoshop", "Arduino IDE", "Microsoft Word", "CorelDraw"], correct_answer: "Arduino IDE" },
            { question: "Fitur BLE pada ESP32 singkatan dari...", options: ["Bluetooth Long Energy", "Bluetooth Low Energy", "Basic Logic Engine", "Broadband Light Emission"], correct_answer: "Bluetooth Low Energy" },
            { question: "Fungsi dari pin EN (Enable/Reset) pada fisik ESP32 adalah untuk...", options: ["Menghapus firmware total", "Memulai ulang eksekusi program dari awal", "Menaikkan voltase", "Menyalakan Wi-Fi"], correct_answer: "Memulai ulang eksekusi program dari awal" },
            { question: "Mengapa ESP32 lebih dipilih untuk AIoT dibanding Arduino Uno standard?", options: ["Karena warnanya hitam", "Sebab punya memori besar & koneksi internet bawaan", "Karena tidak punya kabel", "Lebih berat dikantong"], correct_answer: "Sebab punya memori besar & koneksi internet bawaan" }
        ]
    },
    // --- HALAMAN 4 ---
    {
        page_number: 4,
        title: "Aktuator Dan Komponen Gerak Mekanis",
        image_url: "https://images.unsplash.com/photo-1563770660941-20978e870e26?q=80&w=600",
        reference_link: "https://www.electronicshub.org/types-of-actuators/",
        paragraphs: [
            { paragraph_id: 1, text: "Jika sensor bertindak sebagai panca indra penangkap data, maka aktuator berperan sebagai otot penggerak mekanis pada ekosistem IoT." },
            { paragraph_id: 2, text: "Aktuator merubah energi listrik dari mikrokontroler menjadi aksi fisik nyata seperti gerakan mekanis, suara, ataupun cahaya di dunia nyata." },
            { paragraph_id: 3, text: "Contoh komponen aktuator meliputi Motor Servo pemutar otomatis, Relay pemutus arus listrik tinggi, Pompa air mini, dan komponen Alarm Buzzer." }
        ],
        quiz_questions: [
            { question: "Apa peran utama dari komponen aktuator dalam IoT?", options: ["Menangkap data suhu", "Menjadi otot penggerak mekanis/aksi nyata", "Menyimpan database lokal", "Mempercepat koneksi internet"], correct_answer: "Menjadi otot penggerak mekanis/aksi nyata" },
            { question: "Komponen aktuator merubah energi listrik menjadi energi...", options: ["Kimia", "Uap", "Aksi Fisik/Mekanis", "Nuklir"], correct_answer: "Aksi Fisik/Mekanis" },
            { question: "Manakah di bawah ini yang tergolong komponen aktuator?", options: ["Sensor Cahaya LDR", "Sensor Suhu DHT11", "Motor Servo / Pompa Air", "Mikrofon Analog"], correct_answer: "Motor Servo / Pompa Air" },
            { question: "Komponen yang berfungsi sebagai saklar elektronik pemutus arus listrik tegangan tinggi adalah...", options: ["Kabel Jumper", "Relay", "Buzzer", "Resistor"], correct_answer: "Relay" },
            { question: "Aktuator apa yang cocok digunakan untuk membuat sirine peringatan dini bencana?", options: ["Motor DC", "Layar LCD", "Buzzer/Speaker", "Sensor LDR"], correct_answer: "Buzzer/Speaker" },
            { question: "Motor Servo bekerja memutar sudut lengan dengan presisi antara...", options: ["0 sampai 180 derajat", "Bebas berputar tanpa batas", "Hanya maju mundur", "0 sampai 10 derajat"], correct_answer: "0 sampai 180 derajat" },
            { question: "Untuk membuat prototype jemuran otomatis yang menutup saat hujan, komponen mekanis penggerak atapnya menggunakan...", options: ["Sensor Rain Drop", "Motor Servo/DC", "Relay saja", "Baterai"], correct_answer: "Motor Servo/DC" },
            { question: "Mengapa aktuator memerlukan driver tambahan jika dayanya besar?", options: ["Agar tidak konslet", "Karena arus langsung dari pin ESP32 sangat terbatas", "Biar warnanya senada", "Mempersingkat kabel"], correct_answer: "Karena arus langsung dari pin ESP32 sangat terbatas" },
            { question: "Aktuator apa yang digunakan pada proyek Smart Agriculture untuk menyiram tanaman?", options: ["Lampu LED", "Solenoid Valve / Pompa Air Mini", "Sensor Kelembaban Tanah", "Buzzer"], correct_answer: "Solenoid Valve / Pompa Air Mini" },
            { question: "Aksi mematikan lampu via aplikasi web dashboard akan memicu aktuator...", options: ["LDR mati", "Relay memutus aliran listrik", "ESP32 meledak", "Buzzer berbunyi"], correct_answer: "Relay memutus aliran listrik" }
        ]
    },
    // --- HALAMAN 5 ---
    {
        page_number: 5,
        title: "Jaringan Protokol Ringan MQTT",
        image_url: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=600",
        reference_link: "https://mqtt.org/",
        paragraphs: [
            { paragraph_id: 1, text: "MQTT atau Message Queuing Telemetry Transport adalah protokol komunikasi jaringan ringan yang berjalan di atas arsitektur TCP/IP." },
            { paragraph_id: 2, text: "Protokol ini menggunakan metode publish dan subscribe yang sangat hemat bandwidth, menjadikannya standar utama komunikasi data alat IoT." },
            { paragraph_id: 3, text: "Pusat penyambung data MQTT disebut Broker (seperti HiveMQ), yang mendistribusikan payload payload data berdasarkan klasifikasi nama topik." }
        ],
        quiz_questions: [
            { question: "Apa kepanjangan resmi dari istilah protokol MQTT?", options: ["Message Queuing Telemetry Transport", "Managed Query Technical Topic", "Main Queue Technology Transfer", "Micro Quantum Teleportation"], correct_answer: "Message Queuing Telemetry Transport" },
            { question: "Metode komunikasi yang diadopsi oleh protokol MQTT adalah...", options: ["Request and Response", "Publish and Subscribe", "Peer to Peer murni", "Broadcast offline"], correct_answer: "Publish and Subscribe" },
            { question: "Pusat pengatur lalu lintas data udara pada MQTT disebut...", options: ["Database", "Broker", "Gateway", "Microcontroller"], correct_answer: "Broker" },
            { question: "Mengapa MQTT sangat populer digunakan untuk perangkat berbasis IoT?", options: ["Scanning gratis tanpa syarat", "Sangat ringan dan hemat pemakaian bandwidth", "Dapat menyimpan video resolusi 4K", "Bisa berjalan tanpa listrik"], correct_answer: "Sangat ringan dan hemat pemakaian bandwidth" },
            { question: "Contoh server cloud broker publik gratis yang kita gunakan saat ini adalah...", options: ["Google Drive", "HiveMQ Broker", "MongoDB Compass", "Localhost 5000"], correct_answer: "HiveMQ Broker" },
            { question: "Jalur klasifikasi alamat pengiriman data di dalam MQTT dinamakan...", options: ["URL path", "Topic", "Database Collection", "IP Address"], correct_answer: "Topic" },
            { question: "Format pengiriman data (payload) paling populer yang dibungkus di MQTT berbentuk...", options: ["File .EXE", "JSON String", "Teks Microsoft Word", "Gambar .PNG"], correct_answer: "JSON String" },
            { question: "Jika ESP32 ingin menerima data dari suatu topik MQTT, aksi yang dilakukan adalah...", options: ["Publish", "Subscribe", "Connect", "Disconnect"], correct_answer: "Subscribe" },
            { question: "Jika ESP32 mengirimkan data koordinat halaman buku, aksi tersebut dinamakan...", options: ["Publish", "Subscribe", "Listen", "Seeding"], correct_answer: "Publish" },
            { question: "MQTT berjalan di atas fondasi arsitektur jaringan komunikasi...", options: ["UDP murni", "TCP/IP", "Bluetooth Core", "Infrared Wave"], correct_answer: "TCP/IP" }
        ]
    },
    // --- HALAMAN 6 ---
    {
        page_number: 6,
        title: "Cloud Server Dan Arsitektur MongoDB",
        image_url: "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?q=80&w=600",
        reference_link: "https://www.mongodb.com/what-is-mongodb",
        paragraphs: [
            { paragraph_id: 1, text: "Cloud Server bertindak sebagai memori jangka panjang global tempat mengintegrasikan seluruh data aktivitas sensor IoT dan log kuis." },
            { paragraph_id: 2, text: "MongoDB adalah database NoSQL berbasis dokumen berformat BSON yang sangat fleksibel mengelola data dalam skala besar tanpa skema tabel kaku." },
            { paragraph_id: 3, text: "Dengan integrasi cloud server, rekam jejak perkembangan belajar siswa dapat dianalisis real-time kapan saja dan dari belahan dunia mana saja." }
        ],
        quiz_questions: [
            { question: "Database MongoDB termasuk ke dalam kategori jenis database...", options: ["SQL Relasional", "NoSQL Berbasis Dokumen", "File Teks Notepad", "Spreadsheet Excel"], correct_answer: "NoSQL Berbasis Dokumen" },
            { question: "Format penyimpanan internal yang digunakan oleh MongoDB dinamakan...", options: ["BSON / JSON", "XML Grid", "CSV Tabel", "HTML Text"], correct_answer: "BSON / JSON" },
            { question: "Istilah baris data (Row) pada SQL biasa, di MongoDB disebut dengan...", options: ["Collection", "Document", "Field", "Database Cluster"], correct_answer: "Document" },
            { question: "Tempat berkumpulnya dokumen sejenis (Tabel pada SQL) di MongoDB dinamakan...", options: ["Field", "Collection", "Query", "Schema"], correct_answer: "Collection" },
            { question: "Fungsi utama Cloud Server pada arsitektur SmartBook kita adalah...", options: ["Membuat web jadi berwarna", "Menjadi pusat memori penyimpanan data aktivitas global", "Mengecas baterai ESP32", "Memperbaiki kabel USB yang rusak"], correct_answer: "Menjadi pusat memori penyimpanan data aktivitas global" },
            { question: "Library Node.js yang mempermudah koneksi objek skema ke MongoDB adalah...", options: ["Cors", "Mongoose", "Mqtt", "Nodemon"], correct_answer: "Mongoose" },
            { question: "Perintah MongoDB untuk mencari satu data spesifik di collection adalah...", options: ["save()", "findOne()", "deleteMany()", "create()"], correct_answer: "findOne()" },
            { question: "Keunggulan utama MongoDB dibanding database SQL biasa adalah...", options: ["Strukturnya kaku", "Sangat fleksibel tanpa struktur kolom tabel yang kaku", "Ukurannya kecil", "Hanya bisa diakses offline"], correct_answer: "Sangat fleksibel tanpa struktur kolom tabel yang kaku" },
            { question: "Dimanakah letak cluster cloud resmi MongoDB disimpan secara awan?", options: ["MongoDB Compass", "MongoDB Atlas", "Localhost 27017", "Arduino Cloud"], correct_answer: "MongoDB Atlas" },
            { question: "Data waktu belajarmu disimpan otomatis di field database MongoDB bernama...", options: ["student_name", "timestamp", "activity_type", "score"], correct_answer: "timestamp" }
        ]
    },
    // --- HALAMAN 7 ---
    {
        page_number: 7,
        title: "Fondasi Utama Artificial Intelligence",
        image_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600",
        reference_link: "https://www.microsoft.com/en-us/artificial-intelligence",
        paragraphs: [
            { paragraph_id: 1, text: "Artificial Intelligence (AI) adalah payung besar ilmu semesta yang mempelajari cara membuat mesin komputer mampu berpikir cerdas layaknya manusia." },
            { paragraph_id: 2, text: "Ruang lingkup AI modern melingkupi kemampuan penalaran logika, pemecahan masalah complexes, hingga pengenalan konteks bahasa dan visual." },
            { paragraph_id: 3, text: "Di era digital saat ini, mesin AI tidak lagi bekerja manual berbasis rumus kaku, melainkan adaptif menyesuaikan masukan data yang bervariasi." }
        ],
        quiz_questions: [
            { question: "Apa tujuan utama diciptakannya teknologi Artificial Intelligence (AI)?", options: ["Membuat komputer menjadi berat", "Membuat mesin mampu berpikir cerdas meniru manusia", "Menghapus peran internet", "Membatasi ruang gerak software"], correct_answer: "Membuat mesin mampu berpikir cerdas meniru manusia" },
            { question: "Siapakah ilmuwan legendaris yang dianggap sebagai bapak pendiri kecerdasan buatan?", options: ["Alan Turing / John McCarthy", "Bill Gates", "Steve Jobs", "Elon Musk"], correct_answer: "Alan Turing / John McCarthy" },
            { question: "Manakah yang tergolong kemampuan utama dari kecerdasan AI modern?", options: ["Mengecas daya baterai", "Penalaran, pemecahan masalah, dan pengenalan konteks", "Memotong kabel sirkuit", "Mencetak kertas laporan"], correct_answer: "Penalaran, pemecahan masalah, dan pengenalan konteks" },
            { question: "Sistem pendeteksi wajah (Face Recognition) termasuk implementasi AI di bidang...", options: ["Natural Language Processing", "Computer Vision / Penglihatan Komputer", "Data Analyst", "Cyber Security murni"], correct_answer: "Computer Vision / Penglihatan Komputer" },
            { question: "AI yang dirancang khusus hanya ahli melakukan satu tugas spesifik dinamakan...", options: ["Super AI", "Narrow AI / Weak AI", "General AI", "Humanoid AI"], correct_answer: "Narrow AI / Weak AI" },
            { question: "Metode menguji apakah suatu mesin beneran punya kecerdasan menyerupai manusia disebut...", options: ["Stress Test", "Turing Test", "Upload Test", "Debounce Test"], correct_answer: "Turing Test" },
            { question: "Manakah contoh sistem kecerdasan buatan yang bertugas mengolah bahasa?", options: ["Lampu otomatis", "Google Translate / ChatGPT", "Motor Servo", "Pompa Air"], correct_answer: "Google Translate / ChatGPT" },
            { question: "Apa bahan bakar utama yang paling krusial agar model AI bisa menjadi pintar?", options: ["Listrik tegangan tinggi", "Kumpulan Data (Data / Big Data)", "Kabel LAN tebal", "Casing besi"], correct_answer: "Kumpulan Data (Data / Big Data)" },
            { question: "Sistem kecerdasan buatan masa depan yang setara atau melebihi otak manusia disebut...", options: ["Weak AI", "Artificial General Intelligence (AGI)", "Regex Match", "Autopilot Manual"], correct_answer: "Artificial General Intelligence (AGI)" },
            { question: "Mengapa sistem pencocokan kata kaku biasa (String Regex) dianggap belum pintar?", options: ["Karena harganya murah", "Sebab tidak memiliki kemampuan adaptasi logika kontekstual", "Refusing to download database", "Tidak memerlukan koneksi wifi"], correct_answer: "Sebab tidak memiliki kemampuan adaptasi logika kontekstual" }
        ]
    },
    // --- HALAMAN 8 ---
    {
        page_number: 8,
        title: "Inti Dari Metode Machine Learning",
        image_url: "https://images.unsplash.com/photo-1527474305487-b87b222841cc?q=80&w=600",
        reference_link: "https://www.ibm.com/topics/machine-learning",
        paragraphs: [
            { paragraph_id: 1, text: "Machine Learning (ML) adalah sub-bidang dari AI yang fokus mengembangkan algoritma agar komputer bisa belajar mandiri tanpa diprogram manual." },
            { paragraph_id: 2, text: "Model Machine Learning dilatih (training) menggunakan data historis masa lalu untuk mengenali pola-pola rumit dan memprediksi data baru." },
            { paragraph_id: 3, text: "Tiga paradigma utama dalam Machine Learning meliputi Supervised Learning, Unsupervised Learning, dan Reinforcement Learning." }
        ],
        quiz_questions: [
            { question: "Apa inti perbedaan utama Machine Learning dengan pemrograman konvensional?", options: ["ML menggunakan memori flash", "ML belajar otomatis dari pola data masa lalu", "ML tidak butuh komputer", "ML membutuhkan kabel khusus"], correct_answer: "ML belajar otomatis dari pola data masa lalu" },
            { question: "Proses mengajari model algoritma menggunakan kumpulan data dinamakan...", options: ["Debugging", "Training / Pelatihan Model", "Formatting", "Compiling"], correct_answer: "Training / Pelatihan Model" },
            { question: "Metode pembelajaran ML yang datanya sudah diberi label jawaban yang benar sejak awal disebut...", options: ["Unsupervised Learning", "Supervised Learning", "Reinforcement Learning", "Deep Fake System"], correct_answer: "Supervised Learning" },
            { question: "Metode ML untuk mengelompokkan data tanpa label (Clustering) dinamakan...", options: ["Supervised Learning", "Unsupervised Learning", "Regression", "Classification"], correct_answer: "Unsupervised Learning" },
            { question: "Paradigma ML yang belajar berdasarkan sistem penghargaan (reward) dan hukuman (penalty) adalah...", options: ["Supervised Learning", "Unsupervised Learning", "Reinforcement Learning", "Autopilot Form"], correct_answer: "Reinforcement Learning" },
            { question: "Algoritma ML yang strukturnya meniru susunan sel saraf otak manusia dinamakan...", options: ["Decision Tree", "Linear Regression", "Artificial Neural Networks (Jaringan Saraf Tiruan)", "K-Means Clustering"], correct_answer: "Artificial Neural Networks (Jaringan Saraf Tiruan)" },
            { question: "Proses memprediksi harga rumah di masa depan berdasarkan luas tanah tergolong tugas...", options: ["Clustering", "Regression (Regresi)", "Classification (Klasifikasi)", "Debouncing"], correct_answer: "Regression (Regresi)" },
            { question: "Memisahkan email masuk kedalam folder 'Spam' atau 'Bukan Spam' tergolong tugas...", options: ["Regression", "Clustering", "Classification (Klasifikasi)", "Formatting"], correct_answer: "Classification (Klasifikasi)" },
            { question: "Kondisi dimana model ML terlalu pintar menghafal data latihan tapi gagal memprediksi data baru dinamakan...", options: ["Underfitting", "Overfitting", "Perfect Fitting", "Stuck Loading"], correct_answer: "Overfitting" },
            { question: "Sub-ilmu dari Machine Learning yang menggunakan banyak lapisan saraf tiruan tingkat dalam disebut...", options: ["Deep Learning", "Shallow Learning", "Cybernetics", "Cloud Computing"], correct_answer: "Deep Learning" }
        ]
    },
    // --- HALAMAN 9 ---
    {
        page_number: 9,
        title: "AI & Pengolahan Bahasa Alami (NLP)",
        image_url: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=600",
        reference_link: "https://www.ibm.com/topics/natural-language-processing",
        paragraphs: [
            { paragraph_id: 1, text: "Natural Language Processing (NLP) adalah cabang AI yang menjembatani komunikasi bahasa manusia asli agar dimengerti secara cerdas oleh komputer." },
            { paragraph_id: 2, text: "Teknologi NLP bertanggung jawab merubah sinyal gelombang suara lisan menjadi teks teks digital, kemudian mengevaluasi makna semantiknya." },
            { paragraph_id: 3, text: "Di ekosistem SmartBook kita, Gemini AI bertindak sebagai mesin NLP pintar yang menilai kelurusan lafal setoran hafalanmu secara kontekstual." }
        ],
        quiz_questions: [
            { question: "Apa singkatan dari istilah teknologi NLP di dunia Artificial Intelligence?", options: ["National Logic Protocol", "Network Learning Processing", "Natural Language Processing", "Numeric Linear Programming"], correct_answer: "Natural Language Processing" },
            { question: "Apa fokus tugas utama dari cabang teknologi NLP?", options: ["Mengatur sirkuit relay", "Menjembatani bahasa manusia agar dimengerti secara pintar oleh komputer", "Mempercepat transfer database NoSQL", "Membaca intensitas cahaya"], correct_answer: "Menjembatani bahasa manusia agar dimengerti secara pintar oleh komputer" },
            { question: "Proses mengubah gelombang suara lisan manusia menjadi bentuk teks digital disebut...", options: ["Text to Speech", "Speech to Text / Audio Recognition", "Translation", "Parsing Array"], correct_answer: "Speech to Text / Audio Recognition" },
            { question: "Model AI super pintar milik Google yang kita gunakan sebagai mesin evaluator di backend bernama...", options: ["ChatGPT 4o", "Google Gemini 2.5 Flash", "DeepSeek Coder", "Claude Sonnet"], correct_answer: "Google Gemini 2.5 Flash" },
            { question: "Mengapa Gemini AI lebih unggul mengevaluasi hafalan dibanding metode pencocokan kata kaku?", options: ["Refusing to answer", "Mampu memahami makna konteks semantik bahasa & toleran variasi logat vokal", "Sebab Gemini tidak butuh internet", "Bisa memperkecil memori database"], correct_answer: "Mampu memahami makna konteks semantik bahasa & toleran variasi logat vokal" },
            { question: "Proses memtotong-motong kalimat utuh menjadi kumpulan kata tunggal pada NLP disebut...", options: ["Stemming", "Tokenization (Tokenisasi)", "Lemmatization", "Formatting JSON"], correct_answer: "Tokenization (Tokenisasi)" },
            { question: "Menghapus kata-kata umum yang kurang penting (seperti: yang, di, ke, dari) pada NLP disebut...", options: ["Stopwords Removal", "Stemming", "Filtering Data", "Parsing Document"], correct_answer: "Stopwords Removal" },
            { question: "Analisis NLP untuk mendeteksi apakah kalimat ulasan bermakna 'Positif', 'Negatif', atau 'Netral' dinamakan...", options: ["Speech Tagging", "Sentiment Analysis (Analisis Sentimen)", "Translation Matrix", "Clustering Word"], correct_answer: "Sentiment Analysis (Analisis Sentimen)" },
            { question: "Asisten virtual pintar Apple Siri atau Amazon Alexa memanfaatkan gabungan teknologi...", options: ["Relay dan Sensor Cahaya", "IoT Hardware murni", "NLP dan Speech Recognition", "Database SQL Offline"], correct_answer: "NLP dan Speech Recognition" },
            { question: "Format output apa yang diwajibkan dari Gemini AI ke server backend kita agar anti-stuck?", options: ["Teks paragraph biasa", "JSON murni (score & feedback_text)", "File HTML", "Binary Array"], correct_answer: "JSON murni (score & feedback_text)" }
        ]
    },
    // --- HALAMAN 10 ---
    {
        page_number: 10,
        title: "Masa Depan Integrasi Teknologi AIoT",
        image_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600",
        reference_link: "https://www.iotforall.com/what-is-aiot",
        paragraphs: [
            { paragraph_id: 1, text: "Integrasi mutakhir AIoT membawa peradaban baru dimana perangkat keras tidak lagi sekedar mengumpulkan data kaku, melainkan mampu mengambil keputusan." },
            { paragraph_id: 2, text: "Di masa depan, implementasi AIoT akan merambah masif ke sektor Smart City, Mobil Autopilot tanpa sopir, serta Robotika Otomasi Industri Medis." },
            { paragraph_id: 3, text: "Melalui proyek inovasi SmartLearning Book ini, kita membuktikan bahwa kolaborasi AI and IoT dapat merevolusi masa depan dunia pendidikan Indonesia." }
        ],
        quiz_questions: [
            { question: "Apa esensi revolusi masa depan yang dibawa oleh teknologi integrasi AIoT?", options: ["Membuat alat menjadi lebih besar", "Perangkat keras mampu mengambil keputusan pintar mandiri secara real-time", "Menghapus pemakaian koneksi awan", "Mempersingkat jalur baterai"], correct_answer: "Perangkat keras mampu mengambil keputusan pintar mandiri secara real-time" },
            { question: "Manakah contoh implementasi AIoT skala besar di kehidupan masa depan?", options: ["Lampu teplok minyak", "Smart City, Smart Grid, dan Mobil Otonom Autopilot", "Kertas cetak ensiklopedia biasa", "Jam dinding pegas manual"], correct_answer: "Smart City, Smart Grid, dan Mobil Otonom Autopilot" },
            { question: "Pada mobil otonom (Self-Driving Car), fungsi algoritma AI adalah untuk...", options: ["Mengecas accu mobil", "Menganalisis data sensor kamera untuk navigasi kemudi aman otomatis", "Mempercantik warna bodi mobil", "Mengurangi pemakaian bensin murni"], correct_answer: "Menganalisis data sensor kamera untuk navigasi kemudi aman otomatis" },
            { question: "Teknologi memproses analisa data AI langsung di level chip hardware terdekat (tanpa telat kirim cloud) disebut...", options: ["Cloud Computing", "Edge AI / Edge Computing", "Database Seeding", "MQTT Publish"], correct_answer: "Edge AI / Edge Computing" },
            { question: "Apa keuntungan utama menerapkan Edge AI pada sistem keselamatan otonom?", options: ["Biaya murah", "Menghilangkan delay latensi pengiriman data (Zero Latency Decision)", "Ukuran alat mengecil", "Kabel menjadi lentur"], correct_answer: "Menghilangkan delay latensi pengiriman data (Zero Latency Decision)" },
            { question: "Sektor industri manufaktur masa depan yang mengandalkan robot pintar AIoT dinamakan era...", options: ["Industri 1.0", "Industri 2.0", "Industri 4.0 / Society 5.0", "Industri Jadul"], correct_answer: "Industri 4.0 / Society 5.0" },
            { question: "Bagaimanakah prototype Smart Learning Book kelompok kita merombak masa depan dunia pendidikan?", options: ["Membeli buku cetak baru", "Menciptakan buku fisik interaktif yang dibimbing langsung tutor cerdas AIoT", "Menghapus kurikulum sekolah", "Membuat siswa belajar tanpa laptop"], correct_answer: "Menciptakan buku fisik interaktif yang dibimbing langsung tutor cerdas AIoT" },
            { question: "Komponen apa yang bertindak sebagai jalur jalan raya tol udara pengiriman data massal AIoT?", options: ["Kabel Pelangi IDE", "Jaringan Nirkabel 5G / Wi-Fi Berkecepatan Tinggi", "Buzzer Mekanis", "Pin Reset EN"], correct_answer: "Jaringan Nirkabel 5G / Wi-Fi Berkecepatan Tinggi" },
            { question: "Tantangan terbesar sistem AIoT di masa depan yang mengelola miliaran data sensor adalah...", options: ["Keindahan casing", "Keamanan Data (Data Privacy & Cyber Security)", "Panjang kabel jumper", "Berat fisik alat"], correct_answer: "Keamanan Data (Data Privacy & Cyber Security)" },
            { question: "Gelar tertinggi kasta kompetensi pameran belajar dashboard SmartBook tim lo dinamakan...", options: ["Pemula AIoT", "Explorer AIoT", "Innovator AIoT", "Master AIoT Elite 👑"], correct_answer: "Master AIoT Elite 👑" }
        ]
    }
];

async function seedDatabase() {
    try {
        await mongoose.connect('mongodb://localhost:27017/edubook');
        console.log('✅ Terhubung ke MongoDB');
        
        // Hapus data lama
        await Book.deleteMany({});
        console.log('🗑️ Data buku lama dihapus');
        
        // Insert data baru
        await Book.insertMany(bookData);
        console.log(`✅ ${bookData.length} halaman buku berhasil ditambahkan!`);
        
        // Verifikasi
        const count = await Book.countDocuments();
        console.log(`📚 Total halaman di database: ${count}`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

seedDatabase();