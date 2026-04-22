# Decoqo Frontend — Design Document
## Architecture, Patterns, and Implementation Guide

---

## 1. Tech Stack

| Layer | Choice | Version | Reason |
|-------|--------|---------|--------|
| Framework | Next.js App Router | 14.x | SSR, file-based routing, RSC |
| Language | TypeScript | 5.x | Strict mode, end-to-end type safety |
| Styling | Tailwind CSS | 3.x | Utility-first, design tokens |
| Components | shadcn/ui + Radix UI | latest | Accessible, unstyled primitives |
| Charts | **shadcn/ui Charts (Recharts)** | latest | Built into shadcn, consistent design system |
| Server State | TanStack Query v5 | 5.x | Caching, background refetch, optimistic updates |
| Client State | Zustand v4 | 4.x | Auth store, UI state |
| Forms | React Hook Form + Zod | latest | Performant, schema validation |
| HTTP | Axios | latest | Interceptors for auth + refresh |
| WebSockets | Socket.io-client | 4.x | Real-time updates |
| Animations | Framer Motion | 11.x | Page transitions, micro-interactions |
| Icons | Lucide React | latest | Consistent icon set |
| Date | date-fns | 3.x | Lightweight date formatting |
| Testing | Vitest + RTL + Playwright | latest | Unit + E2E |

---

## 2. Design System — Ivory & Gold

### 2.1 Color Tokens

```css
/* Light Mode (default) */
--color-bg:          #FAFAF8;   /* Warm ivory background */
--color-bg-card:     #FFFFFF;   /* Card surface */
--color-bg-subtle:   #F5F4F2;   /* Subtle section bg */
--color-border:      #E7E5E4;   /* Default border */
--color-border-strong: #D6D3D1; /* Strong border */

--color-accent:      #C9A84C;   /* Primary gold */
--color-accent-hover:#B8860B;   /* Gold hover */
--color-accent-light:#FEF3C7;   /* Gold tint bg */

--color-text-primary:  #1C1917; /* Near black */
--color-text-secondary:#78716C; /* Warm grey */
--color-text-muted:    #A8A29E; /* Muted */

--color-success:     #16A34A;
--color-warning:     #D97706;
--color-danger:      #DC2626;
--color-info:        #2563EB;

/* Dark Mode */
--color-bg:          #141414;
--color-bg-card:     #1C1C1E;
--color-bg-subtle:   #242424;
--color-border:      #2C2C2E;
--color-accent:      #D4A853;
--color-text-primary:#F5F5F7;
--color-text-secondary:#8E8E93;
```

### 2.2 Typography

```css
/* Font: Inter (system fallback) */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Scale */
--text-xs:   0.75rem;   /* 12px — labels, badges */
--text-sm:   0.875rem;  /* 14px — body small */
--text-base: 1rem;      /* 16px — body */
--text-lg:   1.125rem;  /* 18px — subheading */
--text-xl:   1.25rem;   /* 20px — heading */
--text-2xl:  1.5rem;    /* 24px — page title */
--text-3xl:  1.875rem;  /* 30px — hero */
```

### 2.3 Spacing & Radius

```css
--radius-sm:  4px;
--radius-md:  8px;
--radius-lg:  12px;
--radius-xl:  16px;
--radius-full: 9999px;

--shadow-sm:  0 1px 2px rgba(0,0,0,.05);
--shadow-md:  0 4px 6px rgba(0,0,0,.07);
--shadow-lg:  0 10px 15px rgba(0,0,0,.1);
```

---

## 3. Project Structure

