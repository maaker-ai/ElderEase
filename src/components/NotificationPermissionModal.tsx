import React from 'react';
import { View, Text, Modal, TouchableOpacity, Linking } from 'react-native';
import { BellOff } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Fonts } from '@/constants/fonts';

interface NotificationPermissionModalProps {
  visible: boolean;
  onClose: () => void;
}

export function NotificationPermissionModal({ visible, onClose }: NotificationPermissionModalProps) {
  const { t } = useTranslation();

  const handleOpenSettings = () => {
    onClose();
    Linking.openSettings();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(45, 45, 45, 0.6)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 320,
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            padding: 24,
            alignItems: 'center',
            gap: 20,
            shadowColor: '#00000030',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 1,
            shadowRadius: 32,
            elevation: 10,
          }}
        >
          {/* Icon */}
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              backgroundColor: '#FEF3C7',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <BellOff size={40} color="#F59E0B" strokeWidth={1.5} />
          </View>

          {/* Title + Body */}
          <View style={{ alignItems: 'center', gap: 10 }}>
            <Text
              style={{
                fontFamily: Fonts.manrope.extraBold,
                fontSize: 20,
                color: '#2D2D2D',
                textAlign: 'center',
                lineHeight: 26,
                width: 260,
              }}
            >
              {t('permissions.deniedTitle')}
            </Text>
            <Text
              style={{
                fontFamily: Fonts.inter.regular,
                fontSize: 14,
                color: '#78716C',
                textAlign: 'center',
                lineHeight: 21,
                width: 260,
              }}
            >
              {t('permissions.deniedMessage')}
            </Text>
          </View>

          {/* Buttons */}
          <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              style={{
                flex: 1,
                height: 50,
                borderRadius: 12,
                backgroundColor: '#F5F5F0',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: Fonts.manrope.semiBold,
                  fontSize: 16,
                  color: '#78716C',
                }}
              >
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleOpenSettings}
              activeOpacity={0.7}
              style={{
                flex: 1,
                height: 50,
                borderRadius: 12,
                backgroundColor: '#F59E0B',
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#F59E0B44',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 1,
                shadowRadius: 12,
                elevation: 5,
              }}
            >
              <Text
                style={{
                  fontFamily: Fonts.manrope.bold,
                  fontSize: 16,
                  color: '#FFFFFF',
                }}
              >
                {t('permissions.openSettings')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
