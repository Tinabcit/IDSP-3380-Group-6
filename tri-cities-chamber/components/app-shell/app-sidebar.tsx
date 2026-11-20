
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

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

// --------------------------------------------------
// User Selection
// --------------------------------------------------

export function UserSelect() {
  const data = useOptionalPlannerData();

  if (!data) return null;

  return (
    <Select
      value={data.currentUserId}
      onValueChange={data.setCurrentUser}
    >
      <SelectTrigger
        aria-label="Signed in as"
        className="h-9 w-full gap-2 bg-card"
      >
        <SelectValue />
      </SelectTrigger>

      <SelectContent>
        {data.staff.map((person) => (
          <SelectItem
            key={person.id}
            value={person.id}
          >
            {person.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// --------------------------------------------------
// Navigation
// --------------------------------------------------

export const NAV = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/contracts", label: "Contracts", icon: FileText },
  { href: "/events", label: "Events", icon: Star },
  { href: "/partners", label: "Partners", icon: Handshake },
] as const;

export function isActive(
  pathname: string,
  href: string
) {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
}

// --------------------------------------------------
// Home Filters
// --------------------------------------------------

type HomeFilters = {
  search: string;
  eventId: string;
  sponsorId: string;

  setSearch: (value: string) => void;
  setEventId: (value: string) => void;
  setSponsorId: (value: string) => void;

  pickEvent: (id: string) => void;
  pickSponsor: (id: string) => void;

  viewKey: number;
};

const HomeFiltersContext =
  createContext<HomeFilters | null>(null);

export function HomeFiltersProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [search, setSearch] = useState("");
  const [eventId, setEventId] = useState("all");
  const [sponsorId, setSponsorId] = useState("all");
  const [viewKey, setViewKey] = useState(0);

  const switchSponsor = useCallback(
    (next: string) => {
      if (next !== sponsorId) {
        setEventId("all");
        setSearch("");
      }

      setSponsorId(next);
    },
    [sponsorId]
  );

  const pickView = useCallback(
    (event: string, sponsor: string) => {
      setEventId(event);
      setSponsorId(sponsor);
      setSearch("");
      setViewKey((key) => key + 1);
    },
    []
  );

  const pickEvent = useCallback(
    (id: string) => {
      pickView(
        eventId === id ? "all" : id,
        "all"
      );
    },
    [pickView, eventId]
  );

  const pickSponsor = useCallback(
    (id: string) => {
      pickView(
        "all",
        sponsorId === id ? "all" : id
      );
    },
    [pickView, sponsorId]
  );

  const value = useMemo(
    () => ({
      search,
      eventId,
      sponsorId,
      setSearch,
      setEventId,
      setSponsorId: switchSponsor,
      pickEvent,
      pickSponsor,
      viewKey,
    }),
    [
      search,
      eventId,
      sponsorId,
      switchSponsor,
      pickEvent,
      pickSponsor,
      viewKey,
    ]
  );

  return (
    <HomeFiltersContext.Provider value={value}>
      {children}
    </HomeFiltersContext.Provider>
  );
}

export function useHomeFilters(): HomeFilters {
  const filters = useContext(HomeFiltersContext);

  if (!filters) {
    throw new Error(
      "useHomeFilters must be used inside HomeFiltersProvider"
    );
  }

  return filters;
}

// --------------------------------------------------
// Sidebar Navigation
// --------------------------------------------------

export const SIDEBAR_NAV = [
  { href: "/home", label: "Home", icon: Home },
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/calendar",
    label: "Calendar",
    icon: CalendarDays,
  },
  {
    href: "/contracts",
    label: "Contracts",
    icon: FileText,
  },
  { href: "/events", label: "Events", icon: Star },
  {
    href: "/partners",
    label: "Partners",
    icon: Handshake,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
] as const;

// --------------------------------------------------
// Collapsible Sidebar Section
// --------------------------------------------------

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
        aria-expanded={open}
        className="flex w-full items-center justify-between text-xs font-medium text-muted-foreground"
      >
        {title}

        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform",
            !open && "-rotate-90"
          )}
        />
      </button>

      {open && children}
    </div>
  );
}

// --------------------------------------------------
// Event / Partner Item
// --------------------------------------------------

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
        "flex w-full min-w-0 items-center gap-2 rounded-md px-2 py-1 text-left text-sm hover:bg-card",
        active && "bg-card font-medium"
      )}
    >
      <span className="min-w-0 flex-1 truncate">
        {label}
      </span>

      {tasks > 0 && (
        <span className="shrink-0 whitespace-nowrap rounded-full bg-sky-600 px-2 py-0.5 text-xs text-white">
          {tasks} tasks
        </span>
      )}
    </button>
  );
}

