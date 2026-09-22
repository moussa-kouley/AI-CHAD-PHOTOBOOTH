"use client";

import { BrandMark } from "@/components/brand-mark";

export function AuthFrame({
  eyebrow,
  title,
  lead,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <main className="auth-shell">
      <div className="auth-mesh" aria-hidden="true">
        <p className="home-watermark">INTERNET</p>
      </div>
      <div className="auth-card">
        <div className="auth-top">
          <BrandMark href="/" />
          <div className="home-partners auth-partners">
            <img src="/brand/fgi-tchad.png" alt="FGI Tchad" />
            <img src="/brand/igf.webp" alt="Internet Governance Forum" className="home-igf" />
          </div>
        </div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="auth-lead">{lead}</p>
        {children}
        <p className="auth-switch">{footer}</p>
      </div>
    </main>
  );
}

export function AuthSkeleton() {
  return (
    <main className="auth-shell">
      <div className="auth-mesh" aria-hidden="true">
        <p className="home-watermark">INTERNET</p>
      </div>
      <div className="auth-card" role="status" aria-live="polite">
        <div className="auth-skel auth-skel-mark" />
        <div className="auth-skel auth-skel-line" />
        <div className="auth-skel auth-skel-title" />
        <div className="auth-skel auth-skel-field" />
        <div className="auth-skel auth-skel-field" />
        <div className="auth-skel auth-skel-btn" />
        <p className="auth-wait">Connexion au réseau…</p>
      </div>
    </main>
  );
}
