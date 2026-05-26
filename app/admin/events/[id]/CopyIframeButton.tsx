"use client";

import { useState } from "react";

export default function CopyIframeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  return (
    <button
      type="button"
      onClick={copyCode}
      style={{
        padding: "10px 14px",
        cursor: "pointer",
      }}
    >
      {copied ? "Copied" : "Copy iframe code"}
    </button>
  );
}