import { useEffect, useCallback, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { InsertPageInteraction } from '@shared/schema';

interface InteractionEvent {
  eventType: string;
  context?: string;
  payload?: any;
}

const BATCH_SIZE = 10;
const FLUSH_INTERVAL = 20000;

export function useInteractionTracking(userId: string | undefined) {
  const eventBuffer = useRef<InteractionEvent[]>([]);
  const sectionObservers = useRef<Map<string, IntersectionObserver>>(new Map());
  const isFlushing = useRef(false);

  const { mutate } = useMutation({
    mutationFn: async (data: Omit<InsertPageInteraction, 'userId'>) => {
      if (!userId) return;
      await apiRequest('POST', '/api/interactions', { ...data, userId });
    },
  });

  const sendBatch = useCallback(async () => {
    if (!userId || isFlushing.current) return;
    if (eventBuffer.current.length === 0) return;

    const eventsToSend = eventBuffer.current.splice(0, eventBuffer.current.length);
    isFlushing.current = true;

    try {
      await apiRequest('POST', '/api/interactions/batch', { events: eventsToSend });
    } catch (error) {
      console.error('Failed to send interaction batch:', error);
      eventBuffer.current.unshift(...eventsToSend);
    } finally {
      isFlushing.current = false;
    }
  }, [userId]);

  useEffect(() => {
    if (!userId || typeof window === 'undefined') return;
    const interval = setInterval(() => {
      sendBatch();
    }, FLUSH_INTERVAL);

    const handleBeforeUnload = () => {
      if (eventBuffer.current.length > 0 && navigator.sendBeacon) {
        const payload = JSON.stringify({ events: eventBuffer.current });
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon('/api/interactions/batch', blob);
        eventBuffer.current = [];
      } else if (eventBuffer.current.length > 0) {
        void sendBatch();
      }
    };

    window.addEventListener('pagehide', handleBeforeUnload);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('pagehide', handleBeforeUnload);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      sendBatch();
    };
  }, [userId, sendBatch]);

  const addEvent = useCallback(
    (event: InteractionEvent) => {
      eventBuffer.current.push(event);
      if (eventBuffer.current.length >= BATCH_SIZE) {
        void sendBatch();
      }
    },
    [sendBatch],
  );

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
  const trackCTA = useCallback(
    (details: { label: string; section: string; projectId?: string; metadata?: any }) => {
      if (!userId) return;

      addEvent({
        eventType: 'cta_click',
        context: `${details.section}:${details.projectId ?? 'general'}`,
        payload: {
          label: details.label,
          url: typeof window !== 'undefined' ? window.location.href : undefined,
          timestamp: Date.now(),
          ...details.metadata,
        },
      });
    },
    [userId, addEvent],
  );

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
