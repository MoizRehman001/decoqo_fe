# Decoqo Frontend — Implementation Tasks
## Phase 1 — 8 Sprints × 2 Weeks

---

## Sprint 1 — Foundation & Design System (Weeks 1–2)

- [x] 1.1 Initialize Next.js 14 App Router project with TypeScript strict mode
- [x] 1.2 Configure Tailwind CSS with Ivory & Gold design tokens
- [x] 1.3 Install and configure shadcn/ui component library
- [x] 1.4 Create `tailwind.config.ts` with full color palette (light + dark)
- [x] 1.5 Create `ThemeProvider` with localStorage persistence
- [x] 1.6 Build `ThemeToggle` component (☀️/🌙 button)
- [x] 1.7 Create base UI components: Button, Input, Card, Badge, Dialog, Table, Skeleton, Toast
- [x] 1.8 Build `Sidebar` component (customer, vendor, admin variants)
- [x] 1.9 Build `Topbar` component with user menu and theme toggle
- [x] 1.10 Create root layout with providers (QueryClient, ThemeProvider, Toaster)
- [x] 1.11 Configure Axios API client with request/response interceptors
- [x] 1.12 Create Zustand auth store (accessToken, user, refreshToken, logout)
- [x] 1.13 Implement route protection middleware
- [x] 1.14 Create money utilities (`formatInr`, `paiseToInr`, `inrToPaise`)
- [x] 1.15 Set up pnpm workspace monorepo structure
- [x] 1.16 Configure ESLint + Prettier + TypeScript strict settings
- [x] 1.17 Set up Vitest + React Testing Library
- [x] 1.18 Create `.env.local`, `.env.dev`, `.env.test` files

---

## Sprint 2 — Authentication (Weeks 3–4)

- [x] 2.1 Build landing page (SSR, public, Ivory & Gold theme showcase)
- [x] 2.2 Build customer registration form with Zod validation
- [x] 2.3 Build vendor registration form (business name, city, categories)
- [x] 2.4 Build login form (email or phone + password)
- [x] 2.5 Build OTP verification screen (6-digit input, countdown timer, resend)
- [x] 2.6 Implement JWT token storage in memory (not localStorage)
- [x] 2.7 Implement refresh token flow (httpOnly cookie auto-refresh on 401)
- [x] 2.8 Build policy acceptance checkbox on registration
- [x] 2.9 Build admin login with TOTP MFA field
- [x] 2.10 Create auth layout (centered card, no sidebar)
- [x] 2.11 Implement redirect after login based on role
- [x] 2.12 Build unauthorized page
- [~] 2.13 Write unit tests for auth forms and store
- [ ] 2.14 Write Playwright E2E test: register → verify OTP → login → dashboard

---

## Sprint 3 — Customer Dashboard & Project Creation (Weeks 5–6)

- [x] 3.1 Build customer dashboard with project list and stats cards
- [x] 3.2 Build `ProjectCard` component with status badge
- [x] 3.3 Build `ProjectStatusBadge` (DRAFT/BIDDING_OPEN/VENDOR_SELECTED/etc.)
- [x] 3.4 Build project creation wizard shell (`WizardShell` with step indicator)
- [x] 3.5 Build Step 1: Space type selection (icon grid)
- [x] 3.6 Build Step 2: Title + city + pincode
- [x] 3.7 Build Step 3: Room dimensions (add/remove rooms, L×W×H inputs)
- [x] 3.8 Build Step 4: Floor plan upload (react-dropzone, S3 pre-signed URL)
- [x] 3.9 Build Step 5: Path choice — "Generate AI Designs" vs "Skip to Bidding"
- [x] 3.10 Build Step 6: Budget range + flexibility + timeline + priority mode
- [ ] 3.11 Build Step 7: Review + Publish (validates all minimum fields)
- [x] 3.12 Implement wizard state persistence (save draft on each step)
- [x] 3.13 Build project detail overview page
- [x] 3.14 Implement TanStack Query hooks for project CRUD
- [x] 3.15 Write unit tests for wizard validation logic

---

## Sprint 4 — AI Design + Bidding Room (Weeks 7–8)

