import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  Plus, ChevronRight,
  Pill, HeartPulse, Droplets, Syringe, Thermometer, Activity,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { useAppStore } from '@/stores/useAppStore';
import { formatTime } from '@/utils/helpers';
import { getMedIconConfig } from '@/utils/helpers';

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  pill: Pill,
  'heart-pulse': HeartPulse,
  droplets: Droplets,
  syringe: Syringe,
  thermometer: Thermometer,
  activity: Activity,
};

const ICON_BG_MAP: Record<string, string> = {
  pill: '#FEF3C7',
  'heart-pulse': '#DCFCE7',
  droplets: '#FEF3C7',
  syringe: '#EDE9FE',
  thermometer: '#FEE2E2',
  activity: '#DBEAFE',
};

export default function MedicationsScreen() {
  const { t } = useTranslation();
  const medications = useAppStore((s) => s.medications);
  const isUnlimited = useAppStore((s) => s.isUnlimited);

  const handleAdd = () => {
    if (!isUnlimited && medications.length >= 3) {
      router.push('/paywall');
    } else {
      router.push('/add-medication');
    }
  };

  const handleMedPress = (medId: string) => {
    router.push({ pathname: '/add-medication', params: { id: medId } });
  };

  const getFreqLabel = (freq: string) => {
    switch (freq) {
      case 'daily': return t('meds.everyDay');
      case 'every2days': return t('meds.every2Days');
      case 'weekly': return t('meds.weekly');
      default: return freq;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
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
        <View style={{ gap: 4 }}>
          <Text
            style={{
              fontFamily: Fonts.manrope.extraBold,
              fontSize: 30,
              color: Colors.textPrimary,
              letterSpacing: -0.5,
            }}
          >
            {t('meds.title')}
          </Text>
          <Text
            style={{
              fontFamily: Fonts.inter.regular,
              fontSize: 16,
              color: Colors.textPlaceholder,
            }}
          >
            {t('meds.totalCount', { count: medications.length })}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleAdd}
          activeOpacity={0.8}
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            backgroundColor: Colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: Colors.primary + '44',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 12,
            elevation: 5,
          }}
        >
          <Plus size={26} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Med list */}
      <ScrollView
        style={{ flex: 1, marginTop: 20 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {medications.length === 0 && (
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Pill size={48} color={Colors.textPlaceholder} strokeWidth={1.5} />
            <Text
              style={{
                fontFamily: Fonts.manrope.bold,
                fontSize: 20,
                color: Colors.textSecondary,
                marginTop: 16,
              }}
            >
              {t('meds.noMeds')}
            </Text>
            <Text
              style={{
                fontFamily: Fonts.inter.regular,
                fontSize: 16,
                color: Colors.textPlaceholder,
                marginTop: 8,
              }}
            >
              {t('meds.noMedsDesc')}
            </Text>
          </View>
        )}

        {medications.map((med) => {
          const IconComp = ICON_MAP[med.icon] || Pill;
          const iconBg = ICON_BG_MAP[med.icon] || Colors.primaryLight;
          const nextTime = med.reminderTimes[0]
            ? formatTime(med.reminderTimes[0])
            : '';

          return (
            <TouchableOpacity
              key={med.id}
              onPress={() => handleMedPress(med.id)}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: Colors.card,
                borderRadius: 20,
                padding: 20,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: Colors.cardBorder,
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  backgroundColor: iconBg,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <IconComp size={26} color={med.color} strokeWidth={2} />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
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
                    color: Colors.textPlaceholder,
                  }}
                >
                  {med.dosage}{med.unit} {'\u2022'} {getFreqLabel(med.frequency)}
                </Text>
                <Text
                  style={{
                    fontFamily: Fonts.inter.medium,
                    fontSize: 14,
                    color: Colors.primary,
                  }}
                >
                  {t('meds.nextDose', { time: nextTime })}
                </Text>
              </View>
              <ChevronRight size={22} color={Colors.textPlaceholder} strokeWidth={2} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
