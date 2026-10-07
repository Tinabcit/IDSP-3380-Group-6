import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * The plain frame every sandbox page sits in: a small link back to the
 * sandbox index ("/"), then the page. No header, menu or footer - nothing
 * else is ever shown next to the page.
 */
export function SandboxPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Sandbox home
      </Link>
      {children}
    </div>
  );
}
