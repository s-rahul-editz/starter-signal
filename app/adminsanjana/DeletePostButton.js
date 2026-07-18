"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeletePostButton({ postId }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    setDeleting(true);
    await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      style={{
        border: "1.5px solid var(--maroon)",
        color: confirming ? "var(--paper)" : "var(--maroon)",
        background: confirming ? "var(--maroon)" : "transparent",
        padding: "8px 14px",
        borderRadius: 4,
        fontFamily: "var(--mono)",
        fontSize: 12,
        cursor: "pointer",
      }}
    >
      {deleting ? "Deleting..." : confirming ? "Confirm delete?" : "Delete"}
    </button>
  );
}
