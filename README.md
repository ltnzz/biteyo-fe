# Biteyo Frontend

Frontend untuk aplikasi Biteyo, dibangun menggunakan React, Vite, Tailwind CSS, React Router, Axios, Google OAuth, dan Socket.IO client.

## Fitur Utama

- Autentikasi pengguna dengan email/password dan Google OAuth.
- Halaman home, explore, detail bite, profil, notifikasi, dan tambah post.
- Proteksi route untuk halaman yang membutuhkan login.
- Integrasi API backend Biteyo.
- Koneksi realtime menggunakan Socket.IO.
- Konfigurasi deployment SPA untuk Vercel.

## Teknologi

- React 19
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Socket.IO Client
- Lucide React

## Persiapan

Pastikan sudah menginstall:

- Node.js
- npm

## Instalasi

```bash
npm install
```

## Environment Variable

Buat file `.env.local` di root project jika ingin memakai konfigurasi lokal.

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## Menjalankan Project

Jalankan mode development:

```bash
npm run dev
```

Build untuk production:

```bash
npm run build
```

Preview hasil build:

```bash
npm run preview
```

Menjalankan lint:

```bash
npm run lint
```

## Struktur Folder

```txt
src/
  assets/       Asset gambar dan ikon
  components/   Komponen UI reusable
  constants/    Data konstan aplikasi
  hooks/        Custom React hooks
  lib/          Konfigurasi library eksternal
  pages/        Halaman utama aplikasi
  services/     Service untuk request API
  utils/        Helper dan utility function
```

## Deployment

Project ini sudah memiliki konfigurasi `vercel.json` untuk mendukung routing SPA di Vercel. Semua route akan diarahkan ke `index.html`.

## Catatan

Pastikan backend sudah berjalan dan environment variable sudah sesuai sebelum menggunakan fitur login, post, notifikasi, dan realtime.
