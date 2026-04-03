import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pill, List, CalendarCheck, Settings } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { Redirect } from 'expo-router';
import { useAppStore } from '@/stores/useAppStore';

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const icons = [
    { Icon: Pill, label: t('tabs.today') },
    { Icon: List, label: t('tabs.meds') },
    { Icon: CalendarCheck, label: t('tabs.history') },
    { Icon: Settings, label: t('tabs.settings') },
  ];

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.tabBarBg,
        paddingBottom: insets.bottom,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 8,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          marginHorizontal: 0,
          height: 62,
          backgroundColor: Colors.card,
          borderRadius: 36,
          borderWidth: 1,
          borderColor: Colors.cardBorder,
          padding: 4,
          margin: 0,
        }}
      >
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;
          const { Icon, label } = icons[index];

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.7}
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 26,
                backgroundColor: isFocused ? Colors.primary : 'transparent',
                gap: 3,
              }}
            >
              <Icon
                size={20}
                color={isFocused ? '#FFFFFF' : Colors.tabInactive}
                strokeWidth={2}
              />
              <Text
                style={{
                  fontFamily: Fonts.manrope.bold,
                  fontSize: 10,
                  letterSpacing: 1,
                  color: isFocused ? '#FFFFFF' : Colors.tabInactive,
                }}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const hasCompletedOnboarding = useAppStore((s) => s.hasCompletedOnboarding);

  if (!hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="medications" />
      <Tabs.Screen name="history" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