```
Decoqo_fe/
├── apps/
│   └── web/
│       ├── app/
│       │   ├── layout.tsx                    # Root layout — providers, fonts
│       │   ├── page.tsx                      # Landing page (SSR)
│       │   ├── not-found.tsx
│       │   ├── error.tsx
│       │   │
│       │   ├── (auth)/                       # No sidebar layout
│       │   │   ├── layout.tsx
│       │   │   ├── login/page.tsx
│       │   │   ├── register/
│       │   │   │   ├── customer/page.tsx
│       │   │   │   └── vendor/page.tsx
│       │   │   └── verify/page.tsx
│       │   │
│       │   ├── (customer)/                   # Customer portal
│       │   │   ├── layout.tsx                # Sidebar + topbar
│       │   │   ├── dashboard/page.tsx
│       │   │   ├── projects/
│       │   │   │   ├── page.tsx
│       │   │   │   ├── new/page.tsx          # Multi-step wizard
│       │   │   │   └── [projectId]/
│       │   │   │       ├── page.tsx          # Project overview
│       │   │   │       ├── design/page.tsx   # AI design (optional)
│       │   │   │       ├── bidding-room/page.tsx
│       │   │   │       ├── negotiation/page.tsx
│       │   │   │       ├── milestones/
│       │   │   │       │   ├── page.tsx
│       │   │   │       │   └── [milestoneId]/page.tsx
│       │   │   │       ├── boq/page.tsx
│       │   │   │       ├── chat/page.tsx
│       │   │   │       └── timeline/page.tsx
│       │   │   └── settings/page.tsx
│       │   │
│       │   ├── (vendor)/                     # Vendor portal
│       │   │   ├── layout.tsx
│       │   │   ├── dashboard/page.tsx
│       │   │   ├── projects/
│       │   │   │   ├── page.tsx              # Browse projects
│       │   │   │   └── [projectId]/page.tsx  # Project detail
│       │   │   ├── bids/page.tsx
│       │   │   ├── active/
│       │   │   │   └── [projectId]/
│       │   │   │       ├── page.tsx
│       │   │   │       ├── boq/page.tsx
│       │   │   │       ├── milestones/[milestoneId]/page.tsx
│       │   │   │       └── chat/page.tsx
│       │   │   ├── kyc/page.tsx
│       │   │   └── settings/page.tsx
│       │   │
│       │   └── (admin)/                      # Admin panel
│       │       ├── layout.tsx
│       │       ├── dashboard/page.tsx
│       │       ├── escrow/page.tsx
│       │       ├── disputes/
│       │       │   ├── page.tsx
│       │       │   └── [disputeId]/page.tsx
│       │       ├── vendors/
│       │       │   ├── page.tsx
│       │       │   └── [vendorId]/page.tsx
│       │       ├── users/page.tsx
│       │       └── audit/page.tsx
│       │
│       ├── components/
│       │   ├── ui/                           # shadcn/ui primitives
│       │   │   ├── button.tsx
│       │   │   ├── input.tsx
│       │   │   ├── card.tsx
│       │   │   ├── badge.tsx
│       │   │   ├── dialog.tsx
│       │   │   ├── table.tsx
│       │   │   ├── skeleton.tsx
│       │   │   ├── toast.tsx
│       │   │   └── ...
│       │   ├── layout/
│       │   │   ├── Sidebar.tsx
│       │   │   ├── Topbar.tsx
│       │   │   ├── ThemeToggle.tsx
│       │   │   └── PageHeader.tsx
│       │   ├── auth/
│       │   │   ├── LoginForm.tsx
│       │   │   ├── RegisterForm.tsx
│       │   │   └── OtpVerifyForm.tsx
│       │   ├── project/
│       │   │   ├── ProjectCard.tsx
│       │   │   ├── ProjectWizard/
│       │   │   │   ├── WizardShell.tsx
│       │   │   │   ├── Step1SpaceType.tsx
│       │   │   │   ├── Step2Location.tsx
│       │   │   │   ├── Step3Rooms.tsx
│       │   │   │   ├── Step4FloorPlan.tsx
│       │   │   │   ├── Step5PathChoice.tsx
│       │   │   │   ├── Step6Budget.tsx
│       │   │   │   └── Step7Review.tsx
│       │   │   ├── ProjectStatusBadge.tsx
│       │   │   └── ProjectTimeline.tsx
│       │   ├── ai-design/
│       │   │   ├── DesignGenerator.tsx
│       │   │   ├── DesignGallery.tsx
│       │   │   ├── DesignCard.tsx
│       │   │   └── GenerationProgress.tsx
│       │   ├── bidding/
│       │   │   ├── BiddingRoomTable.tsx
│       │   │   ├── BidRow.tsx
│       │   │   ├── VendorProfileCard.tsx
│       │   │   ├── TrustSignals.tsx
│       │   │   └── BidSubmitForm.tsx
│       │   ├── negotiation/
│       │   │   ├── NegotiationChat.tsx
│       │   │   ├── MessageBubble.tsx
│       │   │   ├── MaskedMessageWarning.tsx
│       │   │   └── ProposalCard.tsx
│       │   ├── milestone/
│       │   │   ├── MilestoneCard.tsx
│       │   │   ├── MilestoneList.tsx
│       │   │   ├── EscrowStatusBadge.tsx
│       │   │   ├── EvidenceUploader.tsx
│       │   │   ├── EvidenceGallery.tsx
│       │   │   └── MilestoneApprovalActions.tsx
│       │   ├── boq/
│       │   │   ├── BoqEditor.tsx
│       │   │   ├── BoqRoomSection.tsx
│       │   │   ├── BoqItemRow.tsx
│       │   │   ├── BoqSummary.tsx
│       │   │   ├── VariationDiff.tsx
│       │   │   └── BoqVersionHistory.tsx
│       │   ├── payment/
│       │   │   ├── EscrowFundButton.tsx
│       │   │   ├── RazorpayCheckout.tsx
│       │   │   └── PaymentHistory.tsx
│       │   ├── chat/
│       │   │   ├── ChatThread.tsx
│       │   │   ├── ChatMessage.tsx
│       │   │   └── ChatInput.tsx
│       │   ├── dispute/
│       │   │   ├── DisputeForm.tsx
│       │   │   ├── EvidenceBundle.tsx
│       │   │   └── DisputeDecisionForm.tsx
│       │   └── admin/
│       │       ├── EscrowMonitor.tsx
│       │       ├── DisputeQueue.tsx
│       │       └── KycQueue.tsx
│       │
│       ├── lib/
│       │   ├── api/
│       │   │   ├── client.ts             # Axios instance + interceptors
│       │   │   ├── auth.ts               # Auth API + hooks
│       │   │   ├── projects.ts           # Project API + hooks
│       │   │   ├── bidding.ts            # Bidding API + hooks
│       │   │   ├── boq.ts                # BOQ API + hooks
│       │   │   ├── milestones.ts         # Milestone API + hooks
│       │   │   ├── payments.ts           # Payment API + hooks
│       │   │   ├── disputes.ts           # Dispute API + hooks
│       │   │   ├── chat.ts               # Chat API + hooks
│       │   │   ├── negotiation.ts        # Negotiation API + hooks
│       │   │   └── admin.ts              # Admin API + hooks
│       │   ├── hooks/
│       │   │   ├── useProjectSocket.ts   # WebSocket per project
│       │   │   ├── useTheme.ts           # Theme toggle
│       │   │   └── useDebounce.ts
│       │   ├── stores/
│       │   │   ├── auth.store.ts         # Zustand auth state
│       │   │   └── ui.store.ts           # Sidebar, modals
│       │   ├── utils/
│       │   │   ├── money.ts              # INR formatting
│       │   │   ├── date.ts               # Date formatting
│       │   │   └── cn.ts                 # Tailwind class merge
│       │   └── validations/
│       │       ├── auth.schema.ts
│       │       ├── project.schema.ts
│       │       ├── boq.schema.ts
│       │       └── bid.schema.ts
│       │
│       ├── types/
│       │   ├── api.types.ts              # API response types
│       │   ├── project.types.ts
│       │   ├── boq.types.ts
│       │   └── payment.types.ts
│       │
│       ├── middleware.ts                 # Route protection
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       └── tsconfig.json
│
├── packages/
│   ├── ui/                               # Shared design system
│   ├── types/                            # Shared TypeScript types
│   └── config/                           # Shared ESLint, Tailwind config
│
└── package.json                          # pnpm workspace
```

