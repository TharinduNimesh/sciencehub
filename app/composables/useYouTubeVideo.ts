import { ref } from 'vue';

interface YouTubeVideoDetails {
  title: string;
  description: string;
  duration: string;
  thumbnailUrl: string;
  videoId: string;
}

export function useYouTubeVideo() {
  const videoDetails = ref<YouTubeVideoDetails | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const isYoutubeUrl = (url: string): boolean => {
    if (!url) return false;
    return url.includes('youtube.com/watch') || url.includes('youtu.be/');
  };

  const extractVideoId = (url: string): string => {
    if (!url) return '';

    if (url.includes('youtube.com/watch')) {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      return urlParams.get('v') || '';
    } 
    
    if (url.includes('youtu.be/')) {
      const id = url.split('/').pop() || '';
      // Ensure we have a string and remove any query params or hash
      return (id.split(/[?#]/)[0] || '');
    }

    return '';
  };

  const loadVideoDetails = async (url: string): Promise<YouTubeVideoDetails | null> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      if (!isYoutubeUrl(url)) {
        throw new Error('Invalid YouTube URL');
      }

      const videoId = extractVideoId(url);
      if (!videoId) {
        throw new Error('Could not extract video ID');
      }

      // Convert short URLs to full URLs
      const fullUrl = url.includes('youtu.be/') 
        ? `https://www.youtube.com/watch?v=${videoId}`
        : url;

      const response = await fetch(`/api/youtube/info?url=${encodeURIComponent(fullUrl)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch video information');
      }
      
      const data = await response.json();
      videoDetails.value = data;

      return videoDetails.value;
    } catch (e) {
      console.error('Error loading video details:', e);
      error.value = e instanceof Error ? e.message : 'Failed to load video details';
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    videoDetails,
    isLoading,
    error,
    loadVideoDetails,
    isYoutubeUrl
  };
}