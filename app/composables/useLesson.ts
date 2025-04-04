// Utility functions for lesson components

// Check if URL is a YouTube link
export const isYoutubeUrl = (url: string): boolean => {
  if (!url) return false;
  return url.includes('youtube.com') || url.includes('youtu.be');
};

// Extract YouTube video ID from URL
export function extractYoutubeVideoId(url: string): string {
  if (!url) return '';

  let videoId = '';

  if (url.includes('youtube.com/watch')) {
    const urlParams = new URLSearchParams(url.split('?')[1]);
    videoId = urlParams.get('v') || '';
  } else if (url.includes('youtu.be')) {
    videoId = url.split('/').pop() || '';
    // Remove any additional parameters
    videoId = (videoId.split('?')[0] || '');
  }

  return videoId;
}

// Get YouTube thumbnail URL from video URL
export function getYoutubeThumbnail(url: string, defaultThumbnail: string = 'https://placehold.co/800x450?text=No+Thumbnail'): string {
  if (!url) return defaultThumbnail;
  if (!isYoutubeUrl(url)) return defaultThumbnail;

  const videoId = extractYoutubeVideoId(url);
  if (!videoId) return defaultThumbnail;

  // Return YouTube thumbnail URL (high quality)
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

// Get default thumbnail based on resource type
export function getResourceTypeThumbnail(type: string): string {
  switch (type) {
    case 'document':
      return 'https://placehold.co/800x450?text=Document+Resource';
    case 'image':
      return 'https://placehold.co/800x450?text=Image+Gallery';
    default:
      return 'https://placehold.co/800x450?text=No+Thumbnail';
  }
}

// Debounce function for URL input
export const debounce = <F extends (...args: any[]) => any>(fn: F, delay: number) => {
  let timeoutId: number | undefined;
  
  return function(this: any, ...args: Parameters<F>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = window.setTimeout(() => {
      fn.apply(this, args);
    }, delay) as unknown as number;
  };
};

// Fetch YouTube metadata using oEmbed API
export async function fetchYoutubeMetadata(url: string) {
  if (!url || !isYoutubeUrl(url)) {
    throw new Error('Not a valid YouTube URL');
  }

  const videoId = extractYoutubeVideoId(url);
  if (!videoId) {
    throw new Error('Could not extract video ID');
  }

  // Use YouTube's oEmbed API which doesn't require API keys
  const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
  const corsProxy = 'https://corsproxy.io/?'; // Use CORS proxy to avoid CORS errors

  const response = await fetch(`${corsProxy}${encodeURIComponent(oEmbedUrl)}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.status}`);
  }

  return await response.json();
}

// Estimate video duration based on thumbnail quality
export async function estimateVideoDuration(videoId: string): Promise<number> {
  return new Promise((resolve) => {
    try {
      // Try to fetch HD thumbnail (indicator of longer content)
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      const imgTest = new Image();
      
      let duration = 10; // Default duration
      
      imgTest.onload = () => {
        // If HD thumbnail exists and is not the default image (120x90)
        if (imgTest.naturalWidth > 120) {
          duration = 15; // Estimate 15 minutes for HD content
        } else {
          duration = 5; // Estimate 5 minutes for standard content
        }
        resolve(duration);
      };
      
      imgTest.onerror = () => {
        resolve(10); // Use default if thumbnail check fails
      };
      
      imgTest.src = thumbnailUrl;
      
      // Set timeout in case onload/onerror doesn't fire
      setTimeout(() => resolve(10), 2000);
    } catch (error) {
      console.error('Error estimating duration:', error);
      resolve(10); // Default to 10 minutes on error
    }
  });
}