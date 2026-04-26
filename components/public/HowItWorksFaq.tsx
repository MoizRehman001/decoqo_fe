'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const FAQS = [
  {
    q: 'How does Decoqo protect my money?',
    a: 'All payments go into a regulated escrow account held by Decoqo — not the vendor. Funds are released only when you approve each milestone. If a dispute arises, our admin team reviews evidence and resolves it within 48 hours.',
  },
  {
    q: 'How does anonymous bidding work?',
    a: "When your project goes live, verified vendors submit bids without revealing their identity. You see their quote, timeline, material level, and portfolio — but not their name or contact. This ensures pure merit-based competition. Identity is revealed only after you select a vendor.",
  },
  {
    q: 'What is a BOQ and why does it matter?',
    a: 'A Bill of Quantities (BOQ) is a detailed itemised list of all work, materials, and costs. Once you approve and lock the BOQ, the scope is frozen — no surprise additions or substitutions. Any changes require a formal variation order that you must approve.',
  },
  {
    q: 'What happens if there is a dispute?',
    a: 'Raise a dispute from your milestone page. Escrow is immediately held. Both parties upload evidence. Our admin team reviews within 48 hours and issues a decision — full release, partial release, or full refund. The decision is final and binding.',
  },
  {
    q: 'How are vendors verified?',
    a: 'Every vendor goes through KYC verification: Aadhaar, PAN, GST certificate, bank statement, and portfolio review. Only verified vendors can bid on projects. Verification status is always visible on vendor profiles.',
  },
  {
    q: 'Can I use Decoqo for commercial projects?',
    a: 'Yes. Decoqo supports residential, commercial, office, factory, and retail spaces. The platform is designed to handle projects from ₹2L to ₹5Cr+.',
  },
  {
    q: 'What is the AI design feature?',
    a: 'After uploading your floor plan and describing your style, our AI generates 2–3 photorealistic design concepts tailored to your space and budget. You review, refine, and lock one design before bidding opens. This ensures vendors bid on a defined scope.',
  },
  {
    q: 'Is there a fee to use Decoqo?',
    a: 'Customers pay no platform fee. Vendors pay a small success fee (2–3%) only when a project is completed. See our Pricing page for full details.',
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="ivory-card rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left hover:bg-muted/10 transition-colors"
        aria-expanded={open}
      >
        <span className="font-serif font-semibold text-foreground text-base">{q}</span>
        {open ? (
          <ChevronUp className="h-5 w-5 shrink-0 text-accent" />
        ) : (
          <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
        )}
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <p className="px-6 pb-5 text-sm text-muted-foreground font-sans leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

export function HowItWorksFaq() {
  return (
    <section className="py-24 sm:py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-14">
          <div className="glass-pill inline-flex items-center gap-2 mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-accent font-sans">FAQ</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-4">
            Frequently Asked{' '}
            <span className="gold-text italic">Questions</span>
          </h2>
          <p className="text-muted-foreground font-sans max-w-xl mx-auto">
            Everything you need to know about how Decoqo works.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {FAQS.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>
    </section>
  );
}
