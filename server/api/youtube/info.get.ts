import { H3Event } from 'h3';

interface YouTubeVideoDetails {
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: string;
  videoId: string;
}

function formatDuration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '00:00:00';

  const [_, hours = '0', minutes = '0', seconds = '0'] = match;
  
  // Convert all to numbers
  const h = parseInt(hours);
  const m = parseInt(minutes);
  const s = parseInt(seconds);
  
  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  } else {
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
}

export default defineEventHandler(async (event: H3Event) => {
  try {
    const { url } = getQuery(event);
    const apiKey = useRuntimeConfig().youtubeApiKey;
    
    if (!url || typeof url !== 'string') {
      throw createError({
        statusCode: 400,
        message: 'Video URL is required'
      });
    }

    if (!apiKey) {
      throw createError({
        statusCode: 500,
        message: 'YouTube API key is not configured'
      });
    }

    // Extract video ID from URL
    const videoId = new URL(url).searchParams.get('v');
    if (!videoId) {
      throw createError({
        statusCode: 400,
        message: 'Invalid YouTube URL'
      });
    }

    // Fetch video details from YouTube Data API
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,contentDetails`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        message: `YouTube API error: ${response.statusText}`
      });
    }

    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'Video not found'
      });
    }

    const video = data.items[0];
    const snippet = video.snippet;
    const contentDetails = video.contentDetails;

    // Get best quality thumbnail
    const thumbnails = snippet.thumbnails;
    const bestThumbnail = thumbnails.maxres || thumbnails.high || thumbnails.medium || thumbnails.default;

    const videoDetails: YouTubeVideoDetails = {
      title: snippet.title,
      description: snippet.description || '',
      thumbnailUrl: bestThumbnail.url,
      duration: formatDuration(contentDetails.duration),
      videoId: videoId
    };

    return videoDetails;

  } catch (error) {
    console.error('Error fetching video info:', error);
    
    if (error instanceof Error) {
      throw createError({
        statusCode: (error as any).statusCode || 500,
        message: error.message || 'Failed to fetch video information',
        cause: error
      });
    }
    
    throw createError({
      statusCode: 500,
      message: 'An unexpected error occurred',
      cause: error
    });
  }
});