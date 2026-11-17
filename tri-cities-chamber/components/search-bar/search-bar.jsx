/**
 * A full-width search box. Pass value and onChange to control it.
 * @param {{ value?: string, onChange?: (value: string) => void, className?: string }} props
 */
export default function SearchBar({ value, onChange, className = "" }) {
  return (
    <form
      role="search"
      onSubmit={(e) => e.preventDefault()}
      className={`w-full ${className}`}
    >
      <input
        type="search"
        aria-label="Search tasks"
        placeholder="Search"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="h-9 w-full rounded-lg border-2 border-neutral-200 bg-white px-3 text-sm text-black placeholder:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </form>
  );
}
