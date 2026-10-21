const SUBJECTS = [
    // === SD (Kelas 1-6) ===
    { subject_id: 'sd_ppkn', nama: 'Pendidikan Pancasila', jenjang: 'sd', kategori: 'umum', kelas_min: 1, kelas_max: 6, icon: '🇮🇩', deskripsi: 'Mempelajari nilai-nilai Pancasila dan karakter bangsa' },
    { subject_id: 'sd_bindo', nama: 'Bahasa Indonesia', jenjang: 'sd', kategori: 'umum', kelas_min: 1, kelas_max: 6, icon: '📖', deskripsi: 'Membaca, menulis, dan berbahasa Indonesia dengan baik' },
    { subject_id: 'sd_mtk', nama: 'Matematika', jenjang: 'sd', kategori: 'umum', kelas_min: 1, kelas_max: 6, icon: '🔢', deskripsi: 'Berhitung, geometri dasar, dan logika sederhana' },
    { subject_id: 'sd_ipas', nama: 'IPAS', jenjang: 'sd', kategori: 'umum', kelas_min: 3, kelas_max: 6, icon: '🌍', deskripsi: 'Ilmu Pengetahuan Alam dan Sosial terpadu' },
    { subject_id: 'sd_seni', nama: 'Seni & Budaya', jenjang: 'sd', kategori: 'umum', kelas_min: 1, kelas_max: 6, icon: '🎨', deskripsi: 'Seni musik, rupa, tari, dan teater' },
    { subject_id: 'sd_pjok', nama: 'PJOK', jenjang: 'sd', kategori: 'umum', kelas_min: 1, kelas_max: 6, icon: '⚽', deskripsi: 'Pendidikan Jasmani, Olahraga, dan Kesehatan' },
    { subject_id: 'sd_bing', nama: 'Bahasa Inggris', jenjang: 'sd', kategori: 'umum', kelas_min: 1, kelas_max: 6, icon: '🇬🇧', deskripsi: 'Pengenalan bahasa Inggris dasar' },

    // Agama SD
    { subject_id: 'sd_agama_islam', nama: 'Pendidikan Agama Islam', jenjang: 'sd', kategori: 'agama', agama: 'islam', kelas_min: 1, kelas_max: 6, icon: '🕌', deskripsi: 'Mempelajari ajaran Islam dan akhlak' },
    { subject_id: 'sd_agama_kristen', nama: 'Pendidikan Agama Kristen', jenjang: 'sd', kategori: 'agama', agama: 'kristen', kelas_min: 1, kelas_max: 6, icon: '⛪', deskripsi: 'Mempelajari ajaran Kristen dan kasih' },
    { subject_id: 'sd_agama_katolik', nama: 'Pendidikan Agama Katolik', jenjang: 'sd', kategori: 'agama', agama: 'katolik', kelas_min: 1, kelas_max: 6, icon: '✝️', deskripsi: 'Mempelajari ajaran Katolik dan iman' },
    { subject_id: 'sd_agama_hindu', nama: 'Pendidikan Agama Hindu', jenjang: 'sd', kategori: 'agama', agama: 'hindu', kelas_min: 1, kelas_max: 6, icon: '🛕', deskripsi: 'Mempelajari ajaran Hindu dan dharma' },
    { subject_id: 'sd_agama_buddha', nama: 'Pendidikan Agama Buddha', jenjang: 'sd', kategori: 'agama', agama: 'buddha', kelas_min: 1, kelas_max: 6, icon: '☸️', deskripsi: 'Mempelajari ajaran Buddha dan kebijaksanaan' },
    { subject_id: 'sd_agama_khonghucu', nama: 'Pendidikan Agama Khonghucu', jenjang: 'sd', kategori: 'agama', agama: 'khonghucu', kelas_min: 1, kelas_max: 6, icon: '🏮', deskripsi: 'Mempelajari ajaran Khonghucu dan kemanusiaan' },

    // === SMP (Kelas 7-9) ===
    { subject_id: 'smp_ppkn', nama: 'Pendidikan Pancasila', jenjang: 'smp', kategori: 'umum', kelas_min: 7, kelas_max: 9, icon: '🇮🇩', deskripsi: 'Mendalami nilai-nilai Pancasila dan kewarganegaraan' },
    { subject_id: 'smp_bindo', nama: 'Bahasa Indonesia', jenjang: 'smp', kategori: 'umum', kelas_min: 7, kelas_max: 9, icon: '📖', deskripsi: 'Meningkatkan kemampuan berbahasa Indonesia' },
    { subject_id: 'smp_mtk', nama: 'Matematika', jenjang: 'smp', kategori: 'umum', kelas_min: 7, kelas_max: 9, icon: '🔢', deskripsi: 'Aljabar, geometri, dan statistika dasar' },
    { subject_id: 'smp_ipa', nama: 'IPA', jenjang: 'smp', kategori: 'umum', kelas_min: 7, kelas_max: 9, icon: '🔬', deskripsi: 'Biologi, fisika, dan kimia dasar' },
    { subject_id: 'smp_ips', nama: 'IPS', jenjang: 'smp', kategori: 'umum', kelas_min: 7, kelas_max: 9, icon: '🌍', deskripsi: 'Sejarah, geografi, ekonomi, dan sosiologi' },
    { subject_id: 'smp_bing', nama: 'Bahasa Inggris', jenjang: 'smp', kategori: 'umum', kelas_min: 7, kelas_max: 9, icon: '🇬🇧', deskripsi: 'Bahasa Inggris intermediate' },
    { subject_id: 'smp_inf', nama: 'Informatika', jenjang: 'smp', kategori: 'umum', kelas_min: 7, kelas_max: 9, icon: '💻', deskripsi: 'Dasar-dasar komputer dan pemrograman' },
    { subject_id: 'smp_prakarya', nama: 'Prakarya', jenjang: 'smp', kategori: 'umum', kelas_min: 7, kelas_max: 9, icon: '🛠️', deskripsi: 'Kerajinan, rekayasa, budidaya, dan pengolahan' },
    { subject_id: 'smp_seni', nama: 'Seni Budaya', jenjang: 'smp', kategori: 'umum', kelas_min: 7, kelas_max: 9, icon: '🎨', deskripsi: 'Apresiasi dan ekspresi seni' },
    { subject_id: 'smp_pjok', nama: 'PJOK', jenjang: 'smp', kategori: 'umum', kelas_min: 7, kelas_max: 9, icon: '⚽', deskripsi: 'Olahraga dan kesehatan jasmani' },

    // Agama SMP
    { subject_id: 'smp_agama_islam', nama: 'Pendidikan Agama Islam', jenjang: 'smp', kategori: 'agama', agama: 'islam', kelas_min: 7, kelas_max: 9, icon: '🕌', deskripsi: 'Pendalaman ajaran Islam dan fiqih' },
    { subject_id: 'smp_agama_kristen', nama: 'Pendidikan Agama Kristen', jenjang: 'smp', kategori: 'agama', agama: 'kristen', kelas_min: 7, kelas_max: 9, icon: '⛪', deskripsi: 'Pendalaman ajaran Kristen dan Alkitab' },
    { subject_id: 'smp_agama_katolik', nama: 'Pendidikan Agama Katolik', jenjang: 'smp', kategori: 'agama', agama: 'katolik', kelas_min: 7, kelas_max: 9, icon: '✝️', deskripsi: 'Pendalaman ajaran Katolik dan liturgi' },
    { subject_id: 'smp_agama_hindu', nama: 'Pendidikan Agama Hindu', jenjang: 'smp', kategori: 'agama', agama: 'hindu', kelas_min: 7, kelas_max: 9, icon: '🛕', deskripsi: 'Pendalaman ajaran Hindu dan Weda' },
    { subject_id: 'smp_agama_buddha', nama: 'Pendidikan Agama Buddha', jenjang: 'smp', kategori: 'agama', agama: 'buddha', kelas_min: 7, kelas_max: 9, icon: '☸️', deskripsi: 'Pendalaman ajaran Buddha dan Dhammapada' },
    { subject_id: 'smp_agama_khonghucu', nama: 'Pendidikan Agama Khonghucu', jenjang: 'smp', kategori: 'agama', agama: 'khonghucu', kelas_min: 7, kelas_max: 9, icon: '🏮', deskripsi: 'Pendalaman ajaran Khonghucu dan Tao Te Ching' },

    // === SMA (Kelas 10-12) ===
    { subject_id: 'sma_ppkn', nama: 'Pendidikan Pancasila', jenjang: 'sma', kategori: 'umum', kelas_min: 10, kelas_max: 12, icon: '🇮🇩', deskripsi: 'Kewarganegaraan dan filsafat Pancasila' },
    { subject_id: 'sma_bindo', nama: 'Bahasa Indonesia', jenjang: 'sma', kategori: 'umum', kelas_min: 10, kelas_max: 12, icon: '📖', deskripsi: 'Bahasa Indonesia tingkat lanjut' },
    { subject_id: 'sma_bing', nama: 'Bahasa Inggris', jenjang: 'sma', kategori: 'umum', kelas_min: 10, kelas_max: 12, icon: '🇬🇧', deskripsi: 'Bahasa Inggris advanced' },
    { subject_id: 'sma_mtk', nama: 'Matematika', jenjang: 'sma', kategori: 'umum', kelas_min: 10, kelas_max: 12, icon: '🔢', deskripsi: 'Matematika SMA tingkat lanjut' },
    { subject_id: 'sma_ipa', nama: 'IPA Terpadu', jenjang: 'sma', kategori: 'umum', kelas_min: 10, kelas_max: 12, icon: '🔬', deskripsi: 'Fisika, kimia, biologi terpadu' },
    { subject_id: 'sma_ips', nama: 'IPS Terpadu', jenjang: 'sma', kategori: 'umum', kelas_min: 10, kelas_max: 12, icon: '🌍', deskripsi: 'Sejarah, geografi, ekonomi, sosiologi terpadu' },
    { subject_id: 'sma_inf', nama: 'Informatika', jenjang: 'sma', kategori: 'umum', kelas_min: 10, kelas_max: 12, icon: '💻', deskripsi: 'Informatika dan pemrograman' },
    { subject_id: 'sma_pjok', nama: 'PJOK', jenjang: 'sma', kategori: 'umum', kelas_min: 10, kelas_max: 12, icon: '⚽', deskripsi: 'Pendidikan jasmani dan olahraga' },
    { subject_id: 'sma_seni', nama: 'Seni Budaya', jenjang: 'sma', kategori: 'umum', kelas_min: 10, kelas_max: 12, icon: '🎨', deskripsi: 'Seni budaya tingkat lanjut' },

    // Agama SMA
    { subject_id: 'sma_agama_islam', nama: 'Pendidikan Agama Islam', jenjang: 'sma', kategori: 'agama', agama: 'islam', kelas_min: 10, kelas_max: 12, icon: '🕌', deskripsi: 'Fiqih, akhlak, dan tafsir' },
    { subject_id: 'sma_agama_kristen', nama: 'Pendidikan Agama Kristen', jenjang: 'sma', kategori: 'agama', agama: 'kristen', kelas_min: 10, kelas_max: 12, icon: '⛪', deskripsi: 'Teologi dan etika Kristen' },
    { subject_id: 'sma_agama_katolik', nama: 'Pendidikan Agama Katolik', jenjang: 'sma', kategori: 'agama', agama: 'katolik', kelas_min: 10, kelas_max: 12, icon: '✝️', deskripsi: 'Teologi dan moral Katolik' },
    { subject_id: 'sma_agama_hindu', nama: 'Pendidikan Agama Hindu', jenjang: 'sma', kategori: 'agama', agama: 'hindu', kelas_min: 10, kelas_max: 12, icon: '🛕', deskripsi: 'Filsafat dan tata cara Hindu' },
    { subject_id: 'sma_agama_buddha', nama: 'Pendidikan Agama Buddha', jenjang: 'sma', kategori: 'agama', agama: 'buddha', kelas_min: 10, kelas_max: 12, icon: '☸️', deskripsi: 'Filsafat dan meditasi Buddha' },
    { subject_id: 'sma_agama_khonghucu', nama: 'Pendidikan Agama Khonghucu', jenjang: 'sma', kategori: 'agama', agama: 'khonghucu', kelas_min: 10, kelas_max: 12, icon: '🏮', deskripsi: 'Filsafat dan etika Khonghucu' },

    // Peminatan SMA - MIPA
    { subject_id: 'sma_mipa_mtk', nama: 'Matematika Tingkat Lanjut', jenjang: 'sma', kategori: 'peminatan', peminatan: 'mipa', kelas_min: 11, kelas_max: 12, icon: '📐', deskripsi: 'Matematika peminatan MIPA' },
    { subject_id: 'sma_mipa_fisika', nama: 'Fisika', jenjang: 'sma', kategori: 'peminatan', peminatan: 'mipa', kelas_min: 11, kelas_max: 12, icon: '⚛️', deskripsi: 'Fisika peminatan MIPA' },
    { subject_id: 'sma_mipa_kimia', nama: 'Kimia', jenjang: 'sma', kategori: 'peminatan', peminatan: 'mipa', kelas_min: 11, kelas_max: 12, icon: '🧪', deskripsi: 'Kimia peminatan MIPA' },
    { subject_id: 'sma_mipa_biologi', nama: 'Biologi', jenjang: 'sma', kategori: 'peminatan', peminatan: 'mipa', kelas_min: 11, kelas_max: 12, icon: '🧬', deskripsi: 'Biologi peminatan MIPA' },

    // Peminatan SMA - IPS
    { subject_id: 'sma_ips_sosiologi', nama: 'Sosiologi', jenjang: 'sma', kategori: 'peminatan', peminatan: 'ips', kelas_min: 11, kelas_max: 12, icon: '👥', deskripsi: 'Sosiologi peminatan IPS' },
    { subject_id: 'sma_ips_ekonomi', nama: 'Ekonomi', jenjang: 'sma', kategori: 'peminatan', peminatan: 'ips', kelas_min: 11, kelas_max: 12, icon: '📈', deskripsi: 'Ekonomi peminatan IPS' },
    { subject_id: 'sma_ips_geografi', nama: 'Geografi', jenjang: 'sma', kategori: 'peminatan', peminatan: 'ips', kelas_min: 11, kelas_max: 12, icon: '🗺️', deskripsi: 'Geografi peminatan IPS' },
    { subject_id: 'sma_ips_antropologi', nama: 'Antropologi', jenjang: 'sma', kategori: 'peminatan', peminatan: 'ips', kelas_min: 11, kelas_max: 12, icon: '🏛️', deskripsi: 'Antropologi peminatan IPS' },

    // Peminatan SMA - Bahasa
    { subject_id: 'sma_bahasa_bindo', nama: 'Bahasa Indonesia Tingkat Lanjut', jenjang: 'sma', kategori: 'peminatan', peminatan: 'bahasa', kelas_min: 11, kelas_max: 12, icon: '📚', deskripsi: 'Bahasa Indonesia peminatan Bahasa' },
    { subject_id: 'sma_bahasa_bing', nama: 'Bahasa Inggris Tingkat Lanjut', jenjang: 'sma', kategori: 'peminatan', peminatan: 'bahasa', kelas_min: 11, kelas_max: 12, icon: '🌐', deskripsi: 'Bahasa Inggris peminatan Bahasa' },
    { subject_id: 'sma_bahasa_asing', nama: 'Bahasa Asing', jenjang: 'sma', kategori: 'peminatan', peminatan: 'bahasa', kelas_min: 11, kelas_max: 12, icon: '🗣️', deskripsi: 'Bahasa asing pilihan (Jepang/Prancis/Mandarin/Jerman)' },

    // === SMK (Kelas 10-12) ===
    { subject_id: 'smk_ppkn', nama: 'Pendidikan Pancasila', jenjang: 'smk', kategori: 'umum', kelas_min: 10, kelas_max: 12, icon: '🇮🇩', deskripsi: 'Pendidikan kewarganegaraan' },
    { subject_id: 'smk_bindo', nama: 'Bahasa Indonesia', jenjang: 'smk', kategori: 'umum', kelas_min: 10, kelas_max: 12, icon: '📖', deskripsi: 'Bahasa Indonesia SMK' },
    { subject_id: 'smk_mtk', nama: 'Matematika', jenjang: 'smk', kategori: 'umum', kelas_min: 10, kelas_max: 12, icon: '🔢', deskripsi: 'Matematika SMK' },
    { subject_id: 'smk_bing', nama: 'Bahasa Inggris', jenjang: 'smk', kategori: 'umum', kelas_min: 10, kelas_max: 12, icon: '🇬🇧', deskripsi: 'Bahasa Inggris SMK' },
    { subject_id: 'smk_pjok', nama: 'PJOK', jenjang: 'smk', kategori: 'umum', kelas_min: 10, kelas_max: 12, icon: '⚽', deskripsi: 'Pendidikan jasmani' },
    { subject_id: 'smk_seni', nama: 'Seni Budaya', jenjang: 'smk', kategori: 'umum', kelas_min: 10, kelas_max: 12, icon: '🎨', deskripsi: 'Seni budaya' },
    { subject_id: 'smk_sejarah', nama: 'Sejarah', jenjang: 'smk', kategori: 'umum', kelas_min: 10, kelas_max: 12, icon: '📜', deskripsi: 'Sejarah Indonesia' },
    { subject_id: 'smk_ipas', nama: 'Projek IPAS', jenjang: 'smk', kategori: 'umum', kelas_min: 10, kelas_max: 12, icon: '🔬', deskripsi: 'Projek IPAS terapan' },
    { subject_id: 'smk_inf', nama: 'Informatika', jenjang: 'smk', kategori: 'umum', kelas_min: 10, kelas_max: 12, icon: '💻', deskripsi: 'Informatika SMK' },

    // Agama SMK
    { subject_id: 'smk_agama_islam', nama: 'Pendidikan Agama Islam', jenjang: 'smk', kategori: 'agama', agama: 'islam', kelas_min: 10, kelas_max: 12, icon: '🕌', deskripsi: 'Pendidikan agama Islam SMK' },
    { subject_id: 'smk_agama_kristen', nama: 'Pendidikan Agama Kristen', jenjang: 'smk', kategori: 'agama', agama: 'kristen', kelas_min: 10, kelas_max: 12, icon: '⛪', deskripsi: 'Pendidikan agama Kristen SMK' },
    { subject_id: 'smk_agama_katolik', nama: 'Pendidikan Agama Katolik', jenjang: 'smk', kategori: 'agama', agama: 'katolik', kelas_min: 10, kelas_max: 12, icon: '✝️', deskripsi: 'Pendidikan agama Katolik SMK' },
    { subject_id: 'smk_agama_hindu', nama: 'Pendidikan Agama Hindu', jenjang: 'smk', kategori: 'agama', agama: 'hindu', kelas_min: 10, kelas_max: 12, icon: '🛕', deskripsi: 'Pendidikan agama Hindu SMK' },
    { subject_id: 'smk_agama_buddha', nama: 'Pendidikan Agama Buddha', jenjang: 'smk', kategori: 'agama', agama: 'buddha', kelas_min: 10, kelas_max: 12, icon: '☸️', deskripsi: 'Pendidikan agama Buddha SMK' },
    { subject_id: 'smk_agama_khonghucu', nama: 'Pendidikan Agama Khonghucu', jenjang: 'smk', kategori: 'agama', agama: 'khonghucu', kelas_min: 10, kelas_max: 12, icon: '🏮', deskripsi: 'Pendidikan agama Khonghucu SMK' },

    // SMK Kejuruan - TKJ
    { subject_id: 'smk_tkj_jaringan', nama: 'Jaringan Komputer', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'tkj', kelas_min: 10, kelas_max: 12, icon: '🌐', deskripsi: 'Teknik jaringan komputer' },
    { subject_id: 'smk_tkj_sistem_operasi', nama: 'Sistem Operasi', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'tkj', kelas_min: 10, kelas_max: 12, icon: '💿', deskripsi: 'Sistem operasi komputer' },
    { subject_id: 'smk_tkj_perangkat_keras', nama: 'Perangkat Keras', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'tkj', kelas_min: 10, kelas_max: 12, icon: '🖥️', deskripsi: 'Perangkat keras komputer' },

    // SMK Kejuruan - RPL
    { subject_id: 'smk_rpl_pemrograman', nama: 'Pemrograman Dasar', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'rpl', kelas_min: 10, kelas_max: 12, icon: '👨‍💻', deskripsi: 'Dasar-dasar pemrograman' },
    { subject_id: 'smk_rpl_database', nama: 'Basis Data', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'rpl', kelas_min: 10, kelas_max: 12, icon: '🗄️', deskripsi: 'Basis data dan SQL' },
    { subject_id: 'smk_rpl_web', nama: 'Pemrograman Web', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'rpl', kelas_min: 10, kelas_max: 12, icon: '🌐', deskripsi: 'Pemrograman web' },

    // SMK Kejuruan - DKV
    { subject_id: 'smk_dkv_desain', nama: 'Desain Grafis', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'dkv', kelas_min: 10, kelas_max: 12, icon: '🎨', deskripsi: 'Desain grafis' },
    { subject_id: 'smk_dkv_multimedia', nama: 'Multimedia', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'dkv', kelas_min: 10, kelas_max: 12, icon: '🎬', deskripsi: 'Multimedia' },
    { subject_id: 'smk_dkv_animasi', nama: 'Animasi', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'dkv', kelas_min: 10, kelas_max: 12, icon: '🎞️', deskripsi: 'Animasi 2D dan 3D' },

    // SMK Kejuruan - AK
    { subject_id: 'smk_ak_dasar', nama: 'Akuntansi Dasar', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'ak', kelas_min: 10, kelas_max: 12, icon: '📊', deskripsi: 'Dasar-dasar akuntansi' },
    { subject_id: 'smk_ak_keuangan', nama: 'Keuangan', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'ak', kelas_min: 10, kelas_max: 12, icon: '💰', deskripsi: 'Keuangan dan perpajakan' },
    { subject_id: 'smk_ak_perpajakan', nama: 'Perpajakan', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'ak', kelas_min: 10, kelas_max: 12, icon: '🧾', deskripsi: 'Perpajakan' },

    // SMK Kejuruan - OTKP
    { subject_id: 'smk_otkp_administrasi', nama: 'Administrasi Perkantoran', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'otkp', kelas_min: 10, kelas_max: 12, icon: '📋', deskripsi: 'Administrasi perkantoran' },
    { subject_id: 'smk_otkp_korrespondensi', nama: 'Korrespondensi', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'otkp', kelas_min: 10, kelas_max: 12, icon: '✉️', deskripsi: 'Korrespondensi bisnis' },
    { subject_id: 'smk_otkp_kearsipan', nama: 'Kearsipan', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'otkp', kelas_min: 10, kelas_max: 12, icon: '🗃️', deskripsi: 'Kearsipan dan dokumentasi' },

    // SMK Kejuruan - BD
    { subject_id: 'smk_bd_pemasaran', nama: 'Pemasaran Digital', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'bd', kelas_min: 10, kelas_max: 12, icon: '📱', deskripsi: 'Pemasaran digital' },
    { subject_id: 'smk_bd_ecommerce', nama: 'E-Commerce', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'bd', kelas_min: 10, kelas_max: 12, icon: '🛒', deskripsi: 'E-commerce' },
    { subject_id: 'smk_bd_konten', nama: 'Konten Kreatif', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'bd', kelas_min: 10, kelas_max: 12, icon: '🎥', deskripsi: 'Konten kreatif' },

    // SMK Kejuruan - TKR
    { subject_id: 'smk_tkr_mesin', nama: 'Teknik Mesin', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'tkr', kelas_min: 10, kelas_max: 12, icon: '⚙️', deskripsi: 'Teknik mesin kendaraan' },
    { subject_id: 'smk_tkr_kelistrikan', nama: 'Kelistrikan', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'tkr', kelas_min: 10, kelas_max: 12, icon: '⚡', deskripsi: 'Kelistrikan kendaraan' },
    { subject_id: 'smk_tkr_chasis', nama: 'Chasis & Body', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'tkr', kelas_min: 10, kelas_max: 12, icon: '🚗', deskripsi: 'Chasis dan body kendaraan' },

    // SMK Kejuruan - ITL
    { subject_id: 'smk_itl_instalasi', nama: 'Instalasi Listrik', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'itl', kelas_min: 10, kelas_max: 12, icon: '🔌', deskripsi: 'Instalasi listrik' },
    { subject_id: 'smk_itl_tenaga', nama: 'Teknik Tenaga Listrik', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'itl', kelas_min: 10, kelas_max: 12, icon: '⚡', deskripsi: 'Teknik tenaga listrik' },
    { subject_id: 'smk_itl_proteksi', nama: 'Proteksi Listrik', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'itl', kelas_min: 10, kelas_max: 12, icon: '🛡️', deskripsi: 'Proteksi listrik' },

    // SMK Kejuruan - TMO
    { subject_id: 'smk_tmo_otomotif', nama: 'Teknik Otomotif', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'tmo', kelas_min: 10, kelas_max: 12, icon: '🚗', deskripsi: 'Teknik otomotif' },
    { subject_id: 'smk_tmo_diagnostik', nama: 'Diagnostik Kendaraan', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'tmo', kelas_min: 10, kelas_max: 12, icon: '🔧', deskripsi: 'Diagnostik kendaraan' },
    { subject_id: 'smk_tmo_perawatan', nama: 'Perawatan Kendaraan', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'tmo', kelas_min: 10, kelas_max: 12, icon: '🛠️', deskripsi: 'Perawatan kendaraan' },

    // SMK Kejuruan - Perhotelan
    { subject_id: 'smk_perhotelan_fo', nama: 'Front Office', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'perhotelan', kelas_min: 10, kelas_max: 12, icon: '🏨', deskripsi: 'Front office hotel' },
    { subject_id: 'smk_perhotelan_hk', nama: 'Housekeeping', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'perhotelan', kelas_min: 10, kelas_max: 12, icon: '🧹', deskripsi: 'Housekeeping hotel' },
    { subject_id: 'smk_perhotelan_fb', nama: 'Food & Beverage', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'perhotelan', kelas_min: 10, kelas_max: 12, icon: '🍽️', deskripsi: 'Food and beverage' },

    // SMK Kejuruan - Tata Boga
    { subject_id: 'smk_tata_boga_memasak', nama: 'Teknik Memasak', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'tata_boga', kelas_min: 10, kelas_max: 12, icon: '👨‍🍳', deskripsi: 'Teknik memasak' },
    { subject_id: 'smk_tata_boga_pastry', nama: 'Pastry & Bakery', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'tata_boga', kelas_min: 10, kelas_max: 12, icon: '🥐', deskripsi: 'Pastry dan bakery' },
    { subject_id: 'smk_tata_boga_gizi', nama: 'Gizi Kuliner', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'tata_boga', kelas_min: 10, kelas_max: 12, icon: '🥗', deskripsi: 'Gizi dan zat gizi' },

    // SMK Kejuruan - Tata Busana
    { subject_id: 'smk_tata_busana_pola', nama: 'Teknik Pola', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'tata_busana', kelas_min: 10, kelas_max: 12, icon: '📐', deskripsi: 'Teknik pola busana' },
    { subject_id: 'smk_tata_busana_menjahit', nama: 'Teknik Menjahit', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'tata_busana', kelas_min: 10, kelas_max: 12, icon: '🧵', deskripsi: 'Teknik menjahit' },
    { subject_id: 'smk_tata_busana_desain', nama: 'Desain Busana', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'tata_busana', kelas_min: 10, kelas_max: 12, icon: '👗', deskripsi: 'Desain busana' },

    // SMK Kejuruan - Keperawatan
    { subject_id: 'smk_keperawatan_dasar', nama: 'Dasar Keperawatan', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'keperawatan', kelas_min: 10, kelas_max: 12, icon: '🏥', deskripsi: 'Dasar keperawatan' },
    { subject_id: 'smk_keperawatan_anatomi', nama: 'Anatomi & Fisiologi', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'keperawatan', kelas_min: 10, kelas_max: 12, icon: '🫀', deskripsi: 'Anatomi dan fisiologi' },
    { subject_id: 'smk_keperawatan_kesehatan', nama: 'Kesehatan Masyarakat', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'keperawatan', kelas_min: 10, kelas_max: 12, icon: '🏥', deskripsi: 'Kesehatan masyarakat' },

    // SMK Kejuruan - Farmasi
    { subject_id: 'smk_farmasi_obat', nama: 'Obat-obatan', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'farmasi', kelas_min: 10, kelas_max: 12, icon: '💊', deskripsi: 'Obat-obatan' },
    { subject_id: 'smk_farmasi_kimia', nama: 'Kimia Farmasi', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'farmasi', kelas_min: 10, kelas_max: 12, icon: '🧪', deskripsi: 'Kimia farmasi' },
    { subject_id: 'smk_farmasi_pelayanan', nama: 'Pelayanan Farmasi', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'farmasi', kelas_min: 10, kelas_max: 12, icon: '🏥', deskripsi: 'Pelayanan farmasi' },

    // SMK Kejuruan - Agribisnis
    { subject_id: 'smk_agribisnis_tanaman', nama: 'Agribisnis Tanaman', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'agribisnis', kelas_min: 10, kelas_max: 12, icon: '🌱', deskripsi: 'Agribisnis tanaman' },
    { subject_id: 'smk_agribisnis_perkebunan', nama: 'Agribisnis Perkebunan', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'agribisnis', kelas_min: 10, kelas_max: 12, icon: '🌴', deskripsi: 'Agribisnis perkebunan' },
    { subject_id: 'smk_agribisnis_pengolahan', nama: 'Pengolahan Hasil', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'agribisnis', kelas_min: 10, kelas_max: 12, icon: '🏭', deskripsi: 'Pengolahan hasil pertanian' },

    // SMK Kejuruan - Teknik Pemesinan
    { subject_id: 'smk_pemesinan_bubut', nama: 'Teknik Mesin Bubut', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'pemesinan', kelas_min: 10, kelas_max: 12, icon: '⚙️', deskripsi: 'Pemesinan bubut dan parametrik' },
    { subject_id: 'smk_pemesinan_frais', nama: 'Teknik Mesin Frais', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'pemesinan', kelas_min: 10, kelas_max: 12, icon: '🔩', deskripsi: 'Pemesinan frais dan CNC' },
    { subject_id: 'smk_pemesinan_gambar', nama: 'Gambar Teknik Manufaktur', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'pemesinan', kelas_min: 10, kelas_max: 12, icon: '📐', deskripsi: 'Gambar teknik manufaktur' },

    // SMK Kejuruan - Teknik Pengelasan
    { subject_id: 'smk_pengelasan_smaw', nama: 'Pengelasan SMAW', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'pengelasan', kelas_min: 10, kelas_max: 12, icon: '🔥', deskripsi: 'Las busur elektroda terbungkus' },
    { subject_id: 'smk_pengelasan_gmaw', nama: 'Pengelasan GMAW & GTAW', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'pengelasan', kelas_min: 10, kelas_max: 12, icon: '🛠️', deskripsi: 'Las MIG/TIG' },
    { subject_id: 'smk_pengelasan_inspeksi', nama: 'Inspeksi & Pengujian Las', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'pengelasan', kelas_min: 10, kelas_max: 12, icon: '🔍', deskripsi: 'Inspeksi hasil pengelasan' },

    // SMK Kejuruan - Teknik Ototronik
    { subject_id: 'smk_otoronik_ecu', nama: 'Sistem ECU & Injeksi', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'otoronik', kelas_min: 10, kelas_max: 12, icon: '💻', deskripsi: 'Engine control unit dan injeksi' },
    { subject_id: 'smk_otoronik_sensor', nama: 'Sensor & Aktuator', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'otoronik', kelas_min: 10, kelas_max: 12, icon: '📡', deskripsi: 'Sensor dan aktuator otomotif' },
    { subject_id: 'smk_otoronik_diagnostik', nama: 'Diagnostik Elektronik', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'otoronik', kelas_min: 10, kelas_max: 12, icon: '🧰', deskripsi: 'Diagnostik sistem elektronik kendaraan' },

    // SMK Kejuruan - Teknik Sepeda Motor
    { subject_id: 'smk_tsm_mesin', nama: 'Mesin Sepeda Motor', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'tsm', kelas_min: 10, kelas_max: 12, icon: '🏍️', deskripsi: 'Mesin dan komponen sepeda motor' },
    { subject_id: 'smk_tsm_kelistrikan', nama: 'Kelistrikan Sepeda Motor', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'tsm', kelas_min: 10, kelas_max: 12, icon: '⚡', deskripsi: 'Sistem kelistrikan sepeda motor' },
    { subject_id: 'smk_tsm_tuneup', nama: 'Perawatan & Tune Up', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'tsm', kelas_min: 10, kelas_max: 12, icon: '🔧', deskripsi: 'Perawatan berkala dan tune up' },

    // SMK Kejuruan - Konstruksi dan Perumahan
    { subject_id: 'smk_tkp_struktur', nama: 'Struktur Bangunan', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'tkp', kelas_min: 10, kelas_max: 12, icon: '🏗️', deskripsi: 'Struktur bangunan gedung' },
    { subject_id: 'smk_tkp_gambar', nama: 'Gambar Bangunan', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'tkp', kelas_min: 10, kelas_max: 12, icon: '📐', deskripsi: 'Gambar teknik bangunan' },
    { subject_id: 'smk_tkp_rab', nama: 'RAB & Manajemen Proyek', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'tkp', kelas_min: 10, kelas_max: 12, icon: '📋', deskripsi: 'Rencana anggaran biaya konstruksi' },

    // SMK Kejuruan - Desain Interior dan Teknik Furnitur
    { subject_id: 'smk_ditf_interior', nama: 'Desain Interior', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'ditf', kelas_min: 10, kelas_max: 12, icon: '🛋️', deskripsi: 'Perancangan interior' },
    { subject_id: 'smk_ditf_furnitur', nama: 'Teknik Furnitur', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'ditf', kelas_min: 10, kelas_max: 12, icon: '🪑', deskripsi: 'Produksi furnitur' },
    { subject_id: 'smk_ditf_gambar', nama: 'Gambar Interior & Perspektif', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'ditf', kelas_min: 10, kelas_max: 12, icon: '✏️', deskripsi: 'Gambar interior dan presentasi desain' },

    // SMK Kejuruan - Teknik Geomatika
    { subject_id: 'smk_geomatika_ukur', nama: 'Pengukuran Tanah', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'geomatika', kelas_min: 10, kelas_max: 12, icon: '📏', deskripsi: 'Ilmu ukur tanah' },
    { subject_id: 'smk_geomatika_peta', nama: 'Pemetaan Digital', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'geomatika', kelas_min: 10, kelas_max: 12, icon: '🗺️', deskripsi: 'Pemetaan digital dan kartografi' },
    { subject_id: 'smk_geomatika_gis', nama: 'Sistem Informasi Geografis', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'geomatika', kelas_min: 10, kelas_max: 12, icon: '🛰️', deskripsi: 'GIS dan penginderaan jauh' },

    // SMK Kejuruan - Teknik Alat Berat
    { subject_id: 'smk_tab_mesin', nama: 'Mesin Diesel Alat Berat', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'tab', kelas_min: 10, kelas_max: 12, icon: '🚜', deskripsi: 'Mesin diesel alat berat' },
    { subject_id: 'smk_tab_hidrolik', nama: 'Sistem Hidrolik', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'tab', kelas_min: 10, kelas_max: 12, icon: '🛢️', deskripsi: 'Sistem hidrolik alat berat' },
    { subject_id: 'smk_tab_perawatan', nama: 'Pemeliharaan Alat Berat', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'tab', kelas_min: 10, kelas_max: 12, icon: '🔧', deskripsi: 'Pemeliharaan dan perbaikan alat berat' },

    // SMK Kejuruan - Teknik Mekatronika
    { subject_id: 'smk_mekatronika_plc', nama: 'Kontrol PLC', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'mekatronika', kelas_min: 10, kelas_max: 12, icon: '🤖', deskripsi: 'Pemrograman PLC industri' },
    { subject_id: 'smk_mekatronika_robotik', nama: 'Robotika Industri', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'mekatronika', kelas_min: 10, kelas_max: 12, icon: '🦾', deskripsi: 'Robotika dan otomasi' },
    { subject_id: 'smk_mekatronika_pneumatik', nama: 'Pneumatik & Hidrolik', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'mekatronika', kelas_min: 10, kelas_max: 12, icon: '💨', deskripsi: 'Sistem pneumatik dan hidrolik' },

    // SMK Kejuruan - Teknik Elektronika Industri
    { subject_id: 'smk_tei_kontrol', nama: 'Sistem Kontrol Industri', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'tei', kelas_min: 10, kelas_max: 12, icon: '🎛️', deskripsi: 'Sistem kontrol dan otomasi industri' },
    { subject_id: 'smk_tei_instrumentasi', nama: 'Instrumentasi Industri', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'tei', kelas_min: 10, kelas_max: 12, icon: '📟', deskripsi: 'Instrumentasi dan pengukuran' },
    { subject_id: 'smk_tei_power', nama: 'Elektronika Daya', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'tei', kelas_min: 10, kelas_max: 12, icon: '🔌', deskripsi: 'Elektronika daya dan konverter' },

    // SMK Kejuruan - Teknik Audio Video
    { subject_id: 'smk_tav_audio', nama: 'Teknik Audio', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'tav', kelas_min: 10, kelas_max: 12, icon: '🔊', deskripsi: 'Sistem audio dan akustik' },
    { subject_id: 'smk_tav_video', nama: 'Teknik Video', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'tav', kelas_min: 10, kelas_max: 12, icon: '📹', deskripsi: 'Peralatan dan sistem video' },
    { subject_id: 'smk_tav_siaran', nama: 'Teknik Siaran', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'tav', kelas_min: 10, kelas_max: 12, icon: '📺', deskripsi: 'Teknik penyiaran radio dan televisi' },

    // SMK Kejuruan - Teknik Kimia Industri
    { subject_id: 'smk_tki_proses', nama: 'Proses Kimia Industri', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'tki', kelas_min: 10, kelas_max: 12, icon: '🏭', deskripsi: 'Proses industri kimia' },
    { subject_id: 'smk_tki_analisis', nama: 'Analisis Laboratorium', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'tki', kelas_min: 10, kelas_max: 12, icon: '🧪', deskripsi: 'Analisis kimia laboratorium' },
    { subject_id: 'smk_tki_k3', nama: 'K3 & Keselamatan Proses', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'tki', kelas_min: 10, kelas_max: 12, icon: '🦺', deskripsi: 'Keselamatan dan kesehatan kerja kimia' },

    // SMK Kejuruan - Teknik Energi Terbarukan
    { subject_id: 'smk_tet_surya', nama: 'Pembangkit Listrik Tenaga Surya', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'tet', kelas_min: 10, kelas_max: 12, icon: '☀️', deskripsi: 'PLTS dan panel surya' },
    { subject_id: 'smk_tet_angin', nama: 'Pembangkit Listrik Tenaga Angin', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'tet', kelas_min: 10, kelas_max: 12, icon: '🌬️', deskripsi: 'PLTB dan turbin angin' },
    { subject_id: 'smk_tet_bioenergi', nama: 'Bioenergi & Biomassa', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'tet', kelas_min: 10, kelas_max: 12, icon: '🌿', deskripsi: 'Bioenergi dan biomassa' },

    // SMK Kejuruan - Tata Kecantikan dan Hairdressing
    { subject_id: 'smk_kecantikan_skin', nama: 'Perawatan Kulit & Wajah', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'tata_kecantikan', kelas_min: 10, kelas_max: 12, icon: '🧖', deskripsi: 'Perawatan kulit dan wajah' },
    { subject_id: 'smk_kecantikan_rambut', nama: 'Hair Dressing', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'tata_kecantikan', kelas_min: 10, kelas_max: 12, icon: '💇', deskripsi: 'Penataan dan perawatan rambut' },
    { subject_id: 'smk_kecantikan_rias', nama: 'Tata Rias', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'tata_kecantikan', kelas_min: 10, kelas_max: 12, icon: '💄', deskripsi: 'Tata rias wajah dan panggung' },

    // SMK Kejuruan - Usaha Perjalanan Wisata
    { subject_id: 'smk_upw_destinasi', nama: 'Destinasi Wisata', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'upw', kelas_min: 10, kelas_max: 12, icon: '🏝️', deskripsi: 'Pengetahuan destinasi wisata' },
    { subject_id: 'smk_upw_ticketing', nama: 'Ticketing & Reservasi', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'upw', kelas_min: 10, kelas_max: 12, icon: '🎫', deskripsi: 'Ticketing dan reservasi perjalanan' },
    { subject_id: 'smk_upw_pemandu', nama: 'Kepemanduan Wisata', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'upw', kelas_min: 10, kelas_max: 12, icon: '🧭', deskripsi: 'Pemanduan dan pengelolaan wisata' },

    // SMK Kejuruan - Seni Pertunjukan
    { subject_id: 'smk_seni_karawitan', nama: 'Seni Karawitan', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'seni_pertunjukan', kelas_min: 10, kelas_max: 12, icon: '🎵', deskripsi: 'Karawitan dan gamelan' },
    { subject_id: 'smk_seni_tari', nama: 'Seni Tari', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'seni_pertunjukan', kelas_min: 10, kelas_max: 12, icon: '💃', deskripsi: 'Seni tari tradisional dan modern' },
    { subject_id: 'smk_seni_teater', nama: 'Seni Teater & Musik', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'seni_pertunjukan', kelas_min: 10, kelas_max: 12, icon: '🎭', deskripsi: 'Teater dan musik pertunjukan' },

    // SMK Kejuruan - Animasi
    { subject_id: 'smk_animasi_2d', nama: 'Animasi 2D', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'animasi', kelas_min: 10, kelas_max: 12, icon: '🎞️', deskripsi: 'Produksi animasi 2D' },
    { subject_id: 'smk_animasi_3d', nama: 'Animasi 3D', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'animasi', kelas_min: 10, kelas_max: 12, icon: '🧊', deskripsi: 'Pemodelan dan animasi 3D' },
    { subject_id: 'smk_animasi_storyboard', nama: 'Storyboard & Sinematografi Animasi', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'animasi', kelas_min: 10, kelas_max: 12, icon: '🎬', deskripsi: 'Storyboard dan alur cerita animasi' },

    // SMK Kejuruan - Broadcasting dan Perfilman
    { subject_id: 'smk_broadcasting_produksi', nama: 'Produksi Program TV', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'broadcasting', kelas_min: 10, kelas_max: 12, icon: '📡', deskripsi: 'Produksi program televisi' },
    { subject_id: 'smk_broadcasting_film', nama: 'Produksi Film', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'broadcasting', kelas_min: 10, kelas_max: 12, icon: '🎥', deskripsi: 'Produksi film dan sinematografi' },
    { subject_id: 'smk_broadcasting_penyiaran', nama: 'Teknik Penyiaran', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'broadcasting', kelas_min: 10, kelas_max: 12, icon: '🎙️', deskripsi: 'Teknik penyiaran radio dan TV' },

    // SMK Kejuruan - Kehutanan
    { subject_id: 'smk_kehutanan_budidaya', nama: 'Budidaya Hutan', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'kehutanan', kelas_min: 10, kelas_max: 12, icon: '🌲', deskripsi: 'Budidaya tanaman hutan' },
    { subject_id: 'smk_kehutanan_konservasi', nama: 'Konservasi Sumber Daya Hutan', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'kehutanan', kelas_min: 10, kelas_max: 12, icon: '🐒', deskripsi: 'Konservasi hutan dan satwa' },
    { subject_id: 'smk_kehutanan_hasil', nama: 'Hasil Hutan', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'kehutanan', kelas_min: 10, kelas_max: 12, icon: '🪵', deskripsi: 'Pemanfaatan hasil hutan' },

    // SMK Kejuruan - Agribisnis Ternak
    { subject_id: 'smk_ternak_ruminansia', nama: 'Ternak Ruminansia', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'ternak', kelas_min: 10, kelas_max: 12, icon: '🐄', deskripsi: 'Budidaya ternak ruminansia' },
    { subject_id: 'smk_ternak_unggas', nama: 'Ternak Unggas', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'ternak', kelas_min: 10, kelas_max: 12, icon: '🐔', deskripsi: 'Budidaya ternak unggas' },
    { subject_id: 'smk_ternak_kesehatan', nama: 'Kesehatan Hewan', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'ternak', kelas_min: 10, kelas_max: 12, icon: '🩺', deskripsi: 'Kesehatan dan sanitasi ternak' },

    // SMK Kejuruan - Agribisnis Perikanan & NKPI
    { subject_id: 'smk_perikanan_akua', nama: 'Akuakultur', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'perikanan', kelas_min: 10, kelas_max: 12, icon: '🐟', deskripsi: 'Budidaya perairan' },
    { subject_id: 'smk_perikanan_tangkap', nama: 'Teknologi Penangkapan Ikan', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'perikanan', kelas_min: 10, kelas_max: 12, icon: '🎣', deskripsi: 'Teknologi penangkapan ikan' },
    { subject_id: 'smk_perikanan_nautika', nama: 'Nautika Kapal Penangkap Ikan', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'perikanan', kelas_min: 10, kelas_max: 12, icon: '⚓', deskripsi: 'Nautika kapal penangkap ikan' },

    // SMK Kejuruan - Teknologi Pengolahan Hasil Pertanian
    { subject_id: 'smk_tphp_produksi', nama: 'Pengolahan Hasil Pertanian', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'tphp', kelas_min: 10, kelas_max: 12, icon: '🏭', deskripsi: 'Teknologi pengolahan hasil pertanian' },
    { subject_id: 'smk_tphp_mutu', nama: 'Mutu & Keamanan Pangan', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'tphp', kelas_min: 10, kelas_max: 12, icon: '🔬', deskripsi: 'Mutu dan keamanan pangan' },
    { subject_id: 'smk_tphp_kemasan', nama: 'Pengemasan & Penyimpanan', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'tphp', kelas_min: 10, kelas_max: 12, icon: '📦', deskripsi: 'Pengemasan dan penyimpanan hasil' },

    // SMK Kejuruan - Logistik
    { subject_id: 'smk_logistik_gudang', nama: 'Manajemen Pergudangan', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'logistik', kelas_min: 10, kelas_max: 12, icon: '🏬', deskripsi: 'Manajemen pergudangan' },
    { subject_id: 'smk_logistik_rantai', nama: 'Manajemen Rantai Pasok', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'logistik', kelas_min: 10, kelas_max: 12, icon: '🔗', deskripsi: 'Supply chain management' },
    { subject_id: 'smk_logistik_distribusi', nama: 'Transportasi & Distribusi', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'logistik', kelas_min: 10, kelas_max: 12, icon: '🚚', deskripsi: 'Transportasi dan distribusi barang' },

    // SMK Kejuruan - Teknologi Laboratorium Medik
    { subject_id: 'smk_tlm_hematologi', nama: 'Hematologi', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'tlm', kelas_min: 10, kelas_max: 12, icon: '🩸', deskripsi: 'Pemeriksaan hematologi' },
    { subject_id: 'smk_tlm_mikrobiologi', nama: 'Mikrobiologi Klinik', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'tlm', kelas_min: 10, kelas_max: 12, icon: '🦠', deskripsi: 'Mikrobiologi klinik' },
    { subject_id: 'smk_tlm_kimia', nama: 'Kimia Klinik', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'tlm', kelas_min: 10, kelas_max: 12, icon: '🧫', deskripsi: 'Kimia klinik laboratorium' },

    // SMK Kejuruan - Keperawatan Gigi
    { subject_id: 'smk_dental_asistensi', nama: 'Asistensi Kedokteran Gigi', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'dental', kelas_min: 10, kelas_max: 12, icon: '🦷', deskripsi: 'Asistensi tindakan kedokteran gigi' },
    { subject_id: 'smk_dental_anatomi', nama: 'Anatomi Gigi & Mulut', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'dental', kelas_min: 10, kelas_max: 12, icon: '🫦', deskripsi: 'Anatomi gigi dan rongga mulut' },
    { subject_id: 'smk_dental_preventif', nama: 'Perawatan Gigi Preventif', jenjang: 'smk', kategori: 'kejuruan', jurusan: 'dental', kelas_min: 10, kelas_max: 12, icon: '🪥', deskripsi: 'Pencegahan penyakit gigi dan mulut' }
];

module.exports = SUBJECTS;
