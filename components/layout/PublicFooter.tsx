import Link from 'next/link';
import Image from 'next/image';

const links = {
  Platform: [
    { label: 'How It Works', to: '/how-it-works' },
    { label: 'Trust Model', to: '/trust' },
    { label: 'Vendor Works', to: '/vendors' },
    { label: 'Explore Projects', to: '/explore' },
  ],
  Explore: [
    { label: 'Pricing', to: '/pricing' },
    { label: 'Get Started', to: '/register/customer' },
    { label: 'Join as Vendor', to: '/register/vendor' },
    { label: 'Cities', to: '/vendors' },
  ],
  Legal: [
    { label: 'Terms of Service', to: '/legal/terms' },
    { label: 'Privacy Policy', to: '/legal/privacy' },
    { label: 'Vendor Agreement', to: '/legal/vendor-agreement' },
    { label: 'Contact', to: '/contact' },
  ],
};

export function PublicFooter() {
  return (
    <footer className="border-t border-border/50 bg-card/50 py-20 backdrop-blur-sm">
      <div className="container mx-auto px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-3">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center">
                <Image
                  src="/Decoqo_logo.png"
                  alt="Decoqo Logo"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-serif text-xl font-semibold text-foreground">Decoqo</span>
            </div>
            <p className="text-sm text-muted-foreground font-sans leading-relaxed">
              Trust-first interior execution platform.
              <br />
              Design. Lock. Execute. Trust.
            </p>
            <p className="text-xs text-muted-foreground/50 font-sans mt-4 leading-relaxed">
              Decoqo Technologies Pvt. Ltd.
              <br />
              India&apos;s most trusted interior marketplace.
            </p>
          </div>

          {Object.entries(links).map(([heading, items]) => (
            <div key={heading}>
              <h4 className="font-serif font-semibold text-foreground mb-5">{heading}</h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.to}
                      className="text-sm text-muted-foreground hover:text-accent transition-colors duration-300 font-sans"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border/50 mt-14 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground font-sans">
            &copy; {new Date().getFullYear()} Decoqo. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/60 font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
