import { notFound } from "next/navigation";
import Link from "next/link";
import { supabasePublic } from "../../../lib/supabase";

function fmtDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
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
  const { data: post } = await supabasePublic
    .from("posts")
    .select("*, profiles(display_name), post_tags(tags(name, slug))")
    .eq("slug", params.slug)
    .eq("status", "published")
    .single();

  if (!post) {
    notFound();
  }

  const tags = post.post_tags?.map((pt) => pt.tags) || [];
  const paragraphs = post.body.split("\n").filter((p) => p.trim());

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60, maxWidth: 680 }}>
      <div className="eyebrow">{post.profiles?.display_name || "Starter Signal"}</div>
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

      <div style={{ fontSize: 17, lineHeight: 1.8 }}>
        {paragraphs.map((para, i) => (
          <p key={i} style={{ marginBottom: 18 }}>{para}</p>
        ))}
      </div>

      {post.gallery_images?.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "32px 0" }}>
          {post.gallery_images.map((img, i) => (
            <img key={i} src={img} alt={`${post.title} photo ${i + 1}`} style={{ width: "100%", borderRadius: 4, border: "1.5px solid var(--ink)" }} />
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