---

## 4. Key Architecture Patterns

### 4.1 API Client with Auto-Refresh

```typescript
// lib/api/client.ts
import axios from 'axios';
import { useAuthStore } from '@/lib/stores/auth.store';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30_000,
  withCredentials: true, // sends httpOnly refresh token cookie
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res.data.data ?? res.data,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshed = await useAuthStore.getState().refreshToken();
      if (refreshed) return apiClient(error.config);
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data?.error ?? error);
  },
);
```

### 4.2 TanStack Query Keys Factory

```typescript
// lib/api/projects.ts
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  detail: (id: string) => [...projectKeys.all, 'detail', id] as const,
  biddingRoom: (id: string) => [...projectKeys.all, 'bidding-room', id] as const,
  timeline: (id: string) => [...projectKeys.all, 'timeline', id] as const,
};

export const boqKeys = {
  all: ['boq'] as const,
  byProject: (projectId: string) => [...boqKeys.all, 'project', projectId] as const,
  detail: (boqId: string) => [...boqKeys.all, 'detail', boqId] as const,
};
```

### 4.3 Optimistic Updates (BOQ Editor)

```typescript
// Optimistic update — changes feel instant, rollback on error
const updateBoqItem = useMutation({
  mutationFn: (data: UpdateBoqItemDto) =>
    apiClient.patch(`/boq/${boqId}/items/${data.id}`, data),
  onMutate: async (newItem) => {
    await queryClient.cancelQueries({ queryKey: boqKeys.detail(boqId) });
    const previous = queryClient.getQueryData(boqKeys.detail(boqId));
    queryClient.setQueryData(boqKeys.detail(boqId), (old: Boq) => ({
      ...old,
      items: old.items.map((item) =>
        item.id === newItem.id
          ? { ...item, ...newItem, amountPaise: Math.round(newItem.quantity * newItem.ratePaise) }
          : item,
      ),
    }));
    return { previous };
  },
  onError: (_err, _newItem, context) => {
    queryClient.setQueryData(boqKeys.detail(boqId), context?.previous);
    toast.error('Failed to update item');
  },
  onSettled: () => queryClient.invalidateQueries({ queryKey: boqKeys.detail(boqId) }),
});
```

