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

// Fallback regex patterns for video data extraction
const VIDEO_ID_REGEX = /["']videoId["']\s*:\s*["']([^"']+)["']/;
const TITLE_REGEX = /<meta\s+name=["']title["']\s+content=["']([^"']+)["']/i;
const DESCRIPTION_REGEX = /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i;
const LENGTH_SECONDS_REGEX = /["']lengthSeconds["']\s*:\s*["']?(\d+)["']?/;

function extractFromRegex(content: string, regex: RegExp): string {
  const match = content.match(regex);
  return match?.[1] || '';
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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
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
    
    // Try primary method first
    const ytPlayerDataMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
    console.log('[YouTube Info] Player data match found:', !!ytPlayerDataMatch);
    
    let videoDetails = null;
    let playerData = null;

    if (ytPlayerDataMatch?.[1]) {
      try {
        playerData = JSON.parse(ytPlayerDataMatch[1]);
        console.log('[YouTube Info] Successfully parsed player data');
        console.log('[YouTube Info] Player data keys:', Object.keys(playerData));
        
        if (playerData.videoDetails) {
          videoDetails = playerData.videoDetails;
          console.log('[YouTube Info] Found video details in player data');
        }
      } catch (parseError) {
        console.error('[YouTube Info] Failed to parse player data:', parseError);
      }
    }

    // If primary method fails, try fallback method
    if (!videoDetails) {
      console.log('[YouTube Info] Using fallback method to extract video details');
      
      const videoId = extractFromRegex(html, VIDEO_ID_REGEX);
      const title = extractFromRegex(html, TITLE_REGEX);
      const description = extractFromRegex(html, DESCRIPTION_REGEX);
      const lengthSeconds = extractFromRegex(html, LENGTH_SECONDS_REGEX);
      
      if (!videoId) {
        throw createError({
          statusCode: 500,
          message: 'Could not extract video ID'
        });
      }

      videoDetails = {
        videoId,
        title: title.replace(' - YouTube', '').trim(),
        shortDescription: description,
        lengthSeconds: lengthSeconds || '0',
        thumbnail: {
          thumbnails: [{
            url: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
            width: 1280,
            height: 720
          }]
        }
      };
      
      console.log('[YouTube Info] Extracted video details using fallback method:', {
        videoId,
        title: videoDetails.title,
        hasDescription: !!description
      });
    }

    if (!videoDetails) {
      console.error('[YouTube Info] Failed to extract video details using both methods');
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