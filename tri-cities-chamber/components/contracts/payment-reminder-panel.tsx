
"use client";

import Link from "next/link";

import { useOptionalPlannerData } from "@/components/app-shell/planner-provider";
import { getPaymentNotifications } from "@/lib/planner/payment-notifications";
import { formatCurrency } from "@/lib/planner/contracts";

export function PaymentReminderPanel() {
  const data = useOptionalPlannerData();

  if (!data) return null;

  const notifications = getPaymentNotifications(
    data.contracts,
    data.sponsors,
    data.today
  );

  if (notifications.length === 0) {
    return (
      <div className="rounded-lg border p-4">
        <h2 className="text-lg font-semibold">
          Sponsorship Payment Reminders
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          No outstanding payment reminders.
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-lg border p-4">
      <h2 className="mb-4 text-lg font-semibold">
        Sponsorship Payment Reminders
      </h2>

      <div className="space-y-3">
        {notifications.map((notification) => (
          <Link
            key={notification.id}
            href={`/contracts/${encodeURIComponent(
              notification.contractId
            )}`}
            className="block rounded-md border p-3 hover:bg-secondary"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">
                  {notification.sponsorName}
                </p>

                <p className="text-sm text-muted-foreground">
                  {notification.paymentLabel}
                </p>

                <p className="text-xs text-muted-foreground">
                  Due: {notification.dueDate}
                </p>
              </div>

              <div className="text-right">
                <p className="font-semibold">
                  {formatCurrency(notification.amount)}
                </p>

                <p
                  className={
                    notification.status === "overdue"
                      ? "text-sm font-medium text-red-600"
                      : notification.status === "urgent"
                      ? "text-sm font-medium text-orange-600"
                      : "text-sm text-muted-foreground"
                  }
                >
                  {notification.status === "overdue"
                    ? "Overdue"
                    : notification.status === "urgent"
                    ? "Due Soon"
                    : "Upcoming"}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
