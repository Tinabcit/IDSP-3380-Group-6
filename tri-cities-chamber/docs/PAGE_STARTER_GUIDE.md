# Page starter guide

For working on the Landing and Dashboard pages without knowing TypeScript.

The files are TypeScript (`.tsx`) so they fit with the rest of the app, but **the types are already written for you**. The pages and their parts are bare starters: a heading, the data they receive, and `TODO` comments. Building the layout and adding your own styles is up to you. Most of the time you only edit the JSX (the HTML-like part) and classes, the same as you would in a `.jsx` file.

## Where to work

| Page | URL | Edit the page here | Build its parts here |
|---|---|---|---|
| Landing | `/` | `components/landing/landing-page.tsx` (the `LandingPage` function at the bottom) | `components/landing/sections/` |
| Dashboard | `/dashboard` (sidebar: Dashboard) | `components/dashboard/dashboard-page.tsx` | `components/dashboard/` |

You should not need to touch the files in `app/` for these pages; they only connect the URL to the page component.

Each parts folder already has a starter file (`sections/hero-section.tsx` for the landing page, `cardInfo.tsx` for the dashboard) that receives the right data. Fill it in, or copy it to make a new part.

What already works: the URLs and the data each part receives. The Sign Up / Login / Theme buttons on the landing page also work; they are just unstyled.

## Making a new component

1. Copy a starter file in the parts folder and rename it, e.g. `sponsor-list.tsx`.
2. Rename the function (`export function SponsorList`) and the props type (`type SponsorListProps`).
3. In the `TYPES (already set up)` block, list the props. Copy a line from the table below.
4. Import it in the page and use it: `<SponsorList sponsors={data.sponsors} />`.

```tsx
type SponsorListProps = {
  sponsors: Sponsor[];
};

export function SponsorList({ sponsors }: SponsorListProps) {
  return <ul>{sponsors.map((s) => <li key={s.id}>{s.name}</li>)}</ul>;
}
```

### Prop types to copy

| You want to pass | Write this in the props type |
|---|---|
| some text | `title: string;` |
| a number | `count: number;` |
| true / false | `isOpen: boolean;` |
| optional (may be missing) | `subtitle?: string;` |
| one event / a list of events | `event: ChamberEvent;` / `events: ChamberEvent[];` |
| sponsors, contracts, tasks | `sponsors: Sponsor[];` `contracts: Contract[];` `tasks: Task[];` |
| a function with no value | `onClose: () => void;` |
| a function that gets an id | `onRemove: (id: string) => void;` |
| other JSX inside the component | `children: React.ReactNode;` |

Import the data types from one place: `import type { ChamberEvent, Sponsor } from "@/lib/planner/types";`. All app data shapes (and the fields each one has) are listed in `lib/planner/types.ts`.

## Getting data

In a page (a file with `"use client"` at the top), call `const data = usePlannerData();`. Everything is on `data`, already typed: `data.events`, `data.sponsors`, `data.contracts`, `data.tasks`, `data.staff`, `data.today`. To find one item by id: `data.lookups.eventsById.get(id)`. Pass what a part needs to it as props, rather than calling `usePlannerData()` inside every small part.

## shadcn components (in `components/ui/`)

Use these instead of plain `<button>`, `<input>` and similar elements: `Button`, `Input`, `Textarea`, `Label`, `Select`, `Checkbox`, `Badge`, `Card`, `Table`, `Dialog`, `AlertDialog`. They run on Base UI, which has two differences from online shadcn examples:

- A link that looks like a button: `<Button render={<Link href="/events" />} nativeButton={false}>Events</Button>` (not `asChild`).
- A dropdown needs `items` so it shows names instead of ids (`eventId` / `setEventId` here come from `useState("")`):

```tsx
<Select value={eventId || null} onValueChange={setEventId} items={events.map((ev) => ({ value: ev.id, label: ev.name }))}>
  <SelectTrigger><SelectValue placeholder="Choose an event" /></SelectTrigger>
  <SelectContent>
    {events.map((ev) => <SelectItem key={ev.id} value={ev.id}>{ev.name}</SelectItem>)}
  </SelectContent>
</Select>
```

You don't have to use these components. Plain HTML elements with your own styles are fine too.

## When a red squiggle appears

- Read the message and check the `TYPES` block: you probably used a prop that isn't listed there, or misspelled one. Add a line for it.
- `npm run build` shows every type error at once. `npm run dev` runs the site.
- Don't use `any` to silence an error. Ask a teammate instead; it's usually a one-line fix.
