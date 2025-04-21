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
  
  // Try to find ytInitialData in multiple script tags
  $('script').each((_, element) => {
    const scriptContent = $(element).html() || '';
    if (scriptContent.includes('ytInitialData = ')) {
      try {
        const match = scriptContent.match(/ytInitialData\s*=\s*({.+?});/);
        if (match?.[1]) {
          ytInitialData = JSON.parse(match[1]);
          return false;
        }
      } catch (e) {
        console.error('[YouTube Info] Failed to parse ytInitialData:', e);
      }
    }
  });

  // Try to find ytInitialData in inline script
  if (!ytInitialData) {
    try {
      const scriptData = $('script[nonce]').text();
      const match = scriptData.match(/var\s+ytInitialData\s*=\s*({.+?});/);
      if (match?.[1]) {
        ytInitialData = JSON.parse(match[1]);
      }
    } catch (e) {
      console.error('[YouTube Info] Failed to parse inline ytInitialData:', e);
    }
  }
  
  return ytInitialData;
}

function extractYouTubePlayerResponse($: cheerio.CheerioAPI): any {
  let playerResponse = null;
  
  $('script').each((_, element) => {
    const scriptContent = $(element).html() || '';
    if (scriptContent.includes('ytInitialPlayerResponse')) {
      try {
        const match = scriptContent.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
        if (match?.[1]) {
          playerResponse = JSON.parse(match[1]);
          return false;
        }
      } catch (e) {
        console.error('[YouTube Info] Failed to parse ytInitialPlayerResponse:', e);
      }
    }
  });
  
  return playerResponse;
}

function findStructuredDescription($: cheerio.CheerioAPI, data: any): string {
  // First try to find in engagement panels
  const panels = data?.engagementPanels || [];
  for (const panel of panels) {
    try {
      const content = panel?.engagementPanelSectionListRenderer?.content;
      if (content?.structuredDescriptionContentRenderer?.items) {
        const items = content.structuredDescriptionContentRenderer.items;
        for (const item of items) {
          if (item.expandableVideoDescriptionBodyRenderer?.descriptionBodyText?.runs) {
            return item.expandableVideoDescriptionBodyRenderer.descriptionBodyText.runs
              .map((r: any) => r.text)
              .join('');
          }
        }
      }
    } catch (e) {
      console.error('[YouTube Info] Error parsing engagement panel:', e);
    }
  }

  // Try to find in video secondary info
  try {
    const contents = data?.contents?.twoColumnWatchNextResults?.results?.results?.contents || [];
    for (const content of contents) {
      if (content?.videoSecondaryInfoRenderer?.description?.runs) {
        return content.videoSecondaryInfoRenderer.description.runs
          .map((r: any) => r.text)
          .join('');
      }
    }
  } catch (e) {
    console.error('[YouTube Info] Error parsing secondary info:', e);
  }

  // Try to find in meta tags as last resort
  const metaDesc = $('meta[name="description"]').attr('content') || '';
  if (metaDesc && !metaDesc.includes('Enjoy the videos and music')) {
    return metaDesc;
  }

  return '';
}

function findVideoDataInInitialData(data: any): any {
  if (!data) return null;
  
  // Try to find video data in different possible paths
  const paths = [
    'contents.twoColumnWatchNextResults.results.results.contents[0].videoPrimaryInfoRenderer',
    'contents.twoColumnWatchNextResults.results.results.contents[1].videoSecondaryInfoRenderer',
    'playerOverlays.playerOverlayRenderer.videoDetails',
    'microformat.playerMicroformatRenderer',
    'contents.playerOverlayRenderer.videoDetails',
    'playerOverlays.playerOverlayRenderer.content.reelsPlayerOverlayRenderer.reelPlayerHeaderSupportedRenderers.reelPlayerHeaderRenderer',
    'contents.twoColumnWatchNextResults.results.results.contents[0].reelPlayerHeaderSupportedRenderers.reelPlayerHeaderRenderer'
  ];
  
  let foundData: any = {};
  
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
      
      // Merge data from different sections
      if (value.title) foundData.title = value.title;
      if (value.description) foundData.description = value.description;
      if (value.lengthText || value.durationText) foundData.duration = value.lengthText || value.durationText;
      if (value.videoDetails) Object.assign(foundData, value.videoDetails);
      if (value.timeDescription) foundData.duration = value.timeDescription;
    }
  }
  
  // Additional paths for description
  const descriptionPaths = [
    'engagementPanels[0].engagementPanelSectionListRenderer.content.structuredDescriptionContentRenderer.items[0].expandableVideoDescriptionBodyRenderer.descriptionBodyText.runs',
    'engagementPanels[1].engagementPanelSectionListRenderer.content.structuredDescriptionContentRenderer.items[0].expandableVideoDescriptionBodyRenderer.descriptionBodyText.runs',
    'contents.twoColumnWatchNextResults.results.results.contents[1].videoSecondaryInfoRenderer.description.runs',
    'contents.twoColumnWatchNextResults.results.results.contents[0].videoPrimaryInfoRenderer.description.runs',
    'contents.twoColumnWatchNextResults.results.results.contents[1].structuredDescriptionContentRenderer.items[0].videoDescriptionHeaderRenderer.description.runs'
  ];
  
  // Try each description path
  for (const path of descriptionPaths) {
    let value = path.split('.').reduce((obj, key) => {
      if (key.includes('[')) {
        const [arrayKey, index] = key.split(/[\[\]]/);
        return (obj?.[arrayKey] || [])[parseInt(index)] || null;
      }
      return obj?.[key] || null;
    }, data);
    
    if (Array.isArray(value)) {
      foundData.descriptionRuns = value;
      console.log('[YouTube Info] Found description in path:', path);
      break;
    }
  }

  // Additional paths for duration
  const durationPaths = [
    'contents.twoColumnWatchNextResults.results.results.contents[0].videoPrimaryInfoRenderer.videoActions.menuRenderer.topLevelButtons[0].segmentedLikeDislikeButtonRenderer.likeCountWithDurationAriaLabel.accessibilityData.label',
    'microformat.playerMicroformatRenderer.lengthSeconds',
    'videoDetails.lengthSeconds',
    'contents.twoColumnWatchNextResults.results.results.contents[0].videoPrimaryInfoRenderer.dateText.simpleText'
  ];

  for (const path of durationPaths) {
    let value = path.split('.').reduce((obj, key) => {
      if (key.includes('[')) {
        const [arrayKey, index] = key.split(/[\[\]]/);
        return (obj?.[arrayKey] || [])[parseInt(index)] || null;
      }
      return obj?.[key] || null;
    }, data);

    if (value) {
      // Try to extract duration from aria label if present
      if (typeof value === 'string' && value.includes('minute')) {
        const match = value.match(/(\d+)\s*minute.*?(\d+)\s*second/);
        if (match) {
          foundData.lengthSeconds = String(parseInt(match[1]) * 60 + parseInt(match[2]));
          console.log('[YouTube Info] Found duration in aria label:', foundData.lengthSeconds);
          break;
        }
      } else if (typeof value === 'string' || typeof value === 'number') {
        foundData.lengthSeconds = String(value);
        console.log('[YouTube Info] Found duration in path:', path);
        break;
      }
    }
  }
  
  return Object.keys(foundData).length > 0 ? foundData : null;
}

