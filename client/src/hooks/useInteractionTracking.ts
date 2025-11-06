import { useEffect, useCallback, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { InsertPageInteraction } from '@shared/schema';

export function useInteractionTracking(userId: string | undefined) {
  const { mutate } = useMutation({
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
    if (!userId) return;
    mutate({
      pagePath,
      sectionId,
      interactionType,
      duration,
      metadata,
    });
  }, [userId, mutate]);

  const trackPageVisit = useCallback((pagePath: string) => {
    if (!userId) return () => {};
    
    const startTime = Date.now();
    
    mutate({
      pagePath,
      interactionType: 'visit',
    });

    return () => {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      mutate({
        pagePath,
        interactionType: 'exit',
        duration,
      });
    };
  }, [userId, mutate]);

  return { trackInteraction, trackPageVisit };
}
