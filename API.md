# MTG.in Chatbot API Reference

## Overview

REST API for the MTG.in AI Chatbot. All endpoints return JSON.

**Base URL:** `http://localhost:3001` (development) or your deployed API URL

## Authentication

Some endpoints require authentication via Bearer token:

```
Authorization: Bearer your_token_here
```

## Endpoints

### 1. Chat Endpoint

**POST** `/api/chat`

Send a message and receive an AI response with relevant products.

**Request Body:**
```json
{
  "message": "What are Class 10 science books?",
  "session_id": "optional_session_id"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| message | string | Yes | User's question or message |
| session_id | string | No | Session ID for conversation history |

**Response (200 OK):**
```json
{
  "answer": "MTG offers comprehensive Class 10 science books...",
  "products": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "MTG Class 10 Science (PCB)",
      "price": "₹499",
      "url": "https://www.mtg.in/products/class-10-science",
      "image": "https://cdn.mtg.in/images/class-10-science.jpg",
      "description": "Comprehensive science guide for Class 10...",
      "category": "Class 10"
    }
  ],
  "session_id": "session_abc123xyz",
  "source": "website_content",
  "timestamp": "2026-05-18T12:30:00.000Z"
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Message is required"
}
```

**Response (500 Server Error):**
```json
{
  "error": "Failed to process chat request",
  "message": "OpenAI API error details"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show me NEET preparation books",
    "session_id": "user_session_123"
  }'
```

---

### 2. Product Search

**GET** `/api/products/search?q=query`

Search for products by keyword.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| q | string | Yes | Search query (e.g., "Class 10") |

**Response (200 OK):**
```json
{
  "query": "Class 10",
  "results": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "MTG Class 10 Science",
      "price": "₹499",
      "url": "https://www.mtg.in/products/class-10-science",
      "description": "Complete science syllabus coverage...",
      "category": "Class 10"
    }
  ],
  "count": 5
}
```

**Example Request:**
```bash
curl "http://localhost:3001/api/products/search?q=Class%2010%20Science"
```

---

### 3. Website Crawler

**POST** `/api/crawler/sync`

Trigger a crawl of the MTG.in website to index products.

**Headers:**
```
Authorization: Bearer your_crawler_token
Content-Type: application/json
```

**Request Body:**
```json
{}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Crawl completed",
  "products_indexed": 245,
  "timestamp": "2026-05-18T12:30:00.000Z"
}
```

**Response (401 Unauthorized):**
```json
{
  "error": "Unauthorized"
}
```

**Response (500 Server Error):**
```json
{
  "error": "Failed to run crawler",
  "message": "Connection timeout"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:3001/api/crawler/sync \
  -H "Authorization: Bearer your_crawler_token" \
  -H "Content-Type: application/json"
```

---

### 4. Health Check

**GET** `/api/health`

Check if the API is running and responsive.

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2026-05-18T12:30:00.000Z"
}
```

**Example Request:**
```bash
curl http://localhost:3001/api/health
```

---

### 5. Knowledge Base Stats

**GET** `/api/stats`

Get statistics about the indexed products.

**Response (200 OK):**
```json
{
  "total_products": 245,
  "status": "ready"
}
```

**Example Request:**
```bash
curl http://localhost:3001/api/stats
```

---

## Error Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Request processed successfully |
| 400 | Bad Request | Missing required parameters |
| 401 | Unauthorized | Invalid or missing API token |
| 404 | Not Found | Endpoint doesn't exist |
| 500 | Server Error | Internal processing error |

## Rate Limiting

Currently not enforced, but planned for production:
- 100 requests per minute per IP for public endpoints
- 10 requests per minute for crawler endpoint

## Response Format

All responses follow this structure:

**Success:**
```json
{
  "answer": "...",
  "products": [...],
  "timestamp": "2026-05-18T12:30:00.000Z"
}
```

**Error:**
```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

## Session Management

Sessions are automatically created if not provided. Use the returned `session_id` for follow-up messages to maintain conversation context.

```bash
# First message
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Class 10 books"}'
# Returns: session_id: "session_xyz123"

# Follow-up message with same session
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show me science books specifically",
    "session_id": "session_xyz123"
  }'
```

## Webhooks (Future)

Planned for Phase 6:

```
POST /api/webhooks/product-updated
POST /api/webhooks/inventory-changed
```

## JavaScript SDK (Client-side)

Simple example for embedding in your website:

```javascript
// Load the chatbot
<script src="https://your-domain.com/chatbot.js"></script>

// Initialize
const chatbot = new MTGChatbot({
  apiUrl: 'https://your-api.com',
  appName: 'MTG.in Assistant',
  brand: {
    color: '#1f2937',
    logo: 'https://mtg.in/logo.png'
  }
});

// Send message
chatbot.sendMessage('Class 10 books', (response) => {
  console.log(response.answer);
  console.log(response.products);
});
```

## Common Issues & Solutions

### Issue: "401 Unauthorized" on crawler

**Solution:** Ensure `CRAWLER_TOKEN` environment variable matches the token in request header.

```bash
export CRAWLER_TOKEN=secret123
# Then use in curl
curl -X POST ... -H "Authorization: Bearer secret123"
```

### Issue: "No products found"

**Solution:** Run the crawler first, then verify products in Supabase:

```sql
SELECT COUNT(*) FROM products;
```

### Issue: OpenAI rate limit exceeded

**Solution:** Implement request queuing or upgrade OpenAI plan. Current limits:
- Standard: 3 requests/min
- Plus: 90 requests/min

### Issue: CORS error in browser

**Solution:** CORS is enabled by default. If still getting errors:
1. Check backend is running on correct port
2. Verify `NEXT_PUBLIC_API_URL` in `.env.local`
3. Clear browser cache

---

## Testing with cURL

Complete example workflow:

```bash
#!/bin/bash

API_URL="http://localhost:3001"

# 1. Check health
curl $API_URL/api/health

# 2. Get stats
curl $API_URL/api/stats

# 3. Search products
curl "$API_URL/api/products/search?q=Class%2010"

# 4. Send chat message
curl -X POST $API_URL/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are your best selling books?",
    "session_id": "test_session_001"
  }'

# 5. Run crawler (requires token)
curl -X POST $API_URL/api/crawler/sync \
  -H "Authorization: Bearer your_crawler_token"
```

## Postman Collection

Import this JSON into Postman:

```json
{
  "info": {
    "name": "MTG Chatbot API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0"
  },
  "item": [
    {
      "name": "Chat",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"message\": \"Class 10 books\", \"session_id\": \"test\"}"
        },
        "url": {
          "raw": "{{API_URL}}/api/chat",
          "host": ["{{API_URL}}"],
          "path": ["api", "chat"]
        }
      }
    }
  ]
}
```

---

**Last Updated:** May 2026  
**API Version:** 1.0.0
