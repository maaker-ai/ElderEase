import React, { useEffect, useState, useRef } from 'react';
import { View, Image, Platform, Animated } from 'react-native';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { initPurchases, checkProStatus } from '@/utils/purchases';
import { useAppStore } from '@/stores/useAppStore';
import '@/i18n';

if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync();
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    [Fonts.manrope.regular]: require('../assets/fonts/Manrope-Regular.ttf'),
    [Fonts.manrope.medium]: require('../assets/fonts/Manrope-Medium.ttf'),
    [Fonts.manrope.semiBold]: require('../assets/fonts/Manrope-SemiBold.ttf'),
    [Fonts.manrope.bold]: require('../assets/fonts/Manrope-Bold.ttf'),
    [Fonts.manrope.extraBold]: require('../assets/fonts/Manrope-ExtraBold.ttf'),
    [Fonts.inter.regular]: require('../assets/fonts/Inter-Regular.ttf'),
    [Fonts.inter.medium]: require('../assets/fonts/Inter-Medium.ttf'),
    [Fonts.inter.semiBold]: require('../assets/fonts/Inter-SemiBold.ttf'),
    [Fonts.inter.bold]: require('../assets/fonts/Inter-Bold.ttf'),
  });

  const [showSplash, setShowSplash] = useState(true);
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const iconScale = useRef(new Animated.Value(0.8)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;

  // Initialize RevenueCat and check pro status
  useEffect(() => {
    initPurchases()
      .then(() => checkProStatus())
      .then((isPro) => {
        if (isPro) {
          useAppStore.getState().setUnlimited(true);
        }
      })
      .catch((e) => {
        console.warn('[Purchases] Init/check failed:', e?.message);
      });
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      if (Platform.OS !== 'web') {
        SplashScreen.hideAsync();
      }
      // Animate in
      Animated.parallel([
        Animated.timing(iconOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(iconScale, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();

      // Then fade out
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: 400,
        delay: 1200,
        useNativeDriver: true,
      }).start(() => {
        setShowSplash(false);
      });
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="onboarding"
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen
          name="paywall"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="add-medication"
          options={{ presentation: 'modal' }}
        />
      </Stack>

      {showSplash && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
            opacity: splashOpacity,
          }}
          pointerEvents="none"
        >
          <LinearGradient
            colors={['#FFFBF0', '#FEF3C7']}
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Animated.View
              style={{
                opacity: iconOpacity,
                transform: [{ scale: iconScale }],
              }}
            >
              <Image
                source={require('../assets/icon.png')}
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 28,
                }}
              />
            </Animated.View>
          </LinearGradient>
        </Animated.View>
      )}
    </>
  );
}
