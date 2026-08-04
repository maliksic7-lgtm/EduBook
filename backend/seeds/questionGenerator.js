function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
}

function pickN(arr, n) {
    const s = shuffle(arr);
    return s.slice(0, Math.min(n, s.length));
}

const PAGE_DATA = {
    1: {
        title: "Pengenalan AIoT & IoT",
        concepts: [
            { term: "IoT", def: "Internet of Things, konsep perangkat fisik terhubung internet", cat: "konsep" },
            { term: "AIoT", def: "Artificial Intelligence of Things, gabungan AI dengan IoT", cat: "konsep" },
            { term: "sensor", def: "komponen pengumpul data dari lingkungan", cat: "komponen" },
            { term: "aktuator", def: "komponen pelaksana aksi fisik", cat: "komponen" },
            { term: "gateway", def: "perangkat penghubung antara IoT dan internet", cat: "komponen" },
            { term: "MQTT", def: "protokol messaging ringan untuk IoT", cat: "protokol" },
            { term: "cloud computing", def: "komputasi awan untuk penyimpanan dan pemrosesan", cat: "infrastruktur" },
            { term: "edge computing", def: "pemrosesan data di dekat sumber data", cat: "infrastruktur" },
            { term: "firmware", def: "perangkat lunak bawaan perangkat keras", cat: "perangkat" },
            { term: "middleware", def: "lapisan perantara antara hardware dan aplikasi", cat: "arsitektur" },
            { term: "interoperabilitas", def: "kemampuan perangkat berbeda saling berkomunikasi", cat: "tantangan" },
            { term: "enkripsi", def: "pengamanan data dengan kode rahasia", cat: "keamanan" },
            { term: "big data", def: "volume data besar dari jutaan sensor", cat: "konsep" },
            { term: "LPWAN", def: "jaringan area luas dengan daya rendah", cat: "jaringan" },
            { term: "digital twin", def: "representasi virtual dari sistem fisik nyata", cat: "konsep" },
            { term: "RFID", def: "identifikasi dan pelacakan objek secara nirkabel", cat: "teknologi" },
            { term: "mesh network", def: "jaringan di mana setiap perangkat menjadi node relay", cat: "jaringan" },
            { term: "smart home", def: "rumah pintar dengan perangkat terhubung IoT", cat: "aplikasi" },
            { term: "protokol", def: "aturan komunikasi antar perangkat", cat: "konsep" },
            { term: "transformasi digital", def: "perubahan proses analog ke digital", cat: "konsep" },
            { term: "konektivitas", def: "kemampuan perangkat terhubung ke jaringan", cat: "komponen" },
            { term: "pemrosesan data", def: "analisis data untuk mengambil kesimpulan", cat: "komponen" },
            { term: "AI", def: "Artificial Intelligence, kecerdasan buatan", cat: "konsep" },
            { term: "CoAP", def: "Constrained Application Protocol untuk IoT", cat: "protokol" },
            { term: "OTA update", def: "pembaruan firmware tanpa kabel fisik", cat: "fitur" },
            { term: "QoS", def: "kualitas dan prioritas pengiriman data", cat: "jaringan" },
            { term: "smart grid", def: "jaringan listrik pintar berbasis IoT", cat: "aplikasi" },
            { term: "wearable", def: "perangkat pintar yang dipakai di tubuh", cat: "aplikasi" },
            { term: "autentikasi", def: "verifikasi identitas pengguna atau perangkat", cat: "keamanan" },
            { term: "data stream", def: "aliran data real-time dari sensor", cat: "konsep" }
        ]
    },
    2: {
        title: "Sensor Indra IoT",
        concepts: [
            { term: "DHT11", def: "sensor suhu dan kelembapan murah", cat: "sensor" },
            { term: "HC-SR04", def: "sensor ultrasonik pengukur jarak", cat: "sensor" },
            { term: "PIR", def: "sensor infra merah pasif pendeteksi gerakan", cat: "sensor" },
            { term: "LDR", def: "Light Dependent Resistor, sensor cahaya", cat: "sensor" },
            { term: "DS18B20", def: "sensor suhu digital akurat", cat: "sensor" },
            { term: "sensor analog", def: "sensor dengan output sinyal kontinu", cat: "jenis" },
            { term: "sensor digital", def: "sensor dengan output diskrit", cat: "jenis" },
            { term: "I2C", def: "protokol komunikasi dua kabel", cat: "antarmuka" },
            { term: "SPI", def: "protokol komunikasi serial kecepatan tinggi", cat: "antarmuka" },
            { term: "GPIO", def: "General Purpose Input Output pin", cat: "mikrokontroler" },
            { term: "ADC", def: "Analog to Digital Converter", cat: "mikrokontroler" },
            { term: "resolusi sensor", def: "tingkat ketelitian pengukuran sensor", cat: "spesifikasi" },
            { term: "konsumsi daya", def: "energi yang digunakan sensor saat beroperasi", cat: "spesifikasi" },
            { term: "suhu", def: "besaran fisika yang diukur oleh termometer", cat: "besaran" },
            { term: "kelembapan", def: "kandungan uap air di udara", cat: "besaran" },
            { term: "jarak", def: "besaran yang diukur dengan gelombang ultrasonik", cat: "besaran" },
            { term: "cahaya", def: "besaran yang diukur oleh LDR", cat: "besaran" },
            { term: "gerakan", def: "perubahan posisi yang dideteksi PIR", cat: "besaran" },
            { term: "MQ-2", def: "sensor pendeteksi asap dan gas", cat: "sensor" },
            { term: "raindrops", def: "sensor pendeteksi air hujan", cat: "sensor" },
            { term: "BMP280", def: "sensor tekanan udara dan altimeter", cat: "sensor" },
            { term: "ping", def: "sinyal ultrasonik untuk mengukur jarak", cat: "konsep" },
            { term: "noise", def: "gangguan pada sinyal sensor", cat: "tantangan" },
            { term: "kalibrasi", def: "penyesuaian sensor agar akurat", cat: "prosedur" },
            { term: "sampling rate", def: "frekuensi pengambilan data sensor", cat: "spesifikasi" },
            { term: "pull-up resistor", def: "resistor untuk menjaga tegangan pin", cat: "elektronik" },
            { term: "akurasi", def: "kedekatan hasil ukur dengan nilai sebenarnya", cat: "spesifikasi" },
            { term: "rentang ukur", def: "batas minimum dan maksimum pengukuran", cat: "spesifikasi" },
            { term: "sinyal listrik", def: "output sensor yang diproses mikrokontroler", cat: "konsep" },
            { term: "tegangan operasi", def: "voltage yang diperlukan sensor", cat: "spesifikasi" }
        ]
    },
    3: {
        title: "Mikrokontroler ESP32",
        concepts: [
            { term: "ESP32", def: "mikrokontroler dengan WiFi dan Bluetooth", cat: "mikrokontroler" },
            { term: "ESP32-S3", def: "versi ESP32 dengan AI accelerator", cat: "mikrokontroler" },
            { term: "Xtal.560", def: "kristal osilator ESP32 40MHz", cat: "hardware" },
            { term: "GPIO", def: "pin input output serbaguna ESP32", cat: "hardware" },
            { term: "ADC", def: "konverter analog ke digital ESP32", cat: "fitur" },
            { term: "DAC", def: "konverter digital ke analog ESP32", cat: "fitur" },
            { term: "PWM", def: "modulasi lebar pulsa untuk mengendalikan motor", cat: "fitur" },
            { term: "I2C", def: "protokol komunikasi dua kabel ESP32", cat: "antarmuka" },
            { term: "SPI", def: "antarmuka serial kecepatan tinggi", cat: "antarmuka" },
            { term: "UART", def: "antarmuka serial asinkron", cat: "antarmuka" },
            { term: "WiFi", def: "konektivitas nirkabel ESP32", cat: "konektivitas" },
            { term: "BLE", def: "Bluetooth Low Energy ESP32", cat: "konektivitas" },
            { term: "freeRTOS", def: "sistem operasi real-time ESP32", cat: "software" },
            { term: "Arduino IDE", def: "lingkungan pengembangan ESP32", cat: "software" },
            { term: "ESP-IDF", def: "framework pengembangan resmi ESP32", cat: "software" },
            { term: "MicroPython", def: "bahasa Python untuk ESP32", cat: "software" },
            { term: "flash memory", def: "penyimpanan program ESP32", cat: "hardware" },
            { term: "SRAM", def: "memori sementara ESP32", cat: "hardware" },
            { term: "deep sleep", def: "mode hemat daya ESP32", cat: "fitur" },
            { term: "hall sensor", def: "sensor medan magnet internal ESP32", cat: "fitur" },
            { term: "touch sensor", def: "sensor sentuh kapasitif ESP32", cat: "fitur" },
            { term: "dual core", def: "dua inti prosesor ESP32", cat: "spesifikasi" },
            { term: "clock speed", def: "kecepatan prosesor ESP32 hingga 240MHz", cat: "spesifikasi" },
            { term: "voltage regulator", def: "pengatur tegangan ESP32", cat: "hardware" },
            { term: "USB-UART bridge", def: "konverter USB ke serial ESP32", cat: "hardware" },
            { term: "boot button", def: "tombol untuk mode flashing ESP32", cat: "hardware" },
            { term: "EN pin", def: "pin reset ESP32", cat: "hardware" },
            { term: "antenna", def: "antena WiFi/Bluetooth ESP32", cat: "hardware" },
            { term: "PCB trace", def: "jejak antena di PCB ESP32", cat: "hardware" },
            { term: "38 pin", def: "jumlah pin pada ESP32 devkit", cat: "spesifikasi" }
        ]
    },
    4: {
        title: "Aktuator & Komponen",
        concepts: [
            { term: "motor DC", def: "motor listrik arus searah", cat: "aktuator" },
            { term: "motor stepper", def: "motor yang bergerak per langkah", cat: "aktuator" },
            { term: "servo motor", def: "motor dengan kontrol posisi presisi", cat: "aktuator" },
            { term: "relay", def: "saklar elektromekanik", cat: "aktuator" },
            { term: "solenoid", def: "aktuator dengan gerakan dorong/tarik", cat: "aktuator" },
            { term: "buzzer", def: "penghasil suara piezoelektrik", cat: "aktuator" },
            { term: "LED", def: "Light Emitting Diode indikator", cat: "aktuator" },
            { term: "LCD", def: "Liquid Crystal Display penampil teks", cat: "display" },
            { term: "OLED", def: "Organic LED display resolusi tinggi", cat: "display" },
            { term: "seven segment", def: "display angka 7 segmen", cat: "display" },
            { term: "transistor", def: "saklar elektronik penguat sinyal", cat: "komponen" },
            { term: "MOSFET", def: "transistor efek medan daya tinggi", cat: "komponen" },
            { term: "diode", def: "komponen satu arah arus listrik", cat: "komponen" },
            { term: "kapasitor", def: "penyimpan muatan listrik sementara", cat: "komponen" },
            { term: "resistor", def: "penghambat arus listrik", cat: "komponen" },
            { term: "potensiometer", def: "resistor variable", cat: "komponen" },
            { term: "driver motor", def: "sirkuit pengendali motor (L298N)", cat: "driver" },
            { term: "H-bridge", def: "rangkaian pengubah arah putaran motor", cat: "driver" },
            { term: "PWM", def: "modulasi lebar pulsa untuk kontrol kecepatan", cat: "kontrol" },
            { term: "closed-loop", def: "sistem kontrol dengan feedback", cat: "kontrol" },
            { term: "open-loop", def: "sistem kontrol tanpa feedback", cat: "kontrol" },
            { term: "PID controller", def: "kontrol proporsional integral derivatif", cat: "kontrol" },
            { term: "encoder", def: "sensor posisi dan kecepatan putar", cat: "sensor" },
            { term: "aktuator hidrolik", def: "aktuator menggunakan tekanan cairan", cat: "aktuator" },
            { term: "aktuator pneumatik", def: "aktuator menggunakan tekanan udara", cat: "aktuator" },
            { term: "linear actuator", def: "aktuator gerakan lurus", cat: "aktuator" },
            { term: "LRA motor", def: "Linear Resonant Actuator untuk haptic", cat: "aktuator" },
            { term: "ERM motor", def: "Eccentric Rotating Mass untuk getaran", cat: "aktuator" },
            { term: "osilasi", def: "gerakan bolak-balik aktuator", cat: "konsep" },
            { term: "torsi", def: "gaya putar motor", cat: "spesifikasi" }
        ]
    },
    5: {
        title: "Jaringan & Protokol MQTT",
        concepts: [
            { term: "MQTT", def: "protokol messaging ringan publish-subscribe", cat: "protokol" },
            { term: "broker", def: "server pusat MQTT yang mengelola pesan", cat: "infrastruktur" },
            { term: "publisher", def: "perangkat yang mengirim pesan MQTT", cat: "konsep" },
            { term: "subscriber", def: "perangkat yang menerima pesan MQTT", cat: "konsep" },
            { term: "topic", def: "label hierarki untuk routing pesan MQTT", cat: "konsep" },
            { term: "QoS 0", def: "pengiriman pesan sekali tanpa konfirmasi", cat: "QoS" },
            { term: "QoS 1", def: "pengiriman minimal satu kali", cat: "QoS" },
            { term: "QoS 2", def: "pengiriman tepat sekali dengan handshake", cat: "QoS" },
            { term: "WiFi", def: "jaringan nirkabel standar 802.11", cat: "jaringan" },
            { term: "Ethernet", def: "jaringan kabel standar LAN", cat: "jaringan" },
            { term: "4G LTE", def: "jaringan seluler generasi keempat", cat: "jaringan" },
            { term: "5G NR", def: "jaringan seluler generasi kelima", cat: "jaringan" },
            { term: "LoRaWAN", def: "jaringan jarak jauh daya rendah", cat: "jaringan" },
            { term: "Zigbee", def: "protokol mesh untuk IoT jarak dekat", cat: "protokol" },
            { term: "Bluetooth", def: "koneksi nirkabel jarak pendek", cat: "protokol" },
            { term: "WebSocket", def: "koneksi dua arah real-time via HTTP", cat: "protokol" },
            { term: "HTTP", def: "Hypertext Transfer Protocol standar web", cat: "protokol" },
            { term: "CoAP", def: "Constrained Application Protocol untuk IoT", cat: "protokol" },
            { term: "TLS", def: "Transport Layer Security untuk enkripsi", cat: "keamanan" },
            { term: "SSL", def: "Secure Sockets Layer untuk keamanan", cat: "keamanan" },
            { term: "TCP/IP", def: "protokol inti komunikasi internet", cat: "protokol" },
            { term: "UDP", def: "User Datagram Protocol tanpa koneksi", cat: "protokol" },
            { term: "latensi", def: "waktu tunda pengiriman data", cat: "metrik" },
            { term: "bandwidth", def: "kapasitas transfer data maksimal", cat: "metrik" },
            { term: "throughput", def: "jumlah data berhasil dikirim per waktu", cat: "metrik" },
            { term: "IP address", def: "alamat unik perangkat di jaringan", cat: "jaringan" },
            { term: "DNS", def: "Domain Name System penerjemah domain ke IP", cat: "infrastruktur" },
            { term: "firewall", def: "sistem keamanan jaringan", cat: "keamanan" },
            { term: "NAT", def: "Network Address Translation", cat: "jaringan" },
            { term: "subnet", def: "sub jaringan dari jaringan utama", cat: "jaringan" }
        ]
    },
    6: {
        title: "Cloud & Database NoSQL",
        concepts: [
            { term: "MongoDB", def: "database NoSQL berbasis dokumen", cat: "database" },
            { term: "NoSQL", def: "database non-relasional fleksibel", cat: "database" },
            { term: "dokumen", def: "unit data dalam MongoDB (JSON-like)", cat: "database" },
            { term: "koleksi", def: "kumpulan dokumen dalam MongoDB", cat: "database" },
            { term: "schema-less", def: "struktur data fleksibel tanpa skema kaku", cat: "database" },
            { term: "AWS", def: "Amazon Web Services penyedia cloud", cat: "cloud" },
            { term: "Azure", def: "Microsoft Azure cloud platform", cat: "cloud" },
            { term: "Google Cloud", def: "Google Cloud Platform", cat: "cloud" },
            { term: "IaaS", def: "Infrastructure as a Service", cat: "cloud" },
            { term: "PaaS", def: "Platform as a Service", cat: "cloud" },
            { term: "SaaS", def: "Software as a Service", cat: "cloud" },
            { term: "serverless", def: "komputasi tanpa manajemen server", cat: "cloud" },
            { term: "Docker", def: "platform kontainer aplikasi", cat: "devops" },
            { term: "Kubernetes", def: "orkestrasi kontainer", cat: "devops" },
            { term: "API REST", def: "antarmuka web berbasis HTTP", cat: "arsitektur" },
            { term: "JSON", def: "JavaScript Object Notation format data", cat: "format" },
            { term: "CRUD", def: "Create Read Update Delete operasi dasar", cat: "konsep" },
            { term: "replica set", def: "replikasi data untuk ketersediaan tinggi", cat: "database" },
            { term: "sharding", def: "pembagian data ke beberapa server", cat: "database" },
            { term: "index", def: "struktur pencarian cepat di database", cat: "database" },
            { term: "query", def: "permintaan data ke database", cat: "konsep" },
            { term: "agregasi", def: "pipeline pemrosesan data MongoDB", cat: "database" },
            { term: "cloud storage", def: "penyimpanan data di cloud", cat: "cloud" },
            { term: "virtual machine", def: "komputer virtual di cloud", cat: "cloud" },
            { term: "load balancer", def: "penyeimbang beban server", cat: "infrastruktur" },
            { term: "CDN", def: "Content Delivery Network global", cat: "infrastruktur" },
            { term: "microservices", def: "arsitektur layanan kecil independen", cat: "arsitektur" },
            { term: "monolith", def: "arsitektur aplikasi tunggal", cat: "arsitektur" },
            { term: "scalability", def: "kemampuan sistem bertambah beban", cat: "konsep" },
            { term: "high availability", def: "ketersediaan sistem tinggi", cat: "konsep" }
        ]
    },
    7: {
        title: "Pengenalan Artificial Intelligence",
        concepts: [
            { term: "AI", def: "Artificial Intelligence kecerdasan buatan", cat: "konsep" },
            { term: "machine learning", def: "cabang AI yang belajar dari data", cat: "cabang" },
            { term: "deep learning", def: "ML dengan jaringan saraf berlapis", cat: "cabang" },
            { term: "neural network", def: "jaringan saraf tiruan terinspirasi otak", cat: "arsitektur" },
            { term: "supervised learning", def: "belajar dengan data berlabel", cat: "jenis" },
            { term: "unsupervised learning", def: "belajar tanpa data label", cat: "jenis" },
            { term: "reinforcement learning", def: "belajar melalui trial and error", cat: "jenis" },
            { term: "natural language processing", def: "pemrosesan bahasa alami", cat: "cabang" },
            { term: "computer vision", def: "penglihatan komputer untuk memahami gambar", cat: "cabang" },
            { term: "speech recognition", def: "pengenalan suara ke teks", cat: "cabang" },
            { term: "Turing test", def: "tes kemampuan AI meniru manusia", cat: "konsep" },
            { term: "AGI", def: "Artificial General Intelligence setara manusia", cat: "konsep" },
            { term: "narrow AI", def: "AI khusus untuk satu tugas spesifik", cat: "jenis" },
            { term: "training data", def: "data yang digunakan melatih model AI", cat: "data" },
            { term: "model", def: "hasil training algoritma ML", cat: "konsep" },
            { term: "algoritma", def: "langkah-langkah logis penyelesaian masalah", cat: "konsep" },
            { term: "klasifikasi", def: "pengelompokan data ke kategori", cat: "tugas" },
            { term: "regresi", def: "prediksi nilai kontinu", cat: "tugas" },
            { term: "clustering", def: "pengelompokan data tanpa label", cat: "tugas" },
            { term: "overfitting", def: "model terlalu cocok dengan data training", cat: "tantangan" },
            { term: "underfitting", def: "model terlalu sederhana untuk data", cat: "tantangan" },
            { term: "bias", def: "kesalahan sistematis model AI", cat: "tantangan" },
            { term: "variance", def: "sensitivitas model terhadap data baru", cat: "tantangan" },
            { term: "dataset", def: "kumpulan data untuk training", cat: "data" },
            { term: "label", def: "tanda atau kelas pada data training", cat: "data" },
            { term: "feature", def: "atribut atau ciri data", cat: "data" },
            { term: "inference", def: "proses prediksi model pada data baru", cat: "konsep" },
            { term: "bias-variance tradeoff", def: "keseimbangan bias dan variansi", cat: "konsep" },
            { term: "generative AI", def: "AI yang menghasilkan konten baru", cat: "cabang" },
            { term: "one-shot learning", def: "belajar dari satu contoh per kelas", cat: "teknik" }
        ]
    },
    8: {
        title: "Machine Learning Core",
        concepts: [
            { term: "linear regression", def: "prediksi nilai dengan garis lurus", cat: "algoritma" },
            { term: "logistic regression", def: "klasifikasi biner dengan sigmoid", cat: "algoritma" },
            { term: "decision tree", def: "pohon keputusan bercabang", cat: "algoritma" },
            { term: "random forest", def: "kumpulan decision tree", cat: "algoritma" },
            { term: "SVM", def: "Support Vector Machine pemisah kelas", cat: "algoritma" },
            { term: "k-NN", def: "klasifikasi berdasarkan tetangga terdekat", cat: "algoritma" },
            { term: "k-means", def: "clustering dengan centroid", cat: "algoritma" },
            { term: "Naive Bayes", def: "klasifikasi berbasis probabilitas", cat: "algoritma" },
            { term: "CNN", def: "Convolutional Neural Network untuk gambar", cat: "arsitektur" },
            { term: "RNN", def: "Recurrent Neural Network untuk sekuens", cat: "arsitektur" },
            { term: "LSTM", def: "Long Short-Term Memory untuk data urutan", cat: "arsitektur" },
            { term: "Gradient Descent", def: "optimasi dengan turunan gradien", cat: "optimasi" },
            { term: "loss function", def: "fungsi kesalahan model", cat: "optimasi" },
            { term: "epoch", def: "satu siklus training penuh", cat: "training" },
            { term: "batch", def: "subkumpulan data dalam satu iterasi", cat: "training" },
            { term: "learning rate", def: "kecepatan model belajar", cat: "hyperparameter" },
            { term: "hyperparameter", def: "parameter yang diatur sebelum training", cat: "konsep" },
            { term: "cross-validation", def: "validasi silang data training", cat: "evaluasi" },
            { term: "confusion matrix", def: "tabel evaluasi klasifikasi", cat: "evaluasi" },
            { term: "precision", def: "ketepatan prediksi positif", cat: "metrik" },
            { term: "recall", def: "kemampuan menangkap positif sejati", cat: "metrik" },
            { term: "F1 score", def: "rata-rata harmonik precision dan recall", cat: "metrik" },
            { term: "accuracy", def: "persentase prediksi benar", cat: "metrik" },
            { term: "ROC AUC", def: "kurva evaluasi kinerja klasifikasi", cat: "metrik" },
            { term: "feature engineering", def: "pembuatan fitur dari data mentah", cat: "tahap" },
            { term: "data preprocessing", def: "pembersihan dan transformasi data", cat: "tahap" },
            { term: "normalisasi", def: "skala data ke rentang tertentu", cat: "tahap" },
            { term: "dimensionality reduction", def: "pengurangan jumlah fitur", cat: "tahap" },
            { term: "PCA", def: "Principal Component Analysis reduksi dimensi", cat: "algoritma" },
            { term: "grid search", def: "pencarian hyperparameter sistematis", cat: "tuning" }
        ]
    },
    9: {
        title: "AI Kehidupan Sehari-hari",
        concepts: [
            { term: "asisten virtual", def: "AI yang membantu tugas sehari-hari", cat: "aplikasi" },
            { term: "Siri", def: "asisten virtual Apple", cat: "aplikasi" },
            { term: "Google Assistant", def: "asisten virtual Google", cat: "aplikasi" },
            { term: "Alexa", def: "asisten virtual Amazon", cat: "aplikasi" },
            { term: "rekomendasi", def: "saran konten personal oleh AI", cat: "fitur" },
            { term: "Netflix", def: "platform streaming dengan rekomendasi AI", cat: "aplikasi" },
            { term: "Spotify", def: "platform musik dengan rekomendasi AI", cat: "aplikasi" },
            { term: "YouTube", def: "platform video dengan rekomendasi konten", cat: "aplikasi" },
            { term: "chatbot", def: "program AI untuk percakapan", cat: "aplikasi" },
            { term: "GPT", def: "Generative Pre-trained Transformer model", cat: "model" },
            { term: "TikTok", def: "aplikasi video pendek dengan AI fyp", cat: "aplikasi" },
            { term: "face recognition", def: "pengenalan wajah oleh AI", cat: "fitur" },
            { term: "filter camera", def: "efek kamera berbasis AI", cat: "fitur" },
            { term: "autocorrect", def: "koreksi kata otomatis AI", cat: "fitur" },
            { term: "predictive text", def: "prediksi kata selanjutnya oleh AI", cat: "fitur" },
            { term: "Google Maps", def: "navigasi dengan AI prediksi lalu lintas", cat: "aplikasi" },
            { term: "Waze", def: "navigasi crowdsourced dengan AI", cat: "aplikasi" },
            { term: "Google Translate", def: "penerjemah bahasa AI", cat: "aplikasi" },
            { term: "DeepL", def: "penerjemah AI akurasi tinggi", cat: "aplikasi" },
            { term: "spam filter", def: "penyaring email spam dengan AI", cat: "fitur" },
            { term: "fraud detection", def: "deteksi penipuan transaksi oleh AI", cat: "fitur" },
            { term: "AI dalam kesehatan", def: "diagnosis dan analisis medis AI", cat: "sektor" },
            { term: "AI dalam pendidikan", def: "pembelajaran personal dengan AI", cat: "sektor" },
            { term: "AI dalam pertanian", def: "optimasi panen dengan AI", cat: "sektor" },
            { term: "AI dalam transportasi", def: "mobil otonom dan manajemen lalu lintas", cat: "sektor" },
            { term: "AI dalam keuangan", def: "analisis keuangan dan budgeting AI", cat: "sektor" },
            { term: "AI dalam hiburan", def: "rekomendasi film dan musik AI", cat: "sektor" },
            { term: "AI dalam e-commerce", def: "rekomendasi produk dengan AI", cat: "sektor" },
            { term: "AI dalam keamanan", def: "sistem keamanan pintar AI", cat: "sektor" },
            { term: "AI dalam sosial media", def: "personalisasi konten media sosial", cat: "sektor" }
        ]
    },
    10: {
        title: "Masa Depan AIoT Mandiri",
        concepts: [
            { term: "5G", def: "jaringan seluler generasi kelima cepat", cat: "jaringan" },
            { term: "6G", def: "jaringan masa depan 1 Tbps", cat: "jaringan" },
            { term: "mmWave", def: "gelombang milimeter frekuensi tinggi 5G", cat: "teknologi" },
            { term: "small cell", def: "pemancar kecil mmWave 5G", cat: "teknologi" },
            { term: "MIMO", def: "Multiple Input Multiple Output antena", cat: "teknologi" },
            { term: "network slicing", def: "jaringan virtual terisolasi 5G", cat: "teknologi" },
            { term: "blockchain", def: "teknologi buku besar terdistribusi", cat: "teknologi" },
            { term: "smart contract", def: "kontrak otomatis blockchain", cat: "teknologi" },
            { term: "digital twin", def: "simulasi virtual sistem fisik", cat: "konsep" },
            { term: "smart city", def: "kota pintar dengan AIoT", cat: "aplikasi" },
            { term: "kendaraan otonom", def: "mobil tanpa pengemudi", cat: "aplikasi" },
            { term: "telemedicine", def: "konsultasi dokter jarak jauh", cat: "aplikasi" },
            { term: "edge AI", def: "AI berjalan di perangkat edge", cat: "konsep" },
            { term: "federated learning", def: "training AI lokal tanpa kirim data", cat: "teknik" },
            { term: "predictive maintenance", def: "prediksi kerusakan mesin", cat: "aplikasi" },
            { term: "self-healing", def: "perbaikan diri sistem otonom", cat: "konsep" },
            { term: "sustainable AIoT", def: "AIoT ramah lingkungan", cat: "konsep" },
            { term: "quantum computing", def: "komputasi kuantum super cepat", cat: "teknologi" },
            { term: "zero-trust", def: "model keamanan tanpa kepercayaan otomatis", cat: "keamanan" },
            { term: "RIS", def: "Reconfigurable Intelligent Surface untuk sinyal", cat: "teknologi" },
            { term: "terahertz", def: "komunikasi frekuensi terahertz 6G", cat: "teknologi" },
            { term: "holografi", def: "tampilan 3D dengan 6G", cat: "aplikasi" },
            { term: "smart warehouse", def: "gudang otomatis AIoT", cat: "aplikasi" },
            { term: "digital passport", def: "sertifikat digital produk blockchain", cat: "aplikasi" },
            { term: "M2M communication", def: "komunikasi mesin ke mesin", cat: "konsep" },
            { term: "autonomous system", def: "sistem otonom mandiri", cat: "konsep" },
            { term: "robot otonom", def: "robot yang beroperasi mandiri", cat: "aplikasi" },
            { term: "smart energy", def: "manajemen energi pintar AIoT", cat: "aplikasi" },
            { term: "environmental monitoring", def: "pemantauan lingkungan AIoT", cat: "aplikasi" },
            { term: "Proof of Authority", def: "konsensus blockchain efisien", cat: "teknologi" }
        ]
    }
};

