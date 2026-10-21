import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { getSponsors } from "../queries";
import { COMMITTED_SPONSORSHIP_STATUSES, RENEWAL_WINDOW_DAYS } from "../lib/constants";
import { DAY_MS, formatDateOnly } from "../lib/format";
import { StatusBadge } from "../components/status-badge";
import { DueDate, EmptyRow, PageIntro, Stat, StatGrid } from "../components/page-parts";

export async function SponsorsView() {
  const sponsors = await getSponsors();
  const now = new Date();
  const windowEnd = new Date(now.getTime() + RENEWAL_WINDOW_DAYS * DAY_MS);

  const active = sponsors.filter((s) => s.status === "active");
  const pillars = active.filter((s) => s.rank === "pillar");
  const renewals = sponsors.filter((s) => {
    const due = s.agreements[0]?.renewalContactDueAt;
    return due != null && due <= windowEnd;
  });
  const overdueRenewals = renewals.filter((s) => s.agreements[0]!.renewalContactDueAt! < now);

  return (
    <div className="space-y-6">
      <PageIntro title="Sponsors">
        Ordered by rank, then name. The agreement shown is the sponsor’s current active or
        pending-renewal agreement.
      </PageIntro>

      <StatGrid>
        <Stat label="Active sponsors" value={active.length} detail={`of ${sponsors.length} total`} />
        <Stat label="Active pillar partners" value={pillars.length} />
        <Stat
          label="Renewal contacts due"
          value={renewals.length}
          tone={overdueRenewals.length > 0 ? "danger" : undefined}
          detail={
            overdueRenewals.length > 0
              ? `${overdueRenewals.length} overdue, rest within ${RENEWAL_WINDOW_DAYS} days`
              : `Within the next ${RENEWAL_WINDOW_DAYS} days`
          }
        />
      </StatGrid>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sponsor</TableHead>
              <TableHead>Rank</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Agreement</TableHead>
              <TableHead>Renewal contact</TableHead>
              <TableHead className="text-right">Events</TableHead>
              <TableHead className="text-right">Open ads</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sponsors.length === 0 ? (
              <EmptyRow colSpan={7}>No sponsors yet. Run the seed script or add one in Supabase.</EmptyRow>
            ) : (
              sponsors.map((sponsor) => {
                const agreement = sponsor.agreements[0];
                const eventCount = sponsor.sponsorEvents.filter((se) =>
                  (COMMITTED_SPONSORSHIP_STATUSES as readonly string[]).includes(se.status),
                ).length;

                return (
                  <TableRow key={sponsor.id}>
                    <TableCell className="font-medium">{sponsor.name}</TableCell>
                    <TableCell>
                      <StatusBadge value={sponsor.rank} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={sponsor.status} />
                    </TableCell>
                    <TableCell>
                      {agreement ? (
                        <div className="flex flex-col gap-1">
                          <span className="whitespace-nowrap">
                            {formatDateOnly(agreement.startDate)} to {formatDateOnly(agreement.endDate)}
                          </span>
                          {agreement.status !== "active" ? (
                            <StatusBadge value={agreement.status} className="w-fit" />
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No current agreement</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {agreement ? (
                        <DueDate date={agreement.renewalContactDueAt} now={now} soonDays={RENEWAL_WINDOW_DAYS} />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{eventCount}</TableCell>
                    <TableCell className="text-right tabular-nums">{sponsor._count.adDeliverables}</TableCell>
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
