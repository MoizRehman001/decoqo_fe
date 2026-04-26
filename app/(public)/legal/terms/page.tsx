import type { Metadata } from 'next';
import { LegalPage } from '@/components/public/LegalPage';

export const metadata: Metadata = {
  title: 'Terms of Service — Decoqo',
  description: 'Decoqo Terms of Service — governing the use of our interior execution marketplace.',
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      lastUpdated="January 2025"
      sections={[
        {
          heading: '1. Acceptance of Terms',
          content: 'By accessing or using Decoqo ("Platform"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform. These terms apply to all users including customers, vendors, and administrators.',
        },
        {
          heading: '2. Platform Description',
          content: 'Decoqo is an interior execution marketplace that connects customers with verified interior vendors. The Platform provides AI-powered design tools, anonymous bidding, escrow payment management, and dispute resolution services.',
        },
        {
          heading: '3. User Accounts',
          content: 'You must create an account to use most Platform features. You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate and complete information during registration. Decoqo reserves the right to suspend or terminate accounts that violate these terms.',
        },
        {
          heading: '4. Escrow Services',
          content: 'Decoqo acts as a neutral escrow agent. Customer payments are held in a regulated escrow account and released to vendors only upon verified milestone completion. Decoqo is not a bank or financial institution. Escrow funds are protected and cannot be accessed by Decoqo for its own purposes.',
        },
        {
          heading: '5. Vendor Obligations',
          content: 'Vendors must complete KYC verification before bidding. Vendors must honour the locked BOQ scope. Any changes to scope require a formal variation order approved by the customer. Vendors must maintain professional conduct and respond to communications within 24 hours.',
        },
        {
          heading: '6. Customer Obligations',
          content: 'Customers must provide accurate project information. Customers must fund escrow within 48 hours of milestone locking. Customers must review and approve or request changes to milestones within 7 days of submission. Unreasonable delays may result in automatic release of escrow.',
        },
        {
          heading: '7. Dispute Resolution',
          content: 'Disputes must be raised through the Platform within 7 days of milestone submission. Decoqo admin will review evidence from both parties and issue a binding decision within 48 hours. Decisions may result in full release, partial release, or full refund of escrow funds.',
        },
        {
          heading: '8. Prohibited Activities',
          content: 'Users may not share contact information outside the Platform during the bidding phase. Users may not attempt to circumvent the escrow system. Users may not submit false or misleading information. Users may not engage in fraudulent bidding or project creation.',
        },
        {
          heading: '9. Limitation of Liability',
          content: 'Decoqo is not liable for the quality of work performed by vendors. Decoqo is not liable for delays caused by either party. Our liability is limited to the escrow amount held for the relevant project. We are not liable for indirect, consequential, or punitive damages.',
        },
        {
          heading: '10. Governing Law',
          content: 'These terms are governed by the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of courts in Bengaluru, Karnataka, India.',
        },
      ]}
    />
  );
}
