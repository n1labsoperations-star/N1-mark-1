import type { N1Tone } from '../../N1Modules';

/** Lifecycle of a request tracked in the store. */
export type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

/** ISO-8601 date or date-time string, as the API returns it. */
export type ISODateString = string;

/** One row in a "Recent activity" / "Status history" feed. */
export type ActivityEntry = {
  id: string;
  label: string;
  /** Optional second line, e.g. "CNC-04 · Arun Prakash". */
  detail?: string;
  at: ISODateString;
  tone: N1Tone;
};

/** Display metadata for an enum value: its label and badge colour. */
export type StatusMeta = { label: string; tone: N1Tone };

export type Attachment = {
  id: string;
  name: string;
  /** e.g. "Purchase order". */
  kind?: string;
  sizeBytes: number;
};
