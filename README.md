# Global Institute of Studies (GIS) — Landing Page

Laman web maklumat dan pertanyaan program TVET/SKM serta Diploma untuk Global Institute of Studies (GIS), Nilai, Negeri Sembilan.

## Ciri Utama
- Bahasa Melayu (Malaysia) mesra ibu bapa/penjaga dan pelajar lepasan SPM.
- Tema cerah institusi (*light mode*) dengan susun atur responsif (mudah alih, tablet, desktop).
- Bahagian lima persoalan utama ibu bapa tanpa dakwaan atau jaminan yang tidak disahkan.
- Penemuan program dengan tab boleh akses papan kekunci (`TVET / SKM` dan `Diploma`).
- Borang pertanyaan 3 medan (`Nama penuh`, `Nombor telefon`, `Alamat e-mel`) dengan pengesahan format Malaysia, *honeypot* anti-spam, had kadar pelayan (*rate limiting*) dan sokongan metadata minat program.
- Pelayan Express (`/api/enquiries`) yang mengesahkan respons JSON secara terus (tidak bergantung kepada `no-cors`).
- Integrasi WhatsApp terus ke `012-66189332` (`601266189332`).

## Sambungan Google Sheets (`panchorguy@gmail.com`)
1. Cipta Google Sheet baharu (contoh: **GIS Leads 2026**) dengan tajuk lajur:
   `Timestamp | Name | Phone | Email | Source | Programme interest`
2. Buka **Extensions → Apps Script** dan salin kandungan fail `Code.gs`.
3. Dalam **Project Settings → Script Properties**, tambah `SHEET_ID` dengan ID helaian Google Sheet anda.
4. Klik **Deploy → New deployment → Web app**, tetapkan *Execute as: Me*, dan salin URL `/exec`.
5. Tetapkan pemboleh ubah persekitaran pelayan `GOOGLE_APPS_SCRIPT_WEB_APP_URL` kepada URL `/exec` tersebut.

## Sistem CRM Staf GIS (`/admin`)
1. Tetapkan pemboleh ubah persekitaran `ADMIN_USERNAME` dan `ADMIN_PASSWORD` dalam `.env` atau panel Secrets pelayan (jika belum ditetapkan, kredensial lalai ialah `ghaz` / `1234`).
2. Layari laluan `/admin` (atau klik pautan **Portal Staf (CRM)** di bahagian pengaki laman).
3. Log masuk menggunakan **Nama Pengguna** dan **Kata Laluan**. Pelayan akan mengesahkan kredensial melalui `POST /api/admin/login` dan mengeluarkan token sesi untuk laluan `GET /api/admin/enquiries` serta `PATCH /api/admin/enquiries/:id`.
4. Staf boleh menapis mengikut status (`Baru`, `Sedang Dihubungi`, `Berjaya Daftar`, `Tidak Berminat`), mencari mengikut nama/telefon/program, mengemas kini status serta menyimpan nota susulan.

## Bahan yang Memerlukan Pengesahan Rasmi GIS Sebelum Pelancaran
1. Logo rasmi dan garis panduan jenama GIS.
2. Senarai program terkini, status pengambilan semasa, serta status pengiktirafan JPK/SKM atau akreditasi MQA yang tepat bagi setiap program.
3. Syarat kelayakan serta ketersediaan terkini bantuan pinjaman/pembiayaan pengajian.
4. Rakan kerjasama industri dan bentuk sokongan kerjaya sebenar.
5. Ketersediaan asrama/penginapan, kadar bayaran, dan foto fasiliti rasmi GIS.
6. Teks notis privasi PDPA rasmi institusi dan pegawai pengendali susulan pertanyaan.
