import type { Metadata } from 'next';
import { LegalPage } from '@/components/public/LegalPage';

export const metadata: Metadata = {
  title: 'Vendor Agreement — Decoqo',
  description: 'Decoqo Vendor Agreement — terms and obligations for interior vendors on the platform.',
};

export default function VendorAgreementPage() {
  return (
    <LegalPage
      title="Vendor Agreement"
      lastUpdated="January 2025"
      sections={[
        {
          heading: '1. Vendor Eligibility',
          content: 'To become a vendor on Decoqo, you must complete KYC verification including Aadhaar, PAN, GST certificate (if applicable), and bank statement. You must have a minimum of 2 years of professional interior design experience. Decoqo reserves the right to reject applications at its discretion.',
        },
        {
          heading: '2. Bidding Rules',
          content: 'Bids must be accurate and reflect your genuine ability to complete the project. You may not submit bids with the intent to withdraw. Bids must include a detailed scope of work. Once a bid is selected, you are committed to the quoted price and timeline.',
        },
        {
          heading: '3. BOQ Obligations',
          content: 'You must submit a detailed Bill of Quantities within 7 days of being selected. The BOQ must itemise all materials, labour, and costs. Once the customer approves and locks the BOQ, the scope is frozen. Any changes require a formal variation order.',
        },
        {
          heading: '4. Milestone Execution',
          content: 'You must complete milestones within the agreed timeline. You must submit completion evidence (photos, videos) for each milestone. You must respond to customer change requests within 48 hours. Repeated delays may result in account suspension.',
        },
        {
          heading: '5. Payment Terms',
          content: 'Payments are released from escrow within 24 hours of customer approval. Decoqo deducts the applicable success fee before releasing funds. You must maintain a valid bank account for receiving payments. Disputed payments are held until resolution.',
        },
        {
          heading: '6. Professional Conduct',
          content: 'You must maintain professional communication at all times. You may not share contact information with customers outside the Platform during the bidding phase. You must not attempt to circumvent the escrow system. Violations may result in permanent account termination.',
        },
        {
          heading: '7. Quality Standards',
          content: 'Work must meet the quality standards specified in the BOQ. Materials must match the brands and specifications agreed in the BOQ. Substitutions require prior written approval from the customer. Decoqo may conduct quality audits on completed projects.',
        },
        {
          heading: '8. Termination',
          content: 'Decoqo may terminate your vendor account for repeated disputes, quality failures, fraudulent activity, or violation of these terms. Upon termination, any pending escrow payments for completed work will be released after review. Ongoing projects will be reassigned.',
        },
      ]}
    />
  );
}
