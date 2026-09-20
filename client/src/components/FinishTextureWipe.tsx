import { useState, useRef, useEffect } from "react";
import { Sparkles, Sun, Eye, Layers } from "lucide-react";

export type StoneFinishType =
  | "polished"
  | "honed"
  | "leathered"
  | "flamed"
  | "bush-hammered"
  | "waterjet"
  | "cut-to-size";

interface FinishTextureWipeProps {
  currentFinish?: StoneFinishType;
  onChangeFinish?: (finish: StoneFinishType) => void;
  baseImage: string;
  scrollRatio?: number; // 0 to 1 for scroll-driven wipe position
}

const FINISH_DATA: Record<
  StoneFinishType,
  {
    title: string;
    tagline: string;
    description: string;
    lrv: string; // Light Reflectance Value
    tactile: string;
    slipRating: string;
    bestFor: string;
    sheenFilter: string;
    glowOpacity: number;
  }
> = {
  polished: {
    title: "High-Gloss Mirror Polish",
    tagline: "Liquid Obsidian & Maximum Contrast",
    description:
      "Diamond buffing heads up to 3,000 grit bring forth a glass-like specular surface. Accentuates the deep mineral color depth, crystalline quartz transparency, and luminous veins.",
    lrv: "85% Reflectance",
    tactile: "Ultra-Smooth Glass",
    slipRating: "R9 Standard",
    bestFor: "Dramatic Kitchen Islands, Backlit Walls, Vanity Countertops",
    sheenFilter: "brightness(1.18) contrast(1.22) saturate(1.12)",
    glowOpacity: 0.85,
  },
  honed: {
    title: "Contemporary Satin Honed",
    tagline: "Quiet Velvet & Anti-Glare Elegance",
    description:
      "Precision diamond abrasives stopped at 400 grit create a velvet-smooth matte plane with zero harsh glare. Soft to the touch, grounding modern minimalist architecture.",
    lrv: "35% Diffuse Reflectance",
    tactile: "Satin Velvet Touch",
    slipRating: "R10 Slip-Resistant",
    bestFor: "Flooring, Monolithic Fireplaces, Modern Hospitality Lobbies",
    sheenFilter: "brightness(0.96) contrast(1.04) saturate(0.92)",
    glowOpacity: 0.3,
  },
  leathered: {
    title: "Architectural Leathered",
    tagline: "Tactile Relief Following Geological Grain",
    description:
      "Diamond-tipped polymer bristles sweep away softer mineral particles, creating undulating 3D micro-relief across the vein path. Highly fingerprint and scratch impervious.",
    lrv: "20% Matte Texture",
    tactile: "Undulating Organic Grain",
    slipRating: "R11 High-Traction",
    bestFor: "Alfresco Dining, Spa Enclosures, Tactile Bar Counters",
    sheenFilter: "brightness(0.92) contrast(1.3) saturate(0.98)",
    glowOpacity: 0.45,
  },
  flamed: {
    title: "Thermal Flamed",
    tagline: "High-Heat Crystalline Texture",
    description: "Intense heat bursts the quartz crystals, creating a deeply textured, highly slip-resistant surface perfect for exterior applications.",
    lrv: "15% Matte Reflectance",
    tactile: "Rough & Crystalline",
    slipRating: "R12 Maximum Traction",
    bestFor: "Exterior Paving, Pool Coping, Monumental Facades",
    sheenFilter: "brightness(0.85) contrast(1.1) saturate(0.8)",
    glowOpacity: 0.2,
  },
  "bush-hammered": {
    title: "Bush Hammered",
    tagline: "Mechanically Weathered Relief",
    description: "Impacted by masonry tools to create a uniformly pockmarked, highly textured surface resembling naturally weathered rock.",
    lrv: "18% Diffuse Reflectance",
    tactile: "Pockmarked & Grippy",
    slipRating: "R11 High-Traction",
    bestFor: "Exterior Cladding, Non-Slip Walkways, Feature Walls",
    sheenFilter: "brightness(0.9) contrast(1.05) saturate(0.85)",
    glowOpacity: 0.25,
  },
  waterjet: {
    title: "High-Pressure Waterjet",
    tagline: "Eroded Natural Elegance",
    description: "High-pressure water erodes softer minerals, leaving a textured yet smooth finish that retains the stone's vibrant color better than flamed.",
    lrv: "25% Soft Reflectance",
    tactile: "Textured but Soft",
    slipRating: "R10 Slip-Resistant",
    bestFor: "Interior Feature Walls, Custom Inlays, Spa Environments",
    sheenFilter: "brightness(0.95) contrast(1.15) saturate(0.95)",
    glowOpacity: 0.35,
  },
  "cut-to-size": {
    title: "Cut-to-Size & Edge Profiling",
    tagline: "Precision Tailored Geometry",
    description: "Custom cut to exact dimensions with precision-milled edge profiles (bullnose, chamfer, ogee) for a complete, installation-ready piece.",
    lrv: "Varies by Finish",
    tactile: "Precision Milled Edges",
    slipRating: "Standard",
    bestFor: "Custom Countertops, Stair Treads, Architectural Details",
    sheenFilter: "brightness(1) contrast(1.05) saturate(1)",
    glowOpacity: 0.5,
  },
};

