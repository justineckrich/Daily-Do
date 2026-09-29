import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Daily-Do",
    short_name: "Daily-Do",
    description: "Your One Thing, Top 3, meetings, notes, and yesterday's ideas.",
    start_url: "/",
    display: "standalone",
    background_color: "#15161d",
    theme_color: "#15161d",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