### 4.4 WebSocket Hook

```typescript
// lib/hooks/useProjectSocket.ts
export function useProjectSocket(projectId: string) {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!projectId || !accessToken) return;
    const socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
      auth: { token: accessToken },
    });
    socket.emit('join_project', { projectId });

    socket.on('milestone.status_changed', ({ milestoneId }) =>
      queryClient.invalidateQueries({ queryKey: ['milestones', milestoneId] }),
    );
    socket.on('escrow.status_changed', ({ milestoneId }) =>
      queryClient.invalidateQueries({ queryKey: ['escrow', milestoneId] }),
    );
    socket.on('chat.new_message', ({ threadId }) =>
      queryClient.invalidateQueries({ queryKey: ['chat', threadId] }),
    );
    socket.on('design.generation.complete', ({ designId, imageUrls }) =>
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) }),
    );

    return () => { socket.emit('leave_project', { projectId }); socket.disconnect(); };
  }, [projectId, accessToken]);
}
```

### 4.5 Money Utilities

```typescript
// lib/utils/money.ts
export const formatInr = (paise: number): string =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
    .format(paise / 100);

export const paiseToInr = (paise: number): number => paise / 100;
export const inrToPaise = (inr: number): number => Math.round(inr * 100);
```

### 4.6 Route Protection Middleware

