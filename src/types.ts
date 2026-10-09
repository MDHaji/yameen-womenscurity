export interface Contact {
  id: string;
  name: string;
  phone: string;
  relation: string;
  isPrimary: boolean;
}

export interface SafeZone {
  id: string;
  name: string;
  icon: string;
  lat: number;
  lng: number;
  radiusMeters: number;
}

export interface AppSettings {
  shakeEnabled: boolean;
  shakeSensitivity: number; // 15 to 40
  autoRecordSOS: boolean;
  sirenOnSOS: boolean;
  strobeOnSOS: boolean;
  pinLockEnabled: boolean;
  pinCode: string;
  discreetMode: 'none' | 'notes' | 'calculator';
  emergencyMessage: string;
  country: 'IN' | 'US' | 'UK' | 'GLOBAL';
}

export interface RecordedEvidence {
  id: string;
  timestamp: number;
  blobUrl?: string;
  durationSec: number;
  type: 'video' | 'audio';
  fileName: string;
  sizeBytes: number;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}
