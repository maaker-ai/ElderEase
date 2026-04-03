export interface Medication {
  id: string;
  name: string;
  dosage: number;
  unit: 'mg' | 'ml' | 'tablets';
  frequency: 'daily' | 'every2days' | 'weekly';
  weeklyDays?: number[]; // 0-6, Sunday-Saturday
  reminderTimes: string[]; // ["08:00", "18:00"]
  stockCount?: number;
  icon: string; // lucide icon name
  color: string; // accent color for the card
  createdAt: string; // ISO datetime
}

export interface DoseRecord {
  id: string;
  medicationId: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  takenAt?: string; // ISO datetime
  status: 'taken' | 'missed' | 'pending';
}

export type ReminderSound = 'gentle' | 'chime' | 'alert' | 'none';
export type EarlyReminder = 0 | 5 | 10 | 15 | 30;
export type TextSizeOption = 'default' | 'large' | 'extra-large';
