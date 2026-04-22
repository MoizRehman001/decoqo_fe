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
  timelineWeeks: number;
  materialLevel: MaterialLevel;
  scopeAssumptions: string;
  notes: string;
  status: BidStatus;
  isShortlisted: boolean;
  submittedAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Vendor Profile (anonymized view — no PII)
// ---------------------------------------------------------------------------

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
  categories: string[];
  bio: string;
  rating: number;
  reviewCount: number;
  completedProjects: number;
  portfolioItems: VendorPortfolioItem[];
  /** KYC verified badge */
  isVerified: boolean;
  /** Years of experience */
  yearsExperience: number;
  /** Response time in hours */
  avgResponseHours: number;
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

export interface SubmitBidPayload {
  projectId: string;
  quotePaise: number;
  timelineWeeks: number;
  materialLevel: MaterialLevel;
  scopeAssumptions: string;
  notes: string;
}
