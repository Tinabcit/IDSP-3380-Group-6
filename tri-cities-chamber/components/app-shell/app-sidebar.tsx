"use client";

import { createContext, useContext, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Briefcase,
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
import { useOptionalPlannerData } from "./planner-provider";

export function UserSelect() {
  const data = useOptionalPlannerData();
  if (!data) return null;
  return (
    <Select value={data.currentUserId} onValueChange={data.setCurrentUser}>
      <SelectTrigger
        aria-label="Signed in as"
        className="h-9 w-full gap-2 bg-white"
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
  { href: "/", label: "Home", icon: Home },
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
  const value = useMemo(
    () => ({ search, eventId, sponsorId, setSearch, setEventId, setSponsorId }),
    [search, eventId, sponsorId],
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
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
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
        "flex items-center gap-2 rounded-md px-2 py-1 text-left text-sm hover:bg-white",
        active && "bg-white font-medium",
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

export function AppSidebar({ className }: { className?: string }) {
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
    if (pathname !== "/") router.push("/");
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
        "bg-neutral-50 flex flex-col divide-y [&>*]:p-4",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-md bg-sky-600 text-white">
          <Briefcase className="h-4 w-4" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold">TuDu</p>
          <p className="text-[11px] text-muted-foreground">
            Tri-Cities Chamber
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Link
          href="/contracts/new"
          className="w-fit rounded-md bg-sky-600 px-3 py-1.5 text-sm text-white"
        >
          Upload Contract
        </Link>
      </div>

      <nav className="flex flex-col gap-1">
        {SIDEBAR_NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={href === "/" ? clearFilters : undefined}
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-white",
              isActive(pathname, href) && "bg-white font-medium",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="flex flex-col gap-4">
        <Section title="Repeat Events">{eventItems(events.repeat)}</Section>
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
    </aside>
  );
}
