# MTG.in Chatbot - Implementation Checklist

Complete all items to have a fully functional chatbot in production.

## Pre-Implementation

### Setup & Access
- [ ] Get Supabase account (free tier)
- [ ] Get OpenAI API account with $5+ credits
- [ ] Get Vercel account (for deployment)
- [ ] Git access to repository
- [ ] Node.js 18+ installed locally

### Team Knowledge
- [ ] Read README.md
- [ ] Read QUICK_START.md
- [ ] Read CHATBOT_SETUP.md
- [ ] Watch/understand how vector search works
- [ ] Understand OpenAI API pricing

---

## Phase 1: Local Setup (1-2 days)

### Environment Setup
- [ ] Copy `.env.example` to `.env.local`
- [ ] Fill in SUPABASE_URL
- [ ] Fill in SUPABASE_KEY
- [ ] Fill in OPENAI_API_KEY
- [ ] Set PORT=3001
- [ ] Set NEXT_PUBLIC_API_URL=http://localhost:3001

### Dependencies
- [ ] Run `pnpm install` successfully
- [ ] Verify all dependencies installed (`pnpm list`)
- [ ] No security vulnerabilities (`pnpm audit`)

### Database Setup
- [ ] Create Supabase project
- [ ] Copy SQL from `backend/migrations/001_create_products_table.sql`
- [ ] Paste into Supabase SQL Editor
- [ ] Execute successfully (green checkmark)
- [ ] Verify tables created:
  - [ ] `products` table exists
  - [ ] `chat_sessions` table exists
  - [ ] Indexes created
  - [ ] Function `search_products` exists

### Local Testing
- [ ] Run `npm run dev:backend` - starts without errors
- [ ] Run `npm run dev` - Next.js starts
- [ ] Frontend loads at `http://localhost:3000`
- [ ] Demo page displays correctly
- [ ] Chat bubble visible in bottom-right
- [ ] `curl http://localhost:3001/api/health` returns 200

---

## Phase 2: API Integration & Testing (2-3 days)

### Backend Testing
- [ ] Chat endpoint `/api/chat` responds
- [ ] Search endpoint `/api/products/search` works
- [ ] Crawler endpoint `/api/crawler/sync` accessible
- [ ] Stats endpoint `/api/stats` returns data
- [ ] Health endpoint `/api/health` is responsive

### Frontend Testing
- [ ] Click chat bubble opens chat window
- [ ] Input field accepts text
- [ ] Send button works
- [ ] Messages display correctly
- [ ] Loading state shows while fetching
- [ ] Error messages display on failure
- [ ] Responsive on mobile devices

### API Testing (Use curl or Postman)
```bash
# Health check
[ ] GET /api/health returns 200

# Chat without products
[ ] POST /api/chat with "test message"
  Returns: answer + empty products list

# Search (no products yet)
[ ] GET /api/products/search?q=test
  Returns: query + empty results

# Stats
[ ] GET /api/stats
  Returns: total_products: 0
```

### Session Management
- [ ] First chat generates session_id
- [ ] Session_id returned in response
- [ ] Can use same session_id for follow-ups
- [ ] Session history stored (if enabled)

---

## Phase 3: Crawler Configuration (2-3 days)

### Analyze MTG.in Structure
- [ ] Open https://www.mtg.in in browser
- [ ] Inspect product page HTML
- [ ] Note CSS classes for:
  - [ ] Product container
  - [ ] Product title
  - [ ] Product price
  - [ ] Product image
  - [ ] Product link
  - [ ] Category

### Update Crawler Code
- [ ] Add actual MTG.in URLs to `urlsToScrape`
- [ ] Update CSS selectors in `scrapeProductPage()`
- [ ] Update price extraction regex if needed
- [ ] Update URL handling for MTG.in domain
- [ ] Add category extraction logic
- [ ] Test selectors with sample page

### Test Crawler
- [ ] Run crawler manually: `POST /api/crawler/sync`
- [ ] Check logs for errors
- [ ] Verify products added to database
- [ ] Check data quality:
  - [ ] Prices are formatted correctly
  - [ ] URLs are valid
  - [ ] Product titles are complete
  - [ ] Images load correctly
  - [ ] Categories are assigned

### Index Products
- [ ] Crawl successfully returns products_indexed > 0
- [ ] Query database: `SELECT COUNT(*) FROM products;`
- [ ] Verify at least 50 products indexed
- [ ] Check embeddings generated:
  - [ ] `SELECT COUNT(*) FROM products WHERE embedding IS NOT NULL;`
  - [ ] Should equal or nearly equal product count

