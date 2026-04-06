#!/bin/bash
# Capture real app screenshots from iOS simulator for all locales
# Requires: app running on simulator, Metro connected

set -e

UDID="29067D44-77A2-4854-AD1A-28E8DD9A25AC"
SCHEME="elderease"
OUTPUT_DIR="/Users/martin/OpenSource/ElderEase/screenshots-store/public/app-captures"
LOCALES=("en" "zh-Hans" "zh-Hant" "ja" "ko" "de" "fr" "es" "ru" "it" "ar" "id")
WAIT_LOCALE=2    # seconds to wait after locale change
WAIT_NAV=2       # seconds to wait after navigation

total=$(( ${#LOCALES[@]} * 5 ))
count=0

echo "=== Capturing $total real app screenshots ==="

# Seed demo data first
echo "Seeding demo data..."
xcrun simctl openurl "$UDID" "${SCHEME}://?seed=true" 2>/dev/null
sleep 3

for locale in "${LOCALES[@]}"; do
  dir="$OUTPUT_DIR/$locale"
  mkdir -p "$dir"

  echo ""
  echo "=== Locale: $locale ==="

  # Switch locale via deep link
  xcrun simctl openurl "$UDID" "${SCHEME}://?locale=${locale}" 2>/dev/null
  sleep $WAIT_LOCALE

  # 1. Today (home tab)
  xcrun simctl openurl "$UDID" "${SCHEME}://(tabs)" 2>/dev/null
  sleep $WAIT_NAV
  count=$((count + 1))
  xcrun simctl io "$UDID" screenshot "$dir/today.png" 2>/dev/null
  echo "  [$count/$total] $locale/today.png"

  # 2. Medications tab
  xcrun simctl openurl "$UDID" "${SCHEME}://(tabs)/medications" 2>/dev/null
  sleep $WAIT_NAV
  count=$((count + 1))
  xcrun simctl io "$UDID" screenshot "$dir/medications.png" 2>/dev/null
  echo "  [$count/$total] $locale/medications.png"

  # 3. History tab
  xcrun simctl openurl "$UDID" "${SCHEME}://(tabs)/history" 2>/dev/null
  sleep $WAIT_NAV
  count=$((count + 1))
  xcrun simctl io "$UDID" screenshot "$dir/history.png" 2>/dev/null
  echo "  [$count/$total] $locale/history.png"

  # 4. Settings tab
  xcrun simctl openurl "$UDID" "${SCHEME}://(tabs)/settings" 2>/dev/null
  sleep $WAIT_NAV
  count=$((count + 1))
  xcrun simctl io "$UDID" screenshot "$dir/settings.png" 2>/dev/null
  echo "  [$count/$total] $locale/settings.png"

  # 5. Paywall modal
  xcrun simctl openurl "$UDID" "${SCHEME}://paywall" 2>/dev/null
  sleep $WAIT_NAV
  count=$((count + 1))
  xcrun simctl io "$UDID" screenshot "$dir/paywall.png" 2>/dev/null
  echo "  [$count/$total] $locale/paywall.png"
  # Dismiss paywall - go back to tabs
  xcrun simctl openurl "$UDID" "${SCHEME}://(tabs)" 2>/dev/null
  sleep 1
done

# Reset to English
xcrun simctl openurl "$UDID" "${SCHEME}://?locale=en" 2>/dev/null

echo ""
echo "=== Done! $total screenshots captured in $OUTPUT_DIR ==="
