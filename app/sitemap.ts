import type { MetadataRoute } from "next";

const BASE_URL = "https://www.diamondtrivia.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE_URL },
    { url: `${BASE_URL}/strikeout` },
    { url: `${BASE_URL}/reverseimmaculate` },
    { url: `${BASE_URL}/higherlower` },
    { url: `${BASE_URL}/statstack` },
    { url: `${BASE_URL}/162-0` },
    { url: `${BASE_URL}/privacy` },
    { url: `${BASE_URL}/support` },
  ];
}
