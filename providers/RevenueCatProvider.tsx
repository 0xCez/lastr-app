import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import Purchases, {
  CustomerInfo,
  PurchasesPackage,
  PurchasesOffering,
} from '@/lib/purchases-stub';
import { Platform } from 'react-native';
import { useAuthStore } from '@/store/authStore';

const API_KEY_IOS = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS || '';
const API_KEY_ANDROID = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID || '';
const ENTITLEMENT_ID = 'premium';

interface RevenueCatContextType {
  customerInfo: CustomerInfo | null;
  isLoading: boolean;
  isSubscribed: boolean;
  currentOffering: PurchasesOffering | null;
  packages: PurchasesPackage[];
  purchasePackage: (pkg: PurchasesPackage) => Promise<{ success: boolean; error?: string }>;
  restorePurchases: () => Promise<{ success: boolean; isPremium: boolean }>;
  refreshCustomerInfo: () => Promise<void>;
}

const RevenueCatContext = createContext<RevenueCatContextType | undefined>(undefined);

export function RevenueCatProvider({ children }: { children: React.ReactNode }) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [currentOffering, setCurrentOffering] = useState<PurchasesOffering | null>(null);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);

  const { user } = useAuthStore();

  // Check subscription status
  const isSubscribed = customerInfo?.entitlements.active[ENTITLEMENT_ID] !== undefined;

  // Initialize RevenueCat
  useEffect(() => {
    const initRC = async () => {
      const apiKey = Platform.OS === 'ios' ? API_KEY_IOS : API_KEY_ANDROID;

      if (!apiKey) {
        if (__DEV__) {
          console.warn('RevenueCat API key not configured for', Platform.OS);
        }
        setIsLoading(false);
        return;
      }

      try {
        // Configure without user ID first (anonymous)
        await Purchases.configure({ apiKey });

        if (__DEV__) {
          Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
        }

        setIsConfigured(true);

        // Get initial customer info
        const info = await Purchases.getCustomerInfo();
        setCustomerInfo(info);

        // Get offerings
        const offerings = await Purchases.getOfferings();
        setCurrentOffering(offerings.current);
        setPackages(offerings.current?.availablePackages || []);
      } catch (error) {
        console.error('Failed to initialize RevenueCat:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initRC();
  }, []);

  // Link user to RevenueCat when they log in
  useEffect(() => {
    const linkUser = async () => {
      if (!isConfigured || !user?.id) return;

      try {
        const { customerInfo: newInfo } = await Purchases.logIn(user.id);
        setCustomerInfo(newInfo);
      } catch (error) {
        console.error('Failed to link user to RevenueCat:', error);
      }
    };

    linkUser();
  }, [user?.id, isConfigured]);

  // Listen for customer info updates
  useEffect(() => {
    if (!isConfigured) return;

    const listener = (info: CustomerInfo) => {
      setCustomerInfo(info);
    };

    Purchases.addCustomerInfoUpdateListener(listener);

    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, [isConfigured]);

  const purchasePackage = useCallback(async (pkg: PurchasesPackage) => {
    try {
      const { customerInfo: newInfo } = await Purchases.purchasePackage(pkg);
      setCustomerInfo(newInfo);

      const isPremium = newInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
      return { success: isPremium };
    } catch (error: any) {
      if (error.userCancelled) {
        return { success: false, error: 'cancelled' };
      }
      return { success: false, error: error.message || 'Purchase failed' };
    }
  }, []);

  const restorePurchases = useCallback(async () => {
    try {
      const info = await Purchases.restorePurchases();
      setCustomerInfo(info);

      const isPremium = info.entitlements.active[ENTITLEMENT_ID] !== undefined;
      return { success: true, isPremium };
    } catch (error: any) {
      return { success: false, isPremium: false };
    }
  }, []);

  const refreshCustomerInfo = useCallback(async () => {
    if (!isConfigured) return;

    try {
      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);
    } catch (error) {
      console.error('Failed to refresh customer info:', error);
    }
  }, [isConfigured]);

  return (
    <RevenueCatContext.Provider
      value={{
        customerInfo,
        isLoading,
        isSubscribed,
        currentOffering,
        packages,
        purchasePackage,
        restorePurchases,
        refreshCustomerInfo,
      }}
    >
      {children}
    </RevenueCatContext.Provider>
  );
}

export function useRevenueCat() {
  const context = useContext(RevenueCatContext);
  if (context === undefined) {
    throw new Error('useRevenueCat must be used within a RevenueCatProvider');
  }
  return context;
}
