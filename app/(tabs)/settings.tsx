import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Volume2, Clock, ChevronRight, Shield, RotateCcw, CircleCheck,
  Sparkles, Crown,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { useAppStore } from '@/stores/useAppStore';
import { ReminderSound, EarlyReminder } from '@/types';
import { restorePurchases } from '@/utils/purchases';

const SOUNDS: ReminderSound[] = ['gentle', 'chime', 'alert', 'none'];
const EARLY_OPTIONS: EarlyReminder[] = [0, 5, 10, 15, 30];

export default function SettingsScreen() {
  const { t } = useTranslation();
  const {
    reminderSound, setReminderSound,
    earlyReminder, setEarlyReminder,
    isUnlimited,
  } = useAppStore();

  const [showSoundPicker, setShowSoundPicker] = useState(false);
  const [showEarlyPicker, setShowEarlyPicker] = useState(false);

  const handleRestore = async () => {
    const success = await restorePurchases();
    if (success) {
      useAppStore.getState().setUnlimited(true);
      Alert.alert('', t('settings.restoreSuccess'));
    } else {
      Alert.alert('', t('paywall.noPreviousPurchase'));
    }
  };

  const soundLabel = t(`sounds.${reminderSound}`);
  const earlyLabel = earlyReminder === 0
    ? t('settings.off')
    : t('settings.minutesBefore', { count: earlyReminder });
  const SectionLabel = ({ text }: { text: string }) => (
    <Text
      style={{
        fontFamily: Fonts.manrope.bold,
        fontSize: 12,
        letterSpacing: 2,
        color: Colors.textPlaceholder,
        marginTop: 12,
        marginBottom: 8,
      }}
    >
      {text}
    </Text>
  );

  const SettingsCard = ({ children }: { children: React.ReactNode }) => (
    <View
      style={{
        backgroundColor: Colors.card,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        overflow: 'hidden',
      }}
    >
      {children}
    </View>
  );

  const SettingsRow = ({
    icon,
    iconColor,
    iconBg,
    label,
    value,
    onPress,
    rightElement,
  }: {
    icon: React.ReactNode;
    iconColor: string;
    iconBg: string;
    label: string;
    value?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 20,
        gap: 12,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: iconBg,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {icon}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text
          style={{
            fontFamily: Fonts.manrope.semiBold,
            fontSize: 16,
            color: Colors.textPrimary,
          }}
        >
          {label}
        </Text>
        {value !== undefined && (
          <Text
            style={{
              fontFamily: Fonts.inter.regular,
              fontSize: 14,
              color: Colors.textSecondary,
            }}
          >
            {value}
          </Text>
        )}
      </View>
      {rightElement || (onPress && <ChevronRight size={20} color={Colors.textPlaceholder} strokeWidth={2} />)}
    </TouchableOpacity>
  );

  const Divider = () => (
    <View style={{ height: 1, backgroundColor: Colors.divider, marginLeft: 72 }} />
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            fontFamily: Fonts.manrope.extraBold,
            fontSize: 30,
            color: Colors.textPrimary,
            letterSpacing: -0.5,
            paddingTop: 16,
          }}
        >
          {t('settings.title')}
        </Text>

        {/* Pro status card or upgrade button */}
        {isUnlimited ? (
          <LinearGradient
            colors={['#FEF3C7', '#FDE68A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 20,
              borderWidth: 1,
              borderColor: Colors.primary,
              padding: 20,
              marginTop: 16,
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: 14,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: Colors.primary,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <CircleCheck size={24} color="#FFFFFF" strokeWidth={2} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text
                  style={{
                    fontFamily: Fonts.manrope.extraBold,
                    fontSize: 20,
                    color: Colors.textPrimary,
                  }}
                >
                  {t('settings.proActiveTitle')}
                </Text>
                <View
                  style={{
                    backgroundColor: Colors.primary,
                    borderRadius: 10,
                    paddingHorizontal: 10,
                    paddingVertical: 3,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: Fonts.manrope.bold,
                      fontSize: 11,
                      color: '#FFFFFF',
                      letterSpacing: 0.5,
                    }}
                  >
                    PRO
                  </Text>
                </View>
              </View>
              <Text
                style={{
                  fontFamily: Fonts.inter.regular,
                  fontSize: 13,
                  color: Colors.primary,
                }}
              >
                {t('settings.proActiveSubtitle')}
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.inter.regular,
                  fontSize: 13,
                  color: Colors.textSecondary,
                  marginTop: 4,
                  lineHeight: 18,
                }}
              >
                {t('settings.proActiveDesc')}
              </Text>
            </View>
          </LinearGradient>
        ) : (
          <View style={{ marginTop: 16, gap: 0 }}>
            {/* Upgrade info card */}
            <LinearGradient
              colors={['#FFF7ED', '#FEF3C7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 20,
                borderWidth: 2,
                borderColor: Colors.primary,
                padding: 20,
                gap: 12,
              }}
            >
              {/* Top row: icon + label + FREE badge */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: Colors.primary,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Sparkles size={22} color="#FFFFFF" strokeWidth={2} />
                  </View>
                  <View style={{ gap: 2 }}>
                    <Text
                      style={{
                        fontFamily: Fonts.manrope.extraBold,
                        fontSize: 20,
                        color: '#92400E',
                        letterSpacing: -0.3,
                      }}
                    >
                      {t('settings.proActiveTitle')}
                    </Text>
                    <Text
                      style={{
                        fontFamily: Fonts.inter.bold,
                        fontSize: 12,
                        color: '#B45309',
                        letterSpacing: 1.5,
                      }}
                    >
                      {t('settings.freePlan')}
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    backgroundColor: '#E7E5E4',
                    borderRadius: 20,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: Fonts.manrope.extraBold,
                      fontSize: 13,
                      color: '#78716C',
                      letterSpacing: 1,
                    }}
                  >
                    FREE
                  </Text>
                </View>
              </View>

              {/* Description */}
              <Text
                style={{
                  fontFamily: Fonts.inter.regular,
                  fontSize: 14,
                  color: '#92400E',
                  lineHeight: 14 * 1.4,
                }}
              >
                {t('settings.upgradeDesc')}
              </Text>

              {/* CTA button */}
              <TouchableOpacity
                onPress={() => router.push('/paywall')}
                activeOpacity={0.8}
                style={{
                  backgroundColor: Colors.primary,
                  borderRadius: 14,
                  height: 52,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <Crown size={20} color="#FFFFFF" strokeWidth={2} />
                <Text
                  style={{
                    fontFamily: Fonts.manrope.extraBold,
                    fontSize: 17,
                    color: '#FFFFFF',
                    letterSpacing: -0.2,
                  }}
                >
                  {t('settings.upgradeToPro')}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}

        {/* Reminders */}
        <SectionLabel text={t('settings.reminders')} />
        <SettingsCard>
          <SettingsRow
            icon={<Volume2 size={20} color={Colors.primary} strokeWidth={2} />}
            iconColor={Colors.primary}
            iconBg={Colors.primaryLight}
            label={t('settings.reminderSound')}
            rightElement={
              <Text
                style={{
                  fontFamily: Fonts.manrope.bold,
                  fontSize: 14,
                  color: Colors.primary,
                }}
              >
                {soundLabel}
              </Text>
            }
            onPress={() => {
              const idx = SOUNDS.indexOf(reminderSound);
              setReminderSound(SOUNDS[(idx + 1) % SOUNDS.length]);
            }}
          />
          <Divider />
          <SettingsRow
            icon={<Clock size={20} color={Colors.primary} strokeWidth={2} />}
            iconColor={Colors.primary}
            iconBg={Colors.primaryLight}
            label={t('settings.earlyReminder')}
            rightElement={
              <Text
                style={{
                  fontFamily: Fonts.manrope.bold,
                  fontSize: 14,
                  color: Colors.primary,
                }}
              >
                {earlyLabel}
              </Text>
            }
            onPress={() => {
              const idx = EARLY_OPTIONS.indexOf(earlyReminder);
              setEarlyReminder(EARLY_OPTIONS[(idx + 1) % EARLY_OPTIONS.length]);
            }}
          />
        </SettingsCard>

        {/* About */}
        <SectionLabel text={t('settings.about')} />
        <SettingsCard>
          <SettingsRow
            icon={<Shield size={20} color={Colors.textSecondary} strokeWidth={2} />}
            iconColor={Colors.textSecondary}
            iconBg={Colors.upcoming}
            label={t('settings.version')}
            rightElement={
              <Text
                style={{
                  fontFamily: Fonts.inter.regular,
                  fontSize: 14,
                  color: Colors.textPlaceholder,
                }}
              >
                1.0.0
              </Text>
            }
          />
          <Divider />
          <SettingsRow
            icon={<Shield size={20} color={Colors.textSecondary} strokeWidth={2} />}
            iconColor={Colors.textSecondary}
            iconBg={Colors.upcoming}
            label={t('settings.privacyPolicy')}
            onPress={() => Linking.openURL('https://maaker.ai/privacy/elderease')}
          />
          {!isUnlimited && (
            <>
              <Divider />
              <SettingsRow
                icon={<RotateCcw size={20} color={Colors.primary} strokeWidth={2} />}
                iconColor={Colors.primary}
                iconBg={Colors.primaryLight}
                label={t('settings.restorePurchase')}
                onPress={handleRestore}
              />
            </>
          )}
        </SettingsCard>
      </ScrollView>
    </SafeAreaView>
  );
}
