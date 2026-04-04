import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Pill, Plus, Check, Package, Trash2, Sunrise, Sunset } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { useAppStore } from '@/stores/useAppStore';
import { Medication } from '@/types';
import { formatTime } from '@/utils/helpers';
import { requestNotificationPermission } from '@/utils/notifications';

type FreqType = 'daily' | 'every2days' | 'weekly';
type UnitType = 'mg' | 'ml' | 'tablets';

export default function AddMedicationScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;

  const medications = useAppStore((s) => s.medications);
  const addMedication = useAppStore((s) => s.addMedication);
  const updateMedication = useAppStore((s) => s.updateMedication);
  const deleteMedication = useAppStore((s) => s.deleteMedication);

  const existingMed = isEdit ? medications.find((m) => m.id === id) : null;

  const [name, setName] = useState(existingMed?.name ?? '');
  const [dosage, setDosage] = useState(existingMed?.dosage?.toString() ?? '');
  const [unit, setUnit] = useState<UnitType>(existingMed?.unit ?? 'mg');
  const [frequency, setFrequency] = useState<FreqType>(existingMed?.frequency ?? 'daily');
  const [reminderTimes, setReminderTimes] = useState<string[]>(
    existingMed?.reminderTimes ?? ['08:00']
  );
  const [stockCount, setStockCount] = useState(existingMed?.stockCount?.toString() ?? '');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [editingTimeIdx, setEditingTimeIdx] = useState(-1);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [nameFieldFocused, setNameFieldFocused] = useState(false);

  const savingRef = useRef(false);

  const handleSave = async () => {
    if (savingRef.current) return;
    savingRef.current = true;

    if (!name.trim()) {
      Alert.alert('', t('addMed.validationName'));
      savingRef.current = false;
      return;
    }
    if (!dosage || isNaN(Number(dosage)) || Number(dosage) <= 0) {
      Alert.alert('', t('addMed.validationDosage'));
      savingRef.current = false;
      return;
    }

    const medData = {
      name: name.trim(),
      dosage: Number(dosage),
      unit,
      frequency,
      reminderTimes,
      stockCount: stockCount ? Number(stockCount) : undefined,
    };

    if (isEdit && id) {
      updateMedication(id, medData);
      router.back();
    } else {
      // Request notification permission on first medication add (lazy request)
      await requestNotificationPermission();

      const newId = addMedication(medData);
      if (newId === null) {
        // Hit free limit
        router.back();
        setTimeout(() => router.push('/paywall'), 300);
      } else {
        router.back();
      }
    }
    savingRef.current = false;
  };

  const handleDelete = () => {
    Alert.alert(
      t('addMed.deleteMedication'),
      t('addMed.deleteConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            if (id) deleteMedication(id);
            router.back();
          },
        },
      ]
    );
  };

  const addTime = () => {
    setEditingTimeIdx(-1);
    setShowTimePicker(true);
  };

  const editTime = (idx: number) => {
    setEditingTimeIdx(idx);
    setShowTimePicker(true);
  };

  const handleTimeChange = (_: any, date?: Date) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (!date) return;
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    const timeStr = `${h}:${m}`;

    if (editingTimeIdx >= 0) {
      const updated = [...reminderTimes];
      updated[editingTimeIdx] = timeStr;
      setReminderTimes(updated);
    } else {
      setReminderTimes([...reminderTimes, timeStr]);
    }
    if (Platform.OS === 'ios') setShowTimePicker(false);
  };

  const getTimePickerDate = () => {
    if (editingTimeIdx >= 0 && reminderTimes[editingTimeIdx]) {
      const [h, m] = reminderTimes[editingTimeIdx].split(':').map(Number);
      const d = new Date();
      d.setHours(h, m, 0, 0);
      return d;
    }
    const d = new Date();
    d.setHours(8, 0, 0, 0);
    return d;
  };

  const removeTime = (idx: number) => {
    if (reminderTimes.length <= 1) return;
    setReminderTimes(reminderTimes.filter((_, i) => i !== idx));
  };

  const FreqButton = ({ value, label }: { value: FreqType; label: string }) => (
    <TouchableOpacity
      onPress={() => setFrequency(value)}
      activeOpacity={0.7}
      style={{
        flex: 1,
        height: 50,
        borderRadius: 14,
        backgroundColor: frequency === value ? Colors.primary : Colors.upcoming,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          fontFamily: Fonts.manrope.bold,
          fontSize: 15,
          color: frequency === value ? '#FFFFFF' : Colors.textSecondary,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const units: UnitType[] = ['mg', 'ml', 'tablets'];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              style={{
                backgroundColor: Colors.upcoming,
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 8,
              }}
            >
              <Text
                style={{
                  fontFamily: Fonts.manrope.semiBold,
                  fontSize: 16,
                  color: Colors.textSecondary,
                }}
              >
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
            <Text
              style={{
                fontFamily: Fonts.manrope.extraBold,
                fontSize: 22,
                color: Colors.textPrimary,
              }}
            >
              {isEdit ? t('addMed.editTitle') : t('addMed.addTitle')}
            </Text>
            <TouchableOpacity
              onPress={handleSave}
              activeOpacity={0.8}
              style={{
                backgroundColor: Colors.primary,
                borderRadius: 10,
                paddingHorizontal: 16,
                paddingVertical: 8,
              }}
            >
              <Text
                style={{
                  fontFamily: Fonts.manrope.bold,
                  fontSize: 16,
                  color: '#FFFFFF',
                }}
              >
                {t('common.save')}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 24, paddingBottom: 40, gap: 20 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            {/* Medication Name */}
            <View style={{ gap: 8 }}>
              <Text style={labelStyle}>{t('addMed.medicationName')}</Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: Colors.card,
                  borderRadius: 16,
                  height: 60,
                  paddingHorizontal: 20,
                  borderWidth: 2,
                  borderColor: nameFieldFocused || name ? Colors.primary : Colors.cardBorder,
                  gap: 12,
                }}
              >
                <Pill size={22} color={Colors.primary} strokeWidth={2} />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setNameFieldFocused(true)}
                  onBlur={() => setNameFieldFocused(false)}
                  placeholder={t('addMed.namePlaceholder')}
                  placeholderTextColor={Colors.textPlaceholder}
                  returnKeyType="next"
                  style={{
                    flex: 1,
                    fontFamily: Fonts.inter.regular,
                    fontSize: 18,
                    color: Colors.textPrimary,
                  }}
                />
              </View>
            </View>

            {/* Dosage */}
            <View style={{ gap: 8 }}>
              <Text style={labelStyle}>{t('addMed.dosage')}</Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View
                  style={{
                    flex: 1,
                    backgroundColor: Colors.card,
                    borderRadius: 16,
                    height: 60,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: Colors.cardBorder,
                  }}
                >
                  <TextInput
                    value={dosage}
                    onChangeText={setDosage}
                    keyboardType="numeric"
                    returnKeyType="done"
                    placeholder="500"
                    placeholderTextColor={Colors.textPlaceholder}
                    style={{
                      fontFamily: Fonts.manrope.bold,
                      fontSize: 22,
                      color: Colors.textPrimary,
                      textAlign: 'center',
                      width: '100%',
                      paddingHorizontal: 20,
                    }}
                  />
                </View>
                <TouchableOpacity
                  onPress={() => {
                    const idx = units.indexOf(unit);
                    setUnit(units[(idx + 1) % units.length]);
                  }}
                  activeOpacity={0.7}
                  style={{
                    width: 100,
                    height: 60,
                    borderRadius: 16,
                    borderWidth: 2,
                    borderColor: Colors.primary,
                    backgroundColor: Colors.card,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: Fonts.manrope.bold,
                      fontSize: 18,
                      color: Colors.primary,
                    }}
                  >
                    {unit}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Frequency */}
            <View style={{ gap: 8 }}>
              <Text style={labelStyle}>{t('addMed.frequency')}</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <FreqButton value="daily" label={t('addMed.everyDay')} />
                <FreqButton value="every2days" label={t('addMed.every2Days')} />
                <FreqButton value="weekly" label={t('addMed.weekly')} />
              </View>
            </View>

            {/* Reminder Times */}
            <View style={{ gap: 8 }}>
              <Text style={labelStyle}>{t('addMed.reminderTimes')}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {reminderTimes.map((time, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => editTime(idx)}
                    onLongPress={() => removeTime(idx)}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      backgroundColor: idx === 0 ? Colors.primaryLight : '#FEF9E7',
                      borderRadius: 14,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      borderWidth: 1,
                      borderColor: Colors.primary + '33',
                    }}
                  >
                    {idx === 0 ? (
                      <Sunrise size={18} color={Colors.primary} strokeWidth={2} />
                    ) : (
                      <Sunset size={18} color={Colors.primaryDark} strokeWidth={2} />
                    )}
                    <Text
                      style={{
                        fontFamily: Fonts.manrope.bold,
                        fontSize: 16,
                        color: Colors.textPrimary,
                      }}
                    >
                      {formatTime(time)}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  onPress={addTime}
                  activeOpacity={0.7}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 14,
                    backgroundColor: Colors.primaryLight,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Plus size={22} color={Colors.primary} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Stock Count */}
            <View style={{ gap: 8 }}>
              <Text style={labelStyle}>{t('addMed.stockCount')}</Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: Colors.card,
                  borderRadius: 16,
                  height: 60,
                  paddingHorizontal: 20,
                  borderWidth: 1,
                  borderColor: Colors.cardBorder,
                  justifyContent: 'space-between',
                }}
              >
                <TextInput
                  value={stockCount}
                  onChangeText={setStockCount}
                  keyboardType="numeric"
                  returnKeyType="done"
                  placeholder={t('addMed.stockPlaceholder')}
                  placeholderTextColor={Colors.textPlaceholder}
                  style={{
                    flex: 1,
                    fontFamily: Fonts.inter.regular,
                    fontSize: 18,
                    color: Colors.textPrimary,
                  }}
                />
                <Package size={22} color={Colors.textPlaceholder} strokeWidth={2} />
              </View>
            </View>

            {/* Save button */}
            <TouchableOpacity
              onPress={handleSave}
              activeOpacity={0.8}
              style={{
                backgroundColor: Colors.primary,
                borderRadius: 16,
                height: 60,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 10,
                shadowColor: Colors.primary + '44',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 1,
                shadowRadius: 16,
                elevation: 5,
              }}
            >
              <Check size={24} color="#FFFFFF" strokeWidth={2.5} />
              <Text
                style={{
                  fontFamily: Fonts.manrope.extraBold,
                  fontSize: 20,
                  color: '#FFFFFF',
                }}
              >
                {t('addMed.saveMedication')}
              </Text>
            </TouchableOpacity>

            {/* Delete button (edit mode only) */}
            {isEdit && (
              <TouchableOpacity
                onPress={handleDelete}
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 8,
                  paddingVertical: 16,
                }}
              >
                <Trash2 size={20} color={Colors.error} strokeWidth={2} />
                <Text
                  style={{
                    fontFamily: Fonts.manrope.bold,
                    fontSize: 16,
                    color: Colors.error,
                  }}
                >
                  {t('addMed.deleteMedication')}
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          {/* Time picker */}
          {showTimePicker && (
            <View
              style={{
                backgroundColor: Colors.card,
                borderTopWidth: 1,
                borderTopColor: Colors.cardBorder,
                paddingBottom: 20,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 16, paddingTop: 8 }}>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <Text style={{ fontFamily: Fonts.manrope.bold, fontSize: 16, color: Colors.primary }}>
                    {t('common.done')}
                  </Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={getTimePickerDate()}
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
                textColor={Colors.textPrimary}
              />
            </View>
          )}
        </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const labelStyle = {
  fontFamily: 'Manrope-Bold',
  fontSize: 12,
  letterSpacing: 2,
  color: '#78716C',
} as const;
