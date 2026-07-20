import { notFound } from "next/navigation";
import Link from "next/link";
import { supabasePublic } from "../../../lib/supabase";
import Comments from "../../../components/Comments";
import ReactMarkdown from "react-markdown";

export const dynamic = "force-dynamic";

function fmtDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
}

export async function generateMetadata({ params }) {
  const { data: post } = await supabasePublic
    .from("posts")
    .select("title, excerpt")
    .eq("slug", params.slug)
    .eq("status", "published")
    .single();

  if (!post) return { title: "Post not found — Starter Signal" };

  return {
    title: `${post.title} — Starter Signal`,
    description: post.excerpt || undefined,
  };
}

export default async function PostPage({ params }) {
  const now = new Date().toISOString();

  const { data: post } = await supabasePublic
    .from("posts")
    .select("*, profiles(id, display_name), post_tags(tags(id, name, slug))")
    .eq("slug", params.slug)
    .eq("status", "published")
    .lte("published_at", now)
    .single();

  if (!post) {
    notFound();
  }

  const tags = post.post_tags?.map((pt) => pt.tags) || [];
  const faqItems = Array.isArray(post.faq) ? post.faq.filter((f) => f.question && f.answer) : [];

  // Related posts: anything sharing at least one tag, excluding this post itself
  let relatedPosts = [];
  if (tags.length > 0) {
    const tagIds = tags.map((t) => t.id);
    const { data: relatedLinks } = await supabasePublic
      .from("post_tags")
      .select("posts(id, title, slug, excerpt, published_at, status)")
      .in("tag_id", tagIds);

    const seen = new Set([post.id]);
    relatedPosts = (relatedLinks || [])
      .map((row) => row.posts)
      .filter((p) => p && p.status === "published" && !seen.has(p.id) && seen.add(p.id))
      .slice(0, 3);
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://starter-signal.vercel.app";

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: { "@type": "Person", name: post.profiles?.display_name || "Starter Signal" },
    image: post.featured_image || undefined,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name: post.title, item: `${baseUrl}/blog/${post.slug}` },
    ],
  };

  const faqSchema = faqItems.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  } : null;

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60, maxWidth: 680 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}

      <div className="eyebrow">
        {post.profiles?.id ? (
          <Link href={`/author/${post.profiles.id}`} style={{ color: "inherit" }}>{post.profiles.display_name}</Link>
        ) : (
          "Starter Signal"
        )}
      </div>
      <h1 style={{ fontSize: 32, margin: "8px 0 12px" }}>{post.title}</h1>
      <div className="ticket-data" style={{ marginBottom: 24 }}>
        {fmtDate(post.published_at)}
        {post.read_time_minutes ? ` · ${post.read_time_minutes} MIN READ` : ""}
      </div>

      {post.featured_image && (
        <img
          src={post.featured_image}
          alt={post.title}
          style={{ width: "100%", borderRadius: 4, border: "1.5px solid var(--ink)", marginBottom: 24 }}
        />
      )}

      <div className="post-body" style={{ fontSize: 17, lineHeight: 1.8 }}>
        <ReactMarkdown>{post.body}</ReactMarkdown>
      </div>

      {post.gallery_images?.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "32px 0" }}>
          {post.gallery_images.map((img, i) => (
            <img key={i} src={img} alt={`${post.title} photo ${i + 1}`} style={{ width: "100%", borderRadius: 4, border: "1.5px solid var(--ink)" }} />
          ))}
        </div>
      )}

      {faqItems.length > 0 && (
        <div style={{ marginTop: 32, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
          <h2 style={{ fontSize: 22, marginBottom: 16 }}>Frequently asked questions</h2>
          {faqItems.map((f, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{f.question}</div>
              <div style={{ color: "var(--ink-soft)" }}>{f.answer}</div>
            </div>
          ))}
        </div>
      )}

      {tags.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 32, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
          {tags.map((tag) => (
            <Link key={tag.slug} href={`/tag/${tag.slug}`} style={tagLinkStyle}>{tag.name}</Link>
          ))}
        </div>
      )}

      {relatedPosts.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: 22, marginBottom: 16 }}>Related posts</h2>
          {relatedPosts.map((rp) => (
            <Link key={rp.id} href={`/blog/${rp.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div className="ticket-card">
                <div className="ticket-body">
                  <h2 style={{ fontSize: 18 }}>{rp.title}</h2>
                  {rp.excerpt && <p>{rp.excerpt}</p>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Comments />
    </div>
  );
}

const tagLinkStyle = {
  fontFamily: "var(--mono)",
  fontSize: 12,
  color: "var(--maroon)",
  border: "1.5px solid var(--maroon)",
  borderRadius: 3,
  padding: "4px 10px",
  textDecoration: "none",
};
        
