import { defineEventHandler, getQuery } from 'h3';

export default defineEventHandler(async (event) => {
  try {
    const { url } = getQuery(event);
    
    if (!url || typeof url !== 'string') {
      return {
        statusCode: 400,
        error: 'Missing or invalid YouTube URL'
      };
    }

    // Extract video ID from URL
    let videoId = '';
    
    if (url.includes('youtube.com/watch')) {
      const urlObj = new URL(url);
      videoId = urlObj.searchParams.get('v') || '';
    } else if (url.includes('youtu.be')) {
      videoId = url.split('/').pop() || '';
    }

    if (!videoId) {
      return {
        statusCode: 400,
        error: 'Could not extract video ID from URL'
      };
    }

    // First, try to get basic metadata using oEmbed (title, author)
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const oembedResponse = await fetch(oembedUrl);
    const oembedData = await oembedResponse.json();

    // Next, fetch the HTML page to extract duration
    const pageUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const pageResponse = await fetch(pageUrl);
    const html = await pageResponse.text();

    // Extract duration using regex pattern matching
    let duration = 0;
    const durationMatch = html.match(/"lengthSeconds":"(\d+)"/);
    if (durationMatch && durationMatch[1]) {
      duration = parseInt(durationMatch[1], 10);
    }

    return {
      title: oembedData.title,
      author: oembedData.author_name,
      thumbnailUrl: oembedData.thumbnail_url,
      videoId,
      duration: duration, // in seconds
      durationMinutes: Math.ceil(duration / 60) // rounded up to nearest minute
    };
  } catch (error) {
    console.error('Error fetching YouTube metadata:', error);
    
    return {
      statusCode: 500,
      error: 'Failed to fetch video metadata'
    };
  }
});