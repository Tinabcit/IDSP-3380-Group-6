import { describe, expect, it } from "vitest";

import {
  DEFAULT_SPONSOR_TODOS,
  SPONSOR_LEVELS,
  isDraft,
  levelLabel,
  validateSponsorInput,
} from "./sponsors";

describe("validateSponsorInput", () => {
  it("accepts a name on its own", () => {
    expect(validateSponsorInput({ name: "Northstar Events" })).toBeNull();
  });

  it("requires a name", () => {
    expect(validateSponsorInput({ name: "   " })).toBe("Enter a sponsor name.");
  });

  it("rejects a badly formed email but allows an empty one", () => {
    expect(validateSponsorInput({ name: "A", contactEmail: "nope" })).toBe("Enter a valid email address.");
    expect(validateSponsorInput({ name: "A", contactEmail: "" })).toBeNull();
    expect(validateSponsorInput({ name: "A", contactEmail: "a@b.com" })).toBeNull();
  });

  it("only allows http and https websites", () => {
    expect(validateSponsorInput({ name: "A", website: "ftp://x.com" })).toBe(
      "Enter a website starting with http:// or https://."
    );
    expect(validateSponsorInput({ name: "A", website: "not a url" })).toBe(
      "Enter a website starting with http:// or https://."
    );
    expect(validateSponsorInput({ name: "A", website: "https://x.com" })).toBeNull();
    expect(validateSponsorInput({ name: "A", website: "" })).toBeNull();
  });
});

describe("sponsor levels and todos", () => {
  it("lists the four levels in order", () => {
    expect(SPONSOR_LEVELS.map((l) => l.value)).toEqual(["platinum", "gold", "silver", "bronze"]);
  });

  it("gives a label for a level and an empty string for none", () => {
    expect(levelLabel("gold")).toBe("Gold");
    expect(levelLabel(undefined)).toBe("");
  });

  it("starts new sponsors with the four mockup todos, all not done", () => {
    expect(DEFAULT_SPONSOR_TODOS).toHaveLength(4);
    expect(DEFAULT_SPONSOR_TODOS.every((t) => !t.done)).toBe(true);
  });

  it("treats only status draft as a draft", () => {
    expect(isDraft({ status: "draft" })).toBe(true);
    expect(isDraft({ status: "active" })).toBe(false);
    expect(isDraft({})).toBe(false);
  });
});
