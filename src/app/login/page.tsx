"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { readApiJson } from "@/lib/api-json";
import { studio } from "@/lib/studio-copy";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((response) => readApiJson<{ user?: unknown }>(response))
      .then((data) => {
        if (data.user) window.location.href = "/app";
      })
      .catch(() => undefined);
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
    });
    const data = await readApiJson<{ error?: string }>(response);
    setPending(false);
    if (!response.ok) {
      setError(typeof data.error === "string" ? data.error : studio.auth.loginFail);
      return;
    }
    window.location.href = "/app";
  }

  return (
    <main className="auth-shell">
      <div className="auth-card">
      <BrandMark href="/" />
      <p className="eyebrow mt-10">Connexion</p>
      <h1 className="mt-4 text-5xl leading-[0.94] md:text-6xl">Bon retour.</h1>
      <form onSubmit={onSubmit} className="mt-10 space-y-3">
        <input className="field" name="email" type="email" placeholder={studio.auth.email} required autoComplete="email" />
        <input className="field" name="password" type="password" placeholder={studio.auth.password} required autoComplete="current-password" />
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <button className="btn btn-gold w-full" disabled={pending}>{pending ? "Entrée…" : "Entrer"}</button>
      </form>
      <Link href="/register" className="mt-8 inline-block text-[#edd9a8]">Créer un booth</Link>
      </div>
    </main>
  );
}
