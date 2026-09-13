"use client";

/**
 * Last resort: the root layout itself failed, so this replaces the whole
 * document.
 *
 * It renders its own <html> and <body> and does NOT receive globals.css, so
 * every style here is inline on purpose. Keep it dependency-free — anything it
 * imports is one more thing that can be the reason we got here.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <head>
        <title>Something went wrong · Two Minutes</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          background: "#ffffff",
          color: "#0b0b0b",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
        }}
      >
        <div style={{ width: "100%", maxWidth: 420 }}>
          <h1
            style={{
              fontSize: "2rem",
              lineHeight: 1.04,
              letterSpacing: "-0.035em",
              fontWeight: 600,
              margin: "0 0 12px",
            }}
          >
            Something went wrong.
          </h1>
          <p
            style={{
              fontSize: 17,
              lineHeight: 1.6,
              color: "#767676",
              margin: "0 0 32px",
            }}
          >
            The app failed to start. Try again, and if it keeps happening the
            code below will tell us why.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              width: "100%",
              height: 56,
              borderRadius: 9999,
              border: "none",
              background: "#00c853",
              color: "#04210f",
              fontSize: 17,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          {error.digest ? (
            <p
              style={{
                marginTop: 24,
                textAlign: "center",
                fontFamily: "ui-monospace, monospace",
                fontSize: 13,
                color: "#767676",
              }}
            >
              {error.digest}
            </p>
          ) : null}
        </div>
      </body>
    </html>
  );
}
