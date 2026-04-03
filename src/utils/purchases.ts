// RevenueCat integration placeholder
// Will be configured with actual API keys after RevenueCat MCP setup

const ENTITLEMENT_ID = 'unlimited';

// Stub for Expo Go compatibility
// RevenueCat native module is not available in Expo Go
export async function initPurchases(): Promise<void> {
  // Skip in Expo Go / dev mode - RevenueCat requires native build
  if (__DEV__) {
    console.log('[Purchases] Skipping RevenueCat init in dev mode');
    return;
  }
  // Production init will be added after RevenueCat setup
}

export async function checkProStatus(): Promise<boolean> {
  if (__DEV__) return false;
  return false;
}

export async function purchaseUnlimited(): Promise<boolean> {
  if (__DEV__) {
    console.log('[Purchases] Purchase not available in dev mode');
    return false;
  }
  return false;
}

export async function restorePurchases(): Promise<boolean> {
  if (__DEV__) {
    console.log('[Purchases] Restore not available in dev mode');
    return false;
  }
  return false;
}
