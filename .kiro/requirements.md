# Decoqo Frontend — Phase 1 Requirements
## Next.js 14 + TypeScript — FAANG-Level Implementation

Version: 1.0 | Date: April 2026 | Backend: NestJS API at `http://localhost:3001/api/v1`

---

## 1. Overview

Build the complete frontend for Decoqo — India's most trusted interior execution marketplace. Three portals in one Next.js 14 App Router monorepo:

1. **Customer Portal** — project creation, bidding room, milestone approval, payments
2. **Vendor Portal** — bid submission, BOQ editor, milestone execution
3. **Admin Panel** — escrow monitor, dispute console, KYC management

---

## 2. Functional Requirements

### 2.1 Authentication (All Portals)

| ID | Requirement |
|----|-------------|
| AUTH-01 | Customer registration with email/phone + password + OTP verification |
| AUTH-02 | Vendor registration with business details + OTP verification |
| AUTH-03 | Login with email or phone + password |
| AUTH-04 | OTP verification screen (6-digit, 5-minute expiry, resend option) |
| AUTH-05 | JWT access token stored in memory (never localStorage) |
| AUTH-06 | Refresh token in httpOnly cookie — auto-refresh on 401 |
| AUTH-07 | Role-based route protection (CUSTOMER/VENDOR/ADMIN/SUPER_ADMIN) |
| AUTH-08 | Logout clears token and cookie |
| AUTH-09 | Admin login requires TOTP (MFA) |
| AUTH-10 | Policy acceptance on registration (Terms + Privacy Policy) |

---

### 2.2 Customer Portal

#### 2.2.1 Dashboard
| ID | Requirement |
|----|-------------|
| CUST-01 | Dashboard shows active projects with status badges |
| CUST-02 | Quick stats: total projects, active bids, pending approvals, total spent |
| CUST-03 | Recent activity feed from trust timeline |
| CUST-04 | CTA to create new project |

#### 2.2.2 Project Creation Wizard (Dual-Path)
| ID | Requirement |
|----|-------------|
| CUST-10 | Step 1: Space type selection (Residential/Commercial/Office/Factory/Other) |
| CUST-11 | Step 2: Project title + city + pincode |
| CUST-12 | Step 3: Room dimensions (L×W×H per room, add multiple rooms) |
| CUST-13 | Step 4: Floor plan upload (JPG/PNG/PDF, max 20MB, S3 pre-signed URL) |
| CUST-14 | Step 5: Path choice — "Generate AI Designs" OR "Skip to Bidding" |
| CUST-15 | Path A: Theme text input + style/color/material/lighting filters |
| CUST-16 | Path A: AI generation progress (WebSocket real-time, animated progress bar) |
| CUST-17 | Path A: Design gallery (2-3 options, select and lock — irreversible) |
| CUST-18 | Path B: Skip AI, go directly to budget/timeline step |
| CUST-19 | Step 6: Budget range (min/max INR), flexibility mode, timeline, priority mode |
| CUST-20 | Step 7: Review + Publish — validates all minimum fields before enabling |
| CUST-21 | Description field (min 50 chars) required for Path B |
| CUST-22 | Progress indicator showing current step (1-7) |
| CUST-23 | Save draft at any step |

#### 2.2.3 Bidding Room
| ID | Requirement |
|----|-------------|
| CUST-30 | Bidding Room dashboard shows all bids in a clean table |
| CUST-31 | Bids shown with anonymous labels (Vendor A, B, C...) — NO vendor identity |
| CUST-32 | Table columns: Anonymous Label, Quote (INR), Timeline, Material Level, Status |
| CUST-33 | Sort bids by quote, timeline, or material level |
| CUST-34 | Click any bid row → opens Vendor Profile Card modal |
| CUST-35 | Vendor Profile Card shows: city, categories, portfolio gallery, rating, bio, trust signals |
| CUST-36 | Vendor Profile Card NEVER shows: phone, email, website, full address |
| CUST-37 | Trust signals section always visible on profile card |
| CUST-38 | Shortlist button on each bid row |
| CUST-39 | "Select This Vendor" button on profile card → confirms selection |
| CUST-40 | Bidding room expiry countdown (30 days from publish) |
| CUST-41 | Total bid count displayed prominently |

