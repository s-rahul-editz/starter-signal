import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdminAuthenticated } from "../../lib/auth-check";
import { supabaseAdmin } from "../../lib/supabase";
import LogoutButton from "./LogoutButton";
import DeletePostButton from "./DeletePostButton";

export default async function AdminDashboard() {
  if (!isAdminAuthenticated()) {
    redirect("/adminsanjana/login");
  }

  const { data: posts } = await supabaseAdmin
    .from("posts")
    .select("id, title, slug, status, published_at, updated_at")
    .order("created_at", { ascending: false });

  const now = new Date();

  function statusLabel(post) {
    if (post.status !== "published") return "DRAFT";
    if (post.published_at && new Date(post.published_at) > now) {
      return `SCHEDULED — ${new Date(post.published_at).toLocaleString("en-IN")}`;
    }
    return "PUBLISHED";
  }

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <div className="eyebrow">Admin</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "8px 0 28px", flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ fontSize: 28 }}>Posts</h1>
        <Link href="/adminsanjana/new" style={newButtonStyle}>+ New post</Link>
      </div>

      {(!posts || posts.length === 0) && (
        <p style={{ color: "var(--ink-soft)" }}>No posts yet. Create your first one.</p>
      )}

      {posts?.map((post) => (
        <div key={post.id} style={rowStyle}>
          <div>
            <div style={{ fontWeight: 600 }}>{post.title}</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--steel)", marginTop: 4 }}>
              {statusLabel(post)} · updated {new Date(post.updated_at).toLocaleDateString()}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link href={`/adminsanjana/edit/${post.id}`} style={linkButtonStyle}>Edit</Link>
            <Link href={`/adminsanjana/revisions/${post.id}`} style={linkButtonStyle}>History</Link>
            <DeletePostButton postId={post.id} />
          </div>
        </div>
      ))}

      <LogoutButton />
    </div>
  );
}

const newButtonStyle = {
  background: "var(--maroon)",
  color: "var(--paper)",
  padding: "10px 16px",
  borderRadius: 4,
  textDecoration: "none",
  fontFamily: "var(--mono)",
  fontSize: 13,
  fontWeight: 500,
};

const rowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px 0",
  borderBottom: "1px solid var(--line)",
  gap: 12,
  flexWrap: "wrap",
};

const linkButtonStyle = {
  border: "1.5px solid var(--ink)",
  padding: "8px 14px",
  borderRadius: 4,
  textDecoration: "none",
  color: "var(--ink)",
  fontFamily: "var(--mono)",
  fontSize: 12,
};
