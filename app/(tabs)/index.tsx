import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Pill, HeartPulse, Droplets, Syringe, Thermometer, Activity, Check, Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { useAppStore } from '@/stores/useAppStore';
import { todayISO, formatTime, getGreeting, getTimeDiff, isDoseScheduledForDate, unitI18nKey } from '@/utils/helpers';

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  pill: Pill,
  'heart-pulse': HeartPulse,
  droplets: Droplets,
  syringe: Syringe,
  thermometer: Thermometer,
  activity: Activity,
};

export default function TodayScreen() {
  const { t } = useTranslation();
  const medications = useAppStore((s) => s.medications);
  const doseRecords = useAppStore((s) => s.doseRecords);
  const generateDoseRecords = useAppStore((s) => s.generateDoseRecords);
  const takeDose = useAppStore((s) => s.takeDose);
  const takingRef = useRef(false);

  const today = todayISO();
  const greeting = getGreeting();
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  useEffect(() => {
    generateDoseRecords(today);
  }, [today, medications.length]);

  const todayMeds = medications.filter((m) => isDoseScheduledForDate(m, today));
  const todayRecords = doseRecords.filter((r) => r.scheduledDate === today);
  const takenCount = todayRecords.filter((r) => r.status === 'taken').length;
  const totalCount = todayRecords.length;
  const percentage = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

  const handleTake = (medId: string, time: string) => {
    if (takingRef.current) return;
    takingRef.current = true;
    try {
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      takeDose(medId, today, time);
    } finally {
      setTimeout(() => { takingRef.current = false; }, 300);
    }
  };

  // Build dose cards: group by med, show each time slot
  const doseCards: Array<{
    med: typeof medications[0];
    record: typeof doseRecords[0];
  }> = [];

  for (const med of todayMeds) {
    for (const time of med.reminderTimes) {
      const record = todayRecords.find(
        (r) => r.medicationId === med.id && r.scheduledTime === time
      );
      if (record) {
        doseCards.push({ med, record });
      }
    }
  }

  // Sort: pending first, then by time
  doseCards.sort((a, b) => {
    if (a.record.status === 'taken' && b.record.status !== 'taken') return 1;
    if (a.record.status !== 'taken' && b.record.status === 'taken') return -1;
    return a.record.scheduledTime.localeCompare(b.record.scheduledTime);
  });

  const getDoseStatus = (record: typeof doseRecords[0]) => {
    if (record.status === 'taken') return 'taken';
    const now = new Date();
    const [h, m] = record.scheduledTime.split(':').map(Number);
    const target = new Date(now);
    target.setHours(h, m, 0, 0);
    const diff = target.getTime() - now.getTime();
    if (diff <= 0) return 'due';
    return 'upcoming';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
        <Text
          style={{
            fontFamily: Fonts.inter.regular,
            fontSize: 16,
            color: Colors.textSecondary,
          }}
        >
          {t(`today.${greeting}`)}
        </Text>
        <Text
          style={{
            fontFamily: Fonts.manrope.extraBold,
            fontSize: 30,
            color: Colors.textPrimary,
            letterSpacing: -0.5,
            marginTop: 4,
          }}
        >
          {t('today.title')}
        </Text>
        <Text
          style={{
            fontFamily: Fonts.inter.regular,
            fontSize: 16,
            color: Colors.textPlaceholder,
            marginTop: 4,
          }}
        >
          {dateStr}
        </Text>
      </View>

      {/* Progress */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 24,
          paddingTop: 20,
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.inter.medium,
            fontSize: 16,
            color: Colors.textSecondary,
          }}
        >
          {t('today.takenProgress', { taken: takenCount, total: totalCount })}
        </Text>
        <View
          style={{
            backgroundColor: Colors.primaryLight,
            borderRadius: 20,
            paddingHorizontal: 12,
            paddingVertical: 6,
          }}
        >
          <Text
            style={{
              fontFamily: Fonts.manrope.bold,
              fontSize: 14,
              color: Colors.primary,
            }}
          >
            {percentage}%
          </Text>
        </View>
      </View>

      {/* Dose cards */}
      <ScrollView
        style={{ flex: 1, marginTop: 16 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {doseCards.length === 0 && (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 40,
              paddingBottom: 80,
            }}
          >
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: 24,
                backgroundColor: '#F5F5F0',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Pill size={48} color="#D6D3D1" strokeWidth={1.5} />
            </View>
            <Text
              style={{
                fontFamily: Fonts.manrope.bold,
                fontSize: 20,
                color: '#78716C',
                marginTop: 16,
                textAlign: 'center',
              }}
            >
              {t('today.noMeds')}
            </Text>
            <Text
              style={{
                fontFamily: Fonts.inter.regular,
                fontSize: 15,
                color: '#A8A29E',
                marginTop: 16,
                textAlign: 'center',
                lineHeight: 22.5,
                width: 260,
              }}
            >
              {t('today.noMedsDesc')}
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/add-medication')}
              activeOpacity={0.8}
              style={{
                backgroundColor: Colors.primary,
                borderRadius: 16,
                paddingHorizontal: 32,
                paddingVertical: 16,
                marginTop: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                shadowColor: '#F59E0B44',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 1,
                shadowRadius: 12,
                elevation: 5,
              }}
            >
              <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
              <Text
                style={{
                  fontFamily: Fonts.manrope.bold,
                  fontSize: 16,
                  color: '#FFFFFF',
                }}
              >
                {t('today.addMed')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {doseCards.map(({ med, record }) => {
          const status = getDoseStatus(record);
          const isTaken = status === 'taken';
          const isDue = status === 'due';
          const IconComp = ICON_MAP[med.icon] || Pill;
          const timeDiff = getTimeDiff(record.scheduledTime);

          const cardBg = isTaken ? '#F0FDF4' : Colors.card;
          const borderColor = isTaken ? Colors.success : Colors.primary;
          const shadowColor = isTaken ? Colors.success + '22' : Colors.primary + '22';

          return (
            <View
              key={record.id}
              style={{
                backgroundColor: cardBg,
                borderRadius: 20,
                padding: 20,
                marginBottom: 16,
                borderWidth: 2,
                borderColor,
                shadowColor,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              {/* Top row */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      backgroundColor: isTaken ? Colors.successLight : Colors.primaryLight,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <IconComp
                      size={26}
                      color={isTaken ? Colors.success : med.color}
                      strokeWidth={2}
                    />
                  </View>
                  <View style={{ gap: 4 }}>
                    <Text
                      style={{
                        fontFamily: Fonts.manrope.extraBold,
                        fontSize: 22,
                        color: Colors.textPrimary,
                      }}
                    >
                      {med.name}
                    </Text>
                    <Text
                      style={{
                        fontFamily: Fonts.inter.regular,
                        fontSize: 16,
                        color: Colors.textSecondary,
                      }}
                    >
                      {med.dosage}{t(unitI18nKey(med.unit))}
                    </Text>
                  </View>
                </View>

                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text
                    style={{
                      fontFamily: Fonts.manrope.bold,
                      fontSize: 16,
                      color: isTaken ? Colors.success : Colors.primary,
                    }}
                  >
                    {formatTime(record.scheduledTime)}
                  </Text>
                  {isTaken ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        backgroundColor: Colors.successLight,
                        borderRadius: 20,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                      }}
                    >
                      <Check size={14} color={Colors.success} strokeWidth={2} />
                      <Text
                        style={{
                          fontFamily: Fonts.manrope.bold,
                          fontSize: 13,
                          color: Colors.success,
                        }}
                      >
                        {t('today.taken')}
                      </Text>
                    </View>
                  ) : isDue ? (
                    <Text
                      style={{
                        fontFamily: Fonts.inter.medium,
                        fontSize: 13,
                        color: Colors.primary,
                      }}
                    >
                      {t('today.dueNow')}
                    </Text>
                  ) : (
                    <Text
                      style={{
                        fontFamily: Fonts.inter.medium,
                        fontSize: 13,
                        color: Colors.textPlaceholder,
                      }}
                    >
                      {timeDiff ? t('today.dueIn', { time: timeDiff }) : ''}
                    </Text>
                  )}
                </View>
              </View>

              {/* Take Now button */}
              {!isTaken && (
                <Pressable
                  onPress={() => handleTake(med.id, record.scheduledTime)}
                  accessibilityRole="button"
                  accessibilityLabel={t('today.takeNow')}
                  style={({ pressed }) => ({
                    backgroundColor: Colors.primary,
                    borderRadius: 14,
                    height: 54,
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row',
                    gap: 8,
                    marginTop: 12,
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <Check size={20} color="#FFFFFF" strokeWidth={2.5} />
                  <Text
                    style={{
                      fontFamily: Fonts.manrope.extraBold,
                      fontSize: 18,
                      color: '#FFFFFF',
                    }}
                  >
                    {t('today.takeNow')}
                  </Text>
                </Pressable>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
