// src/OpenSession.tsx
import { useSearchParams } from "react-router-dom";

export default function OpenSession() {
  const [params] = useSearchParams();
  const token = params.get("qr_token");

  const openApp = () => {
    if (!token) return;
    window.location.href = `neurovision://session?qr_token=${encodeURIComponent(token)}`;
  };

  return (
    <div style={{ padding: 32, fontFamily: "sans-serif" }}>
      <h1>Abrir NeuroVision</h1>

      <p>Sesión detectada correctamente.</p>

      <button
        onClick={openApp}
        style={{
          padding: "14px 22px",
          fontSize: 18,
          borderRadius: 12,
          background: "#2563eb",
          color: "white",
          border: "none",
        }}
      >
        Abrir app en las gafas
      </button>

      <p style={{ marginTop: 20, wordBreak: "break-all" }}>
        Token: {token}
      </p>
    </div>
  );
}