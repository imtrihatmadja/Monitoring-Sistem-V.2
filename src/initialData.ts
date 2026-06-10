import { Project, SystemAlert } from './types';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Sistem Irigasi Pertanian Pintar (SIPP) - Kabupaten Luwu',
    code: 'SIPP-LUWU',
    department: 'Direktorat Jenderal Sumber Daya Air / Dinas PU',
    manager: 'Ir. Ahmad Subagio, M.T.',
    status: 'Sesuai Rencana',
    startDate: '2026-01-15',
    endDate: '2026-10-30',
    budget: 4200000000, // Rp 4,2 Miliar
    description: 'Modernisasi infrastruktur distribusi air pertanian menggunakan sensor debit otomatis dan pintu air mekanis pintar guna meningkatkan efisiensi penggunaan air sawah hingga 35%.',
    location: 'Kabupaten Luwu, Sulawesi Selatan',
    pic: 'Ir. Ahmad Subagio, M.T.',
    donor: 'USAID & Yayasan DFW Indonesia',
    goal: 'Modernisasi infrastruktur distribusi air pertanian menggunakan sensor debit otomatis dan pintu air mekanis pintar guna meningkatkan efisiensi penggunaan air sawah hingga 35%.',
    outcomes: [
      'Terpasangnya 15 unit sensor water level ultrasonik pintar di pintu air utama',
      'Meningkatnya keandalan pengiriman data IoT ke server pusat (SLA > 98%)',
      'Terlaksananya pelatihan literasi tata kelola air digital bagi 5 kelompok tani'
    ],
    priorityIssue: 'Rancangan Peraturan Desa (Perdes) mengenai iuran listrik pompa pintar macet karena polemik batasan tarif rumah tangga miskin.',
    budgetRealization: 3654000000,
    metrics: {
      beneficiaries: '1.250 Petani',
      events: '12 Pertemuan',
      documents: '8 Laporan',
      weight: '4.500 Kg'
    },
    activities: [
      {
        id: 'act-1-1',
        name: 'Survei Geospasial & Analisis Hidrologi',
        weight: 15,
        progress: 100,
        subActivities: [
          {
            id: 'sub-1-1-1',
            name: 'Pemetaan kontur lahan menggunakan drone & GPS RTK',
            assignedTo: 'Rian Hidayat (Geodesi)',
            progress: 100,
            status: 'Selesai',
            startDate: '2026-01-20',
            endDate: '2026-02-10'
          },
          {
            id: 'sub-1-1-2',
            name: 'Analisis debit historis sungai penyuplai Luwu',
            assignedTo: 'Siti Rahma, Ph.D.',
            progress: 100,
            status: 'Selesai',
            startDate: '2026-02-12',
            endDate: '2026-02-28'
          }
        ]
      },
      {
        id: 'act-1-2',
        name: 'Pembangunan Konstruksi Fisik & Elektronik Pintu Air',
        weight: 50,
        progress: 65,
        subActivities: [
          {
            id: 'sub-1-2-1',
            name: 'Pengecoran fondasi beton pintu air primer (2 unit)',
            assignedTo: 'Budi Hartono (Pekerjaan Sipil)',
            progress: 100,
            status: 'Selesai',
            startDate: '2026-03-05',
            endDate: '2026-04-20'
          },
          {
            id: 'sub-1-2-2',
            name: 'Instalasi motor servo penggerak pintu mekanis',
            assignedTo: 'Arief Budiman (Teknik Elektro)',
            progress: 70,
            status: 'Dalam Proses',
            startDate: '2026-04-22',
            endDate: '2026-06-15'
          },
          {
            id: 'sub-1-2-3',
            name: 'Pemasangan sensor water level ultrasonik (15 titik)',
            assignedTo: 'Hendra Wijaya (Mekatronik)',
            progress: 25,
            status: 'Dalam Proses',
            startDate: '2026-05-10',
            endDate: '2026-07-05'
          }
        ]
      },
      {
        id: 'act-1-3',
        name: 'Pengembangan Dasbor IoT & Pelatihan Kelompok Tani',
        weight: 35,
        progress: 30,
        subActivities: [
          {
            id: 'sub-1-3-1',
            name: 'Integrasi firmware pemancar LoRaWAN ke server pemantau',
            assignedTo: 'Danang Prasetyo (Software Engineer)',
            progress: 60,
            status: 'Dalam Proses',
            startDate: '2026-04-01',
            endDate: '2026-06-30'
          },
          {
            id: 'sub-1-3-2',
            name: 'Penyusunan modul pelatihan literasi air digital',
            assignedTo: 'Dr. Endang Lestari',
            progress: 30,
            status: 'Dalam Proses',
            startDate: '2026-05-15',
            endDate: '2026-07-30'
          },
          {
            id: 'sub-1-3-3',
            name: 'Sosialisasi pengoperasian sistem sawah pintar di desa',
            assignedTo: 'Agus Santoso',
            progress: 0,
            status: 'Belum Mulai',
            startDate: '2026-08-01',
            endDate: '2026-09-15'
          }
        ]
      }
    ],
    indicators: [
      {
        id: 'ind-1-1',
        name: 'Cakupan Distribusi Aliran Air Sawah Primer',
        code: 'IND-WATER-COVER',
        description: 'Persentase total lahan sawah di wilayah sasaran yang teraliri air dari sistem hidrografik pintu air pintar secara merata.',
        unit: '%',
        target: 95,
        currentAchievement: 88,
        thresholdAlert: 85, // Warning if drops below 85%
        lastUpdated: '2026-06-05',
        history: [
          { date: 'Jan 2026', achievement: 45, target: 45 },
          { date: 'Feb 2026', achievement: 50, target: 55 },
          { date: 'Mar 2026', achievement: 68, target: 70 },
          { date: 'Apr 2026', achievement: 75, target: 75 },
          { date: 'May 2026', achievement: 82, target: 82 },
          { date: 'Jun 2026', achievement: 88, target: 88 }
        ]
      },
      {
        id: 'ind-1-2',
        name: 'Keandalan Pengiriman Data Sensor Air (SLA)',
        code: 'IND-IOT-SLA',
        description: 'Akurasi dan ketersediaan sinyal pengriman data IoT dari sensor level air ke dasbor pusat dalam 24 jam.',
        unit: '%',
        target: 98,
        currentAchievement: 92,
        thresholdAlert: 90,
        lastUpdated: '2026-06-07',
        history: [
          { date: 'Jan 2026', achievement: 99, target: 95 },
          { date: 'Feb 2026', achievement: 98, target: 95 },
          { date: 'Mar 2026', achievement: 95, target: 96 },
          { date: 'Apr 2026', achievement: 94, target: 97 },
          { date: 'May 2026', achievement: 93, target: 98 },
          { date: 'Jun 2026', achievement: 92, target: 98 } // drops below target of 98, warning! but still above threshold 90
        ]
      },
      {
        id: 'ind-1-3',
        name: 'Efisiensi Konsumsi Air Sawah',
        code: 'IND-WATER-SAVINGS',
        description: 'Tingkat penghematan debit air irigasi yang disalurkan dibanding dengan metode sawah konvensional tanpa pintu ukur.',
        unit: '%',
        target: 35,
        currentAchievement: 28,
        thresholdAlert: 30, // Drop below 30 is critical (current is 28, so this is actively triggering an alert!)
        lastUpdated: '2026-06-08',
        history: [
          { date: 'Jan 2026', achievement: 10, target: 10 },
          { date: 'Feb 2026', achievement: 12, target: 15 },
          { date: 'Mar 2026', achievement: 18, target: 20 },
          { date: 'Apr 2026', achievement: 22, target: 25 },
          { date: 'May 2026', achievement: 31, target: 30 },
          { date: 'Jun 2026', achievement: 28, target: 32 } // ACTIVE WARNING
        ]
      }
    ],
    lessonsLearned: [
      {
        id: 'll-1-1',
        date: '2026-03-10',
        category: 'Kemitraan',
        title: 'Keterlibatan Perempuan dalam Komite Air meningkatkan Resolusi Konflik',
        description: 'Awalnya pengelolaan irigasi dinilai bias gender karena didominasi laki-laki, yang menyebabkan jadwal aliran sawah kurang berpihak pada tanaman sayuran pekarangan garapan perempuan.',
        recommendation: 'Direkomendasikan adanya kuota kepengurusan minimal 30% perempuan pada kelompok P3A (Perkumpulan Petani Pemakai Air).',
        contributor: 'Andi Nurhaliza (Field Coordinator)'
      },
      {
        id: 'll-1-2',
        date: '2026-05-18',
        category: 'Teknis',
        title: 'Adaptasi Pemancar LoRa di Topografi Kabupaten Luwu',
        description: 'Sensor yang dipasang di bawah cekungan tebing sering terputus akibat hambatan topografi karst.',
        recommendation: 'Memanfaatkan titik tertinggi masjid desa sebagai penempatan repeater gateway.',
        contributor: 'Danang Prasetyo (IoT Engineer)'
      }
    ],
    currentIssues: [
      {
        id: 'iss-1-1',
        date: '2026-06-05',
        severity: 'Sedang',
        category: 'Regulasi',
        headline: 'Penundaan Regulasi Desa mengenai Tarif Air',
        description: 'Rancangan Peraturan Desa (Perdes) mengenai iuran listrik pompa pintar macet karena polemik batasan tarif rumah tangga miskin.',
        mitigation: 'NGO memfasilitasi dialog tripartit antara Badan Permusyawaratan Desa (BPD), Kepala Desa, dan perwakilan petani miskin.',
        status: 'Aktif'
      }
    ]
  },
  {
    id: 'proj-2',
    name: 'Restorasi & Konservasi Sabuk Hijau Mangrove Pesisir',
    code: 'MANGROVE-RES',
    department: 'Masyarakat Kelautan & DFW Indonesia (Yayasan)',
    manager: 'Dian Permatasari, M.Si.',
    status: 'Beresiko',
    startDate: '2026-02-01',
    endDate: '2026-12-15',
    budget: 1850000000, // Rp 1,85 Miliar
    description: 'Rehabilitasi 50 Hektare lahan kritis pesisir pantai utara Jawa dari ancaman abrasi laut ekstrem melalui konsep penanaman struktur anyaman bambu penangkap sedimen (APBS) dan reboisasi pohon mangrove.',
    location: 'Semarang & Demak, Jawa Tengah',
    pic: 'Dian Permatasari, M.Si.',
    donor: 'Kementerian Kelautan & Perikanan & DFW-I',
    goal: 'Rehabilitasi 50 Hektare lahan kritis pesisir pantai utara Jawa dari ancaman abrasi laut ekstrem melalui konsep penanaman struktur anyaman bambu penangkap sedimen (APBS) dan reboisasi pohon mangrove.',
    outcomes: [
      'Reboisasi dan pemeliharaan kawasan sabuk hijau pesisir seluas 50 Hektar',
      'Pembangunan struktur anyaman bambu penangkap sedimen APBS di 4 titik rawan',
      'Pelatihan diversifikasi produk makanan olahan buah pidada oleh Koperasi Wanita Pesisir'
    ],
    priorityIssue: 'Gelombang pasang Rob merusak separuh blok pembibitan B dan anyaman bambu hancur ditabrak perahu nelayan malam hari.',
    budgetRealization: 1147000000,
    metrics: {
      beneficiaries: '850 Nelayan',
      events: '18 Event',
      documents: '4 Dokumen',
      weight: '12.000 Kg'
    },
    activities: [
      {
        id: 'act-2-1',
        name: 'Analisis Tapak, Konstruksi APBS & Pembibitan',
        weight: 30,
        progress: 90,
        subActivities: [
          {
            id: 'sub-2-1-1',
            name: 'Pengukuran gelombang laut & laju sedimentasi pesisir',
            assignedTo: 'dr. Farhan M. (Oceanographer)',
            progress: 100,
            status: 'Selesai',
            startDate: '2026-02-05',
            endDate: '2026-03-01'
          },
          {
            id: 'sub-2-1-2',
            name: 'Pemasangan struktur pemecah ombak anyaman bambu semi-permeabel',
            assignedTo: 'Kelompok Nelayan Berdikari',
            progress: 95,
            status: 'Dalam Proses',
            startDate: '2026-03-10',
            endDate: '2026-05-15'
          },
          {
            id: 'sub-2-1-3',
            name: 'Penyediaan & pemilahan 150.000 bibit Rhizophora apiculata',
            assignedTo: 'Ibu Nurbaya (Koordinator Pembibitan)',
            progress: 75,
            status: 'Dalam Proses',
            startDate: '2026-02-25',
            endDate: '2026-06-30'
          }
        ]
      },
      {
        id: 'act-2-2',
        name: 'Penanaman Mangrove Berkelompok & Pemeliharaan',
        weight: 50,
        progress: 40,
        subActivities: [
          {
            id: 'sub-2-2-1',
            name: 'Penanaman tahap I (Blok A & B - 20 Hektar)',
            assignedTo: 'Volunter Hijau Pantai',
            progress: 80,
            status: 'Dalam Proses',
            startDate: '2026-04-01',
            endDate: '2026-06-30'
          },
          {
            id: 'sub-2-2-2',
            name: 'Penanaman tahap II (Blok C & D - 30 Hektar)',
            assignedTo: 'Masyarakat Pesisir',
            progress: 10,
            status: 'Dalam Proses',
            startDate: '2026-07-01',
            endDate: '2026-10-31'
          },
          {
            id: 'sub-2-2-3',
            name: 'Pemeliharaan penyulaman/penggantian bibit mati awal',
            assignedTo: 'Sumarno (Mandor Kebun)',
            progress: 30,
            status: 'Dalam Proses',
            startDate: '2026-05-01',
            endDate: '2026-11-30'
          }
        ]
      },
      {
        id: 'act-2-3',
        name: 'Pengembangan Alternatif Mata Pencaharian Lestari',
        weight: 20,
        progress: 25,
        subActivities: [
          {
            id: 'sub-2-3-1',
            name: 'Pelatihan pembuatan sirup buah pidada & cemilan mangrove',
            assignedTo: 'Koperasi Wanita Pesisir',
            progress: 75,
            status: 'Dalam Proses',
            startDate: '2026-04-15',
            endDate: '2026-06-30'
          },
          {
            id: 'sub-2-3-2',
            name: 'Inisiasi program Ekowisata Mangrove Berbasis Komunitas',
            assignedTo: 'Dian Permatasari',
            progress: 0,
            status: 'Belum Mulai',
            startDate: '2026-08-01',
            endDate: '2026-11-15'
          }
        ]
      }
    ],
    indicators: [
      {
        id: 'ind-2-1',
        name: 'Persentase Tingkat Kehidupan (Survival Rate) Bibit',
        code: 'IND-SURVIVAL-RATE',
        description: 'Rasio bibit mangrove yang bertahan tumbuh hidup subur dan sehat setelah masa tanam 3 bulan di lapangan pasca hantaman air pasang.',
        unit: '%',
        target: 85,
        currentAchievement: 72,
        thresholdAlert: 80, // Warning jika di bawah 80%. Saat ini 72% - INI ADALAH AKTIF MONITORING ALERT!
        lastUpdated: '2026-06-03',
        history: [
          { date: 'Jan 2026', achievement: 90, target: 85 },
          { date: 'Feb 2026', achievement: 88, target: 85 },
          { date: 'Mar 2026', achievement: 84, target: 85 },
          { date: 'Apr 2026', achievement: 81, target: 85 },
          { date: 'May 2026', achievement: 77, target: 85 },
          { date: 'Jun 2026', achievement: 72, target: 85 } // ACTIVE ALERT (CRITICAL DROP)
        ]
      },
      {
        id: 'ind-2-2',
        name: 'Luas Area Mangrove Pulih Sehat',
        code: 'IND-REFOREST-HA',
        description: 'Akumulasi luasan area kritis pesisir pantai yang telah ditanami secara permanen dan terlindungi anyaman penangkap lumpur.',
        unit: 'Ha',
        target: 50,
        currentAchievement: 22,
        thresholdAlert: 20,
        lastUpdated: '2026-06-06',
        history: [
          { date: 'Jan 2026', achievement: 0, target: 0 },
          { date: 'Feb 2026', achievement: 2, target: 5 },
          { date: 'Mar 2026', achievement: 10, target: 12 },
          { date: 'Apr 2026', achievement: 15, target: 18 },
          { date: 'May 2026', achievement: 20, target: 20 },
          { date: 'Jun 2026', achievement: 22, target: 24 }
        ]
      }
    ],
    lessonsLearned: [
      {
        id: 'll-2-1',
        date: '2026-04-12',
        category: 'Eksternal',
        title: 'Anyaman Bambu APBS Sangat Rentan Hantaman Perahu Nelayan Malam Hari',
        description: 'Struktur anyaman bambu pengumpul lumpur sedimentasi beberapa kali hancur tertabrak perahu nelayan tradisional yang berjalan tanpa lampu navigasi.',
        recommendation: 'Memasang bendera merah menyala dan lampu LED panel surya sederhana di setiap ujung luar pancang APBS.',
        contributor: 'Sumarno (Mandor Lapangan)'
      },
      {
        id: 'll-2-2',
        date: '2026-05-22',
        category: 'Advokasi',
        title: 'Deklarasi Zona Lindung Bersama Kelompok Nelayan Berdikari',
        description: 'Restorasi gagal jika bibit muda terus-menerus dirusak oleh pencari cacing laut komersial di kawasan lumpur pesisir.',
        recommendation: 'Mendorong Peraturan Adat/Kesepakatan Nelayan (Sasi Pesisir) untuk menjatuhkan denda sosial bagi perusak bibit.',
        contributor: 'Dian Permatasari (Yayasan)'
      }
    ],
    currentIssues: [
      {
        id: 'iss-2-1',
        date: '2026-06-03',
        severity: 'Tinggi',
        category: 'Iklim/Alam',
        headline: 'Gelombang Pasang Pancaroba (Rob) Merusak Separuh Pembibitan Blok B',
        description: 'Salinitas air laut meningkat tajam disertai sampah plastik kiriman yang menindih bibit Rhizophora yang baru berumur 2 minggu.',
        mitigation: 'Menggalang aksi gotong-royong pembersihan sampah bersama karang taruna dan membuat pagar pelindung jaring kawat.',
        status: 'Aktif'
      },
      {
        id: 'iss-2-2',
        date: '2026-05-10',
        severity: 'Rendah',
        category: 'Media/Publik',
        headline: 'Sentimen Negatif dari Tengkulak Kepiting Bakau Lokal',
        description: 'Pengepul mengklaim restorasi menutup akses jalan tangkap kepiting mereka di bantaran muara sungai.',
        mitigation: 'Memberikan ruang edukasi bahwa hutan mangrove yang lebat justru akan melipatgandakan populasi kepiting bakau secara alami.',
        status: 'Teratasi'
      }
    ]
  },
  {
    id: 'proj-3',
    name: 'Akses Sanitasi & Sumber Air Bersih Sehat Pedesaan (SABK)',
    code: 'SABK-SAN',
    department: 'Kementerian Pekerjaan Umum RI / Cipta Karya',
    manager: 'drg. Luh Putu Citrawati, M.Kes.',
    status: 'Kritis',
    startDate: '2025-11-20',
    endDate: '2026-08-30',
    budget: 2900000000, // Rp 2,9 Miliar
    description: 'Penyediaan jaringan air bersih perpipaan komunal, tangki reservoir distrik, dan toilet sanitasi individual ramah lingkungan guna menekan penderitaan diare & stunting anak di kluster desa terpencil.',
    location: 'Kabupaten Alor, Nusa Tenggara Timur',
    pic: 'drg. Luh Putu Citrawati, M.Kes.',
    donor: 'Kemen-PUPR RI',
    goal: 'Penyediaan jaringan air bersih perpipaan komunal, tangki reservoir distrik, dan toilet sanitasi individual ramah lingkungan guna menekan penderitaan diare & stunting anak di kluster desa terpencil.',
    outcomes: [
      'Pengeboran sumur dalam (deep well) artesis 120m & pembangunan menara tangki 15K L',
      'Pemasangan jaringan pipa HDPE utama sepanjang 8 km ke pemukiman',
      'Penyediaan bilik sanitasi bio-septictank individual sebanyak 60 unit'
    ],
    priorityIssue: 'Kekeringan musiman ekstrem menurunkan debit sumur bor di bawah 1.8 L/detik.',
    budgetRealization: 2494000000,
    metrics: {
      beneficiaries: '2.100 Warga',
      events: '6 Sosialisasi',
      documents: '3 Hasil DED',
      weight: '1.8 L/S'
    },
    activities: [
      {
        id: 'act-3-1',
        name: 'Perencanaan, Pembangunan DED & Organisasi Pengelola',
        weight: 20,
        progress: 100,
        subActivities: [
          {
            id: 'sub-3-1-1',
            name: 'Penyusunan dokumen DED Gambar Teknis Jaringan Pipa',
            assignedTo: 'Ir. Samuel Nababan',
            progress: 100,
            status: 'Selesai',
            startDate: '2025-11-25',
            endDate: '2026-01-10'
          },
          {
            id: 'sub-3-1-2',
            name: 'Rapat Desa Pembentukan Badan Pengelola Air Bersih Komunal',
            assignedTo: 'Luh Putu Citrawati',
            progress: 100,
            status: 'Selesai',
            startDate: '2026-01-15',
            endDate: '2026-02-05'
          }
        ]
      },
      {
        id: 'act-3-2',
        name: 'Infrastruktur Pipa Air, Pompa & Tempat Pengolahan Utama',
        weight: 60,
        progress: 48,
        subActivities: [
          {
            id: 'sub-3-2-1',
            name: 'Pengeboran sumur dalam (deep well) artesis 120m',
            assignedTo: 'CV. Karya Abadi Geo',
            progress: 100,
            status: 'Selesai',
            startDate: '2026-02-15',
            endDate: '2026-04-10'
          },
          {
            id: 'sub-3-2-2',
            name: 'Pemasangan tangki menara penampung air baja 15.000 Liter',
            assignedTo: 'Hafiz Prasada (Sipil Air)',
            progress: 40,
            status: 'Dalam Proses',
            startDate: '2026-04-15',
            endDate: '2026-07-15'
          },
          {
            id: 'sub-3-2-3',
            name: 'Penarikan pipa HDPE utama 2 inci ke pemukiman warga (8 km)',
            assignedTo: 'CV. Global Pipa Raya',
            progress: 25,
            status: 'Dalam Proses',
            startDate: '2026-04-20',
            endDate: '2026-08-01'
          }
        ]
      },
      {
        id: 'act-3-3',
        name: 'Pembangunan MCK Sehat RT & Kampanye Higienitas',
        weight: 20,
        progress: 15,
        subActivities: [
          {
            id: 'sub-3-3-1',
            name: 'Pembangunan bilik sanitasi bio-septictank individual (60 unit)',
            assignedTo: 'Pekerja Swadaya Masyarakat',
            progress: 20,
            status: 'Dalam Proses',
            startDate: '2026-05-01',
            endDate: '2026-08-15'
          },
          {
            id: 'sub-3-3-2',
            name: 'Penyuluhan kebiasaan cuci tangan pakai sabun (CTPS) sekolah',
            assignedTo: 'Puskesmas Distrik & Saka Bakti Husada',
            progress: 0,
            status: 'Belum Mulai',
            startDate: '2026-07-10',
            endDate: '2026-08-25'
          }
        ]
      }
    ],
    indicators: [
      {
        id: 'ind-3-1',
        name: 'Rasio Rumah Tangga dengan Akses Air Bersih Layak',
        code: 'IND-WATER-WELLS',
        description: 'Persentase total kepala keluarga setempat yang mendapatkan sambungan air segar layak pakai di halaman atau dalam rumah.',
        unit: '%',
        target: 80,
        currentAchievement: 42,
        thresholdAlert: 50, // Threshold 50%, saat ini adalah 42%, Critical!
        lastUpdated: '2026-06-04',
        history: [
          { date: 'Dec 2025', achievement: 0, target: 5 },
          { date: 'Jan 2026', achievement: 10, target: 15 },
          { date: 'Feb 2026', achievement: 18, target: 25 },
          { date: 'Mar 2026', achievement: 26, target: 35 },
          { date: 'Apr 2026', achievement: 33, target: 45 },
          { date: 'May 2026', achievement: 42, target: 55 } // ACTIVE ALERTS: CURRENT 42% VS TARGET 55% & BEHIND ALERT THRESHOLD 50%
        ]
      },
      {
        id: 'ind-3-2',
        name: 'Keandalan Debit Aliran Air Berkelanjutan',
        code: 'IND-WATER-DEBIT',
        description: 'Ketersediaan debit minimal air 10 liter per personal per hari di semua keran penerima tanpa kekeringan.',
        unit: 'L/Detik',
        target: 2.5,
        currentAchievement: 1.8,
        thresholdAlert: 2.0, // Alert triggered as 1.8 is below 2.0
        lastUpdated: '2026-06-07',
        history: [
          { date: 'Jan 2026', achievement: 0, target: 2.5 },
          { date: 'Feb 2026', achievement: 2.6, target: 2.5 },
          { date: 'Mar 2026', achievement: 2.4, target: 2.5 },
          { date: 'Apr 2026', achievement: 2.1, target: 2.5 },
          { date: 'May 2026', achievement: 1.9, target: 2.5 },
          { date: 'Jun 2026', achievement: 1.8, target: 2.5 } // ACTIVE ALERT
        ]
      }
    ],
    lessonsLearned: [
      {
        id: 'll-3-1',
        date: '2026-02-28',
        category: 'Operasional',
        title: 'Biaya Solar Genset Alternatif Terlalu Tinggi untuk Skala Desa',
        description: 'Uji coba pompa menggunakan generator solar mengisap terlalu banyak anggaran iuran warga, menimbulkan keberatan sosial.',
        recommendation: 'NGO mengadvokasi Pemda untuk percepatan pemasangan sambungan listrik PLN tarif sosial khusus pompa desa.',
        contributor: 'drg. Luh Putu Citrawati'
      }
    ],
    currentIssues: [
      {
        id: 'iss-3-1',
        date: '2025-06-01',
        severity: 'Tinggi',
        category: 'Kebijakan',
        headline: 'Kekeringan Musiman Menurunkan Debit Sumur Artesis',
        description: 'Sumur pompa mengalami penurunan debit di bawah 1.8 L/detik akibat kemarau panjang El Nino.',
        mitigation: 'Pengaturan giliran buka tutup keran air antar wilayah dusun serta edukasi penghematan penggunaan air skala rumah tangga.',
        status: 'Aktif'
      }
    ]
  }
];

