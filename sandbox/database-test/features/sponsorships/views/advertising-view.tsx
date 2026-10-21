import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { getOpenAdDeliverables } from "../queries";
import { DUE_SOON_DAYS } from "../lib/constants";
import { DAY_MS, formatDate } from "../lib/format";
import { StatusBadge } from "../components/status-badge";
import { DueDate, EmptyRow, PageIntro, Stat, StatGrid } from "../components/page-parts";

export async function AdvertisingView() {
  const items = await getOpenAdDeliverables();
  const now = new Date();
  const soon = new Date(now.getTime() + DUE_SOON_DAYS * DAY_MS);

  const overdue = items.filter((i) => i.dueAt && i.dueAt < now);
  const dueSoon = items.filter((i) => i.dueAt && i.dueAt >= now && i.dueAt <= soon);
  const unscheduled = items.filter((i) => !i.dueAt);

  return (
    <div className="space-y-6">
      <PageIntro title="Advertising to fulfill">
        Deliverables marked upcoming or due, soonest first. Anything past its due date is
        flagged as overdue regardless of its stored status.
      </PageIntro>

      <StatGrid>
        <Stat label="Open deliverables" value={items.length} detail={unscheduled.length ? `${unscheduled.length} without a due date` : undefined} />
        <Stat label="Overdue" value={overdue.length} tone={overdue.length ? "danger" : undefined} />
        <Stat label={`Due in the next ${DUE_SOON_DAYS} days`} value={dueSoon.length} />
      </StatGrid>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Deliverable</TableHead>
              <TableHead>Sponsor</TableHead>
              <TableHead>Event</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <EmptyRow colSpan={6}>Every advertising deliverable is fulfilled.</EmptyRow>
            ) : (
              items.map((item) => {
                const isOverdue = item.dueAt != null && item.dueAt < now;
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">{item.advertising.name}</div>
                      {item.notes ? (
                        <div className="max-w-xs text-xs text-muted-foreground">{item.notes}</div>
                      ) : null}
                    </TableCell>
                    <TableCell>{item.sponsor.name}</TableCell>
                    <TableCell>
                      {item.event ? (
                        <div className="flex flex-col">
                          <span>{item.event.name}</span>
                          <span className="text-xs text-muted-foreground">{formatDate(item.event.startAt)}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not tied to an event</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{item.quantity}</TableCell>
                    <TableCell>
                      <DueDate date={item.dueAt} now={now} soonDays={DUE_SOON_DAYS} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={isOverdue ? "overdue" : item.status} />
                    </TableCell>
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
