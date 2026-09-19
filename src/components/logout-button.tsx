"use client";

import { useRouter } from "next/navigation";
import { studio } from "@/lib/studio-copy";

export function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <button className="studio-out" type="button" onClick={() => void logout()}>
      {studio.nav.out}
    </button>
  );
}
