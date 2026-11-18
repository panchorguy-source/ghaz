export interface NavLinkItem {
  label: string;
  href: string;
}

export interface ParentConcernItem {
  id: string;
  index: string;
  title: string;
  description: string;
  actionLabel: string;
  href: string;
  iconKey: 'funding' | 'career' | 'recognition' | 'hostel' | 'relevance';
}

export type ProgrammeCategory = 'tvet' | 'diploma';

export interface ProgrammeItem {
  id: string;
  category: ProgrammeCategory;
  categoryLabel: string;
  accreditationTrack: string;
  title: string;
  summary: string;
  image: string;
  imageAlt: string;
}

export interface ReassurancePillar {
  index: string;
  title: string;
  detail: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const WHATSAPP_URL =
  'https://wa.me/60126618932?text=saya%20berminat%20untuk%20mengetahui%20maklumat%20lanjut%20berkenaan%20program%20logistic.';

export const GIS_CONTACT = {
  institutionName: 'Global Institute of Studies (GIS)',
  shortName: 'GIS Nilai',
  whatsappDisplay: '012-6618932',
  whatsappInternational: '60126618932',
  phoneDisplay: '06-850 0688',
  phoneHref: 'tel:+6068500688',
  email: 'info@gis.edu.my',
  website: 'https://www.gis.edu.my/bm/',
  location: 'Putra Point, Nilai, Negeri Sembilan',
};

export const HERO_IMAGE = '/src/assets/images/hero_gis_students_1794984187300.jpg';

export const NAV_LINKS: NavLinkItem[] = [
  {label: 'Utama', href: '#utama'},
  {label: 'Kelebihan GIS', href: '#kelebihan'},
  {label: 'Program', href: '#program'},
  {label: 'Soalan Lazim', href: '#soalan-lazim'},
  {label: 'Hubungi', href: '#hubungi'},
];

export const HERO_CONTENT = {
  eyebrow: 'Pilihan Lepasan SPM · Nilai, Negeri Sembilan',
  headline: 'Masa depan anak anda bermula di sini.',
  supportCopy:
    'Terokai laluan TVET, SKM dan Diploma yang menggabungkan pembelajaran praktikal, panduan pengajian dan persediaan ke dunia kerjaya.',
  primaryCta: 'Dapatkan Maklumat Program',
  secondaryCta: 'WhatsApp Penasihat GIS',
  credibilityPoints: [
    'Laluan TVET/SKM & Diploma',
    'Bantuan Pembiayaan Mengikut Kelayakan',
    'Khidmat Nasihat Pengajian',
  ],
};

export const PARENT_CONCERNS: ParentConcernItem[] = [
  {
    id: 'pembiayaan',
    index: '01',
    title: 'Bantuan Pembiayaan',
    description:
      'Semak pilihan bantuan pembiayaan atau pinjaman mengikut program dan kelayakan pelajar sebelum memohon.',
    actionLabel: 'Semak kelayakan',
    href: '#daftar',
    iconKey: 'funding',
  },
  {
    id: 'kerjaya',
    index: '02',
    title: 'Peluang Kerjaya',
    description:
      'Pembelajaran amali, pendedahan industri dan panduan menuju kerjaya selepas tamat pengajian.',
    actionLabel: 'Lihat sokongan',
    href: '#kelebihan',
    iconKey: 'career',
  },
  {
    id: 'pengiktirafan',
    index: '03',
    title: 'Program Diiktiraf',
    description:
      'Semak status JPK/SKM bagi laluan kemahiran atau akreditasi MQA bagi program diploma pilihan.',
    actionLabel: 'Baca penjelasan',
    href: '#soalan-lazim',
    iconKey: 'recognition',
  },
  {
    id: 'penginapan',
    index: '04',
    title: 'Penginapan Pelajar',
    description:
      'Bantuan penginapan melalui pihak GIS disediakan tertakluk kepada ketersediaan, kadar dan syarat semasa.',
    actionLabel: 'Tanya ketersediaan',
    href: '#daftar',
    iconKey: 'hostel',
  },
  {
    id: 'relevan',
    index: '05',
    title: 'Kursus Relevan',
    description:
      'Bidang kemahiran teknikal dan diploma yang disusun mengikut minat pelajar serta keperluan pekerjaan.',
    actionLabel: 'Terokai program',
    href: '#program',
    iconKey: 'relevance',
  },
];

export const PROGRAMMES: ProgrammeItem[] = [
  {
    id: 'tvet-automotif',
    category: 'tvet',
    categoryLabel: 'TVET / Sijil Kemahiran (SKM)',
    accreditationTrack: 'Laluan JPK / SKM (Draf)',
    title: 'Teknologi Automotif',
    summary:
      'Latihan amali penyelenggaraan enjin, sistem diagnostik kenderaan dan asas servis bengkel secara berstruktur.',
    image: '/src/assets/images/prog_automotif_1794984186371.jpg',
    imageAlt: 'Pelajar kemahiran memeriksa enjin kenderaan dengan peranti diagnostik di bengkel automotif',
  },
  {
    id: 'tvet-kimpalan',
    category: 'tvet',
    categoryLabel: 'TVET / Sijil Kemahiran (SKM)',
    accreditationTrack: 'Laluan JPK / SKM (Draf)',
    title: 'Teknologi Kimpalan',
    summary:
      'Kemahiran fabrikasi logam, teknik kimpalan industri dan pematuhan keselamatan bengkel untuk bidang teknikal.',
    image: '/src/assets/images/prog_kimpalan_1794984186010.jpg',
    imageAlt: 'Pelajar teknikal memakai kelengkapan keselamatan di bengkel kimpalan',
  },
  {
    id: 'tvet-kulinari',
    category: 'tvet',
    categoryLabel: 'TVET / Sijil Kemahiran (SKM)',
    accreditationTrack: 'Laluan JPK / SKM (Draf)',
    title: 'Seni Kulinari',
    summary:
      'Asas penyediaan makanan komersial, kebersihan dapur, pengurusan bahan dan kemahiran kulinari praktikal.',
    image: '/src/assets/images/prog_kulinari_1794984189121.jpg',
    imageAlt: 'Pelajar kulinari menyediakan hidangan di dapur latihan yang bersih',
  },
  {
    id: 'tvet-awal-kanak',
    category: 'tvet',
    categoryLabel: 'TVET / Sijil Kemahiran (SKM)',
    accreditationTrack: 'Laluan JPK / SKM (Draf)',
    title: 'Pendidikan Awal Kanak-kanak',
    summary:
      'Latihan praktikal penjagaan, aktiviti perkembangan asas dan pengurusan persekitaran kanak-kanak prasekolah.',
    image: '/src/assets/images/prog_awal_kanak_1794984188582.jpg',
    imageAlt: 'Pelatih pendidikan awal kanak-kanak menyusun bahan pembelajaran di bilik darjah',
  },
  {
    id: 'diploma-logistik',
    category: 'diploma',
    categoryLabel: 'Program Diploma',
    accreditationTrack: 'Laluan Diploma / MQA (Draf)',
    title: 'Pengurusan Logistik & Pengangkutan',
    summary:
      'Mempelajari operasi rantaian bekalan, pengurusan gudang, perancangan pengangkutan serta dokumentasi kargo.',
    image: '/src/assets/images/prog_logistik_maritim_1794984189707.jpg',
    imageAlt: 'Pelajar diploma menyemak dokumen operasi logistik dan kontena pelabuhan',
  },
  {
    id: 'diploma-maritim',
    category: 'diploma',
    categoryLabel: 'Program Diploma',
    accreditationTrack: 'Laluan Diploma / MQA (Draf)',
    title: 'Pengurusan Maritim',
    summary:
      'Pendedahan kepada operasi pelabuhan, perkapalan komersial, logistik laut dan pentadbiran sektor maritim.',
    image: '/src/assets/images/prog_logistik_maritim_1794984189707.jpg',
    imageAlt: 'Pelajar pengurusan maritim meneliti operasi pelabuhan dan perkapalan',
  },
  {
    id: 'diploma-kulinari',
    category: 'diploma',
    categoryLabel: 'Program Diploma',
    accreditationTrack: 'Laluan Diploma / MQA (Draf)',
    title: 'Seni Kulinari',
    summary:
      'Gabungan kemahiran dapur profesional, kawalan kos makanan, keselamatan makanan dan pengurusan operasi hospitaliti.',
    image: '/src/assets/images/prog_kulinari_1794984189121.jpg',
    imageAlt: 'Pelajar diploma seni kulinari berlatih di dapur latihan komersial',
  },
  {
    id: 'diploma-automotif',
    category: 'diploma',
    categoryLabel: 'Program Diploma',
    accreditationTrack: 'Laluan Diploma / MQA (Draf)',
    title: 'Pengurusan Automotif',
    summary:
      'Menghubungkan kefahaman teknikal automotif dengan pengurusan pusat servis, khidmat pelanggan dan operasi bengkel.',
    image: '/src/assets/images/prog_automotif_1794984186371.jpg',
    imageAlt: 'Pelajar pengurusan automotif menilai sistem diagnostik kenderaan moden',
  },
  {
    id: 'diploma-prasekolah',
    category: 'diploma',
    categoryLabel: 'Program Diploma',
    accreditationTrack: 'Laluan Diploma / MQA (Draf)',
    title: 'Pendidikan Prasekolah',
    summary:
      'Kurikulum pedagogi awal kanak-kanak, psikologi perkembangan, perancangan pengajaran dan pengurusan tadika.',
    image: '/src/assets/images/prog_awal_kanak_1794984188582.jpg',
    imageAlt: 'Pelajar pendidikan prasekolah membimbing aktiviti pembelajaran kanak-kanak',
  },
  {
    id: 'diploma-perniagaan',
    category: 'diploma',
    categoryLabel: 'Program Diploma',
    accreditationTrack: 'Laluan Diploma / MQA (Draf)',
    title: 'Pentadbiran Perniagaan',
    summary:
      'Asas pengurusan organisasi, perakaunan permulaan, pemasaran, komunikasi pejabat dan pentadbiran perniagaan.',
    image: '/src/assets/images/prog_perniagaan_1794984189256.jpg',
    imageAlt: 'Pelajar pentadbiran perniagaan berbincang dalam kumpulan di bilik seminar',
  },
];

export const REASSURANCE_PILLARS: ReassurancePillar[] = [
  {
    index: '01',
    title: 'Pendekatan Amali dan Kemahiran Sebenar',
    detail:
      'Pengajaran menekankan latihan praktikal di bengkel, dapur atau bilik simulasi supaya pelajar membina keyakinan kerja sebelum melangkah ke industri.',
  },
  {
    index: '02',
    title: 'Penerangan Jelas Syarat Pembiayaan Sebelum Memohon',
    detail:
      'Penasihat pengajian menerangkan pilihan pinjaman atau bantuan kewangan mengikut program serta kelayakan pelajar secara telus tanpa janji kelulusan automatik.',
  },
  {
    index: '03',
    title: 'Semakan Pengiktirafan & Pemilihan Laluan Tepat',
    detail:
      'Kami membezakan dengan jelas antara laluan Sijil Kemahiran Malaysia (JPK/SKM) dengan laluan Diploma (MQA) agar ibu bapa dapat menyemak status program sebelum membuat keputusan.',
  },
  {
    index: '04',
    title: 'Sokongan Pendedahan Industri & Panduan Kerjaya',
    detail:
      'Pelajar dibimbing melalui persediaan latihan industri, penulisan resume dan jaringan rakan industri — tanpa sebarang dakwaan jaminan pekerjaan atau gaji tetap.',
  },
  {
    index: '05',
    title: 'Bantuan Pertanyaan Asrama dan Penempatan Pelajar',
    detail:
      'Bagi keluarga dari luar kawasan Nilai, pasukan kami membantu menyemak pilihan penginapan berhampiran kampus tertakluk kepada ketersediaan, kadar dan syarat semasa.',
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-pengiktirafan',
    question: 'Adakah semua program GIS diiktiraf?',
    answer:
      'Status pengiktirafan adalah khusus mengikut setiap program. Program TVET/SKM berada di bawah laluan Jabatan Pembangunan Kemahiran (JPK), manakala program Diploma tertakluk kepada akreditasi Agensi Kelayakan Malaysia (MQA). Ibu bapa digalakkan menyemak status akreditasi semasa bagi program tertentu bersama penasihat GIS sebelum pendaftaran rasmi.',
  },
  {
    id: 'faq-pembiayaan',
    question: 'Bolehkah anak saya memohon pinjaman atau bantuan kewangan?',
    answer:
      'Kemudahan bantuan pembiayaan atau pinjaman pendidikan (seperti skim berkaitan mengikut laluan kemahiran atau diploma) bergantung kepada program yang dipilih serta kelayakan pemohon dan penjamin. Penasihat GIS akan membantu menerangkan pilihan yang tersedia mengikut keputusan dan kelayakan anak anda.',
  },
  {
    id: 'faq-pekerjaan',
    question: 'Adakah GIS menjamin pekerjaan selepas tamat belajar?',
    answer:
      'Tidak. GIS tidak memberikan jaminan pekerjaan secara automatik. Sebaliknya, kami menumpukan latihan praktikal, pendedahan industri, latihan amali serta bimbingan penempatan bagi membantu pelajar bersedia menghadapi alam kerjaya.',
  },
  {
    id: 'faq-penginapan',
    question: 'Adakah penginapan disediakan?',
    answer:
      'GIS menyediakan khidmat bantuan pengaturan penginapan pelajar di sekitar Nilai, Negeri Sembilan, tertakluk kepada ketersediaan unit, kadar sewaan serta syarat penginapan semasa pada tarikh kemasukan.',
  },
  {
    id: 'faq-perbezaan',
    question: 'Apakah perbezaan TVET/SKM dengan Diploma?',
    answer:
      'Laluan TVET / Sijil Kemahiran Malaysia (SKM) memberi tumpuan lebih tinggi kepada kemahiran teknikal dan kerja amali di bengkel atau makmal latihan. Program Diploma pula menggabungkan pengetahuan teori, pengurusan serta latihan praktikal untuk persediaan ke peringkat eksekutif permulaan atau pengajian lanjutan.',
  },
  {
    id: 'faq-pendaftaran',
    question: 'Bagaimana proses pendaftaran?',
    answer:
      'Lengkapkan borang pertanyaan di bawah atau hubungi penasihat GIS melalui WhatsApp. Penasihat kami akan menyemak kelayakan SPM atau kelayakan setara, berkongsi maklumat program terkini, menerangkan anggaran yuran dan pilihan pembiayaan, serta membimbing langkah pendaftaran rasmi sekiranya sesuai.',
  },
];
