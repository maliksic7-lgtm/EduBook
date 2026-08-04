// seed.js - Isi data buku ke MongoDB dengan Aset Visual Premium & 10 Soal Kuis Per Halaman
const mongoose = require('mongoose');
const Book = require('./models/Book');

const bookData = [
    {
        page_number: 1,
        title: "Pengenalan AIoT & IoT",
        image_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600",
        reference_link: "https://www.ibm.com/topics/internet-of-things",
        paragraphs: [
            { paragraph_id: 1, text: "Internet of Things (IoT) adalah konsep di mana perangkat-perangkat fisik terhubung ke internet dan dapat saling berkomunikasi. IoT memungkinkan benda-benda di sekitar kita menjadi 'cerdas' dan dapat dikendalikan dari jarak jauh." },
            { paragraph_id: 2, text: "Ekosistem IoT terdiri dari 4 komponen utama: Sensor (mengumpulkan data), Konektivitas (jaringan), Pemrosesan Data (analisis), dan Aksi (aktuator). Contoh sederhana adalah lampu rumah yang bisa dinyalakan dari smartphone." }
        ],
        quiz_questions: [
            { question: "Apa kepanjangan dari IoT?", options: ["Internet of Things", "Internet of Technology", "Internal of Things", "Internet of Tools"], correct_answer: "Internet of Things" },
            { question: "Berapa komponen utama dalam ekosistem IoT?", options: ["2", "3", "4", "5"], correct_answer: "4" },
            { question: "Komponen ekosistem IoT yang bertugas mengumpulkan data dari lingkungan sekitar bernama...", options: ["Sensor", "Aktuator", "Jaringan/Gateway", "Cloud Computing"], correct_answer: "Sensor" },
            { question: "Teknologi gabungan antara Artificial Intelligence (AI) dan Internet of Things (IoT) disebut...", options: ["AIoT", "Robotics System", "Deep Web Infrastructure", "Cybernetics Data"], correct_answer: "AIoT" },
            { question: "Manakah contoh implementasi sistem IoT yang benar dalam kehidupan sehari-hari?", options: ["Lampu pintar yang dikontrol via Smartphone", "Mengetik dokumen di Microsoft Word", "Menonton video offline di harddisk", "Mendengarkan radio analog FM"], correct_answer: "Lampu pintar yang dikontrol via Smartphone" },
            { question: "Apa peran utama konektivitas dalam arsitektur IoT?", options: ["Mengirim data dari sensor ke cloud/pemroses", "Mengubah data digital menjadi aksi mekanis", "Mendeteksi perubahan suhu di sekitar perangkat", "Menghapus memori log sampah otomatis"], correct_answer: "Mengirim data dari sensor ke cloud/pemroses" },
            { question: "Ketika sistem IoT melakukan analisis data sensor untuk mengambil kesimpulan, proses ini ada pada tahap...", options: ["Pemrosesan Data", "Konektivitas", "Akuisisi Sensor", "Aktuasi Fisik"], correct_answer: "Pemrosesan Data" },
            { question: "Komponen ekosistem IoT yang mengeksekusi aksi nyata berdasarkan hasil analisis bernama...", options: ["Aktuator", "Sensor", "Cip Wi-Fi", "Database MongoDB"], correct_answer: "Aktuator" },
            { question: "Mengapa perangkat IoT bisa disebut sebagai perangkat cerdas (smart device)?", options: ["Karena terhubung ke jaringan internet dan bisa bertukar data", "Karena harganya sangat mahal dan langka", "Karena tidak membutuhkan daya listrik sama sekali", "Karena menggunakan casing berbahan logam baja raksasa"], correct_answer: "Karena terhubung ke jaringan internet dan bisa bertukar data" },
            { question: "Kombinasi teknologi yang membuat ekosistem IoT mampu memprediksi kerusakan mesin secara otomatis adalah...", options: ["Sensor IoT + Analisis AI", "Kabel Jaringan + Lampu LED", "Buzzer + Relay 5V", "Baterai Aki + Casing Plastik"], correct_answer: "Sensor IoT + Analisis AI" }
        ]
    },
    {
        page_number: 2,
        title: "Sensor Indra IoT",
        image_url: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?q=80&w=600",
        reference_link: "https://www.sciencedirect.com/topics/engineering/iot-sensors",
        paragraphs: [
            { paragraph_id: 1, text: "Sensor adalah komponen yang berfungsi seperti 'panca indra' pada sistem IoT. Sensor mengubah sinyal fisik (suhu, cahaya, gerakan) menjadi sinyal listrik yang bisa diproses oleh mikrokontroler." },
            { paragraph_id: 2, text: "Jenis sensor yang umum digunakan dalam IoT antara lain: Sensor suhu (DHT11, DS18B20), Sensor jarak (Ultrasonic HC-SR04), Sensor gerak (PIR), dan Sensor cahaya (LDR). Setiap sensor memiliki karakteristik dan kegunaan yang berbeda." }
        ],
        quiz_questions: [
            { question: "Apa fungsi utama sensor dalam sistem IoT?", options: ["Mengubah sinyal fisik menjadi sinyal listrik", "Mengirimkan data langsung ke database cloud", "Menampilkan grafik status di dashboard web", "Memutuskan aliran daya listrik cadangan"], correct_answer: "Mengubah sinyal fisik menjadi sinyal listrik" },
            { question: "Sensor yang paling tepat digunakan untuk mendeteksi pergerakan makhluk hidup berbasis inframerah adalah...", options: ["Sensor PIR (Passive Infrared)", "Sensor Suhu DHT11", "Sensor Jarak Ultrasonic HC-SR04", "Sensor Cahaya LDR"], correct_answer: "Sensor PIR (Passive Infrared)" },
            { question: "Jika lo ingin membangun sistem jemuran otomatis yang mendeteksi datangnya hujan, sensor fisik apa yang lo butuhkan?", options: ["Sensor Raindrops/Air Hujan", "Sensor Jarak HC-SR04", "Sensor Api (Flame Sensor)", "Sensor Gas MQ-2"], correct_answer: "Sensor Raindrops/Air Hujan" },
            { question: "Karakteristik utama dari sensor cahaya LDR (Light Dependent Resistor) adalah...", options: ["Nilai hambatan berubah sesuai intensitas cahaya", "Mengeluarkan suara ultrasonik", "Mengukur kelembapan tanah secara konduktif", "Menghitung jarak objek di depannya"], correct_answer: "Nilai hambatan berubah sesuai intensitas cahaya" },
            { question: "Sensor Ultrasonic HC-SR04 menghitung jarak suatu objek memanfaatkan pantulan sinyal berupa...", options: ["Gelombang Suara Ultrasonik", "Sinar Laser Inframerah", "Gelombang Radio Frekuensi", "Pulsa Listrik Statis"], correct_answer: "Gelombang Suara Ultrasonik" },
            { question: "Sensor suhu ruangan yang ekonomis dan sering digunakan untuk prototype IoT pemula adalah...", options: ["DHT11", "HC-SR04", "MQ-5", "PIR"], correct_answer: "DHT11" },
            { question: "Manakah sensor yang tepat untuk mendeteksi kebocoran gas LPG atau asap rokok di dalam ruangan?", options: ["Sensor Gas MQ-2/MQ-5", "Sensor Ultrasonic HC-SR04", "Sensor LDR", "Sensor DS18B20"], correct_answer: "Sensor Gas MQ-2/MQ-5" },
            { question: "Sensor suhu DS18B20 sangat cocok digunakan untuk mengukur suhu air karena tipe fisiknya yang...", options: ["Waterproof (Tahan Air)", "Berbentuk piringan kaca", "Sensitif terhadap getaran udara", "Memiliki pemancar Wi-Fi internal"], correct_answer: "Waterproof (Tahan Air)" },
            { question: "Apakah kepanjangan dari komponen LDR pada sensor cahaya?", options: ["Light Dependent Resistor", "Laser Digital Receiver", "Linear Data Regulator", "Light Distance Radiation"], correct_answer: "Light Dependent Resistor" },
            { question: "Sinyal fisik berupa parameter kelembapan tanah dibaca di IoT menggunakan sensor bernama...", options: ["Soil Moisture Sensor", "DHT22 Temperature", "PIR Motion Sensor", "Flame Detector Sensor"], correct_answer: "Soil Moisture Sensor" }
        ]
    },
    // --- UPDATE DATA HALAMAN 3 ---
    {
        page_number: 3,
        title: "Mikrokontroler ESP32",
        // Menggunakan gambar khusus sirkuit elektronik mikrokontroler yang valid
        image_url: "https://images.unsplash.com/photo-1563770660941-20978e870e26?q=80&w=600",
        reference_link: "https://www.espressif.com/en/products/socs/esp32",
        paragraphs: [
            { paragraph_id: 1, text: "ESP32 adalah mikrokontroler populer yang memiliki built-in Wi-Fi dan Bluetooth. Di sistem AIoT, ESP32 berfungsi sebagai 'otak' yang memproses data dari sensor dan mengirimkannya ke cloud." },
            { paragraph_id: 2, text: "Keunggulan ESP32 dibandingkan mikrokontroler lain: Hemat daya (low power), Harga terjangkau, Mendukung dual-core processor, dan memiliki banyak pin I/O untuk koneksi sensor dan aktuator." }
        ],
        quiz_questions: [
            { question: "Apa keunggulan konektivitas bawaan utama dari cip ESP32?", options: ["Built-in Wi-Fi dan Bluetooth", "Hanya koneksi kabel LAN", "Hanya koneksi Radio Satelit", "Tidak memiliki modul nirkabel"], correct_answer: "Built-in Wi-Fi dan Bluetooth" },
            { question: "Di dalam arsitektur AIoT, mikrokontroler ESP32 bertindak sebagai...", options: ["Otak/Pemroses data lokal utama", "Sensor pembaca suhu ruangan", "Penyimpanan database cloud utama", "Casing pelindung rangkaian hardware"], correct_answer: "Otak/Pemroses data lokal utama" },
            { question: "Arsitektur prosesor di dalam ESP32 modern umumnya sudah mendukung teknologi core berupa...", options: ["Dual-Core Processor", "Single-Core Low Speed", "Quad-Core Desktop", "Octa-Core Smartphone Processor"], correct_answer: "Dual-Core Processor" },
            { question: "Fungsi utama dari pin GPIO (General Purpose Input Output) pada board ESP32 adalah...", options: ["Menghubungkan sensor dan aktuator ke sirkuit prosesor", "Menyalakan lampu indikator daya onboard", "Mengatur kecepatan transmisi antena Bluetooth", "Menghapus memori flash internal firmware"], correct_answer: "Menghubungkan sensor dan aktuator ke sirkuit prosesor" },
            { question: "Berapakah tegangan kerja normal (operating voltage) yang disarankan untuk pin data input ESP32?", options: ["3.3 Volt", "5.0 Volt", "12 Volt", "220 Volt AC"], correct_answer: "3.3 Volt" },
            { question: "Perusahaan semikonduktor pembuat cip mikrokontroler ESP32 asli adalah...", options: ["Espressif Systems", "Arduino LLC", "Intel Corporation", "Texas Instruments"], correct_answer: "Espressif Systems" },
            { question: "Fitur 'Low Power Mode' pada ESP32 berfungsi strategis untuk...", options: ["Menghemat daya baterai saat perangkat standby", "Meningkatkan kecepatan clock processor", "Memperluas jangkauan antena Wi-Fi", "Menolak koneksi asing dari hacker"], correct_answer: "Menghemat daya baterai saat perangkat standby" },
            { question: "Jenis memori non-volatile pada ESP32 yang digunakan untuk menyimpan kode program firmware adalah...", options: ["Flash Memory", "SRAM Local Buffer", "Cache L1 Memory", "Virtual Register Link"], correct_answer: "Flash Memory" },
            { question: "Konektivitas Bluetooth bawaan ESP32 bertipe BLE. Apa kepanjangan dari BLE tersebut?", options: ["Bluetooth Low Energy", "Bluetooth Language Engine", "Basic Link Encryption", "Bilateral Element Link"], correct_answer: "Bluetooth Low Energy" },
            { question: "Manakah software IDE yang paling umum digunakan oleh developer untuk memprogram sikit ESP32?", options: ["Arduino IDE / VS Code PlatformIO", "Microsoft Word", "Adobe Dreamweaver", "Android Studio Core"], correct_answer: "Arduino IDE / VS Code PlatformIO" }
        ]
    },

    // --- UPDATE DATA HALAMAN 4 ---
    {
        page_number: 4,
        title: "Aktuator & Komponen",
        // Menggunakan gambar robotic arm / motor komponen mekanis yang valid
        image_url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=600",
        reference_link: "https://www.ieee.org/index.html",
        paragraphs: [
            { paragraph_id: 1, text: "Aktuator adalah komponen yang mengubah sinyal listrik menjadi gerakan fisik. Ini adalah 'tangan' dari sistem IoT yang menjalankan perintah berdasarkan data yang diproses." },
            { paragraph_id: 2, text: "Contoh aktuator dalam IoT: Motor DC (untuk putaran), Servo (untuk gerakan presisi), Relay (saklar otomatis), dan LED (indikator cahaya). Aktuator memungkinkan sistem IoT berinteraksi dengan dunia fisik." }
        ],
        quiz_questions: [
            { question: "Apa fungsi utama komponen aktuator dalam sistem IoT?", options: ["Mengubah energi listrik menjadi aksi fisik/gerakan", "Membaca kondisi suhu lingkungan", "Menyimpan data log kedalam flash memori", "Enkripsi enkapsulasi paket jaringan MQTT"], correct_answer: "Mengubah energi listrik menjadi aksi fisik/gerakan" },
            { question: "Aktuator mekanis yang sangat ideal digunakan untuk menggerakkan sudut lengan robot secara presisi (0-180 derajat) adalah...", options: ["Motor Servo", "Motor DC Tanpa Driver", "Lampu LED Strip", "Buzzer Piezoelektrik"], correct_answer: "Motor Servo" },
            { question: "Jika lo ingin mengontrol lampu rumah bertegangan tinggi 220V AC menggunakan ESP32 yang berdaya rendah, komponen penghubung apa yang lo butuhkan?", options: ["Relay (Saklar Otomatis Elektromagnetik)", "Sensor LDR Cahaya", "Motor DC Berkecepatan Tinggi", "Potensio Geser"], correct_answer: "Relay (Saklar Otomatis Elektromagnetik)" },
            { question: "Manakah di bawah ini yang tergolong sebagai aktuator penanda indikator cahaya?", options: ["Lampu LED (Light Emitting Diode)", "Buzzer Alarm", "Kipas Angin DC", "Solenoid Door Lock"], correct_answer: "Lampu LED (Light Emitting Diode)" },
            { question: "Komponen aktuator audio yang digunakan untuk membunyikan alarm peringatan jika sensor mendeteksi kebocoran gas bernama...", options: ["Buzzer", "Motor DC", "Relay 5V", "LED Indikator"], correct_answer: "Buzzer" },
            { question: "Jenis motor yang berputar terus-menerus tanpa batasan derajat sudut dan biasa dipakai untuk roda robot adalah...", options: ["Motor DC", "Motor Servo 180", "Relay Spool", "LED Indikator"], correct_answer: "Motor DC" },
            { question: "Bagian dari modul relay yang bertindak sebagai saklar mekanis elektromagnetik pemutus/penghubung arus bernama...", options: ["Koil Kumparan Logam & Kontak Saklar", "Sensor LDR", "Prosesor Core", "Kabel Jumper Data"], correct_answer: "Koil Kumparan Logam & Kontak Saklar" },
            { question: "Aktuator yang digunakan untuk mengunci pintu rumah secara otomatis berbasis solenoida listrik disebut...", options: ["Solenoid Door Lock", "Motor Servo MG996R", "Buzzer Alarm Active", "Relay 4 Channel"], correct_answer: "Solenoid Door Lock" },
            { question: "Untuk mengatur kecepatan putaran Motor DC secara halus melalui ESP32, kita memanfaatkan teknik modulasi pulsa listrik bernama...", options: ["PWM (Pulse Width Modulation)", "MQTT Protokol Link", "ADC Converter Core", "SPI Communication Bus"], correct_answer: "PWM (Pulse Width Modulation)" },
            { question: "Manakah urutan jalur data yang benar pada sistem IoT pakan ikan otomatis?", options: ["Waktu Terjadwal -> ESP32 -> Motor Servo Bergerak", "Motor Servo -> Sensor Suhu -> Cloud Database", "Kabel Relay -> Lampu Rumah -> Sensor PIR", "Buzzer Bunyi -> Sensor LDR -> Wi-Fi Router"], correct_answer: "Waktu Terjadwal -> ESP32 -> Motor Servo Bergerak" }
        ]
    },
    {
        page_number: 5,
        title: "Jaringan & Protokol MQTT",
        image_url: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=600",
        reference_link: "https://mqtt.org/",
        paragraphs: [
            { paragraph_id: 1, text: "MQTT adalah protokol komunikasi ringan yang dirancang khusus untuk IoT. Protokol ini sangat efisien karena menggunakan bandwidth kecil, cocok untuk perangkat dengan sumber daya terbatas seperti ESP32." },
            { paragraph_id: 2, text: "Arsitektur MQTT menggunakan model publish-subscribe dengan broker sebagai perantara. Perangkat IoT bisa menjadi publisher (mengirim data) atau subscriber (menerima data), memungkinkan komunikasi real-time yang efisien." }
        ],
        quiz_questions: [
            { question: "Mengapa protokol MQTT sangat direkomendasikan dan populer digunakan pada ekosistem IoT?", options: ["Sangat ringan, hemat daya, dan menggunakan bandwidth kecil", "Memiliki ukuran header paket data yang sangat besar", "Tidak membutuhkan jaringan internet ataupun router", "Hanya berjalan khusus pada komputer mainframe raksasa"], correct_answer: "Sangat ringan, hemat daya, dan menggunakan bandwidth kecil" },
            { question: "Model arsitektur komunikasi data yang diterapkan pada protokol MQTT dinamakan...", options: ["Model Publish-Subscribe", "Model Client-Server Request-Response", "Model Peer-to-Peer Direct Local Link", "Model Master-Slave Bus Network"], correct_answer: "Model Publish-Subscribe" },
            { question: "Komponen pusat atau perantara di dalam jaringan MQTT yang berfungsi mengatur sirkulasi distribusi paket data disebut...", options: ["MQTT Broker", "MQTT Publisher", "MQTT Subscriber", "MQTT Agent Node"], correct_answer: "MQTT Broker" },
            { question: "Jika sebuah alat ESP32 bertugas membacakan data sensor hujan lalu mengirimkannya ke internet, maka peran alat tersebut adalah sebagai...", options: ["Publisher", "Subscriber", "Broker Central", "Router Gateway"], correct_answer: "Publisher" },
            { question: "Alamat pengenal unik yang digunakan untuk mengelompokkan kategori data di dalam MQTT Broker (misal: 'kamar/suhu') diistilahkan sebagai...", options: ["Topic", "Payload", "QoS Level", "Client ID"], correct_answer: "Topic" },
            { question: "Apakah singkatan resmi dari protokol jaringan MQTT?", options: ["Message Queuing Telemetry Transport", "Media Quantum Technology Transmission", "Memory Query Telecommunication Tech", "Mobile Quick Tracking Target"], correct_answer: "Message Queuing Telemetry Transport" },
            { question: "Isi data/pesan aktual dari sensor yang dikirimkan di dalam sebuah paket data MQTT dinamakan...", options: ["Payload", "Topic Text", "Header Byte", "Keep Alive Link"], correct_answer: "Payload" },
            { question: "Fitur jaminan kualitas pengiriman data pada arsitektur MQTT disebut QoS. Apa kepanjangan dari QoS?", options: ["Quality of Service", "Quantum of System", "Query Object Session", "Quick Operational Setup"], correct_answer: "Quality of Service" },
            { question: "Berapakah nomor port default yang paling sering digunakan untuk komunikasi MQTT tanpa enkripsi SSL?", options: ["1883", "80", "443", "27017"], correct_answer: "1883" },
            { question: "Manakah contoh MQTT Broker publik gratis yang sering dipakai developer untuk uji coba proyek IoT?", options: ["broker.hivemq.com", "google.com", "mongodb.org", "facebook.com"], correct_answer: "broker.hivemq.com" }
        ]
    },
    {
        page_number: 6,
        title: "Cloud & Database NoSQL",
        image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600",
        reference_link: "https://www.mongodb.com/nosql-explained",
        paragraphs: [
            { paragraph_id: 1, text: "Cloud adalah tempat penyimpanan data di internet yang bisa diakses dari mana saja. Di sistem AIoT, data dari sensor dikirim ke cloud untuk disimpan dan dianalisis secara real-time." },
            { paragraph_id: 2, text: "MongoDB adalah database NoSQL yang sering digunakan dalam proyek IoT karena fleksibel, scalable, dan mudah diintegrasikan. Data sensor dapat disimpan dalam format JSON yang mudah dibaca dan diproses." }
        ],
        quiz_questions: [
            { question: "Apa fungsi strategis dari integrasi infrastruktur Cloud pada sistem AIoT skala besar?", options: ["Tempat penyimpanan, agregasi, dan analisis big data terpusat", "Menghubungkan kabel jumper secara nirkabel jarak dekat", "Sebagai baterai cadangan saat mikrokontroler mati listrik", "Mengubah data analog sensor menjadi gerakan servo fisik"], correct_answer: "Tempat penyimpanan, agregasi, dan analisis big data terpusat" },
            { question: "MongoDB dikategorikan sebagai database modern berjenis...", options: ["Database NoSQL (Non-Relational)", "Database Relational RDBMS SQL", "Database Flat File CSV Local Only", "Database Spreadsheet Berbasis Tabel Statis"], correct_answer: "Database NoSQL (Non-Relational)" },
            { question: "Format penulisan pertukaran data terstruktur yang digunakan MongoDB untuk menyimpan dokumen log IoT bernama...", options: ["JSON / BSON", "XML Format Plain", "HTML Scripting Text", "YAML Key Space Text"], correct_answer: "JSON / BSON" },
            { question: "Apa keunggulan utama arsitektur NoSQL MongoDB saat menangani tumpukan data log sensor IoT?", options: ["Sangat fleksibel (schemaless) dan mudah dikembangkan secara horizontal", "Wajib menggunakan sintaks tabel berelasi yang kaku", "Tidak membutuhkan memori RAM sama sekali saat query", "Kecepatan tulis data dibatasi agar aman dari serangan h untungnya"], correct_answer: "Sangat fleksibel (schemaless) dan mudah dikembangkan secara horizontal" },
            { question: "Koleksi data dalam MongoDB yang setara dengan konsep 'Tabel' pada database relasional SQL konvensional dinamakan...", options: ["Collection", "Document", "Field Row", "Database Cluster"], correct_answer: "Collection" },
            { question: "Satu baris record data terstruktur berformat JSON yang tersimpan di dalam MongoDB dinamakannya sebagai...", options: ["Document", "Collection", "Schema Base", "Query Row"], correct_answer: "Document" },
            { question: "Layanan cloud resmi dari MongoDB untuk membuat database cluster di internet secara otomatis bernama...", options: ["MongoDB Atlas", "MongoDB Compass", "Google Cloud Storage", "Firebase Realtime DB"], correct_answer: "MongoDB Atlas" },
            { question: "Aplikasi GUI desktop resmi yang digunakan untuk melihat, mengedit, dan mengelola database MongoDB lokal secara visual adalah...", options: ["MongoDB Compass", "Robo 3T Engine", "Visual Studio Code", "Postman API Client"], correct_answer: "MongoDB Compass" },
            { question: "Berapakah nomor port default yang dialokasikan sistem untuk koneksi database MongoDB server?", options: ["27017", "3306", "1883", "5000"], correct_answer: "27017" },
            { question: "Manakah sintaks driver Mongoose JavaScript yang dipakai backend untuk menyimpan instansiasi data aktivitas siswa baru?", options: ["newActivity.save()", "newActivity.insertRow()", "db.writeAllData()", "collection.pushText()"], correct_answer: "newActivity.save()" }
        ]
    },
    {
        page_number: 7,
        title: "Pengenalan Artificial Intelligence",
        // Menggunakan gambar visualisasi konsep artificial intelligence/neural network yang valid
        image_url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=600",
        reference_link: "https://www.ibm.com/topics/artificial-intelligence",
        paragraphs: [
            { paragraph_id: 1, text: "AI (Artificial Intelligence) adalah teknologi yang memungkinkan mesin 'belajar' dari data dan membuat keputusan. Di buku EduBook, AI dibahas sebagai komponen yang membuat sistem IoT menjadi 'cerdas'." },
            { paragraph_id: 2, text: "AI dalam IoT memungkinkan sistem untuk menganalisis data sensor, mendeteksi pola, dan mengambil tindakan otomatis tanpa campur tangan manusia. Contoh: sistem keamanan yang bisa mengenali wajah." }
        ],
        quiz_questions: [
            { question: "Definisi yang paling akurat mengenai Artificial Intelligence (AI) adalah...", options: ["Teknologi rekayasa sistem komputer untuk meniru kecerdasan manusia", "Program aplikasi kalkulator penambah angka otomatis", "Metode pembersihan memori penyimpanan internal device", "Kabel penghubung sirkuit terintegrasi kecepatan tinggi"], correct_answer: "Teknologi rekayasa sistem komputer untuk meniru kecerdasan manusia" },
            { question: "Peran utama AI di dalam ekosistem sistem AIoT (Artificial Intelligence of Things) adalah...", options: ["Membentuk kemampuan sistem agar dapat berpikir cerdas mengambil keputusan", "Mempercepat pengisian daya baterai alat mikrokontroler", "Memperindah desain casing dan warna lampu indikator", "Mengurangi jumlah sensor yang terpasang di sirkuit"], correct_answer: "Membentuk kemampuan sistem agar dapat berpikir cerdas mengambil keputusan" },
            { question: "Manakah contoh implementasi AI mutakhir dalam sistem otomasi keamanan rumah pintar?", options: ["Kamera CCTV otomatis mengenali wajah pemilik rumah", "Saklar lampu manual yang dipasang di dinding luar", "Alarm pintu berbunyi setiap kali ada angin kencang", "Kunci gembok besi konvensional dengan anak kunci tembaga"], correct_answer: "Kamera CCTV otomatis mengenali wajah pemilik rumah" },
            { question: "Sistem komputer yang mampu mengenali pola suara vokal lisan manusia seperti asisten pintar Google Assistant menerapkan teknologi AI di bidang...", options: ["Speech Recognition / NLP", "Computer Vision Graphics", "Database Management Sharding", "Network Topology Engineering"], correct_answer: "Speech Recognition / NLP" },
            { question: "Kelebihan utama sistem IoT yang telah diintegrasikan dengan AI dibandingkan sistem IoT biasa adalah...", options: ["Sistem sanggup memprediksi anomali kerusakan masa depan secara otomatis", "Biaya operasional bulanan jaringan internet menjadi gratis", "Sistem tidak membutuhkan listrik sama sekali", "Alat menjadi kebal dari kerusakan korsleting arus pendek"], correct_answer: "Sistem sanggup memprediksi anomali kerusakan masa depan secara otomatis" },
            { question: "Model AI canggih milik Google yang lo pasang di server backend EduBook lo bernama...", options: ["Google Gemini Engine (Generative AI)", "ChatGPT Core Framework", "IBM Watson Automation", "DeepSeek Analytics V3"], correct_answer: "Google Gemini Engine (Generative AI)" },
            { question: "Cabang ilmu AI yang memfokuskan komputer agar bisa memahami objek visual/gambar dinamakan...", options: ["Computer Vision", "Natural Language Processing", "Expert System Linear", "Algoritma Genetika Data"], correct_answer: "Computer Vision" },
            { question: "Teks perintah instruksi awal yang lo kirim ke Google Gemini AI untuk memicu respon cerdas tutor dinamakan...", options: ["Prompt System", "Query Query Database", "Payload Jaringan", "JSON Payload Schema"], correct_answer: "Prompt System" },
            { question: "Gaya interaksi respon chatbot AI EduBot lo di backend disetting menggunakan model cerdas flash terbaru tipe...", options: ["gemini-2.5-flash", "text-davinci-003", "gpt-3.5-turbo", "llama-3-local"], correct_answer: "gemini-2.5-flash" },
            { question: "Manakah skenario AIoT Smart Agriculture yang tepat di perkebunan modern?", options: ["AI menganalisis sensor kelembapan tanah lalu menyalakan kipas aktuator otomatis", "Petani menyiram tanaman manual memakai ember air", "Mencatat tabel pertumbuhan daun di kertas karton", "Mengukur curah hujan bulanan dengan gelas ukur kaca"], correct_answer: "AI menganalisis sensor kelembapan tanah lalu menyalakan kipas aktuator otomatis" }
        ]
    },
    {
        page_number: 8,
        title: "Machine Learning Core",
        image_url: "https://images.unsplash.com/photo-1527474305487-b87b222841cc?q=80&w=600",
        reference_link: "https://www.sciencedirect.com/topics/computer-science/machine-learning",
        paragraphs: [
            { paragraph_id: 1, text: "Machine Learning (ML) adalah cabang AI di mana mesin belajar dari data tanpa diprogram secara eksplisit. ML menjadi inti dari sistem AIoT yang cerdas karena memungkinkan sistem untuk terus belajar dan beradaptasi." },
            { paragraph_id: 2, text: "Jenis-jenis Machine Learning: Supervised Learning (belajar dengan label), Unsupervised Learning (belajar tanpa label), dan Reinforcement Learning (belajar dari trial-error). Masing-masing memiliki penggunaan yang berbeda dalam IoT." }
        ],
        quiz_questions: [
            { question: "Inti dasar dari cara kerja cabang teknologi Machine Learning (ML) adalah...", options: ["Mesin belajar secara mandiri mengekstrak pola dari data masa lalu", "Program komputer wajib diketik manual kodenya seumur hidup", "Sistem menghapus data lama setiap kali mendeteksi eror firmware", "Menyalin kode pemrograman dari sistem komputer lain tanpa modifikasi"], correct_answer: "Mesin belajar secara mandiri mengekstrak pola dari data masa lalu" },
            { question: "Metode melatih model ML dengan menyediakan dataset yang sudah memiliki label jawaban target yang jelas dinamakan...", options: ["Supervised Learning", "Unsupervised Learning", "Reinforcement Learning", "Deep Matrix Learning"], correct_answer: "Supervised Learning" },
            { question: "Jika sebuah algoritma ML ditugaskan mengelompokkan data pelanggan tanpa target label data awal, ia menggunakan metode...", options: ["Unsupervised Learning (Clustering)", "Supervised Learning Regression", "Reinforcement Reward Method", "Hardcoded Logic Method"], correct_answer: "Unsupervised Learning (Clustering)" },
            { question: "Metode pembelajaran ML yang didasarkan pada pemberian penghargaan (reward) dan hukuman (punishment) seperti melatih agen robot berjalan diistilahkan...", options: ["Reinforcement Learning", "Supervised Classification", "Semi-Supervised Labeling", "Stochastic Memory Learning"], correct_answer: "Reinforcement Learning" },
            { question: "Manakah contoh implementasi algoritma Machine Learning yang diterapkan pada sistem industri cerdas?", options: ["Sistem prediksi masa aus/kerusakan mesin berbasis getaran sensor", "Menyalakan mesin pabrik menggunakan tombol manual ON/OFF", "Mencatat daftar inventaris barang di buku tulis folio", "Menempelkan stiker QC lolos inspeksi pada kemasan produk"], correct_answer: "Sistem prediksi masa aus/kerusakan mesin berbasis getaran sensor" },
            { question: "Model ML regresi pada supervised learning digunakan untuk memprediksi nilai target berupa data...", options: ["Data Kontinu/Angka Numerik", "Kategori Label String", "Cluster Tanpa Kelompok", "File Gambar Visual"], correct_answer: "Data Kontinu/Angka Numerik" },
            { question: "Algoritma clustering yang populer digunakan untuk membagi data sensor IoT ke kelompok tertentu adalah...", options: ["K-Means Clustering", "Linear Regression", "Decision Tree Model", "Support Vector Machine"], correct_answer: "K-Means Clustering" },
            { question: "Dataset yang lo gunakan untuk melatih otak kecerdasan buatan Machine Learning dinamakan...", options: ["Training Data", "Testing Data", "System Cache", "Log Log Database"], correct_answer: "Training Data" },
            { question: "Dataset terpisah yang digunakan khusus untuk mengevaluasi akurasi performa model ML setelah dilatih bernama...", options: ["Testing Data", "Training Dataset", "System Environment Data", "Variable Temp Configuration"], correct_answer: "Testing Data" },
            { question: "Teknologi jaringan saraf tiruan berlapis banyak di dalam Machine Learning diistilahkan sebagai...", options: ["Deep Learning (Deep Neural Network)", "Hardcoded Switch Framework", "Linear Algorithm Cluster", "Sequential Matrix Regulated"], correct_answer: "Deep Learning (Deep Neural Network)" }
        ]
    },
    {
        page_number: 9,
        title: "AI Kehidupan Sehari-hari",
        image_url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600",
        reference_link: "https://www.samsung.com/en/innovation/",
        paragraphs: [
            { paragraph_id: 1, text: "AI sudah menjadi bagian dari kehidupan sehari-hari kita. Dari asisten virtual (Siri, Google Assistant), rekomendasi produk di e-commerce, hingga navigasi GPS yang cerdas." },
            { paragraph_id: 2, text: "Dalam konteks AIoT, AI membantu mengoptimalkan penggunaan energi, memprediksi kegagalan peralatan, dan meningkatkan keamanan rumah. AI membuat perangkat IoT lebih pintar dan lebih berguna bagi pengguna." }
        ],
        quiz_questions: [
            { question: "Layanan rekomendasi produk otomatis di e-commerce tergolong pemanfaatan teknologi cerdas berupa...", options: ["Artificial Intelligence (AI)", "Sistem Operasi Firmware", "Kabel Jaringan Internet", "Desain Grafis Komputer UI"], correct_answer: "Artificial Intelligence (AI)" },
            { question: "Istilah teknologi gabungan antara Kecerdasan Buatan dan Internet of Things disingkat sebagai...", options: ["AIoT", "IoT-Core", "Smart-Net", "Cloud-AI"], correct_answer: "AIoT" },
            { question: "Bagaimana cara sistem AIoT mengoptimalkan efisiensi konsumsi energi pada gedung-gedung perkantoran modern?", options: ["Mematikan lampu & AC otomatis saat sensor mendeteksi ruangan kosong", "Memasang saklar dinding manual berdaya tinggi", "Membatasi arus masuk gardu listrik perkantoran setiap pagi jam 9", "Mengganti seluruh kabel jaringan gedung dengan serat optik baja"], correct_answer: "Mematikan lampu & AC otomatis saat sensor mendeteksi ruangan kosong" },
            { question: "Manakah asisten virtual pintar berbasis kecerdasan buatan vokal yang sering kita jumpai di smartphone?", options: ["Google Assistant / Siri", "Adobe Photoshop CC", "Winamp Player Express", "File Explorer Core"], correct_answer: "Google Assistant / Siri" },
            { question: "Fitur rute tercepat otomatis dan estimasi kemacetan real-time pada aplikasi GPS modern dikalkulasi menggunakan...", options: ["Algoritma Kecerdasan Buatan / AI Navigasi", "Gambar peta mati berbentuk cetakan kertas", "Kompas magnetik manual logam kuningan", "Panggilan telepon ke operator kantor polisi terdekat"], correct_answer: "Algoritma Kecerdasan Buatan / AI Navigasi" },
            { question: "Ketika platform e-commerce merekomendasikan sepatu yang lo sukai, algoritma AI yang bekerja di belakangnya bernama...", options: ["Recommendation System / Collaborative Filtering", "Linear Hardcoded Search Engine", "Enkripsi Paket Header Jaringan", "Database Recovery Sharding Protocol"], correct_answer: "Recommendation System / Collaborative Filtering" },
            { question: "Bagaimana teknologi AIoT mendeteksi dini jika sebuah kulkas pintar kehabisan stok telur?", options: ["Sensor berat/kamera membaca isi rak lalu mengirim alert nirkabel", "User wajib menelepon bot pusat layanan setiap malam", "Kulkas otomatis memesan telur lewat SMS pulsa biasa", "Kulkas mengeluarkan bunyi alarm buzzer keras tanpa henti"], correct_answer: "Sensor berat/kamera membaca isi rak lalu mengirim alert nirkabel" },
            { question: "Algoritma AI pendeteksi spam email otomatis di Gmail mengelompokkan pesan ke folder spam memakai teknik...", options: ["Klasifikasi (Classification)", "Regresi Numerik", "Clustering Unsupervised", "Random Number Generation"], correct_answer: "Klasifikasi (Classification)" },
            { question: "Sistem penyaringan konten video FYP otomatis di TikTok dikontrol penuh oleh...", options: ["Algoritma AI / Rekomendasi ML", "Tombol manual admin kantor pusat", "Waktu unggah jam upload video", "Ukuran resolusi kapasitas video file"], correct_answer: "Algoritma AI / Rekomendasi ML" },
            { question: "Tujuan utama penggabungan AI ke jaringan ekosistem IoT bagi user di rumah pintar adalah...", options: ["Meningkatkan otomatisasi, kenyamanan, keamanan, dan efisiensi energi", "Meningkatkan tagihan listrik bulanan berkali-kali lipat", "Membuat konfigurasi alat menjadi semakin rumit dan membingungkan", "Menghapus seluruh fitur Wi-Fi agar aman dari pembajakan data"], correct_answer: "Meningkatkan otomatisasi, kenyamanan, keamanan, dan efisiensi energi" }
        ]
    },
    {
        page_number: 10,
        title: "Masa Depan AIoT Mandiri",
        image_url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=600",
        reference_link: "https://www.forbes.com/sites/forbestechcouncil/",
        paragraphs: [
            { paragraph_id: 1, text: "Masa depan AIoT sangat cerah dengan prediksi miliaran perangkat terhubung. Teknologi 5G akan mempercepat komunikasi data, sementara AI yang semakin canggih akan membuat sistem semakin otonom." },
            { paragraph_id: 2, text: "Tantangan ke depan termasuk keamanan data, privasi pengguna, dan konsumsi energi. Namun dengan inovasi berkelanjutan, AIoT akan mengubah cara kita hidup dan bekerja secara fundamental." }
        ],
        quiz_questions: [
            { question: "Infrastruktur jaringan telekomunikasi nirkabel masa depan yang sangat dibutuhkan untuk menyokong kecepatan tukar data miliaran node sensor AIoT adalah...", options: ["Jaringan Seluler 5G Berkecepatan Tinggi", "Jaringan Kabel Telepon Tembaga Analog", "Koneksi Infrared Jarak Dekat Local Only", "Kabel Koaksial Antena Parabola Televisi"], correct_answer: "Jaringan Seluler 5G Berkecepatan Tinggi" },
            { question: "Tantangan keamanan siber terbesar yang wajib diwaspadai dari maraknya implementasi perangkat AIoT masa depan adalah...", options: ["Isu Privasi, Kebocoran Data, dan Hacking Masal", "Berat fisik modul cip komponen elektronika", "Harga kabel jumper yang melonjak mahal di pasaran", "Casing alat yang mudah pudar warnanya jika kena panas"], correct_answer: "Isu Privasi, Kebocoran Data, dan Hacking Masal" },
            { question: "Maksud dari sistem otonom (autonomous system) pada masa depan perkembangan AIoT berarti...", options: ["Sistem sanggup beroperasi mandiri dan memperbaiki masalahnya sendiri", "Sistem harus terus-menerus dikontrol manual oleh operator operator", "Alat tidak boleh tersambung ke jaringan cloud internet sama sekali", "Seluruh baris baris kode kodenya dihapus diganti sakelar otomatis"], correct_answer: "Sistem sanggup beroperasi mandiri dan memperbaiki masalahnya sendiri" },
            { question: "Gelar kasta kognitif tertinggi yang lo raih di papan skor progress dashboard pameran Samsung Innovation Campus Batch 8 bernama...", options: ["Master AIoT Elite Vanguard 👑", "Pemula AIoT Base", "Builder Engineered", "Innovator Architect"], correct_answer: "Master AIoT Elite Vanguard 👑" },
            { question: "Untuk mengatasi isu konsumsi energi pada miliaran node sensor masa depan, tren inovasi hardware IoT diarahkan menuju...", options: ["Komponen Ultra-Low Power & Energy Harvesting", "Memasang adaptor adaptor adaptor transformator raksasa di tiap alat", "Menggunakan baterai aki mobil berkapasitas besar di tiap rangkaian", "Menghubungkan sensor ke sumber listrik pembangkit listrik tenaga uap"], correct_answer: "Komponen Ultra-Low Power & Energy Harvesting" },
            { question: "Kemampuan sistem komputasi AI yang berjalan langsung di level mikrokontroler lokal tanpa bergantung internet cloud dinamakan...", options: ["Edge AI / TinyML", "Generative Cloud RAG", "Mainframe Core Processing", "Local Data Extraction Bus"], correct_answer: "Edge AI / TinyML" },
            { question: "Teknologi nirkabel masa depan yang menggantikan Wi-Fi konvensional menggunakan gelombang cahaya pemancar lampu LED bernama...", options: ["Li-Fi (Light Fidelity)", "Bluetooth 6.0 Matrix", "Radio Satelit Link", "NFC Short Band Receiver"], correct_answer: "Li-Fi (Light Fidelity)" },
            { question: "Penerapan AIoT pada konsep tata ruang transportasi kota masa depan terintegrasi dinamakan...", options: ["Smart City Traffic Automation", "Manual Road Sign Setup", "Analog Bus Scheduling", "Traditional Shunting Train System"], correct_answer: "Smart City Traffic Automation" },
            { question: "Apakah kepanjangan dari tren teknologi mutakhir TinyML di masa depan IoT?", options: ["Tiny Machine Learning", "Total Module Language", "Time Management Loop", "Techno Matrix Linking"], correct_answer: "Tiny Machine Learning" },
            { question: "Inovasi pengisian baterai nirkabel jarak jauh memanfaatkan radiasi gelombang frekuensi radio diistilahkan sebagai...", options: ["Wireless Over-The-Air Power Transfer", "Solar Panel Cell Extraction", "Kabel Jumper Elektrik AC", "Relay Spool Alternator"], correct_answer: "Wireless Over-The-Air Power Transfer" }
        ]
    }
];

async function seedDatabase() {
    try {
        await mongoose.connect('mongodb://localhost:27017/edubook');
        console.log('✅ Terhubung ke MongoDB');
        
        await Book.deleteMany({});
        console.log('🗑️ Data buku lama dihapus');
        
        await Book.insertMany(bookData);
        console.log(`✅ ${bookData.length} halaman buku berhasil ditambahkan dengan Bank Soal Lengkap!`);
        
        const count = await Book.countDocuments();
        console.log(`📚 Total halaman di database saat ini: ${count}`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error database seeder:', error);
        process.exit(1);
    }
}

seedDatabase();