function generateMCQ(concepts, count) {
    const questions = [];
    const templates = [
        { q: (c) => `Apa yang dimaksud dengan ${c.term}?`, a: (c) => c.def },
        { q: (c) => `${c.def} dikenal dengan istilah ____.`, a: (c) => c.term },
        { q: (c) => `Manakah pernyataan yang benar tentang ${c.term}?`, a: (c) => `${c.term} adalah ${c.def}` },
        { q: (c) => `${c.term} termasuk dalam kategori ____.`, a: (c) => c.cat },
    ];
    let idx = 0;
    while (questions.length < count) {
        const c = concepts[idx % concepts.length];
        const tmpl = templates[idx % templates.length];
        const others = concepts.filter(x => x.term !== c.term);
        const wrongs = shuffle(others).slice(0, 3);
        const opts = shuffle([tmpl.a(c), ...wrongs.map(w => (tmpl.a(c).includes(c.term) ? `${w.term} adalah ${w.def}` : w.def))]);
        questions.push({
            question: tmpl.q(c).charAt(0).toUpperCase() + tmpl.q(c).slice(1),
            options: opts,
            correct_answer: tmpl.a(c).charAt(0).toUpperCase() + tmpl.a(c).slice(1),
            question_type: 'mcq'
        });
        idx++;
    }
    return questions;
}

