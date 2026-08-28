export type Entry = {
  id: string;
  date: string;
  severity: number;
  symptoms: string[];
  triggers: string[];
  medications: string[];
  note: string;
  createdAt: string;
};

export type DataFile = { version: 1; exportedAt: string; entries: Entry[] };
