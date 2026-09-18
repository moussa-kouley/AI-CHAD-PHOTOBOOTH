"use client";

import { useState } from "react";
import { studio } from "@/lib/studio-copy";

export function CopyButton({ value, label = studio.copyBtn.link, className = "btn btn-quiet" }: { value: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button className={className} type="button" onClick={() => void copy()}>
      {copied ? studio.copyBtn.copied : label}
    </button>
  );
}
