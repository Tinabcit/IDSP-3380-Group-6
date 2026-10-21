import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { getEvents } from "../queries";
import { formatDate, formatDateTime, plural } from "../lib/format";
import { StatusBadge } from "../components/status-badge";
import { EmptyRow, PageIntro, Stat, StatGrid } from "../components/page-parts";

export async function EventsView() {
  const events = await getEvents();
  const now = new Date();

  const isUpcoming = (e: (typeof events)[number]) => e.startAt >= now && e.status !== "cancelled";
  const upcoming = events.filter(isUpcoming);
  const rest = events.filter((e) => !isUpcoming(e)).reverse(); // most recent first
  const next = upcoming[0];

  const confirmed = upcoming.flatMap((e) => e.sponsorEvents.filter((s) => s.status === "confirmed"));
  const ticketsOwed = confirmed.reduce((sum, s) => sum + s.compedTickets, 0);

  return (
    <div className="space-y-6">
      <PageIntro title="Events">
        Upcoming events first, then past and cancelled ones. Sponsor counts include confirmed
        sponsors and those still in the pipeline (prospective or offered).
      </PageIntro>

      <StatGrid>
        <Stat label="Upcoming events" value={upcoming.length} />
        <Stat
          label="Next event"
          value={next ? formatDate(next.startAt) : "None scheduled"}
          detail={next?.name}
        />
        <Stat
          label="Confirmed sponsorships"
          value={confirmed.length}
          detail={`${plural(ticketsOwed, "comped ticket")} across upcoming events`}
        />
      </StatGrid>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Starts</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sponsors</TableHead>
              <TableHead className="text-right">Comped tickets</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length === 0 ? (
              <EmptyRow colSpan={5}>No events yet. Add one in Supabase to see it here.</EmptyRow>
            ) : (
              [...upcoming, ...rest].map((event) => {
                const past = !isUpcoming(event);
                const confirmedCount = event.sponsorEvents.filter((s) => s.status === "confirmed").length;
                const pipeline = event.sponsorEvents.filter((s) =>
                  ["prospective", "offered"].includes(s.status),
                ).length;
                const tickets = event.sponsorEvents
                  .filter((s) => s.status === "confirmed" || s.status === "completed")
                  .reduce((sum, s) => sum + s.compedTickets, 0);

                return (
                  <TableRow key={event.id} className={cn(past && "text-muted-foreground")}>
                    <TableCell>
                      <div className="font-medium text-foreground">{event.name}</div>
                      {event.series ? (
                        <div className="text-xs text-muted-foreground">
                          Part of {event.series.name}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{formatDateTime(event.startAt)}</TableCell>
                    <TableCell>
                      <StatusBadge value={event.status} />
                    </TableCell>
                    <TableCell>
                      {confirmedCount} confirmed
                      {pipeline > 0 ? (
                        <span className="text-muted-foreground">, {pipeline} in pipeline</span>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{tickets}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
