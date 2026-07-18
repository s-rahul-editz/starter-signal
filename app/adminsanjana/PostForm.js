"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PostForm({ initialPost, postId }) {
  const router = useRouter();
  const [title, setTitle] = useState(initialPost?.title || "");
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || "");
  const [content, setContent] = useState(initialPost?.body || "");
  const [featuredImage, setFeaturedImage] = useState(initialPost?.featured_image || "");
  const [galleryText, setGalleryText] = useState((initialPost?.gallery_images || []).join("\n"));
  const [tagsText, setTagsText] = useState((initialPost?.tags || []).join(", "));
  const [status, setStatus] = useState(initialPost?.status || "draft");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      title,
      excerpt,
      content,
      featured_image: featuredImage,
      gallery_images: galleryText.split("\n").map((s) => s.trim()).filter(Boolean),
      tags: tagsText.split(",").map((s) => s.trim()).filter(Boolean),
      status,
    };

    const url = postId ? `/api/posts/${postId}` : "/api/posts";
    const method = postId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong.");
      setSaving(false);
      return;
    }

    router.push("/adminsanjana");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
      <label style={labelStyle}>Title</label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} required style={inputStyle} />

      <label style={labelStyle}>Excerpt (short summary, shown on homepage)</label>
      <input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} style={inputStyle} />

      <label style={labelStyle}>Body</label>
      <textarea value={content} onChange={(e) => setContent(e.target.value)} required rows={12} style={textareaStyle} />

      <label style={labelStyle}>Featured image URL</label>
      <input value={featuredImage} onChange={(e) => setFeaturedImage(e.target.value)} style={inputStyle} placeholder="https://..." />

      <label style={labelStyle}>Gallery image URLs (one per line)</label>
      <textarea value={galleryText} onChange={(e) => setGalleryText(e.target.value)} rows={4} style={textareaStyle} placeholder={"https://...\nhttps://..."} />

      <label style={labelStyle}>Tags (comma-separated)</label>
      <input value={tagsText} onChange={(e) => setTagsText(e.target.value)} style={inputStyle} placeholder="Rajdhani, Route Guide, Tips" />

      <label style={labelStyle}>Status</label>
      <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle}>
        <option value="draft">Draft</option>
        <option value="published">Published</option>
      </select>

      {error && <p style={{ color: "var(--maroon)", fontSize: 14 }}>{error}</p>}

      <button type="submit" disabled={saving} style={buttonStyle}>
        {saving ? "Saving..." : postId ? "Update post" : "Create post"}
      </button>
    </form>
  );
}

const labelStyle = {
  display: "block",
  fontFamily: "var(--mono)",
  fontSize: 12,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  color: "var(--steel)",
  margin: "18px 0 6px",
};

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "10px 12px",
  border: "1.5px solid var(--ink)",
  borderRadius: 4,
  background: "var(--paper-raised)",
  fontFamily: "var(--body)",
  fontSize: 15,
  color: "var(--ink)",
  boxSizing: "border-box",
};

const textareaStyle = {
  ...inputStyle,
  fontFamily: "var(--body)",
  resize: "vertical",
};

const buttonStyle = {
  marginTop: 24,
  padding: "12px 24px",
  background: "var(--maroon)",
  color: "var(--paper)",
  border: "none",
  borderRadius: 4,
  fontFamily: "var(--mono)",
  fontWeight: 500,
  fontSize: 14,
  cursor: "pointer",
};
