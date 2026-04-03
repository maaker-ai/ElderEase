import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Medication,
  DoseRecord,
  ReminderSound,
  EarlyReminder,
  TextSizeOption,
} from '@/types';
import { generateId, todayISO, isDoseScheduledForDate, getMedIconConfig } from '@/utils/helpers';
import { scheduleNotificationsForMed, cancelNotificationsForMed } from '@/utils/notifications';

interface AppState {
  // Onboarding
  hasCompletedOnboarding: boolean;
  setOnboardingComplete: () => void;

  // Pro status
  isUnlimited: boolean;
  setUnlimited: (val: boolean) => void;

  // Medications
  medications: Medication[];
  addMedication: (med: Omit<Medication, 'id' | 'createdAt' | 'icon' | 'color'>) => string | null;
  updateMedication: (id: string, updates: Partial<Medication>) => void;
  deleteMedication: (id: string) => void;

  // Dose records
  doseRecords: DoseRecord[];
  takeDose: (medicationId: string, scheduledDate: string, scheduledTime: string) => void;
  generateDoseRecords: (date: string) => void;

  // Settings
  reminderSound: ReminderSound;
  setReminderSound: (sound: ReminderSound) => void;
  earlyReminder: EarlyReminder;
  setEarlyReminder: (minutes: EarlyReminder) => void;
  textSize: TextSizeOption;
  setTextSize: (size: TextSizeOption) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
}

// Memory fallback storage for when AsyncStorage native module is unavailable
const memoryStorage: Record<string, string> = {};
const fallbackStorage = {
  getItem: (name: string) => {
    return memoryStorage[name] ?? null;
  },
  setItem: (name: string, value: string) => {
    memoryStorage[name] = value;
  },
  removeItem: (name: string) => {
    delete memoryStorage[name];
  },
};

function getStorage() {
  try {
    // Test if AsyncStorage native module is available
    if (AsyncStorage) {
      return createJSONStorage(() => AsyncStorage);
    }
  } catch {
    console.warn('[Store] AsyncStorage unavailable, using memory fallback');
  }
  return createJSONStorage(() => fallbackStorage);
}

const FREE_MED_LIMIT = 3;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Onboarding
      hasCompletedOnboarding: false,
      setOnboardingComplete: () => set({ hasCompletedOnboarding: true }),

      // Pro
      isUnlimited: false,
      setUnlimited: (val) => set({ isUnlimited: val }),

      // Medications
      medications: [],
      addMedication: (medData) => {
        const state = get();
        if (!state.isUnlimited && state.medications.length >= FREE_MED_LIMIT) {
          return null; // Signal to show paywall
        }
        const iconConfig = getMedIconConfig(state.medications.length);
        const newMed: Medication = {
          ...medData,
          id: generateId(),
          icon: iconConfig.icon,
          color: iconConfig.color,
          createdAt: new Date().toISOString(),
        };
        set({ medications: [...state.medications, newMed] });
        // Schedule notifications
        scheduleNotificationsForMed(newMed).catch(console.warn);
        return newMed.id;
      },
      updateMedication: (id, updates) => {
        const state = get();
        const updated = state.medications.map((m) =>
          m.id === id ? { ...m, ...updates } : m
        );
        set({ medications: updated });
        const med = updated.find((m) => m.id === id);
        if (med) {
          scheduleNotificationsForMed(med).catch(console.warn);
        }
      },
      deleteMedication: (id) => {
        const state = get();
        set({
          medications: state.medications.filter((m) => m.id !== id),
          doseRecords: state.doseRecords.filter((r) => r.medicationId !== id),
        });
        cancelNotificationsForMed(id).catch(console.warn);
      },

      // Dose records
      doseRecords: [],
      takeDose: (medicationId, scheduledDate, scheduledTime) => {
        const state = get();
        const existingIdx = state.doseRecords.findIndex(
          (r) =>
            r.medicationId === medicationId &&
            r.scheduledDate === scheduledDate &&
            r.scheduledTime === scheduledTime
        );
        if (existingIdx >= 0) {
          const updated = [...state.doseRecords];
          updated[existingIdx] = {
            ...updated[existingIdx],
            status: 'taken',
            takenAt: new Date().toISOString(),
          };
          set({ doseRecords: updated });
        } else {
          const newRecord: DoseRecord = {
            id: generateId(),
            medicationId,
            scheduledDate,
            scheduledTime,
            status: 'taken',
            takenAt: new Date().toISOString(),
          };
          set({ doseRecords: [...state.doseRecords, newRecord] });
        }
        // Decrement stock if applicable
        const med = state.medications.find((m) => m.id === medicationId);
        if (med && med.stockCount !== undefined && med.stockCount > 0) {
          const updatedMeds = state.medications.map((m) =>
            m.id === medicationId
              ? { ...m, stockCount: (m.stockCount ?? 0) - 1 }
              : m
          );
          set({ medications: updatedMeds });
        }
      },
      generateDoseRecords: (date) => {
        const state = get();
        const scheduledMeds = state.medications.filter((m) =>
          isDoseScheduledForDate(m, date)
        );
        const newRecords: DoseRecord[] = [];
        for (const med of scheduledMeds) {
          for (const time of med.reminderTimes) {
            const exists = state.doseRecords.find(
              (r) =>
                r.medicationId === med.id &&
                r.scheduledDate === date &&
                r.scheduledTime === time
            );
            if (!exists) {
              newRecords.push({
                id: generateId(),
                medicationId: med.id,
                scheduledDate: date,
                scheduledTime: time,
                status: 'pending',
              });
            }
          }
        }
        if (newRecords.length > 0) {
          set({ doseRecords: [...state.doseRecords, ...newRecords] });
        }
      },

      // Settings
      reminderSound: 'gentle',
      setReminderSound: (sound) => set({ reminderSound: sound }),
      earlyReminder: 5,
      setEarlyReminder: (minutes) => set({ earlyReminder: minutes }),
      textSize: 'default',
      setTextSize: (size) => set({ textSize: size }),
      highContrast: false,
      setHighContrast: (val) => set({ highContrast: val }),
    }),
    {
      name: 'elderease-storage',
      storage: getStorage(),
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        isUnlimited: state.isUnlimited,
        medications: state.medications,
        doseRecords: state.doseRecords,
        reminderSound: state.reminderSound,
        earlyReminder: state.earlyReminder,
        textSize: state.textSize,
        highContrast: state.highContrast,
      }),
    }
  )
);