```typescript
// middleware.ts
const ROLE_ROUTES: Record<string, string[]> = {
  CUSTOMER: ['/customer'],
  VENDOR: ['/vendor'],
  ADMIN: ['/admin'],
  SUPER_ADMIN: ['/admin', '/super-admin'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('access_token')?.value;

  if (['/login', '/register', '/verify', '/'].some((r) => pathname.startsWith(r)))
    return NextResponse.next();

  if (!token) return NextResponse.redirect(new URL('/login', request.url));

  const payload = JSON.parse(atob(token.split('.')[1]!));
  const allowed = ROLE_ROUTES[payload.role] ?? [];
  if (!allowed.some((prefix) => pathname.startsWith(prefix)))
    return NextResponse.redirect(new URL('/unauthorized', request.url));

  return NextResponse.next();
}
```

---

## 5. Component Design Patterns

### 5.1 Server vs Client Components

- **Server Components** (default): data fetching, static content, SEO pages
- **Client Components** (`'use client'`): interactivity, forms, WebSocket, Zustand

```typescript
// Server Component — project overview page
async function ProjectPage({ params }: { params: { projectId: string } }) {
  const project = await getProject(params.projectId); // Direct API call
  return <ProjectDetail project={project} />;
}

// Client Component — BOQ editor
'use client';
function BoqEditor({ boqId }: { boqId: string }) {
  const { data } = useBoq(boqId); // TanStack Query
  // interactive editing...
}
```

### 5.2 Skeleton Loading Pattern

```typescript
// Always show skeletons, never blank screens
function ProjectList() {
  const { data, isLoading } = useProjects();
  if (isLoading) return <>{Array.from({length: 3}).map((_, i) => <ProjectCardSkeleton key={i} />)}</>;
  return <>{data?.map((p) => <ProjectCard key={p.id} project={p} />)}</>;
}
```

### 5.3 Error Boundary Pattern

```typescript
// Wrap every major section
'use client';
function ProjectPage() {
  return (
    <ErrorBoundary fallback={<ProjectErrorFallback />}>
      <Suspense fallback={<ProjectSkeleton />}>
        <ProjectContent />
      </Suspense>
    </ErrorBoundary>
  );
}
```

---

## 6. Critical UI Rules

| Rule | Implementation |
|------|---------------|
| Vendor identity hidden in bidding | `anonymousLabel` field only, no `vendorId` in UI |
| Contact masking visible | Show `[PHONE REMOVED]` with ⚠️ badge in chat |
| Escrow status always visible | `EscrowStatusBadge` on every milestone card |
| Money always in INR | `formatInr(paise)` utility everywhere |
| Milestone % must total 100% | Real-time sum validation in milestone form |
| BOQ amounts auto-calculated | Never allow manual `amountPaise` entry |
| Razorpay checkout | Use Razorpay.js SDK, never redirect |

---

## 7. Environment Variables

```bash
# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx
NEXT_PUBLIC_S3_CDN_URL=https://cdn.decoqo.com
NEXT_PUBLIC_SENTRY_DSN=
```

---

## 8. Public / Guest Architecture

### 8.1 Public Route Strategy

```
Public (no auth):          Protected (auth required):
/                          /customer/*
/explore                   /vendor/*
/vendors                   /admin/*
/how-it-works
/pricing
/cities/[city]
/spaces/[type]
/legal/*
/about
/contact
/blog
```

### 8.2 Guest State Management

```typescript
// lib/stores/guest.store.ts
interface GuestState {
  wizardProgress: Partial<ProjectWizardData> | null;
  savedProjects: string[];                    // project IDs browsed
  estimatorResult: EstimatorResult | null;
  saveWizardProgress: (data: Partial<ProjectWizardData>) => void;
  clearAfterLogin: () => void;
}

export const useGuestStore = create<GuestState>()(
  persist(
    (set) => ({
      wizardProgress: null,
      savedProjects: [],
      estimatorResult: null,
      saveWizardProgress: (data) => set({ wizardProgress: data }),
      clearAfterLogin: () => set({ wizardProgress: null, savedProjects: [] }),
    }),
    { name: 'decoqo-guest', storage: createJSONStorage(() => localStorage) },
  ),
);
```