### Test Search
- [ ] Search for product name works
- [ ] Search for category works
- [ ] Search returns relevant results
- [ ] Semantic search finds similar products

---

## Phase 4: Chat Integration Testing (2-3 days)

### AI Response Quality
- [ ] Chat returns relevant answers
- [ ] Products included in response
- [ ] Prices shown correctly
- [ ] Product links work
- [ ] Images display properly

### Prompt Engineering
- [ ] Test various question types:
  - [ ] Product searches ("Class 10 books")
  - [ ] Price questions ("How much is...")
  - [ ] Category questions ("Show me JEE books")
  - [ ] Vague questions ("Best books?")
  - [ ] Out of scope ("What time is it?")

### Answer Quality
- [ ] Answers are helpful
- [ ] Fallback message for no products
- [ ] No hallucinated information
- [ ] Website-only constraint enforced
- [ ] Proper Hindi/English mixing if needed

### Multi-turn Conversations
- [ ] Follow-up questions work
- [ ] Context maintained across turns
- [ ] Session_id working properly
- [ ] Can refine previous questions

### Error Handling
- [ ] Invalid input handled gracefully
- [ ] API errors show user-friendly message
- [ ] No console errors in frontend
- [ ] Backend logs errors properly

---

## Phase 5: UI/UX Polish (1-2 days)

### Chat Widget
- [ ] Mobile layout looks good
- [ ] Desktop layout looks good
- [ ] Chat bubble position correct
- [ ] Chat window resizable (if needed)
- [ ] Colors match brand guidelines
- [ ] Logo displays correctly

### Messages
- [ ] Timestamps display correctly
- [ ] User/assistant messages differentiated
- [ ] Text wrapping works on narrow screens
- [ ] Emoji support if needed
- [ ] Links clickable in messages

### Product Cards
- [ ] Product images visible
- [ ] Product title clear
- [ ] Price prominent
- [ ] Category visible
- [ ] "View Product" button clickable
- [ ] Links open in new tab

### Interactions
- [ ] Loading spinner shows
- [ ] Message input disabled while loading
- [ ] Auto-scroll to newest message
- [ ] Can scroll up to view history
- [ ] Keyboard shortcuts work (Enter to send)

### Accessibility
- [ ] ARIA labels present
- [ ] Keyboard navigation works
- [ ] Screen reader friendly
- [ ] High contrast for text
- [ ] Focus indicators visible

---

## Phase 6: Performance & Optimization (1-2 days)

### Backend Performance
- [ ] Chat response time < 2 seconds
- [ ] Search response time < 500ms
- [ ] API handles multiple concurrent requests
- [ ] No memory leaks (monitor long-running)
- [ ] Database queries optimized

### Frontend Performance
- [ ] Page loads in < 3 seconds
- [ ] Chat widget loads < 1 second
- [ ] No console errors
- [ ] No warning messages
- [ ] Mobile performance good

### Optimization Tasks
- [ ] Cache embeddings if repeated searches
- [ ] Compress product images
- [ ] Minimize JavaScript bundle
- [ ] Lazy load chat widget
- [ ] Consider CDN for images

### Load Testing
- [ ] Test with 10 concurrent users
- [ ] Test with 100 concurrent users
- [ ] Monitor CPU/memory usage
- [ ] Check database connection pooling
- [ ] Verify graceful degradation

---

## Phase 7: Security (1 day)

### API Security
- [ ] Crawler endpoint has token auth
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] No sensitive data in logs
- [ ] API errors don't leak info

### Database Security
- [ ] RLS policies enabled
- [ ] Only public data readable
- [ ] No admin access needed
- [ ] API key not exposed
- [ ] Database backups working

### Input Validation
- [ ] Message input sanitized
- [ ] Query parameters validated
- [ ] No SQL injection possible
- [ ] XSS prevention in place
- [ ] CSRF protection if needed

### Deployment Security
- [ ] `.env` files not in Git
- [ ] `.gitignore` configured
- [ ] Secrets in environment variables
- [ ] HTTPS enforced in production
- [ ] Security headers added

---

## Phase 8: Deployment (1-2 days)

### Vercel Deployment - Frontend
- [ ] Create Vercel account
- [ ] Connect GitHub repository
- [ ] Configure environment variables:
  - [ ] NEXT_PUBLIC_API_URL
- [ ] Deploy to staging first
- [ ] Test on staging URL
- [ ] Deploy to production
- [ ] Verify live URL works

