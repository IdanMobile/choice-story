# Analytics Reference Guide

This document lists all available analytics events and how to use them.

## Architecture Overview

The analytics system has a simple, centralized architecture:

1. **FirebaseAnalyticsService** - Core analytics class with all tracking methods
   - Handles timing automatically (no manual `Date.now()` needed)
   - Tracks costs internally per session
   - Manages sessions for complex multi-step operations

2. **Hooks** - Thin React wrappers for components
   - `useStoryReadingAnalytics` - Track story reading sessions
   - `useStoryCreationAnalytics` - Track story creation workflow
   - `useImageGenerationAnalytics` - Track image generation

3. **AnalyticsIntegrationService** - Helper utilities for API routes

## Usage Patterns

### In React Components (Recommended)

```typescript
import { useStoryCreationAnalytics } from '@/app/hooks/useStoryAnalytics';

function MyComponent() {
  const { trackCreationStart, trackCreationComplete } = useStoryCreationAnalytics(userId, kidId);
  
  // Service handles all timing and cost tracking automatically
  trackCreationStart(problemDescription);
  // ... do work ...
  trackCreationComplete(storyId, storyTitle);
}
```

### Direct Service Usage (API Routes, Server-Side)

```typescript
import { FirebaseAnalyticsService } from '@/app/services/firebase-analytics.service';

// Start session (service tracks time internally)
FirebaseAnalyticsService.startStoryCreationSession(userId, kidId, problem);

// ... do work ...

// Complete (service calculates duration automatically)
FirebaseAnalyticsService.trackStoryCreationComplete(storyId, userId, kidId, title);
```

## Available Events

### Story Reading Analytics

#### `trackReadingStoryStart(storyId, userId, storyTitle?)`
Track when user starts reading a story.
- **When**: User opens story page
- **Auto-tracked**: Session start time
- **Events**: `reading_story_start`

#### `trackReadingStoryFinish(storyId, userId, storyTitle?)`
Track when user finishes reading a story.
- **When**: User closes story or navigates away
- **Auto-tracked**: Duration from session start
- **Events**: `reading_story_finish`
- **Cleanup**: Clears reading session and page view data

#### `trackStoryPageView(storyId, pageNum, pageType)`
Track when user views a story page.
- **When**: User navigates to next page
- **Auto-tracked**: Duration on previous page
- **Events**: `story_page_view`
- **Note**: First call sets up tracking, subsequent calls track previous page

#### `trackReadingStorySelectedPath(storyId, userId, pathType, pageNum, storyTitle?)`
Track when user makes a choice (good/bad path).
- **When**: User clicks choice button
- **Events**: `reading_story_selected_path`
- **Data**: `pathType`: 'good' | 'bad'

### Story Creation Analytics

#### Session Management

##### `startStoryCreationSession(userId, kidId, problemDescription)`
Start a story creation session.
- **When**: User starts creating story
- **Auto-tracked**: Session start time, cost accumulators
- **Events**: `story_creation_start`
- **Note**: All subsequent operations add to this session

##### `trackStoryCreationComplete(storyId, userId, kidId, storyTitle?)`
Complete story creation session.
- **When**: Story saved successfully
- **Auto-tracked**: Total duration, total cost from all operations
- **Events**: `story_creation_complete`, `story_creation_cost`
- **Cleanup**: Clears session data

##### `trackStoryCreationError(userId, kidId, error)`
Track story creation failure.
- **When**: Error during story creation
- **Auto-tracked**: Duration from session start
- **Events**: `story_creation_error`
- **Cleanup**: Clears session data

#### Title Generation

##### `startTitleGeneration(userId, kidId)`
Start tracking title generation.
- **When**: Before calling title generation API
- **Auto-tracked**: Title gen start time

##### `trackTitleGeneration(userId, kidId, titlesCount, cost?)`
Complete title generation tracking.
- **When**: After receiving titles from API
- **Auto-tracked**: Duration, cost added to session
- **Events**: `title_generation`, `openai_cost`
- **Data**: Number of titles generated

#### Story Text Generation

##### `startTextGeneration(userId, kidId, storyTitle?)`
Start tracking story text generation.
- **When**: Before calling story generation API
- **Auto-tracked**: Text gen start time
- **Events**: `creating_text_start`

##### `trackTextGeneration(userId, kidId, pagesCount, cost?, storyTitle?)`
Complete story text generation tracking.
- **When**: After receiving story from API
- **Auto-tracked**: Duration, cost added to session
- **Events**: `creating_text_finish`, `openai_cost`
- **Data**: Number of pages generated

### Image Generation Analytics

#### `startImageGeneration(userId, storyId, pageType, isRegeneration?, storyTitle?)`
Start tracking image generation.
- **When**: Before calling image generation API
- **Auto-tracked**: Image gen start time
- **Events**: `creating_image_start`
- **Data**: Page type, regeneration flag

#### `trackImageGeneration(userId, storyId, pageType, cost?, isRegeneration?, storyTitle?, kidId?)`
Complete image generation tracking.
- **When**: After receiving image from API
- **Auto-tracked**: Duration, cost added to session (if kidId provided)
- **Events**: `creating_image_finish`, `openai_cost`, `image_regeneration` (if regen)
- **Cleanup**: Clears image generation tracking

#### `trackImageGenerationError(userId, storyId, pageType, error, isRegeneration?)`
Track image generation failure.
- **When**: Error during image generation
- **Auto-tracked**: Duration from start
- **Events**: `image_generation_error`
- **Cleanup**: Clears image generation tracking

