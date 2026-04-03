import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, CircleCheck, CircleX, Pill } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { useAppStore } from '@/stores/useAppStore';
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  getMonthName,
  todayISO,
  formatTime,
} from '@/utils/helpers';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function HistoryScreen() {
  const { t } = useTranslation();
  const medications = useAppStore((s) => s.medications);
  const doseRecords = useAppStore((s) => s.doseRecords);

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(todayISO());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const resetSelectedDate = (year: number, month: number) => {
    const today = new Date();
    if (year === today.getFullYear() && month === today.getMonth()) {
      setSelectedDate(todayISO());
    } else {
      const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-01`;
      setSelectedDate(dateStr);
    }
  };

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
      resetSelectedDate(viewYear - 1, 11);
    } else {
      setViewMonth(viewMonth - 1);
      resetSelectedDate(viewYear, viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
      resetSelectedDate(viewYear + 1, 0);
    } else {
      setViewMonth(viewMonth + 1);
      resetSelectedDate(viewYear, viewMonth + 1);
    }
  };

  // Build calendar data
  const calendarDays = useMemo(() => {
    const days: Array<{ day: number; dateStr: string } | null> = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${viewYear}-${(viewMonth + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
      days.push({ day: d, dateStr });
    }
    return days;
  }, [viewYear, viewMonth, daysInMonth, firstDay]);

  const getDayStatus = (dateStr: string): 'all' | 'missed' | 'upcoming' | 'none' => {
    const todayStr = todayISO();
    if (dateStr > todayStr) return 'upcoming';
    const records = doseRecords.filter((r) => r.scheduledDate === dateStr);
    if (records.length === 0) return 'none';
    const hasMissed = records.some((r) => r.status === 'missed' || (r.status === 'pending' && dateStr < todayStr));
    if (hasMissed) return 'missed';
    const allTaken = records.every((r) => r.status === 'taken');
    return allTaken ? 'all' : 'upcoming';
  };

  const getDayBg = (status: string) => {
    switch (status) {
      case 'all': return Colors.successLight;
      case 'missed': return Colors.errorLight;
      case 'upcoming': return Colors.upcoming;
      default: return 'transparent';
    }
  };

  // Selected date detail
  const selectedRecords = doseRecords.filter((r) => r.scheduledDate === selectedDate);
  const selectedTaken = selectedRecords.filter((r) => r.status === 'taken').length;
  const selectedTotal = selectedRecords.length;

  // Monthly stats
  const monthRecords = useMemo(() => {
    return doseRecords.filter((r) => {
      const [y, m] = r.scheduledDate.split('-').map(Number);
      return y === viewYear && m === viewMonth + 1;
    });
  }, [doseRecords, viewYear, viewMonth]);

  const monthTaken = monthRecords.filter((r) => r.status === 'taken').length;
  const monthTotal = monthRecords.length;
  const monthPercentage = monthTotal > 0 ? Math.round((monthTaken / monthTotal) * 100) : 0;
  const uniqueDays = new Set(monthRecords.map((r) => r.scheduledDate)).size;
  const monthMissed = monthRecords.filter((r) => {
    if (r.status === 'taken') return false;
    return r.scheduledDate < todayISO();
  }).length;

  // Format selected date for display
  const selectedDateObj = new Date(selectedDate + 'T00:00:00');
  const selectedDateDisplay = `${getMonthName(selectedDateObj.getMonth())} ${selectedDateObj.getDate()}`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 24,
            paddingTop: 16,
          }}
        >
          <Text
            style={{
              fontFamily: Fonts.manrope.extraBold,
              fontSize: 30,
              color: Colors.textPrimary,
              letterSpacing: -0.5,
            }}
          >
            {t('history.title')}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              backgroundColor: Colors.upcoming,
              borderRadius: 20,
              paddingHorizontal: 14,
              paddingVertical: 8,
            }}
          >
            <TouchableOpacity onPress={prevMonth} hitSlop={12}>
              <ChevronLeft size={20} color={Colors.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
            <Text
              style={{
                fontFamily: Fonts.manrope.bold,
                fontSize: 16,
                color: Colors.textPrimary,
              }}
            >
              {getMonthName(viewMonth)} {viewYear}
            </Text>
            <TouchableOpacity onPress={nextMonth} hitSlop={12}>
              <ChevronRight size={20} color={Colors.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Calendar */}
        <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
          {/* Day headers */}
          <View style={{ flexDirection: 'row', gap: 4 }}>
            {DAY_LABELS.map((label, i) => (
              <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                <Text
                  style={{
                    fontFamily: Fonts.manrope.bold,
                    fontSize: 13,
                    color: Colors.textPlaceholder,
                    height: 24,
                    textAlign: 'center',
                  }}
                >
                  {label}
                </Text>
              </View>
            ))}
          </View>

          {/* Calendar grid */}
          {Array.from({ length: Math.ceil(calendarDays.length / 7) }).map((_, rowIdx) => (
            <View key={rowIdx} style={{ flexDirection: 'row', gap: 4, marginTop: 4 }}>
              {calendarDays.slice(rowIdx * 7, (rowIdx + 1) * 7).map((day, colIdx) => {
                if (!day) {
                  return <View key={colIdx} style={{ flex: 1, height: 46 }} />;
                }
                const status = getDayStatus(day.dateStr);
                const isSelected = day.dateStr === selectedDate;
                const isToday = day.dateStr === todayISO();
                return (
                  <TouchableOpacity
                    key={colIdx}
                    onPress={() => setSelectedDate(day.dateStr)}
                    activeOpacity={0.7}
                    style={{
                      flex: 1,
                      height: 46,
                      borderRadius: 10,
                      backgroundColor: getDayBg(status),
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: isSelected ? 2 : 0,
                      borderColor: isSelected ? Colors.primary : 'transparent',
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: isToday ? Fonts.manrope.extraBold : Fonts.manrope.semiBold,
                        fontSize: 16,
                        color: isToday ? Colors.primary : Colors.textPrimary,
                      }}
                    >
                      {day.day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              {/* Fill remaining cells in last row */}
              {rowIdx === Math.ceil(calendarDays.length / 7) - 1 &&
                Array.from({ length: 7 - (calendarDays.length % 7 || 7) }).map((_, i) => (
                  <View key={`fill-${i}`} style={{ flex: 1, height: 46 }} />
                ))}
            </View>
          ))}

          {/* Legend */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 16,
              paddingTop: 8,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.success }} />
              <Text style={{ fontFamily: Fonts.inter.regular, fontSize: 12, color: Colors.textSecondary }}>
                {t('history.allTaken')}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.error }} />
              <Text style={{ fontFamily: Fonts.inter.regular, fontSize: 12, color: Colors.textSecondary }}>
                {t('history.missedDose')}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.upcoming }} />
              <Text style={{ fontFamily: Fonts.inter.regular, fontSize: 12, color: Colors.textSecondary }}>
                {t('history.upcoming')}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats row */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 24,
            paddingVertical: 20,
          }}
        >
          <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
            <Text
              style={{
                fontFamily: Fonts.manrope.extraBold,
                fontSize: 32,
                color: Colors.success,
              }}
            >
              {monthPercentage}%
            </Text>
            <Text style={{ fontFamily: Fonts.inter.regular, fontSize: 13, color: Colors.textSecondary }}>
              {t('history.thisMonth')}
            </Text>
          </View>
          <View style={{ width: 1, height: 48, backgroundColor: Colors.cardBorder }} />
          <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
            <Text
              style={{
                fontFamily: Fonts.manrope.extraBold,
                fontSize: 32,
                color: Colors.textPrimary,
              }}
            >
              {uniqueDays}
            </Text>
            <Text style={{ fontFamily: Fonts.inter.regular, fontSize: 13, color: Colors.textSecondary }}>
              {t('history.daysTracked')}
            </Text>
          </View>
          <View style={{ width: 1, height: 48, backgroundColor: Colors.cardBorder }} />
          <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
            <Text
              style={{
                fontFamily: Fonts.manrope.extraBold,
                fontSize: 32,
                color: Colors.error,
              }}
            >
              {monthMissed}
            </Text>
            <Text style={{ fontFamily: Fonts.inter.regular, fontSize: 13, color: Colors.textSecondary }}>
              {t('history.missed')}
            </Text>
          </View>
        </View>

        {/* Day detail */}
        {selectedRecords.length > 0 && (
          <View style={{ paddingHorizontal: 24 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  fontFamily: Fonts.manrope.bold,
                  fontSize: 18,
                  color: Colors.textPrimary,
                }}
              >
                {t('history.detail', { date: selectedDateDisplay })}
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.inter.medium,
                  fontSize: 14,
                  color: Colors.success,
                }}
              >
                {t('history.ofTaken', { taken: selectedTaken, total: selectedTotal })}
              </Text>
            </View>

            {selectedRecords.map((record) => {
              const med = medications.find((m) => m.id === record.medicationId);
              if (!med) return null;
              const isTaken = record.status === 'taken';
              const isPast = record.scheduledDate < todayISO() && record.status === 'pending';
              const statusColor = isTaken ? Colors.success : isPast ? Colors.error : Colors.textPlaceholder;
              const bgColor = isTaken ? Colors.card : isPast ? Colors.errorLightBg : Colors.card;
              const borderCol = isTaken ? Colors.cardBorder : isPast ? Colors.errorBorder : Colors.cardBorder;

              return (
                <View
                  key={record.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: bgColor,
                    borderRadius: 14,
                    padding: 14,
                    paddingHorizontal: 16,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: borderCol,
                    gap: 12,
                  }}
                >
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: statusColor,
                    }}
                  />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text
                      style={{
                        fontFamily: Fonts.manrope.bold,
                        fontSize: 16,
                        color: Colors.textPrimary,
                      }}
                    >
                      {med.name} {med.dosage}{med.unit}
                    </Text>
                    <Text
                      style={{
                        fontFamily: Fonts.inter.regular,
                        fontSize: 14,
                        color: statusColor,
                      }}
                    >
                      {isTaken
                        ? t('history.takenAt', { time: record.takenAt ? new Date(record.takenAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '' })
                        : t('history.missedAt', { time: formatTime(record.scheduledTime) })}
                    </Text>
                  </View>
                  {isTaken ? (
                    <CircleCheck size={20} color={Colors.success} strokeWidth={2} />
                  ) : isPast ? (
                    <CircleX size={20} color={Colors.error} strokeWidth={2} />
                  ) : null}
                </View>
              );
            })}
          </View>
        )}

        {selectedRecords.length === 0 && (
          <View style={{ alignItems: 'center', paddingTop: 20, paddingHorizontal: 24 }}>
            <Text
              style={{
                fontFamily: Fonts.inter.regular,
                fontSize: 16,
                color: Colors.textPlaceholder,
                textAlign: 'center',
              }}
            >
              {t('history.noHistory')}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
