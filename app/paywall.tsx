import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Pill, X, Check, CircleX, Shield, Lock } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { useAppStore } from '@/stores/useAppStore';
import { purchaseUnlimited, restorePurchases } from '@/utils/purchases';

export default function PaywallScreen() {
  const { t } = useTranslation();
  const setUnlimited = useAppStore((s) => s.setUnlimited);
  const buyingRef = useRef(false);

  const handleBuy = async () => {
    if (buyingRef.current) return;
    buyingRef.current = true;
    try {
      const success = await purchaseUnlimited();
      if (success) {
        setUnlimited(true);
        router.back();
      }
    } catch (e) {
      console.warn('Purchase failed:', e);
    }
    buyingRef.current = false;
  };

  const handleRestore = async () => {
    const success = await restorePurchases();
    if (success) {
      setUnlimited(true);
      router.back();
    } else {
      Alert.alert('', 'No previous purchase found.');
    }
  };

  const FeatureRow = ({
    text,
    included,
    color,
  }: {
    text: string;
    included: boolean;
    color: string;
  }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      {included ? (
        <Check size={16} color={color} strokeWidth={2.5} />
      ) : (
        <CircleX size={16} color={Colors.error} strokeWidth={2} />
      )}
      <Text
        style={{
          fontFamily: Fonts.inter.regular,
          fontSize: 15,
          color: included ? Colors.textPrimary : Colors.textPlaceholder,
        }}
      >
        {text}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Close button */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            paddingHorizontal: 24,
            paddingTop: 8,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: Colors.cardBorder,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <X size={18} color={Colors.textSecondary} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View
          style={{
            alignItems: 'center',
            paddingHorizontal: 24,
            paddingTop: 16,
            gap: 8,
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 24,
              backgroundColor: Colors.primaryLight,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: Colors.primary + '33',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 1,
              shadowRadius: 20,
              elevation: 5,
            }}
          >
            <Pill size={42} color={Colors.primary} strokeWidth={2} />
          </View>
          <Text
            style={{
              fontFamily: Fonts.manrope.extraBold,
              fontSize: 30,
              color: Colors.textPrimary,
              textAlign: 'center',
              letterSpacing: -0.5,
            }}
          >
            {t('paywall.unlockTitle')}
          </Text>
          <Text
            style={{
              fontFamily: Fonts.inter.regular,
              fontSize: 16,
              color: Colors.textSecondary,
              textAlign: 'center',
              maxWidth: 300,
            }}
          >
            {t('paywall.unlockDesc')}
          </Text>
        </View>

        {/* Comparison cards */}
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 24,
            paddingTop: 20,
            gap: 12,
          }}
        >
          {/* Free card */}
          <View
            style={{
              flex: 1,
              backgroundColor: Colors.card,
              borderRadius: 20,
              padding: 20,
              borderWidth: 1,
              borderColor: Colors.cardBorder,
              gap: 12,
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.manrope.extraBold,
                fontSize: 18,
                color: Colors.textSecondary,
                textAlign: 'center',
              }}
            >
              {t('paywall.free')}
            </Text>
            <View style={{ height: 1, backgroundColor: Colors.divider }} />
            <FeatureRow text={t('paywall.freeFeature1')} included={true} color={Colors.success} />
            <FeatureRow text={t('paywall.freeFeature2')} included={true} color={Colors.success} />
            <FeatureRow text={t('paywall.freeFeature3')} included={false} color={Colors.error} />
          </View>

          {/* Pro card */}
          <View
            style={{
              flex: 1,
              backgroundColor: Colors.primaryLight,
              borderRadius: 20,
              padding: 20,
              borderWidth: 2,
              borderColor: Colors.primary,
              gap: 12,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
              <View
                style={{
                  backgroundColor: Colors.primary,
                  borderRadius: 10,
                  paddingHorizontal: 14,
                  paddingVertical: 4,
                }}
              >
                <Text
                  style={{
                    fontFamily: Fonts.manrope.extraBold,
                    fontSize: 14,
                    color: '#FFFFFF',
                  }}
                >
                  {t('paywall.pro')}
                </Text>
              </View>
            </View>
            <View style={{ height: 1, backgroundColor: '#FBBF24' }} />
            <FeatureRow text={t('paywall.proFeature1')} included={true} color={Colors.primary} />
            <FeatureRow text={t('paywall.proFeature2')} included={true} color={Colors.primary} />
            <FeatureRow text={t('paywall.proFeature3')} included={true} color={Colors.primary} />
          </View>
        </View>

        {/* Buy section */}
        <View style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 32, gap: 16 }}>
          <TouchableOpacity
            onPress={handleBuy}
            activeOpacity={0.8}
            style={{
              backgroundColor: Colors.primary,
              borderRadius: 20,
              height: 66,
              justifyContent: 'center',
              alignItems: 'center',
              gap: 4,
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
                fontSize: 22,
                color: '#FFFFFF',
              }}
            >
              {t('paywall.buyOnce')}
            </Text>
            <Text
              style={{
                fontFamily: Fonts.inter.regular,
                fontSize: 13,
                color: '#FBBF24',
              }}
            >
              {t('paywall.buySubtitle')}
            </Text>
          </TouchableOpacity>

          {/* Footer */}
          <View style={{ alignItems: 'center', gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Lock size={14} color={Colors.textPlaceholder} strokeWidth={2} />
              <Text
                style={{
                  fontFamily: Fonts.inter.regular,
                  fontSize: 13,
                  color: Colors.textSecondary,
                }}
              >
                {t('paywall.noSubscription')}
              </Text>
            </View>

            <TouchableOpacity onPress={handleRestore} activeOpacity={0.7}>
              <Text
                style={{
                  fontFamily: Fonts.inter.semiBold,
                  fontSize: 14,
                  color: Colors.primary,
                }}
              >
                {t('paywall.restorePurchase')}
              </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', gap: 16 }}>
              <TouchableOpacity activeOpacity={0.7} onPress={() => Linking.openURL('https://maaker.ai/privacy')}>
                <Text
                  style={{
                    fontFamily: Fonts.inter.regular,
                    fontSize: 13,
                    color: Colors.textPlaceholder,
                  }}
                >
                  {t('paywall.privacyPolicy')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.7} onPress={() => Linking.openURL('https://maaker.ai/terms')}>
                <Text
                  style={{
                    fontFamily: Fonts.inter.regular,
                    fontSize: 13,
                    color: Colors.textPlaceholder,
                  }}
                >
                  {t('paywall.termsOfUse')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
