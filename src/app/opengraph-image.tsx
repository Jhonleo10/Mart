import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Digital Genius Mart";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0076df 0%, #00c367 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: -2 }}>Genius Mart</div>
        <div style={{ fontSize: 28, marginTop: 16, opacity: 0.92 }}>
          Discover, compare & book B2B software demos
        </div>
      </div>
    ),
    { ...size },
  );
}
