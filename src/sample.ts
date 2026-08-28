import type { Entry } from './types';

export const sampleEntries: Entry[] = [
  { id: 's1', date: '2026-08-05', severity: 2, symptoms: ['Headache'], triggers: ['Poor sleep'], medications: ['Ibuprofen'], note: 'Started after a short night. Improved by lunch.', createdAt: '2026-08-05T20:00:00.000Z' },
  { id: 's2', date: '2026-08-08', severity: 4, symptoms: ['Headache', 'Nausea'], triggers: ['Bright light'], medications: [], note: 'Had to lie down for about two hours.', createdAt: '2026-08-08T20:00:00.000Z' },
  { id: 's3', date: '2026-08-12', severity: 3, symptoms: ['Fatigue'], triggers: ['Busy day'], medications: ['Usual morning medicine'], note: 'Energy dropped in the afternoon.', createdAt: '2026-08-12T20:00:00.000Z' },
  { id: 's4', date: '2026-08-17', severity: 1, symptoms: ['Headache'], triggers: [], medications: [], note: 'Brief and mild. No clear trigger.', createdAt: '2026-08-17T20:00:00.000Z' },
  { id: 's5', date: '2026-08-23', severity: 4, symptoms: ['Headache', 'Fatigue'], triggers: ['Poor sleep'], medications: ['Ibuprofen'], note: 'Worse than usual after two poor nights.', createdAt: '2026-08-23T20:00:00.000Z' }
];
