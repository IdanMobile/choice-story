import { useEffect, useCallback, useRef } from 'react';
import { FirebaseAnalyticsService } from '@/app/services/firebase-analytics.service';

/**
 * Analytics Hooks for React Components
 * 
 * These are thin wrappers around FirebaseAnalyticsService that provide:
 * - React lifecycle integration (useEffect, useCallback)
 * - Automatic cleanup
 * - User/story context management
 * 
 * All timing and cost tracking is handled automatically by the service.
 */

/**
 * Hook to track story reading
 * Thin wrapper around FirebaseAnalyticsService with automatic lifecycle management
 * 
 * Note: Uses ref to ensure session only starts once, even if storyTitle loads later
 */
export function useStoryReadingAnalytics(
  storyId: string | null,
  userId: string | null,
  storyTitle?: string
) {
  const sessionStartedRef = useRef(false);
  const storyTitleRef = useRef(storyTitle);
  
  // Update title ref when it changes (for finish tracking)
  useEffect(() => {
    storyTitleRef.current = storyTitle;
  }, [storyTitle]);
  
  // Manual start (call when user clicks "Start Reading")
  const trackReadingStart = useCallback(() => {
    if (storyId && userId && !sessionStartedRef.current) {
      sessionStartedRef.current = true;
      FirebaseAnalyticsService.trackReadingStoryStart(storyId, userId, storyTitleRef.current);
    }
  }, [storyId, userId]);

  // Track page view (auto-detects final pages)
  const trackPageView = useCallback((pageNum: number, pageType: string) => {
    if (storyId) {
      FirebaseAnalyticsService.trackStoryPageView(storyId, pageNum, pageType);
      
      // Auto-detect story completion when reaching GOOD or BAD ending pages
      if ((pageType === 'good' || pageType === 'bad') && sessionStartedRef.current) {
        // User reached the ending - finish the story session
        if (userId) {
          FirebaseAnalyticsService.trackReadingStoryFinish(storyId, userId, storyTitleRef.current);
          sessionStartedRef.current = false; // Mark as finished
        }
      }
    }
  }, [storyId, userId]);

  // Track when user selects a story path
  const trackSelectedPath = useCallback((pathType: 'good' | 'bad', pageNum: number) => {
    if (storyId && userId) {
      FirebaseAnalyticsService.trackReadingStorySelectedPath(
        storyId,
        userId,
        pathType,
        pageNum,
        storyTitleRef.current
      );
    }
  }, [storyId, userId]);
  
  // Manual story finish (for explicit completion tracking)
  const trackStoryFinish = useCallback(() => {
    if (storyId && userId && sessionStartedRef.current) {
      FirebaseAnalyticsService.trackReadingStoryFinish(storyId, userId, storyTitleRef.current);
      sessionStartedRef.current = false;
    }
  }, [storyId, userId]);

  return { trackReadingStart, trackPageView, trackSelectedPath, trackStoryFinish };
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
