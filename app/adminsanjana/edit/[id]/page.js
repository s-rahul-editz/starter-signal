import { redirect, notFound } from "next/navigation";
import { isAdminAuthenticated } from "../../../../lib/auth-check";
import { supabaseAdmin } from "../../../../lib/supabase";
import PostForm from "../../PostForm";

export default async function EditPostPage({ params }) {
  if (!isAdminAuthenticated()) {
    redirect("/adminsanjana/login");
  }

  const { data: post } = await supabaseAdmin
    .from("posts")
    .select("*, post_tags(tags(name))")
    .eq("id", params.id)
    .single();

  if (!post) {
    notFound();
  }

  const tags = post.post_tags?.map((pt) => pt.tags.name) || [];

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <div className="eyebrow">Edit post</div>
      <h1 style={{ fontSize: 28, margin: "8px 0 24px" }}>{post.title}</h1>
      <PostForm initialPost={{ ...post, tags }} postId={post.id} />
    </div>
  );
}
