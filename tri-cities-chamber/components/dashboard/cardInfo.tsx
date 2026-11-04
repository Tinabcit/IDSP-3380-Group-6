/*
 * STARTER PART of the dashboard: one number with a label. Build it out and style it yourself.
 * To make another part, copy this file and rename it. Guide: docs/PAGE_STARTER_GUIDE.md
 */

/** TYPES (already set up): the props this part takes. To add a prop, add a line here. */
type CardInfoProps = {
  headingText: string;
  numberInfo: number;
};

/** A small stat: a label and a number. */
export function CardInfo({ headingText, numberInfo }: CardInfoProps) {
  return (
    <div>
      <p>{headingText}</p>
      <p>{numberInfo}</p>
    </div>
  );
}
