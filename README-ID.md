# Panduan Setup — Project Monitor (Online, GitHub sebagai Database)

Aplikasi ini adalah **satu file HTML** (`index.html`) yang:
- Bisa **dilihat siapa saja** tanpa login (Gantt chart, tabel task, kurva-S, dsb).
- Hanya bisa **ditambah/diedit/dihapus** oleh orang yang **login** (username + password) **dan** punya **GitHub Personal Access Token** dengan izin tulis ke repo data.
- Menyimpan datanya sebagai file `data/tasks.json` di dalam **repository GitHub** milik Anda — jadi GitHub sekaligus jadi "database" dan tempat hosting.

Total waktu setup: sekitar 10–15 menit.

---

## 1. Buat Repository GitHub

1. Login ke [github.com](https://github.com) (buat akun dulu kalau belum punya, gratis).
2. Klik tombol **+** di kanan atas → **New repository**.
3. Isi:
   - **Repository name**: bebas, misal `project-monitor`
   - **Visibility**: pilih **Public** (wajib — supaya siapa saja bisa melihat datanya tanpa login. Kalau dibuat Private, orang lain tidak akan bisa membaca `data/tasks.json` sama sekali).
4. Klik **Create repository**.

> ⚠️ Karena repo harus Public, **jangan simpan data proyek yang rahasia/sensitif** di aplikasi ini — siapa pun bisa membaca isi `data/tasks.json` langsung dari GitHub, terlepas dari ada login atau tidak di aplikasinya. Login di aplikasi hanya mengatur siapa yang **boleh mengubah data**, bukan siapa yang boleh **melihat**.

---

## 2. Upload `index.html` dan `data/tasks.json`

Dari repo yang baru dibuat:

1. Klik **Add file → Upload files**.
2. Upload file `index.html` (dari paket yang saya berikan).
3. Untuk `data/tasks.json`, di kotak nama file pastikan diketik lengkap dengan foldernya: `data/tasks.json` (GitHub otomatis akan membuat folder `data`). Isinya:
   ```json
   {
     "title": "Project Name",
     "tasks": []
   }
   ```
4. Klik **Commit changes** (bisa langsung commit ke branch `main`).

Struktur akhir repo:
```
project-monitor/
├── index.html
└── data/
    └── tasks.json
```

---

## 3. Edit konfigurasi di `index.html`

Sebelum dipublish, edit **4 baris** di bagian atas `<script>` supaya aplikasi otomatis tahu harus baca dari repo Anda:

Cari blok ini (gunakan tombol **Edit** ✎ di GitHub, atau edit di komputer lalu upload ulang):

```js
const DEFAULT_GH_CONFIG = {
  owner:  'YOUR_GITHUB_USERNAME',   // <-- GANTI: username GitHub Anda
  repo:   'YOUR_REPO_NAME',         // <-- GANTI: nama repo, misal 'project-monitor'
  branch: 'main',
  path:   'data/tasks.json'
};
```

Ganti `YOUR_GITHUB_USERNAME` dan `YOUR_REPO_NAME` sesuai punya Anda, lalu **Commit changes**.

> Ini yang membuat data **langsung terbaca otomatis oleh siapa saja** yang membuka halamannya — tanpa langkah ini, setiap pengunjung harus mengisi manual di menu "Data Source", yang tidak praktis untuk publik.

---

## 4. Ganti username & password login editor

Secara default, aplikasi punya 1 akun bawaan: `admin` / `admin123`. **Wajib diganti** sebelum dipublish.

1. Buka Developer Console browser (tekan `F12`, tab **Console**).
2. Jalankan kode berikut, ganti `'password-baru-anda'` dengan password pilihan Anda:
   ```js
   crypto.subtle.digest('SHA-256', new TextEncoder().encode('password-baru-anda'))
     .then(b => console.log(Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('')));
   ```
3. Console akan menampilkan sebuah teks panjang (hash). Copy teks tersebut.
4. Di `index.html`, cari:
   ```js
   const USERS = [
     { username: 'admin', hash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9' }
   ];
   ```
5. Ganti `username` sesuai keinginan, dan ganti nilai `hash` dengan hasil copy tadi. Bisa tambah beberapa akun sekaligus:
   ```js
   const USERS = [
     { username: 'budi', hash: 'HASIL_HASH_BUDI' },
     { username: 'siti', hash: 'HASIL_HASH_SITI' }
   ];
   ```
6. Commit changes.

> Catatan jujur soal keamanan: karena ini website statis (tanpa server), password ini **hanya gerbang UI sederhana** — orang yang cukup paham teknis bisa melihat source code dan mem-bypass-nya lewat console browser. Proteksi yang sesungguhnya ada di langkah berikutnya: **Personal Access Token**, yang benar-benar diverifikasi oleh server GitHub, bukan oleh kode di browser. Jangan simpan data sangat sensitif di aplikasi ini.

---

## 5. Aktifkan GitHub Pages (hosting gratis)

1. Di halaman repo, buka **Settings → Pages** (menu kiri).
2. Pada **Build and deployment → Source**, pilih **Deploy from a branch**.
3. **Branch**: pilih `main`, folder `/ (root)` → **Save**.
4. Tunggu 1–2 menit. Situs akan aktif di:
   ```
   https://<username-anda>.github.io/<nama-repo>/
   ```
5. Buka URL tersebut — halaman Project Monitor akan langsung tampil, dan otomatis membaca `data/tasks.json` dari repo Anda (kartu ringkasan, tabel, Gantt chart, dan kurva-S akan langsung terisi begitu ada task).

### Alternatif hosting gratis lain (opsional)
Kalau tidak ingin pakai GitHub Pages, `index.html` ini juga bisa langsung di-drag-and-drop ke:
- **Netlify Drop**: [app.netlify.com/drop](https://app.netlify.com/drop)
- **Vercel**: `npx vercel` di folder yang berisi `index.html`

Databasenya (`data/tasks.json`) tetap di GitHub — hosting file HTML-nya boleh di mana saja, tidak harus GitHub Pages.

---

## 6. Membuat GitHub Personal Access Token (untuk yang boleh edit)

Setiap orang yang **berhak mengedit** task perlu token pribadi mereka sendiri (bukan dibagi bersama — masing-masing bikin token sendiri):

1. Login ke GitHub → klik foto profil (kanan atas) → **Settings**.
2. Scroll ke bawah, buka **Developer settings** (menu paling kiri bawah).
3. Pilih **Personal access tokens → Fine-grained tokens → Generate new token**.
4. Isi:
   - **Token name**: bebas, misal `project-monitor-editor`
   - **Expiration**: pilih sesuai kebutuhan (misal 90 hari, atau custom lebih lama)
   - **Repository access**: pilih **Only select repositories** → pilih repo `project-monitor` yang tadi dibuat (jangan beri akses ke semua repo — cukup 1 repo ini saja, prinsip *least privilege*)
   - **Permissions → Repository permissions**: cari **Contents**, ubah ke **Read and write**
5. Klik **Generate token**.
6. **Copy token yang muncul** (hanya ditampilkan sekali! simpan baik-baik, misal di password manager). Formatnya seperti `github_pat_xxxxxxxxxxxx...`.

> Bagikan token ini **hanya** ke orang yang benar-benar Anda percaya untuk mengubah data proyek. Siapa pun yang punya token ini bisa menulis ke repo tersebut (walau dibatasi hanya ke 1 repo itu saja). Kalau token bocor/tidak terpakai lagi, kembali ke halaman token tadi dan klik **Delete** untuk mencabutnya.

---

## 7. Cara login & mulai isi data

1. Buka situs yang sudah live (`https://<username>.github.io/<repo>/`).
2. Klik tombol **Login** (kanan atas) → isi **Username** & **Password** sesuai yang sudah diatur di langkah 4.
3. Setelah berhasil login, klik tombol **Data Source** → tempel **Personal Access Token** dari langkah 6 di kolom yang muncul → klik **Save & Reload Data**.
4. Sekarang tombol **+ Add Task** aktif — mulai tambahkan task proyek Anda. Setiap perubahan otomatis tersimpan ke `data/tasks.json` di GitHub (butuh beberapa detik).
5. Pengunjung lain yang membuka situs yang sama (tanpa login) akan langsung melihat data terbaru — tanpa perlu setting apa pun.

Token disimpan hanya di **browser milik editor tersebut** (localStorage) — tidak perlu dimasukkan ulang tiap buka situs di browser yang sama, tapi perlu diisi ulang kalau ganti perangkat/browser lain.

---

## 8. Catatan & batasan

- **Rentang tanggal rencana** dibatasi 1 Jul 2026 – 30 Jun 2028 (bisa diubah lewat `MIN_DATE`/`MAX_DATE` di `index.html`, sesuaikan juga atribut `min`/`max` pada input tanggal di form).
- **Gantt chart** otomatis menyesuaikan lebar layar (tidak perlu scroll jauh ke kanan) — bar akan terlihat sedikit lebih rapat di layar kecil, tapi seluruh rentang 24 bulan tetap muat.
- Pembacaan data lewat GitHub API tanpa login dibatasi **60 request/jam per alamat IP** oleh GitHub — cukup untuk pemakaian tim kecil/personal; kalau situs ramai sekali, pertimbangkan solusi lain (di luar cakupan panduan ini).
- Kalau dua editor menyimpan **persis bersamaan**, salah satu akan mendapat pesan error dan diminta reload halaman lalu coba lagi (mencegah perubahan saling menimpa).
- Kurva-S "Realisasi" adalah pendekatan (dihitung dari progres terakhir yang diinput, bukan histori harian sungguhan).
