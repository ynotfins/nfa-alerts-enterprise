export async function generateDeviceFingerprint(): Promise<string> {
  const components: string[] = [];

  try {
    // Screen info
    if (typeof screen !== "undefined") {
      components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);
    }

    // Timezone
    try {
      components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);
    } catch {
      components.push("unknown-tz");
    }

    // Language
    if (typeof navigator !== "undefined") {
      components.push(navigator.language || "unknown");
      components.push(navigator.platform || "unknown");
      components.push(String(navigator.hardwareConcurrency || 0));
      components.push(String(navigator.maxTouchPoints || 0));
    }

    // Canvas fingerprint
    if (typeof document !== "undefined") {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.textBaseline = "top";
          ctx.font = "14px Arial";
          ctx.fillStyle = "#f60";
          ctx.fillRect(125, 1, 62, 20);
          ctx.fillStyle = "#069";
          ctx.fillText("NFA", 2, 15);
          ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
          ctx.fillText("NFA", 4, 17);
          components.push(canvas.toDataURL().slice(-50));
        }
      } catch {}
    }

    // WebGL info
    if (typeof document !== "undefined") {
      try {
        const canvas = document.createElement("canvas");
        const gl =
          canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        if (gl) {
          const debugInfo = (gl as WebGLRenderingContext).getExtension(
            "WEBGL_debug_renderer_info",
          );
          if (debugInfo) {
            const renderer = (gl as WebGLRenderingContext).getParameter(
              debugInfo.UNMASKED_RENDERER_WEBGL,
            );
            components.push(renderer || "");
          }
        }
      } catch {}
    }
  } catch {}

  // Create hash - fallback if crypto.subtle unavailable
  const fingerprint = components.join("|");
  const hash = await hashString(fingerprint);

  return hash;
}

async function hashString(str: string): Promise<string> {
  // crypto.subtle requires secure context (HTTPS or localhost)
  if (
    typeof crypto !== "undefined" &&
    crypto.subtle &&
    typeof crypto.subtle.digest === "function"
  ) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(str);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch {}
  }

  // Fallback: simple hash for non-secure contexts
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(16, "0");
}
