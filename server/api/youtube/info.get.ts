import * as cheerio from 'cheerio';
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

function extractYouTubeInitialData($: cheerio.CheerioAPI): any {
  let ytInitialData = null;
  
  $('script').each((_, element) => {
    const scriptContent = $(element).html() || '';
    if (scriptContent.includes('ytInitialData = ')) {
      try {
        const match = scriptContent.match(/ytInitialData\s*=\s*({.+?});/);
        if (match?.[1]) {
          ytInitialData = JSON.parse(match[1]);
          return false; // Break the loop
        }
      } catch (e) {
        console.error('[YouTube Info] Failed to parse ytInitialData:', e);
      }
    }
  });
  
  return ytInitialData;
}

function findVideoDataInInitialData(data: any): any {
  if (!data) return null;
  
  // Try to find video data in different possible paths
  const paths = [
    'contents.twoColumnWatchNextResults.results.results.contents[0].videoPrimaryInfoRenderer',
    'contents.twoColumnWatchNextResults.results.results.contents[1].videoSecondaryInfoRenderer',
    'playerOverlays.playerOverlayRenderer.videoDetails',
    'microformat.playerMicroformatRenderer',
    'contents.playerOverlayRenderer.videoDetails'
  ];
  
  let foundValue = null;
  
  for (const path of paths) {
    const value = path.split('.').reduce((obj, key) => {
      if (Array.isArray(obj)) {
        const index = parseInt(key);
        return obj[index] || null;
      }
      return obj?.[key] || null;
    }, data);
    
    if (value) {
      console.log('[YouTube Info] Found video data in path:', path);
      console.log('[YouTube Info] Video data structure:', JSON.stringify(value, null, 2));
      foundValue = value;
      break;
    }
  }
  
  return foundValue;
}

function extractVideoDetailsFromData(videoData: any, url: string): any {
  if (!videoData) return null;

  console.log('[YouTube Info] Extracting details from data structure');
  
  // Handle different data structures
  const videoId = videoData.videoId || 
                 new URL(url).searchParams.get('v') || 
                 '';
                 
  let title = '';
  if (videoData.title?.simpleText) {
    title = videoData.title.simpleText;
  } else if (videoData.title?.runs?.[0]?.text) {
    title = videoData.title.runs[0].text;
  } else if (typeof videoData.title === 'string') {
    title = videoData.title;
  }
  
  console.log('[YouTube Info] Extracted title:', title);
  
  let description = '';
  if (videoData.description?.simpleText) {
    description = videoData.description.simpleText;
  } else if (videoData.description?.runs) {
    description = videoData.description.runs.map((r: any) => r.text).join('');
  } else if (typeof videoData.description === 'string') {
    description = videoData.description;
  }
  
  console.log('[YouTube Info] Found description:', !!description);
  
  let duration = '0';
  if (videoData.lengthSeconds) {
    duration = videoData.lengthSeconds;
  } else if (videoData.duration) {
    duration = videoData.duration;
  } else if (videoData.durationSeconds) {
    duration = videoData.durationSeconds;
  }
  
  console.log('[YouTube Info] Found duration:', duration);
  
  // Only return if we have at least a video ID and title
  if (videoId && title) {
    return {
      videoId,
      title,
      shortDescription: description,
      lengthSeconds: duration,
      thumbnail: {
        thumbnails: [{
          url: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
        }]
      }
    };
  }
  
  return null;
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
        'Cookie': 'CONSENT=YES+; ',
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
    const $ = cheerio.load(html);
    
    // Try multiple methods to extract video details
    let videoDetails: any = null;
    
    // Method 1: Try to find and parse ytInitialPlayerResponse
    $('script').each((_, element) => {
      if (videoDetails) return false;
      
      const scriptContent = $(element).html() || '';
      if (scriptContent.includes('ytInitialPlayerResponse')) {
        try {
          const match = scriptContent.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
          if (match?.[1]) {
            const playerData = JSON.parse(match[1]);
            if (playerData.videoDetails) {
              videoDetails = playerData.videoDetails;
              console.log('[YouTube Info] Found video details in ytInitialPlayerResponse');
              return false;
            }
          }
        } catch (e) {
          console.error('[YouTube Info] Failed to parse player data:', e);
        }
      }
    });

    // Method 2: Try to find and parse ytInitialData
    if (!videoDetails) {
      console.log('[YouTube Info] Trying ytInitialData method...');
      const ytData = extractYouTubeInitialData($);
      const videoData = findVideoDataInInitialData(ytData);
      
      if (videoData) {
        videoDetails = extractVideoDetailsFromData(videoData, url as string);
        if (videoDetails) {
          console.log('[YouTube Info] Successfully extracted details from ytInitialData');
        }
      }
    }

    // Method 3: Extract from meta tags if still no details
    if (!videoDetails) {
      console.log('[YouTube Info] Using meta tags fallback method');
      
      const videoId = new URL(url as string).searchParams.get('v') || '';
      const title = $('meta[property="og:title"]').attr('content') || 
                   $('meta[name="title"]').attr('content') ||
                   $('title').text().replace(' - YouTube', '').trim();
      const description = $('meta[property="og:description"]').attr('content') || 
                         $('meta[name="description"]').attr('content') || 
                         $('meta[itemprop="description"]').attr('content') || '';
      
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

      // Only use this data if we found a meaningful title
      if (videoId && title && title !== 'YouTube') {
        videoDetails = {
          videoId,
          title,
          shortDescription: description,
          lengthSeconds: duration,
          thumbnail: {
            thumbnails: [{
              url: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
            }]
          }
        };
        console.log('[YouTube Info] Successfully extracted from meta tags');
      }
    }

    if (!videoDetails?.title) {
      console.error('[YouTube Info] Failed to extract video details using all methods');
      throw createError({
        statusCode: 500,
        message: 'Video details not found'
      });
    }

    // Get highest quality thumbnail
    const thumbnails = videoDetails.thumbnail?.thumbnails || [];
    const bestThumbnail = thumbnails.sort((a: any, b: any) => (b.width || 0) - (a.width || 0))[0];
    const thumbnailUrl = bestThumbnail?.url || 
                        `https://i.ytimg.com/vi/${videoDetails.videoId}/maxresdefault.jpg`;

    const result = {
      title: videoDetails.title,
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