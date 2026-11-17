import { Search } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

/**
 * A search box. Pass value and onChange to control it; resultCount (optional) shows "N results".
 * @param {{ value?: string, onChange?: (value: string) => void, resultCount?: number, className?: string }} props
 */
export default function SearchBar({ value, onChange, resultCount, className = "max-w-xs" }) {
  return (
    <InputGroup className={className}>
      <InputGroupInput
        type="search"
        aria-label="Search tasks"
        placeholder="Search..."
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      {resultCount !== undefined && (
        <InputGroupAddon align="inline-end">{resultCount} results</InputGroupAddon>
      )}
    </InputGroup>
  );
}