export const INITIAL_ALERTS: SystemAlert[] = [
  {
    id: 'alert-1',
    timestamp: '2026-06-08T07:15:30Z',
    type: 'warning',
    projectName: 'Sistem Irigasi Pertanian Pintar (SIPP) - Kabupaten Luwu',
    indicatorName: 'Efisiensi Konsumsi Air Sawah',
    message: 'Indikator "Efisiensi Konsumsi Air Sawah" turun ke 28%, di bawah target peringatan 30%.',
    currentValue: 28,
    targetValue: 30,
    unit: '%',
    read: false
  },
  {
    id: 'alert-2',
    timestamp: '2026-06-03T10:42:00Z',
    type: 'critical',
    projectName: 'Restorasi & Konservasi Sabuk Hijau Mangrove Pesisir',
    indicatorName: 'Persentase Tingkat Kehidupan (Survival Rate) Bibit',
    message: 'Tingkat kehidupan kelulushidupan bibit mangrove merosot tajam ke 72%, terlampau jauh di bawah target 80% akibat peningkatan salinitas air laut.',
    currentValue: 72,
    targetValue: 80,
    unit: '%',
    read: false
  },
  {
    id: 'alert-3',
    timestamp: '2026-06-04T12:05:12Z',
    type: 'critical',
    projectName: 'Akses Sanitasi & Sumber Air Bersih Sehat Pedesaan (SABK)',
    indicatorName: 'Rasio Rumah Tangga dengan Akses Air Bersih Layak',
    message: 'Akses air bersih pedesaan baru menyentuh 42%. Indikator ini tertinggal jauh di bawah batas target aman triwulan 50%.',
    currentValue: 42,
    targetValue: 50,
    unit: '%',
    read: false
  },
  {
    id: 'alert-4',
    timestamp: '2026-06-07T14:22:05Z',
    type: 'warning',
    projectName: 'Akses Sanitasi & Sumber Air Bersih Sehat Pedesaan (SABK)',
    indicatorName: 'Keandalan Debit Aliran Air Berkelanjutan',
    message: 'Keandalan debit air berkelanjutan menurun ke 1.8 L/Detik, di bawah target operasional minimal 2.0 L/Detik.',
    currentValue: 1.8,
    targetValue: 2.0,
    unit: 'L/Detik',
    read: false
  }
];
