// RevenueCat integration for ElderEase
import Purchases, { LOG_LEVEL, PurchasesPackage } from 'react-native-purchases';

const RC_API_KEY = 'appl_RzZRwcUgleScKvOOsoyqnGDOzVq';
const ENTITLEMENT_ID = 'unlimited';

let isConfigured = false;
let isTestMode = false;

export function getIsTestMode(): boolean {
  return isTestMode;
}

export async function initPurchases(): Promise<void> {
  try {
    // Check if native module is available before calling any RC methods
    const nativeModule = (Purchases as any).NativeModule ?? (Purchases as any).nativeModule;
    if (!nativeModule && !(Purchases as any).configure) {
      throw new Error('RevenueCat native module not available');
    }
    if (__DEV__) {
      try { Purchases.setLogLevel(LOG_LEVEL.DEBUG); } catch { /* ignore */ }
    }
    Purchases.configure({ apiKey: RC_API_KEY });
    isConfigured = true;
  } catch (e: any) {
    console.warn('[Purchases] RC init failed, entering test mode:', e?.message);
    isConfigured = true; // Still mark as "configured" for UI flow
    isTestMode = true;   // But flag as test mode
  }
}

export async function checkProStatus(): Promise<boolean> {
  if (!isConfigured || isTestMode) return false;
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return !!customerInfo.entitlements.active[ENTITLEMENT_ID];
  } catch (e: any) {
    console.warn('[Purchases] Failed to check pro status:', e?.message);
    return false;
  }
}

export async function purchaseUnlimited(): Promise<boolean> {
  if (!isConfigured || isTestMode) {
    throw new Error('Purchase not available in this environment');
  }
  try {
    const offerings = await Purchases.getOfferings();
    const currentOffering = offerings.current;
    if (!currentOffering) {
      throw new Error('No offerings available');
    }

    // Find lifetime package
    let lifetimePackage: PurchasesPackage | undefined = currentOffering.lifetime ?? undefined;
    if (!lifetimePackage) {
      // Fallback: search all available packages
      lifetimePackage = currentOffering.availablePackages.find(
        (p) => p.identifier === '$rc_lifetime'
      );
    }

    if (!lifetimePackage) {
      throw new Error('Lifetime package not found');
    }

    const { customerInfo } = await Purchases.purchasePackage(lifetimePackage);
    return !!customerInfo.entitlements.active[ENTITLEMENT_ID];
  } catch (e: any) {
    // User cancelled is not a real error
    if (e?.userCancelled) {
      return false;
    }
    throw e;
  }
}

export async function restorePurchases(): Promise<boolean> {
  if (!isConfigured || isTestMode) {
    return false;
  }
  try {
    const customerInfo = await Purchases.restorePurchases();
    return !!customerInfo.entitlements.active[ENTITLEMENT_ID];
  } catch (e: any) {
    console.warn('[Purchases] Restore failed:', e?.message);
    return false;
  }
}