#### 2.2.4 Post-Selection Negotiation
| ID | Requirement |
|----|-------------|
| CUST-50 | After vendor selection, vendor identity revealed (name, business) |
| CUST-51 | Negotiation chat thread opens automatically |
| CUST-52 | Messages with contact info show [PHONE REMOVED] / [EMAIL REMOVED] with warning badge |
| CUST-53 | Vendor can submit revised proposals (quote, timeline, material level) |
| CUST-54 | Customer can Accept / Counter / Decline proposals |
| CUST-55 | "Confirm & Proceed to Milestones" button — both parties must confirm |

#### 2.2.5 Milestones
| ID | Requirement |
|----|-------------|
| CUST-60 | Milestone list with percentage, amount, status badges |
| CUST-61 | Escrow status badge always visible on each milestone card |
| CUST-62 | Fund Escrow button → Razorpay checkout integration |
| CUST-63 | Milestone detail: evidence gallery, completion notes |
| CUST-64 | Approve milestone → triggers escrow release (confirmation dialog) |
| CUST-65 | Request Changes button |
| CUST-66 | Raise Dispute button → dispute form with reason + description |
| CUST-67 | Milestone percentage total must equal 100% (real-time validation) |

#### 2.2.6 BOQ Review (Customer — Read Only)
| ID | Requirement |
|----|-------------|
| CUST-70 | BOQ grouped by room with category subtotals |
| CUST-71 | Grand total prominently displayed |
| CUST-72 | Approve BOQ button |
| CUST-73 | Request Changes button |
| CUST-74 | Variation comparison: old vs new side-by-side diff |
| CUST-75 | Approve / Reject variation with reason |

#### 2.2.7 Trust Timeline
| ID | Requirement |
|----|-------------|
| CUST-80 | Chronological timeline of all project events |
| CUST-81 | Each event shows: type, actor role, timestamp, metadata |
| CUST-82 | Color-coded event types (payment=green, dispute=red, etc.) |

---

### 2.3 Vendor Portal

#### 2.3.1 KYC Onboarding
| ID | Requirement |
|----|-------------|
| VEND-01 | KYC form: PAN number, bank account, IFSC, business proof upload |
| VEND-02 | KYC status indicator (Not Started / Pending / Approved / Rejected) |
| VEND-03 | Portfolio upload (images, max 5MB each) |
| VEND-04 | Service areas and categories selection |
| VEND-05 | KYC rejection reason displayed with resubmit option |

#### 2.3.2 Browse Projects
| ID | Requirement |
|----|-------------|
| VEND-10 | Project cards with: title, city, space type, budget range, timeline, bid count |
| VEND-11 | Filter by city, budget range, category, space type |
| VEND-12 | AI design thumbnail OR floor plan thumbnail on card |
| VEND-13 | Project detail page (read-only: description, rooms, design, budget) |
| VEND-14 | Vendor CANNOT see other vendors' bids |
| VEND-15 | Vendor CANNOT see customer identity |

#### 2.3.3 Bid Submission
| ID | Requirement |
|----|-------------|
| VEND-20 | Bid form: total quote (INR), timeline (weeks), material level, scope assumptions, notes |
| VEND-21 | One bid per project (duplicate prevented) |
| VEND-22 | Edit bid before customer selects anyone |
| VEND-23 | Withdraw bid before selection |
| VEND-24 | My Bids list with project title, status, submitted date |

#### 2.3.4 BOQ Editor
| ID | Requirement |
|----|-------------|
| VEND-30 | Create BOQ for selected project |
| VEND-31 | Add line items: room, category, description, material, brand, quantity, unit, rate |
| VEND-32 | Amount auto-calculated (quantity × rate) — no manual entry |
| VEND-33 | Grand total auto-calculated from all items |
| VEND-34 | Group items by room with room subtotals |
| VEND-35 | Drag-to-reorder items within room |
| VEND-36 | Optimistic updates — changes feel instant |
| VEND-37 | Submit BOQ for customer review |
| VEND-38 | Lock BOQ after customer approval |
| VEND-39 | Raise variation on locked BOQ (type, reason, affected items, delta) |
| VEND-40 | BOQ version history viewer |

