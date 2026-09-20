import { useState } from "react";
import { Sparkles, ShieldCheck, Compass, Layers, X, ChevronRight } from "lucide-react";

export interface Hotspot {
  id: string;
  x: number; // percentage
  y: number; // percentage
  title: string;
  subtitle: string;
  category: string;
  description: string;
  metrics: { label: string; value: string }[];
  icon: typeof Sparkles;
}

export const STONE_HOTSPOTS: Hotspot[] = [
  {
    id: "quartz",
    x: 36,
    y: 32,
    title: "Quartz Silicate Matrix",
    subtitle: "Mohs 7.2 · Thermal Resilient",
    category: "Geological Hardness",
    description:
      "Tightly bonded interlocking silicate crystals forged under tectonic pressure. Unaffected by direct 1,200°C heat, culinary acids, or razor-sharp knife edges.",
    metrics: [
      { label: "Hardness", value: "7.2 Mohs" },
      { label: "Water Absorption", value: "< 0.08%" },
      { label: "Compressive Strength", value: "215 MPa" },
    ],
    icon: ShieldCheck,
  },
  {
    id: "mica",
    x: 64,
    y: 48,
    title: "Biotite Mica Clusters",
    subtitle: "Iridescent Light Matrix",
    category: "Optical Depth",
    description:
      "Micro-crystalline mineral sheets oriented along ancient geological stress lines. Catches incoming ambient light and creates a subtle, three-dimensional metallic luster.",
    metrics: [
      { label: "Luster Index", value: "Sub-metallic" },
      { label: "Mineral Composition", value: "Biotite & Hornblende" },
      { label: "Specular Sheen", value: "Multi-Angle" },
    ],
    icon: Sparkles,
  },
  {
    id: "veining",
    x: 48,
    y: 68,
    title: "Bookmatched Grain Flow",
    subtitle: "Architectural Symmetry",
    category: "Spatial Continuity",
    description:
      "Sequential mineral trajectories extracted from consecutive block cuts. Enables mirror-image bookmatching for continuous horizontal waterfall islands and monumental wall spans.",
    metrics: [
      { label: "Continuity Yield", value: "99.4%" },
      { label: "Max Slab Dimension", value: "3400 × 2050 mm" },
      { label: "Alignment Tolerance", value: "±0.5 mm" },
    ],
    icon: Layers,
  },
];

interface StoneMacroHotspotsProps {
  activeId?: string | null;
  onSelect?: (id: string | null) => void;
  visible?: boolean;
}

export function StoneMacroHotspots({
  activeId: controlledActiveId,
  onSelect,
  visible = true,
}: StoneMacroHotspotsProps) {
  const [internalActiveId, setInternalActiveId] = useState<string | null>("quartz");
  const activeId = controlledActiveId !== undefined ? controlledActiveId : internalActiveId;

  const handleSelect = (id: string | null) => {
    if (onSelect) onSelect(id);
    else setInternalActiveId(id);
  };

  const activeHotspot = STONE_HOTSPOTS.find((h) => h.id === activeId);

  if (!visible) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      {/* Interactive pins */}
      {STONE_HOTSPOTS.map((hotspot) => {
        const isActive = activeId === hotspot.id;
        const Icon = hotspot.icon;
        return (
          <div
            key={hotspot.id}
            style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
            className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
          >
            <button
              onClick={() => handleSelect(isActive ? null : hotspot.id)}
              className={`group relative flex items-center gap-2 rounded-full border px-3 py-1.5 backdrop-blur-md transition-all duration-300 ${
                isActive
                  ? "border-gold bg-ink/90 text-ivory shadow-[0_0_24px_rgba(198,155,86,0.45)] scale-105"
                  : "border-white/20 bg-ink/65 text-ivory/80 hover:border-gold/60 hover:bg-ink/80 hover:scale-105"
              }`}
              aria-label={`Inspect ${hotspot.title}`}
            >
              {/* Radar pulsing ring */}
              <span className="relative flex h-3 w-3">
                <span
                  className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${
                    isActive ? "bg-gold" : "bg-white/40 group-hover:bg-gold/80"
                  }`}
                />
                <span
                  className={`relative inline-flex h-3 w-3 rounded-full ${
                    isActive ? "bg-gold" : "bg-white/80 group-hover:bg-gold"
                  }`}
                />
              </span>

              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em]">
                {hotspot.title.split(" ")[0]}
              </span>

              <Icon className={`h-3 w-3 ${isActive ? "text-gold" : "text-ivory/60"}`} />
            </button>
          </div>
        );
      })}

      {/* Telemetry card for selected hotspot */}
      {activeHotspot && (
        <div className="pointer-events-auto absolute bottom-8 left-6 right-6 mx-auto max-w-xl md:left-12 md:right-auto md:bottom-12 transition-all duration-500 animate-rise">
          <div className="relative overflow-hidden rounded-2xl border border-gold/30 bg-ink/90 p-5 shadow-2xl backdrop-blur-xl md:p-6">
            {/* Top decorative line */}
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-gold/80 to-transparent" />

            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.24em] text-gold">
                  <Compass className="h-3 w-3 animate-spin-slow" />
                  <span>Macro Telemetry // {activeHotspot.category}</span>
                </div>
                <h4 className="mt-1 font-serif text-2xl tracking-[-0.02em] text-ivory sm:text-3xl">
                  {activeHotspot.title}
                </h4>
                <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-ivory/50">
                  {activeHotspot.subtitle}
                </div>
              </div>

              <button
                onClick={() => handleSelect(null)}
                className="grid h-8 w-8 place-items-center rounded-full border border-white/10 text-ivory/60 transition hover:border-gold/40 hover:text-ivory"
                aria-label="Close telemetry"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-3 text-xs leading-5 text-ivory/70 sm:text-sm sm:leading-6">
              {activeHotspot.description}
            </p>

            {/* Metrics grid */}
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-3">
              {activeHotspot.metrics.map((metric, i) => (
                <div key={i} className="rounded-lg bg-white/[0.03] p-2">
                  <div className="text-[9px] uppercase tracking-[0.15em] text-ivory/40">
                    {metric.label}
                  </div>
                  <div className="mt-0.5 font-mono text-xs font-bold text-gold">
                    {metric.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick cycle button */}
            <div className="mt-4 flex items-center justify-between pt-1 text-[10px] uppercase tracking-[0.2em] text-ivory/40">
              <span>Section 03 of 05 — Macro Examination</span>
              <button
                onClick={() => {
                  const currentIndex = STONE_HOTSPOTS.findIndex((h) => h.id === activeId);
                  const nextHotspot = STONE_HOTSPOTS[(currentIndex + 1) % STONE_HOTSPOTS.length];
                  handleSelect(nextHotspot.id);
                }}
                className="flex items-center gap-1 font-semibold text-gold transition hover:text-ivory"
              >
                Next target <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
