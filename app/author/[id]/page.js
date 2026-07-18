import { notFound } from "next/navigation";
import Link from "next/link";
import { supabasePublic } from "../../../lib/supabase";

function fmtDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default async function AuthorPage({ params }) {
  const { data: profile } = await supabasePublic
    .from("profiles")
    .select("id, display_name, bio")
    .eq("id", params.id)
    .single();

  if (!profile) {
    notFound();
  }

  const { data: posts } = await supabasePublic
    .from("posts")
    .select("id, title, slug, excerpt, published_at, read_time_minutes")
    .eq("author_id", params.id)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <div className="eyebrow">Author</div>
      <h1 style={{ fontSize: 30, margin: "8px 0 12px" }}>{profile.display_name}</h1>
      {profile.bio && <p style={{ color: "var(--ink-soft)", maxWidth: 520, marginBottom: 32 }}>{profile.bio}</p>}

      {(!posts || posts.length === 0) && <p style={{ color: "var(--ink-soft)" }}>No published posts yet.</p>}

      {posts?.map((post) => (
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
