import Link from "next/link";

/** Every standalone page in the sandbox. To add one, add a line here. */
const PAGES = [
  { href: "/calendar", label: "Calendar", note: "Month view with events" },
  { href: "/todo", label: "To-do list", note: "Tasks and reminders" },
  { href: "/contracts", label: "Contracts", note: "Sponsorship deals" },
  { href: "/events", label: "Events", note: "Chamber events" },
  { href: "/partners", label: "Partners", note: "Sponsors and contacts" },
];

/**
 * Sandbox index at "/". Only a list of links - each one opens a single
 * component on its own page.
 */
export default function Home() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-10">
      <h1 className="text-xl font-bold">Sandbox</h1>
      <p className="mb-6 text-sm text-muted-foreground">Pick one page to view.</p>
      <ul className="grid gap-2">
        {PAGES.map(({ href, label, note }) => (
          <li key={href}>
            <Link href={href} className="block rounded-md border bg-card px-4 py-3 hover:bg-secondary">
              <span className="block font-semibold">{label}</span>
              <span className="block text-sm text-muted-foreground">{note}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