- [x] 4.1 Build AI design generation screen (theme text + filters)
- [x] 4.2 Build `GenerationProgress` component (WebSocket real-time progress bar)
- [x] 4.3 Build `DesignGallery` (2-3 design cards, select one)
- [x] 4.4 Build design lock confirmation dialog (irreversible warning)
- [x] 4.5 Build `BiddingRoomTable` (anonymous bids, sortable columns)
- [x] 4.6 Build `BidRow` component (anonymous label, quote, timeline, material, status)
- [x] 4.7 Build `VendorProfileCard` modal (portfolio gallery, rating, bio, trust signals)
- [x] 4.8 Build `TrustSignals` section (5 platform benefits, always shown)
- [x] 4.9 Implement shortlist bid action
- [x] 4.10 Implement select vendor flow (confirmation dialog → reveals identity)
- [x] 4.11 Build bidding room expiry countdown
- [x] 4.12 Build vendor browse projects page (filter by city, budget, category)
- [x] 4.13 Build `BidSubmitForm` (vendor side)
- [x] 4.14 Build My Bids list (vendor side)
- [ ] 4.15 Enforce anonymity: verify vendorId never appears in bidding room UI
- [~] 4.16 Write unit tests for anonymity enforcement

---

## Sprint 5 — Negotiation + Milestones (Weeks 9–10)

- [x] 5.1 Build `NegotiationChat` component (message thread)
- [x] 5.2 Build `MessageBubble` (customer vs vendor styling)
- [x] 5.3 Build `MaskedMessageWarning` badge (⚠️ [PHONE REMOVED])
- [x] 5.4 Build `ProposalCard` (revised quote, timeline, material level)
- [x] 5.5 Build proposal Accept / Counter / Decline actions
- [x] 5.6 Build "Confirm & Proceed to Milestones" button (both parties)
- [x] 5.7 Build `MilestoneList` with percentage and amount display
- [x] 5.8 Build `MilestoneCard` with `EscrowStatusBadge`
- [x] 5.9 Build milestone creation form (name, description, percentage)
- [x] 5.10 Build real-time percentage total validator (must equal 100%)
- [x] 5.11 Build "Lock All Milestones" confirmation flow
- [x] 5.12 Build milestone detail page (evidence gallery, completion notes)
- [x] 5.13 Build `MilestoneApprovalActions` (Approve / Request Changes / Raise Dispute)
- [ ] 5.14 Build dispute raise form (reason + description)
- [x] 5.15 Build `EvidenceUploader` (drag-drop, multi-file, S3 pre-signed)
- [x] 5.16 Build `EvidenceGallery` (image grid with lightbox)
- [x] 5.17 Implement WebSocket for milestone status updates

---

## Sprint 6 — BOQ Editor + Payments (Weeks 11–12)

- [ ] 6.1 Build `BoqEditor` shell (vendor side — create, edit, submit)
- [~] 6.2 Build `BoqRoomSection` (collapsible room group)
- [~] 6.3 Build `BoqItemRow` (inline editing, auto-calculated amount)
- [~] 6.4 Build `BoqSummary` (room totals, grand total)
- [~] 6.5 Implement optimistic updates for BOQ item changes
- [~] 6.6 Build BOQ submit + lock flow
- [~] 6.7 Build customer BOQ review (read-only, approve/request changes)
- [ ] 6.8 Build `VariationDiff` (old vs new side-by-side comparison)
- [ ] 6.9 Build variation raise form (vendor side)
- [ ] 6.10 Build variation approve/reject (customer side)
- [ ] 6.11 Build `BoqVersionHistory` viewer
- [ ] 6.12 Build `EscrowFundButton` → Razorpay checkout integration
- [ ] 6.13 Integrate Razorpay.js SDK (load script, open checkout, handle callback)
- [ ] 6.14 Build escrow status display (PENDING/FUNDED/HELD/RELEASED/REFUNDED)
- [ ] 6.15 Build payment history page
- [ ] 6.16 Write unit tests for BOQ calculation logic (paise arithmetic)

---

## Sprint 7 — Chat + Dispute + Timeline (Weeks 13–14)