export function FinishTextureWipe({
  currentFinish: controlledFinish,
  onChangeFinish,
  baseImage,
  scrollRatio = 0.5,
}: FinishTextureWipeProps) {
  const [internalFinish, setInternalFinish] = useState<StoneFinishType>("polished");
  const finish = controlledFinish ?? internalFinish;
  const setFinish = (f: StoneFinishType) => {
    setInternalFinish(f);
    onChangeFinish?.(f);
  };

  const [wipePercent, setWipePercent] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync with scrollRatio if provided and not dragging
  useEffect(() => {
    if (!isDragging && scrollRatio !== undefined) {
      setWipePercent(Math.max(10, Math.min(90, scrollRatio * 100)));
    }
  }, [scrollRatio, isDragging]);

  const handlePointerDown = () => setIsDragging(true);
  const handlePointerUp = () => setIsDragging(false);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setWipePercent(pct);
  };

  const activeData = FINISH_DATA[finish];

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-white/15 bg-ink p-4 sm:p-6 lg:p-8 backdrop-blur-xl">
      {/* Header controls: Finish tabs */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-gold">
            <Layers className="h-3 w-3" />
            <span>Finish Transformation // Stage 04</span>
          </div>
          <h3 className="mt-1 font-serif text-2xl text-ivory sm:text-3xl">
            {activeData.title}
          </h3>
        </div>

        {/* Tab buttons */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-full border border-white/10 bg-black/40 p-1">
          {(["polished", "honed", "leathered", "flamed", "bush-hammered", "waterjet", "cut-to-size"] as StoneFinishType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFinish(f)}
              className={`rounded-full px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] transition-all duration-300 ${
                finish === f
                  ? "bg-gold text-ink font-bold shadow-md"
                  : "text-ivory/60 hover:text-ivory hover:bg-white/5"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Wipe Canvas Container */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="relative aspect-[16/9] w-full cursor-ew-resize select-none overflow-hidden rounded-2xl bg-black"
      >
        {/* Under layer (Matte / Honed baseline) */}
        <div className="absolute inset-0">
          <img
            src={baseImage}
            alt="Honed baseline"
            className="h-full w-full object-cover"
            style={{ filter: FINISH_DATA.honed.sheenFilter }}
          />
          <div className="absolute top-4 left-4 rounded-full border border-white/20 bg-ink/70 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-ivory/70 backdrop-blur-md">
            Honed (Matte)
          </div>
        </div>

        {/* Top layer with clip-path (Selected finish e.g. Polished or Leathered) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - wipePercent}% 0 0)` }}
        >
          <img
            src={baseImage}
            alt={`${finish} finish`}
            className="h-full w-full object-cover"
            style={{ filter: activeData.sheenFilter }}
          />

          {/* Specular gloss glint beam for polished */}
          {finish === "polished" && (
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/25 to-transparent opacity-70 animate-pulse" />
          )}

          {/* Leathered grain relief overlay */}
          {finish === "leathered" && (
            <div className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-50 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
          )}

          {/* Flamed grain relief overlay */}
          {finish === "flamed" && (
            <div className="pointer-events-none absolute inset-0 mix-blend-multiply opacity-40 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJuIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC44IiBudW1PY3RhdmVzPSIzIiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI24pIiBvcGFjaXR5PSIwLjUiLz48L3N2Zz4=')] [background-size:100px_100px]" />
          )}

          {/* Bush Hammered dot overlay */}
          {finish === "bush-hammered" && (
            <div className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-30 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:6px_6px]" />
          )}

          {/* Waterjet subtle texture */}
          {finish === "waterjet" && (
             <div className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJuIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC4wNSIgbnVtT2N0YXZlcz0iMiIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNuKSIgb3BhY2l0eT0iMC41Ii8+PC9zdmc+')] [background-size:200px_200px]" />
          )}

          {/* Cut-to-size simulated edge/bevel highlight */}
          {finish === "cut-to-size" && (
            <div className="pointer-events-none absolute inset-4 border-[3px] border-white/20 rounded-sm shadow-[inset_0_0_20px_rgba(255,255,255,0.1)]" />
          )}

          <div className="absolute top-4 left-4 rounded-full border border-gold/40 bg-gold/90 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-ink backdrop-blur-md">
            {finish.toUpperCase()} Finish
          </div>
        </div>

        {/* Divider scrubber line */}
        <div
          onPointerDown={handlePointerDown}
          style={{ left: `${wipePercent}%` }}
          className="absolute inset-y-0 -ml-px w-0.5 bg-gradient-to-b from-transparent via-gold to-transparent shadow-[0_0_12px_rgba(198,155,86,0.9)]"
        >
          {/* Central handle button */}
          <div className="absolute top-1/2 -left-4 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-gold/80 bg-ink/90 text-gold shadow-xl backdrop-blur-md">
            <span className="text-[10px] font-bold">⇄</span>
          </div>
        </div>

        {/* Instruction label */}
        <div className="pointer-events-none absolute bottom-4 inset-x-0 text-center">
          <span className="rounded-full border border-white/10 bg-ink/60 px-4 py-1 text-[9px] uppercase tracking-[0.2em] text-ivory/60 backdrop-blur-md">
            Drag divider or scroll to compare surface finishes
          </span>
        </div>
      </div>

      {/* Detail specs grid */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
          <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-gold">
            <Sun className="h-3 w-3" />
            <span>Light Reflectance</span>
          </div>
          <div className="mt-1 font-mono text-sm font-bold text-ivory">{activeData.lrv}</div>
        </div>

        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
          <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-gold">
            <Eye className="h-3 w-3" />
            <span>Tactile Feel</span>
          </div>
          <div className="mt-1 text-sm font-medium text-ivory">{activeData.tactile}</div>
        </div>

        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
          <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-gold">
            <Sparkles className="h-3 w-3" />
            <span>Traction Rating</span>
          </div>
          <div className="mt-1 font-mono text-sm font-bold text-ivory">{activeData.slipRating}</div>
        </div>

        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
          <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-gold">
            Recommended Application
          </div>
          <div className="mt-1 text-xs leading-4 text-ivory/75">{activeData.bestFor}</div>
        </div>
      </div>
    </div>
  );
}
