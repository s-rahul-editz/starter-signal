export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://starter-signal.vercel.app";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/adminsanjana",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
