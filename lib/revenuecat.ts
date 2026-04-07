import Purchases, {
  PurchasesPackage,
  CustomerInfo,
  PurchasesOffering,
} from '@/lib/purchases-stub';
import { Platform } from 'react-native';

const API_KEY_IOS = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS || '';
const API_KEY_ANDROID = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID || '';

// Your entitlement ID from RevenueCat dashboard
const ENTITLEMENT_ID = 'premium';

/**
 * Initialize RevenueCat SDK
 * Call this once on app startup
 */
export async function initializeRevenueCat(userId?: string): Promise<void> {
  const apiKey = Platform.OS === 'ios' ? API_KEY_IOS : API_KEY_ANDROID;

  if (!apiKey) {
    console.warn('RevenueCat API key not configured for', Platform.OS);
    return;
  }

  try {
    await Purchases.configure({
      apiKey,
      appUserID: userId || undefined, // Let RevenueCat generate anonymous ID if not provided
    });

    // Enable debug logs in development
    if (__DEV__) {
      Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
    }
  } catch (error) {
    console.error('Failed to initialize RevenueCat:', error);
  }
}

/**
 * Login user to RevenueCat (call after Supabase auth)
 * This syncs the user's purchases across devices
 */
export async function loginRevenueCat(userId: string): Promise<CustomerInfo | null> {
  try {
    const { customerInfo } = await Purchases.logIn(userId);
    return customerInfo;
  } catch (error) {
    console.error('Failed to login to RevenueCat:', error);
    return null;
  }
}

/**
 * Logout user from RevenueCat
 */
export async function logoutRevenueCat(): Promise<void> {
  try {
    await Purchases.logOut();
  } catch (error) {
    console.error('Failed to logout from RevenueCat:', error);
  }
}

/**
 * Get available offerings (products)
 */
export async function getOfferings(): Promise<PurchasesOffering | null> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (error) {
    console.error('Failed to get offerings:', error);
    return null;
  }
}

/**
 * Get all available packages from current offering
 */
export async function getPackages(): Promise<PurchasesPackage[]> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current?.availablePackages || [];
  } catch (error) {
    console.error('Failed to get packages:', error);
    return [];
  }
}

/**
 * Purchase a package
 */
export async function purchasePackage(
  pkg: PurchasesPackage
): Promise<{ success: boolean; customerInfo?: CustomerInfo; error?: string }> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);

    const isPremium = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;

    return {
      success: isPremium,
      customerInfo,
    };
  } catch (error: any) {
    // User cancelled
    if (error.userCancelled) {
      return { success: false, error: 'cancelled' };
    }

    console.error('Purchase failed:', error);
    return {
      success: false,
      error: error.message || 'Purchase failed',
    };
  }
}

/**
 * Restore previous purchases
 */
export async function restorePurchases(): Promise<{
  success: boolean;
  isPremium: boolean;
  error?: string;
}> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    const isPremium = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;

    return {
      success: true,
      isPremium,
    };
  } catch (error: any) {
    console.error('Restore failed:', error);
    return {
      success: false,
      isPremium: false,
      error: error.message || 'Restore failed',
    };
  }
}

/**
 * Check if user has active premium subscription
 */
export async function checkPremiumStatus(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch (error) {
    console.error('Failed to check premium status:', error);
    return false;
  }
}

/**
 * Get customer info
 */
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  try {
    return await Purchases.getCustomerInfo();
  } catch (error) {
    console.error('Failed to get customer info:', error);
    return null;
  }
}

/**
 * Format price for display
 */
export function formatPrice(pkg: PurchasesPackage): string {
  return pkg.product.priceString;
}

/**
 * Get package by identifier
 * Common identifiers: $rc_weekly, $rc_monthly, $rc_annual, $rc_lifetime
 */
export function findPackageByIdentifier(
  packages: PurchasesPackage[],
  identifier: string
): PurchasesPackage | undefined {
  return packages.find((pkg) => pkg.identifier === identifier);
}
