import type { DataFile, Entry } from './types';

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_ENTRIES = 10_000;
const MAX_TAGS = 64;
const MAX_TAG_LENGTH = 80;
const MAX_NOTE_LENGTH = 280;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validDate(value: string) {
  if (!DATE.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value && value <= new Date().toISOString().slice(0, 10);
}

function validTimestamp(value: string) {
  return !Number.isNaN(new Date(value).getTime());
}

function textList(value: unknown, label: string): string[] {
  if (!Array.isArray(value) || value.length > MAX_TAGS || value.some(item => typeof item !== 'string')) {
    throw new Error(`${label} must be a list of short text tags.`);
  }
  const result = value.map(item => item.trim());
  if (result.some(item => !item || item.length > MAX_TAG_LENGTH)) throw new Error(`${label} contains an invalid tag.`);
  return [...new Set(result)];
}

/** Validates untrusted local backup data before it can replace an existing log. */
export function normalizeEntries(value: unknown): Entry[] {
  if (!Array.isArray(value) || value.length > MAX_ENTRIES) throw new Error('Entries must be a reasonably sized list.');
  const ids = new Set<string>();
  return value.map((item, index) => {
    if (!isPlainObject(item)) throw new Error(`Entry ${index + 1} is not an object.`);
    const { id, date, severity, symptoms, triggers, medications, note, createdAt } = item;
    if (typeof id !== 'string' || !id.trim() || id.length > 200 || ids.has(id)) throw new Error(`Entry ${index + 1} has an invalid id.`);
    if (typeof date !== 'string' || !validDate(date)) throw new Error(`Entry ${index + 1} has an invalid date.`);
    if (typeof severity !== 'number' || !Number.isInteger(severity) || severity < 0 || severity > 4) throw new Error(`Entry ${index + 1} has an invalid severity.`);
    if (typeof note !== 'string' || note.length > MAX_NOTE_LENGTH) throw new Error(`Entry ${index + 1} has an invalid note.`);
    if (typeof createdAt !== 'string' || !validTimestamp(createdAt)) throw new Error(`Entry ${index + 1} has an invalid creation time.`);
    ids.add(id);
    return {
      id,
      date,
      severity,
      symptoms: textList(symptoms, 'Symptoms'),
      triggers: textList(triggers, 'Triggers'),
      medications: textList(medications, 'Medicine changes'),
      note: note.trim(),
      createdAt: new Date(createdAt).toISOString()
    };
  });
}

export function parseBackup(value: unknown): DataFile {
  if (!isPlainObject(value) || value.version !== 1 || typeof value.exportedAt !== 'string' || !validTimestamp(value.exportedAt)) {
    throw new Error('This is not a Care Visit Brief version 1 backup.');
  }
  return { version: 1, exportedAt: new Date(value.exportedAt).toISOString(), entries: normalizeEntries(value.entries) };
}
