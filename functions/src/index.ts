// Main index file - exports all Firebase Functions
// Functions are organized into separate files for better maintainability

// Import utils to ensure Firebase Admin initialization happens
import "./lib/utils";

// Export example and debug functions
export * from "./functions/example";

// Export text and image generation functions
export * from "./functions/text-generation";
export * from "./functions/image-generation";

// Export story-related functions
export * from "./functions/story-text";
export * from "./functions/story-images";
export * from "./functions/image-prompt-and-image";
export * from "./functions/full-story";
export * from "./functions/story-titles";

// Export HTTP versions
export * from "./functions/http-versions";
