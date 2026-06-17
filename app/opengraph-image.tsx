import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Social share card (also used as the Twitter image fallback).
export const alt = "Rust Series by meowy";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const ferris = await readFile(
    join(process.cwd(), "public/ferris.png"),
    "base64",
  );
  const ferrisSrc = `data:image/png;base64,${ferris}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#16130f",
          padding: "72px 80px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 660 }}>
          <div
            style={{
              display: "flex",
              color: "#e33b26",
              fontSize: 26,
              letterSpacing: 8,
              textTransform: "uppercase",
            }}
          >
            meowy
          </div>
          <div
            style={{
              display: "flex",
              color: "#ece7df",
              fontSize: 92,
              fontWeight: 700,
              lineHeight: 1.04,
              marginTop: 18,
            }}
          >
            Rust Series
          </div>
          <div
            style={{
              display: "flex",
              color: "#c4baac",
              fontSize: 33,
              lineHeight: 1.3,
              marginTop: 22,
            }}
          >
            Rust tutorials, from your first cargo new to async and beyond.
          </div>
          <div
            style={{
              display: "flex",
              color: "#8f8576",
              fontSize: 26,
              marginTop: 40,
            }}
          >
            zerotorust.com
          </div>
        </div>
        <img src={ferrisSrc} width={330} height={220} alt="" />
      </div>
    ),
    { ...size },
  );
}
