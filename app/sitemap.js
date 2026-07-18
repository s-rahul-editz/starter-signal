import { supabasePublic } from "../lib/supabase";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://starter-signal.vercel.app";

  const { data: posts } = await supabasePublic
    .from("posts")
    .select("slug, updated_at")
    .eq("status", "published");

  const postUrls = (posts || []).map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updated_at,
  }));

  const staticUrls = [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/about`, lastModified: new Date() },
    { url: `${baseUrl}/contact`, lastModified: new Date() },
    { url: `${baseUrl}/privacy`, lastModified: new Date() },
    { url: `${baseUrl}/search`, lastModified: new Date() },
  ];

  return [...staticUrls, ...postUrls];
}
