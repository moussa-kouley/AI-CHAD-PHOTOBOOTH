"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthFrame } from "@/components/auth-frame";
import { readApiJson } from "@/lib/api-json";
import { studio } from "@/lib/studio-copy";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    router.prefetch("/app");
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
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });
      const data = await readApiJson<{ error?: string }>(response);
      if (!response.ok) {
        setError(typeof data.error === "string" ? data.error : studio.auth.loginFail);
        setPending(false);
        return;
      }
      window.location.assign("/app");
    } catch {
      setError(studio.auth.loginFail);
      setPending(false);
    }
  }

  return (
    <AuthFrame
      eyebrow="Connexion"
      title="Entrer dans le réseau."
      lead="Réservé à l’équipe du booth. Les invités choisissent un monde sur la page d’accueil."
      footer={
        <>
          Invité du forum ? <Link href="/#mondes">Choisir un monde</Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="auth-form">
        <label className="field-wrap">
          <span>{studio.auth.email}</span>
          <input
            className="field"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={pending}
            suppressHydrationWarning
          />
        </label>
        <label className="field-wrap">
          <span>{studio.auth.password}</span>
          <input
            className="field"
            name="password"
            type="password"
            autoComplete="current-password"
            required
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
          {pending ? "Entrée…" : "Entrer"}
        </button>
        {pending ? <p className="auth-wait">Ouverture de la salle…</p> : null}
      </form>
    </AuthFrame>
  );
}
