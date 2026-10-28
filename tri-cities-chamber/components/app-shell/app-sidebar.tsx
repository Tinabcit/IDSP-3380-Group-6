"use client";

import { createContext, useContext, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Briefcase,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  FileText,
  Handshake,
  Home,
  Plus,
  Search,
  Settings,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { eventBadge, splitEvents, type EventBadge } from "@/lib/planner/home";
import { cn } from "@/lib/utils";

import { OverdueBell } from "./overdue-bell";
import { useOptionalPlannerData } from "./planner-provider";

/**
 * The menu links. Used by both the sidebar and the phone menu.
 * To add a new page to the menu, add a line here.
 */
export const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/contracts", label: "Contracts", icon: FileText },
  { href: "/events", label: "Events", icon: Star },
  { href: "/partners", label: "Partners", icon: Handshake },
] as const;

/**
 * Checks if a menu link points to the page we are on (so it can be highlighted).
 * "/" must match exactly; other links match if the URL starts with them
 * (so /contracts/123 still highlights "Contracts").
 */
export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/** The colours of the small sidebar labels. */
const BADGE_TONES: Record<EventBadge["tone"], string> = {
  danger: "bg-red-600 text-white",
  info: "bg-sky-600 text-white",
  dark: "bg-neutral-900 text-white",
};

/**
 * The search box and the event / partner picked in the sidebar. They filter the
 * home page's task table, and live here so the sidebar can set them from any page.
 */
type HomeFilters = {
  search: string;
  eventId: string;
  sponsorId: string;
  setSearch: (value: string) => void;
  setEventId: (value: string) => void;
  setSponsorId: (value: string) => void;
};

const HomeFiltersContext = createContext<HomeFilters | null>(null);

/** Holds the sidebar filters for the whole app. */
export function HomeFiltersProvider({ children }: { children: React.ReactNode }) {
  const [search, setSearch] = useState("");
  const [eventId, setEventId] = useState("all");
  const [sponsorId, setSponsorId] = useState("all");
  const value = useMemo(
    () => ({ search, eventId, sponsorId, setSearch, setEventId, setSponsorId }),
    [search, eventId, sponsorId],
  );
  return <HomeFiltersContext.Provider value={value}>{children}</HomeFiltersContext.Provider>;
}

/** Gets the sidebar filters. Must be used inside HomeFiltersProvider. */
export function useHomeFilters(): HomeFilters {
  const filters = useContext(HomeFiltersContext);
  if (!filters) throw new Error("useHomeFilters must be used inside HomeFiltersProvider");
  return filters;
}

/**
 * The sidebar shown on every page: logo, Upload Contract, search, Settings,
 * "signed in as" with the bell, the page links, then the events and partners.
 * Picking an event or partner (or searching) filters the home page's task table,
 * so on other pages it also goes to the home page.
 */
