
"use client";

import { useState } from "react";
import {
  Ticket,
  X,
  MapPin,
  Plus,
} from "lucide-react";

export type CompTicket = {
  id: string;
  recipient: string;
  sponsorName: string;
  quantity: number;
  ticketType: string;
  eventName: string;
  location: string;
  plusOne: boolean;
  vipLounge: boolean;
  backstage: boolean;
  notes: string;
  status: "Draft" | "Issued";
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (ticket: CompTicket) => void;
  sponsorName?: string;
};

const recipients = [
  "Alice Ross",
  "Marcus Reed",
  "Sarah Jenkins",
];

const ticketTypes = [
  "General Admission",
  "VIP Access",
  "Press Pass",
];

export default function GiveCompTicketsDialog({
  open,
  onClose,
  onSave,
  sponsorName = "",
}: Props) {
  const [recipient, setRecipient] = useState("");
  const [sponsor, setSponsor] = useState(sponsorName);
  const [quantity, setQuantity] = useState(1);
  const [ticketType, setTicketType] = useState("General Admission");
  const [eventName, setEventName] = useState("");
  const [location, setLocation] = useState("Main Hall");
  const [plusOne, setPlusOne] = useState(false);
  const [vipLounge, setVipLounge] = useState(false);
  const [backstage, setBackstage] = useState(false);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  function handleSave(status: "Draft" | "Issued") {
    if (!sponsor.trim()) {
      setError("Please enter a sponsor name.");
      return;
    }

    if (status === "Issued" && !recipient) {
      setError("Please select a recipient.");
      return;
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      setError("Please enter at least one ticket.");
      return;
    }

    const ticket: CompTicket = {
      id: crypto.randomUUID(),
      recipient,
      sponsorName: sponsor.trim(),
      quantity,
      ticketType,
      eventName,
      location,
      plusOne,
      vipLounge,
      backstage,
      notes,
      status,
    };

    onSave(ticket);
    onClose();
  }

  const inputStyle =
    "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-blue-500";

  const sectionStyle =
    "rounded-xl border border-border p-4 space-y-3";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="comp-ticket-title"
        className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-card text-card-foreground shadow-xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b p-5">
          <div className="flex items-center gap-3">
            <Ticket className="text-blue-700 dark:text-blue-400" size={26} />
            <div>
              <h2
                id="comp-ticket-title"
                className="text-xl font-bold"
              >
                Give Comp Tickets
              </h2>
              <p className="text-sm text-muted-foreground">
                Issue complimentary event tickets to
                guests, sponsors, and staff.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4 overflow-y-auto p-5">
          <section className={sectionStyle}>
            <h3 className="font-semibold">Recipient</h3>

            <div className="flex flex-wrap gap-2">
              {recipients.map((name) => (
                <button
                  type="button"
                  key={name}
                  onClick={() => setRecipient(name)}
                  className={`rounded-full px-4 py-2 text-sm ${
                    recipient === name
                      ? "bg-blue-700 text-white"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </section>

          <section className={sectionStyle}>
            <h3 className="font-semibold">Sponsor Details</h3>

            <div className="grid gap-3 sm:grid-cols-[1fr_130px]">
              <div>
                <label className="mb-1 block text-sm">
                  Sponsor Name
                </label>
                <input
                  className={inputStyle}
                  value={sponsor}
                  onChange={(e) => setSponsor(e.target.value)}
                  placeholder="Enter sponsor name"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm">
                  Number of Tickets
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  className={inputStyle}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Number(e.target.value))
                  }
                />
              </div>
            </div>
          </section>

          <section className={sectionStyle}>
            <h3 className="font-semibold">Ticket Details</h3>

            <div className="flex flex-wrap gap-2">
              {ticketTypes.map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setTicketType(type)}
                  className={`rounded-full px-4 py-2 text-sm ${
                    ticketType === type
                      ? "bg-blue-700 text-white"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </section>

          <section className={sectionStyle}>
            <h3 className="font-semibold">Event Details</h3>

            <label className="block text-sm">
              Event Name
            </label>
            <input
              className={inputStyle}
              placeholder="Enter event name"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
            />

            <div className="flex items-center gap-2 text-sm">
              <MapPin size={18} className="text-blue-700 dark:text-blue-400" />
              <span>Event Location</span>
            </div>

            <input
              className={inputStyle}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </section>

          <section className={sectionStyle}>
            <h3 className="font-semibold">Permissions</h3>

            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={plusOne}
                  onChange={(e) => setPlusOne(e.target.checked)}
                />
                Allow Plus One
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={vipLounge}
                  onChange={(e) => setVipLounge(e.target.checked)}
                />
                VIP Lounge Access
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={backstage}
                  onChange={(e) => setBackstage(e.target.checked)}
                />
                Backstage Pass
              </label>
            </div>
          </section>

          <section className={sectionStyle}>
            <h3 className="font-semibold">Internal Notes</h3>

            <textarea
              className={`${inputStyle} min-h-28`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any specific instructions for the box office or event staff..."
            />
          </section>

          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border bg-background px-4 py-2 text-sm text-foreground hover:bg-muted"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => handleSave("Draft")}
            className="rounded-md border bg-background px-4 py-2 text-sm text-foreground hover:bg-muted"
          >
            Save
          </button>

          <button
            type="button"
            onClick={() => handleSave("Issued")}
            className="flex items-center gap-2 rounded-md bg-blue-800 px-4 py-2 text-sm text-white"
          >
            <Plus size={16} />
            Issue Tickets
          </button>
        </div>
      </div>
    </div>
  );
}
