const axios = require('axios');
const cheerio = require('cheerio');

class WikipediaService {
  static async scrapeWikipediaPage(url) {
    try {
      // Extract Wikipedia title from URL
      const urlMatch = url.match(/\/wiki\/([^#?]+)/);
      if (!urlMatch) {
        throw new Error('Invalid Wikipedia URL format');
      }
      
      const title = decodeURIComponent(urlMatch[1].replace(/_/g, ' '));
      
      // Use Wikipedia API for better, structured content
      const apiUrl = 'https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(title);
      const apiResponse = await axios.get(apiUrl);
      
      if (apiResponse.data.type === 'disambiguation') {
        throw new Error('This is a disambiguation page. Please choose a more specific article.');
      }
      
      // Get full page content using the extract API
      const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=false&explaintext=true&titles=${encodeURIComponent(title)}`;
      const extractResponse = await axios.get(extractUrl);
      
      const pages = extractResponse.data.query.pages;
      const pageId = Object.keys(pages)[0];
      const fullText = pages[pageId]?.extract || '';
      
      // Limit content to prevent token overflow
      const limitedText = fullText.substring(0, 8000);
      
      return {
        title: apiResponse.data.title,
        extract: apiResponse.data.extract,
        fullContent: limitedText,
        imageUrl: apiResponse.data.thumbnail?.source,
        url: url
      };
    } catch (error) {
      console.error('Wikipedia scraping error:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Wikipedia page not found');
      }
      
      throw new Error(`Failed to scrape Wikipedia page: ${error.message}`);
    }
  }

  static validateWikipediaUrl(url) {
    const wikipediaRegex = /^https?:\/\/(en\.)?wikipedia\.org\/wiki\/.+/;
    return wikipediaRegex.test(url);
  }
}

module.exports = WikipediaService;