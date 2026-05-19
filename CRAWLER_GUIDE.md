# MTG.in Website Crawler - Configuration Guide

## Overview

The crawler automatically extracts product data from public MTG.in website pages and stores it in Supabase for semantic search.

## How It Works

1. **Fetch** - Downloads HTML from MTG.in product pages
2. **Parse** - Extracts product details using CSS selectors
3. **Transform** - Cleans and normalizes data
4. **Embed** - Generates vector embeddings for semantic search
5. **Store** - Saves to Supabase database

```
MTG.in Website → HTML Download → Parse → Transform → Embed → Supabase
```

## Configuration

### 1. Identify Target URLs

Edit `backend/crawler.js` and add MTG.in category URLs:

```javascript
const urlsToScrape = [
  'https://www.mtg.in/books',                          // All books
  'https://www.mtg.in/books/class-10',                 // Class 10
  'https://www.mtg.in/books/class-12',                 // Class 12
  'https://www.mtg.in/books/jee-preparation',          // JEE
  'https://www.mtg.in/books/neet-preparation',         // NEET
  'https://www.mtg.in/books/competitive-exams',        // Other exams
  'https://www.mtg.in/online-practice-tests',          // Practice tests
  'https://www.mtg.in/courses',                        // Courses
];
```

### 2. Update CSS Selectors

Once you inspect the MTG.in website HTML, update the selectors in `scrapeProductPage()`:

```javascript
async function scrapeProductPage(url) {
  // ... existing code ...
  
  $('.product-item, .product-card, [data-product]').each((_, element) => {
    const $element = $(element);
    
    // Update these selectors based on MTG.in HTML structure
    const product = {
      title: $element.find('.product-title, .name, h2').text().trim(),
      description: $element.find('.description, .summary').text().trim(),
      price: extractPrice($element.find('.price, .amount').text()),
      url: extractProductUrl($element.find('a.product-link').attr('href')),
      image_url: $element.find('img.product-image').attr('src'),
      category: extractCategory(url),
    };
  });
}
```

### 3. Test Selectors

Before running full crawl, test on a single page:

```bash
# Add test code in backend/crawler.js
node -e "
const { scrapeProductPage } = require('./backend/crawler.js');
scrapeProductPage('https://www.mtg.in/books/class-10').then(p => {
  console.log('Found', p.length, 'products');
  console.log('Sample:', p[0]);
});
"
```

### 4. Adjust Parsing Logic

Customize the parsing based on MTG.in's actual HTML:

```javascript
// Example: If MTG.in uses data attributes
const product = {
  id: uuidv4(),
  title: $element.data('product-name'),
  price: $element.data('product-price'),
  url: $element.data('product-url'),
  image_url: $element.data('product-image'),
  category: $element.data('category'),
};
```

## Running the Crawler

### Method 1: Manual Trigger via API

```bash
curl -X POST http://localhost:3001/api/crawler/sync \
  -H "Authorization: Bearer your_crawler_token" \
  -H "Content-Type: application/json"
```

### Method 2: Direct Node.js

```bash
node -e "
import { crawlMTGWebsite } from './backend/crawler.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

crawlMTGWebsite(supabase).then(result => {
  console.log('Crawl results:', result);
  process.exit(0);
});
"
```

### Method 3: Scheduled Cron (Vercel)

Create `api/cron/crawl.js`:

```javascript
export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const result = await crawlMTGWebsite(supabase);
  res.json({ status: 'success', result });
}
```

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/crawl",
      "schedule": "0 2 * * *"
    }
  ]
}
```

## Understanding the Data Flow

### Input Example

**MTG.in Product Page HTML:**
```html
<div class="product-item" data-product-id="12345">
  <h2 class="product-title">MTG Class 10 Science (Complete Guide)</h2>
  <div class="product-price">₹499</div>
  <img src="/images/class-10-science.jpg" alt="Product" />
  <a href="/products/class-10-science" class="product-link">View Details</a>
  <div class="category">Class 10</div>
  <div class="description">Comprehensive science guide covering all topics...</div>
</div>
```

### Parsing

```javascript
const product = {
  id: 'uuid-generated',
  title: 'MTG Class 10 Science (Complete Guide)',
  price: '₹499',
  url: 'https://www.mtg.in/products/class-10-science',
  image_url: 'https://www.mtg.in/images/class-10-science.jpg',
  category: 'Class 10',
  description: 'Comprehensive science guide covering all topics...',
  crawled_at: '2026-05-18T12:30:00Z'
};
```

### Storage

Stored in Supabase `products` table:

```
id               | title                          | price  | url      | category   | embedding (1536 dims) | crawled_at
-----------------+--------------------------------+--------+----------+------------+-----------------------+---
uuid-1           | MTG Class 10 Science...        | ₹499   | https... | Class 10   | [0.1, 0.2, ...]      | 2026-05-18...
uuid-2           | MTG NEET Biology Guide         | ₹799   | https... | NEET       | [0.15, 0.25, ...]    | 2026-05-18...
...
```

## Handling Edge Cases

### 1. Missing Product Images

```javascript
// Fallback to placeholder
image_url: $element.find('img').attr('src') || 'https://mtg.in/placeholder.jpg'
```

### 2. Inconsistent Price Formats

```javascript
function extractPrice(text) {
  // Handle: ₹499, Rs. 499, 499, 499.00
  const patterns = [
    /₹\s*([0-9,]+(?:\.[0-9]{2})?)/,  // ₹499
    /Rs\.?\s*([0-9,]+(?:\.[0-9]{2})?)/,  // Rs. 499
    /^([0-9,]+(?:\.[0-9]{2})?)$/,    // 499
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return `₹${match[1]}`;
  }
  
  return null;
}
```

### 3. Relative URLs

```javascript
function extractProductUrl(href, baseUrl) {
  if (!href) return null;
  if (href.startsWith('http')) return href;
  
  // Handle relative paths
  const base = new URL(baseUrl);
  return new URL(href, base).href;
}
```

### 4. Pagination

```javascript
async function scrapeProductPage(url) {
  let allProducts = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const pageUrl = `${url}?page=${page}`;
    console.log(`Scraping page ${page}...`);
    
    const products = await scrapeProductPage(pageUrl);
    allProducts.push(...products);
    
    // Check if next page exists
    const response = await axios.get(pageUrl);
    const $ = cheerio.load(response.data);
    hasMore = !!$('.pagination .next').length;
    page++;
  }
  
  return allProducts;
}
```

## Monitoring Crawler

### Check Progress

```bash
# Monitor Supabase dashboard
SELECT COUNT(*) FROM products;
SELECT category, COUNT(*) FROM products GROUP BY category;
```

### View Logs

```bash
# Check Node.js console output
npm run dev:backend
# Look for [Crawler] messages
```

### Verify Data Quality

```sql
-- Find products without descriptions
SELECT id, title FROM products WHERE description IS NULL;

