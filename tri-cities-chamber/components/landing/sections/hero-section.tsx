/*
 * STARTER SECTION for the landing page. Build it out and style it yourself.
 * To make another section, copy this file and rename it. Guide: docs/PAGE_STARTER_GUIDE.md
 */

/** TYPES (already set up): the props this section takes. To add a prop, add a line here. */
type HeroSectionProps = {
  title: string;
  subtitle: string;
};

/** The top section of the landing page. */
export function HeroSection({ title, subtitle }: HeroSectionProps) {
  return (
    <section>
      <h1>{title}</h1>
      <p>{subtitle}</p>
      {/* TODO: build this section */}
    </section>
  );
}
