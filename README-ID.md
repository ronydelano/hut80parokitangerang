# Panduan Setup — Situs HUT ke-80 Paroki (GitHub sebagai Database)

Situs ini terdiri dari beberapa halaman statis (HTML biasa, tanpa server) yang saling
terhubung lewat menu navigasi:

```
index.html            → Beranda
panitia.html           → Susunan Panitia (bagan organisasi + foto)
hut80-progress.html    → Progress persiapan HUT80 (task, Gantt chart, kurva-S)
dokumentasi.html        → Galeri foto kegiatan (Fun Walk, Starfest, dst)
kontak.html             → Info kontak paroki
css/site.css            → Tampilan bersama semua halaman
js/common.js            → Login & GitHub API bersama (dipakai dokumentasi.html)
data/tasks.json          → Data task Progress HUT80
data/documentation.json  → Data album & foto Dokumentasi
data/photo/panitia/       → Foto-foto panitia (Anda upload manual)
data/photo/event/          → Foto-foto dokumentasi kegiatan
```

Semua data (task, foto dokumentasi) disimpan sebagai file di dalam **repository GitHub**
Anda sendiri — GitHub sekaligus jadi database dan hosting-nya gratis.

---

## 1. Buat Repository GitHub

1. Login ke [github.com](https://github.com) (buat akun dulu kalau belum ada).
2. Klik **+** (kanan atas) → **New repository**.
3. Isi nama repo (misal `hut80-paroki`), pilih **Public** (wajib, supaya semua halaman bisa
   dilihat siapa saja tanpa login).
4. **Create repository**.

> ⚠️ Karena repo Public, semua isi `data/` (termasuk foto) bisa dilihat siapa saja yang
> tahu alamat filenya. Jangan unggah foto/dokumen yang sifatnya pribadi/rahasia di sini.

---

## 2. Upload semua file ke repo

Upload seluruh isi paket ini (jaga strukturnya persis seperti di atas):
- `index.html`, `panitia.html`, `hut80-progress.html`, `dokumentasi.html`, `kontak.html`
- folder `css/` (isi `site.css`)
- folder `js/` (isi `common.js`)
- folder `data/` (isi `tasks.json`, `documentation.json`, dan sub-folder `photo/panitia/`, `photo/event/`)

Cara termudah: klik **Add file → Upload files** di GitHub, lalu seret (drag & drop)
seluruh folder/file sekaligus.

---

## 3. Edit konfigurasi GitHub di 2 file

Supaya semua pengunjung otomatis membaca repo yang benar (tanpa perlu setting manual),
edit baris berikut di **dua file**:

**a. `hut80-progress.html`** — cari blok `DEFAULT_GH_CONFIG`:
```js
const DEFAULT_GH_CONFIG = {
  owner:  'YOUR_GITHUB_USERNAME',   // <-- ganti username GitHub Anda
  repo:   'YOUR_REPO_NAME',         // <-- ganti nama repo, misal 'hut80-paroki'
  branch: 'main',
  path:   'data/tasks.json'
};
```

**b. `dokumentasi.html`** — cari blok di dekat atas `<script>`:
```js
const DEFAULT_OWNER  = 'YOUR_GITHUB_USERNAME';  // <-- sama seperti di atas
const DEFAULT_REPO   = 'YOUR_REPO_NAME';        // <-- sama seperti di atas
```

Isi `owner`/`repo` di kedua file **harus sama persis**. Commit perubahan setelah edit.

---

## 4. Ganti password login editor

Login dipakai bersama di `hut80-progress.html` dan `dokumentasi.html`. Defaultnya sudah
Anda ganti sebelumnya di `hut80-progress.html` — pastikan hash yang sama juga dipasang di
`js/common.js` supaya login bekerja di kedua halaman:

1. Buka `hut80-progress.html`, cari `const USERS = [ ... ]`, salin nilai `hash` di dalamnya.
2. Buka `js/common.js`, cari `const USERS = [ ... ]`, tempel nilai `hash` yang sama di sana
   (dan `username` yang sama juga).

Kalau mau ganti password lagi kapan pun:
```js
crypto.subtle.digest('SHA-256', new TextEncoder().encode('password-baru-anda'))
  .then(b => console.log(Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('')));
```
Jalankan di Console browser (F12 → Console), copy hasilnya, tempel ke **kedua file**
(`hut80-progress.html` dan `js/common.js`) supaya tetap konsisten.

---

## 5. Aktifkan GitHub Pages

1. Di repo → **Settings → Pages**.
2. **Source**: Deploy from a branch → **Branch**: `main`, folder `/ (root)` → **Save**.
3. Tunggu 1-2 menit. Situs aktif di:
   ```
   https://<username-anda>.github.io/<nama-repo>/
   ```
4. Buka URL itu — halaman **Beranda** akan tampil dengan menu Panitia, Progress HUT80,
   Dokumentasi, dan Kontak di kanan atas.

---

## 6. Membuat GitHub Personal Access Token (untuk editor)

Sama seperti sebelumnya — setiap editor butuh token pribadi dengan akses tulis **hanya**
ke repo ini:

1. GitHub → foto profil → **Settings → Developer settings → Personal access tokens →
   Fine-grained tokens → Generate new token**.
2. **Repository access**: Only select repositories → pilih repo ini saja.
3. **Permissions → Contents**: ubah ke **Read and write**.
4. **Generate token** → copy tokennya (hanya muncul sekali, simpan baik-baik).

Token ini dipakai di **kedua** halaman yang bisa diedit (Progress HUT80 lewat menu
"Data Source", dan Dokumentasi lewat popup token setelah login) — masing-masing halaman
menyimpan token itu di browser (localStorage) secara terpisah, jadi perlu diisi sekali di
tiap halaman.

---

## 7. Mengisi konten tiap halaman

### Panitia
Halaman ini **statis** (nama & jabatan sudah tertulis langsung di `panitia.html`, tidak
perlu login). Setiap orang — mulai dari Romo Moderator sampai tiap Korbid, Kasie, dan
Wakil Kasie — punya slot foto sendiri. Upload foto ke folder `data/photo/panitia/` dengan
nama file **persis sama** seperti daftar berikut:

```
romo-moderator.jpg
dph-pendamping-1.jpg, dph-pendamping-2.jpg, dph-pendamping-3.jpg
ketua.jpg
wakil-ketua-1.jpg, wakil-ketua-2.jpg
sekretaris-1.jpg, sekretaris-2.jpg
bendahara-1.jpg, bendahara-2.jpg

korbid-acara.jpg
  kasie-liturgi.jpg
  kasie-starfest.jpg, wakil-kasie-starfest.jpg
  kasie-funwalk.jpg, wakil-kasie-funwalk.jpg
  kasie-retret.jpg, wakil-kasie-retret.jpg
  kasie-kenduri.jpg

korbid-pubdoc.jpg
  kasie-publikasi.jpg
  kasie-dokumentasi.jpg

korbid-dana.jpg
  kasie-sponsorship.jpg
  kasie-donatur.jpg

korbid-sarana-umum.jpg
  kasie-perlengkapan.jpg
  kasie-dekorasi.jpg

korbid-jasa-umum.jpg
  kasie-keamanan-parkir.jpg
  kasie-kebersihan.jpg
  kasie-kesehatan.jpg
  kasie-konsumsi.jpg
  kasie-humas.jpg
  kasie-perizinan.jpg

pic-buku-sejarah.jpg
pic-hymne.jpg
pic-logo.jpg
```

Semua nama file ini juga ditampilkan kecil di bawah/samping tiap foto di halaman Panitia,
jadi tidak perlu dihafal — tinggal disesuaikan saat upload. Foto yang belum ada otomatis
diganti gambar siluet abu-abu sementara.

> Catatan: dua nama peran sedikit saya rapikan penulisannya supaya konsisten dengan
> yang lain — "PIC Buku Sejara" → **PIC Buku Sejarah**, dan "Kasi Perizinan" →
> **Kasie Perizinan**. Beri tahu saya kalau ternyata penulisan aslinya memang begitu.

### Progress HUT80
Sama seperti sebelumnya — login, isi token, lalu tambah/edit/hapus task lewat tombol
"+ Add Task".

### Dokumentasi
1. Buka halaman **Dokumentasi**, klik **Login**, isi username/password.
2. Kalau diminta, tempel Personal Access Token.
3. Klik **+ Tambah Album** untuk bikin album baru (misal "Retret", "Kenduri"), atau pakai
   2 album bawaan ("Fun Walk", "Starfest").
4. Klik **+ Tambah Foto** di album yang dituju → pilih foto dari perangkat → foto otomatis
   diunggah ke `data/photo/event/` dan langsung tampil untuk semua pengunjung.
5. Foto juga bisa ditambah manual: upload file ke `data/photo/event/` lewat GitHub, lalu
   edit `data/documentation.json` untuk menambahkan entri `{"file": "data/photo/event/nama-file.jpg", "caption": "..."}`
   ke dalam album yang sesuai.

### Kontak
Statis, sudah terisi sesuai data yang diberikan. Edit langsung di `kontak.html` kalau ada
perubahan alamat/telepon di kemudian hari.

---

## 8. Catatan keamanan (baca ini)

- Password login di `hut80-progress.html`/`dokumentasi.html` hanyalah gerbang UI
  sederhana — bukan proteksi tingkat server. Proteksi sesungguhnya ada pada **Personal
  Access Token**, yang benar-benar diverifikasi GitHub. Berikan token hanya ke orang yang
  Anda percaya untuk mengubah data.
- Karena repo bersifat Public, seluruh isi `data/` (termasuk foto panitia & dokumentasi)
  bisa diakses siapa saja yang tahu URL-nya, terlepas dari status login di aplikasi.
- Kalau token bocor atau tidak dipakai lagi, cabut dari GitHub → Settings → Developer
  settings → Personal access tokens → **Delete**.
