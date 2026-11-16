
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

  // Styles that work in both light and dark mode
  const inputStyle =
    "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary";

  const sectionStyle =
    "space-y-3 rounded-xl border border-border bg-card p-4 text-card-foreground";

  const optionStyle =
    "rounded-full bg-muted px-4 py-2 text-sm text-foreground hover:bg-accent";

  const selectedStyle =
    "rounded-full bg-blue-700 px-4 py-2 text-sm text-white dark:bg-blue-600";

  const footerButtonStyle =
    "rounded-md border border-border bg-background px-4 py-2 text-sm text-foreground hover:bg-accent";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="comp-ticket-title"
        className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-border bg-background text-foreground shadow-xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border p-5">
          <div className="flex items-center gap-3">
            <Ticket
              className="shrink-0 text-blue-700 dark:text-blue-400"
              size={26}
            />

            <div>
              <h2
                id="comp-ticket-title"
                className="text-xl font-bold text-foreground"
              >
                Give Comp Tickets
              </h2>

              <p className="text-sm text-muted-foreground">
                Issue complimentary event tickets to guests,
                sponsors, and staff.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4 overflow-y-auto p-5">
          {/* Recipient */}
          <section className={sectionStyle}>
            <h3 className="font-semibold">Recipient</h3>

            <div className="flex flex-wrap gap-2">
              {recipients.map((name) => (
                <button
                  type="button"
                  key={name}
                  onClick={() => {
                    setRecipient(name);
                    setError("");
                  }}
                  aria-pressed={recipient === name}
                  className={
                    recipient === name
                      ? selectedStyle
                      : optionStyle
                  }
                >
                  {name}
                </button>
              ))}
            </div>
          </section>

          {/* Sponsor Details */}
          <section className={sectionStyle}>
            <h3 className="font-semibold">
              Sponsor Details
            </h3>

            <div className="grid gap-3 sm:grid-cols-[1fr_130px]">
              <div>
                <label
                  htmlFor="comp-sponsor"
                  className="mb-1 block text-sm"
                >
                  Sponsor Name
                </label>

                <input
                  id="comp-sponsor"
                  className={inputStyle}
                  value={sponsor}
                  onChange={(e) => {
                    setSponsor(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter sponsor name"
                />
              </div>

              <div>
                <label
                  htmlFor="comp-quantity"
                  className="mb-1 block text-sm"
                >
                  Number of Tickets
                </label>

                <input
                  id="comp-quantity"
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

          {/* Ticket Details */}
          <section className={sectionStyle}>
            <h3 className="font-semibold">
              Ticket Details
            </h3>

            <div className="flex flex-wrap gap-2">
              {ticketTypes.map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setTicketType(type)}
                  aria-pressed={ticketType === type}
                  className={
                    ticketType === type
                      ? selectedStyle
                      : optionStyle
                  }
                >
                  {type}
                </button>
              ))}
            </div>
          </section>

          {/* Event Details */}
          <section className={sectionStyle}>
            <h3 className="font-semibold">
              Event Details
            </h3>

            <div>
              <label
                htmlFor="comp-event"
                className="mb-1 block text-sm"
              >
                Event Name
              </label>

              <input
                id="comp-event"
                className={inputStyle}
                placeholder="Enter event name"
                value={eventName}
                onChange={(e) =>
                  setEventName(e.target.value)
                }
              />
            </div>

            <div>
              <label
                htmlFor="comp-location"
                className="mb-1 flex items-center gap-2 text-sm"
              >
                <MapPin
                  size={18}
                  className="text-blue-700 dark:text-blue-400"
                />
                Event Location
              </label>

              <input
                id="comp-location"
                className={inputStyle}
                value={location}
                onChange={(e) =>
                  setLocation(e.target.value)
                }
              />
            </div>
          </section>

          {/* Permissions */}
          <section className={sectionStyle}>
            <h3 className="font-semibold">
              Permissions
            </h3>

            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={plusOne}
                  onChange={(e) =>
                    setPlusOne(e.target.checked)
                  }
                  className="accent-blue-700"
                />
                Allow Plus One
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={vipLounge}
                  onChange={(e) =>
                    setVipLounge(e.target.checked)
                  }
                  className="accent-blue-700"
                />
                VIP Lounge Access
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={backstage}
                  onChange={(e) =>
                    setBackstage(e.target.checked)
                  }
                  className="accent-blue-700"
                />
                Backstage Pass
              </label>
            </div>
          </section>

          {/* Internal Notes */}
          <section className={sectionStyle}>
            <h3 className="font-semibold">
              Internal Notes
            </h3>

            <textarea
              className={`${inputStyle} min-h-28`}
              value={notes}
              onChange={(e) =>
                setNotes(e.target.value)
              }
              placeholder="Add any specific instructions for the box office or event staff..."
            />
          </section>

          {/* Error message */}
          {error && (
            <p
              role="alert"
              className="text-sm text-red-600 dark:text-red-400"
            >
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap justify-end gap-2 border-t border-border p-4">
          <button
            type="button"
            onClick={onClose}
            className={footerButtonStyle}
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => handleSave("Draft")}
            className={footerButtonStyle}
          >
            Save
          </button>

          <button
            type="button"
            onClick={() => handleSave("Issued")}
            className="flex items-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-sm text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            <Plus size={16} />
            Issue Tickets
          </button>
        </div>
      </div>
    </div>
  );
}
