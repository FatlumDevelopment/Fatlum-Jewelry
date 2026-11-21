import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#f3f0ea", color: "#1a1814", padding: "72px" }}>
        <div style={{ display: "flex", fontSize: 18, letterSpacing: 8, textTransform: "uppercase" }}>Fatlum · München</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 92, lineHeight: 0.95, fontFamily: "Georgia" }}>Ringe aus München.</div>
          <div style={{ marginTop: 28, fontSize: 28, color: "#5c564e" }}>Jewelry · Preis auf Anfrage</div>
        </div>
      </div>
    ),
    size,
  );
}
