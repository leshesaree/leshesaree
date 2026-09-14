import type { SupabaseClient } from "@supabase/supabase-js";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function uploadProductImage(
  supabase: SupabaseClient,
  file: File,
  slug: string,
) {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("ONLY JPG, PNG, OR WEBP IMAGES ARE ALLOWED.");
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("IMAGE MUST BE 5MB OR SMALLER.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-") || "product";
  const path = `products/${safeSlug}-${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) throw new Error(uploadError.message);

  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  if (!data.publicUrl) throw new Error("COULD NOT CREATE PRODUCT IMAGE URL.");

  return data.publicUrl;
}
