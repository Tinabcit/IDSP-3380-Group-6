        active={filters.eventId === event.id}
        onClick={() => pickEvent(event.id)}
      />
    ));
  }

  return (
    <aside
      aria-label="Sidebar"
      className={cn("flex min-h-0 min-w-0 flex-col divide-y bg-muted [&>*]:p-4", className)}
    >
      {/* Branding and notifications */}
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
          <OverdueBell align="beside" />
        </div>
      </div>

      {/* Scrollable controls and navigation */}
      <div className="flex min-h-0 flex-1 flex-col divide-y overflow-y-auto [&>*]:p-4">
        <div className="grid w-full min-w-0 grid-cols-2 gap-2">
          <Link
            href="/contracts/new"
            className="flex min-h-11 min-w-0 items-center justify-center rounded-md bg-sky-600 px-1.5 py-2.5 text-center text-xs font-medium leading-tight text-white transition-colors hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Upload Contract
          </Link>
          <Link
            href="/events/new"
            className="flex min-h-11 min-w-0 items-center justify-center rounded-md bg-sky-600 px-1.5 py-2.5 text-center text-xs font-medium leading-tight text-white transition-colors hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

        <nav aria-label="Main navigation" className="flex flex-col gap-1">
          {SIDEBAR_NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={clearFilters}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-card",
                isActive(pathname, href) &&
                  !(href === "/tasks" && viewPicked) &&
                  "bg-card font-medium"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
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

      {/* Signed-in account */}
      <div className="shrink-0">
        <UserMenu user={user} />
      </div>
    </aside>
  );
}
