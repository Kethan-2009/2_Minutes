import { isPreviewMode } from "@/lib/env";

/**
 * Shown only in preview mode — development with no Supabase project attached.
 *
 * It is deliberately hard to miss. The failure it describes (forms that look
 * fine and then do nothing) is exactly the kind that wastes an afternoon.
 */
export function SetupBanner() {
  if (!isPreviewMode) return null;

  return (
    <div className="bg-ink px-6 py-3 text-canvas">
      <p className="mx-auto max-w-[640px] text-[13px] leading-relaxed">
        <span className="font-semibold">Preview mode.</span> No Supabase project
        is connected, so signing up and logging in won&rsquo;t work — this is the
        interface only. Add your keys to{" "}
        <code className="font-mono">.env.local</code> to switch it on. See{" "}
        <code className="font-mono">README.md</code>.
      </p>
    </div>
  );
}
