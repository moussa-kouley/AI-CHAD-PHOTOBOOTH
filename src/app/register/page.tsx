"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { studio } from "@/lib/studio-copy";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then((data) => {
      if (data.user) window.location.href = "/app";
    });
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
        workspaceName: form.get("workspaceName"),
      }),
    });
    const data = await response.json();
    setPending(false);
    if (!response.ok) {
      setError(data.error || studio.auth.registerFail);
      return;
    }
    window.location.href = "/app";
  }

  return (
    <main className="auth-shell">
      <div className="auth-card">
      <BrandMark href="/" />
      <p className="eyebrow mt-10">Commencer</p>
      <h1 className="mt-4 text-5xl leading-[0.94] md:text-6xl">Ouvrir un booth.</h1>
      <form onSubmit={onSubmit} className="mt-10 space-y-3">
        <input className="field" name="name" placeholder="Votre nom" required autoComplete="name" />
        <input className="field" name="workspaceName" placeholder="Nom de l’événement" required />
        <input className="field" name="email" type="email" placeholder={studio.auth.email} required autoComplete="email" />
        <input className="field" name="password" type="password" placeholder={studio.auth.passwordNew} required minLength={8} autoComplete="new-password" />
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <button className="btn btn-gold w-full" disabled={pending}>{pending ? "Ouverture…" : "Ouvrir"}</button>
      </form>
      <Link href="/login" className="mt-8 inline-block text-[#edd9a8]">J’en ai déjà un</Link>
      </div>
    </main>
  );
}