#### `trackImageRegeneration(userId, storyId, pageType, durationMs, cost?)`
Track image regeneration specifically.
- **When**: User clicks regenerate button
- **Events**: `image_regeneration`
- **Note**: Usually called automatically by `trackImageGeneration` when `isRegeneration=true`

### Cost Tracking Analytics

#### `trackOpenAICost(userId, operation, costUSD, model, tokensUsed?, storyId?)`
Track OpenAI API costs.
- **When**: After any OpenAI API call
- **Events**: `openai_cost`
- **Operations**: 'title_generation', 'story_generation', 'image_generation', 'text_regeneration', 'image_regeneration'
- **Note**: Often called automatically by other tracking methods

#### `trackStoryCreationCost(userId, storyId, totalCostUSD, breakdown)`
Track total story creation cost with breakdown.
- **When**: Story creation complete
- **Events**: `story_creation_cost`
- **Breakdown**: titleGenerationCost, storyTextCost, imageGenerationCost
- **Note**: Called automatically by `trackStoryCreationComplete`

### Performance Analytics

#### `trackAPIPerformance(endpoint, durationMs, success, statusCode?)`
Track API endpoint performance.
- **When**: After API call completes
- **Events**: `api_performance`
- **Data**: Endpoint path, duration, success status, HTTP status code

### User Management

#### `setUser(userId, properties?)`
Set user properties for analytics.
- **When**: User logs in
- **Properties**: Additional user metadata (plan type, account age, etc.)

## Event Data Structure

All events include:
- `timestamp`: Current time in milliseconds
- `user_id`: Current user ID (when available)
- Duration fields in multiple units:
  - `duration_ms`: Milliseconds
  - `duration_seconds`: Seconds (rounded)
  - `duration_minutes`: Minutes (rounded, when applicable)

## Cost Tracking

The service automatically accumulates costs for:
- Title generation
- Story text generation  
- Image generation (per page)

Total cost is calculated and reported when the session completes.

## Session Cleanup

Sessions are automatically cleaned up when:
- Story creation completes
- Story creation errors
- Story reading finishes
- Image generation completes/errors

This prevents memory leaks and ensures accurate tracking.

## Development & Debugging

In development mode:
- All events are logged to console
- Firebase Analytics DebugView is enabled
- Visit: Firebase Console → Analytics → DebugView
- Test events appear within 10-15 seconds

To enable debug mode:
1. Add `?analytics_debug=1` to URL, OR
2. Set `localStorage.setItem('firebase_analytics_debug', 'true')`, OR
3. Visit `/public/enable-analytics-debug.html`

## Example: Complete Story Creation Flow

```typescript
// 1. Start session
FirebaseAnalyticsService.startStoryCreationSession(userId, kidId, problemDescription);

// 2. Generate titles
FirebaseAnalyticsService.startTitleGeneration(userId, kidId);
const titles = await generateTitles();
FirebaseAnalyticsService.trackTitleGeneration(userId, kidId, titles.length, titleCost);

// 3. Generate story text
FirebaseAnalyticsService.startTextGeneration(userId, kidId, selectedTitle);
const story = await generateStory();
FirebaseAnalyticsService.trackTextGeneration(userId, kidId, story.pages.length, storyCost, selectedTitle);

// 4. Generate images (per page)
for (const page of story.pages) {
  FirebaseAnalyticsService.startImageGeneration(userId, storyId, page.pageType, false, story.title);
  const image = await generateImage(page);
  FirebaseAnalyticsService.trackImageGeneration(userId, storyId, page.pageType, imageCost, false, story.title, kidId);
}

// 5. Complete
FirebaseAnalyticsService.trackStoryCreationComplete(storyId, userId, kidId, story.title);
// Service automatically calculates: total duration, total cost (title + story + all images)
```

## React Hook Example

```typescript
function CreateStoryPage() {
  const {
    trackCreationStart,
    trackTitleGenerationStart,
    trackTitleGenerationComplete,
    trackStoryTextGenerationStart,
    trackStoryTextGenerationComplete,
    trackCreationComplete,
    trackCreationError
  } = useStoryCreationAnalytics(userId, kidId);
  
  const handleCreate = async () => {
    try {
      trackCreationStart(problemDescription);
      
      trackTitleGenerationStart();
      const titles = await generateTitles();
      trackTitleGenerationComplete(titles.length, titleCost);
      
      trackStoryTextGenerationStart(selectedTitle);
      const story = await generateStory();
      trackStoryTextGenerationComplete(story.pages.length, storyCost, selectedTitle);
      
      trackCreationComplete(story.id, story.title);
    } catch (error) {
      trackCreationError(error.message);
    }
  };
}
```

## Best Practices

1. **Always use sessions** for multi-step operations (creation, reading)
2. **Start tracking before** the operation begins
3. **Complete tracking after** the operation finishes
4. **Track errors** to maintain accurate session state
5. **Pass costs when available** for accurate cost tracking
6. **Use hooks in React** components for automatic lifecycle management
7. **Use service directly** in API routes and server-side code

## Backward Compatibility

Legacy method names are still supported:
- `trackStoryCreationStart` → `startStoryCreationSession`
- `trackCreatingTextStart` → `startTextGeneration`
- `trackCreatingTextFinish` → `trackTextGeneration`
- `trackCreatingImageStart` → `startImageGeneration`
- `trackCreatingImageFinish` → `trackImageGeneration`
- `trackStoryReadStart` → `trackReadingStoryStart`
- `trackStoryReadEnd` → `trackReadingStoryFinish`

