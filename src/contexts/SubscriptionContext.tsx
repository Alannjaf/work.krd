'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import type { 
  SubscriptionContextType, 
  SubscriptionData, 
  SubscriptionPermissions
} from '@/types/subscription';

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

interface SubscriptionProviderProps {
  children: React.ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [permissions, setPermissions] = useState<SubscriptionPermissions | null>(null);
  const [availableTemplates, setAvailableTemplates] = useState<string[]>(['modern']);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const fetchSubscription = useCallback(async () => {
    if (!user || !isLoaded) return;

    try {
      setIsLoading(true);
      setError(null);

      // Fetch combined subscription data and permissions
      const response = await fetch('/api/user/subscription-data');
      if (!response.ok) {
        throw new Error('Failed to fetch subscription data');
      }
      const data = await response.json();
      const subscriptionData = data.subscription;
      const permissionsData = data.permissions;

      const subscription: SubscriptionData = {
        plan: subscriptionData.currentPlan,
        resumeCount: subscriptionData.resumesUsed,
        resumeLimit: subscriptionData.resumesLimit,
        resumeImportsCount: subscriptionData.importCount || 0,
        resumeImportsLimit: subscriptionData.importLimit || 0,
        aiUsageCount: subscriptionData.aiUsageCount || 0,
        aiUsageLimit: subscriptionData.aiUsageLimit || 0,
        exportCount: subscriptionData.exportCount || 0,
        exportLimit: subscriptionData.exportLimit || 0,
        atsUsageCount: subscriptionData.atsUsageCount || 0,
        atsUsageLimit: subscriptionData.atsUsageLimit || 0,
        isActive: true};

      // Use permissions directly from API (dynamically configured by admin)
      const permissions: SubscriptionPermissions = {
        canCreateResume: permissionsData.canCreateResume || false,
        canUploadPhoto: permissionsData.canUploadPhoto || false,
        canAccessProTemplates: permissionsData.canAccessProTemplates || false,
        canExportToPDF: permissionsData.canExportToPDF || false,
        canUseAI: permissionsData.canUseAI || false,
        canUseATS: permissionsData.canUseATS || false};

      setSubscription(subscription);
      setPermissions(permissions);
      setAvailableTemplates(permissionsData.availableTemplates || ['modern']);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load subscription data');
    } finally {
      setIsLoading(false);
    }
  }, [user, isLoaded]);

  const refreshSubscription = useCallback(async () => {
    await fetchSubscription();
  }, [fetchSubscription]);

  const checkPermission = useCallback((permission: keyof SubscriptionPermissions): boolean => {
    return permissions?.[permission] || false;
  }, [permissions]);

  useEffect(() => {
    if (isLoaded) {
      if (user) {
        fetchSubscription();
      } else {
        setSubscription(null);
        setPermissions(null);
        setAvailableTemplates(['modern']);
        setIsLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchSubscription is stable via useCallback([user, isLoaded]), including it causes infinite re-render loop
  }, [user, isLoaded]);

  const value = useMemo<SubscriptionContextType>(() => ({
    subscription,
    permissions,
    availableTemplates,
    isLoading,
    error,
    refreshSubscription,
    checkPermission
  }), [subscription, permissions, availableTemplates, isLoading, error, refreshSubscription, checkPermission]);

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};