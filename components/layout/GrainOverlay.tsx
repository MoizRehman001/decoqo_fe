/**
 * Cinematic SVG-based animated grain overlay.
 * Uses feTurbulence — GPU-friendly, no images.
 */
const GrainOverlay = () => (
  <div
    aria-hidden
    className="pointer-events-none fixed inset-0 z-[45] opacity-[0.06] mix-blend-overlay"
    style={{ contain: 'strict' }}
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" className="w-full h-full">
      <filter id="decoqo-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncA type="linear" slope="0.6" />
        </feComponentTransfer>
      </filter>
      <rect width="100%" height="100%" filter="url(#decoqo-grain)" />
    </svg>
  </div>
);

export default GrainOverlay;