function generateFillBlank(concepts, count) {
    const questions = [];
    const templates = [
        (t) => ({ q: `____ adalah ${t.def}`, a: t.term }),
        (t) => ({ q: `${t.term} termasuk dalam kategori ____.`, a: t.cat }),
        (t) => ({ q: `Salah satu teknologi yang ${t.def} adalah ____.`, a: t.term }),
        (t) => ({ q: `Dalam ${t.cat}, ${t.term} berfungsi untuk ____.`, a: t.def.split(',')[0] }),
        (t) => ({ q: `Konsep ${t.term} dikenal sebagai ____ dalam sistem IoT.`, a: t.cat }),
    ];
    let idx = 0;
    while (questions.length < count) {
        const c = concepts[idx % concepts.length];
        const t = templates[idx % templates.length];
        const res = t(c);
        questions.push({
            question: res.q.charAt(0).toUpperCase() + res.q.slice(1),
            options: [],
            correct_answer: res.a,
            question_type: 'fill_blank'
        });
        idx++;
    }
    return questions;
}

function generateArrangeWords(concepts, count) {
    const questions = [];
    const sentences = concepts.map(c => `${c.term} adalah ${c.def}`).concat(
        concepts.map(c => `${c.term} termasuk kategori ${c.cat}`)
    );
    let idx = 0;
    while (questions.length < count) {
        const s = sentences[idx % sentences.length];
        const words = s.split(/\s+/).filter(w => w.length > 1 && !/^[.,;:!?]$/.test(w));
        if (words.length < 3) { idx++; continue; }
        const shuffled = [...words].sort(() => Math.random() - 0.5);
        if (shuffled.join(' ') === s) { idx++; continue; }
        questions.push({
            question: `Susunlah kata-kata berikut menjadi kalimat yang benar: ${shuffled.join(' / ')}`,
            options: shuffled,
            correct_answer: s,
            question_type: 'arrange_words'
        });
        idx++;
    }
    return questions;
}

function generateForPage(pageNumber, paragraphs) {
    const data = PAGE_DATA[pageNumber];
    if (!data) return { mcq: [], fill_blank: [], arrange_words: [] };
    const concepts = data.concepts;
    return {
        mcq: generateMCQ(concepts, 200),
        fill_blank: generateFillBlank(concepts, 200),
        arrange_words: generateArrangeWords(concepts, 200)
    };
}

module.exports = { generateForPage };
