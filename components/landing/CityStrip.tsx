const CITIES = [
  'Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Pune',
  'Chennai', 'Ahmedabad', 'Kolkata',
];

export function CityStrip() {
  return (
    <div className="py-6 border-y border-border/30 bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto px-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
        <span className="text-xs font-sans font-semibold text-muted-foreground tracking-wider uppercase mr-4">
          Trusted across India
        </span>
        {CITIES.map((city, index) => (
          <span key={city} className="flex items-center gap-3">
            <span className="text-sm font-sans text-foreground/60">{city}</span>
            {index < CITIES.length - 1 && <span className="text-foreground/20">·</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
