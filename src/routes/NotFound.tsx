import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <section className="w-full max-w-lg rounded-2xl border bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">404</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Halaman tidak ditemukan</h1>
        <p className="mt-3 text-slate-600">Alamat yang Anda buka tidak tersedia atau sudah dipindahkan.</p>
        <Link className="mt-7 inline-flex rounded-md bg-emerald-600 px-5 py-2.5 font-semibold text-white hover:bg-emerald-700" to="/">
          Kembali ke beranda
        </Link>
      </section>
    </main>
  );
}
