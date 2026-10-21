import { redirect } from "next/navigation";
import { BASE_PATH } from "@/features/sponsorships/lib/constants";

export default function SponsorshipSandboxIndex() {
  redirect(`${BASE_PATH}/events`);
}
