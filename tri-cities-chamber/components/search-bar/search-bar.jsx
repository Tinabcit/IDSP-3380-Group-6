import { useRef } from "react";

/**
 * A search box with a round blue button beside it (the button puts the cursor back in the box).
 * Pass value and onChange to control it.
 * @param {{ value?: string, onChange?: (value: string) => void, className?: string }} props
 */
export default function SearchBar({ value, onChange, className = "" }) {
  const inputRef = useRef(null);
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        inputRef.current?.focus();
      }}
      className={`flex items-center gap-2 ${className}`}
    >
      <input
        ref={inputRef}
        type="search"
        aria-label="Search tasks"
        placeholder="Search"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="h-9 min-w-0 flex-1 rounded-lg border-2 border-neutral-200 bg-white px-3 text-sm text-black placeholder:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <button
        type="submit"
        aria-label="Search"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#008dcb] text-black hover:bg-[#007bb3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
          <circle cx="12" cy="12" r="8.5" strokeDasharray="3 2.6" />
          <path d="M12 8.5v7M8.5 12h7" />
        </svg>
      </button>
    </form>
  );
}
