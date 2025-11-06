import { useEffect, useCallback, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { InsertPageInteraction, InsertInteractionEvent } from '@shared/schema';

interface InteractionEvent {
  eventType: string;
  context?: string;
  payload?: any;
}

export function useInteractionTracking(userId: string | undefined) {
  const eventBuffer = useRef<InteractionEvent[]>([]);
  const sectionObservers = useRef<Map<string, IntersectionObserver>>(new Map());

  const { mutate } = useMutation({
    mutationFn: async (data: Omit<InsertPageInteraction, 'userId'>) => {
      if (!userId) return;
      await apiRequest('POST', '/api/interactions', { ...data, userId });
    },
  });

  // Batch send interaction events
  const sendBatch = useCallback(async (events: InteractionEvent[]) => {
    if (!userId || events.length === 0) return;

    try {
      await apiRequest('POST', '/api/interactions/batch', { events });
      eventBuffer.current = [];
    } catch (error) {
      console.error('Failed to send interaction batch:', error);
    }
  }, [userId]);

  // Batch send every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (eventBuffer.current.length > 0) {
        sendBatch([...eventBuffer.current]);
      }
    }, 30000);

    // Send on unmount
    return () => {
      clearInterval(interval);
      if (eventBuffer.current.length > 0) {
        sendBatch([...eventBuffer.current]);
      }
    };
  }, [sendBatch]);

  const addEvent = useCallback((event: InteractionEvent) => {
    eventBuffer.current.push(event);
  }, []);

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

  // Track page section views with Intersection Observer
  const trackSectionView = useCallback((sectionId: string, element: HTMLElement | null) => {
    if (!userId || !element) return () => {};

    const startTime = Date.now();
    let isVisible = false;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            isVisible = true;
          } else if (!entry.isIntersecting && isVisible) {
            isVisible = false;
            const duration = Math.floor((Date.now() - startTime) / 1000);
            addEvent({
              eventType: 'section_view',
              context: sectionId,
              payload: {
                duration,
                scrollDepth: Math.round((window.scrollY / document.body.scrollHeight) * 100),
              },
            });
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(element);
    sectionObservers.current.set(sectionId, observer);

    return () => {
      observer.disconnect();
      sectionObservers.current.delete(sectionId);
    };
  }, [userId, addEvent]);

  // Track 3D interactions
  const track3DInteraction = useCallback((
    objectId: string,
    action: 'click' | 'hover' | 'zoom' | 'rotate'
  ) => {
    if (!userId) return;

    addEvent({
      eventType: '3d_interaction',
      context: objectId,
      payload: {
        action,
        timestamp: Date.now(),
      },
    });
  }, [userId, addEvent]);

  // Track CTA clicks
  const trackCTA = useCallback((ctaLabel: string, projectId?: string) => {
    if (!userId) return;

    addEvent({
      eventType: 'cta_click',
      context: projectId || 'general',
      payload: {
        label: ctaLabel,
        url: window.location.href,
        timestamp: Date.now(),
      },
    });
  }, [userId, addEvent]);

  // Track scroll depth
  const getScrollDepth = useCallback(() => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.body.scrollHeight;
    const scrollTop = window.scrollY;
    return Math.round(((scrollTop + windowHeight) / documentHeight) * 100);
  }, []);

  return {
    trackInteraction,
    trackPageVisit,
    trackSectionView,
    track3DInteraction,
    trackCTA,
    getScrollDepth,
  };
}
