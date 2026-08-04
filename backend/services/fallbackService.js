// fallbackService.js
// Basis pengetahuan cadangan berbasis keyword-matching sederhana.
// Dipakai saat Gemini API gagal/timeout, supaya EduBot tetap bisa menjawab
// pertanyaan dasar tanpa bergantung pada AI eksternal.

function getFallbackResponse(question) {
    const questionLower = String(question).toLowerCase();

    const fallbacks = [
        {
            keywords: ['iot', 'internet of things', 'internet of thing', 'apa itu iot'],
            answer: "🌐 **IoT (Internet of Things)** adalah konsep di mana perangkat-perangkat fisik terhubung ke internet dan bisa saling berkomunikasi. Di buku EduBook, IoT dijelaskan sebagai fondasi utama sistem cerdas yang menghubungkan sensor, aktuator, dan cloud computing.\n\nContoh: Lampu rumah yang bisa dikontrol dari HP, atau kulkas yang bisa memberi tahu kalau stok makanan habis."
        },
        {
            keywords: ['esp32', 'mikrokontroler', 'microcontroller', 'apa itu esp32'],
            answer: "⚡ **ESP32** adalah mikrokontroler populer yang memiliki built-in Wi-Fi dan Bluetooth. Di sistem AIoT, ESP32 berfungsi sebagai 'otak' yang memproses data dari sensor dan mengirimkannya ke cloud.\n\nKeunggulan ESP32:\n• Hemat daya (low power)\n• Harga terjangkau\n• Banyak komunitas dan library"
        },
        {
            keywords: ['sensor', 'sensors', 'apa itu sensor', 'jenis sensor'],
            answer: "📡 **Sensor** adalah komponen yang berfungsi seperti 'panca indra' pada sistem IoT. Sensor mengubah sinyal fisik (suhu, cahaya, gerakan) menjadi sinyal listrik yang bisa diproses oleh mikrokontroler.\n\nJenis sensor umum:\n• Sensor suhu (DHT11, DS18B20)\n• Sensor jarak (Ultrasonic, IR)\n• Sensor gerak (PIR)\n• Sensor cahaya (LDR)"
        },
        {
            keywords: ['ai', 'artificial intelligence', 'kecerdasan buatan', 'apa itu ai'],
            answer: "🧠 **AI (Artificial Intelligence)** adalah teknologi yang memungkinkan mesin 'belajar' dari data dan membuat keputusan. Di buku EduBook, AI dibahas sebagai komponen yang membuat sistem IoT menjadi 'cerdas'.\n\nContoh AI dalam IoT:\n• Sistem prediksi cuaca\n• Smart home yang belajar kebiasaan user\n• Deteksi anomali pada mesin industri"
        },
        {
            keywords: ['cloud', 'database', 'mongodb', 'apa itu cloud'],
            answer: "☁️ **Cloud** adalah tempat penyimpanan data di internet. Di sistem AIoT, data dari sensor dikirim ke cloud untuk disimpan dan dianalisis.\n\n**MongoDB** adalah database yang sering digunakan karena:\n• Fleksibel (noSQL)\n• Scalable (bisa berkembang)\n• Mudah diintegrasikan dengan IoT"
        },
        {
            keywords: ['mqtt', 'protokol', 'jaringan', 'apa itu mqtt', 'protokol mqtt'],
            answer: "📨 **MQTT** adalah protokol komunikasi ringan yang dirancang khusus untuk IoT. Sangat efisien karena menggunakan bandwidth kecil, cocok untuk perangkat dengan sumber daya terbatas.\n\nKelebihan MQTT:\n• Ringan (lightweight)\n• Real-time\n• Mendukung banyak perangkat"
        },
        {
            keywords: ['aktuator', 'actuator', 'apa itu aktuator'],
            answer: "🔧 **Aktuator** adalah komponen yang mengubah sinyal listrik menjadi gerakan fisik. Ini adalah 'tangan' dari sistem IoT.\n\nContoh aktuator:\n• Motor DC\n• Servo\n• Relay (saklar otomatis)\n• LED"
        },
        {
            keywords: ['machine learning', 'ml', 'apa itu machine learning'],
            answer: "🤖 **Machine Learning (ML)** adalah cabang AI di mana mesin belajar dari data tanpa diprogram secara eksplisit. Di EduBook, ML dijelaskan sebagai inti dari sistem AIoT yang cerdas.\n\nJenis ML:\n• Supervised Learning (dengan label)\n• Unsupervised Learning (tanpa label)\n• Reinforcement Learning (belajar dari trial-error)"
        },
        {
            keywords: ['edubook', 'sic', 'samsung innovation', 'buku ini'],
            answer: "📖 **EduBook** adalah buku pembelajaran interaktif untuk program **Samsung Innovation Campus (SIC) Batch 8**. Buku ini membahas tentang AIoT (Artificial Intelligence of Things) secara praktis dan mudah dipahami.\n\nMateri yang dibahas:\n• Halaman 1-10 tentang IoT, Sensor, ESP32, AI, dan ML"
        },
        {
            keywords: ['hello', 'halo', 'hi', 'hai', 'assalamualaikum', 'selamat pagi'],
            answer: "👋 Halo juga! Selamat datang di EduBot, asisten AI tutor pribadi kamu.\n\nAda yang bisa aku bantu terkait materi AIoT? Coba tanyakan tentang:\n• IoT dan cara kerjanya\n• ESP32 dan fungsinya\n• Sensor dan aktuator\n• AI dan Machine Learning\n• Cloud dan MQTT"
        },
        {
            keywords: ['terima kasih', 'makasih', 'thanks', 'thank you'],
            answer: "😊 Sama-sama! Senang bisa membantu kamu belajar AIoT.\n\nJangan ragu untuk bertanya lagi ya! Kalau ada materi yang kurang jelas, langsung tanyakan ke EduBot. Semangat belajar! 💪"
        }
    ];

    for (const fb of fallbacks) {
        for (const keyword of fb.keywords) {
            const isShortKeyword = keyword.length <= 3;
            const matches = isShortKeyword
                ? new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(questionLower)
                : questionLower.includes(keyword);

            if (matches) {
                return fb.answer + "\n\n💡 *Ini adalah jawaban dasar dari sistem. Untuk penjelasan lebih mendalam, coba tanyakan lagi nanti saat server AI sudah normal!*";
            }
        }
    }

    return "🤖 **EduBot** siap membantu!\n\nMaaf, server AI sedang sibuk. Tapi kamu bisa coba tanyakan:\n• 'Apa itu IoT?'\n• 'Fungsi ESP32?'\n• 'Apa itu Machine Learning?'\n• 'Bagaimana cara kerja sensor?'\n\nCoba lagi ya, atau tanyakan dengan pertanyaan yang lebih spesifik! 🙏\n\n💡 *Tips: Pertanyaan yang lebih spesifik akan lebih mudah dijawab.*";
}

module.exports = { getFallbackResponse };
