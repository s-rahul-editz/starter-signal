"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/adminsanjana/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        marginTop: 20,
        padding: "10px 18px",
        background: "transparent",
        border: "1.5px solid var(--ink)",
        borderRadius: 4,
        fontFamily: "var(--mono)",
        fontSize: 13,
        cursor: "pointer",
        color: "var(--ink)",
      }}
    >
      Sign out
    </button>
  );
}