#### 2.3.5 Milestone Execution
| ID | Requirement |
|----|-------------|
| VEND-50 | Start milestone (only after escrow funded — enforced) |
| VEND-51 | Upload evidence files (photos/documents, drag-drop, multi-file) |
| VEND-52 | Completion notes text field |
| VEND-53 | Submit milestone for approval |
| VEND-54 | Escrow status always visible (PENDING/FUNDED/HELD/RELEASED) |

---

### 2.4 Admin Panel

| ID | Requirement |
|----|-------------|
| ADMIN-01 | Dashboard: total escrow value, open disputes, pending KYC, flagged messages |
| ADMIN-02 | Escrow monitor: list all escrow accounts with status, amount, project |
| ADMIN-03 | Freeze / Unfreeze escrow with reason |
| ADMIN-04 | Dispute queue: list open disputes with SLA indicator |
| ADMIN-05 | Dispute detail: locked design, locked BOQ, chat history, evidence bundle |
| ADMIN-06 | Issue decision: Full Release / Partial Release / Full Refund + reason |
| ADMIN-07 | Vendor KYC queue: approve / reject with reason |
| ADMIN-08 | User management: ban / suspend / reinstate |
| ADMIN-09 | Audit log viewer with search and filter |
| ADMIN-10 | Full project timeline view |

---

### 2.5 Shared Requirements

| ID | Requirement |
|----|-------------|
| SHARED-01 | Ivory & Gold light theme (default) with dark mode toggle |
| SHARED-02 | Theme preference persisted in localStorage |
| SHARED-03 | Skeleton loaders on all data-fetching screens |
| SHARED-04 | Error boundaries on all major sections |
| SHARED-05 | Toast notifications for all actions (success/error) |
| SHARED-06 | All money displayed in INR format (₹12,00,000) |
| SHARED-07 | WebSocket real-time updates (milestone status, chat, escrow) |
| SHARED-08 | Responsive design (mobile-first, works on 375px+) |
| SHARED-09 | WCAG 2.1 AA accessibility baseline |
| SHARED-10 | p95 page load < 2.5s |

---

## 3. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| Performance | LCP < 2.5s, FID < 100ms, CLS < 0.1 |
| Bundle | Initial JS < 200KB (code splitting + lazy loading) |
| SEO | Landing page server-side rendered |
| Security | No tokens in localStorage, CSRF protection, input sanitization |
| Accessibility | Keyboard navigable, screen reader compatible, color contrast AA |
| Testing | 80%+ component coverage, E2E for critical flows |

---

## 6. Public / Guest Experience (Amazon/Flipkart Style)

### 6.1 Public Landing Page — Big Brand Design

The landing page is the most important page. It must work like Amazon/Houzz — fully browsable without login, builds trust, drives conversion.

| ID | Requirement |
|----|-------------|
| PUBLIC-01 | Hero section: full-width, animated headline, CTA buttons ("Start Your Project" + "I'm a Vendor") |
| PUBLIC-02 | Hero shows real AI-generated interior design images in a rotating carousel |
| PUBLIC-03 | "How It Works" section — 4-step visual flow (Define → AI Design → Bid → Execute) |
| PUBLIC-04 | Live stats bar: "2,400+ projects completed · ₹180Cr+ in escrow · 98% dispute-free" |
| PUBLIC-05 | Featured project showcase — anonymized real projects with before/after |
| PUBLIC-06 | Vendor showcase — portfolio gallery grid (no contact info, just work samples) |
| PUBLIC-07 | Trust signals section — escrow, BOQ lock, dispute resolution, timeline |
| PUBLIC-08 | City-wise project activity map (Bengaluru, Mumbai, Delhi, Hyderabad, Pune) |
| PUBLIC-09 | Testimonials carousel — customer + vendor quotes |
| PUBLIC-10 | FAQ accordion — common questions about the platform |
| PUBLIC-11 | Footer with links, social, legal docs |
| PUBLIC-12 | Sticky header with logo, nav links, "Get Started" CTA |
| PUBLIC-13 | Scroll-triggered animations (Framer Motion) |
| PUBLIC-14 | Mobile-first, pixel-perfect on 375px+ |

### 6.2 Guest Browsing (No Login Required)

Like Amazon — browse before you buy.

