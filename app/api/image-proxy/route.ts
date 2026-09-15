import { NextRequest } from "next/server";

const ALLOWED_HOSTS = new Set(["i.ibb.co", "ibb.co"]);

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("url");
  if (!raw) return new Response("Missing image URL", { status: 400 });

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return new Response("Invalid image URL", { status: 400 });
  }

  if (target.protocol !== "https:" || !ALLOWED_HOSTS.has(target.hostname)) {
    return new Response("Image host not allowed", { status: 403 });
  }

  try {
    const upstream = await fetch(target.toString(), {
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        "User-Agent": "Mozilla/5.0 (compatible; LE-SHE-SAREE/1.0; +https://leshesaree.com)",
      },
      cache: "force-cache",
      next: { revalidate: 604800 },
    });

    if (!upstream.ok) return new Response("Unable to load image", { status: 502 });

    const contentType = upstream.headers.get("content-type") || "image/*";
    if (!contentType.startsWith("image/")) return new Response("Upstream is not an image", { status: 415 });

    const body = await upstream.arrayBuffer();
    if (!body.byteLength) return new Response("Empty image", { status: 502 });

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(body.byteLength),
        "Content-Disposition": "inline",
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
        "X-Content-Type-Options": "nosniff",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return new Response("Image fetch failed", { status: 502 });
  }
}