### 8.3 Analytics Architecture

```typescript
// lib/analytics/index.ts
type EventName =
  | 'page_viewed'
  | 'project_created'
  | 'ai_design_generated'
  | 'ai_design_skipped'
  | 'project_published'
  | 'bid_submitted'
  | 'vendor_profile_viewed'
  | 'vendor_selected'
  | 'escrow_funded'
  | 'milestone_approved'
  | 'dispute_raised'
  | 'contact_mask_triggered'
  | 'cta_clicked'
  | 'guest_converted';

export const analytics = {
  track: (event: EventName, properties?: Record<string, unknown>) => {
    // PostHog
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture(event, properties);
    }
    // Console in dev
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', event, properties);
    }
  },
  identify: (userId: string, traits?: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.identify(userId, traits);
    }
  },
  page: (pageName: string) => {
    analytics.track('page_viewed', { page: pageName });
  },
};
```

### 8.4 Landing Page Component Architecture

```
LandingPage (SSR)
├── StickyHeader
│   ├── Logo
│   ├── NavLinks (How It Works, Explore, Pricing)
│   └── CTAButtons (Get Started, I'm a Vendor)
│
├── HeroSection
│   ├── AnimatedHeadline (Framer Motion typewriter)
│   ├── SubHeadline
│   ├── CTAButtons
│   └── DesignCarousel (rotating AI-generated interiors)
│
├── SocialProofBar
│   └── AnimatedCounters (projects, escrow, rating, dispute-free %)
│
├── HowItWorksSection
│   └── StepCards × 4 (scroll-triggered fade-in)
│
├── FeaturedProjectsSection
│   └── ProjectShowcaseGrid (anonymized, before/after)
│
├── WhyDecoqoSection
│   └── TrustFeatureCards × 5
│
├── VendorShowcaseSection
│   └── PortfolioGrid + "Join as Vendor" CTA
│
├── CityCoverageSection
│   └── IndiaMap + CityCards
│
├── TestimonialsSection
│   └── TestimonialCarousel
│
├── FAQSection
│   └── AccordionItems × 8
│
├── FinalCTASection
│   └── EmailCapture + GetStartedButton
│
└── Footer
    ├── Links
    ├── SocialIcons
    └── LegalLinks
```

### 8.5 Big Brand Animation Patterns

```typescript
// Scroll-triggered section reveal
const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

function Section({ children }: { children: React.ReactNode }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  return (
    <motion.section ref={ref} variants={sectionVariants} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
      {children}
    </motion.section>
  );
}

// Animated counter (social proof bar)
function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString('en-IN'));
  useEffect(() => { animate(count, target, { duration: 2, ease: 'easeOut' }); }, []);
  return <motion.span>{rounded}{suffix}</motion.span>;
}

// Gold shimmer skeleton
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;
// background: linear-gradient(90deg, #F5F4F2 25%, #FEF3C7 50%, #F5F4F2 75%)
// background-size: 200% 100%
// animation: shimmer 1.5s infinite
```

---

## 9. Analytics Dashboard — shadcn/ui Charts

All charts use **shadcn/ui Charts** (built on Recharts) — no external chart library needed. Install with `npx shadcn@latest add chart`.

### 9.1 Chart Components Used

```typescript
// shadcn/ui chart primitives
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  LineChart, Line,
  BarChart, Bar,
  AreaChart, Area,
  PieChart, Pie, Cell,
  ResponsiveContainer,
  XAxis, YAxis, CartesianGrid,
} from 'recharts';
```

### 9.2 Admin Dashboard Charts

