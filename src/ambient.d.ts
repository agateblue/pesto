// In TS, interfaces are "open" and can be extended
interface Date {
  /**
   * Give a more precise return type to the method `toISOString()`:
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
   */
  toISOString(): TDateISO;
}

type TYear         = `${number}${number}${number}${number}`;
type TMonth        = `${number}${number}`;
type TDay          = `${number}${number}`;
type THours        = `${number}${number}`;
type TMinutes      = `${number}${number}`;
type TSeconds      = `${number}${number}`;
type TMilliseconds = `${number}${number}${number}`;

/**
 * Represent a string like `2021-01-08`
 */
type TDateISODate = `${TYear}-${TMonth}-${TDay}`;

/**
 * Represent a string like `14:42:34.678`
 */
type TDateISOTime = `${THours}:${TMinutes}:${TSeconds}.${TMilliseconds}`;

/**
 * Represent a string like `2021-01-08T14:42:34.678Z` (format: ISO 8601).
 *
 * It is not possible to type more precisely (list every possible values for months, hours etc) as
 * it would result in a warning from TypeScript:
 *   "Expression produces a union type that is too complex to represent. ts(2590)
 */
type TDateISO = `${TDateISODate}T${TDateISOTime}Z`;

export type DBEntryID = `${string}/${string}`

export type DBEntry = {
  _id: DBEntryID,
  _rev?: string,
  created_at: TDateISO,
  modified_at: TDateISO,
  version: string,  
}

export type Note = DBEntry & DiaryElement & {
  _id: `note/${string}`,
  title: string | null,
  tags: string[],
};


export type Fragment = DBEntry & {
  _id: `fragment/${string}`,
  note_id: string,
  subtype: 'text' | 'tasks' | 'data',
};

export type TextFragment = Fragment & {
  subtype: 'text',
  text: string
};