| ID | Requirement |
|----|-------------|
| GUEST-01 | Public project explorer — browse published projects (anonymized, no customer identity) |
| GUEST-02 | Filter projects by city, space type, budget range |
| GUEST-03 | Project preview card: space type, city, budget range, AI design thumbnail |
| GUEST-04 | Click project → opens project detail preview (read-only, no bids visible) |
| GUEST-05 | "See how bidding works" interactive demo (animated walkthrough, no real data) |
| GUEST-06 | Vendor portfolio gallery — browse vendor work samples publicly |
| GUEST-07 | "Calculate your project cost" estimator tool (space type + city + sqft → budget range) |
| GUEST-08 | Guest can start project creation wizard — prompted to register at Step 5 (publish) |
| GUEST-09 | Guest can start bid form — prompted to register before submitting |
| GUEST-10 | "Save for later" — guest actions saved to localStorage, restored after login |
| GUEST-11 | Smart CTAs: after 30s on page → "Start your free project" slide-up banner |
| GUEST-12 | Exit intent popup: "Get 3 free AI designs for your space" |

### 6.3 Public Pages (No Auth Required)

| Route | Content |
|-------|---------|
| `/` | Landing page (hero, how it works, stats, showcase) |
| `/explore` | Public project explorer |
| `/vendors` | Vendor portfolio gallery |
| `/how-it-works` | Detailed platform walkthrough |
| `/pricing` | Platform fee structure |
| `/cities/[city]` | City-specific landing (Bengaluru, Mumbai, etc.) |
| `/spaces/[type]` | Space-type landing (modular-kitchen, living-room, etc.) |
| `/blog` | Interior design tips + platform updates |
| `/about` | Company story, mission, team |
| `/contact` | Contact form |
| `/legal/terms` | Customer terms |
| `/legal/vendor-agreement` | Vendor agreement |
| `/legal/privacy` | Privacy policy |

---

## 7. Analytics & Tracking

### 7.1 Product Analytics (Mixpanel / PostHog)

Track every meaningful user interaction to understand what's working.

| ID | Requirement |
|----|-------------|
| ANALYTICS-01 | Integrate PostHog (self-hosted) OR Mixpanel for event tracking |
| ANALYTICS-02 | Track all page views with session ID, user role, device type |
| ANALYTICS-03 | Track funnel: Landing → Explore → Register → Create Project → Publish → Bid Received |
| ANALYTICS-04 | Track funnel: Vendor Register → KYC → Browse → Bid Submit → Selected |
| ANALYTICS-05 | Track feature engagement: AI design used vs skipped (Path A vs Path B ratio) |
| ANALYTICS-06 | Track bidding room: time spent, bids viewed, vendor profiles opened |
| ANALYTICS-07 | Track BOQ editor: items added, time to complete, variations raised |
| ANALYTICS-08 | Track payment funnel: escrow initiated → completed → abandoned |
| ANALYTICS-09 | Track dispute rate per project type and city |
| ANALYTICS-10 | Track contact masking triggers (how often vendors try to share contact) |

### 7.2 Heatmaps & Session Recording (Hotjar / Microsoft Clarity)

| ID | Requirement |
|----|-------------|
| HEATMAP-01 | Integrate Microsoft Clarity (free) for heatmaps and session recordings |
| HEATMAP-02 | Heatmap on landing page — identify which sections get most attention |
| HEATMAP-03 | Heatmap on bidding room — which bid rows get clicked most |
| HEATMAP-04 | Session recording on project creation wizard — identify drop-off steps |
| HEATMAP-05 | Scroll depth tracking on landing page |
| HEATMAP-06 | Click tracking on all CTAs |

### 7.3 Performance Monitoring (Web Vitals)

| ID | Requirement |
|----|-------------|
| PERF-01 | Track Core Web Vitals (LCP, FID, CLS) via `next/vitals` |
| PERF-02 | Send vitals to analytics dashboard |
| PERF-03 | Alert when LCP > 2.5s on any page |
| PERF-04 | Track API response times per endpoint |
| PERF-05 | Track WebSocket connection success/failure rate |

### 7.4 Business Intelligence Dashboard (Admin)

