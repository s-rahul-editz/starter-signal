import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "../../../../lib/supabase";
import { slugify } from "../../../../lib/slugify";

function checkAuth() {
  const cookieStore = cookies();
  const session = cookieStore.get("admin_session");
  return session?.value === process.env.ADMIN_PASSWORD;
}

export async function GET(request, { params }) {
  if (!checkAuth()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: post, error } = await supabaseAdmin
    .from("posts")
    .select("*, post_tags(tags(name))")
    .eq("id", params.id)
    .single();

  if (error || !post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const tags = post.post_tags?.map((pt) => pt.tags.name) || [];

  return NextResponse.json({ post: { ...post, tags } });
}

export async function PUT(request, { params }) {
  if (!checkAuth()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, excerpt, content, featured_image, gallery_images, tags, status, faq, scheduled_at } = body;

  if (!title || !content) {
    return NextResponse.json({ error: "Title and body are required" }, { status: 400 });
  }

  const { data: existingPost } = await supabaseAdmin
    .from("posts")
    .select("title, body, excerpt, published_at")
    .eq("id", params.id)
    .single();

  // Save a snapshot of the current version before overwriting it (Phase 7: revision history)
  if (existingPost) {
    await supabaseAdmin.from("post_revisions").insert({
      post_id: params.id,
      title: existingPost.title,
      body: existingPost.body,
      excerpt: existingPost.excerpt,
    });
  }

  const wordCount = content.trim().split(/\s+/).length;
  const readTime = Math.max(1, Math.round(wordCount / 200));

  const publishedAt =
    status === "published"
      ? (scheduled_at || existingPost?.published_at || new Date().toISOString())
      : null;

  const { data: post, error: postError } = await supabaseAdmin
    .from("posts")
    .update({
      title,
      excerpt: excerpt || null,
      body: content,
      featured_image: featured_image || null,
      gallery_images: gallery_images || [],
      status,
      read_time_minutes: readTime,
      published_at: publishedAt,
      faq: faq || [],
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.id)
    .select()
    .single();

  if (postError) {
    return NextResponse.json({ error: postError.message }, { status: 500 });
  }

  await supabaseAdmin.from("post_tags").delete().eq("post_id", params.id);

  if (tags && tags.length > 0) {
    for (const tagName of tags) {
      const tagSlug = slugify(tagName);
      const { data: existingTag } = await supabaseAdmin
        .from("tags")
        .select("id")
        .eq("slug", tagSlug)
        .single();

      let tagId = existingTag?.id;

      if (!tagId) {
        const { data: newTag } = await supabaseAdmin
          .from("tags")
          .insert({ name: tagName.trim(), slug: tagSlug })
          .select()
          .single();
        tagId = newTag?.id;
      }

      if (tagId) {
        await supabaseAdmin.from("post_tags").insert({ post_id: params.id, tag_id: tagId });
      }
    }
  }

  return NextResponse.json({ post });
}

export async function DELETE(request, { params }) {
  if (!checkAuth()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabaseAdmin.from("posts").delete().eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
