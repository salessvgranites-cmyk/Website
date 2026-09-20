import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Compass,
  ArrowDown,
  ArrowUpRight,
  Maximize2,
  Volume2,
  VolumeX,
  Layers,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { StoneMacroHotspots } from "./StoneMacroHotspots";
import { FinishTextureWipe, type StoneFinishType } from "./FinishTextureWipe";

// Curated stone materials available for the deep zoom showcase
export const SHOWCASE_STONES = [
  {
    id: "noir-vein",
    name: "Noir Vein",
    origin: "Chamarajanagar Quarry · Karnataka",
    category: "Signature Black Granite",
    description: "Deep graphite bed laced with luminous ivory quartz veins.",
    image: "/images/noir-vein.jpg",
    accentColor: "#c69b56",
  },
  {
    id: "cloud-ledger",
    name: "Cloud Ledger",
    origin: "Ilkal Formation · Karnataka",
    category: "Warm Ivory Quartzite",
    description: "Warm ivory field traced with soft graphite mist movement.",
    image: "/images/cloud-ledger.jpg",
    accentColor: "#dec083",
  },
  {
    id: "midnight-plain",
    name: "Midnight Plain",
    origin: "Kanpur-Hassan Belt · Karnataka",
    category: "Absolute Obsidian",
    description: "Zero-porosity ultra-dense black with velvety mineral depth.",
    image: "/images/absolute-black.jpg",
    accentColor: "#9e7d48",
  },
  {
    id: "tectonic-grey",
    name: "Tectonic Grey",
    origin: "Deccan Plateau · South India",
    category: "Architectural Feature",
    description: "Layered sedimentary slate movement with sculptural presence.",
    image: "/images/feature-wall.jpg",
    accentColor: "#b8955c",
  },
];

const STAGES = [
  {
    num: "01",
    label: "Monolith",
    kicker: "Stage 01 // Geological Genesis",
    title: "The Unbroken Monolith",
    copy: "Hewn from subterranean magma chambers 300 million years in the making. A 30-ton crystalline colossus waiting in silence.",
    badge: "Origin: Deccan Craton · Density: 2,740 kg/m³",
  },
  {
    num: "02",
    label: "Extraction",
    kicker: "Stage 02 // Micron Precision",
    title: "Diamond-Wire Extraction",
    copy: "High-tension aerospace diamond wire traveling at 35 m/s slices through solid bedrock with ±0.5mm precision, unlocking the virgin vein tapestry.",
    badge: "Cut Velocity: 35 m/s · Tolerance: ±0.5mm · Multi-Wire Gangsaw",
  },
  {
    num: "03",
    label: "Anatomy",
    kicker: "Stage 03 // Molecular Matrix",
    title: "The Crystalline Anatomy",
    copy: "Extreme optical zoom reveals interlocking quartz prisms and shimmering biotite mica flakes forged under 500 MPa tectonic pressure.",
    badge: "Hardness: 7.2 Mohs · Absorption: < 0.08% · Scratch Impervious",
  },
  {
    num: "04",
    label: "Finishes",
    kicker: "Stage 04 // Tactile Metamorphosis",
    title: "The Spectrum of Touch",
    copy: "From mirror-polished liquid obsidian to soft velvet honed and undulating leathered relief—shaping how natural light interacts with space.",
    badge: "Finishes: Leathered · Honed · Mirror-Polish",
  },
  {
    num: "05",
    label: "Sanctuary",
    kicker: "Stage 05 // Architectural Manifestation",
    title: "Built for Generations",
    copy: "The culmination of geological time and artisan craftsmanship. Anchoring bold residences, bespoke hospitality, and monuments made to endure.",
    badge: "Application: Monolithic Waterfall Island · Private Residence",
  },
];

