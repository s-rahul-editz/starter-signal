"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";

export default function PostForm({ initialPost, postId }) {
  const router = useRouter();
  const [title, setTitle] = useState(initialPost?.title || "");
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || "");
  const [content, setContent] = useState(initialPost?.body || "");
  const [previewMode, setPreviewMode] = useState(false);
  const textareaRef = useRef(null);
  const [featuredImage, setFeaturedImage] = useState(initialPost?.featured_image || "");
  const [galleryText, setGalleryText] = useState((initialPost?.gallery_images || []).join("\n"));
  const [tagsText, setTagsText] = useState((initialPost?.tags || []).join(", "));
  const [status, setStatus] = useState(initialPost?.status || "draft");
  const [scheduledAt, setScheduledAt] = useState(
    initialPost?.published_at ? initialPost.published_at.slice(0, 16) : ""
  );
  const [faqItems, setFaqItems] = useState(
    initialPost?.faq?.length > 0 ? initialPost.faq : []
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload(e, targetSetter, isGallery) {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Upload failed.");
      setUploading(false);
      return;
    }

    if (isGallery) {
      setGalleryText((prev) => (prev ? prev + "\n" + data.url : data.url));
    } else {
      targetSetter(data.url);
    }
    setUploading(false);
  }

  function wrapSelection(before, after) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end);
    const newText = content.slice(0, start) + before + selected + after + content.slice(end);

    setContent(newText);

    // Restore focus and cursor position after React re-renders
    setTimeout(() => {
      textarea.focus();
      const cursorPos = start + before.length + selected.length + after.length;
      textarea.setSelectionRange(cursorPos, cursorPos);
    }, 0);
  }

  function addFaqItem() {
    setFaqItems([...faqItems, { question: "", answer: "" }]);
  }

  function updateFaqItem(index, field, value) {
    const updated = [...faqItems];
    updated[index][field] = value;
    setFaqItems(updated);
  }

  function removeFaqItem(index) {
    setFaqItems(faqItems.filter((_, i) => i !== index));
  }

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
      scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      faq: faqItems.filter((f) => f.question && f.answer),
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
      <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
        <button type="button" onClick={() => wrapSelection("**", "**")} style={toolBtnStyle}>Bold</button>
        <button type="button" onClick={() => wrapSelection("*", "*")} style={toolBtnStyle}>Italic</button>
        <button type="button" onClick={() => wrapSelection("## ", "")} style={toolBtnStyle}>Heading</button>
        <button type="button" onClick={() => wrapSelection("[", "](https://)")} style={toolBtnStyle}>Link</button>
        <button type="button" onClick={() => wrapSelection("- ", "")} style={toolBtnStyle}>List</button>
        <button
          type="button"
          onClick={() => setPreviewMode(!previewMode)}
          style={{ ...toolBtnStyle, marginLeft: "auto", background: previewMode ? "var(--maroon)" : "transparent", color: previewMode ? "var(--paper)" : "var(--ink)" }}
        >
          {previewMode ? "Write" : "Preview"}
        </button>
      </div>

      {previewMode ? (
        <div className="textarea-preview" style={{ ...textareaStyle, minHeight: 260, overflow: "auto" }}>
          <ReactMarkdown>{content || "*Nothing to preview yet.*"}</ReactMarkdown>
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={12}
          style={textareaStyle}
        />
      )}
      <p style={{ fontSize: 12, color: "var(--steel)", marginTop: 4 }}>
        Supports Markdown — select text and tap a button above, or type directly (**bold**, *italic*, ## heading).
      </p>

      <label style={labelStyle}>Featured image</label>
      <input value={featuredImage} onChange={(e) => setFeaturedImage(e.target.value)} style={inputStyle} placeholder="Paste a URL, or upload below" />
      <input type="file" accept="image/*" onChange={(e) => handleUpload(e, setFeaturedImage, false)} style={{ marginTop: 8, fontSize: 13 }} />

      <label style={labelStyle}>Gallery images (one URL per line — upload adds to the list)</label>
      <textarea value={galleryText} onChange={(e) => setGalleryText(e.target.value)} rows={4} style={textareaStyle} placeholder={"https://...\nhttps://..."} />
      <input type="file" accept="image/*" onChange={(e) => handleUpload(e, null, true)} style={{ marginTop: 8, fontSize: 13 }} />

      {uploading && <p style={{ color: "var(--brass)", fontSize: 13, marginTop: 8 }}>Uploading...</p>}

      <label style={labelStyle}>Tags (comma-separated)</label>
      <input value={tagsText} onChange={(e) => setTagsText(e.target.value)} style={inputStyle} placeholder="Rajdhani, Route Guide, Tips" />

      <label style={labelStyle}>Status</label>
      <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle}>
        <option value="draft">Draft</option>
        <option value="published">Published</option>
      </select>

      {status === "published" && (
        <>
          <label style={labelStyle}>Publish date/time (leave blank to publish immediately)</label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            style={inputStyle}
          />
          <p style={{ fontSize: 12, color: "var(--steel)", marginTop: 4 }}>
            Set a future date to schedule this post — it stays hidden until then.
          </p>
        </>
      )}

      <label style={labelStyle}>FAQ section (optional — helps posts win featured snippets)</label>
      {faqItems.map((item, i) => (
        <div key={i} style={{ border: "1px solid var(--line)", borderRadius: 4, padding: 12, marginBottom: 10 }}>
          <input
            value={item.question}
            onChange={(e) => updateFaqItem(i, "question", e.target.value)}
            placeholder="Question"
            style={{ ...inputStyle, marginBottom: 8 }}
          />
          <textarea
            value={item.answer}
            onChange={(e) => updateFaqItem(i, "answer", e.target.value)}
            placeholder="Answer"
            rows={2}
            style={textareaStyle}
          />
          <button type="button" onClick={() => removeFaqItem(i)} style={removeBtnStyle}>Remove</button>
        </div>
      ))}
      <button type="button" onClick={addFaqItem} style={addBtnStyle}>+ Add FAQ item</button>

      {error && <p style={{ color: "var(--maroon)", fontSize: 14, marginTop: 16 }}>{error}</p>}

      <button type="submit" disabled={saving || uploading} style={buttonStyle}>
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

const toolBtnStyle = {
  padding: "6px 12px",
  background: "transparent",
  border: "1px solid var(--line)",
  borderRadius: 4,
  fontFamily: "var(--mono)",
  fontSize: 12,
  cursor: "pointer",
  color: "var(--ink)",
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

const addBtnStyle = {
  padding: "8px 14px",
  background: "transparent",
  border: "1.5px dashed var(--ink)",
  borderRadius: 4,
  fontFamily: "var(--mono)",
  fontSize: 12,
  cursor: "pointer",
  color: "var(--ink)",
};

const removeBtnStyle = {
  marginTop: 8,
  padding: "6px 12px",
  background: "transparent",
  border: "1px solid var(--maroon)",
  color: "var(--maroon)",
  borderRadius: 4,
  fontFamily: "var(--mono)",
  fontSize: 11,
  cursor: "pointer",
};
          
