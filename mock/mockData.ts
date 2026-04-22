/**
 * Comprehensive mock data layer — mirrors real API responses with realistic delays.
 * All functions return properly typed Promises.
 *
 * Usage: import { mockAuthApi, mockProjectApi } from '@/mock/mockData'
 */

import type { AuthUser } from '@/types/api.types';
import type {
  Project,
  Room,
  ActivityEvent,
  DashboardStats,
} from '@/types/project.types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay(min = 300, max = 800): Promise<void> {
  return delay(Math.floor(Math.random() * (max - min + 1)) + min);
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

// ---------------------------------------------------------------------------
// Mock Users
// ---------------------------------------------------------------------------

const MOCK_USERS: AuthUser[] = [
  {
    id: 'usr_cust_001',
    email: 'priya.sharma@example.com',
    phone: '9876543210',
    name: 'Priya Sharma',
    role: 'CUSTOMER',
    isVerified: true,
  },
  {
    id: 'usr_cust_002',
    email: 'rahul.mehta@example.com',
    phone: '9123456789',
    name: 'Rahul Mehta',
    role: 'CUSTOMER',
    isVerified: true,
  },
  {
    id: 'usr_vend_001',
    email: 'arjun.interiors@example.com',
    phone: '9988776655',
    name: 'Arjun Kapoor',
    role: 'VENDOR',
    isVerified: true,
  },
  {
    id: 'usr_vend_002',
    email: 'designcraft@example.com',
    phone: '9876001234',
    name: 'Sneha Patel',
    role: 'VENDOR',
    isVerified: false,
  },
  {
    id: 'usr_admin_001',
    email: 'admin@decoqo.com',
    name: 'Admin User',
    role: 'ADMIN',
    isVerified: true,
  },
];

// ---------------------------------------------------------------------------
// Mock Rooms
// ---------------------------------------------------------------------------

const SAMPLE_ROOMS: Room[] = [
  { id: 'room_001', name: 'Living Room', lengthFt: 18, widthFt: 14, heightFt: 10 },
  { id: 'room_002', name: 'Bedroom', lengthFt: 14, widthFt: 12, heightFt: 10 },
  { id: 'room_003', name: 'Kitchen', lengthFt: 12, widthFt: 10, heightFt: 9 },
  { id: 'room_004', name: 'Bathroom', lengthFt: 8, widthFt: 6, heightFt: 9 },
];

// ---------------------------------------------------------------------------
// Mock Projects
// ---------------------------------------------------------------------------

const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj_001',
    title: '3BHK Full Home Renovation — Koramangala',
    spaceType: 'RESIDENTIAL',
    city: 'Bengaluru',
    pincode: '560034',
    rooms: SAMPLE_ROOMS,
    budgetMin: 1500000,
    budgetMax: 2500000,
    budgetFlexibility: 'FLEXIBLE',
    timeline: '12_WEEKS',
    priority: 'QUALITY_FIRST',
    status: 'BIDDING_OPEN',
    description: 'Complete renovation of a 3BHK apartment including modular kitchen, wardrobes, and false ceiling.',
    floorPlanPath: '/mock/floorplan-001.pdf',
    aiDesignPath: '/mock/ai-design-001.jpg',
    path: 'AI_DESIGN',
    customerId: 'usr_cust_001',
    bidsCount: 7,
    createdAt: '2025-01-15T10:30:00Z',
    updatedAt: '2025-01-20T14:00:00Z',
  },
  {
    id: 'proj_002',
    title: 'Modular Kitchen Upgrade — Bandra West',
    spaceType: 'RESIDENTIAL',
    city: 'Mumbai',
    pincode: '400050',
    rooms: [SAMPLE_ROOMS[2]!],
    budgetMin: 400000,
    budgetMax: 700000,
    budgetFlexibility: 'STRICT',
    timeline: '6_WEEKS',
    priority: 'BUDGET_FIRST',
    status: 'VENDOR_SELECTED',
    description: 'Modular kitchen with island counter, premium fittings, and chimney installation.',
    path: 'BIDDING',
    customerId: 'usr_cust_001',
    selectedVendorId: 'usr_vend_001',
    bidsCount: 12,
    createdAt: '2025-01-05T09:00:00Z',
    updatedAt: '2025-01-18T11:30:00Z',
  },
  {
    id: 'proj_003',
    title: 'Office Interior — Cyber City',
    spaceType: 'OFFICE',
    city: 'Delhi NCR',
    pincode: '122002',
    rooms: [
      { id: 'room_off_001', name: 'Open Office', lengthFt: 40, widthFt: 30, heightFt: 12 },
      { id: 'room_off_002', name: 'Conference Room', lengthFt: 20, widthFt: 15, heightFt: 12 },
    ],
    budgetMin: 2000000,
    budgetMax: 4000000,
    budgetFlexibility: 'VERY_FLEXIBLE',
    timeline: '8_WEEKS',
    priority: 'SPEED_FIRST',
    status: 'IN_PROGRESS',
    description: 'Modern office interior with collaborative spaces, ergonomic furniture, and branded elements.',
    path: 'BIDDING',
    customerId: 'usr_cust_001',
    selectedVendorId: 'usr_vend_001',
    bidsCount: 5,
    createdAt: '2024-12-01T08:00:00Z',
    updatedAt: '2025-01-22T16:00:00Z',
  },
  {
    id: 'proj_004',
    title: 'Master Bedroom Makeover — Jubilee Hills',
    spaceType: 'RESIDENTIAL',
    city: 'Hyderabad',
    pincode: '500033',
    rooms: [SAMPLE_ROOMS[1]!],
    budgetMin: 300000,
    budgetMax: 500000,
    budgetFlexibility: 'FLEXIBLE',
    timeline: '4_WEEKS',
    priority: 'QUALITY_FIRST',
    status: 'COMPLETED',
    description: 'Luxury master bedroom with walk-in wardrobe, accent wall, and premium lighting.',
    aiDesignPath: '/mock/ai-design-004.jpg',
    path: 'AI_DESIGN',
    customerId: 'usr_cust_001',
    selectedVendorId: 'usr_vend_002',
    bidsCount: 9,
    createdAt: '2024-10-10T10:00:00Z',
    updatedAt: '2024-12-15T12:00:00Z',
  },
  {
    id: 'proj_005',
    title: 'Living Room Refresh — Koregaon Park',
    spaceType: 'RESIDENTIAL',
    city: 'Pune',
    pincode: '411001',
    rooms: [SAMPLE_ROOMS[0]!],
    budgetMin: 200000,
    budgetMax: 400000,
    budgetFlexibility: 'FLEXIBLE',
    timeline: '4_WEEKS',
    priority: 'BUDGET_FIRST',
    status: 'DRAFT',
    description: '',
    path: 'BIDDING',
    customerId: 'usr_cust_001',
    bidsCount: 0,
    createdAt: '2025-01-22T15:00:00Z',
    updatedAt: '2025-01-22T15:00:00Z',
  },
  {
    id: 'proj_006',
    title: 'Retail Store Interior — Anna Nagar',
    spaceType: 'COMMERCIAL',
    city: 'Chennai',
    pincode: '600040',
    rooms: [
      { id: 'room_ret_001', name: 'Showroom', lengthFt: 30, widthFt: 25, heightFt: 14 },
    ],
    budgetMin: 800000,
    budgetMax: 1500000,
    budgetFlexibility: 'FLEXIBLE',
    timeline: '8_WEEKS',
    priority: 'QUALITY_FIRST',
    status: 'BIDDING_OPEN',
    description: 'Premium retail store with display fixtures, lighting design, and branded interiors.',
    path: 'BIDDING',
    customerId: 'usr_cust_002',
    bidsCount: 3,
    createdAt: '2025-01-18T11:00:00Z',
    updatedAt: '2025-01-21T09:00:00Z',
  },
  {
    id: 'proj_007',
    title: 'Factory Canteen Renovation',
    spaceType: 'FACTORY',
    city: 'Pune',
    pincode: '411019',
    rooms: [
      { id: 'room_can_001', name: 'Dining Area', lengthFt: 50, widthFt: 30, heightFt: 15 },
    ],
    budgetMin: 500000,
    budgetMax: 900000,
    budgetFlexibility: 'STRICT',
    timeline: '6_WEEKS',
    priority: 'BUDGET_FIRST',
    status: 'DISPUTED',
    description: 'Industrial canteen with durable materials, efficient layout, and proper ventilation.',
    path: 'BIDDING',
    customerId: 'usr_cust_002',
    selectedVendorId: 'usr_vend_002',
    bidsCount: 4,
    createdAt: '2024-11-01T08:00:00Z',
    updatedAt: '2025-01-10T10:00:00Z',
  },
  {
    id: 'proj_008',
    title: '2BHK Apartment — Whitefield',
    spaceType: 'RESIDENTIAL',
    city: 'Bengaluru',
    pincode: '560066',
    rooms: SAMPLE_ROOMS.slice(0, 3),
    budgetMin: 800000,
    budgetMax: 1200000,
    budgetFlexibility: 'FLEXIBLE',
    timeline: '8_WEEKS',
    priority: 'QUALITY_FIRST',
    status: 'COMPLETED',
    description: 'Full 2BHK interior with modular kitchen, wardrobes, and living room furniture.',
    aiDesignPath: '/mock/ai-design-008.jpg',
    path: 'AI_DESIGN',
    customerId: 'usr_cust_002',
    selectedVendorId: 'usr_vend_001',
    bidsCount: 8,
    createdAt: '2024-09-01T09:00:00Z',
    updatedAt: '2024-11-30T17:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Mock Activity Events
// ---------------------------------------------------------------------------

const MOCK_ACTIVITY: ActivityEvent[] = [
  {
    id: 'act_001',
    projectId: 'proj_001',
    projectTitle: '3BHK Full Home Renovation — Koramangala',
    type: 'BID_RECEIVED',
    message: 'New bid received from Arjun Interiors for ₹18.5L',
    timestamp: '2025-01-20T14:30:00Z',
  },
  {
    id: 'act_002',
    projectId: 'proj_002',
    projectTitle: 'Modular Kitchen Upgrade — Bandra West',
    type: 'VENDOR_SELECTED',
    message: 'You selected Arjun Kapoor as your vendor',
    timestamp: '2025-01-18T11:30:00Z',
  },
  {
    id: 'act_003',
    projectId: 'proj_003',
    projectTitle: 'Office Interior — Cyber City',
    type: 'MILESTONE_COMPLETED',
    message: 'Milestone "Electrical & Plumbing" marked complete',
    timestamp: '2025-01-22T16:00:00Z',
  },
  {
    id: 'act_004',
    projectId: 'proj_004',
    projectTitle: 'Master Bedroom Makeover — Jubilee Hills',
    type: 'PROJECT_COMPLETED',
    message: 'Project completed successfully. Escrow released.',
    timestamp: '2024-12-15T12:00:00Z',
  },
  {
    id: 'act_005',
    projectId: 'proj_001',
    projectTitle: '3BHK Full Home Renovation — Koramangala',
    type: 'BID_RECEIVED',
    message: 'New bid received from DesignCraft Studio for ₹22L',
    timestamp: '2025-01-19T09:15:00Z',
  },
];

// ---------------------------------------------------------------------------
// Mock OTP store (in-memory)
// ---------------------------------------------------------------------------

const OTP_STORE = new Map<string, string>();

// ---------------------------------------------------------------------------
// Auth API
// ---------------------------------------------------------------------------

export interface RegisterCustomerPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
  acceptedTerms: boolean;
}

