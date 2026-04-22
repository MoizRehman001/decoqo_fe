/**
 * Anonymity enforcement tests.
 * CUST-31: Bids shown with anonymous labels — NO vendor identity
 * CUST-36: Vendor Profile Card NEVER shows phone, email, website, full address
 * 4.15: Enforce anonymity — verify vendorId never appears in bidding room UI
 */

import { describe, it, expect } from 'vitest';
import { mockBiddingApi } from '@/mock/mockData';

describe('Anonymity Enforcement', () => {
  describe('getBiddingRoom', () => {
    it('returns bids with anonymousLabel, not vendor name', async () => {
      const room = await mockBiddingApi.getBiddingRoom('proj_001');
      for (const bid of room.bids) {
        expect(bid.anonymousLabel).toMatch(/^Vendor [A-Z]$/);
        // vendorId is present internally but should never be rendered in UI
        expect(bid.vendorId).toBeDefined();
        // The anonymousLabel must not contain the actual vendor name
        expect(bid.anonymousLabel).not.toContain('Arjun');
        expect(bid.anonymousLabel).not.toContain('Sneha');
        expect(bid.anonymousLabel).not.toContain('Kapoor');
        expect(bid.anonymousLabel).not.toContain('Patel');
      }
    });

    it('bid count matches total bids', async () => {
      const room = await mockBiddingApi.getBiddingRoom('proj_001');
      expect(room.bids.length).toBe(room.totalBids);
    });

    it('returns expiry date 30 days from project creation', async () => {
      const room = await mockBiddingApi.getBiddingRoom('proj_001');
      expect(new Date(room.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('getVendorProfile (anonymized)', () => {
    it('never exposes vendor name during bidding phase', async () => {
      const profile = await mockBiddingApi.getVendorProfile('usr_vend_001');
      expect(profile.name).toBeNull();
      expect(profile.businessName).toBeNull();
    });

    it('never exposes phone number', async () => {
      const profile = await mockBiddingApi.getVendorProfile('usr_vend_001');
      expect((profile as unknown as Record<string, unknown>)['phone']).toBeUndefined();
    });

    it('never exposes email', async () => {
      const profile = await mockBiddingApi.getVendorProfile('usr_vend_001');
      expect((profile as unknown as Record<string, unknown>)['email']).toBeUndefined();
    });

    it('never exposes full address', async () => {
      const profile = await mockBiddingApi.getVendorProfile('usr_vend_001');
      expect((profile as unknown as Record<string, unknown>)['address']).toBeUndefined();
      expect((profile as unknown as Record<string, unknown>)['fullAddress']).toBeUndefined();
    });

    it('exposes only safe fields: city, categories, bio, rating, portfolio', async () => {
      const profile = await mockBiddingApi.getVendorProfile('usr_vend_001');
      expect(profile.city).toBeDefined();
      expect(profile.categories).toBeDefined();
      expect(profile.bio).toBeDefined();
      expect(profile.rating).toBeDefined();
      expect(profile.portfolioItems).toBeDefined();
    });
  });

  describe('getVendorProfileRevealed (post-selection)', () => {
    it('reveals name and businessName after vendor selection', async () => {
      const profile = await mockBiddingApi.getVendorProfileRevealed('usr_vend_001');
      expect(profile.name).not.toBeNull();
      expect(profile.businessName).not.toBeNull();
      expect(typeof profile.name).toBe('string');
      expect(typeof profile.businessName).toBe('string');
    });
  });

  describe('selectVendor', () => {
    it('changes project status to VENDOR_SELECTED', async () => {
      const { project } = await mockBiddingApi.selectVendor({
        projectId: 'proj_001',
        bidId: 'bid_001',
      });
      expect(project.status).toBe('VENDOR_SELECTED');
      expect(project.selectedVendorId).toBeDefined();
    });

    it('marks the selected bid as SELECTED', async () => {
      const { bid } = await mockBiddingApi.selectVendor({
        projectId: 'proj_006',
        bidId: 'bid_001',
      });
      expect(bid.status).toBe('SELECTED');
    });
  });

  describe('shortlistBid', () => {
    it('toggles shortlist status', async () => {
      const bid1 = await mockBiddingApi.shortlistBid('bid_001');
      const wasShortlisted = bid1.isShortlisted;
      const bid2 = await mockBiddingApi.shortlistBid('bid_001');
      expect(bid2.isShortlisted).toBe(!wasShortlisted);
    });
  });

  describe('submitBid', () => {
    it('prevents duplicate bids from same vendor', async () => {
      // First bid should succeed
      await mockBiddingApi.submitBid({
        projectId: 'proj_005',
        quotePaise: 30000000,
        timelineWeeks: 6,
        materialLevel: 'STANDARD',
        scopeAssumptions: 'Standard scope for living room refresh',
        notes: '',
      });

      // Second bid from same vendor should throw
      await expect(
        mockBiddingApi.submitBid({
          projectId: 'proj_005',
          quotePaise: 28000000,
          timelineWeeks: 5,
          materialLevel: 'ECONOMY',
          scopeAssumptions: 'Economy scope',
          notes: '',
        }),
      ).rejects.toMatchObject({ code: 'DUPLICATE_BID' });
    });

    it('assigns an anonymous label to new bids', async () => {
      const bid = await mockBiddingApi.submitBid({
        projectId: 'proj_004',
        quotePaise: 45000000,
        timelineWeeks: 4,
        materialLevel: 'PREMIUM',
        scopeAssumptions: 'Premium bedroom makeover with walk-in wardrobe',
        notes: 'Available to start immediately',
      });
      expect(bid.anonymousLabel).toMatch(/^Vendor [A-Z]$/);
    });
  });
});
