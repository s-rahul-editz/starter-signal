import Link from "next/link";
import { supabasePublic } from "../../lib/supabase";

export const metadata = { title: "Search — Starter Signal" };

function fmtDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default async function SearchPage({ searchParams }) {
  const q = searchParams?.q?.trim() || "";
  let posts = [];

  if (q) {
    const { data } = await supabasePublic
      .from("posts")
      .select("id, title, slug, excerpt, published_at, read_time_minutes")
      .eq("status", "published")
      .or(`title.ilike.%${q}%,body.ilike.%${q}%`)
      .order("published_at", { ascending: false });
    posts = data || [];
  }

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <div className="eyebrow">Search</div>
      <h1 style={{ fontSize: 30, margin: "8px 0 24px" }}>Find a post</h1>

      <form method="get" style={{ display: "flex", gap: 8, marginBottom: 32 }}>
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search posts..."
          style={{
            flex: 1,
            padding: "12px 14px",
            border: "1.5px solid var(--ink)",
            borderRadius: 4,
            background: "var(--paper-raised)",
            fontFamily: "var(--body)",
            fontSize: 15,
            color: "var(--ink)",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "12px 20px",
            background: "var(--maroon)",
            color: "var(--paper)",
            border: "none",
            borderRadius: 4,
            fontFamily: "var(--mono)",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Search
        </button>
      </form>

      {q && posts.length === 0 && <p style={{ color: "var(--ink-soft)" }}>No results for "{q}".</p>}

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
