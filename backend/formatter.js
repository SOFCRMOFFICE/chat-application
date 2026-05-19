/**
 * Format product data for frontend display
 */
export function formatProductResponse(product) {
  return {
    id: product.id,
    title: product.title || 'Untitled Product',
    price: product.price || 'Contact for price',
    url: product.url,
    image: product.image_url,
    description: product.description ? product.description.substring(0, 200) + '...' : '',
    category: product.category || 'General',
  };
}

/**
 * Format multiple products
 */
export function formatProductList(products) {
  return products.map(formatProductResponse);
}

/**
 * Format chat response with products
 */
export function formatChatResponse(answer, products) {
  return {
    answer,
    products: formatProductList(products),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Clean and normalize price strings
 */
export function normalizePrice(priceStr) {
  if (!priceStr) return null;
  const match = priceStr.match(/₹\s*([0-9,]+)/);
  return match ? match[0] : null;
}

/**
 * Format product card HTML
 */
export function generateProductCardHTML(product) {
  return `
    <div class="product-card" data-product-id="${product.id}">
      <div class="product-image">
        ${product.image ? `<img src="${product.image}" alt="${product.title}" />` : '<div class="no-image">No Image</div>'}
      </div>
      <div class="product-info">
        <h3 class="product-title">${escapeHTML(product.title)}</h3>
        <p class="product-price">${product.price}</p>
        <p class="product-desc">${escapeHTML(product.description)}</p>
        <div class="product-actions">
          <a href="${product.url}" target="_blank" class="btn-view">View Product</a>
          <a href="${product.url}" target="_blank" class="btn-buy">Buy Now</a>
        </div>
      </div>
    </div>
  `;
}

/**
 * Escape HTML special characters
 */
function escapeHTML(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Format timestamp
 */
export function formatTimestamp(date) {
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Generate markdown for products
 */
export function generateProductMarkdown(products) {
  return products
    .map(
      (p) =>
        `### ${p.title}\n\n**Price:** ${p.price}\n\n${p.description}\n\n[View Product](${p.url})`
    )
    .join('\n\n---\n\n');
}
