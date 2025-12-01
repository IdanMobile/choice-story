import { useEffect, useCallback } from 'react';
import { FirebaseAnalyticsService } from '@/app/services/firebase-analytics.service';

/**
 * Analytics Hooks for React Components
 * 
 * These are thin wrappers around FirebaseAnalyticsService that provide:
 * - React lifecycle integration (useEffect, useCallback)
 * - Automatic cleanup on unmount
 * - User/story context management
 * 
 * All timing and cost tracking is handled automatically by the service.
 * 
 * @see ../services/ANALYTICS_REFERENCE.md for complete usage guide
 */

/**
 * Hook to track story reading
 * Thin wrapper around FirebaseAnalyticsService with automatic lifecycle management
 */
export function useStoryReadingAnalytics(
  storyId: string | null,
  userId: string | null,
  storyTitle?: string
) {
  // Track story reading start/end automatically
  useEffect(() => {
    if (storyId && userId) {
      FirebaseAnalyticsService.trackReadingStoryStart(storyId, userId, storyTitle);

      return () => {
        // Track story reading end when component unmounts
        FirebaseAnalyticsService.trackReadingStoryFinish(storyId, userId, storyTitle);
      };
    }
  }, [storyId, userId, storyTitle]);

  // Track page view
  const trackPageView = useCallback((pageNum: number, pageType: string) => {
    if (storyId) {
      FirebaseAnalyticsService.trackStoryPageView(storyId, pageNum, pageType);
    }
  }, [storyId]);

  // Track when user selects a story path
  const trackSelectedPath = useCallback((pathType: 'good' | 'bad', pageNum: number) => {
    if (storyId && userId) {
      FirebaseAnalyticsService.trackReadingStorySelectedPath(
        storyId,
        userId,
        pathType,
        pageNum,
        storyTitle
      );
    }
  }, [storyId, userId, storyTitle]);

  return { trackPageView, trackSelectedPath };
}

/**
 * Hook to track story creation process
 * Thin wrapper around FirebaseAnalyticsService
 * All timing and cost tracking is handled by the service
 */
export function useStoryCreationAnalytics(
  userId: string | null,
  kidId: string | null
) {
  // Track story creation start
  const trackCreationStart = useCallback((problemDescription: string) => {
    if (userId && kidId) {
      FirebaseAnalyticsService.startStoryCreationSession(userId, kidId, problemDescription);
    }
  }, [userId, kidId]);

  // Track title generation
  const trackTitleGenerationStart = useCallback(() => {
    if (userId && kidId) {
      FirebaseAnalyticsService.startTitleGeneration(userId, kidId);
    }
  }, [userId, kidId]);

  const trackTitleGenerationComplete = useCallback((titlesCount: number, cost?: number) => {
    if (userId && kidId) {
      FirebaseAnalyticsService.trackTitleGeneration(userId, kidId, titlesCount, cost);
    }
  }, [userId, kidId]);

  // Track story text generation
  const trackStoryTextGenerationStart = useCallback((storyTitle?: string) => {
    if (userId && kidId) {
      FirebaseAnalyticsService.startTextGeneration(userId, kidId, storyTitle);
    }
  }, [userId, kidId]);

  const trackStoryTextGenerationComplete = useCallback((pagesCount: number, cost?: number, storyTitle?: string) => {
    if (userId && kidId) {
      FirebaseAnalyticsService.trackTextGeneration(userId, kidId, pagesCount, cost, storyTitle);
    }
  }, [userId, kidId]);

  // Track story creation completion
  const trackCreationComplete = useCallback((storyId: string, storyTitle: string) => {
    if (userId && kidId) {
      FirebaseAnalyticsService.trackStoryCreationComplete(storyId, userId, kidId, storyTitle);
    }
  }, [userId, kidId]);

  // Track story creation error
  const trackCreationError = useCallback((error: string) => {
    if (userId && kidId) {
      FirebaseAnalyticsService.trackStoryCreationError(userId, kidId, error);
    }
  }, [userId, kidId]);

  return {
    trackCreationStart,
    trackTitleGenerationStart,
    trackTitleGenerationComplete,
    trackStoryTextGenerationStart,
    trackStoryTextGenerationComplete,
    trackCreationComplete,
    trackCreationError
  };
}

/**
 * Hook to track image generation
 * Thin wrapper around FirebaseAnalyticsService
 */
export function useImageGenerationAnalytics(
  userId: string | null,
  storyId: string | null,
  storyTitle?: string,
  kidId?: string
) {
  const trackImageGenerationStart = useCallback((pageType: string, isRegeneration: boolean = false) => {
    if (userId && storyId) {
      FirebaseAnalyticsService.startImageGeneration(userId, storyId, pageType, isRegeneration, storyTitle);
    }
  }, [userId, storyId, storyTitle]);

  const trackImageGenerationComplete = useCallback((
    pageType: string,
    cost?: number,
    isRegeneration: boolean = false
  ) => {
    if (userId && storyId) {
      FirebaseAnalyticsService.trackImageGeneration(
        userId,
        storyId,
        pageType,
        cost,
        isRegeneration,
        storyTitle,
        kidId
      );
    }
  }, [userId, storyId, storyTitle, kidId]);

  const trackImageGenerationError = useCallback((
    pageType: string,
    error: string,
    isRegeneration: boolean = false
  ) => {
    if (userId && storyId) {
      FirebaseAnalyticsService.trackImageGenerationError(
        userId,
        storyId,
        pageType,
        error,
        isRegeneration
      );
    }
  }, [userId, storyId]);

  return {
    trackImageGenerationStart,
    trackImageGenerationComplete,
    trackImageGenerationError
  };
}
