import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Generated favicon: Ferris on a rounded dark tile.
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon() {
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
          alignItems: "center",
          justifyContent: "center",
          background: "#16130f",
          borderRadius: 14,
        }}
      >
        <img src={ferrisSrc} width={54} height={36} alt="" />
      </div>
    ),
    { ...size },
  );
}
