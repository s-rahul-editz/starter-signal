import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "../../../lib/supabase";
import { slugify } from "../../../lib/slugify";

function checkAuth() {
  const cookieStore = cookies();
  const session = cookieStore.get("admin_session");
  return session?.value === process.env.ADMIN_PASSWORD;
}

export async function GET() {
  if (!checkAuth()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("posts")
    .select("id, title, slug, status, updated_at, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ posts: data });
}

export async function POST(request) {
  if (!checkAuth()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, excerpt, content, featured_image, gallery_images, tags, status, faq, scheduled_at } = body;

  if (!title || !content) {
    return NextResponse.json({ error: "Title and body are required" }, { status: 400 });
  }

  const { data: authorProfile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("role", "admin")
    .limit(1)
    .single();

  if (!authorProfile) {
    return NextResponse.json(
      { error: "No admin profile found to attribute this post to" },
      { status: 500 }
    );
  }

  const slug = slugify(title);
  const wordCount = content.trim().split(/\s+/).length;
  const readTime = Math.max(1, Math.round(wordCount / 200));

  // If a future scheduled_at is provided, use it as published_at — the post
  // stays hidden from public queries until that moment passes, with no cron job needed.
  const publishedAt = status === "published" ? (scheduled_at || new Date().toISOString()) : null;

  const { data: post, error: postError } = await supabaseAdmin
    .from("posts")
    .insert({
      title,
      slug,
      excerpt: excerpt || null,
      body: content,
      featured_image: featured_image || null,
      gallery_images: gallery_images || [],
      status: status || "draft",
      author_id: authorProfile.id,
      read_time_minutes: readTime,
      published_at: publishedAt,
      faq: faq || [],
    })
    .select()
    .single();

  if (postError) {
    return NextResponse.json({ error: postError.message }, { status: 500 });
  }

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
        await supabaseAdmin.from("post_tags").insert({ post_id: post.id, tag_id: tagId });
      }
    }
  }

  return NextResponse.json({ post });
}
