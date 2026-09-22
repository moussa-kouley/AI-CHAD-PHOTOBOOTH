"use client";

import { studio } from "@/lib/studio-copy";

export function LogoutButton() {
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/login");
  }

  return (
    <button className="studio-out" type="button" onClick={() => void logout()}>
      {studio.nav.out}
    </button>
  );
}
