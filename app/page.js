import Link from "next/link";
import { supabasePublic } from "../lib/supabase";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Starter Signal — Indian Railways, journey by journey",
  description: "Train reviews, route guides, news, tips, and photography from across Indian Railways.",
};

function fmtDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default async function HomePage() {
  const { data: posts, error } = await supabasePublic
    .from("posts")
    .select("id, title, slug, excerpt, published_at, read_time_minutes, post_tags(tags(name, slug))")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <div style={{ background: "#fff", border: "2px solid red", padding: 12, marginBottom: 20, fontSize: 12, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
        DEBUG — server fetched at: {new Date().toISOString()}
        {"\n"}error: {error ? JSON.stringify(error) : "none"}
        {"\n"}raw posts: {JSON.stringify(posts, null, 2)}
      </div>

      <div className="eyebrow">Latest</div>
      <h1 style={{ fontSize: 34, margin: "8px 0 8px" }}>Starter Signal</h1>
      <p style={{ color: "var(--ink-soft)", maxWidth: 520 }}>
        Journeys, route guides, news, tips, and photography from across Indian Railways.
      </p>

      {(!posts || posts.length === 0) && (
        <p style={{ color: "var(--ink-soft)", marginTop: 32 }}>No posts published yet — check back soon.</p>
      )}

      {posts?.map((post) => {
        const tags = post.post_tags?.map((pt) => pt.tags) || [];
        const primaryTag = tags[0];
        return (
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
              {primaryTag && (
                <div className="ticket-stub">
                  <div className="stamp">{primaryTag.name}</div>
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
