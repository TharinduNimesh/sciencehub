import { load } from 'cheerio';
import { H3Event } from 'h3';

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

interface YouTubeError extends Error {
  statusCode?: number;
}

export default defineEventHandler(async (event: H3Event) => {
  try {
    const { url } = getQuery(event);
    console.log('[YouTube Info] Received request for URL:', url);
    
    if (!url || typeof url !== 'string') {
      console.log('[YouTube Info] Invalid URL parameter');
      throw createError({
        statusCode: 400,
        message: 'Video URL is required'
      });
    }

    console.log('[YouTube Info] Fetching video page...');
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      }
    });
    
    console.log('[YouTube Info] Fetch response status:', response.status);
    if (!response.ok) {
      console.error('[YouTube Info] Failed to fetch video page:', response.status, response.statusText);
      throw createError({
        statusCode: response.status,
        message: 'Failed to fetch video page'
      });
    }

    const html = await response.text();
    console.log('[YouTube Info] HTML content length:', html.length);
    
    const ytPlayerDataMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
    console.log('[YouTube Info] Player data match found:', !!ytPlayerDataMatch);
    
    if (!ytPlayerDataMatch?.[1]) {
      console.error('[YouTube Info] Could not extract player data from HTML');
      throw createError({
        statusCode: 500,
        message: 'Could not extract video data'
      });
    }

    let playerData;
    try {
      playerData = JSON.parse(ytPlayerDataMatch[1]);
      console.log('[YouTube Info] Successfully parsed player data');
    } catch (parseError) {
      console.error('[YouTube Info] Failed to parse player data:', parseError);
      throw createError({
        statusCode: 500,
        message: 'Failed to parse video data'
      });
    }

    const videoDetails = playerData.videoDetails;
    console.log('[YouTube Info] Video details present:', !!videoDetails);

    if (!videoDetails) {
      console.error('[YouTube Info] Video details not found in player data');
      throw createError({
        statusCode: 500,
        message: 'Video details not found'
      });
    }

    // Get highest quality thumbnail
    const thumbnails = videoDetails.thumbnail?.thumbnails || [];
    const bestThumbnail = thumbnails.sort((a: any, b: any) => b.width - a.width)[0];
    const thumbnailUrl = bestThumbnail?.url || 
                        `https://i.ytimg.com/vi/${videoDetails.videoId}/maxresdefault.jpg`;

    const result = {
      title: videoDetails.title || '',
      description: videoDetails.shortDescription || '',
      thumbnailUrl,
      duration: formatDuration(parseInt(videoDetails.lengthSeconds) || 0),
      videoId: videoDetails.videoId
    };
    
    console.log('[YouTube Info] Successfully extracted video details:', {
      videoId: result.videoId,
      title: result.title,
      duration: result.duration
    });

    return result;
  } catch (error: unknown) {
    console.error('[YouTube Info] Error scraping YouTube video:', error);
    
    if (error instanceof Error) {
      const ytError = error as YouTubeError;
      throw createError({
        statusCode: ytError.statusCode || 500,
        message: ytError.message || 'Failed to fetch video information'
      });
    }
    
    throw createError({
      statusCode: 500,
      message: 'An unexpected error occurred'
    });
  }
});