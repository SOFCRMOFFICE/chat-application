import axios from 'axios';
import * as cheerio from 'cheerio';
import { v4 as uuidv4 } from 'uuid';

/**
 * Main crawler function to fetch MTG.in products
 * This crawler extracts product data from public MTG.in pages
 */
export async function crawlMTGWebsite(supabase) {
  console.log('[Crawler] Starting website crawl...');

  const urlsToScrape = [
    'https://www.mtg.in/books',
    'https://www.mtg.in/practice-tests',
    'https://www.mtg.in/online-courses',
    // Add more category URLs as needed
  ];

  const allProducts = [];
  const errors = [];

  for (const url of urlsToScrape) {
    try {
      console.log(`[Crawler] Fetching: ${url}`);
      const products = await scrapeProductPage(url);
      allProducts.push(...products);
    } catch (error) {
      console.error(`[Crawler] Error scraping ${url}:`, error.message);
      errors.push({ url, error: error.message });
    }
  }

  // Store products in Supabase
  if (allProducts.length > 0) {
    await storeProducts(supabase, allProducts);
  }

  return {
    count: allProducts.length,
    errors: errors.length,
  };
}

/**
 * Scrape a single product page and extract product information
 */
async function scrapeProductPage(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);
    const products = [];

    // Parse products from the page
    // Selectors below are examples - adjust based on actual MTG.in structure
    $('.product-item, .product-card, [data-product]').each((_, element) => {
      const $element = $(element);

      const product = {
        id: uuidv4(),
        title: $element.find('.product-title, .title, h2, h3').text().trim(),
        description: $element.find('.product-description, .description, p').text().trim().substring(0, 500),
        price: extractPrice($element.find('.price, .product-price, [data-price]').text()),
        url: extractProductUrl($element.find('a').attr('href'), url),
        image_url: $element.find('img').attr('src') || $element.find('img').data('src'),
        category: extractCategory(url),
        crawled_at: new Date().toISOString(),
      };

      // Only add if we have at least title and URL
      if (product.title && product.url) {
        products.push(product);
      }
    });

    console.log(`[Crawler] Found ${products.length} products on ${url}`);
    return products;
  } catch (error) {
    console.error(`[Crawler] Failed to scrape ${url}:`, error.message);
    throw error;
  }
}

/**
 * Extract price from text
 */
function extractPrice(text) {
  if (!text) return null;
  const match = text.match(/₹\s*([0-9,]+)/);
  return match ? match[0] : null;
}

/**
 * Convert relative URLs to absolute URLs
 */
function extractProductUrl(href, baseUrl) {
  if (!href) return null;
  if (href.startsWith('http')) return href;
  if (href.startsWith('/')) return `https://www.mtg.in${href}`;
  return `${baseUrl}/${href}`.replace(/([^:]\/)\/+/g, '$1');
}

/**
 * Extract category from URL
 */
function extractCategory(url) {
  const match = url.match(/\/([^/]+)\/?$/);
  return match ? match[1] : 'uncategorized';
}

/**
 * Store products in Supabase
 */
async function storeProducts(supabase, products) {
  console.log(`[Crawler] Storing ${products.length} products in Supabase...`);

  try {
    // Upsert products (update if exists, insert if new)
    const { error } = await supabase.from('products').upsert(
      products.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        price: p.price,
        url: p.url,
        image_url: p.image_url,
        category: p.category,
        crawled_at: p.crawled_at,
      })),
      { onConflict: 'url' }
    );

    if (error) {
      console.error('[Crawler] Error storing products:', error);
      throw error;
    }

    console.log(`[Crawler] Successfully stored ${products.length} products`);
  } catch (error) {
    console.error('[Crawler] Failed to store products:', error);
    throw error;
  }
}

/**
 * Fetch product details from a specific product page
 */
export async function fetchProductDetails(productUrl) {
  try {
    const response = await axios.get(productUrl, {
      timeout: 10000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    const $ = cheerio.load(response.data);

    return {
      title: $('h1').text().trim(),
      description: $('[data-description], .product-description').text().trim(),
      price: extractPrice($('.price, [data-price]').text()),
      image: $('img').first().attr('src'),
      // Add more fields as needed
    };
  } catch (error) {
    console.error('[ProductFetch] Error:', error.message);
    return null;
  }
}
