import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "../../../../lib/auth-check";
import { supabaseAdmin } from "../../../../lib/supabase";

export default async function RevisionsPage({ params }) {
  if (!isAdminAuthenticated()) {
    redirect("/adminsanjana/login");
  }

  const { data: revisions } = await supabaseAdmin
    .from("post_revisions")
    .select("id, title, excerpt, saved_at")
    .eq("post_id", params.id)
    .order("saved_at", { ascending: false });

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <div className="eyebrow">Revision history</div>
      <h1 style={{ fontSize: 28, margin: "8px 0 24px" }}>Past versions</h1>

      {(!revisions || revisions.length === 0) && (
        <p style={{ color: "var(--ink-soft)" }}>No earlier versions saved yet — a snapshot is taken each time you update this post.</p>
      )}

      {revisions?.map((rev) => (
        <div key={rev.id} style={{ padding: "14px 0", borderBottom: "1px solid var(--line)" }}>
          <div style={{ fontWeight: 600 }}>{rev.title}</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--steel)", marginTop: 4 }}>
            Saved {new Date(rev.saved_at).toLocaleString("en-IN")}
          </div>
          {rev.excerpt && <p style={{ color: "var(--ink-soft)", marginTop: 6, fontSize: 14 }}>{rev.excerpt}</p>}
        </div>
      ))}
    </div>
  );
}