| ID | Requirement |
|----|-------------|
| BI-01 | Admin analytics page: daily/weekly/monthly project creation trend |
| BI-02 | Funnel visualization: projects published → bids received → vendor selected |
| BI-03 | City-wise activity heatmap |
| BI-04 | Feature adoption: % projects using AI design vs bidding-only |
| BI-05 | Average bids per project by city and space type |
| BI-06 | Escrow velocity: average time from publish to first escrow funded |
| BI-07 | Dispute rate trend (target: < 10 per 100 projects) |
| BI-08 | Vendor KYC approval rate and time |
| BI-09 | Contact masking trigger rate (platform safety metric) |
| BI-10 | Revenue metrics: total escrow value, platform fee collected |

### 7.5 Analytics Events Reference

```typescript
// Key events to track
analytics.track('page_viewed', { page, role, sessionId });
analytics.track('project_created', { spaceType, city, path: 'AI_FIRST' | 'BIDDING_ONLY' });
analytics.track('ai_design_generated', { projectId, promptLength });
analytics.track('ai_design_skipped', { projectId });
analytics.track('project_published', { projectId, city, budgetRange });
analytics.track('bid_submitted', { projectId, materialLevel });
analytics.track('vendor_profile_viewed', { bidId, timeSpentMs });
analytics.track('vendor_selected', { projectId, bidsReceivedCount });
analytics.track('boq_item_added', { boqId, category });
analytics.track('escrow_funded', { milestoneId, amountInr });
analytics.track('milestone_approved', { milestoneId, daysToApprove });
analytics.track('dispute_raised', { milestoneId, reason });
analytics.track('contact_mask_triggered', { context: 'CHAT' | 'NEGOTIATION' });
analytics.track('cta_clicked', { ctaId, page, userType: 'guest' | 'customer' | 'vendor' });
analytics.track('guest_converted', { fromPage, action });
```

---

## 8. Big Brand Design Requirements

### 8.1 Visual Identity

| ID | Requirement |
|----|-------------|
| BRAND-01 | Decoqo wordmark logo — serif + sans combination, gold accent |
| BRAND-02 | Consistent use of Ivory & Gold palette across all pages |
| BRAND-03 | Premium photography style — warm, natural light, Indian interiors |
| BRAND-04 | Micro-animations on all interactive elements (hover, click, transition) |
| BRAND-05 | Page transitions — smooth fade/slide between routes (Framer Motion) |
| BRAND-06 | Loading states — branded skeleton with gold shimmer animation |
| BRAND-07 | Empty states — illustrated, on-brand, with clear CTA |
| BRAND-08 | Error pages (404, 500) — on-brand with helpful navigation |

### 8.2 Landing Page Sections (Priority Order)

```
1. Hero — "Design Any Space. Bid Anonymously. Execute with Trust."
   - Full-width, animated text, AI design carousel background
   - Two CTAs: "Start Your Project" (customer) + "Join as Vendor" (vendor)

2. Social Proof Bar — live numbers
   - 2,400+ Projects · ₹180Cr+ Secured · 4.8★ Average Rating · 98% Dispute-Free

3. How It Works — 4 steps with icons
   - Define Space → AI Designs → Anonymous Bids → Secure Execution

4. Featured Projects — before/after grid
   - Anonymized real projects, city + space type + budget range shown

5. Why Decoqo — trust differentiators
   - Escrow protection, BOQ lock, anonymous bidding, dispute resolution

6. Vendor Showcase — portfolio grid
   - Work samples, no contact info, "Join as Vendor" CTA

7. City Coverage — India map
   - Active cities highlighted, project count per city

8. Testimonials — customer + vendor quotes
   - Photo, name, city, project type

9. FAQ — accordion
   - Top 8 questions about the platform

10. Final CTA — "Ready to transform your space?"
    - Email capture + "Get Started" button
```

### 8.3 Conversion Optimization

| ID | Requirement |
|----|-------------|
| CRO-01 | A/B test hero headline (2 variants tracked via analytics) |
| CRO-02 | Sticky "Get Started" button on mobile (fixed bottom bar) |
| CRO-03 | Progress indicator on registration form ("Step 2 of 3") |
| CRO-04 | Social proof near every CTA ("Join 2,400+ homeowners") |
| CRO-05 | Trust badges near payment CTAs (Razorpay secured, SSL) |
| CRO-06 | Urgency on bidding room ("Bidding closes in 18 days") |
| CRO-07 | "Most Popular" badge on Standard material level in bid form |
