import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { getTicketsToFulfill } from "../queries";
import { dueLabel, formatDateTime, plural } from "../lib/format";
import { StatusBadge } from "../components/status-badge";
import { PageIntro, Stat, StatGrid } from "../components/page-parts";

type Row = Awaited<ReturnType<typeof getTicketsToFulfill>>[number];

export async function TicketsView() {
  const rows = await getTicketsToFulfill();
  const now = new Date();

  // Group sponsor rows under their event, preserving the query's date order.
  const groups = new Map<string, { event: Row["event"]; rows: Row[] }>();
  for (const row of rows) {
    const group = groups.get(row.event.id);
    if (group) group.rows.push(row);
    else groups.set(row.event.id, { event: row.event, rows: [row] });
  }

  const total = rows.reduce((sum, r) => sum + r.compedTickets, 0);
  const sponsorCount = new Set(rows.map((r) => r.sponsorId)).size;

  return (
    <div className="space-y-6">
      <PageIntro title="Tickets to fulfill">
        Comped tickets owed to confirmed sponsors for events that are still in planning or open.
      </PageIntro>

      <StatGrid>
        <Stat label="Tickets owed" value={total} />
        <Stat label="Sponsors waiting" value={sponsorCount} />
        <Stat label="Events" value={groups.size} />
      </StatGrid>

      {groups.size === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">No tickets owed</CardTitle>
            <CardDescription>
              Comped tickets appear here once a sponsorship is confirmed with a ticket count above zero.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        [...groups.values()].map(({ event, rows: eventRows }) => {
          const eventTotal = eventRows.reduce((sum, r) => sum + r.compedTickets, 0);
          const countdown = dueLabel(event.startAt, now);
          return (
            <Card key={event.id}>
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0">
                <div className="space-y-1">
                  <CardTitle className="text-base">{event.name}</CardTitle>
                  <CardDescription>
                    {formatDateTime(event.startAt)} ({countdown.text.toLowerCase()})
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge value={event.status} />
                  <span className="text-sm font-medium tabular-nums">{plural(eventTotal, "ticket")}</span>
                </div>
              </CardHeader>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sponsor</TableHead>
                    <TableHead>Rank</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead className="text-right">Tickets</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eventRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.sponsor.name}</TableCell>
                      <TableCell>
                        <StatusBadge value={row.sponsor.rank} />
                      </TableCell>
                      <TableCell>{row.sponsorshipLevel ?? <span className="text-muted-foreground">—</span>}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.compedTickets}</TableCell>
                      <TableCell className="max-w-xs text-sm text-muted-foreground">{row.notes ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          );
        })
      )}
    </div>
  );
}
