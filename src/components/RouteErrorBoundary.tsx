import { AlertTriangle } from "lucide-react";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";

export default function RouteErrorBoundary() {
  const error = useRouteError();
  const status = isRouteErrorResponse(error) ? error.status : 500;
  const title = status === 404 ? "Halaman tidak ditemukan" : "Halaman gagal dimuat";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <section className="w-full max-w-lg rounded-2xl border bg-white p-8 text-center shadow-sm">
        <AlertTriangle className="mx-auto h-12 w-12 text-amber-500" aria-hidden="true" />
        <p className="mt-5 text-sm font-semibold uppercase tracking-widest text-emerald-700">
          Error {status}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">{title}</h1>
        <p className="mt-3 text-slate-600">
          Coba muat ulang halaman. Jika masalah berlanjut, kembali ke beranda dan ulangi alurnya.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button className="rounded-md bg-emerald-600 px-5 py-2.5 font-semibold text-white hover:bg-emerald-700" onClick={() => window.location.reload()}>
            Muat ulang
          </button>
          <a className="rounded-md border px-5 py-2.5 font-semibold text-slate-800 hover:bg-slate-50" href="/">
            Kembali ke beranda
          </a>
        </div>
      </section>
    </main>
  );
}
