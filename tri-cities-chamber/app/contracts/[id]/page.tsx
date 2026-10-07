import { Suspense } from "react";

import { DataGate } from "@/components/app-shell/planner-provider";
import { ContractDetail } from "@/components/contracts/contract-detail";

export const metadata = { title: "Contract | Tri-Cities Chamber" };

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<LoadingContract />}>
      <ContractRoute params={params} />
    </Suspense>
  );
}

// `params` is only known at request time, so it is read inside the boundary.
async function ContractRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <DataGate>
      <ContractDetail id={id} />
    </DataGate>
  );
}

function LoadingContract() {
  return (
    <div role="status" className="grid min-h-[50dvh] place-items-center text-sm text-muted-foreground">
      Loading
    </div>
  );
}
