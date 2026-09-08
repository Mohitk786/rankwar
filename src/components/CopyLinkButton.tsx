"use client";

import { useState } from "react";

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API can be unavailable (insecure context, permissions) — fail quietly.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-md border border-border px-4 py-2 text-sm hover:border-foreground/40"
    >
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}
