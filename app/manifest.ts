import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LE SHE SAREE",
    short_name: "LE SHE",
    description: "Contemporary Indian sarees and handcrafted fashion.",
    start_url: "/",
    display: "standalone",
    background_color: "#eee7e1",
    theme_color: "#eee7e1",
    lang: "en",
  };
}
