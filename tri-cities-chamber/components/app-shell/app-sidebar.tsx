"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  ChevronDown,
  FileText,
  Handshake,
  Home,
  LayoutDashboard,
  Settings,
  Star,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { splitEvents } from "@/lib/planner/home";
import type { ChamberEvent } from "@/lib/planner/types";
import type { DisplayUser } from "@/lib/planner/user";
import SearchBar from "@/components/search-bar/search-bar";
import { UserMenu } from "./user-menu";
import { OverdueBell } from "./overdue-bell";
import { useOptionalPlannerData } from "./planner-provider";

export function UserSelect() {
  const data = useOptionalPlannerData();
  if (!data) return null;
  return (
    <Select value={data.currentUserId} onValueChange={data.setCurrentUser}>
      <SelectTrigger
        aria-label="Signed in as"
        className="h-9 w-full gap-2 bg-card"
      >
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

export const NAV = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/contracts", label: "Contracts", icon: FileText },
  { href: "/events", label: "Events", icon: Star },
  { href: "/partners", label: "Partners", icon: Handshake },
] as const;

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

type HomeFilters = {
  search: string;
  eventId: string;
  sponsorId: string;
  setSearch: (value: string) => void;
  setEventId: (value: string) => void;
  setSponsorId: (value: string) => void;
};

const HomeFiltersContext = createContext<HomeFilters | null>(null);

export function HomeFiltersProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [search, setSearch] = useState("");
  const [eventId, setEventId] = useState("all");
  const [sponsorId, setSponsorId] = useState("all");
  // Switching to a different sponsor starts the task view fresh (no leftover event or search).
  const switchSponsor = useCallback(
    (next: string) => {
      if (next !== sponsorId) {
        setEventId("all");
        setSearch("");
      }
      setSponsorId(next);
    },
    [sponsorId],
  );
  const value = useMemo(
    () => ({
      search,
      eventId,
      sponsorId,
      setSearch,
      setEventId,
      setSponsorId: switchSponsor,
    }),
    [search, eventId, sponsorId, switchSponsor],
  );
  return (
    <HomeFiltersContext.Provider value={value}>
      {children}
    </HomeFiltersContext.Provider>
  );
}

export function useHomeFilters(): HomeFilters {
  const filters = useContext(HomeFiltersContext);
  if (!filters)
    throw new Error("useHomeFilters must be used inside HomeFiltersProvider");
  return filters;
}

export const SIDEBAR_NAV = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/contracts", label: "Contracts", icon: FileText },
  { href: "/events", label: "Events", icon: Star },
  { href: "/partners", label: "Partners", icon: Handshake },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

function Section({
  title,
  startOpen = true,
  children,
}: {
  title: string;
  startOpen?: boolean;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(startOpen);
  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between text-xs font-medium text-muted-foreground"
      >
        {title}
        <ChevronDown className={cn("h-4 w-4", !open && "-rotate-90")} />
      </button>
      {open && children}
    </div>
  );
}

function Item({
  label,
  active,
  tasks = 0,
  onClick,
}: {
  label: string;
  active: boolean;
  tasks?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-1 text-left text-sm hover:bg-card",
        active && "bg-card font-medium",
      )}
    >
      <span className="flex-1 truncate">{label}</span>
      {tasks > 0 && (
        <span className="rounded-full bg-sky-600 px-2 py-0.5 text-xs text-white">
          {tasks} tasks
        </span>
      )}
    </button>
  );
}

export function AppSidebar({ className, user }: { className?: string; user: DisplayUser }) {
  const data = useOptionalPlannerData();
  const filters = useHomeFilters();
  const pathname = usePathname();
  const router = useRouter();

  const events = data
    ? splitEvents(data.events, data.today)
    : { repeat: [], oneOff: [], archived: [] };
  const partners = data?.sponsors ?? [];

  function openTasks(eventId: string) {
    return (data?.tasks ?? []).filter(
      (t) => t.eventId === eventId && !t.completed,
    ).length;
  }

  function goHome() {
    if (pathname !== "/home") router.push("/home");
  }

  function pickEvent(id: string) {
    filters.setEventId(filters.eventId === id ? "all" : id);
    goHome();
  }

  function pickPartner(id: string) {
    filters.setSponsorId(filters.sponsorId === id ? "all" : id);
    goHome();
  }

  function clearFilters() {
    filters.setSearch("");
    filters.setEventId("all");
    filters.setSponsorId("all");
  }

  function eventItems(list: ChamberEvent[]) {
    return list.map((event) => (
      <Item
        key={event.id}
        label={event.name}
        tasks={openTasks(event.id)}
        active={filters.eventId === event.id}
        onClick={() => pickEvent(event.id)}
      />
    ));
  }

  return (
    <aside
      aria-label="Sidebar"
      className={cn(
        "bg-muted flex flex-col divide-y [&>*]:p-4",
        className,
      )}
    >
      <div className="shrink-0">
        <div className="flex items-center gap-2">
          <Link
            href="/home"
            onClick={clearFilters}
            aria-label="TuDu home"
            className="flex min-w-0 flex-1 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Image
              src="/tudu-logo.png"
              alt=""
              width={407}
              height={408}
              priority
              className="h-10 w-10 shrink-0 drop-shadow-sm"
            />
            <span className="min-w-0 leading-tight">
              <span className="block text-sm font-semibold">TuDu</span>
              <span className="block truncate text-[11px] text-muted-foreground">
                Tri-Cities Chamber
              </span>
            </span>
          </Link>
          {/* The overdue bell sits at the right end of the logo row. */}
          <OverdueBell align="beside" />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col divide-y overflow-y-auto [&>*]:p-4">
      <div className="grid grid-cols-2 gap-2">
        <Link
          href="/contracts/new"
          className="whitespace-nowrap rounded-md bg-sky-600 px-2 py-2 text-center text-sm font-medium text-white hover:bg-sky-700"
        >
          Upload Contract
        </Link>
        <Link
          href="/events/new"
          className="whitespace-nowrap rounded-md bg-sky-600 px-2 py-2 text-center text-sm font-medium text-white hover:bg-sky-700"
        >
          Add Event
        </Link>
      </div>

      <div>
        <SearchBar
          className="max-w-none"
          value={filters.search}
          onChange={filters.setSearch}
        />
      </div>

      <nav className="flex flex-col gap-1">
        {SIDEBAR_NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={clearFilters}
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-card",
              isActive(pathname, href) && "bg-card font-medium",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="flex flex-col gap-4">
        <Section title="Event Series">{eventItems(events.repeat)}</Section>
        <Section title="One-off Events">{eventItems(events.oneOff)}</Section>
        <Section title="Archived Events" startOpen={false}>
          {eventItems(events.archived)}
        </Section>
      </div>

      <div className="flex flex-col gap-4">
        <Section title="Pillar Partners">
          {partners.map((partner) => (
            <Item
              key={partner.id}
              label={partner.name}
              active={filters.sponsorId === partner.id}
              onClick={() => pickPartner(partner.id)}
            />
          ))}
        </Section>
        <Section title="Annual Partners" />
        <Section title="Program Partners" />
      </div>

      </div>

      {/* Who is signed in with Google (or Unknown user), pinned to the bottom. */}
      <div className="shrink-0">
        <UserMenu user={user} />
      </div>
    </aside>
  );
}