// --------------------------------------------------
// Main Sidebar
// --------------------------------------------------

export function AppSidebar({
  className,
  user,
}: {
  className?: string;
  user: DisplayUser;
}) {
  const data = useOptionalPlannerData();
  const filters = useHomeFilters();

  const pathname = usePathname();
  const router = useRouter();

  const events = data
    ? splitEvents(data.events, data.today)
    : {
        repeat: [],
        oneOff: [],
        archived: [],
      };

  const partners = data?.sponsors ?? [];

  // Count incomplete tasks for each event
  function openTasks(eventId: string) {
    return (data?.tasks ?? []).filter(
      (task) =>
        task.eventId === eventId &&
        !task.completed
    ).length;
  }

  const viewPicked =
    filters.eventId !== "all" ||
    filters.sponsorId !== "all";

  function goHome() {
    if (pathname !== "/home") {
      router.push("/home");
    }
  }

  function pickEvent(id: string) {
    filters.pickEvent(id);
    goHome();
  }

  function pickPartner(id: string) {
    filters.pickSponsor(id);
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
        "flex min-w-0 flex-col divide-y bg-muted [&>*]:p-4",
        className
      )}
    >

      {/* -------------------------------- */}
      {/* Sidebar Header */}
      {/* -------------------------------- */}

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
              <span className="block text-sm font-semibold">
                TuDu
              </span>

              <span className="block truncate text-[11px] text-muted-foreground">
                Tri-Cities Chamber
              </span>
            </span>
          </Link>

          {/* Overdue Notifications */}
          <OverdueBell align="beside" />

        </div>
      </div>

      {/* -------------------------------- */}
      {/* Scrollable Sidebar Content */}
      {/* -------------------------------- */}

      <div className="flex min-h-0 flex-1 flex-col divide-y overflow-y-auto [&>*]:p-4">

        {/* -------------------------------- */}
        {/* Upload Contract + Add Event */}
        {/* FIXED: Equal-width buttons */}
        {/* -------------------------------- */}

        <div className="grid w-full min-w-0 grid-cols-2 gap-2">

          <Link
            href="/contracts/new"
            className={cn(
              "flex min-h-11 min-w-0 items-center justify-center",
              "rounded-md bg-sky-600 px-1.5 py-2.5",
              "text-center text-xs font-medium leading-tight text-white",
              "transition-colors hover:bg-sky-700",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
          >
            Upload Contract
          </Link>

          <Link
            href="/events/new"
            className={cn(
              "flex min-h-11 min-w-0 items-center justify-center",
              "rounded-md bg-sky-600 px-1.5 py-2.5",
              "text-center text-xs font-medium leading-tight text-white",
              "transition-colors hover:bg-sky-700",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
          >
            Add Event
          </Link>

        </div>

        {/* -------------------------------- */}
        {/* Search Bar */}
        {/* -------------------------------- */}

        <div>
          <SearchBar
            className="max-w-none"
            value={filters.search}
            onChange={filters.setSearch}
          />
        </div>

        {/* -------------------------------- */}
        {/* Main Navigation */}
        {/* -------------------------------- */}

        <nav
          aria-label="Main navigation"
          className="flex flex-col gap-1"
        >
          {SIDEBAR_NAV.map(
            ({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={clearFilters}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-card",
                  isActive(pathname, href) &&
                    !(
                      href === "/home" &&
                      viewPicked
                    ) &&
                    "bg-card font-medium"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />

                {label}
              </Link>
            )
          )}
        </nav>

        {/* -------------------------------- */}
        {/* Event Sections */}
        {/* -------------------------------- */}

        <div className="flex flex-col gap-4">

          <Section title="Event Series">
            {eventItems(events.repeat)}
          </Section>

          <Section title="One-off Events">
            {eventItems(events.oneOff)}
          </Section>

          <Section
            title="Archived Events"
            startOpen={false}
          >
            {eventItems(events.archived)}
          </Section>

        </div>

        {/* -------------------------------- */}
        {/* Partner Sections */}
        {/* -------------------------------- */}

        <div className="flex flex-col gap-4">

          <Section title="Pillar Partners">
            {partners.map((partner) => (
              <Item
                key={partner.id}
                label={partner.name}
                active={
                  filters.sponsorId === partner.id
                }
                onClick={() =>
                  pickPartner(partner.id)
                }
              />
            ))}
          </Section>

          <Section title="Annual Partners" />

          <Section title="Program Partners" />

        </div>

      </div>

      {/* -------------------------------- */}
      {/* Signed-In Google Account */}
      {/* -------------------------------- */}

      <div className="shrink-0">
        <UserMenu user={user} />
      </div>

    </aside>
  );
}
