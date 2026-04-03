import { useMemo } from 'react';
import { Colors, HighContrastColors } from '@/constants/colors';
import { useAppStore } from '@/stores/useAppStore';

/**
 * Returns the effective color palette, applying high-contrast overrides when enabled.
 */
export function useColors() {
  const highContrast = useAppStore((s) => s.highContrast);
  return useMemo(
    () => (highContrast ? { ...Colors, ...HighContrastColors } : Colors),
    [highContrast]
  );
}