export function GraniteScrollytelling() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedStoneIndex, setSelectedStoneIndex] = useState(0);
  const [activeFinish, setActiveFinish] = useState<StoneFinishType>("polished");
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>("quartz");

  const currentStone = SHOWCASE_STONES[selectedStoneIndex];

  // Framer motion scroll tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Smooth physics spring interpolation
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 75,
    damping: 26,
    restDelta: 0.001,
  });

  // Track active stage index (0 to 4)
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  useEffect(() => {
    return smoothProgress.on("change", (latest) => {
      let stage = 0;
      if (latest < 0.2) stage = 0;
      else if (latest < 0.42) stage = 1;
      else if (latest < 0.68) stage = 2;
      else if (latest < 0.86) stage = 3;
      else stage = 4;
      setCurrentStageIndex(stage);
    });
  }, [smoothProgress]);

  // Handle mouse movement for dynamic specular light sheen
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePos({ x, y });
  };

  // Jump to specific stage with exact document scroll position
  const jumpToStage = (index: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const containerTop = rect.top + scrollY;
    const targets = [0.06, 0.28, 0.52, 0.74, 0.94];
    const targetRatio = targets[index];
    const totalHeight = containerRef.current.offsetHeight - window.innerHeight;
    const targetY = containerTop + targetRatio * totalHeight;
    window.scrollTo({ top: targetY, behavior: "smooth" });
    setCurrentStageIndex(index);
  };

  // -------------------------------------------------------------
  // TRANSFORMS ACROSS THE 5 STAGES
  // -------------------------------------------------------------
  // Camera Scale: 1.0 (Monolith) -> 1.35 (Cut) -> 3.6 (Macro Zoom) -> 1.5 (Finish) -> 1.05 (Room)
  const stoneScale = useTransform(
    smoothProgress,
    [0, 0.2, 0.32, 0.45, 0.62, 0.75, 0.86, 1],
    [1.0, 1.25, 1.6, 3.4, 3.8, 1.45, 1.2, 1.0]
  );

  // Focus point pan coordinates (shifts camera focal center toward veins during macro)
  const stoneX = useTransform(
    smoothProgress,
    [0, 0.2, 0.45, 0.62, 0.75, 1],
    ["0%", "0%", "-14%", "-20%", "0%", "0%"]
  );

  const stoneY = useTransform(
    smoothProgress,
    [0, 0.2, 0.45, 0.62, 0.75, 1],
    ["0%", "0%", "-12%", "-16%", "0%", "0%"]
  );

  // 3D Tilt perspective
  const rotateX = useTransform(smoothProgress, [0, 0.2, 0.45, 0.8, 1], [6, 2, 0, -4, 0]);
  const rotateY = useTransform(smoothProgress, [0, 0.2, 0.45, 0.8, 1], [-8, -4, 0, 6, 0]);

  // Diamond cut laser line opacity and vertical beam
  const laserOpacity = useTransform(smoothProgress, [0.18, 0.25, 0.38, 0.44], [0, 1, 1, 0]);
  const slabSplit = useTransform(smoothProgress, [0.22, 0.38, 0.44], [0, 36, 0]);

  // Stage 3 Hotspots visibility
  const hotspotsOpacity = useTransform(smoothProgress, [0.42, 0.48, 0.64, 0.7], [0, 1, 1, 0]);

  // Stage 4 Finish Comparison wipe visibility
  const finishWipeOpacity = useTransform(smoothProgress, [0.68, 0.73, 0.84, 0.88], [0, 1, 1, 0]);

  // Stage 5 Penthouse Architecture reveal
  const penthouseOpacity = useTransform(smoothProgress, [0.85, 0.92, 1], [0, 1, 1]);

  // Current stage text animations
  const stageData = STAGES[currentStageIndex];

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative h-[500vh] w-full bg-ink text-ivory select-none"
    >
      {/* Pinned Sticky Viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between pt-20 sm:pt-24 pb-4 sm:pb-6">
        {/* Background Atmospheric Layers */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/90 to-ink" />
          {/* Subtle quarry ambient glow */}
          <div
            className="absolute h-[60vw] w-[60vw] rounded-full blur-[140px] opacity-15 transition-all duration-700"
            style={{
              background: `radial-gradient(circle, ${currentStone.accentColor} 0%, transparent 70%)`,
              left: `${mousePos.x * 60}%`,
              top: `${mousePos.y * 60}%`,
            }}
          />
          <div className="grain-overlay opacity-30" />
        </div>

        {/* ------------------------------------------------------------- */}
        {/* TOP HUD BAR */}
        {/* ------------------------------------------------------------- */}
        <div className="relative z-40 flex items-center justify-between px-6 py-1 sm:px-12">
          {/* Brand & telemetry indicator */}
          <div className="flex items-center gap-3">
            <div className="flex h-2.5 w-2.5 items-center justify-center rounded-full bg-gold/80">
              <span className="h-1.5 w-1.5 rounded-full bg-gold animate-ping" />
            </div>
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-ivory/60">
              Scrollytelling Engine // <span className="text-gold">Deep Zoom</span>
            </div>
          </div>

          {/* Stone Selector Tabs */}
          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-ink/75 p-1 backdrop-blur-xl">
            {SHOWCASE_STONES.map((stone, idx) => (
              <button
                key={stone.id}
                onClick={() => setSelectedStoneIndex(idx)}
                className={`rounded-full px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] transition-all duration-300 ${
                  selectedStoneIndex === idx
                    ? "bg-gold text-ink font-bold shadow-md"
                    : "text-ivory/50 hover:text-ivory hover:bg-white/5"
                }`}
              >
                {stone.name}
              </button>
            ))}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* MAIN 3D CINEMATIC VIEWPORT (THE STONE) */}
        {/* ------------------------------------------------------------- */}
        <div className="relative z-10 mx-auto flex flex-1 min-h-0 w-full max-w-[1360px] items-center justify-center px-4 sm:px-8 py-2">
          <motion.div
            style={{
              scale: stoneScale,
              x: stoneX,
              y: stoneY,
              rotateX,
              rotateY,
              transformPerspective: 1200,
            }}
            className="relative h-full max-h-[52vh] aspect-[16/10] w-auto max-w-5xl cursor-grab active:cursor-grabbing overflow-hidden rounded-[2.5rem] border border-white/15 bg-black shadow-[0_30px_90px_rgba(0,0,0,0.8)]"
          >
            {/* Primary Stone Slab Image (Split into two halves for Stage 2 cut) */}
            <div className="relative h-full w-full">
              {/* Left Slab Half */}
              <motion.div
                style={{ x: useTransform(slabSplit, (v) => -v) }}
                className="absolute inset-y-0 left-0 w-1/2 overflow-hidden"
              >
                <img
                  src={currentStone.image}
                  alt={currentStone.name}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/hero.jpg"; }}
                  className="absolute inset-y-0 left-0 h-full w-[200%] max-w-none object-cover transition-all duration-700"
                  style={{
                    filter:
                      activeFinish === "polished"
                        ? "brightness(1.15) contrast(1.2)"
                        : activeFinish === "honed"
                        ? "brightness(0.95) contrast(1.05)"
                        : "brightness(0.92) contrast(1.3)",
                  }}
                />
              </motion.div>

              {/* Right Slab Half */}
              <motion.div
                style={{ x: useTransform(slabSplit, (v) => v) }}
                className="absolute inset-y-0 right-0 w-1/2 overflow-hidden"
              >
                <img
                  src={currentStone.image}
                  alt={currentStone.name}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/hero.jpg"; }}
                  className="absolute inset-y-0 left-[-100%] h-full w-[200%] max-w-none object-cover transition-all duration-700"
                  style={{
                    filter:
                      activeFinish === "polished"
                        ? "brightness(1.15) contrast(1.2)"
                        : activeFinish === "honed"
                        ? "brightness(0.95) contrast(1.05)"
                        : "brightness(0.92) contrast(1.3)",
                  }}
                />
              </motion.div>

              {/* Stage 4 Interactive Finish Selector */}
              {currentStageIndex === 3 && (
                <div className="absolute top-4 right-4 z-30 flex items-center gap-1 rounded-full border border-white/20 bg-ink/85 p-1 backdrop-blur-md animate-rise">
                  {(["polished", "honed", "leathered"] as StoneFinishType[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setActiveFinish(f)}
                      className={`rounded-full px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] transition-all duration-300 ${
                        activeFinish === f
                          ? "bg-gold text-ink font-bold shadow-md"
                          : "text-ivory/60 hover:text-ivory hover:bg-white/5"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              )}

              {/* Dynamic Specular Sheen (Moves with cursor and light source) */}
              <div
                className="pointer-events-none absolute inset-0 mix-blend-color-dodge transition-opacity duration-300"
                style={{
                  background: `radial-gradient(circle at ${mousePos.x * 100}% ${
                    mousePos.y * 100
                  }%, rgba(255,235,185,0.35) 0%, transparent 55%)`,
                  opacity: activeFinish === "polished" ? 0.9 : 0.25,
                }}
              />

              {/* Stage 2 Laser Cut Line */}
              <motion.div
                style={{ opacity: laserOpacity }}
                className="pointer-events-none absolute inset-y-0 left-1/2 -ml-[1px] w-[2px] bg-gradient-to-b from-transparent via-gold to-transparent shadow-[0_0_24px_rgba(235,190,110,1)]"
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-gold/90 text-[8px] font-bold text-ink shadow-[0_0_20px_#c69b56]">
                  ⚡
                </div>
              </motion.div>

              {/* Stage 3 Interactive Macro Hotspots */}
              <motion.div style={{ opacity: hotspotsOpacity }}>
                <StoneMacroHotspots
                  activeId={activeHotspotId}
                  onSelect={setActiveHotspotId}
                  visible={currentStageIndex === 2}
                />
              </motion.div>

              {/* Stage 5 Penthouse Architecture Overlay */}
              <motion.div
                style={{ opacity: penthouseOpacity }}
                className="pointer-events-none absolute inset-0 z-20 overflow-hidden bg-black/40 backdrop-blur-[2px]"
              >
                <img
                  src="/images/waterfall.jpg"
                  alt="Penthouse Granite Waterfall Island"
                  className="h-full w-full object-cover opacity-90 transition-opacity duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                  <div className="rounded-xl border border-white/20 bg-ink/80 p-4 backdrop-blur-md">
                    <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-gold">
                      Penthouse Residence // Bengaluru
                    </span>
                    <h4 className="font-serif text-2xl text-ivory">
                      Bespoke Cantilevered Waterfall
                    </h4>
                  </div>
                  <a
                    href="#contact"
                    className="pointer-events-auto gold-button !py-3 !px-5 text-xs shadow-xl"
                  >
                    Commission Your Space <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              </motion.div>
            </div>

            {/* In-slab Stage watermark */}
            <div className="pointer-events-none absolute top-4 left-4 z-20 flex items-center gap-2 rounded-full border border-white/15 bg-ink/70 px-3.5 py-1 text-[9px] font-mono font-semibold uppercase tracking-[0.22em] text-ivory/80 backdrop-blur-md">
              <span>{currentStone.name}</span>
              <span className="text-gold">·</span>
              <span>{currentStone.category}</span>
            </div>
          </motion.div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* BOTTOM NARRATIVE BAR & TELEMETRY HUD */}
        {/* ------------------------------------------------------------- */}
        <div className="relative z-40 mx-auto w-full max-w-[1360px] px-6 pb-6 sm:px-12">
          <div className="grid items-end gap-6 md:grid-cols-[1.4fr_1fr_220px]">
            {/* Story narration (changes smoothly based on stage) */}
            <div className="min-h-[110px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={stageData.num}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                >
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
                    <span className="h-px w-6 bg-gold" />
                    <span>{stageData.kicker}</span>
                  </div>
                  <h3 className="mt-1 font-serif text-3xl leading-tight tracking-[-0.03em] text-ivory sm:text-4xl">
                    {stageData.title}
                  </h3>
                  <p className="mt-2 max-w-xl text-xs leading-5 text-ivory/65 sm:text-sm sm:leading-6">
                    {stageData.copy}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Telemetry badge / Quick specs */}
            <div className="hidden border-l border-white/10 pl-6 md:block">
              <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-ivory/40">
                Technical Telemetry
              </div>
              <div className="mt-1 font-mono text-xs font-semibold text-gold/90">
                {stageData.badge}
              </div>
              <div className="mt-2 flex items-center gap-2 text-[10px] font-medium text-ivory/50">
                <ShieldCheck className="h-3.5 w-3.5 text-gold" />
                <span>Certified Indian Architectural Standard</span>
              </div>
            </div>

            {/* Scroll navigation dots */}
            <div className="flex flex-col items-end gap-2">
              <div className="text-[9px] font-mono uppercase tracking-[0.25em] text-ivory/40">
                Chapter 0{currentStageIndex + 1} / 05
              </div>
              <div className="flex items-center gap-2">
                {STAGES.map((s, idx) => (
                  <button
                    key={s.num}
                    onClick={() => jumpToStage(idx)}
                    className={`group relative flex h-7 items-center gap-1.5 rounded-full px-2 transition-all duration-300 ${
                      currentStageIndex === idx
                        ? "bg-gold/20 border border-gold text-gold"
                        : "border border-white/10 text-ivory/40 hover:border-white/30 hover:text-ivory"
                    }`}
                    aria-label={`Jump to stage ${s.num}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full transition-all ${
                        currentStageIndex === idx ? "bg-gold scale-125" : "bg-white/40"
                      }`}
                    />
                    <span className="hidden font-mono text-[9px] font-bold uppercase tracking-wider group-hover:inline sm:inline">
                      {s.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Scroll down prompt */}
              <div className="mt-1 flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] text-ivory/40">
                <span>Scroll to explore</span>
                <ArrowDown className="h-3 w-3 text-gold animate-bounce" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom continuous progress bar */}
        <motion.div
          style={{ scaleX: smoothProgress }}
          className="absolute bottom-0 inset-x-0 h-1 origin-left bg-gradient-to-r from-gold/50 via-gold to-yellow-200"
        />
      </div>
    </section>
  );
}
