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
    
    if (!url || typeof url !== 'string') {
      throw createError({
        statusCode: 400,
        message: 'Video URL is required'
      });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        message: 'Failed to fetch video page'
      });
    }

    const html = await response.text();
    const ytPlayerDataMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
    
    if (!ytPlayerDataMatch?.[1]) {
      throw createError({
        statusCode: 500,
        message: 'Could not extract video data'
      });
    }

    const playerData = JSON.parse(ytPlayerDataMatch[1]);
    const videoDetails = playerData.videoDetails;

    if (!videoDetails) {
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

    return {
      title: videoDetails.title || '',
      description: videoDetails.shortDescription || '',
      thumbnailUrl,
      duration: formatDuration(parseInt(videoDetails.lengthSeconds) || 0),
      videoId: videoDetails.videoId
    };
  } catch (error: unknown) {
    console.error('Error scraping YouTube video:', error);
    
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