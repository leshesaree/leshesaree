import type { SupabaseClient } from "@supabase/supabase-js";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function uploadCategoryImage(
  supabase: SupabaseClient,
  file: File,
  slug: string,
  kind: "image" | "banner",
) {
  if (!ALLOWED_TYPES.has(file.type)) throw new Error("ONLY JPG, PNG, OR WEBP IMAGES ARE ALLOWED.");
  if (file.size > MAX_IMAGE_SIZE) throw new Error("IMAGE MUST BE 5MB OR SMALLER.");
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-") || "category";
  const path = `categories/${safeSlug}/${kind}-${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  if (!data.publicUrl) throw new Error("COULD NOT CREATE CATEGORY IMAGE URL.");
  return data.publicUrl;
}
