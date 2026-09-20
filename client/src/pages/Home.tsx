import { useEffect, useState } from "react";
import { ArrowUpRight, ChevronDown, ChevronRight, Instagram, Mail, MapPin, Menu, Phone, Play, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { FinishTextureWipe } from "@/components/FinishTextureWipe";

const fallbackContent = {
  brandName: "Sri Venkateswara Granites", tagline: "Crafted by Nature. Perfected by Us.", heroEyebrow: "Premium natural stone · Since 1998", heroTitle: "Stone with a point of view.", heroCopy: "Architectural granite selected for bold residences, refined hospitality, and spaces made to last generations.", aboutTitle: "Nature Creates it, We perfect it.", aboutCopy: "Every piece of stone carries its own character. At SVG, we carefully select, process, and finish natural granite to bring out its lasting beauty- crafted for projects that are built to endure.", phone: "9790613468", whatsapp: "9790613468", email: "sales.svgranites@gmail.com", address: "NO.951/3,Poovallikuppam Village Kadampathur Block, Post, Mappedu, Chennai, Tamil Nadu 602105", hours: "Mon–Sat · 9:30 AM — 6:30 PM", heroImage: "/images/hero.jpg", aboutImage: "/images/point-of-view.jpeg", logoImage: "/images/logo.jpg",
};
const fallbackCollections = [
  { id: 1, name: "Indian Black Granite", category: "Signature Black", description: "Deep graphite with a quiet, mineral rhythm for dramatic islands and monolithic walls.", finish: "Leathered", imageUrl: "/images/indian-black.jpg" },
  { id: 2, name: "Absolute Black Granite", category: "Architectural Slabs", description: "A near-black surface with a velvet depth for fireplace surrounds and hotel statements.", finish: "Honed", imageUrl: "/images/absolute-black.jpg" },
  { id: 3, name: "Steel Grey Granite", category: "Cool Greys", description: "Layered grey movement with a sculptural presence for feature walls and hospitality spaces.", finish: "Polished", imageUrl: "/images/steel-grey.jpg" },
  { id: 4, name: "Black Galaxy Granite", category: "Sparkling Darks", description: "Deep black background speckled with radiant golden and copper flecks.", finish: "Polished", imageUrl: "/images/black-galaxy.jpg" },
  { id: 5, name: "Tan Brown Granite", category: "Earthy Browns", description: "Rich chocolate and tan tones with dark grey and black accents for warm interiors.", finish: "Leathered", imageUrl: "/images/tan-brown.jpg" },
];
const fallbackGallery = [
  { id: 1, title: "The Black House", location: "Bengaluru · Residence", year: "2024", imageUrl: "/images/project-black-house.jpg" },
  { id: 2, title: "Soft Geometry", location: "Chennai · Private home", year: "2023", imageUrl: "/images/project-soft-geometry.jpg" },
  { id: 3, title: "The Long Table", location: "Goa · Hospitality", year: "2024", imageUrl: "/images/project-long-table.jpg" },
];

export default function Home() {
  const { data: contentData } = trpc.site.content.useQuery();
  const { data: collectionsData } = trpc.site.collections.useQuery();
  const { data: galleryData } = trpc.site.gallery.useQuery();
  const content = contentData ?? fallbackContent;
  const collections = fallbackCollections;
  const gallery = (galleryData ?? fallbackGallery) as typeof fallbackGallery;
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCollection, setActiveCollection] = useState(0);
  const enquiryMutation = trpc.site.enquiry.useMutation({
    onSuccess: () => {
      setForm({ name: "", email: "", phone: "", projectType: "", message: "" });
    },
    onError: () => {}
  });
  const [form, setForm] = useState({ name: "", email: "", phone: "", projectType: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEnquirySubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      // 1. Try local tRPC mutation if running with server
      enquiryMutation.mutate(form);

      // 2. Direct client-side forward to Google Sheets (works on static hosting like Vercel/GitHub Pages)
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

      toast.success("Thank you — we’ll be in touch shortly.");
      setForm({ name: "", email: "", phone: "", projectType: "", message: "" });
    } catch {
      toast.error("Please check the details and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateForm = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const go = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setMenuOpen(false); };
  useEffect(() => {
    const revealItems = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")), { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    revealItems.forEach((item) => observer.observe(item));
    let frame = 0;
    const updateScrollProgress = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        document.documentElement.style.setProperty("--scroll-progress", max > 0 ? String(window.scrollY / max) : "0");
      });
    };
    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    updateScrollProgress();
    return () => { observer.disconnect(); window.removeEventListener("scroll", updateScrollProgress); cancelAnimationFrame(frame); };
  }, []);

  return (
    <div className="min-h-screen bg-ink text-ivory motion-page">
      <div className="grain-overlay" />
      <div className="ambient-orbit ambient-orbit-one" /><div className="ambient-orbit ambient-orbit-two" />
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-8 lg:px-12">
        <nav className="mx-auto flex max-w-[1400px] items-center justify-between rounded-full border border-white/15 bg-ink/75 px-4 py-3 backdrop-blur-xl sm:px-6">
          <a href="#top" onClick={() => go("top")} className="flex items-center gap-3">
            <img src={content.logoImage} alt="Sri Venkateswara Granites" className="h-9 w-9 rounded-full object-cover ring-1 ring-gold/60" />
            <span className="hidden max-w-[145px] font-serif text-[12px] uppercase tracking-[0.18em] text-ivory/90 sm:block">Sri Venkateswara<br />Granites</span>
          </a>
          <div className="hidden items-center gap-8 text-[10px] font-semibold uppercase tracking-[0.25em] text-ivory/65 md:flex">
            <button className="nav-link" onClick={() => go("collections")}>Collections</button>
            <button className="nav-link" onClick={() => go("finishes")}>Finishes</button>
            <button className="nav-link" onClick={() => go("story")}>Our story</button>
            {/* <button className="nav-link" onClick={() => go("projects")}>Projects</button> */}
            <button className="nav-link" onClick={() => go("contact")}>Contact</button>
          </div>
          <a href={`tel:${content.phone.replace(/\s/g, "")}`} className="hidden items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold md:flex"><Phone className="h-3.5 w-3.5" /> Talk to a stone specialist</a>
          <button className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-ivory md:hidden" onClick={() => setMenuOpen((value) => !value)} aria-label="Toggle menu">{menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button>
        </nav>
        {menuOpen && <div className="mx-auto mt-2 max-w-[1400px] rounded-3xl border border-white/10 bg-ink/95 p-6 shadow-2xl backdrop-blur-xl md:hidden"><div className="grid gap-4 text-sm uppercase tracking-[0.2em] text-ivory/80"><button onClick={() => go("collections")} className="text-left">Collections</button><button onClick={() => go("finishes")} className="text-left">Finishes</button><button onClick={() => go("story")} className="text-left">Our story</button>{/* <button onClick={() => go("projects")} className="text-left">Projects</button> */}<button onClick={() => go("contact")} className="text-left">Contact</button></div></div>}
      </header>

      <main id="top">
        <section data-reveal className="reveal-section relative flex min-h-[760px] items-end overflow-hidden px-6 pb-20 pt-40 sm:px-10 lg:min-h-[850px] lg:px-16 lg:pb-28">
          <img src={content.heroImage} alt="Dramatic black granite slab" className="absolute inset-0 h-full w-full object-cover object-center opacity-70" />
          <div className="hero-wash absolute inset-0" />
          <div className="light-sweep absolute inset-y-0 left-[-35%] w-[30%] rotate-[18deg]" />
          <div className="hero-pulse absolute inset-0" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_36%,rgba(187,146,75,0.16),transparent_28%)]" />
          <div className="relative z-10 mx-auto grid w-full max-w-[1400px] gap-12 lg:grid-cols-[1fr_330px] lg:items-end">
            <div className="max-w-3xl animate-rise">
              <div className="mb-7 flex items-center gap-4 text-[10px] font-semibold uppercase tracking-[0.35em] text-gold"><span className="h-px w-10 bg-gold" />{content.heroEyebrow}</div>
              <h1 className="max-w-3xl font-serif text-[clamp(3.8rem,9vw,8.5rem)] leading-[0.86] tracking-[-0.065em] text-ivory">{content.heroTitle}</h1>
              <p className="mt-8 max-w-xl text-base leading-7 text-ivory/68 sm:text-lg">{content.heroCopy}</p>
              <div className="mt-10 flex flex-wrap items-center gap-4"><button className="gold-button" onClick={() => go("collections")}>View Collections <ArrowUpRight className="h-4 w-4" /></button><button className="ghost-button" onClick={() => go("story")}><Play className="h-3.5 w-3.5 fill-current" /> Our approach</button></div>
            </div>
            <div className="hidden border-l border-white/20 pl-7 lg:block animate-rise-delayed"><div className="mb-16 text-[10px] uppercase tracking-[0.3em] text-ivory/45">A considered material<br />for considered spaces</div><div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-ivory/55"><span className="h-12 w-px bg-gold/70" />Scroll to discover</div></div>
          </div>
        </section>

        <section data-reveal className="reveal-section border-y border-white/10 bg-ink-soft px-6 py-7 sm:px-10 lg:px-16"><div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-5 text-[10px] font-semibold uppercase tracking-[0.28em] text-ivory/45"><span>Natural stone, carefully sourced</span><span className="hidden h-px flex-1 bg-white/10 md:block" /><span className="ticker-word">Residential · Hospitality · Retail</span><span className="hidden h-px flex-1 bg-white/10 md:block" /><span>Hosur Road · Bengaluru</span></div></section>

        <section id="collections" data-reveal className="reveal-section px-6 py-24 sm:px-10 lg:px-16 lg:py-36"><div className="mx-auto max-w-[1400px]"><div className="mb-14 flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><div className="section-kicker">01 — The collection</div><h2 className="mt-4 max-w-2xl font-serif text-5xl leading-[0.95] tracking-[-0.04em] text-ivory sm:text-7xl">The surface<br /><span className="text-gold">sets the tone.</span></h2></div><p className="max-w-xs text-sm leading-6 text-ivory/50">Select slabs for their presence, not just their specification. Every piece has a point of view.</p></div>
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]"><div className="relative min-h-[520px] overflow-hidden rounded-[2rem] bg-black"><img src={collections[activeCollection]?.imageUrl} alt={collections[activeCollection]?.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10" /><div className="absolute inset-x-0 bottom-0 p-7 sm:p-10"><div className="mb-3 text-[10px] uppercase tracking-[0.3em] text-gold">{collections[activeCollection]?.category}</div><div className="flex items-end justify-between gap-4"><div><h3 className="font-serif text-4xl tracking-[-0.04em] sm:text-5xl">{collections[activeCollection]?.name}</h3><p className="mt-3 max-w-md text-sm leading-6 text-ivory/60">{collections[activeCollection]?.description}</p></div><div className="hidden rounded-full border border-white/20 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-ivory/55 sm:block">{collections[activeCollection]?.finish}</div></div></div></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 max-h-[520px] overflow-y-auto pr-2 custom-scrollbar">{collections.map((item, index) => <button key={item.id} onClick={() => setActiveCollection(index)} className={`collection-row ${activeCollection === index ? "collection-row-active" : ""}`}><img src={item.imageUrl} alt="" className="h-24 w-24 rounded-2xl object-cover" /><span className="flex-1 text-left"><span className="block text-[10px] uppercase tracking-[0.25em] text-ivory/40">0{index + 1} · {item.category}</span><span className="mt-2 block font-serif text-2xl text-ivory">{item.name}</span></span><ChevronRight className="h-4 w-4 text-gold" /></button>)}</div></div>
        </div></section>

        {/* ------------------------------------------------------------- */}
        {/* INTERACTIVE FINISH COMPARISON STUDIO */}
        {/* ------------------------------------------------------------- */}
        <section id="finishes" data-reveal className="reveal-section px-6 py-20 sm:px-10 lg:px-16 lg:py-28 bg-ink-soft/40 border-b border-white/10">
          <div className="mx-auto max-w-[1400px]">
            <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <div className="section-kicker">02 — Surface Tactility</div>
                <h2 className="mt-3 font-serif text-4xl sm:text-6xl text-ivory">
                  Touch the <span className="text-gold">difference.</span>
                </h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-ivory/55">
                Every architectural application calls for a distinct surface dialogue. Drag the interactive split scrubber to see how our three master finishes transform light and texture.
              </p>
            </div>
            <FinishTextureWipe
              baseImage={collections[activeCollection]?.imageUrl || "/manus-storage/black-rush_6d0925b9.jpg"}
            />
          </div>
        </section>

        <section id="story" data-reveal className="reveal-section relative overflow-hidden border-y border-white/10 bg-ink-soft/80 px-6 py-24 text-ivory sm:px-10 lg:px-16 lg:py-36">
          <div className="pointer-events-none absolute -left-24 top-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-gold/10 blur-[110px]" />
          <div className="relative z-10 mx-auto grid max-w-[1400px] items-center gap-14 lg:grid-cols-[0.85fr_1fr]">
            <div className="relative mx-auto w-full max-w-lg lg:mx-0">
              <div className="aspect-[0.86] overflow-hidden rounded-[2.5rem] border border-white/15 bg-black/60 shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
                <img src={content.aboutImage} alt="Luxury granite kitchen island" className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" />
              </div>
              <div className="absolute -bottom-8 -right-4 flex h-32 w-32 flex-col justify-between rounded-full bg-gold p-5 text-ink shadow-[0_10px_35px_rgba(198,155,86,0.35)] sm:-right-8">
                <Sparkles className="h-5 w-5" />
                <span className="text-[10px] font-bold uppercase leading-4 tracking-[0.18em]">Material<br />with meaning</span>
              </div>
            </div>
            <div className="max-w-xl">
              <div className="section-kicker text-gold flex items-center gap-2">
                <span className="h-px w-6 bg-gold" />
                <span>03 — Our point of view</span>
              </div>
              <h2 className="mt-5 font-serif text-5xl leading-[0.95] tracking-[-0.05em] text-ivory sm:text-7xl">{content.aboutTitle}</h2>
              <p className="mt-8 text-lg leading-8 text-ivory/70">{content.aboutCopy}</p>
              <div className="mt-12 grid grid-cols-3 gap-6 border-t border-white/15 pt-7">
                <div>
                  <div className="font-serif text-4xl text-ivory">25<span className="text-gold">+</span></div>
                  <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-ivory/45">Years of craft</div>
                </div>
                <div>
                  <div className="font-serif text-4xl text-ivory">01</div>
                  <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-ivory/45">Direct Exporters</div>
                </div>
                <div>
                  <div className="font-serif text-4xl text-ivory">02</div>
                  <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-ivory/45">Core Products: Monuments and Vases</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* <section id="projects" data-reveal className="reveal-section px-6 py-24 sm:px-10 lg:px-16 lg:py-36"><div className="mx-auto max-w-[1400px]"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><div className="section-kicker">04 — Selected projects</div><h2 className="mt-4 font-serif text-5xl tracking-[-0.05em] sm:text-7xl">In good company.</h2></div><button className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-gold">View all projects <ArrowUpRight className="h-4 w-4" /></button></div><div className="mt-14 grid gap-4 md:grid-cols-3">{gallery.map((item, index) => <article key={item.id} className={`project-card group ${index === 1 ? "md:mt-16" : ""}`}><div className="relative aspect-[0.82] overflow-hidden rounded-[1.5rem] bg-ink-soft"><img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105 group-hover:opacity-80" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" /><div className="absolute inset-x-0 bottom-0 p-6"><div className="text-[10px] uppercase tracking-[0.24em] text-gold">{item.year} · {item.location}</div><h3 className="mt-2 font-serif text-3xl">{item.title}</h3></div></div></article>)}</div></div></section> */}

        <section id="contact" data-reveal className="reveal-section bg-ink-soft px-6 py-24 sm:px-10 lg:px-16 lg:py-32"><div className="mx-auto grid max-w-[1400px] gap-14 lg:grid-cols-[0.8fr_1.2fr]"><div><div className="section-kicker">05 — Begin a conversation</div><h2 className="mt-5 max-w-lg font-serif text-5xl leading-[0.95] tracking-[-0.05em] sm:text-7xl">Let’s find your <span className="text-gold">stone.</span></h2><p className="mt-7 max-w-md text-sm leading-7 text-ivory/55">Tell us what you’re working on. We’ll help you narrow the field, make the right selection, and move from inspiration to installation.</p><div className="mt-10 space-y-4 text-sm text-ivory/65"><a className="flex items-center gap-3 hover:text-gold" href={`tel:${content.phone.replace(/\s/g, "")}`}><Phone className="h-4 w-4 text-gold" /> {content.phone}</a><a className="flex items-center gap-3 hover:text-gold" href={`mailto:${content.email}`}><Mail className="h-4 w-4 text-gold" /> {content.email}</a><a href="https://maps.app.goo.gl/uCjECLRFDfC87n3R9?g_st=ic" target="_blank" rel="noreferrer" className="flex items-start gap-3 hover:text-gold"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" /><span>{content.address}</span></a></div></div><form onSubmit={handleEnquirySubmit} className="grid gap-5 rounded-[2rem] border border-white/10 bg-ink p-7 sm:p-10"><div className="grid gap-5 sm:grid-cols-2"><label className="field-label">Your name<input required value={form.name} onChange={(event) => updateForm("name", event.target.value)} className="field-input" placeholder="Aarav Sharma" /></label><label className="field-label">Email address<input required type="email" value={form.email} onChange={(event) => updateForm("email", event.target.value)} className="field-input" placeholder="you@studio.com" /></label></div><div className="grid gap-5 sm:grid-cols-2"><label className="field-label">Phone number<input required value={form.phone} onChange={(event) => updateForm("phone", event.target.value)} className="field-input" placeholder="+91" /></label><label className="field-label">Project type<select required value={form.projectType} onChange={(event) => updateForm("projectType", event.target.value)} className="field-input"><option value="">Select one</option><option>Private residence</option><option>Hospitality</option><option>Commercial / retail</option><option>Fabrication enquiry</option></select></label></div><label className="field-label">Tell us a little more<textarea required value={form.message} onChange={(event) => updateForm("message", event.target.value)} className="field-input min-h-32 resize-none" placeholder="Share your project, timeline, or the stone you have in mind..." /></label><div className="flex flex-col items-start justify-between gap-5 border-t border-white/10 pt-6 sm:flex-row sm:items-center"><span className="text-xs leading-5 text-ivory/35">We usually reply within one working day.</span><Button disabled={isSubmitting || enquiryMutation.isPending} type="submit" className="gold-button">{isSubmitting || enquiryMutation.isPending ? "Sending…" : "Send enquiry"}<ArrowUpRight className="h-4 w-4" /></Button></div></form></div></section>
      </main>

      <footer className="border-t border-white/10 bg-ink px-6 py-9 sm:px-10 lg:px-16"><div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-7 sm:flex-row sm:items-center"><div className="flex items-center gap-3"><img src={content.logoImage} alt="" className="h-10 w-10 rounded-full object-cover" /><div><div className="font-serif text-lg">{content.brandName}</div><div className="text-[9px] uppercase tracking-[0.22em] text-ivory/35">{content.tagline}</div></div></div><div className="flex items-center gap-5 text-[10px] uppercase tracking-[0.2em] text-ivory/35"><span>{content.hours}</span><a href="https://instagram.com" aria-label="Instagram"><Instagram className="h-4 w-4 hover:text-gold" /></a><a href="/admin" className="hidden hover:text-gold">Admin studio</a></div></div></footer>
    </div>
  );
}