function extractVideoDetailsFromData(videoData: any, url: string): any {
  if (!videoData) return null;

  console.log('[YouTube Info] Extracting details from data structure');
  
  // Handle different data structures
  const videoId = videoData.videoId || 
                 new URL(url).searchParams.get('v') || 
                 '';
                 
  let title = '';
  // Handle playerOverlayVideoDetailsRenderer structure
  if (videoData.playerOverlayVideoDetailsRenderer?.title?.simpleText) {
    title = videoData.playerOverlayVideoDetailsRenderer.title.simpleText;
  } else if (videoData.title?.simpleText) {
    title = videoData.title.simpleText;
  } else if (videoData.title?.runs?.[0]?.text) {
    title = videoData.title.runs[0].text;
  } else if (typeof videoData.title === 'string') {
    title = videoData.title;
  }
  
  console.log('[YouTube Info] Extracted title:', title);
  
  let description = '';
  // Try to get full description from structured data
  description = findStructuredDescription(cheerio.load(''), videoData);

  // Fallback to description runs if structured data is not available
  if (!description && videoData.descriptionRuns) {
    description = videoData.descriptionRuns.map((r: any) => r.text).join('');
  } else if (!description && videoData.description?.simpleText) {
    description = videoData.description.simpleText;
  } else if (!description && videoData.description?.runs) {
    description = videoData.description.runs.map((r: any) => r.text).join('');
  } else if (!description && typeof videoData.description === 'string') {
    description = videoData.description;
  }
  
  // Don't fallback to subtitle/view count if we don't have a proper description
  if (!description && videoData.playerOverlayVideoDetailsRenderer?.subtitle?.runs) {
    const subtitleText = videoData.playerOverlayVideoDetailsRenderer.subtitle.runs
      .map((r: any) => r.text)
      .join('');
    if (!subtitleText.includes('views')) {
      description = subtitleText;
    }
  }
  
  console.log('[YouTube Info] Found description:', !!description);
  
  // Try to find duration in multiple locations and formats
  let duration = '0';
  let durationText = '';
  
  if (videoData.lengthText?.simpleText) {
    durationText = videoData.lengthText.simpleText;
  } else if (videoData.durationText?.simpleText) {
    durationText = videoData.durationText.simpleText;
  } else if (videoData.duration?.simpleText) {
    durationText = videoData.duration.simpleText;
  } else if (videoData.timeDescription?.simpleText) {
    durationText = videoData.timeDescription.simpleText;
  }
  
  if (durationText) {
    // Convert MM:SS or HH:MM:SS format to seconds
    const parts = durationText.split(':').map(Number);
    if (parts.length === 2) {
      duration = String(parts[0] * 60 + parts[1]);
    } else if (parts.length === 3) {
      duration = String(parts[0] * 3600 + parts[1] * 60 + parts[2]);
    }
  } else if (videoData.lengthSeconds) {
    duration = videoData.lengthSeconds;
  }
  
  console.log('[YouTube Info] Found duration text:', durationText);
  console.log('[YouTube Info] Converted duration:', duration);
  
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
    const playerResponse = extractYouTubePlayerResponse($);
    if (playerResponse?.videoDetails) {
      videoDetails = playerResponse.videoDetails;
      // If we have streamingData, extract exact duration
      if (playerResponse.streamingData?.formats?.[0]?.approxDurationMs) {
        const durationMs = parseInt(playerResponse.streamingData.formats[0].approxDurationMs);
        videoDetails.lengthSeconds = String(Math.round(durationMs / 1000));
      }
      console.log('[YouTube Info] Found video details in ytInitialPlayerResponse');
    }

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
      
      // Try to find description in meta tags first
      let description = '';
      const ogDescription = $('meta[property="og:description"]').attr('content') || '';
      if (ogDescription && !ogDescription.includes('Enjoy the videos and music')) {
        description = ogDescription;
      } else {
        description = $('meta[name="description"]').attr('content') || 
                     $('meta[itemprop="description"]').attr('content') || '';
      }
      
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

      // Only use this data if we found a meaningful title and non-default description
      if (videoId && title && title !== 'YouTube' && 
          description && !description.includes('Enjoy the videos and music')) {
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