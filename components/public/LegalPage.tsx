/**
 * LegalPage — reusable legal document layout.
 * Used for Terms, Privacy Policy, Vendor Agreement.
 */

interface Section {
  heading: string;
  content: string;
}

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  sections: Section[];
}

export function LegalPage({ title, lastUpdated, sections }: LegalPageProps) {
  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-6 max-w-3xl">
        {/* Header */}
        <div className="mb-12">
          <div className="glass-pill inline-flex items-center gap-2 mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-accent font-sans">Legal</span>
          </div>
          <h1 className="font-serif text-4xl font-bold text-foreground mb-3">{title}</h1>
          <p className="text-sm text-muted-foreground font-sans">Last updated: {lastUpdated}</p>
          <div className="gold-line mt-6" />
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.heading} className="ivory-card rounded-2xl p-6">
              <h2 className="font-serif text-lg font-bold text-foreground mb-3">{section.heading}</h2>
              <p className="text-sm text-muted-foreground font-sans leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-12 rounded-2xl border border-accent/20 bg-accent/5 p-6 text-center">
          <p className="text-sm text-muted-foreground font-sans">
            Questions about these terms?{' '}
            <a href="mailto:legal@decoqo.com" className="text-accent hover:underline font-medium">
              legal@decoqo.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
