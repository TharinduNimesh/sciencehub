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
    
    // Load HTML content into Cheerio
    const $ = load(html);
    
    // Try primary method first (using script tags)
    let videoDetails = null;
    
    // Find the script tag containing ytInitialPlayerResponse
    $('script').each((_, element) => {
      const scriptContent = $(element).html() || '';
      if (scriptContent.includes('ytInitialPlayerResponse')) {
        try {
          const match = scriptContent.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
          if (match?.[1]) {
            const playerData = JSON.parse(match[1]);
            if (playerData.videoDetails) {
              videoDetails = playerData.videoDetails;
              return false; // Break the loop
            }
          }
        } catch (e) {
          console.error('[YouTube Info] Failed to parse player data from script:', e);
        }
      }
    });

    // If primary method fails, use Cheerio to extract information
    if (!videoDetails) {
      console.log('[YouTube Info] Using Cheerio fallback method');
      
      const videoId = new URL(url as string).searchParams.get('v') || '';
      const title = $('meta[property="og:title"]').attr('content') || 
                   $('title').text().replace(' - YouTube', '').trim();
      const description = $('meta[property="og:description"]').attr('content') || 
                         $('meta[name="description"]').attr('content') || '';
      
      // Try to find duration in various meta tags
      let duration = '0';
      const durationStr = $('meta[itemprop="duration"]').attr('content') || '';
      if (durationStr) {
        // Convert ISO 8601 duration to seconds
        const match = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (match) {
          const hours = parseInt(match[1] || '0');
          const minutes = parseInt(match[2] || '0');
          const seconds = parseInt(match[3] || '0');
          duration = String(hours * 3600 + minutes * 60 + seconds);
        }
      }

      if (!videoId) {
        throw createError({
          statusCode: 500,
          message: 'Could not extract video ID'
        });
      }

      videoDetails = {
        videoId,
        title,
        shortDescription: description,
        lengthSeconds: duration,
        thumbnail: {
          thumbnails: [{
            url: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
            width: 1280,
            height: 720
          }]
        }
      };
      
      console.log('[YouTube Info] Extracted video details using Cheerio:', {
        videoId,
        title,
        hasDuration: !!duration
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