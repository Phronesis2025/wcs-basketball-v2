// src/lib/youtubeUtils.ts
// Utility functions for working with YouTube URLs

/**
 * Extracts the YouTube video ID from various YouTube URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://youtube.com/watch?v=VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 * @param url - YouTube URL string
 * @returns Video ID string or null if not found
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url || typeof url !== "string") {
    return null;
  }

  // Trim whitespace
  const trimmedUrl = url.trim();

  // YouTube URL patterns
  const patterns = [
    // Standard watch URL: youtube.com/watch?v=VIDEO_ID
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    // Short URL: youtu.be/VIDEO_ID
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    // Embed URL: youtube.com/embed/VIDEO_ID
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = trimmedUrl.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Generates a YouTube thumbnail URL from a video ID
 * Uses maxresdefault (highest quality), falls back to hqdefault if needed
 * @param videoId - YouTube video ID
 * @param quality - Thumbnail quality: 'maxresdefault' (default) or 'hqdefault'
 * @returns Thumbnail URL string
 */
export function getYouTubeThumbnailUrl(
  videoId: string,
  quality: "maxresdefault" | "hqdefault" = "maxresdefault"
): string {
  if (!videoId) {
    return "";
  }
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

/**
 * Generates a YouTube embed URL from a video ID
 * @param videoId - YouTube video ID
 * @returns Embed URL string
 */
export function getYouTubeEmbedUrl(videoId: string): string {
  if (!videoId) {
    return "";
  }
  return `https://www.youtube.com/embed/${videoId}`;
}

/**
 * Validates if a string is a valid YouTube URL
 * @param url - URL string to validate
 * @returns boolean indicating if URL is a valid YouTube URL
 */
export function isValidYouTubeUrl(url: string): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }

  const trimmedUrl = url.trim();
  const videoId = extractYouTubeVideoId(trimmedUrl);
  return videoId !== null;
}

