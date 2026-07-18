import Link from "next/link";
import { supabasePublic } from "../../../lib/supabase";

function fmtDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export async function generateMetadata({ params }) {
  return { title: `#${params.slug} — Starter Signal` };
}

export default async function TagPage({ params }) {
  const { data: tag } = await supabasePublic
    .from("tags")
    .select("id, name")
    .eq("slug", params.slug)
    .single();

  let posts = [];
  if (tag) {
    const { data } = await supabasePublic
      .from("post_tags")
      .select("posts(id, title, slug, excerpt, published_at, read_time_minutes, status)")
      .eq("tag_id", tag.id);

    posts = (data || [])
      .map((row) => row.posts)
      .filter((p) => p && p.status === "published")
      .sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
  }

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <div className="eyebrow">Tag</div>
      <h1 style={{ fontSize: 30, margin: "8px 0 24px" }}>{tag?.name || params.slug}</h1>

      {posts.length === 0 && <p style={{ color: "var(--ink-soft)" }}>No posts with this tag yet.</p>}

      {posts.map((post) => (
        <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
          <div className="ticket-card">
            <div className="ticket-body">
              <h2>{post.title}</h2>
              {post.excerpt && <p>{post.excerpt}</p>}
              <div className="ticket-data">
                {fmtDate(post.published_at)}
                {post.read_time_minutes ? ` · ${post.read_time_minutes} MIN READ` : ""}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