- [ ] 7.1 Build `ChatThread` component (milestone-scoped)
- [ ] 7.2 Build `ChatMessage` with masked content display
- [ ] 7.3 Build `ChatInput` with send button
- [ ] 7.4 Implement WebSocket for real-time chat delivery
- [ ] 7.5 Build dispute evidence upload (customer + vendor)
- [ ] 7.6 Build `EvidenceBundle` viewer (admin side)
- [ ] 7.7 Build `ProjectTimeline` (chronological event list)
- [ ] 7.8 Build timeline event cards (color-coded by type)
- [ ] 7.9 Build ratings submission form (1-5 stars + comment)
- [ ] 7.10 Build project closure flow

---

## Sprint 8 — Admin Panel + Hardening (Weeks 15–16)

- [ ] 8.1 Build admin dashboard (escrow value, dispute count, KYC queue)
- [ ] 8.2 Build `EscrowMonitor` table (all escrow accounts, status, amounts)
- [ ] 8.3 Build freeze/unfreeze escrow action with reason
- [ ] 8.4 Build `DisputeQueue` list with SLA indicator
- [ ] 8.5 Build dispute detail page (full evidence bundle, BOQ, design, chat)
- [ ] 8.6 Build `DisputeDecisionForm` (Full Release / Partial / Refund + reason)
- [ ] 8.7 Build `KycQueue` (pending vendors, approve/reject)
- [ ] 8.8 Build user management table (ban/suspend/reinstate)
- [ ] 8.9 Build audit log viewer with search
- [ ] 8.10 Build vendor KYC submission form (vendor side)
- [ ] 8.11 Performance audit — LCP < 2.5s, bundle < 200KB
- [ ] 8.12 Accessibility audit — WCAG 2.1 AA
- [ ] 8.13 Write Playwright E2E: full trust loop (create → bid → BOQ → pay → approve)
- [ ] 8.14 Write Playwright E2E: dispute flow (raise → evidence → admin decision)
- [ ] 8.15 Security review: no tokens in localStorage, CSRF, input sanitization
- [ ] 8.16 Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] 8.17 Mobile responsiveness testing (375px, 768px, 1024px, 1440px)

---

## Definition of Done (Phase 1 Complete)

- [ ] All 3 portals functional end-to-end
- [ ] Full trust loop working: create → bid → BOQ → escrow → approve → release
- [ ] Vendor identity never visible during bidding phase
- [ ] Contact masking visible in chat UI
- [ ] Razorpay checkout working in test mode
- [ ] All skeleton loaders implemented
- [ ] Dark mode toggle working and persisted
- [ ] p95 page load < 2.5s
- [ ] 80%+ component test coverage
- [ ] E2E tests passing for critical flows
- [ ] Zero accessibility violations (axe-core)
- [ ] Mobile responsive on 375px+

---

## Sprint 0 — Landing Page & Public Experience (Weeks 0–1, runs parallel to Sprint 1)

### Public Landing Page (Big Brand)
- [ ] 0.1 Design and build hero section — full-width, animated headline, AI design carousel background
- [ ] 0.2 Build social proof stats bar (animated counters: projects, escrow value, rating)
- [ ] 0.3 Build "How It Works" 4-step section with icons and scroll animations
- [ ] 0.4 Build featured projects showcase grid (anonymized, before/after)
- [ ] 0.5 Build "Why Decoqo" trust differentiators section
- [ ] 0.6 Build vendor portfolio showcase grid
- [ ] 0.7 Build city coverage section (India map with active cities)
- [ ] 0.8 Build testimonials carousel (Framer Motion)
- [ ] 0.9 Build FAQ accordion section
- [ ] 0.10 Build final CTA section with email capture
- [ ] 0.11 Build sticky header with logo, nav, "Get Started" CTA
- [ ] 0.12 Build footer (links, social, legal)
- [ ] 0.13 Implement scroll-triggered animations (Framer Motion `useInView`)
- [ ] 0.14 Build `/how-it-works` detailed walkthrough page
- [ ] 0.15 Build `/explore` public project explorer with filters
- [ ] 0.16 Build `/vendors` public vendor portfolio gallery
- [ ] 0.17 Build city landing pages (`/cities/bengaluru`, `/cities/mumbai`, etc.)
- [ ] 0.18 Build space-type landing pages (`/spaces/modular-kitchen`, etc.)
- [ ] 0.19 Build `/pricing` page
- [ ] 0.20 Build legal pages (`/legal/terms`, `/legal/privacy`, `/legal/vendor-agreement`)

