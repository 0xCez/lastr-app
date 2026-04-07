/**
 * RevenueCat stub for DEMO_MODE / Snack web preview.
 *
 * Mirrors the subset of `react-native-purchases` actually used in this
 * codebase (see lib/revenuecat.ts and providers/RevenueCatProvider.tsx).
 * Always reports the user as having the "premium" entitlement so paywalled
 * screens are unlocked.
 */

export interface CustomerInfo {
  entitlements: {
    active: Record<
      string,
      {
        identifier: string;
        isActive: boolean;
        willRenew: boolean;
        productIdentifier: string;
        latestPurchaseDate: string;
        originalPurchaseDate: string;
        expirationDate: string | null;
      }
    >;
    all: Record<string, unknown>;
  };
  activeSubscriptions: string[];
  allPurchasedProductIdentifiers: string[];
  latestExpirationDate: string | null;
  firstSeen: string;
  originalAppUserId: string;
  managementURL: string | null;
}

export interface PurchasesPackage {
  identifier: string;
  packageType: string;
  product: {
    identifier: string;
    description: string;
    title: string;
    price: number;
    priceString: string;
    currencyCode: string;
  };
  offeringIdentifier: string;
}

export interface PurchasesOffering {
  identifier: string;
  serverDescription: string;
  metadata: Record<string, unknown>;
  availablePackages: PurchasesPackage[];
  lifetime: PurchasesPackage | null;
  annual: PurchasesPackage | null;
  sixMonth: PurchasesPackage | null;
  threeMonth: PurchasesPackage | null;
  twoMonth: PurchasesPackage | null;
  monthly: PurchasesPackage | null;
  weekly: PurchasesPackage | null;
}

const PREMIUM_ENTITLEMENT = {
  identifier: 'premium',
  isActive: true,
  willRenew: true,
  productIdentifier: 'lastr_pro_annual',
  latestPurchaseDate: new Date().toISOString(),
  originalPurchaseDate: new Date().toISOString(),
  expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
};

const mockCustomerInfo: CustomerInfo = {
  entitlements: {
    active: { premium: PREMIUM_ENTITLEMENT },
    all: { premium: PREMIUM_ENTITLEMENT },
  },
  activeSubscriptions: ['lastr_pro_annual'],
  allPurchasedProductIdentifiers: ['lastr_pro_annual'],
  latestExpirationDate: PREMIUM_ENTITLEMENT.expirationDate,
  firstSeen: new Date().toISOString(),
  originalAppUserId: 'demo-user',
  managementURL: null,
};

const makePackage = (
  identifier: string,
  title: string,
  priceString: string,
  price: number
): PurchasesPackage => ({
  identifier,
  packageType: identifier,
  product: {
    identifier: `lastr_${identifier}`,
    description: title,
    title,
    price,
    priceString,
    currencyCode: 'USD',
  },
  offeringIdentifier: 'default',
});

const mockPackages: PurchasesPackage[] = [
  makePackage('$rc_weekly', 'Weekly', '$4.99', 4.99),
  makePackage('$rc_monthly', 'Monthly', '$14.99', 14.99),
  makePackage('$rc_annual', 'Annual', '$59.99', 59.99),
];

const mockOffering: PurchasesOffering = {
  identifier: 'default',
  serverDescription: 'Demo offering',
  metadata: {},
  availablePackages: mockPackages,
  lifetime: null,
  annual: mockPackages[2],
  sixMonth: null,
  threeMonth: null,
  twoMonth: null,
  monthly: mockPackages[1],
  weekly: mockPackages[0],
};

type Listener = (info: CustomerInfo) => void;
const listeners = new Set<Listener>();

const Purchases = {
  LOG_LEVEL: {
    VERBOSE: 'VERBOSE',
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
  },

  configure: async (_opts: { apiKey: string; appUserID?: string }) => {
    return;
  },

  setLogLevel: (_level: string) => {
    return;
  },

  logIn: async (_userId: string) => {
    return { customerInfo: mockCustomerInfo, created: false };
  },

  logOut: async () => {
    return mockCustomerInfo;
  },

  getCustomerInfo: async (): Promise<CustomerInfo> => {
    return mockCustomerInfo;
  },

  getOfferings: async () => {
    return {
      current: mockOffering,
      all: { default: mockOffering } as Record<string, PurchasesOffering>,
    };
  },

  purchasePackage: async (_pkg: PurchasesPackage) => {
    return { customerInfo: mockCustomerInfo, productIdentifier: _pkg.product.identifier };
  },

  restorePurchases: async (): Promise<CustomerInfo> => {
    return mockCustomerInfo;
  },

  addCustomerInfoUpdateListener: (listener: Listener) => {
    listeners.add(listener);
  },

  removeCustomerInfoUpdateListener: (listener: Listener) => {
    listeners.delete(listener);
  },
};

export default Purchases;