-- Find broken links
SELECT id, title, url FROM products WHERE url LIKE '%null%';

-- Check price format consistency
SELECT DISTINCT price FROM products LIMIT 20;
```

## Performance Optimization

### 1. Batch Processing

```javascript
// Process products in chunks to avoid memory issues
const BATCH_SIZE = 50;
for (let i = 0; i < allProducts.length; i += BATCH_SIZE) {
  const batch = allProducts.slice(i, i + BATCH_SIZE);
  await storeProducts(supabase, batch);
}
```

### 2. Concurrent Page Fetching

```javascript
// Fetch multiple pages in parallel
const urlsToScrape = [...];
const results = await Promise.all(
  urlsToScrape.map(url => scrapeProductPage(url))
);
const allProducts = results.flat();
```

### 3. Request Rate Limiting

```javascript
// Add delay between requests to respect server
async function fetchWithDelay(url, delay = 1000) {
  await new Promise(resolve => setTimeout(resolve, delay));
  return axios.get(url);
}
```

### 4. Caching

```javascript
// Cache embeddings to avoid regenerating
const embeddingCache = new Map();

async function getOrCreateEmbedding(text) {
  if (embeddingCache.has(text)) {
    return embeddingCache.get(text);
  }
  
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  
  embeddingCache.set(text, embedding);
  return embedding;
}
```

## Troubleshooting

### Issue: Crawler returns 0 products

**Cause:** CSS selectors don't match actual HTML

**Solution:**
1. Open MTG.in in browser
2. Right-click product → Inspect
3. Find actual CSS classes/selectors
4. Update in `crawler.js`

```javascript
// Add debug logging
console.log('[Crawler Debug] Full HTML length:', response.data.length);
console.log('[Crawler Debug] Matched elements:', $('.my-selector').length);
```

### Issue: Timeout errors

**Cause:** Page takes too long to load

**Solution:** Increase timeout in axios config:

```javascript
const response = await axios.get(url, {
  timeout: 30000, // 30 seconds
});
```

### Issue: Memory leak during crawl

**Cause:** Too many products in memory at once

**Solution:** Use streaming or batch processing:

```javascript
// Process one URL at a time
for (const url of urlsToScrape) {
  const products = await scrapeProductPage(url);
  await storeProducts(supabase, products);
  // Garbage collection
  global.gc?.();
}
```

### Issue: "Too many requests" error

**Cause:** MTG.in rate limiting

**Solution:** Add delays between requests:

```javascript
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
for (const url of urlsToScrape) {
  await delay(2000); // 2 seconds between requests
  const products = await scrapeProductPage(url);
  // ...
}
```

## Database Maintenance

### Clean Up Duplicates

```sql
DELETE FROM products a
WHERE a.id < (
  SELECT b.id FROM products b
  WHERE a.url = b.url
  LIMIT 1
);
```

### Update Stale Products

```sql
UPDATE products
SET description = NULL
WHERE crawled_at < NOW() - INTERVAL '30 days';
```

### Rebuild Embeddings

```javascript
// Regenerate all embeddings
const products = await supabase.from('products').select('*');
for (const product of products.data) {
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: product.title + ' ' + product.description,
  });
  
  await supabase
    .from('products')
    .update({ embedding: embedding.data[0].embedding })
    .eq('id', product.id);
}
```

## Testing Crawler

### Unit Test Example

```javascript
// test-crawler.js
import { scrapeProductPage, extractPrice } from './backend/crawler.js';

test('extractPrice handles various formats', () => {
  expect(extractPrice('₹499')).toBe('₹499');
  expect(extractPrice('Rs. 499')).toBe('₹499');
  expect(extractPrice('Price: ₹499.99')).toBe('₹499.99');
});

test('scrapeProductPage returns valid products', async () => {
  const products = await scrapeProductPage('https://www.mtg.in/books');
  expect(products.length).toBeGreaterThan(0);
  expect(products[0].title).toBeDefined();
  expect(products[0].url).toBeDefined();
});
```

Run tests:
```bash
node --test test-crawler.js
```

---

**Version:** 1.0.0  
**Last Updated:** May 2026