```typescript
// 1. Project Creation Trend — Area Chart
const ProjectTrendChart = ({ data }: { data: TrendData[] }) => (
  <ChartContainer config={{ projects: { label: 'Projects', color: '#C9A84C' } }}>
    <AreaChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
      <XAxis dataKey="date" tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
      <YAxis tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
      <ChartTooltip content={<ChartTooltipContent />} />
      <Area type="monotone" dataKey="projects" stroke="#C9A84C" fill="#FEF3C7" strokeWidth={2} />
    </AreaChart>
  </ChartContainer>
);

// 2. Funnel — Horizontal Bar Chart
const FunnelChart = ({ data }: { data: FunnelData[] }) => (
  <ChartContainer config={{ count: { label: 'Count', color: '#C9A84C' } }}>
    <BarChart data={data} layout="vertical">
      <XAxis type="number" tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
      <YAxis dataKey="stage" type="category" tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} width={140} />
      <ChartTooltip content={<ChartTooltipContent />} />
      <Bar dataKey="count" fill="#C9A84C" radius={[0, 4, 4, 0]} />
    </BarChart>
  </ChartContainer>
);

// 3. Feature Adoption — Pie Chart (AI-first vs Bidding-only)
const AdoptionChart = ({ aiFirst, biddingOnly }: { aiFirst: number; biddingOnly: number }) => {
  const data = [
    { name: 'AI-First', value: aiFirst, color: '#C9A84C' },
    { name: 'Bidding-Only', value: biddingOnly, color: '#78716C' },
  ];
  return (
    <ChartContainer config={{}}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value">
          {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
        </Pie>
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
      </PieChart>
    </ChartContainer>
  );
};

// 4. City Activity — Bar Chart
const CityActivityChart = ({ data }: { data: CityData[] }) => (
  <ChartContainer config={{ projects: { label: 'Projects', color: '#C9A84C' }, bids: { label: 'Bids', color: '#A8A29E' } }}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
      <XAxis dataKey="city" tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
      <YAxis tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
      <ChartTooltip content={<ChartTooltipContent />} />
      <ChartLegend content={<ChartLegendContent />} />
      <Bar dataKey="projects" fill="#C9A84C" radius={[4, 4, 0, 0]} />
      <Bar dataKey="bids" fill="#A8A29E" radius={[4, 4, 0, 0]} />
    </BarChart>
  </ChartContainer>
);

// 5. Escrow Velocity — Line Chart
const EscrowVelocityChart = ({ data }: { data: VelocityData[] }) => (
  <ChartContainer config={{ avgDays: { label: 'Avg Days to Fund', color: '#16A34A' } }}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
      <XAxis dataKey="week" tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
      <YAxis tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
      <ChartTooltip content={<ChartTooltipContent />} />
      <Line type="monotone" dataKey="avgDays" stroke="#16A34A" strokeWidth={2} dot={{ fill: '#16A34A' }} />
    </LineChart>
  </ChartContainer>
);
```

### 9.3 Admin Analytics Page Layout

```
/admin/analytics
├── DateRangePicker (last 7d / 30d / 90d / custom)
├── MetricCards Row
│   ├── TotalProjects (with trend ↑↓)
│   ├── TotalEscrowValue (₹ formatted)
│   ├── DisputeRate (% with target indicator)
│   └── AvgBidsPerProject
│
├── Charts Grid (2-column)
│   ├── ProjectTrendChart (area — left)
│   ├── FunnelChart (horizontal bar — right)
│   ├── CityActivityChart (grouped bar — left)
│   └── AdoptionChart (donut — right)
│
├── EscrowVelocityChart (full width line)
│
└── DataTables
    ├── TopCitiesTable
    ├── DisputeRateTable
    └── ContactMaskingTable
```

### 9.4 Chart Theme Integration

```typescript
// All charts inherit Ivory & Gold tokens automatically
const chartConfig = {
  // Light mode
  '--chart-1': '#C9A84C',   // Gold — primary metric
  '--chart-2': '#16A34A',   // Green — success/positive
  '--chart-3': '#2563EB',   // Blue — info
  '--chart-4': '#D97706',   // Amber — warning
  '--chart-5': '#DC2626',   // Red — danger/dispute

  // Dark mode overrides
  '[data-theme=dark] --chart-1': '#D4A853',
  '[data-theme=dark] --chart-2': '#22C55E',
};
```
