"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthFrame } from "@/components/auth-frame";
import { readApiJson } from "@/lib/api-json";
import { studio } from "@/lib/studio-copy";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    router.prefetch("/app");
    router.prefetch("/login");
    const control = new AbortController();
    fetch("/api/me", { signal: control.signal })
      .then((response) => readApiJson<{ user?: unknown }>(response))
      .then((data) => {
        if (data.user) window.location.replace("/app");
      })
      .catch(() => undefined);
    return () => control.abort();
  }, [router]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
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
      const data = await readApiJson<{ error?: string }>(response);
      if (!response.ok) {
        setError(typeof data.error === "string" ? data.error : studio.auth.registerFail);
        setPending(false);
        return;
      }
      window.location.assign("/app");
    } catch {
      setError(studio.auth.registerFail);
      setPending(false);
    }
  }

  return (
    <AuthFrame
      eyebrow="Commencer"
      title="Ouvrir le booth FGI."
      lead="Un compte, un événement, un kiosk. 10e édition — l’IA au service du Tchad."
      footer={
        <>
          J’en ai déjà un. <Link href="/login">Connexion</Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="auth-form">
        <label className="field-wrap">
          <span>Votre nom</span>
          <input className="field" name="name" autoComplete="name" required minLength={2} disabled={pending} suppressHydrationWarning />
        </label>
        <label className="field-wrap">
          <span>Nom de l’événement</span>
          <input className="field" name="workspaceName" required minLength={2} disabled={pending} />
        </label>
        <label className="field-wrap">
          <span>{studio.auth.email}</span>
          <input className="field" name="email" type="email" autoComplete="email" required disabled={pending} suppressHydrationWarning />
        </label>
        <label className="field-wrap">
          <span>{studio.auth.passwordNew}</span>
          <input
            className="field"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            disabled={pending}
            suppressHydrationWarning
          />
        </label>
        {error ? (
          <p className="auth-error" role="alert">
            {error}
          </p>
        ) : null}
        <button className="btn btn-gold w-full" disabled={pending}>
          {pending ? "Ouverture…" : "Ouvrir"}
        </button>
        {pending ? <p className="auth-wait">Création du booth…</p> : null}
      </form>
    </AuthFrame>
  );
}