### Guest Experience
- [ ] 0.21 Implement guest project creation wizard (prompts register at Step 5)
- [ ] 0.22 Implement guest bid form (prompts register before submit)
- [ ] 0.23 Save guest wizard progress to localStorage, restore after login
- [ ] 0.24 Build "Calculate your project cost" estimator tool
- [ ] 0.25 Build interactive platform demo (animated walkthrough, no real data)
- [ ] 0.26 Build exit intent popup ("Get 3 free AI designs")
- [ ] 0.27 Build smart CTA slide-up banner (triggers after 30s)
- [ ] 0.28 Build "Save for later" localStorage persistence for guest actions

---

## Sprint 9 — Analytics & Tracking (Weeks 17–18)

### Product Analytics
- [ ] 9.1 Install and configure PostHog (self-hosted) or Mixpanel SDK
- [ ] 9.2 Create `analytics.ts` utility with typed `track()` function
- [ ] 9.3 Implement page view tracking on all routes
- [ ] 9.4 Track project creation funnel (landing → register → create → publish)
- [ ] 9.5 Track vendor funnel (register → KYC → browse → bid → selected)
- [ ] 9.6 Track AI design usage (Path A vs Path B ratio)
- [ ] 9.7 Track bidding room engagement (time spent, profiles viewed)
- [ ] 9.8 Track BOQ editor usage (items added, time to complete)
- [ ] 9.9 Track payment funnel (initiated → completed → abandoned)
- [ ] 9.10 Track contact masking triggers
- [ ] 9.11 Track all CTA clicks with page + user type context
- [ ] 9.12 Track guest-to-registered conversion events

### Heatmaps & Session Recording
- [ ] 9.13 Install Microsoft Clarity (free heatmaps + session recording)
- [ ] 9.14 Configure Clarity to exclude sensitive pages (payment, KYC)
- [ ] 9.15 Set up scroll depth tracking on landing page
- [ ] 9.16 Configure click tracking on all primary CTAs

### Performance Monitoring
- [ ] 9.17 Implement `next/vitals` Web Vitals reporting
- [ ] 9.18 Send Core Web Vitals (LCP, FID, CLS) to analytics
- [ ] 9.19 Add API response time tracking to Axios interceptor
- [ ] 9.20 Set up Sentry for frontend error tracking

### Admin Analytics Dashboard
- [ ] 9.21 Build admin analytics page with date range selector (shadcn DateRangePicker)
- [ ] 9.22 Build project creation trend chart (shadcn AreaChart)
- [ ] 9.23 Build funnel visualization — published → bids → selected → executed (shadcn horizontal BarChart)
- [ ] 9.24 Build city-wise activity chart (shadcn grouped BarChart)
- [ ] 9.25 Build feature adoption donut chart — AI-first vs bidding-only (shadcn PieChart)
- [ ] 9.26 Build escrow velocity line chart (shadcn LineChart)
- [ ] 9.27 Build metric cards with trend indicators (↑↓ vs previous period)
- [ ] 9.28 Build dispute rate trend chart (shadcn LineChart with target line)
- [ ] 9.29 Build contact masking trigger rate metric card

### Conversion Optimization
- [ ] 9.30 Implement A/B test framework for hero headline (2 variants)
- [ ] 9.31 Build sticky mobile CTA bar (fixed bottom, "Get Started")
- [ ] 9.32 Add social proof counters near all primary CTAs
- [ ] 9.33 Add trust badges near payment CTAs (Razorpay, SSL)
- [ ] 9.34 Add urgency indicator on bidding room ("Closes in X days")
- [ ] 9.35 Add "Most Popular" badge on Standard material level
