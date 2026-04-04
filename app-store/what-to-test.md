# What to Test - ElderEase v1.0.0 (Build 4)

## Core Flow
1. Complete onboarding (swipe through features, tap "Get Started")
2. Add a medication (name, dosage, frequency, reminder time)
3. Mark medication as taken from Today tab
4. Check History tab for calendar view and dose records
5. Navigate between all 4 tabs (Today / Meds / History / Settings)

## Key Areas to Verify

### Medication Management
- Add up to 3 medications (free limit)
- Edit existing medication (tap card on Meds tab)
- Delete medication (edit screen, scroll to bottom)

### Paywall & Purchase
- Adding 4th medication triggers Paywall
- Settings > "Upgrade to Unlimited" opens Paywall
- Purchase button shows appropriate feedback
- Restore purchase works if previously purchased

### Notifications
- First medication add should request notification permission
- If denied, shows alert with "Open Settings" option

### Tab Navigation
- All 4 tabs switch correctly
- Tab Bar works when medication cards are visible on Today tab

## Known Limitations (Beta)
- Privacy policy page not yet deployed (links to maaker.ai homepage)
- RevenueCat StoreKit product needs Apple App Store Connect setup for real purchase testing
- Settings only shows Reminders and About sections (Display settings coming in future update)
