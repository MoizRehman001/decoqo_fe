'use client';

import Link from 'next/link';
import { ArrowRight, Building2, Home } from 'lucide-react';

export function HowItWorksCta() {
  return (
    <section className="py-24 bg-card/50 border-t border-border/50">
      <div className="container mx-auto px-6">
        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Customer CTA */}
          <div className="neu-card-3d rounded-2xl p-8 text-center space-y-4">
            <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-accent/10">
              <Home className="h-7 w-7 text-accent" />
            </div>
            <h3 className="font-serif text-xl font-bold text-foreground">I&apos;m a Customer</h3>
            <p className="text-sm text-muted-foreground font-sans">
              Start your interior project with AI designs and anonymous bids from verified vendors.
            </p>
            <Link
              href="/register/customer"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all hover:scale-[1.02]"
              style={{ background: 'var(--gold-gradient)', color: 'hsl(0 0% 4%)' }}
            >
              Start My Project <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Vendor CTA */}
          <div className="neu-card-3d rounded-2xl p-8 text-center space-y-4">
            <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-blue-500/10">
              <Building2 className="h-7 w-7 text-blue-500" />
            </div>
            <h3 className="font-serif text-xl font-bold text-foreground">I&apos;m a Vendor</h3>
            <p className="text-sm text-muted-foreground font-sans">
              Join India&apos;s most trusted interior marketplace. Bid on verified projects, get paid on time.
            </p>
            <Link
              href="/register/vendor"
              className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted/30 transition-all"
            >
              Join as Vendor <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
