import type { Metadata } from 'next';
import { LegalPage } from '@/components/public/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy — Decoqo',
  description: 'Decoqo Privacy Policy — how we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated="January 2025"
      sections={[
        {
          heading: '1. Information We Collect',
          content: 'We collect information you provide directly: name, email, phone number, city, and project details. We also collect usage data including pages visited, features used, and device information. Payment information is processed by Razorpay and we do not store card details.',
        },
        {
          heading: '2. How We Use Your Information',
          content: 'We use your information to provide and improve the Platform, match customers with vendors, process escrow payments, send project notifications, and resolve disputes. We do not sell your personal information to third parties.',
        },
        {
          heading: '3. Contact Information Masking',
          content: 'During the bidding phase, vendor identities are masked. Phone numbers and email addresses shared in chat are automatically detected and replaced with [PHONE REMOVED] or [EMAIL REMOVED]. This protects both parties until a formal agreement is reached.',
        },
        {
          heading: '4. Data Security',
          content: 'We use industry-standard encryption for data in transit and at rest. Access to personal data is restricted to authorised personnel. We conduct regular security audits. In the event of a data breach, we will notify affected users within 72 hours.',
        },
        {
          heading: '5. Data Retention',
          content: 'We retain your account data for as long as your account is active. Project data is retained for 7 years for legal and dispute resolution purposes. You may request deletion of your account data, subject to legal retention requirements.',
        },
        {
          heading: '6. Your Rights',
          content: 'You have the right to access, correct, or delete your personal data. You may opt out of marketing communications at any time. You may request a copy of your data in a portable format. Contact privacy@decoqo.com to exercise these rights.',
        },
        {
          heading: '7. Cookies',
          content: 'We use essential cookies for authentication and session management. We use analytics cookies to understand Platform usage. You may disable non-essential cookies in your browser settings without affecting core functionality.',
        },
        {
          heading: '8. Changes to This Policy',
          content: 'We may update this Privacy Policy from time to time. We will notify you of significant changes via email or Platform notification. Continued use of the Platform after changes constitutes acceptance of the updated policy.',
        },
      ]}
    />
  );
}
