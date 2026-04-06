import { Medication, DoseRecord, TextSizeOption } from '@/types';

/**
 * Scale a base font size according to the user's textSize preference.
 * - 'default': no change
 * - 'large': +2px (titles +4px)
 * - 'extra-large': +4px (titles +6px)
 * @param base The original fontSize value
 * @param textSize The user's text size preference
 * @param isTitle Whether this is a title/heading (gets larger bump)
 */
export function getScaledFontSize(
  base: number,
  textSize: TextSizeOption,
  isTitle = false,
): number {
  if (textSize === 'default') return base;
  if (textSize === 'large') return base + (isTitle ? 4 : 2);
  // extra-large
  return base + (isTitle ? 6 : 4);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
}

export function unitI18nKey(unit: string): string {
  const map: Record<string, string> = { mg: 'addMed.unitMg', ml: 'addMed.unitMl', tablets: 'addMed.unitTablets' };
  return map[unit] ?? unit;
}

export function getGreeting(): 'goodMorning' | 'goodAfternoon' | 'goodEvening' {
  const h = new Date().getHours();
  if (h < 12) return 'goodMorning';
  if (h < 18) return 'goodAfternoon';
  return 'goodEvening';
}

export function getTimeDiff(targetTime: string): string {
  const now = new Date();
  const [h, m] = targetTime.split(':').map(Number);
  const target = new Date(now);
  target.setHours(h, m, 0, 0);

  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return '';

  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${diffMin} min`;
  const diffHrs = Math.floor(diffMin / 60);
  const remainMin = diffMin % 60;
  if (remainMin === 0) return `${diffHrs} hrs`;
  return `${diffHrs} hrs`;
}

export function isDoseScheduledForDate(med: Medication, dateStr: string): boolean {
  const date = new Date(dateStr + 'T00:00:00');
  const created = new Date(med.createdAt);
  created.setHours(0, 0, 0, 0);

  if (date < created) return false;

  if (med.frequency === 'daily') return true;

  if (med.frequency === 'every2days') {
    const diffDays = Math.floor((date.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays % 2 === 0;
  }

  if (med.frequency === 'weekly') {
    const dayOfWeek = date.getDay();
    return med.weeklyDays?.includes(dayOfWeek) ?? false;
  }

  return false;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return months[month];
}

// Medication icon/color presets
export const MED_ICONS = [
  { icon: 'pill', color: '#F59E0B', bgColor: '#FEF3C7' },
  { icon: 'heart-pulse', color: '#22C55E', bgColor: '#DCFCE7' },
  { icon: 'droplets', color: '#F59E0B', bgColor: '#FEF3C7' },
  { icon: 'syringe', color: '#7C3AED', bgColor: '#EDE9FE' },
  { icon: 'thermometer', color: '#EF4444', bgColor: '#FEE2E2' },
  { icon: 'activity', color: '#3B82F6', bgColor: '#DBEAFE' },
] as const;

export function getMedIconConfig(index: number) {
  return MED_ICONS[index % MED_ICONS.length];
}
