/**
 * Project domain types — used across the customer dashboard, wizard, and project detail views.
 */

// ---------------------------------------------------------------------------
// Enums / Literals
// ---------------------------------------------------------------------------

export type ProjectStatus =
  | 'DRAFT'
  | 'BIDDING_OPEN'
  | 'VENDOR_SELECTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'DISPUTED';

export type SpaceType =
  | 'RESIDENTIAL'
  | 'COMMERCIAL'
  | 'OFFICE'
  | 'FACTORY'
  | 'OTHER';

export type BudgetFlexibility = 'STRICT' | 'FLEXIBLE' | 'VERY_FLEXIBLE';

export type ProjectPriority = 'QUALITY_FIRST' | 'SPEED_FIRST' | 'BUDGET_FIRST';

export type ProjectTimeline =
  | '4_WEEKS'
  | '6_WEEKS'
  | '8_WEEKS'
  | '12_WEEKS'
  | 'FLEXIBLE';

export type WizardPath = 'AI_DESIGN' | 'BIDDING';

export type DimensionUnit = 'ft' | 'm' | 'cm';

// ---------------------------------------------------------------------------
// Room
// ---------------------------------------------------------------------------

export interface Room {
  id: string;
  name: string;
  length: number;
  width: number;
  height: number;
  unit: DimensionUnit;
}

// ---------------------------------------------------------------------------
// Project
// ---------------------------------------------------------------------------

export interface Project {
  id: string;
  title: string;
  spaceType: SpaceType;
  city: string;
  pincode: string;
  rooms: Room[];
  budgetMin: number;
  budgetMax: number;
  budgetFlexibility: BudgetFlexibility;
  timeline: ProjectTimeline;
  priority: ProjectPriority;
  status: ProjectStatus;
  description?: string;
  floorPlanPath?: string;
  aiDesignPath?: string;
  aiTheme?: string;
  path: WizardPath;
  customerId: string;
  selectedVendorId?: string;
  bidsCount: number;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Wizard State
// ---------------------------------------------------------------------------

export interface WizardState {
  step: number;
  // Step 1
  spaceType: SpaceType | null;
  // Step 2
  title: string;
  city: string;
  pincode: string;
  // Step 3
  rooms: Room[];
  // Step 4
  floorPlanFile: string | null; // mock: just a filename
  // Step 5
  path: WizardPath | null;
  aiTheme: string;
  description: string;
  // Step 6
  budgetMin: number;
  budgetMax: number;
  budgetFlexibility: BudgetFlexibility;
  timeline: ProjectTimeline;
  priority: ProjectPriority;
}

export const WIZARD_INITIAL_STATE: WizardState = {
  step: 1,
  spaceType: null,
  title: '',
  city: '',
  pincode: '',
  rooms: [],
  floorPlanFile: null,
  path: null,
  aiTheme: '',
  description: '',
  budgetMin: 0,
  budgetMax: 0,
  budgetFlexibility: 'FLEXIBLE',
  timeline: 'FLEXIBLE',
  priority: 'QUALITY_FIRST',
};

// ---------------------------------------------------------------------------
// Wizard Actions
// ---------------------------------------------------------------------------

export type WizardAction =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_SPACE_TYPE'; payload: SpaceType }
  | { type: 'SET_LOCATION'; payload: { title: string; city: string; pincode: string } }
  | { type: 'SET_ROOMS'; payload: Room[] }
  | { type: 'SET_FLOOR_PLAN'; payload: string | null }
  | { type: 'SET_PATH'; payload: WizardPath }
  | { type: 'SET_AI_THEME'; payload: string }
  | { type: 'SET_DESCRIPTION'; payload: string }
  | { type: 'SET_BUDGET'; payload: { budgetMin: number; budgetMax: number; budgetFlexibility: BudgetFlexibility } }
  | { type: 'SET_TIMELINE'; payload: ProjectTimeline }
  | { type: 'SET_PRIORITY'; payload: ProjectPriority }
  | { type: 'RESTORE'; payload: Partial<WizardState> }
  | { type: 'RESET' };

// ---------------------------------------------------------------------------
// Activity Feed
// ---------------------------------------------------------------------------

export interface ActivityEvent {
  id: string;
  projectId: string;
  projectTitle: string;
  type:
    | 'PROJECT_CREATED'
    | 'BID_RECEIVED'
    | 'VENDOR_SELECTED'
    | 'MILESTONE_COMPLETED'
    | 'PAYMENT_RELEASED'
    | 'PROJECT_COMPLETED';
  message: string;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Dashboard Stats
// ---------------------------------------------------------------------------

export interface DashboardStats {
  totalProjects: number;
  activeBids: number;
  pendingApprovals: number;
  totalSpent: number;
  projectsTrend: number; // percentage change
  bidsTrend: number;
  approvalsTrend: number;
  spentTrend: number;
}
