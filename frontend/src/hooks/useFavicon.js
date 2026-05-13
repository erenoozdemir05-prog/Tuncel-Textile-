import { useEffect } from "react";

// Dynamically updates <link rel="icon"> when faviconUrl changes
export const useFavicon = (faviconUrl) => {
  useEffect(() => {
    if (!faviconUrl || typeof document === "undefined") return;
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = faviconUrl;
  }, [faviconUrl]);
};