### Backend Deployment
Choose one:
- [ ] **Option A: Vercel Serverless**
  - [ ] Restructure for serverless functions
  - [ ] Deploy to Vercel
  - [ ] Test endpoints

- [ ] **Option B: Railway/Render**
  - [ ] Connect Git repository
  - [ ] Configure environment variables
  - [ ] Deploy backend
  - [ ] Get backend URL
  - [ ] Update NEXT_PUBLIC_API_URL in frontend
  - [ ] Redeploy frontend

### Post-Deployment
- [ ] Frontend loads in production
- [ ] Chat widget works
- [ ] API calls succeed
- [ ] Errors properly logged
- [ ] Monitor performance metrics

---

## Phase 9: Monitoring & Maintenance (Ongoing)

### Daily Checks
- [ ] Frontend responding
- [ ] Backend responding
- [ ] Chat working end-to-end
- [ ] No error spikes in logs
- [ ] Database size reasonable

### Weekly Tasks
- [ ] Review API usage
- [ ] Check error logs
- [ ] Monitor costs
- [ ] Update products (re-crawl)
- [ ] Review user feedback

### Monthly Tasks
- [ ] Review and optimize slow queries
- [ ] Update dependencies
- [ ] Security audit
- [ ] Cost analysis
- [ ] Feature planning

### Logging & Monitoring
- [ ] Error logging set up
- [ ] API metrics tracked
- [ ] Database performance monitored
- [ ] Cost tracking enabled
- [ ] Alerts configured for failures

---

## Phase 10: Documentation & Handover (1 day)

### Code Documentation
- [ ] Code comments updated
- [ ] README.md current
- [ ] API.md complete
- [ ] CRAWLER_GUIDE.md updated for MTG.in
- [ ] Inline code comments clear

### Operations Documentation
- [ ] Deployment guide written
- [ ] Troubleshooting guide created
- [ ] Monitoring setup documented
- [ ] Runbook for common tasks
- [ ] Escalation procedures

### Team Knowledge Transfer
- [ ] Demo to stakeholders
- [ ] Code walkthrough with team
- [ ] Operations training
- [ ] Support contacts listed
- [ ] Knowledge base created

### Knowledge Base Articles
- [ ] How to add products
- [ ] How to customize bot
- [ ] How to monitor performance
- [ ] How to handle issues
- [ ] FAQ for users

---

## Optional Phase 11: Advanced Features (After MVP)

### Analytics
- [ ] Track user queries
- [ ] Monitor response satisfaction
- [ ] Identify popular products
- [ ] Track conversation drop-off
- [ ] User behavior analytics

### Improvements
- [ ] Product recommendations engine
- [ ] Multi-language support
- [ ] Voice search
- [ ] Admin dashboard
- [ ] User feedback collection

### Integrations
- [ ] WhatsApp Bot
- [ ] Slack integration
- [ ] Email notifications
- [ ] CRM integration
- [ ] WooCommerce API sync

### Scale Features
- [ ] Real-time product updates
- [ ] Inventory sync
- [ ] Order tracking
- [ ] Customer accounts
- [ ] Chat history storage

---

## Sign-Off Checklist

### Development Team
- [ ] Code complete and tested
- [ ] All endpoints working
- [ ] No critical bugs
- [ ] Documentation complete
- [ ] Ready for QA

### QA Team
- [ ] All features tested
- [ ] Edge cases covered
- [ ] Performance verified
- [ ] Security reviewed
- [ ] Ready for production

### Product Team
- [ ] Requirements met
- [ ] User experience approved
- [ ] Brand alignment verified
- [ ] Performance acceptable
- [ ] Ready for launch

### Operations Team
- [ ] Deployment verified
- [ ] Monitoring configured
- [ ] Runbooks prepared
- [ ] Team trained
- [ ] Ready for support

---

## Final Checklist Before Launch

- [ ] All phases completed
- [ ] All tests passing
- [ ] No known critical bugs
- [ ] Documentation complete
- [ ] Team trained and ready
- [ ] Monitoring in place
- [ ] Backups configured
- [ ] Runbooks prepared
- [ ] Support process ready
- [ ] Launch date confirmed

---

## Notes Section

```
Date Started: _______________
Date Completed: _______________
Team Members: _______________
Issues Encountered: _______________
Lessons Learned: _______________
Future Improvements: _______________
```

---

**Version:** 1.0.0
**Last Updated:** May 2026
**Status:** Ready for implementation