export function AppSidebar({ className }: { className?: string }) {
  const data = useOptionalPlannerData();
  const filters = useHomeFilters();
  const pathname = usePathname();
  const router = useRouter();
  const [closed, setClosed] = useState<Set<string>>(new Set(["archived", "annual", "program"]));

  const events = data?.events;
  const tasks = data?.tasks;
  const today = data?.today;
  const groups = useMemo(
    () => (events && today ? splitEvents(events, today) : null),
    [events, today],
  );
  const openTaskCount = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of tasks ?? []) {
      if (t.completed || !t.eventId) continue;
      counts.set(t.eventId, (counts.get(t.eventId) ?? 0) + 1);
    }
    return counts;
  }, [tasks]);

  /** Opens or closes one of the sidebar sections. */
  function toggleSection(key: string) {
    setClosed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  /** Changes a filter, and goes to the home page if we are not on it (that is where the results show). */
  function applyFilter(apply: () => void) {
    apply();
    if (pathname !== "/") router.push("/");
  }

  /** Picks an event, or un-picks it if it is already picked. */
  function pickEvent(id: string) {
    applyFilter(() => filters.setEventId(filters.eventId === id ? "all" : id));
  }

  return (
    <aside aria-label="Sidebar" className={cn("bg-neutral-50 p-4", className)}>
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-md bg-sky-600 text-white">
          <Briefcase className="h-4 w-4" aria-hidden />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold">TuDu</p>
          <p className="text-[11px] text-muted-foreground">Tri-Cities Chamber</p>
        </div>
      </div>

      <Button
        asChild
        className="mt-4 h-8 w-full justify-between bg-sky-600 px-3 text-xs hover:bg-sky-700"
      >
        <Link href="/contracts/new">
          Upload Contract
          <Plus aria-hidden />
        </Link>
      </Button>

      <div className="relative mt-3">
        <Search
          className="pointer-events-none absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground"
          aria-hidden
        />
        <Input
          aria-label="Search tasks"
          placeholder="Search"
          value={filters.search}
          onChange={(e) => applyFilter(() => filters.setSearch(e.target.value))}
          className="h-7 bg-white pl-7 text-xs"
        />
      </div>

      <div className="mt-4 text-sm">
        <span
          aria-disabled="true"
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-muted-foreground"
        >
          <Settings className="h-4 w-4" aria-hidden /> Settings
        </span>
      </div>

      {/* Phones use the bottom menu and the small top bar instead. */}
      <ShellMenu className="mt-3 hidden md:grid" />

      {groups && today && (
        <>
          <SidebarSection
            title="Repeat Events"
            open={!closed.has("repeat")}
            onToggle={() => toggleSection("repeat")}
            addHref="/events"
          >
            {groups.repeat.map((e) => (
              <SidebarItem
                key={e.id}
                label={e.name}
                active={filters.eventId === e.id}
                badge={eventBadge(e, openTaskCount.get(e.id) ?? 0, today)}
                onClick={() => pickEvent(e.id)}
              />
            ))}
          </SidebarSection>

          <SidebarSection
            title="One-off Events"
            open={!closed.has("oneoff")}
            onToggle={() => toggleSection("oneoff")}
            addHref="/events"
          >
            {groups.oneOff.map((e) => (
              <SidebarItem
                key={e.id}
                label={e.name}
                active={filters.eventId === e.id}
                badge={eventBadge(e, openTaskCount.get(e.id) ?? 0, today)}
                onClick={() => pickEvent(e.id)}
              />
            ))}
          </SidebarSection>

          <SidebarSection
            title="Archived Events"
            open={!closed.has("archived")}
            onToggle={() => toggleSection("archived")}
          >
            {groups.archived.map((e) => (
              <SidebarItem
                key={e.id}
                label={e.name}
                active={filters.eventId === e.id}
                onClick={() => pickEvent(e.id)}
              />
            ))}
          </SidebarSection>
        </>
      )}

      {data && (
        <>
          {/* The data has no partner levels yet, so every partner is listed under Pillar. */}
          <SidebarSection
            title="Pillar Partners"
            open={!closed.has("pillar")}
            onToggle={() => toggleSection("pillar")}
            addHref="/partners"
          >
            {data.sponsors.map((s) => (
              <SidebarItem
                key={s.id}
                label={s.name}
                active={filters.sponsorId === s.id}
                onClick={() =>
                  applyFilter(() =>
                    filters.setSponsorId(filters.sponsorId === s.id ? "all" : s.id),
                  )
                }
              />
            ))}
          </SidebarSection>

          <SidebarSection
            title="Annual Partners"
            open={!closed.has("annual")}
            onToggle={() => toggleSection("annual")}
            addHref="/partners"
          />
          <SidebarSection
            title="Program Partners"
            open={!closed.has("program")}
            onToggle={() => toggleSection("program")}
            addHref="/partners"
          />
        </>
      )}
    </aside>
  );
}

/** The "signed in as" dropdown. */
export function UserSelect() {
  const data = useOptionalPlannerData();
  if (!data) return null;
  return (
    <Select value={data.currentUserId} onValueChange={data.setCurrentUser}>
      <SelectTrigger aria-label="Signed in as" className="h-9 w-full gap-2 bg-white">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {data.staff.map((person) => (
          <SelectItem key={person.id} value={person.id}>
            {person.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** "Signed in as" with the overdue bell, then the page links. */
function ShellMenu({ className }: { className?: string }) {
  const data = useOptionalPlannerData();
  const pathname = usePathname();
  return (
    <div className={cn("gap-3 border-b pb-3", className)}>
      {data && (
        <div className="grid gap-1.5 px-1">
          <span className="text-xs text-muted-foreground">Signed in as</span>
          <div className="flex items-center gap-1">
            <div className="min-w-0 flex-1">
              <UserSelect />
            </div>
            <OverdueBell align="left" />
          </div>
        </div>
      )}
      <nav aria-label="Main" className="flex flex-col gap-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active && "bg-white font-medium shadow-sm",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

/** One collapsible group in the sidebar: a title with an open/close arrow, an optional "+" link, and its items. */
function SidebarSection({
  title,
  open,
  onToggle,
  addHref,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  addHref?: string;
  children?: React.ReactNode;
}) {
  const Arrow = open ? ChevronDown : ChevronRight;
  return (
    <div className="mt-4 border-t pt-3">
      <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
        <button
          type="button"
          aria-expanded={open}
          onClick={onToggle}
          className="flex flex-1 items-center gap-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {title}
          <Arrow className="ml-auto h-3.5 w-3.5" aria-hidden />
        </button>
        {addHref && (
          <Link href={addHref} aria-label={`Add to ${title}`} className="ml-2 rounded hover:bg-white">
            <Plus className="h-3.5 w-3.5" aria-hidden />
          </Link>
        )}
      </div>
      {open && <ul className="mt-2 flex flex-col gap-1">{children}</ul>}
    </div>
  );
}

/** One clickable line in a sidebar section (an event or a partner), with an optional coloured label. */
function SidebarItem({
  label,
  active,
  badge,
  onClick,
}: {
  label: string;
  active: boolean;
  badge?: EventBadge;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        aria-pressed={active}
        onClick={onClick}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          active && "bg-white font-semibold shadow-sm",
        )}
      >
        <span className="min-w-0 flex-1 truncate">{label}</span>
        {badge && (
          <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px]", BADGE_TONES[badge.tone])}>
            {badge.text}
          </span>
        )}
      </button>
    </li>
  );
}
