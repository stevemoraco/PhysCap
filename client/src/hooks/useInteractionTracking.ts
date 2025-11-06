import { useEffect, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { InsertPageInteraction } from '@shared/schema';

export function useInteractionTracking(userId: string | undefined) {
  const trackMutation = useMutation({
    mutationFn: async (data: Omit<InsertPageInteraction, 'userId'>) => {
      if (!userId) return;
      await apiRequest('POST', '/api/interactions', { ...data, userId });
    },
  });

  const trackInteraction = useCallback((
    pagePath: string,
    interactionType: string,
    sectionId?: string,
    duration?: number,
    metadata?: any
  ) => {
    trackMutation.mutate({
      pagePath,
      sectionId,
      interactionType,
      duration,
      metadata,
    });
  }, [trackMutation]);

  const trackPageVisit = useCallback((pagePath: string) => {
    const startTime = Date.now();
    
    trackInteraction(pagePath, 'visit');

    return () => {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      trackInteraction(pagePath, 'exit', undefined, duration);
    };
  }, [trackInteraction]);

  return { trackInteraction, trackPageVisit };
}
