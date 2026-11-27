import { Suspense } from "react";

import { DataGate } from "@/components/app-shell/planner-provider";
import { EventDetailPage } from "@/components/events/event-detail-page";

export const metadata = { title: "Event | Tri-Cities Chamber" };

/**
 * Page at /events/:id. Shows one event. Next.js gives us the id
 * asynchronously, so we wait for it inside <Suspense>.
 */
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<LoadingEvent />}>
      <EventRoute params={params} />
    </Suspense>
  );
}

/** Waits for the id from the URL, then shows EventDetailPage for that id. */
// `params` is only known at request time, so it is read inside the boundary.
async function EventRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <DataGate>
      <EventDetailPage id={id} />
    </DataGate>
  );
}

/** Simple "Loading" message shown while we wait for the id. */
function LoadingEvent() {
  return (
    <div role="status" className="grid min-h-[50dvh] place-items-center text-sm text-muted-foreground">
      Loading
    </div>
  );
}