export interface RegisterVendorPayload {
  name: string;
  businessName: string;
  email: string;
  phone: string;
  city: string;
  categories: string[];
  password: string;
  acceptedTerms: boolean;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

export interface OtpResponse {
  message: string;
  expiresAt: string;
}

export const mockAuthApi = {
  registerCustomer: async (data: RegisterCustomerPayload): Promise<AuthResponse> => {
    await randomDelay(500, 800);
    const user: AuthUser = {
      id: `usr_cust_${generateId()}`,
      email: data.email,
      phone: data.phone,
      name: data.name,
      role: 'CUSTOMER',
      isVerified: false,
    };
    return { user, accessToken: `mock_token_${generateId()}` };
  },

  registerVendor: async (data: RegisterVendorPayload): Promise<AuthResponse> => {
    await randomDelay(500, 800);
    const user: AuthUser = {
      id: `usr_vend_${generateId()}`,
      email: data.email,
      phone: data.phone,
      name: data.name,
      role: 'VENDOR',
      isVerified: false,
    };
    return { user, accessToken: `mock_token_${generateId()}` };
  },

  login: async (data: LoginPayload): Promise<AuthResponse> => {
    await randomDelay(400, 700);
    // Find user by email or phone
    const user = MOCK_USERS.find(
      (u) => u.email === data.identifier || u.phone === data.identifier,
    );
    if (!user) {
      throw { statusCode: 401, message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' };
    }
    // Mock: any password works in dev
    return { user, accessToken: `mock_token_${generateId()}` };
  },

  sendOtp: async (email: string): Promise<OtpResponse> => {
    await randomDelay(300, 600);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    OTP_STORE.set(email, otp);
    // In dev, log the OTP to console
    console.info(`[Mock OTP] ${email} → ${otp}`);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    return { message: 'OTP sent successfully', expiresAt };
  },

  verifyOtp: async (email: string, otp: string): Promise<AuthResponse> => {
    await randomDelay(400, 600);
    const stored = OTP_STORE.get(email);
    // In mock mode, accept '123456' as universal OTP or the stored one
    if (otp !== '123456' && otp !== stored) {
      throw { statusCode: 400, message: 'Invalid or expired OTP', code: 'INVALID_OTP' };
    }
    OTP_STORE.delete(email);
    const user = MOCK_USERS.find((u) => u.email === email) ?? {
      id: `usr_${generateId()}`,
      email,
      name: email.split('@')[0] ?? 'User',
      role: 'CUSTOMER' as const,
      isVerified: true,
    };
    return { user: { ...user, isVerified: true }, accessToken: `mock_token_${generateId()}` };
  },

  verifyAdminTotp: async (email: string, totp: string): Promise<AuthResponse> => {
    await randomDelay(400, 600);
    // Accept '000000' as universal admin TOTP in mock
    if (totp !== '000000' && totp.length !== 6) {
      throw { statusCode: 401, message: 'Invalid TOTP code', code: 'INVALID_TOTP' };
    }
    const admin = MOCK_USERS.find((u) => u.email === email && u.role === 'ADMIN');
    if (!admin) {
      throw { statusCode: 401, message: 'Admin not found', code: 'INVALID_CREDENTIALS' };
    }
    return { user: admin, accessToken: `mock_admin_token_${generateId()}` };
  },

  refreshToken: async (): Promise<AuthResponse> => {
    await randomDelay(200, 400);
    const user = MOCK_USERS[0]!;
    return { user, accessToken: `mock_token_${generateId()}` };
  },

  logout: async (): Promise<void> => {
    await randomDelay(200, 400);
  },
};

// ---------------------------------------------------------------------------
// Projects API
// ---------------------------------------------------------------------------

export interface CreateProjectPayload {
  title: string;
  spaceType: string;
  city: string;
  pincode: string;
  rooms: Room[];
  budgetMin: number;
  budgetMax: number;
  budgetFlexibility: string;
  timeline: string;
  priority: string;
  description?: string;
  path: string;
  aiTheme?: string;
  floorPlanPath?: string;
}

export interface UpdateProjectPayload extends Partial<CreateProjectPayload> {
  status?: string;
}

export const mockProjectApi = {
  getProjects: async (userId: string): Promise<Project[]> => {
    await randomDelay(400, 700);
    return MOCK_PROJECTS.filter((p) => p.customerId === userId);
  },

  getAllProjects: async (): Promise<Project[]> => {
    await randomDelay(400, 700);
    return MOCK_PROJECTS;
  },

  getProject: async (id: string): Promise<Project> => {
    await randomDelay(300, 600);
    const project = MOCK_PROJECTS.find((p) => p.id === id);
    if (!project) {
      throw { statusCode: 404, message: 'Project not found', code: 'NOT_FOUND' };
    }
    return project;
  },

  createProject: async (data: CreateProjectPayload): Promise<Project> => {
    await randomDelay(500, 800);
    const newProject: Project = {
      id: `proj_${generateId()}`,
      title: data.title,
      spaceType: data.spaceType as Project['spaceType'],
      city: data.city,
      pincode: data.pincode,
      rooms: data.rooms,
      budgetMin: data.budgetMin,
      budgetMax: data.budgetMax,
      budgetFlexibility: data.budgetFlexibility as Project['budgetFlexibility'],
      timeline: data.timeline as Project['timeline'],
      priority: data.priority as Project['priority'],
      status: 'DRAFT',
      description: data.description,
      path: data.path as Project['path'],
      aiTheme: data.aiTheme,
      floorPlanPath: data.floorPlanPath,
      customerId: 'usr_cust_001', // mock: current user
      bidsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    MOCK_PROJECTS.push(newProject);
    return newProject;
  },

  updateProject: async (id: string, data: UpdateProjectPayload): Promise<Project> => {
    await randomDelay(400, 600);
    const idx = MOCK_PROJECTS.findIndex((p) => p.id === id);
    if (idx === -1) {
      throw { statusCode: 404, message: 'Project not found', code: 'NOT_FOUND' };
    }
    const updated = {
      ...MOCK_PROJECTS[idx]!,
      ...data,
      updatedAt: new Date().toISOString(),
    } as Project;
    MOCK_PROJECTS[idx] = updated;
    return updated;
  },

  publishProject: async (id: string): Promise<Project> => {
    await randomDelay(500, 800);
    return mockProjectApi.updateProject(id, { status: 'BIDDING_OPEN' });
  },

  saveDraft: async (id: string, data: UpdateProjectPayload): Promise<Project> => {
    await randomDelay(300, 500);
    return mockProjectApi.updateProject(id, { ...data, status: 'DRAFT' });
  },
};

// ---------------------------------------------------------------------------
// Dashboard API
// ---------------------------------------------------------------------------

export const mockDashboardApi = {
  getStats: async (userId: string): Promise<DashboardStats> => {
    await randomDelay(300, 600);
    const userProjects = MOCK_PROJECTS.filter((p) => p.customerId === userId);
    const activeBids = userProjects.filter((p) => p.status === 'BIDDING_OPEN').length;
    const pendingApprovals = userProjects.filter((p) => p.status === 'VENDOR_SELECTED').length;
    const completedProjects = userProjects.filter((p) => p.status === 'COMPLETED');
    const totalSpent = completedProjects.reduce((sum, p) => sum + p.budgetMax, 0);

    return {
      totalProjects: userProjects.length,
      activeBids,
      pendingApprovals,
      totalSpent,
      projectsTrend: 20,
      bidsTrend: -5,
      approvalsTrend: 0,
      spentTrend: 15,
    };
  },

  getActivity: async (userId: string): Promise<ActivityEvent[]> => {
    await randomDelay(300, 500);
    const userProjectIds = MOCK_PROJECTS.filter((p) => p.customerId === userId).map((p) => p.id);
    return MOCK_ACTIVITY.filter((a) => userProjectIds.includes(a.projectId)).slice(0, 5);
  },
};

// ---------------------------------------------------------------------------
// Bidding & AI Design types (imported inline to avoid circular deps)
// ---------------------------------------------------------------------------

import type {
  Bid,
  AiDesign,
  VendorProfile,
  BiddingRoom,
  SubmitBidPayload,
} from '@/types/bidding.types';

// ---------------------------------------------------------------------------
// Mock Vendor Profiles (anonymized — name/businessName null during bidding)
// ---------------------------------------------------------------------------

const MOCK_VENDOR_PROFILES: VendorProfile[] = [
  {
    id: 'usr_vend_001',
    name: null, // revealed only after selection
    businessName: null,
    city: 'Bengaluru',
    categories: ['Full Home', 'Modular Kitchen', 'Living Room'],
    bio: '12 years of experience delivering premium residential interiors across Bengaluru. Specialise in contemporary and Scandinavian styles with a focus on functional elegance.',
    rating: 4.8,
    reviewCount: 47,
    completedProjects: 63,
    portfolioItems: [
      { id: 'p1', imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&q=80', caption: '3BHK Full Home — Koramangala', spaceType: 'Full Home' },
      { id: 'p2', imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80', caption: 'Modular Kitchen — Indiranagar', spaceType: 'Kitchen' },
      { id: 'p3', imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80', caption: 'Living Room — Whitefield', spaceType: 'Living Room' },
    ],
    isVerified: true,
    yearsExperience: 12,
    avgResponseHours: 4,
  },
  {
    id: 'usr_vend_002',
    name: null,
    businessName: null,
    city: 'Mumbai',
    categories: ['Bedroom', 'Living Room', 'Office'],
    bio: 'Award-winning interior studio with 8 years of experience. Known for luxury finishes and attention to detail. Completed 40+ projects across Mumbai and Pune.',
    rating: 4.6,
    reviewCount: 31,
    completedProjects: 41,
    portfolioItems: [
      { id: 'p4', imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80', caption: 'Master Bedroom — Bandra', spaceType: 'Bedroom' },
      { id: 'p5', imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80', caption: 'Living Room — Juhu', spaceType: 'Living Room' },
    ],
    isVerified: true,
    yearsExperience: 8,
    avgResponseHours: 6,
  },
];

// ---------------------------------------------------------------------------
// Mock Bids
// ---------------------------------------------------------------------------

const MOCK_BIDS: Bid[] = [
  {
    id: 'bid_001',
    projectId: 'proj_001',
    vendorId: 'usr_vend_001',
    anonymousLabel: 'Vendor A',
    quotePaise: 1850000 * 100,
    timelineWeeks: 10,
    materialLevel: 'PREMIUM',
    scopeAssumptions: 'Includes all rooms as per floor plan. Modular kitchen with Hettich fittings. False ceiling in living and master bedroom.',
    notes: 'We have completed 3 similar projects in Koramangala. Happy to share references.',
    status: 'PENDING',
    isShortlisted: false,
    submittedAt: '2025-01-16T09:00:00Z',
    updatedAt: '2025-01-16T09:00:00Z',
  },
  {
    id: 'bid_002',
    projectId: 'proj_001',
    vendorId: 'usr_vend_002',
    anonymousLabel: 'Vendor B',
    quotePaise: 2200000 * 100,
    timelineWeeks: 8,
    materialLevel: 'LUXURY',
    scopeAssumptions: 'Premium Italian marble in bathrooms. Custom wardrobes with soft-close mechanisms. Smart home integration included.',
    notes: 'Specialise in luxury finishes. Portfolio available on request.',
    status: 'SHORTLISTED',
    isShortlisted: true,
    submittedAt: '2025-01-17T11:30:00Z',
    updatedAt: '2025-01-19T14:00:00Z',
  },
  {
    id: 'bid_003',
    projectId: 'proj_001',
    vendorId: 'usr_vend_001',
    anonymousLabel: 'Vendor C',
    quotePaise: 1650000 * 100,
    timelineWeeks: 12,
    materialLevel: 'STANDARD',
    scopeAssumptions: 'Standard grade materials throughout. Modular kitchen with local brand fittings. Basic false ceiling.',
    notes: 'Best value option. Can start immediately.',
    status: 'PENDING',
    isShortlisted: false,
    submittedAt: '2025-01-18T08:00:00Z',
    updatedAt: '2025-01-18T08:00:00Z',
  },
  {
    id: 'bid_004',
    projectId: 'proj_001',
    vendorId: 'usr_vend_002',
    anonymousLabel: 'Vendor D',
    quotePaise: 1950000 * 100,
    timelineWeeks: 9,
    materialLevel: 'PREMIUM',
    scopeAssumptions: 'Mid-premium materials. Hafele fittings for kitchen. Gypsum false ceiling with cove lighting.',
    notes: 'Flexible on timeline. Can accommodate specific material preferences.',
    status: 'PENDING',
    isShortlisted: false,
    submittedAt: '2025-01-19T10:00:00Z',
    updatedAt: '2025-01-19T10:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Mock AI Designs
// ---------------------------------------------------------------------------

const MOCK_AI_DESIGNS: AiDesign[] = [
  {
    id: 'ai_001',
    projectId: 'proj_001',
    theme: 'Contemporary minimal with warm wood accents and natural light',
    filters: { style: 'MODERN', color: 'WARM', material: 'WOOD', lighting: 'NATURAL' },
    status: 'COMPLETED',
    progress: 100,
    imageUrls: [
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=85',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=85',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=85',
    ],
    selectedImageUrl: null,
    isLocked: false,
    createdAt: '2025-01-15T11:00:00Z',
    updatedAt: '2025-01-15T11:45:00Z',
  },
];

// ---------------------------------------------------------------------------
// Bidding Mock API
// ---------------------------------------------------------------------------

export interface SelectVendorPayload {
  projectId: string;
  bidId: string;
}

export const mockBiddingApi = {
  getBiddingRoom: async (projectId: string): Promise<BiddingRoom> => {
    await randomDelay(400, 700);
    const bids = MOCK_BIDS.filter((b) => b.projectId === projectId);
    const project = MOCK_PROJECTS.find((p) => p.id === projectId);
    if (!project) throw { statusCode: 404, message: 'Project not found' };
    const expiresAt = new Date(
      new Date(project.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000,
    ).toISOString();
    return {
      projectId,
      bids,
      expiresAt,
      totalBids: bids.length,
      isExpired: new Date(expiresAt) < new Date(),
    };
  },

  getVendorProfile: async (vendorId: string): Promise<VendorProfile> => {
    await randomDelay(300, 600);
    const profile = MOCK_VENDOR_PROFILES.find((v) => v.id === vendorId);
    if (!profile) throw { statusCode: 404, message: 'Vendor not found' };
    // CRITICAL: never expose name/businessName during bidding phase
    return { ...profile, name: null, businessName: null };
  },

  getVendorProfileRevealed: async (vendorId: string): Promise<VendorProfile> => {
    await randomDelay(300, 600);
    const profile = MOCK_VENDOR_PROFILES.find((v) => v.id === vendorId);
    if (!profile) throw { statusCode: 404, message: 'Vendor not found' };
    // Reveal identity after selection
    return {
      ...profile,
      name: profile.id === 'usr_vend_001' ? 'Arjun Kapoor' : 'Sneha Patel',
      businessName: profile.id === 'usr_vend_001' ? 'Arjun Interiors Pvt. Ltd.' : 'DesignCraft Studio',
    };
  },

  shortlistBid: async (bidId: string): Promise<Bid> => {
    await randomDelay(300, 500);
    const bid = MOCK_BIDS.find((b) => b.id === bidId);
    if (!bid) throw { statusCode: 404, message: 'Bid not found' };
    bid.isShortlisted = !bid.isShortlisted;
    bid.status = bid.isShortlisted ? 'SHORTLISTED' : 'PENDING';
    return { ...bid };
  },

  selectVendor: async ({ projectId, bidId }: SelectVendorPayload): Promise<{ bid: Bid; project: Project }> => {
    await randomDelay(600, 900);
    const bid = MOCK_BIDS.find((b) => b.id === bidId);
    if (!bid) throw { statusCode: 404, message: 'Bid not found' };
    const projectIdx = MOCK_PROJECTS.findIndex((p) => p.id === projectId);
    if (projectIdx === -1) throw { statusCode: 404, message: 'Project not found' };
    bid.status = 'SELECTED';
    const updatedProject = {
      ...MOCK_PROJECTS[projectIdx]!,
      status: 'VENDOR_SELECTED' as const,
      selectedVendorId: bid.vendorId,
      updatedAt: new Date().toISOString(),
    };
    MOCK_PROJECTS[projectIdx] = updatedProject;
    return { bid: { ...bid }, project: updatedProject };
  },

  submitBid: async (payload: SubmitBidPayload): Promise<Bid> => {
    await randomDelay(500, 800);
    const existingBid = MOCK_BIDS.find(
      (b) => b.projectId === payload.projectId && b.vendorId === 'usr_vend_001',
    );
    if (existingBid) throw { statusCode: 409, message: 'You have already submitted a bid for this project', code: 'DUPLICATE_BID' };
    const labels = ['Vendor A', 'Vendor B', 'Vendor C', 'Vendor D', 'Vendor E', 'Vendor F', 'Vendor G'];
    const existingCount = MOCK_BIDS.filter((b) => b.projectId === payload.projectId).length;
    const newBid: Bid = {
      id: `bid_${generateId()}`,
      projectId: payload.projectId,
      vendorId: 'usr_vend_001',
      anonymousLabel: labels[existingCount] ?? `Vendor ${existingCount + 1}`,
      quotePaise: payload.quotePaise,
      timelineWeeks: payload.timelineWeeks,
      materialLevel: payload.materialLevel,
      scopeAssumptions: payload.scopeAssumptions,
      notes: payload.notes,
      status: 'PENDING',
      isShortlisted: false,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    MOCK_BIDS.push(newBid);
    return newBid;
  },

  getMyBids: async (vendorId: string): Promise<Bid[]> => {
    await randomDelay(400, 600);
    return MOCK_BIDS.filter((b) => b.vendorId === vendorId);
  },

  withdrawBid: async (bidId: string): Promise<Bid> => {
    await randomDelay(400, 600);
    const bid = MOCK_BIDS.find((b) => b.id === bidId);
    if (!bid) throw { statusCode: 404, message: 'Bid not found' };
    if (bid.status === 'SELECTED') throw { statusCode: 400, message: 'Cannot withdraw a selected bid', code: 'BID_ALREADY_SELECTED' };
    bid.status = 'WITHDRAWN';
    return { ...bid };
  },
};

// ---------------------------------------------------------------------------
// AI Design Mock API
// ---------------------------------------------------------------------------

export const mockAiDesignApi = {
  getDesigns: async (projectId: string): Promise<AiDesign[]> => {
    await randomDelay(300, 500);
    return MOCK_AI_DESIGNS.filter((d) => d.projectId === projectId);
  },

  generateDesigns: async (projectId: string, theme: string, filters: AiDesign['filters']): Promise<AiDesign> => {
    await randomDelay(400, 600);
    const newDesign: AiDesign = {
      id: `ai_${generateId()}`,
      projectId,
      theme,
      filters,
      status: 'GENERATING',
      progress: 0,
      imageUrls: [],
      selectedImageUrl: null,
      isLocked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    MOCK_AI_DESIGNS.push(newDesign);
    return newDesign;
  },

  pollGenerationProgress: async (designId: string): Promise<AiDesign> => {
    await randomDelay(800, 1200);
    const design = MOCK_AI_DESIGNS.find((d) => d.id === designId);
    if (!design) throw { statusCode: 404, message: 'Design not found' };
    // Simulate progress
    design.progress = Math.min(100, design.progress + Math.floor(Math.random() * 30 + 20));
    if (design.progress >= 100) {
      design.status = 'COMPLETED';
      design.progress = 100;
      design.imageUrls = [
        'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=85',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=85',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=85',
      ];
    }
    design.updatedAt = new Date().toISOString();
    return { ...design };
  },

  selectDesign: async (designId: string, imageUrl: string): Promise<AiDesign> => {
    await randomDelay(300, 500);
    const design = MOCK_AI_DESIGNS.find((d) => d.id === designId);
    if (!design) throw { statusCode: 404, message: 'Design not found' };
    design.selectedImageUrl = imageUrl;
    return { ...design };
  },

  lockDesign: async (designId: string): Promise<AiDesign> => {
    await randomDelay(400, 600);
    const design = MOCK_AI_DESIGNS.find((d) => d.id === designId);
    if (!design) throw { statusCode: 404, message: 'Design not found' };
    if (!design.selectedImageUrl) throw { statusCode: 400, message: 'Please select a design before locking', code: 'NO_DESIGN_SELECTED' };
    design.isLocked = true;
    design.updatedAt = new Date().toISOString();
    return { ...design };
  },
};

export type { Bid, AiDesign, VendorProfile, BiddingRoom, SubmitBidPayload };

// ---------------------------------------------------------------------------
// Sprint 5 — Negotiation + Milestone Mock Data & APIs
// ---------------------------------------------------------------------------

import type {
  NegotiationThread,
  NegotiationMessage,
  NegotiationProposal,
  Milestone,
  MilestoneEvidence,
  Dispute,
  DisputeReason,
} from '@/types/negotiation.types';

// ---------------------------------------------------------------------------
// Mock Negotiation Threads
// ---------------------------------------------------------------------------

const MOCK_NEGOTIATIONS: NegotiationThread[] = [
  {
    id: 'neg_001',
    projectId: 'proj_002',
    customerId: 'usr_cust_001',
    vendorId: 'usr_vend_001',
    vendorName: 'Arjun Kapoor',
    vendorBusinessName: 'Arjun Interiors Pvt. Ltd.',
    status: 'CONFIRMED',
    customerConfirmed: true,
    vendorConfirmed: true,
    messages: [
      {
        id: 'msg_001',
        threadId: 'neg_001',
        senderId: 'usr_vend_001',
        senderRole: 'VENDOR',
        content: 'Thank you for selecting us! We are excited to work on your kitchen. Can we schedule a site visit this week?',
        flagged: false,
        masked: false,
        createdAt: '2025-01-18T12:00:00Z',
      },
      {
        id: 'msg_002',
        threadId: 'neg_001',
        senderId: 'usr_cust_001',
        senderRole: 'CUSTOMER',
        content: 'Great! Saturday works for me. Can you confirm the timeline of 6 weeks?',
        flagged: false,
        masked: false,
        createdAt: '2025-01-18T12:30:00Z',
      },
      {
        id: 'msg_003',
        threadId: 'neg_001',
        senderId: 'usr_vend_001',
        senderRole: 'VENDOR',
        content: 'Yes, 6 weeks is confirmed. We will start with demolition in week 1. Call me on [PHONE REMOVED] to discuss further.',
        flagged: true,
        masked: true,
        createdAt: '2025-01-18T13:00:00Z',
      },
      {
        id: 'msg_004',
        threadId: 'neg_001',
        senderId: 'usr_cust_001',
        senderRole: 'CUSTOMER',
        content: 'Sounds good. I am happy with the revised proposal. Let us proceed to milestones.',
        flagged: false,
        masked: false,
        createdAt: '2025-01-18T14:00:00Z',
      },
    ],
    proposals: [
      {
        id: 'prop_001',
        threadId: 'neg_001',
        vendorId: 'usr_vend_001',
        quotePaise: 55000000,
        timelineWeeks: 6,
        materialLevel: 'PREMIUM',
        notes: 'Revised quote includes Hettich fittings upgrade as requested.',
        status: 'ACCEPTED',
        createdAt: '2025-01-18T11:00:00Z',
      },
    ],
    createdAt: '2025-01-18T11:00:00Z',
    updatedAt: '2025-01-18T14:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Mock Milestones
// ---------------------------------------------------------------------------

const MOCK_MILESTONES: Milestone[] = [
  {
    id: 'ms_001',
    projectId: 'proj_003',
    title: 'Demolition & Civil Work',
    description: 'Remove existing fixtures, false ceiling, and flooring. Complete civil modifications.',
    percentageOfTotal: 20,
    amountPaise: 64000000,
    status: 'RELEASED',
    escrowStatus: 'RELEASED',
    order: 1,
    completionNotes: 'All demolition completed. Civil work done as per plan.',
    evidence: [
      {
        id: 'ev_001',
        milestoneId: 'ms_001',
        fileUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80',
        fileName: 'demolition-complete.jpg',
        fileType: 'image/jpeg',
        uploadedAt: '2025-01-10T10:00:00Z',
      },
    ],
    startedAt: '2024-12-05T09:00:00Z',
    submittedAt: '2024-12-12T17:00:00Z',
    approvedAt: '2024-12-13T10:00:00Z',
    createdAt: '2024-12-01T08:00:00Z',
    updatedAt: '2024-12-13T10:00:00Z',
  },
  {
    id: 'ms_002',
    projectId: 'proj_003',
    title: 'Electrical & Plumbing',
    description: 'Complete all electrical wiring, switch points, and plumbing work.',
    percentageOfTotal: 25,
    amountPaise: 80000000,
    status: 'SUBMITTED',
    escrowStatus: 'FUNDED',
    order: 2,
    completionNotes: 'Electrical and plumbing work completed. Inspection pending.',
    evidence: [
      {
        id: 'ev_002',
        milestoneId: 'ms_002',
        fileUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&q=80',
        fileName: 'electrical-work.jpg',
        fileType: 'image/jpeg',
        uploadedAt: '2025-01-20T14:00:00Z',
      },
      {
        id: 'ev_003',
        milestoneId: 'ms_002',
        fileUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
        fileName: 'plumbing-done.jpg',
        fileType: 'image/jpeg',
        uploadedAt: '2025-01-20T14:05:00Z',
      },
    ],
    startedAt: '2024-12-14T09:00:00Z',
    submittedAt: '2025-01-20T17:00:00Z',
    createdAt: '2024-12-01T08:00:00Z',
    updatedAt: '2025-01-20T17:00:00Z',
  },
  {
    id: 'ms_003',
    projectId: 'proj_003',
    title: 'False Ceiling & Flooring',
    description: 'Install gypsum false ceiling with cove lighting and lay vitrified tiles.',
    percentageOfTotal: 30,
    amountPaise: 96000000,
    status: 'FUNDED',
    escrowStatus: 'FUNDED',
    order: 3,
    evidence: [],
    createdAt: '2024-12-01T08:00:00Z',
    updatedAt: '2025-01-22T10:00:00Z',
  },
  {
    id: 'ms_004',
    projectId: 'proj_003',
    title: 'Furniture & Final Finishing',
    description: 'Install modular furniture, paint walls, and complete final finishing.',
    percentageOfTotal: 25,
    amountPaise: 80000000,
    status: 'PENDING_FUNDING',
    escrowStatus: 'PENDING',
    order: 4,
    evidence: [],
    createdAt: '2024-12-01T08:00:00Z',
    updatedAt: '2024-12-01T08:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Mock Disputes
// ---------------------------------------------------------------------------

const MOCK_DISPUTES: Dispute[] = [
  {
    id: 'dis_001',
    milestoneId: 'ms_002',
    projectId: 'proj_007',
    raisedBy: 'CUSTOMER',
    reason: 'INCOMPLETE_WORK',
    description: 'Electrical work is incomplete. Only 60% of switch points installed but vendor claims 100%.',
    status: 'ADMIN_REVIEW',
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-12T14:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Negotiation Mock API
// ---------------------------------------------------------------------------

export interface SendMessagePayload {
  threadId: string;
  content: string;
}

export interface SubmitProposalPayload {
  threadId: string;
  quotePaise: number;
  timelineWeeks: number;
  materialLevel: 'ECONOMY' | 'STANDARD' | 'PREMIUM' | 'LUXURY';
  notes: string;
}

export const mockNegotiationApi = {
  getThread: async (projectId: string): Promise<NegotiationThread | null> => {
    await randomDelay(300, 600);
    return MOCK_NEGOTIATIONS.find((n) => n.projectId === projectId) ?? null;
  },

  sendMessage: async (payload: SendMessagePayload): Promise<NegotiationMessage> => {
    await randomDelay(300, 500);
    // Simulate contact masking
    const phoneRegex = /[6-9]\d{9}/g;
    const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
    let content = payload.content;
    let flagged = false;
    if (phoneRegex.test(content)) {
      content = content.replace(phoneRegex, '[PHONE REMOVED]');
      flagged = true;
    }
    if (emailRegex.test(content)) {
      content = content.replace(emailRegex, '[EMAIL REMOVED]');
      flagged = true;
    }
    const msg: NegotiationMessage = {
      id: `msg_${generateId()}`,
      threadId: payload.threadId,
      senderId: 'usr_cust_001',
      senderRole: 'CUSTOMER',
      content,
      flagged,
      masked: flagged,
      createdAt: new Date().toISOString(),
    };
    const thread = MOCK_NEGOTIATIONS.find((n) => n.id === payload.threadId);
    if (thread) thread.messages.push(msg);
    return msg;
  },

  submitProposal: async (payload: SubmitProposalPayload): Promise<NegotiationProposal> => {
    await randomDelay(400, 700);
    const proposal: NegotiationProposal = {
      id: `prop_${generateId()}`,
      threadId: payload.threadId,
      vendorId: 'usr_vend_001',
      quotePaise: payload.quotePaise,
      timelineWeeks: payload.timelineWeeks,
      materialLevel: payload.materialLevel,
      notes: payload.notes,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    const thread = MOCK_NEGOTIATIONS.find((n) => n.id === payload.threadId);
    if (thread) thread.proposals.push(proposal);
    return proposal;
  },

  respondToProposal: async (
    proposalId: string,
    action: 'ACCEPTED' | 'COUNTERED' | 'DECLINED',
  ): Promise<NegotiationProposal> => {
    await randomDelay(300, 500);
    for (const thread of MOCK_NEGOTIATIONS) {
      const proposal = thread.proposals.find((p) => p.id === proposalId);
      if (proposal) {
        proposal.status = action;
        return { ...proposal };
      }
    }
    throw { statusCode: 404, message: 'Proposal not found' };
  },

  confirmNegotiation: async (threadId: string, role: 'CUSTOMER' | 'VENDOR'): Promise<NegotiationThread> => {
    await randomDelay(400, 600);
    const thread = MOCK_NEGOTIATIONS.find((n) => n.id === threadId);
    if (!thread) throw { statusCode: 404, message: 'Thread not found' };
    if (role === 'CUSTOMER') thread.customerConfirmed = true;
    if (role === 'VENDOR') thread.vendorConfirmed = true;
    if (thread.customerConfirmed && thread.vendorConfirmed) {
      thread.status = 'CONFIRMED';
    }
    return { ...thread };
  },
};

// ---------------------------------------------------------------------------
// Milestone Mock API
// ---------------------------------------------------------------------------

export interface CreateMilestonePayload {
  projectId: string;
  title: string;
  description: string;
  percentageOfTotal: number;
}

export interface SubmitMilestonePayload {
  milestoneId: string;
  completionNotes: string;
  evidenceIds: string[];
}

export const mockMilestoneApi = {
  getMilestones: async (projectId: string): Promise<Milestone[]> => {
    await randomDelay(300, 600);
    return MOCK_MILESTONES.filter((m) => m.projectId === projectId);
  },

  getMilestone: async (milestoneId: string): Promise<Milestone> => {
    await randomDelay(200, 400);
    const m = MOCK_MILESTONES.find((m) => m.id === milestoneId);
    if (!m) throw { statusCode: 404, message: 'Milestone not found' };
    return { ...m };
  },

  createMilestone: async (payload: CreateMilestonePayload): Promise<Milestone> => {
    await randomDelay(400, 600);
    const existing = MOCK_MILESTONES.filter((m) => m.projectId === payload.projectId);
    const totalPct = existing.reduce((s, m) => s + m.percentageOfTotal, 0);
    if (totalPct + payload.percentageOfTotal > 100) {
      throw { statusCode: 400, message: 'Total milestone percentage cannot exceed 100%', code: 'PERCENTAGE_EXCEEDED' };
    }
    const newMs: Milestone = {
      id: `ms_${generateId()}`,
      projectId: payload.projectId,
      title: payload.title,
      description: payload.description,
      percentageOfTotal: payload.percentageOfTotal,
      amountPaise: 0, // calculated from BOQ
      status: 'DRAFT',
      escrowStatus: 'PENDING',
      order: existing.length + 1,
      evidence: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    MOCK_MILESTONES.push(newMs);
    return newMs;
  },

  lockMilestones: async (projectId: string): Promise<Milestone[]> => {
    await randomDelay(500, 800);
    const milestones = MOCK_MILESTONES.filter((m) => m.projectId === projectId);
    const total = milestones.reduce((s, m) => s + m.percentageOfTotal, 0);
    if (total !== 100) {
      throw { statusCode: 400, message: `Milestone percentages must total 100%. Current total: ${total}%`, code: 'INVALID_PERCENTAGE_TOTAL' };
    }
    milestones.forEach((m) => { m.status = 'PENDING_FUNDING'; });
    return milestones.map((m) => ({ ...m }));
  },

  uploadEvidence: async (milestoneId: string, fileName: string): Promise<MilestoneEvidence> => {
    await randomDelay(500, 900);
    const evidence: MilestoneEvidence = {
      id: `ev_${generateId()}`,
      milestoneId,
      fileUrl: `https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80`,
      fileName,
      fileType: 'image/jpeg',
      uploadedAt: new Date().toISOString(),
    };
    const ms = MOCK_MILESTONES.find((m) => m.id === milestoneId);
    if (ms) ms.evidence.push(evidence);
    return evidence;
  },

  submitMilestone: async (payload: SubmitMilestonePayload): Promise<Milestone> => {
    await randomDelay(400, 700);
    const ms = MOCK_MILESTONES.find((m) => m.id === payload.milestoneId);
    if (!ms) throw { statusCode: 404, message: 'Milestone not found' };
    if (ms.escrowStatus !== 'FUNDED') {
      throw { statusCode: 400, message: 'Milestone must be funded before submitting', code: 'MILESTONE_NOT_FUNDED' };
    }
    ms.status = 'SUBMITTED';
    ms.completionNotes = payload.completionNotes;
    ms.submittedAt = new Date().toISOString();
    ms.updatedAt = new Date().toISOString();
    return { ...ms };
  },

  approveMilestone: async (milestoneId: string): Promise<Milestone> => {
    await randomDelay(500, 800);
    const ms = MOCK_MILESTONES.find((m) => m.id === milestoneId);
    if (!ms) throw { statusCode: 404, message: 'Milestone not found' };
    ms.status = 'RELEASED';
    ms.escrowStatus = 'RELEASED';
    ms.approvedAt = new Date().toISOString();
    ms.updatedAt = new Date().toISOString();
    return { ...ms };
  },

  requestChanges: async (milestoneId: string, _notes: string): Promise<Milestone> => {
    await randomDelay(300, 500);
    const ms = MOCK_MILESTONES.find((m) => m.id === milestoneId);
    if (!ms) throw { statusCode: 404, message: 'Milestone not found' };
    ms.status = 'CHANGES_REQUESTED';
    ms.updatedAt = new Date().toISOString();
    return { ...ms };
  },

  raiseDispute: async (
    milestoneId: string,
    reason: DisputeReason,
    description: string,
  ): Promise<Dispute> => {
    await randomDelay(400, 700);
    const ms = MOCK_MILESTONES.find((m) => m.id === milestoneId);
    if (!ms) throw { statusCode: 404, message: 'Milestone not found' };
    ms.status = 'DISPUTED';
    ms.escrowStatus = 'HELD';
    ms.updatedAt = new Date().toISOString();
    const dispute: Dispute = {
      id: `dis_${generateId()}`,
      milestoneId,
      projectId: ms.projectId,
      raisedBy: 'CUSTOMER',
      reason,
      description,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    MOCK_DISPUTES.push(dispute);
    return dispute;
  },
};

export type {
  NegotiationThread,
  NegotiationMessage,
  NegotiationProposal,
  Milestone,
  MilestoneEvidence,
  Dispute,
  DisputeReason,
};

// ---------------------------------------------------------------------------
// Sprint 6 — BOQ + Payments Mock Data & APIs
// ---------------------------------------------------------------------------

import type { Boq, BoqItem, BoqItemUnit, Variation, VariationType, PaymentHistoryItem } from '@/types/boq.types';

// ---------------------------------------------------------------------------
// Mock BOQs
// ---------------------------------------------------------------------------

const MOCK_BOQS: Boq[] = [
  {
    id: 'boq_001',
    projectId: 'proj_003',
    vendorId: 'usr_vend_001',
    status: 'LOCKED',
    items: [
      { id: 'item_001', boqId: 'boq_001', room: 'Open Office', category: 'FALSE_CEILING', description: 'Gypsum false ceiling with cove lighting', material: 'Gypsum Board 12.5mm', brand: 'Saint-Gobain', quantity: 1200, unit: 'sqft', ratePaise: 8500, amountPaise: 10200000, order: 1 },
      { id: 'item_002', boqId: 'boq_001', room: 'Open Office', category: 'FLOORING', description: 'Vitrified tiles 600×600mm', material: 'Vitrified Tile', brand: 'Kajaria', quantity: 1200, unit: 'sqft', ratePaise: 12000, amountPaise: 14400000, order: 2 },
      { id: 'item_003', boqId: 'boq_001', room: 'Conference Room', category: 'PARTITION', description: 'Glass partition with aluminium frame', material: 'Toughened Glass 12mm', brand: 'Saint-Gobain', quantity: 180, unit: 'sqft', ratePaise: 45000, amountPaise: 8100000, order: 3 },
      { id: 'item_004', boqId: 'boq_001', room: 'Conference Room', category: 'FURNITURE', description: 'Conference table 12-seater', material: 'Engineered Wood + Veneer', brand: 'Godrej', quantity: 1, unit: 'nos', ratePaise: 18500000, amountPaise: 18500000, order: 4 },
    ],
    versions: [
      { id: 'ver_001', boqId: 'boq_001', versionNumber: 1, snapshotAt: '2024-12-10T10:00:00Z', totalAmountPaise: 51200000, reason: 'Initial submission' },
      { id: 'ver_002', boqId: 'boq_001', versionNumber: 2, snapshotAt: '2024-12-12T14:00:00Z', totalAmountPaise: 51200000, reason: 'Approved and locked' },
    ],
    variations: [],
    grandTotalPaise: 51200000,
    submittedAt: '2024-12-10T10:00:00Z',
    approvedAt: '2024-12-12T14:00:00Z',
    lockedAt: '2024-12-12T14:00:00Z',
    createdAt: '2024-12-08T09:00:00Z',
    updatedAt: '2024-12-12T14:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Mock Payment History
// ---------------------------------------------------------------------------

const MOCK_PAYMENTS: PaymentHistoryItem[] = [
  { id: 'pay_001', projectId: 'proj_003', milestoneId: 'ms_001', milestoneTitle: 'Demolition & Civil Work', amountPaise: 64000000, type: 'ESCROW_FUNDED', status: 'FUNDED', razorpayPaymentId: 'pay_mock_001', createdAt: '2024-12-05T08:00:00Z' },
  { id: 'pay_002', projectId: 'proj_003', milestoneId: 'ms_001', milestoneTitle: 'Demolition & Civil Work', amountPaise: 64000000, type: 'ESCROW_RELEASED', status: 'FUNDED', razorpayPaymentId: 'pay_mock_001', createdAt: '2024-12-13T10:00:00Z' },
  { id: 'pay_003', projectId: 'proj_003', milestoneId: 'ms_002', milestoneTitle: 'Electrical & Plumbing', amountPaise: 80000000, type: 'ESCROW_FUNDED', status: 'FUNDED', razorpayPaymentId: 'pay_mock_002', createdAt: '2024-12-14T09:00:00Z' },
];

// ---------------------------------------------------------------------------
// BOQ Mock API
// ---------------------------------------------------------------------------

export interface AddBoqItemPayload {
  boqId: string;
  room: string;
  category: string;
  description: string;
  material: string;
  brand: string;
  quantity: number;
  unit: BoqItemUnit;
  ratePaise: number;
  milestoneId?: string;
  notes?: string;
}

export interface UpdateBoqItemPayload {
  itemId: string;
  boqId: string;
  quantity?: number;
  ratePaise?: number;
  description?: string;
  material?: string;
  brand?: string;
}

export interface RaiseVariationPayload {
  boqId: string;
  type: VariationType;
  reason: string;
  affectedItems: {
    itemId: string;
    description: string;
    oldRatePaise: number;
    newRatePaise: number;
    oldQuantity: number;
    newQuantity: number;
  }[];
}

function recalcBoqTotal(boq: Boq): void {
  boq.grandTotalPaise = boq.items.reduce((s, i) => s + i.amountPaise, 0);
  boq.updatedAt = new Date().toISOString();
}

export const mockBoqApi = {
  getBoq: async (projectId: string): Promise<Boq | null> => {
    await randomDelay(300, 600);
    return MOCK_BOQS.find((b) => b.projectId === projectId) ?? null;
  },

  createBoq: async (projectId: string): Promise<Boq> => {
    await randomDelay(400, 700);
    const existing = MOCK_BOQS.find((b) => b.projectId === projectId);
    if (existing) return existing;
    const newBoq: Boq = {
      id: `boq_${generateId()}`,
      projectId,
      vendorId: 'usr_vend_001',
      status: 'DRAFT',
      items: [],
      versions: [],
      variations: [],
      grandTotalPaise: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    MOCK_BOQS.push(newBoq);
    return newBoq;
  },

  addItem: async (payload: AddBoqItemPayload): Promise<BoqItem> => {
    await randomDelay(300, 500);
    const boq = MOCK_BOQS.find((b) => b.id === payload.boqId);
    if (!boq) throw { statusCode: 404, message: 'BOQ not found' };
    if (boq.status === 'LOCKED') throw { statusCode: 400, message: 'Cannot edit a locked BOQ', code: 'BOQ_LOCKED' };
    const item: BoqItem = {
      id: `item_${generateId()}`,
      boqId: payload.boqId,
      room: payload.room,
      category: payload.category,
      description: payload.description,
      material: payload.material,
      brand: payload.brand,
      quantity: payload.quantity,
      unit: payload.unit,
      ratePaise: payload.ratePaise,
      amountPaise: Math.round(payload.quantity * payload.ratePaise),
      milestoneId: payload.milestoneId,
      notes: payload.notes,
      order: boq.items.length + 1,
    };
    boq.items.push(item);
    recalcBoqTotal(boq);
    return item;
  },

  updateItem: async (payload: UpdateBoqItemPayload): Promise<BoqItem> => {
    await randomDelay(200, 400);
    const boq = MOCK_BOQS.find((b) => b.id === payload.boqId);
    if (!boq) throw { statusCode: 404, message: 'BOQ not found' };
    if (boq.status === 'LOCKED') throw { statusCode: 400, message: 'Cannot edit a locked BOQ', code: 'BOQ_LOCKED' };
    const idx = boq.items.findIndex((i) => i.id === payload.itemId);
    if (idx === -1) throw { statusCode: 404, message: 'Item not found' };
    const item = boq.items[idx]!;
    const updated: BoqItem = {
      ...item,
      ...(payload.quantity !== undefined ? { quantity: payload.quantity } : {}),
      ...(payload.ratePaise !== undefined ? { ratePaise: payload.ratePaise } : {}),
      ...(payload.description !== undefined ? { description: payload.description } : {}),
      ...(payload.material !== undefined ? { material: payload.material } : {}),
      ...(payload.brand !== undefined ? { brand: payload.brand } : {}),
    };
    updated.amountPaise = Math.round(updated.quantity * updated.ratePaise);
    boq.items[idx] = updated;
    recalcBoqTotal(boq);
    return updated;
  },

  removeItem: async (boqId: string, itemId: string): Promise<void> => {
    await randomDelay(200, 400);
    const boq = MOCK_BOQS.find((b) => b.id === boqId);
    if (!boq) throw { statusCode: 404, message: 'BOQ not found' };
    if (boq.status === 'LOCKED') throw { statusCode: 400, message: 'Cannot edit a locked BOQ', code: 'BOQ_LOCKED' };
    boq.items = boq.items.filter((i) => i.id !== itemId);
    recalcBoqTotal(boq);
  },

  submitBoq: async (boqId: string): Promise<Boq> => {
    await randomDelay(400, 700);
    const boq = MOCK_BOQS.find((b) => b.id === boqId);
    if (!boq) throw { statusCode: 404, message: 'BOQ not found' };
    if (boq.items.length === 0) throw { statusCode: 400, message: 'BOQ must have at least one item', code: 'BOQ_EMPTY' };
    boq.status = 'SUBMITTED';
    boq.submittedAt = new Date().toISOString();
    boq.versions.push({
      id: `ver_${generateId()}`,
      boqId,
      versionNumber: boq.versions.length + 1,
      snapshotAt: new Date().toISOString(),
      totalAmountPaise: boq.grandTotalPaise,
      reason: 'Submitted for customer review',
    });
    recalcBoqTotal(boq);
    return { ...boq };
  },

  approveBoq: async (boqId: string): Promise<Boq> => {
    await randomDelay(400, 600);
    const boq = MOCK_BOQS.find((b) => b.id === boqId);
    if (!boq) throw { statusCode: 404, message: 'BOQ not found' };
    boq.status = 'APPROVED';
    boq.approvedAt = new Date().toISOString();
    recalcBoqTotal(boq);
    return { ...boq };
  },

  lockBoq: async (boqId: string): Promise<Boq> => {
    await randomDelay(400, 600);
    const boq = MOCK_BOQS.find((b) => b.id === boqId);
    if (!boq) throw { statusCode: 404, message: 'BOQ not found' };
    boq.status = 'LOCKED';
    boq.lockedAt = new Date().toISOString();
    recalcBoqTotal(boq);
    return { ...boq };
  },

  requestChanges: async (boqId: string): Promise<Boq> => {
    await randomDelay(300, 500);
    const boq = MOCK_BOQS.find((b) => b.id === boqId);
    if (!boq) throw { statusCode: 404, message: 'BOQ not found' };
    boq.status = 'CHANGES_REQUESTED';
    recalcBoqTotal(boq);
    return { ...boq };
  },

  raiseVariation: async (payload: RaiseVariationPayload): Promise<Variation> => {
    await randomDelay(500, 800);
    const boq = MOCK_BOQS.find((b) => b.id === payload.boqId);
    if (!boq) throw { statusCode: 404, message: 'BOQ not found' };
    const delta = payload.affectedItems.reduce((s, i) => {
      const oldAmt = i.oldRatePaise * i.oldQuantity;
      const newAmt = i.newRatePaise * i.newQuantity;
      return s + (newAmt - oldAmt);
    }, 0);
    const variation: Variation = {
      id: `var_${generateId()}`,
      boqId: payload.boqId,
      type: payload.type,
      reason: payload.reason,
      affectedItems: payload.affectedItems,
      deltaAmountPaise: delta,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    boq.variations.push(variation);
    return variation;
  },

  approveVariation: async (boqId: string, variationId: string): Promise<Variation> => {
    await randomDelay(400, 600);
    const boq = MOCK_BOQS.find((b) => b.id === boqId);
    if (!boq) throw { statusCode: 404, message: 'BOQ not found' };
    const variation = boq.variations.find((v) => v.id === variationId);
    if (!variation) throw { statusCode: 404, message: 'Variation not found' };
    variation.status = 'APPROVED';
    variation.updatedAt = new Date().toISOString();
    // Apply changes to BOQ items
    for (const change of variation.affectedItems) {
      const item = boq.items.find((i) => i.id === change.itemId);
      if (item) {
        item.ratePaise = change.newRatePaise;
        item.quantity = change.newQuantity;
        item.amountPaise = Math.round(change.newRatePaise * change.newQuantity);
      }
    }
    recalcBoqTotal(boq);
    return variation;
  },

  rejectVariation: async (boqId: string, variationId: string): Promise<Variation> => {
    await randomDelay(300, 500);
    const boq = MOCK_BOQS.find((b) => b.id === boqId);
    if (!boq) throw { statusCode: 404, message: 'BOQ not found' };
    const variation = boq.variations.find((v) => v.id === variationId);
    if (!variation) throw { statusCode: 404, message: 'Variation not found' };
    variation.status = 'REJECTED';
    variation.updatedAt = new Date().toISOString();
    return variation;
  },
};

// ---------------------------------------------------------------------------
// Payment Mock API
// ---------------------------------------------------------------------------

export const mockPaymentApi = {
  getPaymentHistory: async (projectId: string): Promise<PaymentHistoryItem[]> => {
    await randomDelay(300, 600);
    return MOCK_PAYMENTS.filter((p) => p.projectId === projectId);
  },

  initiateEscrowFunding: async (milestoneId: string): Promise<{ razorpayOrderId: string; amountPaise: number; keyId: string }> => {
    await randomDelay(500, 800);
    // Mock Razorpay order
    return {
      razorpayOrderId: `order_mock_${generateId()}`,
      amountPaise: 80000000,
      keyId: 'rzp_test_mock',
    };
  },
};

export type { Boq, BoqItem, BoqItemUnit, Variation, VariationType, PaymentHistoryItem, AddBoqItemPayload, UpdateBoqItemPayload, RaiseVariationPayload };
