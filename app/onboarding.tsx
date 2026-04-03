import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Bell, Shield, CreditCard, ArrowRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { useAppStore } from '@/stores/useAppStore';

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const setOnboardingComplete = useAppStore((s) => s.setOnboardingComplete);

  const handleGetStarted = () => {
    setOnboardingComplete();
    router.replace('/(tabs)');
  };

  const features = [
    {
      Icon: Bell,
      title: t('onboarding.feature1Title'),
      desc: t('onboarding.feature1Desc'),
      bgColor: Colors.primaryLight,
      iconColor: Colors.primary,
    },
    {
      Icon: Shield,
      title: t('onboarding.feature2Title'),
      desc: t('onboarding.feature2Desc'),
      bgColor: Colors.successLight,
      iconColor: Colors.success,
    },
    {
      Icon: CreditCard,
      title: t('onboarding.feature3Title'),
      desc: t('onboarding.feature3Desc'),
      bgColor: '#EDE9FE',
      iconColor: '#7C3AED',
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <View
        style={{
          flex: 1,
          justifyContent: 'space-between',
          paddingHorizontal: 32,
          paddingTop: 40,
          paddingBottom: 48,
        }}
      >
        {/* Top section */}
        <View style={{ alignItems: 'center', gap: 32 }}>
          {/* App icon */}
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 28,
              backgroundColor: Colors.primary,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: Colors.primary + '44',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 1,
              shadowRadius: 28,
              elevation: 8,
              overflow: 'hidden',
            }}
          >
            <Image
              source={require('../assets/icon.png')}
              style={{ width: 100, height: 100 }}
            />
          </View>

          {/* Title */}
          <View style={{ alignItems: 'center', gap: 12 }}>
            <Text
              style={{
                fontFamily: Fonts.manrope.extraBold,
                fontSize: 36,
                color: Colors.textPrimary,
                textAlign: 'center',
                lineHeight: 44,
              }}
            >
              {t('onboarding.title')}
            </Text>
            <Text
              style={{
                fontFamily: Fonts.inter.regular,
                fontSize: 16,
                color: Colors.textSecondary,
                textAlign: 'center',
                lineHeight: 24,
                maxWidth: 300,
              }}
            >
              {t('onboarding.subtitle')}
            </Text>
          </View>

          {/* Features */}
          <View style={{ gap: 16, width: '100%', paddingTop: 8 }}>
            {features.map((feat, idx) => (
              <View
                key={idx}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: Colors.card,
                  borderRadius: 16,
                  padding: 16,
                  gap: 14,
                  borderWidth: 1,
                  borderColor: Colors.cardBorder,
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    backgroundColor: feat.bgColor,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <feat.Icon size={24} color={feat.iconColor} strokeWidth={2} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text
                    style={{
                      fontFamily: Fonts.manrope.bold,
                      fontSize: 16,
                      color: Colors.textPrimary,
                    }}
                  >
                    {feat.title}
                  </Text>
                  <Text
                    style={{
                      fontFamily: Fonts.inter.regular,
                      fontSize: 14,
                      color: Colors.textSecondary,
                    }}
                  >
                    {feat.desc}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom section */}
        <View style={{ alignItems: 'center', gap: 14 }}>
          <TouchableOpacity
            onPress={handleGetStarted}
            activeOpacity={0.8}
            style={{
              backgroundColor: Colors.primary,
              borderRadius: 20,
              height: 66,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 12,
              width: '100%',
              shadowColor: Colors.primary + '44',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 1,
              shadowRadius: 20,
              elevation: 5,
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.manrope.extraBold,
                fontSize: 20,
                color: '#FFFFFF',
              }}
            >
              {t('onboarding.getStarted')}
            </Text>
            <ArrowRight size={22} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>

          <Text
            style={{
              fontFamily: Fonts.inter.regular,
              fontSize: 14,
              color: Colors.textPlaceholder,
              textAlign: 'center',
            }}
          >
            {t('onboarding.alreadyHaveAccountPrefix')}{' '}
            <Text style={{ color: Colors.primary, fontFamily: Fonts.inter.semiBold }}>
              {t('onboarding.signIn')}
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
