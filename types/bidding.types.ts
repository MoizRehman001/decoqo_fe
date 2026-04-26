/**
 * Bidding domain types — bids, AI designs, vendor profiles.
 *
 * CUST-31: Bids shown with anonymous labels — NO vendor identity
 * CUST-35: Vendor Profile Card shows city, categories, portfolio, rating, bio
 * CUST-36: NEVER shows phone, email, website, full address
 */

// ---------------------------------------------------------------------------
// AI Design
// ---------------------------------------------------------------------------

export type AiDesignStatus = 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED';

export type AiStyleFilter = 'MODERN' | 'TRADITIONAL' | 'SCANDINAVIAN' | 'INDUSTRIAL' | 'BOHEMIAN' | 'LUXURY';
export type AiColorFilter = 'NEUTRAL' | 'WARM' | 'COOL' | 'BOLD' | 'MONOCHROME';
export type AiMaterialFilter = 'WOOD' | 'MARBLE' | 'METAL' | 'FABRIC' | 'GLASS';
export type AiLightingFilter = 'NATURAL' | 'WARM_ARTIFICIAL' | 'COOL_ARTIFICIAL' | 'DRAMATIC';

export interface AiDesignFilters {
  style: AiStyleFilter | null;
  color: AiColorFilter | null;
  material: AiMaterialFilter | null;
  lighting: AiLightingFilter | null;
}

export interface AiDesign {
  id: string;
  projectId: string;
  theme: string;
  filters: AiDesignFilters;
  status: AiDesignStatus;
  /** 0–100 during generation */
  progress: number;
  /** Array of 2–3 generated design image URLs */
  imageUrls: string[];
  selectedImageUrl: string | null;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// BOQ
// ---------------------------------------------------------------------------

export interface BidBoqItem {
  room: string;
  category: string;
  description: string;
  material?: string;
  brand?: string;
  quantity: number;
  unit: string;
  rateInr: number;
  amountInr: number;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Bid
// ---------------------------------------------------------------------------

export type MaterialLevel = 'ECONOMY' | 'STANDARD' | 'PREMIUM' | 'LUXURY';
export type BidStatus = 'PENDING' | 'SHORTLISTED' | 'SELECTED' | 'REJECTED' | 'WITHDRAWN';

export interface Bid {
  id: string;
  projectId: string;
  vendorId: string;
  /** Anonymous label shown to customer during bidding — e.g. "Vendor A" */
  anonymousLabel: string;
  quotePaise: number;
  totalQuoteInr: number;
  timelineWeeks: number;
  materialLevel: MaterialLevel;
  materialQualityLevel: MaterialLevel;
  scopeAssumptions: string;
  scopeExclusions?: string;
  notes: string;
  status: BidStatus;
  isShortlisted: boolean;
  submittedAt: string;
  updatedAt: string;
  boqItems: BidBoqItem[];
}

// ---------------------------------------------------------------------------
// Vendor Profile (anonymized view — no PII)
// ---------------------------------------------------------------------------

export interface VendorReview {
  score: number;
  comment: string | null;
  date: string;
}

export interface VendorPortfolioItem {
  id: string;
  imageUrl: string;
  caption: string;
  spaceType: string;
}

export interface VendorProfile {
  /** Opaque vendor ID — never shown in UI during bidding */
  id: string;
  /** Display name — only revealed AFTER vendor is selected */
  name: string | null;
  businessName: string | null;
  city: string;
  serviceAreas: string[];
  categories: string[];
  bio: string;
  rating: number;
  averageRating: number | null;
  reviewCount: number;
  totalProjects: number;
  completedProjects: number;
  portfolioItems: VendorPortfolioItem[];
  portfolioUrls: string[];
  /** KYC verified badge */
  isVerified: boolean;
  /** Years of experience */
  yearsExperience: number;
  /** Response time in hours */
  avgResponseHours: number;
  recentReviews: VendorReview[];
  platformTrustSignals: string[];
}

// ---------------------------------------------------------------------------
// Bidding Room
// ---------------------------------------------------------------------------

export interface BiddingRoom {
  projectId: string;
  bids: Bid[];
  expiresAt: string;
  totalBids: number;
  isExpired: boolean;
}

// ---------------------------------------------------------------------------
// Bid Submit (vendor side)
// ---------------------------------------------------------------------------

export interface BidBoqItemPayload {
  room: string;
  category: string;
  description: string;
  material?: string;
  brand?: string;
  quantity: number;
  unit: string;
  rateInr: number;
  notes?: string;
}

export interface SubmitBidPayload {
  projectId: string;
  timelineWeeks: number;
  materialQualityLevel: MaterialLevel;
  boqItems: BidBoqItemPayload[];
  scopeExclusions?: string;
  notes?: string;
}
