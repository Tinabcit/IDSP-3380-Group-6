import { Suspense } from "react";

import { SandboxPage } from "@/components/sandbox/sandbox-page";
import { DataGate } from "@/components/app-shell/planner-provider";
import { ContractDetail } from "@/components/contracts/contract-detail";

export const metadata = { title: "Contract | Tri-Cities Chamber" };

/**
 * Page at /contracts/:id. Shows one contract. Next.js gives us the id
 * asynchronously, so we wait for it inside <Suspense>.
 */
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<LoadingContract />}>
      <ContractRoute params={params} />
    </Suspense>
  );
}

/** Waits for the id from the URL, then shows ContractDetail for that id. */
// `params` is only known at request time, so it is read inside the boundary.
async function ContractRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <SandboxPage>
      <DataGate>
        <ContractDetail id={id} />
      </DataGate>
    </SandboxPage>
  );
}

/** Simple "Loading" message shown while we wait for the id. */
function LoadingContract() {
  return (
    <div role="status" className="grid min-h-[50dvh] place-items-center text-sm text-muted-foreground">
      Loading
    </div>
  );
}
