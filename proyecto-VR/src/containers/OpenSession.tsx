  import { useSearchParams } from "react-router-dom";

  export default function OpenSession() {
    const [params] = useSearchParams();
    const token = params.get("qr_token");

    const openApp = () => {
      if (!token) return;

      window.location.href = `neurovision://session?qr_token=${encodeURIComponent(
        token
      )}`;
    };

    if (!token) {
      return (
        <main className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-900 text-white flex items-center justify-center px-6">
          <section className="w-full max-w-xl text-center">
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-md">
              <span className="text-4xl">!</span>
            </div>

            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200">
              NeuroVision
            </p>

            <h1 className="text-4xl font-semibold tracking-tight">
              Sesión no disponible
            </h1>

            <p className="mt-5 rounded-2xl border border-red-300/30 bg-red-500/10 px-5 py-4 text-red-100">
              No se ha encontrado un token de sesión válido.
            </p>

            <p className="mt-6 text-sm text-cyan-50/60">
              Vuelve a generar un nuevo QR desde la plataforma.
            </p>
          </section>
        </main>
      );
    }

    return (
      <main
        onClick={openApp}
        className="min-h-screen w-full cursor-pointer bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-900 text-white flex items-center justify-center px-6"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_55%)]" />
        </div>

        <section className="relative z-10 w-full max-w-xl text-center">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-md">
            <span className="text-4xl">◉</span>
          </div>

          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200">
            NeuroVision
          </p>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Bienvenido/a
          </h1>

          <p className="mt-5 text-lg leading-8 text-cyan-50/80">
            Tu sesión de realidad virtual está lista.
          </p>

          <div className="mt-10 rounded-3xl border border-white/15 bg-white/10 px-8 py-7 shadow-2xl backdrop-blur-md">
            <p className="text-2xl font-semibold">
              Pulsa en cualquier parte para comenzar
            </p>

            
          </div>

          
        </section>
      </main>
    );
  }