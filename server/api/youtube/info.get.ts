import * as cheerio from 'cheerio';
import { H3Event } from 'h3';

interface YouTubeVideoDetails {
  videoId: string;
  title: string;
  shortDescription: string;
  lengthSeconds: string;
  thumbnail: {
    thumbnails: Array<{ url: string; width?: number }>;
  };
}

interface YouTubeInitialData {
  contents?: any;
  engagementPanels?: any[];
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function parseYouTubeScripts($: cheerio.CheerioAPI): { videoDetails: YouTubeVideoDetails | null; initialData: YouTubeInitialData | null } {
  let videoDetails: YouTubeVideoDetails | null = null;
  let ytInitialData: YouTubeInitialData | null = null;
  
  // Process scripts in a single pass
  $('script').each((_, element) => {
    const content = $(element).html() || '';
    
    // Extract player response
    if (!videoDetails && content.includes('ytInitialPlayerResponse')) {
      try {
        const match = content.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
        if (match?.[1]) {
          const data = JSON.parse(match[1]);
          if (data.videoDetails) {
            videoDetails = data.videoDetails;
          }
        }
      } catch (e) {
        console.error('Failed to parse player response:', e);
      }
    }
    
    // Extract initial data
    if (!ytInitialData && content.includes('ytInitialData')) {
      try {
        const match = content.match(/(?:var\s+)?ytInitialData\s*=\s*({.+?});/);
        if (match?.[1]) {
          ytInitialData = JSON.parse(match[1]);
        }
      } catch (e) {
        console.error('Failed to parse initial data:', e);
      }
    }
  });

  return { videoDetails, initialData: ytInitialData };
}

function extractMetadata($: cheerio.CheerioAPI): { title: string; description: string; duration: string } {
  const metaTags: Record<string, string> = {};
  
  $('meta[property^="og:"], meta[name], meta[itemprop]').each((_, element) => {
    const property = $(element).attr('property')?.substring(3) || 
                    $(element).attr('name') || 
                    $(element).attr('itemprop');
    if (property) {
      metaTags[property] = $(element).attr('content') || '';
    }
  });
  
  const title = metaTags['title'] || 
                metaTags['name'] || 
                $('title').text().replace(' - YouTube', '').trim();
                
  const description = metaTags['description']?.includes('Enjoy the videos and music') 
    ? '' 
    : metaTags['description'] || '';
    
  let duration = '0';
  if (metaTags['duration']) {
    const match = metaTags['duration'].match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (match) {
      const [_, hours = '0', minutes = '0', seconds = '0'] = match;
      duration = String(parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds));
    }
  }
  
  return { title, description, duration };
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

    // Fetch video page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Cookie': 'CONSENT=YES+;'
      }
    });

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        message: 'Failed to fetch video page'
      });
    }

    const html = await response.text();
    const $ = cheerio.load(html, { xml: false });
    
    // Try to extract video details from different sources
    const { videoDetails, initialData } = parseYouTubeScripts($);
    const videoId = new URL(url).searchParams.get('v') || '';
    
    if (!videoDetails && !videoId) {
      throw createError({
        statusCode: 400,
        message: 'Invalid YouTube URL'
      });
    }
    
    // If no video details from scripts, try metadata
    if (!videoDetails) {
      const { title, description, duration } = extractMetadata($);
      
      if (title && !title.includes('YouTube')) {
        return {
          title,
          description,
          videoId,
          duration: formatDuration(parseInt(duration)),
          thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
        };
      }
      
      throw createError({
        statusCode: 500,
        message: 'Could not extract video details'
      });
    }
    
    // Get best quality thumbnail
    const thumbnails = videoDetails.thumbnail?.thumbnails || [];
    const bestThumbnail = thumbnails.sort((a, b) => (b.width || 0) - (a.width || 0))[0];
    
    return {
      title: videoDetails.title,
      description: videoDetails.shortDescription || '',
      thumbnailUrl: bestThumbnail?.url || `https://i.ytimg.com/vi/${videoDetails.videoId}/maxresdefault.jpg`,
      duration: formatDuration(parseInt(videoDetails.lengthSeconds)),
      videoId: videoDetails.videoId
    };

  } catch (error) {
    console.error('Error fetching video info:', error);
    
    if (error instanceof Error) {
      throw createError({
        statusCode: (error as any).statusCode || 500,
        message: error.message || 'Failed to fetch video information'
      });
    }
    
    throw createError({
      statusCode: 500,
      message: 'An unexpected error occurred'
    });
  }
});