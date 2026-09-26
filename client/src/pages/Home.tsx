import { useEffect, useState } from "react";
import { 
  ArrowRight, 
  ArrowUpRight, 
  Award, 
  CheckCircle2, 
  ChevronLeft,
  ChevronRight, 
  Factory, 
  Globe, 
  Instagram, 
  Layers, 
  Linkedin, 
  Mail, 
  MapPin, 
  Menu, 
  MessageSquare, 
  Package, 
  Phone, 
  Scissors, 
  Search, 
  ShieldCheck, 
  Sparkles, 
  Truck, 
  X, 
  Youtube 
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_COLLECTIONS,
  DEFAULT_CONTENT,
  DEFAULT_FINISHES,
  DEFAULT_GALLERY,
  DEFAULT_PRODUCTS,
  DEFAULT_SECTION_VISIBILITY,
} from "@shared/contentDefaults";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    projectType: "",
    message: ""
  });

  // Live content from CMS
  const contentQuery = trpc.site.content.useQuery();
  const productsQuery = trpc.site.products.useQuery();
  const collectionsQuery = trpc.site.collections.useQuery();
  const finishesQuery = trpc.site.finishes.useQuery();
  const galleryQuery = trpc.site.gallery.useQuery();
  const sectionVisibilityQuery = trpc.site.sectionVisibility.useQuery();

  const content = contentQuery.data ?? DEFAULT_CONTENT;

  const sectionVisibilityMap = (sectionVisibilityQuery.data ?? DEFAULT_SECTION_VISIBILITY).reduce(
    (acc, curr) => {
      acc[curr.sectionKey] = curr.isVisible === 1;
      return acc;
    },
    {} as Record<string, boolean>
  );

  const isSectionVisible = (key: string) => sectionVisibilityMap[key] ?? true;

  // Products collection mapped from CMS or defaults
  const productCollection = productsQuery.data?.length
    ? productsQuery.data.map((p) => ({
        name: p.name,
        description: p.description,
        image: p.imageUrl,
      }))
    : DEFAULT_PRODUCTS.map((p) => ({
        name: p.name,
        description: p.description,
        image: p.imageUrl,
      }));

  const [productStartIndex, setProductStartIndex] = useState(0);

  const nextProduct = () => {
    if (!productCollection.length) return;
    setProductStartIndex((prev) => (prev + 1) % productCollection.length);
  };

  const prevProduct = () => {
    if (!productCollection.length) return;
    setProductStartIndex((prev) => (prev - 1 + productCollection.length) % productCollection.length);
  };

  // Stones collection mapped from CMS or defaults
  const stoneCollection = collectionsQuery.data?.length
    ? collectionsQuery.data.map((c) => ({
        name: c.name,
        description: c.description,
        image: c.imageUrl,
      }))
    : DEFAULT_COLLECTIONS.map((c) => ({
        name: c.name,
        description: c.description,
        image: c.imageUrl,
      }));

  const [stoneStartIndex, setStoneStartIndex] = useState(0);

  const nextStone = () => {
    if (!stoneCollection.length) return;
    setStoneStartIndex((prev) => (prev + 1) % stoneCollection.length);
  };

  const prevStone = () => {
    if (!stoneCollection.length) return;
    setStoneStartIndex((prev) => (prev - 1 + stoneCollection.length) % stoneCollection.length);
  };

  // Surface Finishes mapped from CMS or defaults
  const finishesCollection = finishesQuery.data?.length
    ? finishesQuery.data.map((f) => ({
        name: f.name,
        tagline: f.tagline,
        description: f.description,
        image: f.imageUrl,
        badge: f.badge,
      }))
    : DEFAULT_FINISHES.map((f) => ({
        name: f.name,
        tagline: f.tagline,
        description: f.description,
        image: f.imageUrl,
        badge: f.badge,
      }));

  const [finishStartIndex, setFinishStartIndex] = useState(0);

  const nextFinish = () => {
    if (!finishesCollection.length) return;
    setFinishStartIndex((prev) => (prev + 1) % finishesCollection.length);
  };

  const prevFinish = () => {
    if (!finishesCollection.length) return;
    setFinishStartIndex((prev) => (prev - 1 + finishesCollection.length) % finishesCollection.length);
  };

  // Gallery mapped from CMS or defaults
  const galleryImages = galleryQuery.data?.length
    ? galleryQuery.data.map((g) => g.imageUrl)
    : DEFAULT_GALLERY.map((g) => g.imageUrl);

  // Gallery state
  const GALLERY_PAGE_SIZE = 20; // 5 rows × 4 cols
  const [galleryExpanded, setGalleryExpanded] = useState(false);
  const [galleryPage, setGalleryPage] = useState(0);

  const totalGalleryPages = Math.max(1, Math.ceil(galleryImages.length / GALLERY_PAGE_SIZE));

  const visibleGalleryImages = galleryExpanded
    ? galleryImages.slice(galleryPage * GALLERY_PAGE_SIZE, galleryPage * GALLERY_PAGE_SIZE + GALLERY_PAGE_SIZE)
    : galleryImages.slice(0, 4);

  const galleryNextPage = () => {
    setGalleryPage((prev) => Math.min(prev + 1, totalGalleryPages - 1));
  };

  const galleryPrevPage = () => {
    setGalleryPage((prev) => Math.max(prev - 1, 0));
  };

  const enquiryMutation = trpc.site.enquiry.useMutation({
    onSuccess: () => {
      setForm({ name: "", email: "", phone: "", projectType: "", message: "" });
    },
    onError: () => {}
  });

  const updateForm = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleEnquirySubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      enquiryMutation.mutate({
        name: form.name,
        email: form.email || "inquiry@client.com",
        phone: form.phone,
        projectType: form.projectType || "Not Specified",
        message: form.message,
      });

      const webhookUrl = "https://script.google.com/macros/s/AKfycbxI1cQu_El0I6NJ5zdinyvMyrimMzMn6dgCxWfM-8Cc--6cpKTfTjbM_IOyb3E4qfEn/exec";
      await fetch(webhookUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        }),
      });

      toast.success("Thank you for your enquiry. We will contact you shortly.");
      setForm({ name: "", email: "", phone: "", projectType: "", message: "" });
    } catch {
      toast.error("Please verify your details and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0d0f12] text-[#e8e6e1] selection:bg-[#c8a35f] selection:text-[#0d0f12]">
      {/* ======================================================== */}
      {/* 1. HEADER / NAVBAR                                       */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-50 w-full bg-[#0d0f12]/95 backdrop-blur-md border-b border-white/5">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-4 lg:px-12">
          {/* Logo brand */}
          <a href="#top" onClick={() => scrollToSection("top")} className="flex flex-col items-center group">
            <span className="font-cinzel text-xl sm:text-2xl font-bold tracking-[0.18em] text-[#d4af37]">SV</span>
            <span className="font-cinzel text-[8.5px] uppercase tracking-[0.38em] text-white/80 -mt-0.5">GRANITES</span>
          </a>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-9 text-[11px] font-medium uppercase tracking-[0.22em] text-[#9ca3af]">
            {isSectionVisible("hero") && <button onClick={() => scrollToSection("top")} className="hover:text-white transition-colors">HOME</button>}
            {isSectionVisible("about") && <button onClick={() => scrollToSection("about")} className="hover:text-white transition-colors">ABOUT</button>}
            {isSectionVisible("products") && <button onClick={() => scrollToSection("products")} className="hover:text-white transition-colors">PRODUCTS</button>}
            {isSectionVisible("collections") && <button onClick={() => scrollToSection("gallery")} className="hover:text-white transition-colors">STONES</button>}
            {isSectionVisible("finishes") && <button onClick={() => scrollToSection("finishings")} className="hover:text-white transition-colors">FINISHINGS</button>}
            {isSectionVisible("craft") && <button onClick={() => scrollToSection("craft")} className="hover:text-white transition-colors">OUR CRAFT</button>}
            {isSectionVisible("gallery") && <button onClick={() => scrollToSection("photo-gallery")} className="hover:text-white transition-colors">GALLERY</button>}
            {isSectionVisible("contact") && <button onClick={() => scrollToSection("contact")} className="hover:text-white transition-colors">CONTACT</button>}
          </nav>

          {/* Mobile hamburger only */}
          <div className="flex items-center">
            <button 
              className="grid h-9 w-9 place-items-center border border-white/20 text-white md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation"
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="border-b border-white/10 bg-[#121519] px-6 py-6 md:hidden">
            <div className="flex flex-col gap-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#9ca3af]">
              {isSectionVisible("hero") && <button onClick={() => scrollToSection("top")} className="text-left hover:text-white py-1">HOME</button>}
              {isSectionVisible("about") && <button onClick={() => scrollToSection("about")} className="text-left hover:text-white py-1">ABOUT</button>}
              {isSectionVisible("products") && <button onClick={() => scrollToSection("products")} className="text-left hover:text-white py-1">PRODUCTS</button>}
              {isSectionVisible("collections") && <button onClick={() => scrollToSection("gallery")} className="text-left hover:text-white py-1">STONES</button>}
              {isSectionVisible("finishes") && <button onClick={() => scrollToSection("finishings")} className="text-left hover:text-white py-1">FINISHINGS</button>}
              {isSectionVisible("craft") && <button onClick={() => scrollToSection("craft")} className="text-left hover:text-white py-1">OUR CRAFT</button>}
              {isSectionVisible("gallery") && <button onClick={() => scrollToSection("photo-gallery")} className="text-left hover:text-white py-1">GALLERY</button>}
              {isSectionVisible("facility") && <button onClick={() => scrollToSection("facility")} className="text-left hover:text-white py-1">FACILITY</button>}
              {isSectionVisible("contact") && <button onClick={() => scrollToSection("contact")} className="text-left hover:text-white py-1">CONTACT</button>}
              {isSectionVisible("contact") && (
                <button 
                  onClick={() => scrollToSection("contact")}
                  className="mt-3 border border-[#c8a35f] py-2 text-center text-[#c8a35f]"
                >
                  REQUEST A QUOTE
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <main id="top">
        {/* ======================================================== */}
        {/* 2. HERO SECTION                                          */}
        {/* ======================================================== */}
        {isSectionVisible("hero") && (
          <section className="relative min-h-[580px] lg:min-h-[660px] flex items-center overflow-hidden">
            {/* Hero background image */}
            <div className="absolute inset-0 z-0">
              <img 
                src={content.heroImage || "/images/hero-quarry.jpg"} 
                alt="Monumental Indian granite quarry at sunset" 
                className="h-full w-full object-cover object-right lg:object-center brightness-[0.82] contrast-[1.05]"
              />
              {/* Dark gradient wash matching reference */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0d0f12] via-[#0d0f12]/80 to-transparent w-full lg:w-[65%]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f12] via-transparent to-[#0d0f12]/30" />
            </div>

            <div className="relative z-10 mx-auto w-full max-w-[1440px] px-6 lg:px-12 py-16 lg:py-24">
              <div className="max-w-2xl">
                {/* Eyebrow kicker */}
                <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.32em] text-[#9ca3af] mb-4">
                  {content.heroEyebrow || "INDIAN GRANITE EXPORTER"}
                </div>

                {/* Title — company name */}
                <h1 className="font-cinzel text-4xl sm:text-5xl lg:text-[4rem] font-semibold leading-[1.08] tracking-tight text-white mb-6">
                  {(() => {
                    const title = content.heroTitle || "Sri Venkateswara Granites.";
                    const parts = title.split(" ");
                    if (parts.length > 1) {
                      const last = parts.pop();
                      return (
                        <>
                          {parts.join(" ")}<br />
                          <span className="text-[#c8a35f]">{last}</span>
                        </>
                      );
                    }
                    return <span className="text-[#c8a35f]">{title}</span>;
                  })()}
                </h1>

                {/* Subtext */}
                <p className="text-sm sm:text-base text-gray-300 font-normal leading-relaxed max-w-lg mb-8">
                  {content.heroCopy || "Premium Indian granite products manufactured and prepared for international markets."}
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-wrap items-center gap-4 mb-10">
                  <button 
                    onClick={() => scrollToSection("products")}
                    className="inline-flex items-center gap-2 bg-[#d4af37] hover:bg-[#dec083] text-[#0d0f12] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300"
                  >
                    EXPLORE OUR GRANITES <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={() => scrollToSection("contact")}
                    className="inline-flex items-center border border-white/30 hover:border-white text-white px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] transition-all duration-300"
                  >
                    REQUEST A QUOTE
                  </button>
                </div>

                {/* Bottom indicator text */}
                <div className="text-[9px] uppercase tracking-[0.3em] text-gray-400 flex items-center gap-3">
                  <span>INDIA</span>
                  <span className="inline-block h-1 w-1 rounded-full bg-gray-500" />
                  <span>MANUFACTURING</span>
                  <span className="inline-block h-1 w-1 rounded-full bg-gray-500" />
                  <span>GLOBAL EXPORT</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* 3. KEY METRICS BAR                                       */}
        {/* ======================================================== */}
        <section className="bg-[#121519] border-y border-white/5 py-8">
          <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
              {/* Stat 1 */}
              <div className="flex items-center gap-4">
                <div className="text-[#c8a35f]">
                  <Award className="h-6 w-6 stroke-[1.5]" />
                </div>
                <div>
                  <div className="text-sm sm:text-base font-bold text-white tracking-wide">25+</div>
                  <div className="text-[11px] text-gray-400">Years of Experience</div>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="flex items-center gap-4">
                <div className="text-[#c8a35f]">
                  <Globe className="h-6 w-6 stroke-[1.5]" />
                </div>
                <div>
                  <div className="text-sm sm:text-base font-bold text-white tracking-wide">Export Ready</div>
                  <div className="text-[11px] text-gray-400">International Packaging</div>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="flex items-center gap-4">
                <div className="text-[#c8a35f]">
                  <ShieldCheck className="h-6 w-6 stroke-[1.5]" />
                </div>
                <div>
                  <div className="text-sm sm:text-base font-bold text-white tracking-wide">Quality Focused</div>
                  <div className="text-[11px] text-gray-400">Every Order Inspected</div>
                </div>
              </div>

              {/* Stat 4 */}
              <div className="flex items-center gap-4">
                <div className="text-[#c8a35f]">
                  <Factory className="h-6 w-6 stroke-[1.5]" />
                </div>
                <div>
                  <div className="text-sm sm:text-base font-bold text-white tracking-wide">Direct Manufacturer</div>
                  <div className="text-[11px] text-gray-400">From India</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 4. OUR PRODUCTS (LIGHT SECTION)                          */}
        {/* ======================================================== */}
        {isSectionVisible("products") && (
          <section id="products" className="bg-[#f7f5f0] text-[#121519] py-16 lg:py-24">
            <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
              <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-10 lg:gap-14 items-start">
                {/* Left Column Text + Controls */}
                <div className="pt-2">
                  <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#8c8273] mb-3">
                    OUR PRODUCTS
                  </div>
                  <h2 className="font-cinzel text-3xl sm:text-4xl font-semibold leading-tight text-[#151310] mb-5">
                    Crafted for<br />Lasting Impressions
                  </h2>
                  <p className="text-sm text-[#5a554d] leading-relaxed mb-8">
                    From monumental structures to elegant accessories, our granite products are designed to meet the highest standards of quality and durability.
                  </p>

                  {/* Left / Right Carousel Controls */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={prevProduct}
                      aria-label="Previous product"
                      className="group grid h-10 w-10 place-items-center rounded-full border border-black/20 bg-black/5 hover:border-[#c8a35f] hover:bg-[#c8a35f] text-[#121519] hover:text-white transition-all duration-300 shadow-sm"
                    >
                      <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
                    </button>
                    <button
                      onClick={nextProduct}
                      aria-label="Next product"
                      className="group grid h-10 w-10 place-items-center rounded-full border border-black/20 bg-black/5 hover:border-[#c8a35f] hover:bg-[#c8a35f] text-[#121519] hover:text-white transition-all duration-300 shadow-sm"
                    >
                      <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                    <span className="text-[10px] font-mono tracking-widest text-[#8c8273] ml-2">
                      {String(productStartIndex + 1).padStart(2, "0")} / {String(productCollection.length).padStart(2, "0")}
                    </span>
                  </div>
                </div>

                {/* Right Column: Cyclic Carousel Window */}
                <div className="relative group/pcarousel">
                  {/* Overlay left arrow */}
                  <button
                    onClick={prevProduct}
                    aria-label="Previous product item"
                    className="absolute -left-4 top-1/3 -translate-y-1/2 z-20 hidden md:grid h-12 w-8 place-items-center bg-white/90 hover:bg-[#c8a35f] text-[#121519] hover:text-white rounded-r border-y border-r border-black/15 transition-all opacity-0 group-hover/pcarousel:opacity-100 shadow"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  {/* Overlay right arrow */}
                  <button
                    onClick={nextProduct}
                    aria-label="Next product item"
                    className="absolute -right-4 top-1/3 -translate-y-1/2 z-20 hidden md:grid h-12 w-8 place-items-center bg-white/90 hover:bg-[#c8a35f] text-[#121519] hover:text-white rounded-l border-y border-l border-black/15 transition-all opacity-0 group-hover/pcarousel:opacity-100 shadow"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>

                  {/* 3 visible cards cycling in infinite wheel fashion */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 transition-all duration-500">
                    {[0, 1, 2].map((offset) => {
                      const item = productCollection[(productStartIndex + offset) % productCollection.length];
                      return (
                        <div key={`${item.name}-${offset}`} className="group cursor-pointer">
                          <div className="aspect-[4/3] overflow-hidden bg-gray-200 mb-4 border border-black/5 shadow-sm rounded-sm">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>
                          <div className="mb-1.5">
                            <h3 className="font-cinzel text-xs font-bold uppercase tracking-[0.16em] text-[#151310] group-hover:text-[#c8a35f] transition-colors">
                              {item.name}
                            </h3>
                          </div>
                          <p className="text-[11px] text-[#6d675d] leading-snug">
                            {item.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* 5. STONE COLLECTION (DARK TEXTURED SECTION)              */}
        {/* ======================================================== */}
        {isSectionVisible("collections") && (
          <section id="gallery" className="bg-[#0f1217] py-16 lg:py-24 border-t border-white/5 relative">
            <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
              <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-10 lg:gap-14 items-start">
                {/* Left Column Text */}
                <div className="pt-2">
                  <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#8c94a0] mb-3">
                    STONE COLLECTION
                  </div>
                  <h2 className="font-cinzel text-3xl sm:text-4xl font-semibold leading-tight text-white mb-5">
                    Nature's Beauty.<br />In Every Shade.
                  </h2>
                  <p className="text-sm text-gray-400 leading-relaxed mb-6">
                    Explore our premium range of granite stones, known for their unique patterns, colours and durability.
                  </p>

                  {/* Left / Right Carousel Controls (Netflix / Prime Video style) */}
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={prevStone}
                      aria-label="Previous stones"
                      className="group grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/5 hover:border-[#c8a35f] hover:bg-[#c8a35f] text-white hover:text-[#0d0f12] transition-all duration-300 shadow-md"
                    >
                      <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
                    </button>
                    <button 
                      onClick={nextStone}
                      aria-label="Next stones"
                      className="group grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/5 hover:border-[#c8a35f] hover:bg-[#c8a35f] text-white hover:text-[#0d0f12] transition-all duration-300 shadow-md"
                    >
                      <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                    <span className="text-[10px] font-mono tracking-widest text-gray-400 ml-2">
                      {String(stoneStartIndex + 1).padStart(2, "0")} / {String(stoneCollection.length).padStart(2, "0")}
                    </span>
                  </div>
                </div>

                {/* Right Column: Cyclic Carousel Window */}
                <div className="relative group/carousel">
                  {/* Overlay left arrow for direct hover navigation (Prime Video style) */}
                  <button 
                    onClick={prevStone}
                    aria-label="Previous item"
                    className="absolute -left-4 top-1/3 -translate-y-1/2 z-20 hidden md:grid h-12 w-8 place-items-center bg-black/80 hover:bg-[#c8a35f] text-white hover:text-black rounded-r border-y border-r border-white/20 transition-all opacity-0 group-hover/carousel:opacity-100"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  {/* Overlay right arrow for direct hover navigation (Prime Video style) */}
                  <button 
                    onClick={nextStone}
                    aria-label="Next item"
                    className="absolute -right-4 top-1/3 -translate-y-1/2 z-20 hidden md:grid h-12 w-8 place-items-center bg-black/80 hover:bg-[#c8a35f] text-white hover:text-black rounded-l border-y border-l border-white/20 transition-all opacity-0 group-hover/carousel:opacity-100"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>

                  {/* 4 visible cards cycling in infinite wheel fashion */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-5 transition-all duration-500">
                    {[0, 1, 2, 3].map((offset) => {
                      const item = stoneCollection[(stoneStartIndex + offset) % stoneCollection.length];
                      return (
                        <div key={`${item.name}-${offset}`} className="group cursor-pointer">
                          <div className="aspect-[4/3] overflow-hidden bg-black mb-3 border border-white/10 shadow-md rounded-sm">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          </div>
                          <h3 className="font-cinzel text-[11px] font-bold uppercase tracking-[0.14em] text-white mb-1 group-hover:text-[#c8a35f] transition-colors">
                            {item.name}
                          </h3>
                          <p className="text-[10px] text-gray-400 leading-tight whitespace-pre-line">
                            {item.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* 6. SURFACE FINISHINGS (LIGHT SECTION — alternates dark)  */}
        {/* ======================================================== */}
        {isSectionVisible("finishes") && (
          <section id="finishings" className="bg-[#f7f5f0] text-[#121519] py-16 lg:py-24 border-t border-black/5">
            <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
              <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-10 lg:gap-14 items-start">
                {/* Left Column Text + Controls */}
                <div className="pt-2">
                  <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#8c8273] mb-3">
                    SURFACE FINISHINGS
                  </div>
                  <h2 className="font-cinzel text-3xl sm:text-4xl font-semibold leading-tight text-[#151310] mb-5">
                    The Art of<br />Every Surface.
                  </h2>
                  <p className="text-sm text-[#5a554d] leading-relaxed mb-8">
                    From mirror-polished luxury to rugged flamed textures — each finish transforms stone into a distinct architectural statement.
                  </p>

                  {/* Left / Right Carousel Controls */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={prevFinish}
                      aria-label="Previous finish"
                      className="group grid h-10 w-10 place-items-center rounded-full border border-black/20 bg-black/5 hover:border-[#c8a35f] hover:bg-[#c8a35f] text-[#121519] hover:text-white transition-all duration-300 shadow-sm"
                    >
                      <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
                    </button>
                    <button
                      onClick={nextFinish}
                      aria-label="Next finish"
                      className="group grid h-10 w-10 place-items-center rounded-full border border-black/20 bg-black/5 hover:border-[#c8a35f] hover:bg-[#c8a35f] text-[#121519] hover:text-white transition-all duration-300 shadow-sm"
                    >
                      <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                    <span className="text-[10px] font-mono tracking-widest text-[#8c8273] ml-2">
                      {String(finishStartIndex + 1).padStart(2, "0")} / {String(finishesCollection.length).padStart(2, "0")}
                    </span>
                  </div>
                </div>

                {/* Right Column: Cyclic Carousel Window */}
                <div className="relative group/fcarousel">
                  {/* Overlay left arrow (Prime Video / Netflix style hover) */}
                  <button
                    onClick={prevFinish}
                    aria-label="Previous finish item"
                    className="absolute -left-4 top-1/3 -translate-y-1/2 z-20 hidden md:grid h-12 w-8 place-items-center bg-white/90 hover:bg-[#c8a35f] text-[#121519] hover:text-white rounded-r border-y border-r border-black/15 transition-all opacity-0 group-hover/fcarousel:opacity-100 shadow"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  {/* Overlay right arrow */}
                  <button
                    onClick={nextFinish}
                    aria-label="Next finish item"
                    className="absolute -right-4 top-1/3 -translate-y-1/2 z-20 hidden md:grid h-12 w-8 place-items-center bg-white/90 hover:bg-[#c8a35f] text-[#121519] hover:text-white rounded-l border-y border-l border-black/15 transition-all opacity-0 group-hover/fcarousel:opacity-100 shadow"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>

                  {/* 4 visible cards cycling in infinite wheel fashion */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-5 transition-all duration-500">
                    {[0, 1, 2, 3].map((offset) => {
                      const item = finishesCollection[(finishStartIndex + offset) % finishesCollection.length];
                      return (
                        <div key={`${item.name}-${offset}`} className="group cursor-pointer">
                          <div className="aspect-[4/3] overflow-hidden bg-gray-200 mb-3 border border-black/8 shadow-sm rounded-sm">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          </div>
                          {/* Badge */}
                          <div className="mb-1.5">
                            <span className="inline-block text-[8px] font-bold uppercase tracking-[0.18em] bg-[#f0ede6] border border-black/10 text-[#8c8273] px-2 py-0.5 rounded-sm">
                              {item.badge}
                            </span>
                          </div>
                          <h3 className="font-cinzel text-[11px] font-bold uppercase tracking-[0.14em] text-[#151310] mb-1 group-hover:text-[#c8a35f] transition-colors leading-snug">
                            {item.name}
                          </h3>
                          <p className="text-[10px] text-[#6d675d] leading-tight">
                            {item.tagline}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* 7. OUR CRAFT (LIGHT ALABASTER WITH CUTTING MACHINE)      */}
        {/* ======================================================== */}
        {isSectionVisible("craft") && (
          <section id="craft" className="bg-[#edeae1] text-[#121519] border-y border-black/10 overflow-hidden">
            <div className="mx-auto max-w-[1440px]">
              <div className="grid grid-cols-1 lg:grid-cols-[48%_52%] items-stretch">
                {/* Left Machine Image */}
                <div className="relative min-h-[360px] lg:min-h-[460px] overflow-hidden">
                  <img 
                    src={content.aboutImage || "/images/craft-cutting.jpg"} 
                    alt="Bridge saw granite cutting machine with operator" 
                    className="h-full w-full object-cover object-center"
                  />
                </div>

                {/* Right Process Content */}
                <div className="p-8 lg:p-14 flex flex-col justify-center">
                  <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#847968] mb-2">
                    OUR CRAFT
                  </div>
                  <h2 className="font-cinzel text-3xl sm:text-4xl font-semibold leading-tight text-[#151310] mb-4 whitespace-pre-line">
                    {content.aboutTitle || "NATURE CREATES IT.\nWE PERFECT IT."}
                  </h2>
                  <p className="text-sm text-[#5c5447] leading-relaxed mb-8 max-w-xl">
                    {content.aboutCopy || "From raw granite selection to cutting, shaping, polishing, finishing and export packaging, every stage is handled with attention to detail."}
                  </p>

                  {/* 6 Process Steps Grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-4 border-t border-black/10">
                    {/* Step 1 */}
                    <div className="text-center group">
                      <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full border border-black/15 bg-white/70 group-hover:border-[#c8a35f] group-hover:bg-white transition-colors">
                        <Search className="h-5 w-5 text-[#3b362e]" />
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#151310]">SELECT</div>
                      <div className="text-[9px] text-[#786f62]">Raw material</div>
                    </div>

                    {/* Step 2 */}
                    <div className="text-center group">
                      <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full border border-black/15 bg-white/70 group-hover:border-[#c8a35f] group-hover:bg-white transition-colors">
                        <Scissors className="h-5 w-5 text-[#3b362e]" />
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#151310]">PROCESS</div>
                      <div className="text-[9px] text-[#786f62]">Cutting & shaping</div>
                    </div>

                    {/* Step 3 */}
                    <div className="text-center group">
                      <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full border border-black/15 bg-white/70 group-hover:border-[#c8a35f] group-hover:bg-white transition-colors">
                        <Sparkles className="h-5 w-5 text-[#3b362e]" />
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#151310]">FINISH</div>
                      <div className="text-[9px] text-[#786f62]">Polishing & finishing</div>
                    </div>

                    {/* Step 4 */}
                    <div className="text-center group">
                      <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full border border-black/15 bg-white/70 group-hover:border-[#c8a35f] group-hover:bg-white transition-colors">
                        <ShieldCheck className="h-5 w-5 text-[#3b362e]" />
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#151310]">INSPECT</div>
                      <div className="text-[9px] text-[#786f62]">Quality checks</div>
                    </div>

                    {/* Step 5 */}
                    <div className="text-center group">
                      <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full border border-black/15 bg-white/70 group-hover:border-[#c8a35f] group-hover:bg-white transition-colors">
                        <Package className="h-5 w-5 text-[#3b362e]" />
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#151310]">PACK</div>
                      <div className="text-[9px] text-[#786f62]">Export packaging</div>
                    </div>

                    {/* Step 6 */}
                    <div className="text-center group">
                      <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full border border-black/15 bg-white/70 group-hover:border-[#c8a35f] group-hover:bg-white transition-colors">
                        <Truck className="h-5 w-5 text-[#3b362e]" />
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#151310]">SHIP</div>
                      <div className="text-[9px] text-[#786f62]">Global logistics</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* 7. WHY SV GRANITES + GLOBAL REACH (DUAL DARK SECTION)    */}
        {/* ======================================================== */}
        {isSectionVisible("about") && (
          <section id="about" className="bg-[#0d0f12] text-white py-16 lg:py-24 border-b border-white/5">
            <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                {/* Left Column: Why SV Granites — 3×2 compact grid, no dead space */}
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-gray-400 mb-2">
                    WHY SV GRANITES
                  </div>
                  <h2 className="font-cinzel text-3xl font-semibold leading-tight text-white mb-8">
                    The Right Partner<br />for Your Stone Needs.
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-6">
                    <div className="flex flex-col gap-1.5">
                      <div className="p-1.5 border border-white/10 rounded-lg text-[#c8a35f] w-fit">
                        <Factory className="h-4 w-4" />
                      </div>
                      <h4 className="text-xs font-bold text-white">Direct Manufacturing</h4>
                      <p className="text-[10px] text-gray-400 leading-snug">Work directly with the source.</p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="p-1.5 border border-white/10 rounded-lg text-[#c8a35f] w-fit">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <h4 className="text-xs font-bold text-white">Consistent Quality</h4>
                      <p className="text-[10px] text-gray-400 leading-snug">Material and finish checked before dispatch.</p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="p-1.5 border border-white/10 rounded-lg text-[#c8a35f] w-fit">
                        <Layers className="h-4 w-4" />
                      </div>
                      <h4 className="text-xs font-bold text-white">Custom Production</h4>
                      <p className="text-[10px] text-gray-400 leading-snug">Tailored to your requirements.</p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="p-1.5 border border-white/10 rounded-lg text-[#c8a35f] w-fit">
                        <Package className="h-4 w-4" />
                      </div>
                      <h4 className="text-xs font-bold text-white">Export Packaging</h4>
                      <p className="text-[10px] text-gray-400 leading-snug">Safe for international transport.</p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="p-1.5 border border-white/10 rounded-lg text-[#c8a35f] w-fit">
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <h4 className="text-xs font-bold text-white">Responsive Communication</h4>
                      <p className="text-[10px] text-gray-400 leading-snug">Clear coordination from enquiry to shipment.</p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="p-1.5 border border-white/10 rounded-lg text-[#c8a35f] w-fit">
                        <Award className="h-4 w-4" />
                      </div>
                      <h4 className="text-xs font-bold text-white">Long-Term Partnerships</h4>
                      <p className="text-[10px] text-gray-400 leading-snug">Built on trust and reliability.</p>
                    </div>
                  </div>
                </div>

                {/* Right Column: Global Reach — animated world map */}
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-gray-400 mb-2">
                    GLOBAL REACH
                  </div>
                  <h2 className="font-cinzel text-3xl font-semibold leading-tight text-white mb-1">
                    FROM INDIA,<br />MADE FOR THE WORLD.
                  </h2>
                  <p className="text-[11px] text-gray-400 mb-5">
                    Manufactured in South India · Prepared for international buyers.
                  </p>

                  {/* ── World Map ── */}
                  <div className="relative w-full aspect-[16/9] bg-[#080c12] border border-white/10 rounded-xl overflow-hidden">
                    <svg
                      className="w-full h-full"
                      viewBox="0 0 1000 500"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        {/* Glow for the traveling dot */}
                        <filter id="dotGlow" x="-150%" y="-150%" width="400%" height="400%">
                          <feGaussianBlur stdDeviation="5" result="blur"/>
                          <feMerge>
                            <feMergeNode in="blur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                        {/* Glow for India origin */}
                        <filter id="originGlow" x="-200%" y="-200%" width="500%" height="500%">
                          <feGaussianBlur stdDeviation="8" result="blur"/>
                          <feMerge>
                            <feMergeNode in="blur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>

                      {/* ── OCEAN FILL ── */}
                      <rect width="1000" height="500" fill="#06090f"/>

                      {/* ── SUBTLE GRID ── */}
                      <line x1="0" y1="250" x2="1000" y2="250" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.06"/>
                      <line x1="500" y1="0" x2="500" y2="500" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.04"/>
                      <line x1="0" y1="167" x2="1000" y2="167" stroke="#ffffff" strokeWidth="0.4" strokeOpacity="0.04"/>
                      <line x1="0" y1="333" x2="1000" y2="333" stroke="#ffffff" strokeWidth="0.4" strokeOpacity="0.04"/>

                      {/* ── BACKGROUND MAP ── */}
                      <image href="/images/world-map-bg.jpg" width="1000" height="500" opacity="0.3" style={{ mixBlendMode: "screen", pointerEvents: "none" }} />

                      {/* ── TRADE ROUTES
                           Equirectangular projection: x=(lon+180)/360*1000  y=(90-lat)/180*500
                           India (73E,19N) → x=703, y=197
                           USA   (95W,37N) → x=236, y=147
                           Canada(79W,44N) → x=281, y=128
                           Europe (0,51N)  → x=500, y=108
                           E.Asia(121E,31N)→ x=836, y=164
                           Australia(145E,38S)→ x=903, y=328
                      ── */}

                      {/* Base dashed path — to USA */}
                      <path d="M 703,197 C 570,60 380,50 236,147" stroke="#c8a35f" strokeWidth="1" strokeDasharray="5 5" strokeOpacity="0.45" fill="none"/>
                      {/* Glowing dot traveling India → USA */}
                      <circle r="3.5" fill="#d4af37" filter="url(#dotGlow)">
                        <animateMotion path="M 703,197 C 570,60 380,50 236,147" dur="4s" begin="0s" repeatCount="indefinite" calcMode="linear"/>
                      </circle>

                      {/* Base dashed path — to Canada */}
                      <path d="M 703,197 C 580,50 430,40 281,128" stroke="#c8a35f" strokeWidth="1" strokeDasharray="5 5" strokeOpacity="0.45" fill="none"/>
                      {/* Glowing dot traveling India → Canada */}
                      <circle r="3.5" fill="#d4af37" filter="url(#dotGlow)">
                        <animateMotion path="M 703,197 C 580,50 430,40 281,128" dur="4.5s" begin="2.2s" repeatCount="indefinite" calcMode="linear"/>
                      </circle>

                      {/* Base dashed path — to Europe */}
                      <path d="M 703,197 C 640,90 570,70 500,108" stroke="#c8a35f" strokeWidth="1" strokeDasharray="5 5" strokeOpacity="0.45" fill="none"/>
                      {/* Glowing dot traveling India → Europe */}
                      <circle r="3.5" fill="#d4af37" filter="url(#dotGlow)">
                        <animateMotion path="M 703,197 C 640,90 570,70 500,108" dur="3.5s" begin="0.8s" repeatCount="indefinite" calcMode="linear"/>
                      </circle>

                      {/* Base dashed path — to Australia */}
                      <path d="M 703,197 C 790,280 855,310 903,328" stroke="#c8a35f" strokeWidth="1" strokeDasharray="5 5" strokeOpacity="0.45" fill="none"/>
                      {/* Glowing dot traveling India → Australia */}
                      <circle r="3.5" fill="#d4af37" filter="url(#dotGlow)">
                        <animateMotion path="M 703,197 C 790,280 855,310 903,328" dur="3s" begin="1.6s" repeatCount="indefinite" calcMode="linear"/>
                      </circle>

                      {/* Base dashed path — to East Asia */}
                      <path d="M 703,197 C 760,155 800,155 836,164" stroke="#c8a35f" strokeWidth="1" strokeDasharray="5 5" strokeOpacity="0.45" fill="none"/>
                      {/* Glowing dot traveling India → East Asia */}
                      <circle r="3.5" fill="#d4af37" filter="url(#dotGlow)">
                        <animateMotion path="M 703,197 C 760,155 800,155 836,164" dur="2.8s" begin="0.4s" repeatCount="indefinite" calcMode="linear"/>
                      </circle>

                      {/* ── DESTINATION DOTS ── */}
                      {/* USA */}
                      <circle cx="236" cy="147" r="4" fill="white" opacity="0.8"/>
                      {/* Canada */}
                      <circle cx="281" cy="128" r="4" fill="white" opacity="0.8"/>
                      {/* Europe */}
                      <circle cx="500" cy="108" r="4" fill="white" opacity="0.8"/>
                      {/* East Asia */}
                      <circle cx="836" cy="164" r="4" fill="white" opacity="0.8"/>
                      {/* Australia */}
                      <circle cx="903" cy="328" r="4" fill="white" opacity="0.8"/>

                      {/* ── INDIA ORIGIN — pulsing gold ring ── */}
                      <circle cx="703" cy="197" r="14" fill="#c8a35f" opacity="0.08" filter="url(#originGlow)">
                        <animate attributeName="r" values="10;18;10" dur="2.2s" repeatCount="indefinite"/>
                        <animate attributeName="opacity" values="0.15;0.04;0.15" dur="2.2s" repeatCount="indefinite"/>
                      </circle>
                      <circle cx="703" cy="197" r="5.5" fill="#d4af37" filter="url(#dotGlow)" opacity="0.95"/>
                      <circle cx="703" cy="197" r="2.5" fill="white"/>
                    </svg>

                    {/* INDIA label — positioned at 70.3% from left, 39.4% from top (703/1000, 197/500) */}
                    <div className="absolute" style={{left: "70.3%", top: "39.4%", transform: "translate(-50%, -180%)"}}>
                      <span className="font-cinzel text-[9px] font-bold text-[#d4af37] bg-black/75 px-2 py-0.5 rounded border border-[#c8a35f]/50 tracking-widest whitespace-nowrap">
                        INDIA
                      </span>
                    </div>

                    {/* Destination list */}
                    <div className="absolute right-3 bottom-3 text-[9px] text-gray-300 space-y-1 bg-black/80 backdrop-blur-sm p-2.5 rounded border border-white/10">
                      <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#c8a35f] shrink-0"/> USA</div>
                      <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#c8a35f] shrink-0"/> CANADA</div>
                      <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#c8a35f] shrink-0"/> EUROPE</div>
                      <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#c8a35f] shrink-0"/> ASIA</div>
                      <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#c8a35f] shrink-0"/> AUSTRALIA</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* 8.5 GALLERY SECTION (LIGHT — alternates after dark)      */}
        {/* ======================================================== */}
        {isSectionVisible("gallery") && (
          <section id="photo-gallery" className="bg-[#f7f5f0] text-[#121519] py-16 lg:py-24 border-t border-black/5">
            <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#8c8273] mb-3">
                    GALLERY
                  </div>
                  <h2 className="font-cinzel text-3xl sm:text-4xl font-semibold leading-tight text-[#151310]">
                    Stone in Every<br />Frame.
                  </h2>
                </div>

                {/* Pagination arrows — only visible when expanded */}
                {galleryExpanded && (
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <button
                      onClick={galleryPrevPage}
                      disabled={galleryPage === 0}
                      aria-label="Previous gallery page"
                      className="group grid h-11 w-11 place-items-center border border-black/20 bg-black/5 hover:border-[#c8a35f] hover:bg-[#c8a35f] text-[#121519] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 rounded-sm"
                    >
                      <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
                    </button>
                    <span className="text-[10px] font-mono tracking-widest text-[#8c8273] min-w-[3.5rem] text-center">
                      {String(galleryPage + 1).padStart(2, "0")} / {String(totalGalleryPages).padStart(2, "0")}
                    </span>
                    <button
                      onClick={galleryNextPage}
                      disabled={galleryPage >= totalGalleryPages - 1}
                      aria-label="Next gallery page"
                      className="group grid h-11 w-11 place-items-center border border-black/20 bg-black/5 hover:border-[#c8a35f] hover:bg-[#c8a35f] text-[#121519] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 rounded-sm"
                    >
                      <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Gallery Grid */}
              <div className="relative">
                {/* Left edge arrow — visible only when expanded */}
                {galleryExpanded && (
                  <button
                    onClick={galleryPrevPage}
                    disabled={galleryPage === 0}
                    aria-label="Previous gallery page"
                    className="absolute -left-5 top-1/2 -translate-y-1/2 z-20 hidden lg:grid h-14 w-9 place-items-center bg-white/90 hover:bg-[#c8a35f] text-[#121519] hover:text-white border-y border-r border-black/15 rounded-r shadow disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                )}

                {/* Right edge arrow — visible only when expanded */}
                {galleryExpanded && (
                  <button
                    onClick={galleryNextPage}
                    disabled={galleryPage >= totalGalleryPages - 1}
                    aria-label="Next gallery page"
                    className="absolute -right-5 top-1/2 -translate-y-1/2 z-20 hidden lg:grid h-14 w-9 place-items-center bg-white/90 hover:bg-[#c8a35f] text-[#121519] hover:text-white border-y border-l border-black/15 rounded-l shadow disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                )}

                {/* Image grid */}
                <div
                  className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 transition-all duration-500"
                >
                  {visibleGalleryImages.map((src, idx) => (
                    <div
                      key={`gallery-${galleryPage}-${idx}`}
                      className="group overflow-hidden bg-gray-200 border border-black/5 shadow-sm rounded-sm aspect-[4/3] cursor-pointer"
                      style={{ animationDelay: `${(idx % 4) * 60}ms` }}
                    >
                      <img
                        src={src}
                        alt={`Gallery image ${galleryPage * GALLERY_PAGE_SIZE + idx + 1}`}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Load More / Show Less button */}
              <div className="mt-10 flex justify-center">
                {!galleryExpanded ? (
                  <button
                    onClick={() => { setGalleryExpanded(true); setGalleryPage(0); }}
                    className="inline-flex items-center gap-2.5 border border-[#151310]/30 hover:border-[#c8a35f] hover:text-[#c8a35f] text-[#151310] px-8 py-3 text-[11px] font-bold uppercase tracking-[0.22em] transition-all duration-300 rounded-sm group"
                  >
                    <span>LOAD MORE</span>
                    <ChevronRight className="h-3.5 w-3.5 rotate-90 group-hover:translate-y-0.5 transition-transform" />
                  </button>
                ) : (
                  <button
                    onClick={() => { setGalleryExpanded(false); setGalleryPage(0); }}
                    className="inline-flex items-center gap-2.5 border border-[#151310]/30 hover:border-[#c8a35f] hover:text-[#c8a35f] text-[#151310] px-8 py-3 text-[11px] font-bold uppercase tracking-[0.22em] transition-all duration-300 rounded-sm group"
                  >
                    <span>SHOW LESS</span>
                    <ChevronRight className="h-3.5 w-3.5 -rotate-90 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* 9. FACILITY PROGRESSION & INQUIRY FORM SECTION           */}
        {/* ======================================================== */}
        {(isSectionVisible("facility") || isSectionVisible("contact")) && (
          <section id="facility" className="bg-[#edeae1] text-[#151310] py-16 lg:py-24 border-b border-black/10">
            <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
              <div className={`grid grid-cols-1 ${isSectionVisible("facility") && isSectionVisible("contact") ? "lg:grid-cols-[1.15fr_0.85fr]" : "max-w-3xl mx-auto"} gap-12 lg:gap-14 items-start`}>
                
                {/* Left Column: Facility Progression & Contact Information */}
                {isSectionVisible("facility") && (
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#847968] mb-2">
                      OUR FACILITY
                    </div>
                    <h2 className="font-cinzel text-3xl font-semibold leading-tight text-[#151310] mb-3">
                      From Quarry<br />to Container
                    </h2>
                    <p className="text-sm text-[#5c5447] leading-relaxed mb-8 max-w-xl">
                      A state-of-the-art facility with advanced machinery and a skilled team, ensuring precision at every stage.
                    </p>

                    {/* 5 Progression Thumbnails */}
                    <div className="grid grid-cols-5 gap-2 sm:gap-3 mb-8">
                      {/* 1. Quarry */}
                      <div>
                        <div className="aspect-square bg-gray-300 overflow-hidden border border-black/10 rounded-sm mb-1.5 shadow-sm">
                          <img src="/images/hero-quarry.jpg" alt="Quarry" className="h-full w-full object-cover" />
                        </div>
                        <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-center text-[#151310]">QUARRY</div>
                      </div>
                      {/* 2. Cutting */}
                      <div>
                        <div className="aspect-square bg-gray-300 overflow-hidden border border-black/10 rounded-sm mb-1.5 shadow-sm">
                          <img src="/images/craft-cutting.jpg" alt="Cutting" className="h-full w-full object-cover" />
                        </div>
                        <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-center text-[#151310]">CUTTING</div>
                      </div>
                      {/* 3. Polishing */}
                      <div>
                        <div className="aspect-square bg-gray-300 overflow-hidden border border-black/10 rounded-sm mb-1.5 shadow-sm">
                          <img src="/images/slabs-warehouse.jpg" alt="Polishing" className="h-full w-full object-cover" />
                        </div>
                        <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-center text-[#151310]">POLISHING</div>
                      </div>
                      {/* 4. Packaging */}
                      <div>
                        <div className="aspect-square bg-gray-300 overflow-hidden border border-black/10 rounded-sm mb-1.5 shadow-sm">
                          <img src="/images/monument-headstone.jpg" alt="Packaging" className="h-full w-full object-cover" />
                        </div>
                        <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-center text-[#151310]">PACKAGING</div>
                      </div>
                      {/* 5. Loading */}
                      <div>
                        <div className="aspect-square bg-gray-300 overflow-hidden border border-black/10 rounded-sm mb-1.5 shadow-sm">
                          <img src="/images/vases-collection.jpg" alt="Loading" className="h-full w-full object-cover" />
                        </div>
                        <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-center text-[#151310]">LOADING</div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="mt-8 space-y-6">
                      <a href={`tel:${content.phone || "9790613468"}`} className="flex items-start gap-4 hover:opacity-80 transition-opacity group">
                        <Phone className="w-5 h-5 text-[#c8a35f] shrink-0" />
                        <div>
                          <div className="text-[15px] font-medium text-[#151310]">{content.phone || "9790613468"}</div>
                        </div>
                      </a>
                      <a href={`mailto:${content.email || "sales.svgranites@gmail.com"}`} className="flex items-start gap-4 hover:opacity-80 transition-opacity group">
                        <Mail className="w-5 h-5 text-[#c8a35f] shrink-0" />
                        <div>
                          <div className="text-[15px] font-medium text-[#151310]">{content.email || "sales.svgranites@gmail.com"}</div>
                        </div>
                      </a>
                      <a href={`https://maps.google.com/?q=${encodeURIComponent(content.address || "NO.951/3,Poovallikuppam Village Kadampathur Block, Post, Mappedu, Chennai, Tamil Nadu 602105")}`} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 hover:opacity-80 transition-opacity group">
                        <MapPin className="w-5 h-5 text-[#c8a35f] shrink-0" />
                        <div>
                          <div className="text-[15px] font-medium text-[#151310] leading-relaxed max-w-sm">
                            {content.address || "NO.951/3,Poovallikuppam Village Kadampathur Block, Post, Mappedu, Chennai, Tamil Nadu 602105"}
                          </div>
                        </div>
                      </a>
                      <a href={`https://wa.me/91${(content.whatsapp || "9790613468").replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 hover:opacity-80 transition-opacity group">
                        <svg className="w-5 h-5 text-[#25D366] shrink-0 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        <div>
                          <div className="text-[15px] font-medium text-[#151310]">{content.whatsapp || "9790613468"}</div>
                        </div>
                      </a>
                    </div>
                  </div>
                )}

                {/* Right Column: Inquiry Form Card */}
                {isSectionVisible("contact") && (
                  <div id="contact" className="bg-[#12151a] text-white p-7 sm:p-9 rounded-xl border border-white/10 shadow-2xl">
                    <div className="mb-6">
                      <h3 className="font-cinzel text-lg sm:text-xl font-bold uppercase tracking-[0.14em] text-white mb-2">
                        LOOKING FOR THE RIGHT STONE?
                      </h3>
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        Tell us what you're looking for. We'll help you find the right material, finish and specification.
                      </p>
                    </div>

                    <form onSubmit={handleEnquirySubmit} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400 mb-2">YOUR NAME</label>
                          <input 
                            type="text" 
                            required
                            placeholder="Aarav Sharma" 
                            value={form.name}
                            onChange={(e) => updateForm("name", e.target.value)}
                            className="w-full bg-[#1b2026] border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-600 rounded-md focus:border-[#c8a35f] focus:outline-none transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400 mb-2">EMAIL ADDRESS</label>
                          <input 
                            type="email" 
                            required
                            placeholder="you@studio.com" 
                            value={form.email}
                            onChange={(e) => updateForm("email", e.target.value)}
                            className="w-full bg-[#1b2026] border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-600 rounded-md focus:border-[#c8a35f] focus:outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400 mb-2">PHONE NUMBER</label>
                          <input 
                            type="tel" 
                            required
                            placeholder="+91" 
                            value={form.phone}
                            onChange={(e) => updateForm("phone", e.target.value)}
                            className="w-full bg-[#1b2026] border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-600 rounded-md focus:border-[#c8a35f] focus:outline-none transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400 mb-2">PROJECT TYPE</label>
                          <div className="relative">
                            <select
                              value={form.projectType}
                              onChange={(e) => updateForm("projectType", e.target.value)}
                              className="w-full bg-[#1b2026] border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-600 rounded-md focus:border-[#c8a35f] focus:outline-none transition-colors appearance-none"
                            >
                              <option value="" disabled>Select one</option>
                              <option value="Residential">Residential</option>
                              <option value="Commercial">Commercial</option>
                              <option value="Industrial">Industrial</option>
                              <option value="Other">Other</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400 mb-2">TELL US A LITTLE MORE</label>
                        <textarea 
                          rows={4} 
                          placeholder="Share your project, timeline, or the stone you have in mind..." 
                          value={form.message}
                          onChange={(e) => updateForm("message", e.target.value)}
                          className="w-full bg-[#1b2026] border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-600 rounded-md focus:border-[#c8a35f] focus:outline-none resize-none transition-colors"
                        />
                      </div>

                      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 !mt-8 pt-6">
                        <p className="text-xs text-white">We usually reply within one working day.</p>
                        <button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="inline-flex items-center justify-center gap-2 bg-[#d4af37] hover:bg-[#dec083] text-[#0d0f12] px-8 py-3 text-xs font-bold uppercase tracking-[0.15em] rounded transition-all duration-300 whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? "SENDING..." : "SEND ENQUIRY"} <ArrowUpRight className="h-4 w-4" />
                        </button>
                      </div>
                    </form>
                  </div>
                )}

              </div>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* 9. PRE-FOOTER BANNER (MONUMENTS GARDEN LANDSCAPE)        */}
        {/* ======================================================== */}
        <section className="relative overflow-hidden bg-black text-white min-h-[280px] lg:min-h-[320px] flex items-center border-t border-white/10">
          {/* Panoramic background image */}
          <div className="absolute inset-0 z-0">
            <img 
              src="/images/monument-headstone.jpg" 
              alt="Monuments in memorial landscape setting" 
              className="h-full w-full object-cover object-bottom brightness-[0.4] filter contrast-125"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent w-full lg:w-[60%]" />
          </div>

          <div className="relative z-10 mx-auto w-full max-w-[1440px] px-6 lg:px-12 py-12">
            <div className="max-w-xl">
              <h3 className="font-cinzel text-xl sm:text-2xl font-bold uppercase tracking-[0.12em] text-white">
                STONE THAT LASTS.<br />
                PARTNERSHIPS THAT GROW.
              </h3>
              <div className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-[#c8a35f]">
                {content.brandName ? content.brandName.toUpperCase() : "SV GRANITES"}
              </div>
              <div className="text-[10px] text-gray-400 tracking-wider">
                South India · India
              </div>
              <div className="mt-5">
                <button 
                  onClick={() => scrollToSection("contact")}
                  className="inline-flex items-center gap-2 bg-[#d4af37] hover:bg-[#dec083] text-[#0d0f12] px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300"
                >
                  START A CONVERSATION <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ======================================================== */}
      {/* 10. FOOTER                                               */}
      {/* ======================================================== */}
      <footer className="bg-[#090b0e] border-t border-white/5 py-8 text-white">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex flex-col items-center md:items-start">
              <span className="font-cinzel text-xl font-bold tracking-[0.18em] text-[#d4af37]">SV</span>
              <span className="font-cinzel text-[8px] uppercase tracking-[0.38em] text-white/70 -mt-0.5">GRANITES</span>
            </div>

            {/* Nav list */}
            <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-7 text-[10px] uppercase tracking-[0.2em] text-gray-400">
              <button onClick={() => scrollToSection("top")} className="hover:text-white transition-colors">Home</button>
              {isSectionVisible("about") && <button onClick={() => scrollToSection("about")} className="hover:text-white transition-colors">About</button>}
              {isSectionVisible("products") && <button onClick={() => scrollToSection("products")} className="hover:text-white transition-colors">Products</button>}
              {isSectionVisible("collections") && <button onClick={() => scrollToSection("gallery")} className="hover:text-white transition-colors">Stones</button>}
              {isSectionVisible("finishes") && <button onClick={() => scrollToSection("finishings")} className="hover:text-white transition-colors">Finishings</button>}
              {isSectionVisible("craft") && <button onClick={() => scrollToSection("craft")} className="hover:text-white transition-colors">Our Craft</button>}
              {isSectionVisible("facility") && <button onClick={() => scrollToSection("facility")} className="hover:text-white transition-colors">Facility</button>}
              {isSectionVisible("gallery") && <button onClick={() => scrollToSection("photo-gallery")} className="hover:text-white transition-colors">Gallery</button>}
              {isSectionVisible("contact") && <button onClick={() => scrollToSection("contact")} className="hover:text-white transition-colors">Contact</button>}
            </div>

            {/* Socials & Copyright */}
            <div className="flex items-center gap-5 text-gray-400">
              <div className="flex items-center gap-3">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-[#c8a35f] transition-colors" aria-label="Instagram">
                  <Instagram className="h-4 w-4" />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-[#c8a35f] transition-colors" aria-label="YouTube">
                  <Youtube className="h-4 w-4" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-[#c8a35f] transition-colors" aria-label="LinkedIn">
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
              <span className="text-[10px] text-gray-500 tracking-wider">
                © {new Date().getFullYear()} {content.brandName || "SV Granites"}. All rights reserved.
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
