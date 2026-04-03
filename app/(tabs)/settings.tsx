import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  Volume2, Clock, Type, Sun, ChevronRight, Shield, RotateCcw,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { useAppStore } from '@/stores/useAppStore';
import { ReminderSound, EarlyReminder, TextSizeOption } from '@/types';
import { restorePurchases } from '@/utils/purchases';

const SOUNDS: ReminderSound[] = ['gentle', 'chime', 'alert', 'none'];
const EARLY_OPTIONS: EarlyReminder[] = [0, 5, 10, 15, 30];
const TEXT_SIZES: TextSizeOption[] = ['default', 'large', 'extra-large'];

export default function SettingsScreen() {
  const { t } = useTranslation();
  const {
    reminderSound, setReminderSound,
    earlyReminder, setEarlyReminder,
    textSize, setTextSize,
    highContrast, setHighContrast,
    isUnlimited,
  } = useAppStore();

  const [showSoundPicker, setShowSoundPicker] = useState(false);
  const [showEarlyPicker, setShowEarlyPicker] = useState(false);

  const handleRestore = async () => {
    const success = await restorePurchases();
    if (success) {
      useAppStore.getState().setUnlimited(true);
      Alert.alert('', t('paywall.restorePurchase'));
    }
  };

  const soundLabel = t(`sounds.${reminderSound}`);
  const earlyLabel = earlyReminder === 0
    ? t('settings.off')
    : t('settings.minutesBefore', { count: earlyReminder });
  const textSizeLabel = (() => {
    switch (textSize) {
      case 'default': return t('settings.default');
      case 'large': return t('settings.large');
      case 'extra-large': return t('settings.extraLarge');
    }
  })();

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

        {/* Upgrade button if not pro */}
        {!isUnlimited && (
          <TouchableOpacity
            onPress={() => router.push('/paywall')}
            activeOpacity={0.8}
            style={{
              backgroundColor: Colors.primary,
              borderRadius: 16,
              padding: 16,
              marginTop: 16,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.manrope.bold,
                fontSize: 16,
                color: '#FFFFFF',
              }}
            >
              {t('settings.upgradeToPro')}
            </Text>
          </TouchableOpacity>
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

        {/* Display */}
        <SectionLabel text={t('settings.display')} />
        <SettingsCard>
          <SettingsRow
            icon={<Type size={20} color={Colors.primary} strokeWidth={2} />}
            iconColor={Colors.primary}
            iconBg={Colors.primaryLight}
            label={t('settings.textSize')}
            rightElement={
              <Text
                style={{
                  fontFamily: Fonts.manrope.bold,
                  fontSize: 14,
                  color: Colors.primary,
                }}
              >
                {textSizeLabel}
              </Text>
            }
            onPress={() => {
              const idx = TEXT_SIZES.indexOf(textSize);
              setTextSize(TEXT_SIZES[(idx + 1) % TEXT_SIZES.length]);
            }}
          />
          <Divider />
          <SettingsRow
            icon={<Sun size={20} color={Colors.primary} strokeWidth={2} />}
            iconColor={Colors.primary}
            iconBg={Colors.primaryLight}
            label={t('settings.highContrast')}
            rightElement={
              <Switch
                value={highContrast}
                onValueChange={setHighContrast}
                trackColor={{ false: Colors.cardBorder, true: Colors.primary }}
                thumbColor="#FFFFFF"
              />
            }
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
            onPress={() => Linking.openURL('https://maaker.ai/privacy')}
          />
          <Divider />
          <SettingsRow
            icon={<RotateCcw size={20} color={Colors.primary} strokeWidth={2} />}
            iconColor={Colors.primary}
            iconBg={Colors.primaryLight}
            label={t('settings.restorePurchase')}
            onPress={handleRestore}
          />
        </SettingsCard>
      </ScrollView>
    </SafeAreaView>
  );
}
