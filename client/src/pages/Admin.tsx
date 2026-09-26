import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle, ArrowDown, ArrowUp, ArrowUpRight, Check, ChevronLeft, ChevronRight, ExternalLink,
  Eye, EyeOff, Grid3X3, Image as ImageIcon, Inbox, LayoutDashboard, Loader2,
  LogOut, Palette, Plus, Save, Sparkles, Star, Trash2, Upload, X, Layers
} from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";

// ─── Cloudinary uploader ──────────────────────────────────────────────────────
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    const msg = errData?.error?.message || res.statusText || "Upload failed";
    throw new Error(msg);
  }
  const data = await res.json();
  return data.secure_url as string;
}

// ─── Image Dropzone & Uploader ────────────────────────────────────────────────
function ImageDropzone({
  value,
  onChange,
  className = "h-44",
}: {
  value: string;
  onChange: (url: string) => void;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WEBP).");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      onChange(url);
      toast.success("Image uploaded successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Upload failed. Please check file and try again.");
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />

      {value ? (
        <div className={`relative ${className} w-full rounded-2xl overflow-hidden border border-white/10 bg-stone-900 group shadow-sm`}>
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <Button
              type="button"
              size="sm"
              className="bg-[#13161b] hover:bg-[#1c212a] text-white border border-white/20 text-xs font-semibold shadow"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5 text-[#d4af37]" /> : <Upload className="h-4 w-4 mr-1.5 text-[#d4af37]" />}
              Replace photo
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="text-xs font-semibold shadow"
              onClick={() => onChange("")}
            >
              <Trash2 className="h-4 w-4 mr-1.5" /> Remove
            </Button>
          </div>
          <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm text-[#d4af37] text-[10px] font-medium px-2 py-0.5 rounded border border-[#d4af37]/30">
            Photo selected
          </div>
        </div>
      ) : (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`relative ${className} w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? "border-[#d4af37] bg-[#d4af37]/10 scale-[0.99]"
              : "border-white/15 hover:border-[#d4af37] bg-white/[0.02] hover:bg-white/[0.05]"
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-9 w-9 animate-spin text-[#d4af37] mb-3" />
              <div className="text-sm font-semibold text-white">Uploading photo to Cloudinary…</div>
              <div className="text-xs text-stone-400 mt-1">Please wait a moment</div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center pointer-events-none">
              <div className="h-12 w-12 rounded-full bg-white/[0.04] shadow-sm border border-white/10 flex items-center justify-center mb-3 text-[#d4af37]">
                <Upload className="h-6 w-6 stroke-[2]" />
              </div>
              <div className="text-sm font-semibold text-white">
                Click to upload photo, or drag & drop
              </div>
              <div className="text-xs text-stone-400 mt-1">
                PNG, JPG, WEBP, GIF up to 10MB
              </div>
              <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#d4af37] bg-[#d4af37]/15 px-3.5 py-1 rounded-full border border-[#d4af37]/30">
                <Sparkles className="h-3.5 w-3.5" /> Choose from computer
              </div>
            </div>
          )}
        </div>
      )}

      {/* URL fallback / paste option */}
      <div className="mt-2 flex items-center justify-between text-xs text-stone-400 px-1">
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[#d4af37] hover:underline inline-flex items-center gap-1 text-[11px]"
        >
          {showUrlInput ? "Hide image URL option" : "Or enter an image URL / local path"}
        </button>
        {value && <span className="truncate max-w-[250px] font-mono text-[10px] text-stone-500">{value}</span>}
      </div>

      {showUrlInput && (
        <div className="mt-2 flex items-center gap-2">
          <Input
            placeholder="https://... or /images/..."
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            className="text-xs h-8 bg-[#13161b] border-white/15 text-white"
          />
          <Button
            type="button"
            size="sm"
            className="h-8 text-xs shrink-0 admin-gold"
            onClick={() => {
              if (urlDraft.trim()) {
                onChange(urlDraft.trim());
                setUrlDraft("");
                setShowUrlInput(false);
                toast.success("Image URL set!");
              }
            }}
          >
            Apply
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Image Upload Button ──────────────────────────────────────────────────────
function ImageUploadButton({ onUploaded, children }: { onUploaded: (url: string) => void; children?: React.ReactNode }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      onUploaded(url);
      toast.success("Image uploaded!");
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }, [onUploaded]);

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      <button type="button" className="img-upload-btn" onClick={() => inputRef.current?.click()} disabled={uploading}>
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : children ?? <><Upload className="h-4 w-4" /> Change photo</>}
      </button>
    </>
  );
}

// ─── Clickable editable image ─────────────────────────────────────────────────
function EditableImage({ src, onUploaded, className = "" }: { src: string; onUploaded: (url: string) => void; className?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      onUploaded(url);
      toast.success("Image updated!");
    } catch {
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
    }
  }, [onUploaded]);

  return (
    <div className={`editable-image-wrapper ${className}`} onClick={() => inputRef.current?.click()} title="Click to change photo">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      <img src={src} alt="" className="w-full h-full object-cover" />
      <div className="editable-image-overlay">
        {uploading ? <Loader2 className="h-6 w-6 animate-spin text-white" /> : <><Upload className="h-5 w-5 text-white" /><span className="text-xs text-white font-medium mt-1">Change photo</span></>}
      </div>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const tabs = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "brand", label: "Brand & contact", icon: Palette },
  { id: "products", label: "Products", icon: Layers },
  { id: "collections", label: "Collections", icon: Sparkles },
  { id: "finishes", label: "Finishes", icon: Star },
  { id: "gallery", label: "Gallery", icon: ImageIcon },
  { id: "sections", label: "Sections", icon: Grid3X3 },
  { id: "enquiries", label: "Enquiries", icon: Inbox },
];

const FALLBACK_CONTENT = {
  brandName: "Sri Venkateswara Granites",
  heroEyebrow: "INDIAN GRANITE EXPORTER",
  heroTitle: "Sri Venkateswara Granites.",
  heroCopy: "Premium Indian granite products manufactured and prepared for international markets.",
  aboutTitle: "NATURE CREATES IT. WE PERFECT IT.",
  aboutCopy: "From raw granite selection to cutting, shaping, polishing, finishing and export packaging, every stage is handled with attention to detail.",
  phone: "9790613468",
  whatsapp: "9790613468",
  email: "sales.svgranites@gmail.com",
  address: "NO.951/3,Poovallikuppam Village Kadampathur Block, Post, Mappedu, Chennai, Tamil Nadu 602105",
  heroImage: "/images/hero-quarry.jpg",
  aboutImage: "/images/craft-cutting.jpg",
  facilityImage1: "/images/hero-quarry.jpg",
  facilityImage2: "/images/craft-cutting.jpg",
  facilityImage3: "/images/slabs-warehouse.jpg",
  facilityImage4: "/images/monument-headstone.jpg",
  facilityImage5: "/images/vases-collection.jpg",
  facilityTitle: "From Quarry to Container",
  facilityCopy: "A state-of-the-art facility with advanced machinery and a skilled team, ensuring precision at every stage.",
  bannerImage: "/images/monument-headstone.jpg",
  mapsUrl: "",
  productsEyebrow: "OUR PRODUCTS",
  productsTitle: "Crafted for Lasting Impressions",
  productsCopy: "From monumental structures to elegant accessories, our granite products are designed to meet the highest standards of quality and durability.",
  collectionsEyebrow: "STONE COLLECTION",
  collectionsTitle: "Nature's Beauty. In Every Shade.",
  collectionsCopy: "Explore our premium range of granite stones, known for their unique patterns, colours and durability.",
  finishesEyebrow: "SURFACE FINISHINGS",
  finishesTitle: "The Art of Every Surface.",
  finishesCopy: "From mirror-polished luxury to rugged flamed textures — each finish transforms stone into a distinct architectural statement.",
  whyChooseEyebrow: "WHY SV GRANITES",
  whyChooseTitle: "The Right Partner for Your Stone Needs.",
  whyFeature1Title: "Direct Manufacturing",
  whyFeature1Desc: "Work directly with the source.",
  whyFeature2Title: "Consistent Quality",
  whyFeature2Desc: "Material and finish checked before dispatch.",
  whyFeature3Title: "Custom Production",
  whyFeature3Desc: "Tailored to your requirements.",
  whyFeature4Title: "Export Packaging",
  whyFeature4Desc: "Safe for international transport.",
  whyFeature5Title: "Responsive Communication",
  whyFeature5Desc: "Clear coordination from enquiry to shipment.",
  whyFeature6Title: "Long-Term Partnerships",
  whyFeature6Desc: "Built on trust and reliability.",
  globalReachEyebrow: "GLOBAL REACH",
  globalReachTitle: "FROM INDIA, MADE FOR THE WORLD.",
  globalReachCopy: "Manufactured in South India · Prepared for international buyers.",
  galleryEyebrow: "GALLERY",
  galleryTitle: "Stone in Every Frame.",
  enquiryTitle: "LOOKING FOR THE RIGHT STONE?",
  enquiryCopy: "Tell us what you're looking for. We'll help you find the right material, finish and specification.",
  bannerTitle: "STONE THAT LASTS. PARTNERSHIPS THAT GROW.",
  bannerSubtitle: "South India · India",
  metric1Val: "25+",
  metric1Label: "Years of Experience",
  metric2Val: "Export Ready",
  metric2Label: "International Packaging",
  metric3Val: "Quality Focused",
  metric3Label: "Every Order Inspected",
  metric4Val: "Direct Manufacturer",
  metric4Label: "From India",
  footerCopy: "All rights reserved.",
};

type TabId = typeof tabs[number]["id"];

// ─── Main Admin Component ─────────────────────────────────────────────────────
export default function Admin() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const utils = trpc.useUtils();

  const contentQuery = trpc.admin.content.useQuery();
  const collectionsQuery = trpc.admin.collections.useQuery();
  const galleryQuery = trpc.admin.gallery.useQuery();
  const productsQuery = trpc.admin.products.useQuery();
  const finishesQuery = trpc.admin.finishes.useQuery();
  const sectionsQuery = trpc.admin.sectionVisibility.useQuery();
  const enquiriesQuery = trpc.admin.enquiries.useQuery();

  const [content, setContent] = useState<any>(FALLBACK_CONTENT);
  useEffect(() => { if (contentQuery.data) setContent(contentQuery.data); }, [contentQuery.data]);

  const isContentDirty = useMemo(() => {
    if (!contentQuery.data) return false;
    const base: Record<string, any> = contentQuery.data;
    const current: Record<string, any> = content;
    const allKeys = Array.from(new Set([...Object.keys(current), ...Object.keys(base)]));
    return allKeys.some(k => {
      if (k === "id" || k === "createdAt" || k === "updatedAt") return false;
      return (current[k] ?? "") !== (base[k] ?? "");
    });
  }, [content, contentQuery.data]);

  const saveContent = trpc.admin.saveContent.useMutation({
    onSuccess: () => { toast.success("Saved!"); utils.site.content.invalidate(); contentQuery.refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const setField = (key: string, value: string) => setContent((c: any) => ({ ...c, [key]: value }));

  const collections = collectionsQuery.data ?? [];
  const gallery = galleryQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const finishes = finishesQuery.data ?? [];
  const sections = sectionsQuery.data ?? [];
  const enquiries = enquiriesQuery.data ?? [];

  const invalidateSite = () => {
    utils.site.content.invalidate();
    utils.site.collections.invalidate();
    utils.site.gallery.invalidate();
    utils.site.products.invalidate();
    utils.site.finishes.invalidate();
    utils.site.sectionVisibility.invalidate();
  };

  return (
    <DashboardLayout>
      <div className="admin-shell">
        <header className="admin-header">
          <div>
            <div className="admin-eyebrow">Content Studio · {content.brandName}</div>
            <h1 className="admin-title font-cinzel">
              Sri Venkateswara <span className="text-[#d4af37]">Granites.</span>
            </h1>
            <p className="admin-subtitle">Live website content management, collections, and photography.</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" target="_blank" rel="noreferrer" className="admin-outline"><ExternalLink className="h-3.5 w-3.5" /> View site</a>
          </div>
        </header>

        <div className="admin-tabs">
          {tabs.map((tab) => { const Icon = tab.icon; return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`admin-tab ${activeTab === tab.id ? "admin-tab-active" : ""}`}>
              <Icon className="h-4 w-4" />{tab.label}
            </button>
          ); })}
        </div>

        {activeTab === "overview" && (
          <Overview
            content={content}
            collections={collections}
            gallery={gallery}
            products={products}
            finishes={finishes}
            sections={sections}
            enquiries={enquiries}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "brand" && (
          <BrandTab content={content} setField={setField} saving={saveContent.isPending}
            isDirty={isContentDirty}
            onSave={() => saveContent.mutate(content)}
            onImageUploaded={(key: string, url: string) => {
              const updated = { ...content, [key]: url };
              setContent(updated);
              saveContent.mutate(updated);
            }} />
        )}

        {activeTab === "products" && (
          <DynamicTab
            title="Products" eyebrow="Product catalogue" description="Add, remove, and reorder the products shown on the site. Click the image to upload a new photo."
            items={products} isLoading={productsQuery.isLoading}
            fields={["name", "description"]}
            imageKey="imageUrl"
            onRefresh={() => { productsQuery.refetch(); invalidateSite(); }}
            createMutation={trpc.admin.createProduct.useMutation}
            saveMutation={trpc.admin.saveProduct.useMutation}
            deleteMutation={trpc.admin.deleteProduct.useMutation}
            toggleMutation={trpc.admin.toggleProductVisibility.useMutation}
            reorderMutation={trpc.admin.reorderProducts.useMutation}
            newItemDefaults={{ name: "New Product", description: "Describe this product...", imageUrl: "", sortOrder: products.length + 1 }}
          />
        )}

        {activeTab === "collections" && (
          <DynamicTab
            title="Collections" eyebrow="Stone collections" description="Manage the stone collection library. The top featured items appear first on the public site."
            items={collections} isLoading={collectionsQuery.isLoading}
            fields={["name", "category", "finish", "description"]}
            imageKey="imageUrl"
            onRefresh={() => { collectionsQuery.refetch(); invalidateSite(); }}
            createMutation={trpc.admin.createCollection.useMutation}
            saveMutation={trpc.admin.saveCollection.useMutation}
            deleteMutation={trpc.admin.deleteCollection.useMutation}
            toggleMutation={trpc.admin.toggleCollectionVisibility.useMutation}
            reorderMutation={trpc.admin.reorderCollections.useMutation}
            newItemDefaults={{ name: "New Stone", category: "Category", finish: "Polished", description: "Describe this stone...", imageUrl: "", isFeatured: 1, sortOrder: collections.length + 1 }}
          />
        )}

        {activeTab === "finishes" && (
          <DynamicTab
            title="Finishes" eyebrow="Surface finishes" description="Showcase the surface finishes SVG offers. Each finish has a name, tagline, description, and badge."
            items={finishes} isLoading={finishesQuery.isLoading}
            fields={["name", "tagline", "badge", "description"]}
            imageKey="imageUrl"
            onRefresh={() => { finishesQuery.refetch(); invalidateSite(); }}
            createMutation={trpc.admin.createFinish.useMutation}
            saveMutation={trpc.admin.saveFinish.useMutation}
            deleteMutation={trpc.admin.deleteFinish.useMutation}
            toggleMutation={trpc.admin.toggleFinishVisibility.useMutation}
            reorderMutation={trpc.admin.reorderFinishes.useMutation}
            newItemDefaults={{ name: "New Finish", tagline: "A distinctive surface.", description: "Describe this finish...", badge: "New", imageUrl: "", sortOrder: finishes.length + 1 }}
          />
        )}

        {activeTab === "gallery" && (
          <GalleryTab
            gallery={gallery} isLoading={galleryQuery.isLoading}
            onRefresh={() => { galleryQuery.refetch(); invalidateSite(); }}
          />
        )}

        {activeTab === "sections" && (
          <SectionsTab sections={sections} isLoading={sectionsQuery.isLoading} onRefresh={() => { sectionsQuery.refetch(); invalidateSite(); }} />
        )}

        {activeTab === "enquiries" && (
          <EnquiriesTab enquiries={enquiries} isLoading={enquiriesQuery.isLoading} onRefresh={enquiriesQuery.refetch} />
        )}
      </div>
    </DashboardLayout>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────────
function Overview({ content, collections, gallery, products, finishes, sections, enquiries, setActiveTab }: any) {
  return (
    <section className="admin-section">
      <div className="overview-hero">
        <div>
          <div className="admin-eyebrow text-[#d4af37]">Content Studio · {content.brandName}</div>
          <h2 className="font-cinzel text-4xl sm:text-5xl leading-tight tracking-tight text-white mt-2">
            The showroom is<br /><span className="text-[#d4af37]">ready for its next story.</span>
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-6 text-stone-400">A quick pulse on the content that shapes Sri Venkateswara Granites online.</p>
        </div>
        <div className="overview-mark"><span>SV</span></div>
      </div>
      <div className="overview-grid">
        <Stat label="Products" value={products.length} note="In catalogue" icon={Layers} onClick={() => setActiveTab("products")} />
        <Stat label="Collections" value={collections.length} note="Stone varieties" icon={Sparkles} onClick={() => setActiveTab("collections")} />
        <Stat label="Finishes" value={finishes.length} note="Surface textures" icon={Star} onClick={() => setActiveTab("finishes")} />
        <Stat label="Gallery" value={gallery.length} note="Photos on display" icon={ImageIcon} onClick={() => setActiveTab("gallery")} />
        <Stat label="Sections" value={sections.length} note="Website sections" icon={Grid3X3} onClick={() => setActiveTab("sections")} />
        <Stat label="Enquiries" value={enquiries.length} note={`${enquiries.filter((e: any) => e.status === "new").length} new`} icon={Inbox} onClick={() => setActiveTab("enquiries")} />
      </div>
    </section>
  );
}

// ─── Brand Tab ────────────────────────────────────────────────────────────────
function BrandTab({ content, setField, saving, isDirty, onSave, onImageUploaded }: any) {
  return (
    <section className="admin-section">
      <SectionHeading eyebrow="Brand & contact" title="The details behind the presence." description="Update the voice, contact information, and photography used across the public website." />
      {/* Key Public Website Images */}
      <div className="mb-10">
        <h3 className="font-cinzel admin-card-title text-2xl text-white mb-2">Key Section Photography</h3>
        <p className="text-xs text-stone-400 mb-4">Click any photo to change it. Uploads save instantly to the website.</p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { label: "Hero Background Photo", key: "heroImage" },
            { label: "Our Craft Photo", key: "aboutImage" },
            { label: "Pre-Footer Banner Photo", key: "bannerImage" },
          ].map(({ label, key }) => (
            <div key={key}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-stone-300">{label}</p>
              <EditableImage
                src={content[key] || "/images/hero-quarry.jpg"}
                className="h-48 w-full rounded-2xl overflow-hidden cursor-pointer shadow-sm border border-white/10"
                onUploaded={(url) => { setField(key, url); onImageUploaded(key, url); }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Facility Progression (From Quarry to Container) */}
      <div className="mb-10 border-t border-white/10 pt-8">
        <div className="admin-eyebrow text-[#d4af37]">Our Facility</div>
        <h3 className="mt-1 font-cinzel admin-card-title text-2xl text-white">From Quarry to Container — 5 Process Photos</h3>
        <p className="mt-1 text-xs text-stone-400 mb-4">These 5 photos show your production pipeline in the Facility section on the website.</p>
        
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 mb-6">
          {[
            { label: "1. Quarry", key: "facilityImage1" },
            { label: "2. Cutting", key: "facilityImage2" },
            { label: "3. Polishing", key: "facilityImage3" },
            { label: "4. Packaging", key: "facilityImage4" },
            { label: "5. Loading", key: "facilityImage5" },
          ].map(({ label, key }) => (
            <div key={key}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-stone-300">{label}</p>
              <EditableImage
                src={content[key] || "/images/hero-quarry.jpg"}
                className="aspect-square w-full rounded-xl overflow-hidden cursor-pointer shadow-sm border border-white/10"
                onUploaded={(url) => { setField(key, url); onImageUploaded(key, url); }}
              />
            </div>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Facility section title" value={content.facilityTitle} onChange={(v: string) => setField("facilityTitle", v)} />
          <label className="admin-field">
            <span>Facility section copy</span>
            <Textarea value={content.facilityCopy ?? ""} onChange={e => setField("facilityCopy", e.target.value)} />
          </label>
        </div>
      </div>

      {/* Text & Contact Information */}
      <div className="border-t border-white/10 pt-8">
        <div className="admin-eyebrow text-[#d4af37]">Brand & Contact</div>
        <h3 className="mt-1 font-cinzel admin-card-title text-2xl text-white mb-5">Website Text & Contact Details</h3>
        <div className="mb-5">
          <Field label="Brand name" value={content.brandName} onChange={(v: string) => setField("brandName", v)} />
        </div>

        {/* Multi-value Contact Information */}
        <div className="grid gap-5 mb-5 lg:grid-cols-3">
          <MultiStringField
            label="Phone Numbers"
            value={content.phone}
            onChange={(v: string) => setField("phone", v)}
            placeholder="e.g. +91 97906 13468"
            type="tel"
            itemLabel="Phone"
          />
          <MultiStringField
            label="WhatsApp Numbers"
            value={content.whatsapp}
            onChange={(v: string) => setField("whatsapp", v)}
            placeholder="e.g. +91 97906 13468"
            type="tel"
            itemLabel="WhatsApp"
          />
          <MultiStringField
            label="Email Addresses"
            value={content.email}
            onChange={(v: string) => setField("email", v)}
            placeholder="e.g. sales.svgranites@gmail.com"
            type="email"
            itemLabel="Email"
          />
        </div>

        <div className="admin-form-grid">
          <label className="admin-field full">
            <span>Factory & office address</span>
            <Textarea value={content.address ?? ""} onChange={e => setField("address", e.target.value)} />
          </label>
          <label className="admin-field full">
            <span>Google Maps Link (Optional)</span>
            <Input
              placeholder="e.g. https://maps.app.goo.gl/... (leave empty to generate from address automatically)"
              value={content.mapsUrl ?? ""}
              onChange={e => setField("mapsUrl", e.target.value)}
            />
            <span className="text-[11px] text-stone-400 font-normal normal-case -mt-1">
              If provided, clicking the address on the website opens this exact pin/map link. If left empty, it opens the address text on Google Maps automatically.
            </span>
          </label>
        </div>
      </div>

      {/* Hero Section & Key Metrics */}
      <div className="border-t border-white/10 pt-8">
        <div className="admin-eyebrow text-[#d4af37]">Section · Hero & Metrics</div>
        <h3 className="mt-1 font-cinzel admin-card-title text-2xl text-white mb-5">Hero Banner & Key Metrics Bar</h3>
        <div className="admin-form-grid">
          <label className="admin-field full">
            <span>Hero section eyebrow</span>
            <Input value={content.heroEyebrow ?? ""} onChange={e => setField("heroEyebrow", e.target.value)} />
          </label>
          <label className="admin-field full">
            <span>Hero main title</span>
            <Input value={content.heroTitle ?? ""} onChange={e => setField("heroTitle", e.target.value)} />
          </label>
          <label className="admin-field full">
            <span>Hero descriptive copy</span>
            <Textarea value={content.heroCopy ?? ""} onChange={e => setField("heroCopy", e.target.value)} />
          </label>
        </div>

        {/* 4 Key Metrics Bar */}
        <div className="mt-6 border-t border-white/10 pt-5">
          <h4 className="font-cinzel text-base text-white mb-1">Key Metrics Bar (4 Highlights)</h4>
          <p className="text-xs text-stone-400 mb-4">Values and labels displayed right below the hero banner.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#13161b] border border-white/10 p-3.5 rounded-xl space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">Highlight 1</span>
              <Field label="Value" value={content.metric1Val} onChange={(v: string) => setField("metric1Val", v)} />
              <Field label="Label" value={content.metric1Label} onChange={(v: string) => setField("metric1Label", v)} />
            </div>
            <div className="bg-[#13161b] border border-white/10 p-3.5 rounded-xl space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">Highlight 2</span>
              <Field label="Value" value={content.metric2Val} onChange={(v: string) => setField("metric2Val", v)} />
              <Field label="Label" value={content.metric2Label} onChange={(v: string) => setField("metric2Label", v)} />
            </div>
            <div className="bg-[#13161b] border border-white/10 p-3.5 rounded-xl space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">Highlight 3</span>
              <Field label="Value" value={content.metric3Val} onChange={(v: string) => setField("metric3Val", v)} />
              <Field label="Label" value={content.metric3Label} onChange={(v: string) => setField("metric3Label", v)} />
            </div>
            <div className="bg-[#13161b] border border-white/10 p-3.5 rounded-xl space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">Highlight 4</span>
              <Field label="Value" value={content.metric4Val} onChange={(v: string) => setField("metric4Val", v)} />
              <Field label="Label" value={content.metric4Label} onChange={(v: string) => setField("metric4Label", v)} />
            </div>
          </div>
        </div>
      </div>

      {/* Our Products Section Text */}
      <div className="border-t border-white/10 pt-8">
        <div className="admin-eyebrow text-[#d4af37]">Section · Products</div>
        <h3 className="mt-1 font-cinzel admin-card-title text-2xl text-white mb-5">Our Products Section Header & Copy</h3>
        <div className="admin-form-grid">
          <label className="admin-field full">
            <span>Products section eyebrow</span>
            <Input value={content.productsEyebrow ?? ""} onChange={e => setField("productsEyebrow", e.target.value)} />
          </label>
          <label className="admin-field full">
            <span>Products section title</span>
            <Input value={content.productsTitle ?? ""} onChange={e => setField("productsTitle", e.target.value)} />
          </label>
          <label className="admin-field full">
            <span>Products section copy</span>
            <Textarea value={content.productsCopy ?? ""} onChange={e => setField("productsCopy", e.target.value)} />
          </label>
        </div>
      </div>

      {/* Stone Collections Section Text */}
      <div className="border-t border-white/10 pt-8">
        <div className="admin-eyebrow text-[#d4af37]">Section · Collections</div>
        <h3 className="mt-1 font-cinzel admin-card-title text-2xl text-white mb-5">Stone Collections Section Header & Copy</h3>
        <div className="admin-form-grid">
          <label className="admin-field full">
            <span>Collections section eyebrow</span>
            <Input value={content.collectionsEyebrow ?? ""} onChange={e => setField("collectionsEyebrow", e.target.value)} />
          </label>
          <label className="admin-field full">
            <span>Collections section title</span>
            <Input value={content.collectionsTitle ?? ""} onChange={e => setField("collectionsTitle", e.target.value)} />
          </label>
          <label className="admin-field full">
            <span>Collections section copy</span>
            <Textarea value={content.collectionsCopy ?? ""} onChange={e => setField("collectionsCopy", e.target.value)} />
          </label>
        </div>
      </div>

      {/* Surface Finishes Section Text */}
      <div className="border-t border-white/10 pt-8">
        <div className="admin-eyebrow text-[#d4af37]">Section · Finishes</div>
        <h3 className="mt-1 font-cinzel admin-card-title text-2xl text-white mb-5">Surface Finishes Section Header & Copy</h3>
        <div className="admin-form-grid">
          <label className="admin-field full">
            <span>Finishes section eyebrow</span>
            <Input value={content.finishesEyebrow ?? ""} onChange={e => setField("finishesEyebrow", e.target.value)} />
          </label>
          <label className="admin-field full">
            <span>Finishes section title</span>
            <Input value={content.finishesTitle ?? ""} onChange={e => setField("finishesTitle", e.target.value)} />
          </label>
          <label className="admin-field full">
            <span>Finishes section copy</span>
            <Textarea value={content.finishesCopy ?? ""} onChange={e => setField("finishesCopy", e.target.value)} />
          </label>
        </div>
      </div>

      {/* Our Craft Section Text */}
      <div className="border-t border-white/10 pt-8">
        <div className="admin-eyebrow text-[#d4af37]">Section · Our Craft</div>
        <h3 className="mt-1 font-cinzel admin-card-title text-2xl text-white mb-5">Our Craft Section Title & Description</h3>
        <div className="admin-form-grid">
          <label className="admin-field full">
            <span>Our Craft section title</span>
            <Input value={content.aboutTitle ?? ""} onChange={e => setField("aboutTitle", e.target.value)} />
          </label>
          <label className="admin-field full">
            <span>Our Craft descriptive copy</span>
            <Textarea value={content.aboutCopy ?? ""} onChange={e => setField("aboutCopy", e.target.value)} />
          </label>
        </div>
      </div>

      {/* Why SV Granites & Global Reach */}
      <div className="border-t border-white/10 pt-8">
        <div className="admin-eyebrow text-[#d4af37]">Section · About & Global Reach</div>
        <h3 className="mt-1 font-cinzel admin-card-title text-2xl text-white mb-5">Why SV Granites & Global Reach Section Texts</h3>
        <div className="admin-form-grid">
          <label className="admin-field full">
            <span>Why SV Granites section eyebrow</span>
            <Input value={content.whyChooseEyebrow ?? ""} onChange={e => setField("whyChooseEyebrow", e.target.value)} />
          </label>
          <label className="admin-field full">
            <span>Why SV Granites main title</span>
            <Input value={content.whyChooseTitle ?? ""} onChange={e => setField("whyChooseTitle", e.target.value)} />
          </label>
        </div>

        {/* Why SV Granites — 6 Core Value Points */}
        <div className="mt-6 border-t border-white/10 pt-5">
          <h4 className="font-cinzel text-base text-white mb-1">Why SV Granites — 6 Core Value Points</h4>
          <p className="text-xs text-stone-400 mb-4">Edit the title and description for each of the 6 feature highlights under "Why SV Granites".</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-[#13161b] border border-white/10 p-3.5 rounded-xl space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">Point 1 · Manufacturing</span>
              <Field label="Title" value={content.whyFeature1Title} onChange={(v: string) => setField("whyFeature1Title", v)} />
              <Field label="Description" value={content.whyFeature1Desc} onChange={(v: string) => setField("whyFeature1Desc", v)} />
            </div>
            <div className="bg-[#13161b] border border-white/10 p-3.5 rounded-xl space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">Point 2 · Quality</span>
              <Field label="Title" value={content.whyFeature2Title} onChange={(v: string) => setField("whyFeature2Title", v)} />
              <Field label="Description" value={content.whyFeature2Desc} onChange={(v: string) => setField("whyFeature2Desc", v)} />
            </div>
            <div className="bg-[#13161b] border border-white/10 p-3.5 rounded-xl space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">Point 3 · Custom Production</span>
              <Field label="Title" value={content.whyFeature3Title} onChange={(v: string) => setField("whyFeature3Title", v)} />
              <Field label="Description" value={content.whyFeature3Desc} onChange={(v: string) => setField("whyFeature3Desc", v)} />
            </div>
            <div className="bg-[#13161b] border border-white/10 p-3.5 rounded-xl space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">Point 4 · Export Packaging</span>
              <Field label="Title" value={content.whyFeature4Title} onChange={(v: string) => setField("whyFeature4Title", v)} />
              <Field label="Description" value={content.whyFeature4Desc} onChange={(v: string) => setField("whyFeature4Desc", v)} />
            </div>
            <div className="bg-[#13161b] border border-white/10 p-3.5 rounded-xl space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">Point 5 · Responsive Communication</span>
              <Field label="Title" value={content.whyFeature5Title} onChange={(v: string) => setField("whyFeature5Title", v)} />
              <Field label="Description" value={content.whyFeature5Desc} onChange={(v: string) => setField("whyFeature5Desc", v)} />
            </div>
            <div className="bg-[#13161b] border border-white/10 p-3.5 rounded-xl space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">Point 6 · Long-Term Partnerships</span>
              <Field label="Title" value={content.whyFeature6Title} onChange={(v: string) => setField("whyFeature6Title", v)} />
              <Field label="Description" value={content.whyFeature6Desc} onChange={(v: string) => setField("whyFeature6Desc", v)} />
            </div>
          </div>
        </div>

        <div className="admin-form-grid">
          <label className="admin-field full">
            <span>Global Reach section eyebrow</span>
            <Input value={content.globalReachEyebrow ?? ""} onChange={e => setField("globalReachEyebrow", e.target.value)} />
          </label>
          <label className="admin-field full">
            <span>Global Reach main title</span>
            <Input value={content.globalReachTitle ?? ""} onChange={e => setField("globalReachTitle", e.target.value)} />
          </label>
          <label className="admin-field full">
            <span>Global Reach descriptive copy</span>
            <Textarea value={content.globalReachCopy ?? ""} onChange={e => setField("globalReachCopy", e.target.value)} />
          </label>
        </div>
      </div>

      {/* Photo Gallery Section Text */}
      <div className="border-t border-white/10 pt-8">
        <div className="admin-eyebrow text-[#d4af37]">Section · Gallery</div>
        <h3 className="mt-1 font-cinzel admin-card-title text-2xl text-white mb-5">Photo Gallery Section Header</h3>
        <div className="admin-form-grid">
          <label className="admin-field full">
            <span>Gallery section eyebrow</span>
            <Input value={content.galleryEyebrow ?? ""} onChange={e => setField("galleryEyebrow", e.target.value)} />
          </label>
          <label className="admin-field full">
            <span>Gallery section title</span>
            <Input value={content.galleryTitle ?? ""} onChange={e => setField("galleryTitle", e.target.value)} />
          </label>
        </div>
      </div>

      {/* Inquiry Form Section Text */}
      <div className="border-t border-white/10 pt-8">
        <div className="admin-eyebrow text-[#d4af37]">Section · Inquiry Form</div>
        <h3 className="mt-1 font-cinzel admin-card-title text-2xl text-white mb-5">Looking For Stone? Inquiry Form Card Text</h3>
        <div className="admin-form-grid">
          <label className="admin-field full">
            <span>Inquiry card main title</span>
            <Input value={content.enquiryTitle ?? ""} onChange={e => setField("enquiryTitle", e.target.value)} />
          </label>
          <label className="admin-field full">
            <span>Inquiry card descriptive copy</span>
            <Textarea value={content.enquiryCopy ?? ""} onChange={e => setField("enquiryCopy", e.target.value)} />
          </label>
        </div>
      </div>

      {/* Pre-Footer Banner & Footer Text */}
      <div className="border-t border-white/10 pt-8">
        <div className="admin-eyebrow text-[#d4af37]">Section · Bottom Banner & Footer</div>
        <h3 className="mt-1 font-cinzel admin-card-title text-2xl text-white mb-5">Pre-Footer Banner & Footer Copy</h3>
        <div className="admin-form-grid">
          <label className="admin-field full">
            <span>Bottom banner main headline</span>
            <Input value={content.bannerTitle ?? ""} onChange={e => setField("bannerTitle", e.target.value)} />
          </label>
          <label className="admin-field full">
            <span>Bottom banner location / subtitle</span>
            <Input value={content.bannerSubtitle ?? ""} onChange={e => setField("bannerSubtitle", e.target.value)} />
          </label>
          <label className="admin-field full">
            <span>Footer copyright notice & rights text</span>
            <Input value={content.footerCopy ?? ""} onChange={e => setField("footerCopy", e.target.value)} />
          </label>
        </div>
      </div>
      <div className="mt-8 flex justify-end">
        <Button
          onClick={onSave}
          disabled={saving || !isDirty}
          className="admin-gold"
          title={!isDirty ? "No changes to save" : "Save brand details"}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving…" : isDirty ? "Save brand details" : "Saved"}
        </Button>
      </div>
    </section>
  );
}

// ─── Dynamic Tab (Products / Collections / Finishes) ─────────────────────────
function DynamicTab({
  title, eyebrow, description, items, isLoading, fields, imageKey,
  onRefresh, createMutation, saveMutation, deleteMutation, toggleMutation, reorderMutation, newItemDefaults,
}: any) {
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState<any>(newItemDefaults);
  const [currentPage, setCurrentPage] = useState(0);
  const [localItems, setLocalItems] = useState<any[]>(items);
  useEffect(() => { setLocalItems(items); }, [items]);
  const ITEMS_PER_PAGE = 12;

  const create = createMutation({
    onSuccess: () => { toast.success("Added!"); setAdding(false); setNewItem(newItemDefaults); onRefresh(); },
    onError: (e: any) => toast.error(e.message),
  });
  const save = saveMutation({
    onSuccess: () => { toast.success("Saved!"); onRefresh(); },
    onError: (e: any) => toast.error(e.message),
  });
  const del = deleteMutation({
    onSuccess: () => { toast.success("Deleted!"); onRefresh(); },
    onError: (e: any) => toast.error(e.message),
  });
  const toggle = toggleMutation ? toggleMutation({
    onSuccess: () => { toast.success("Updated!"); onRefresh(); },
    onError: (e: any) => toast.error(e.message),
  }) : null;
  const reorder = reorderMutation ? reorderMutation({
    onSuccess: () => { toast.success("Order updated!"); onRefresh(); },
    onError: (e: any) => { toast.error(e.message); setLocalItems(items); },
  }) : null;

  const handleMove = (globalIndex: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? globalIndex - 1 : globalIndex + 1;
    if (targetIndex < 0 || targetIndex >= localItems.length) return;
    const newItems = [...localItems];
    const temp = newItems[globalIndex];
    newItems[globalIndex] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    setLocalItems(newItems);
    if (reorder) {
      reorder.mutate(newItems.map((item: any) => item.id));
    }
  };

  const totalPages = Math.ceil(localItems.length / ITEMS_PER_PAGE);
  const pageItems = localItems.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);

  return (
    <section className="admin-section">
      <div className="mb-10 flex flex-col justify-between gap-5 border-b border-white/10 pb-8 sm:flex-row sm:items-end">
        <div>
          <div className="admin-eyebrow text-[#d4af37]">{eyebrow}</div>
          <h2 className="mt-3 font-cinzel admin-section-title text-white">{title}</h2>
          <p className="mt-3 max-w-sm text-sm leading-6 text-stone-300">{description}</p>
        </div>
        <Button onClick={() => setAdding(true)} className="admin-gold shrink-0"><Plus className="h-4 w-4" /> Add {title.slice(0, -1)}</Button>
      </div>

      {adding && (
        <div className="mb-6 rounded-3xl border-2 border-[#d4af37]/40 bg-[#13161b] p-6 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-cinzel admin-card-title text-2xl font-bold text-white">New {title.slice(0, -1)}</h3>
            <button onClick={() => setAdding(false)} className="text-stone-400 hover:text-white"><X className="h-5 w-5" /></button>
          </div>
          <div className="mb-4">
            <ImageDropzone
              value={newItem[imageKey] || ""}
              onChange={(url) => setNewItem((n: any) => ({ ...n, [imageKey]: url }))}
              className="h-44"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((f: string) => (
              <label key={f} className={`admin-field ${f === "description" ? "full" : ""}`}>
                <span>{f.charAt(0).toUpperCase() + f.slice(1)}</span>
                {f === "description"
                  ? <Textarea value={newItem[f] ?? ""} onChange={e => setNewItem((n: any) => ({ ...n, [f]: e.target.value }))} />
                  : <Input value={newItem[f] ?? ""} onChange={e => setNewItem((n: any) => ({ ...n, [f]: e.target.value }))} />}
              </label>
            ))}
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setAdding(false)} className="border-white/10 text-stone-300 hover:bg-white/5">Cancel</Button>
            <Button onClick={() => create.mutate(newItem)} disabled={create.isPending || !newItem[imageKey]} className="admin-gold">
              {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#d4af37]" /></div>
      ) : (
        <div className="grid gap-5">
          {pageItems.map((item: any, index: number) => {
            const globalIndex = localItems.findIndex((it: any) => it.id === item.id);
            const pos = globalIndex !== -1 ? globalIndex : currentPage * ITEMS_PER_PAGE + index;
            return (
              <DynamicItemCard
                key={item.id}
                item={item}
                index={pos}
                totalCount={localItems.length}
                fields={fields}
                imageKey={imageKey}
                onSave={(data: any) => save.mutate({ id: item.id, data })}
                onDelete={() => del.mutate({ id: item.id })}
                onToggleVisibility={toggle ? (v: number) => toggle.mutate({ id: item.id, isVisible: v }) : undefined}
                onMoveUp={() => handleMove(pos, "up")}
                onMoveDown={() => handleMove(pos, "down")}
                isFirst={pos === 0}
                isLast={pos === localItems.length - 1}
                reordering={reorder?.isPending}
                saving={save.isPending}
                deleting={del.isPending}
              />
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0} className="pagination-btn"><ChevronLeft className="h-4 w-4" /></button>
          <span className="text-sm text-stone-400">{currentPage + 1} / {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage === totalPages - 1} className="pagination-btn"><ChevronRight className="h-4 w-4" /></button>
        </div>
      )}
    </section>
  );
}

function DynamicItemCard({
  item, index, totalCount, fields, imageKey,
  onSave, onDelete, onToggleVisibility,
  onMoveUp, onMoveDown, isFirst, isLast, reordering,
  saving, deleting,
}: any) {
  const [values, setValues] = useState<any>(() => ({ ...item }));
  const [confirmDelete, setConfirmDelete] = useState(false);
  useEffect(() => { setValues({ ...item }); }, [item.id, item]);

  const isDirty = useMemo(() => {
    const fieldChanged = fields.some((f: string) => (values[f] ?? "") !== (item[f] ?? ""));
    const imageChanged = (values[imageKey] ?? "") !== (item[imageKey] ?? "");
    return fieldChanged || imageChanged;
  }, [values, item, fields, imageKey]);

  return (
    <div className={`editable-card ${!item.isVisible ? "opacity-60" : ""}`}>
      <div className="editable-preview">
        <EditableImage
          src={values[imageKey] || "/images/hero.jpg"}
          className="h-full w-full"
          onUploaded={(url) => {
            const updated = { ...values, [imageKey]: url };
            setValues(updated);
            onSave(updated);
          }}
        />
        <div className="editable-number">
          {index + 1 < 10 ? `0${index + 1}` : index + 1}
        </div>
      </div>
      <div className="editable-fields">
        <div className="mb-5 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="admin-eyebrow text-[#d4af37]">Position #{index + 1} of {totalCount || "?"}</div>
            <h3 className="mt-1 font-cinzel admin-card-title text-white">{values.name || values.title}</h3>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Position Reordering Controls */}
            {onMoveUp && onMoveDown && (
              <div className="admin-reorder-pill">
                <button
                  type="button"
                  className="admin-reorder-btn"
                  onClick={onMoveUp}
                  disabled={isFirst || reordering}
                  title={isFirst ? "First position" : "Move up"}
                >
                  <ArrowUp className="h-4 w-4 stroke-[2.5]" />
                </button>
                <button
                  type="button"
                  className="admin-reorder-btn"
                  onClick={onMoveDown}
                  disabled={isLast || reordering}
                  title={isLast ? "Last position" : "Move down"}
                >
                  <ArrowDown className="h-4 w-4 stroke-[2.5]" />
                </button>
              </div>
            )}
            {onToggleVisibility && (
              <Button
                variant="outline"
                size="sm"
                className="border-white/10 text-stone-300 hover:bg-white/10 hover:text-white"
                onClick={() => onToggleVisibility(item.isVisible ? 0 : 1)}
                title={item.isVisible ? "Hide from website" : "Unhide (show on website)"}
              >
                {item.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-amber-400" />}
              </Button>
            )}
            {!confirmDelete
              ? <Button variant="outline" size="sm" onClick={() => setConfirmDelete(true)} className="text-red-400 border-red-500/20 hover:bg-red-950/40 hover:text-red-300"><Trash2 className="h-4 w-4" /></Button>
              : <div className="flex items-center gap-2 rounded-xl bg-red-950/40 border border-red-500/30 px-2 py-1"><span className="text-xs text-red-400">Sure?</span><Button size="sm" variant="destructive" onClick={onDelete} disabled={deleting}>{deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Delete"}</Button><Button size="sm" variant="outline" className="border-white/10 text-stone-300 hover:bg-white/10" onClick={() => setConfirmDelete(false)}>Cancel</Button></div>
            }
            <Button
              type="button"
              onClick={() => isDirty && onSave({ ...values })}
              disabled={saving || !isDirty}
              className="admin-gold"
              title={!isDirty ? "No changes to save" : "Save changes"}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} {isDirty ? "Save" : "Saved"}
            </Button>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((f: string) => (
            <label key={f} className={`admin-field ${f === "description" ? "full" : ""}`}>
              <span>{f.charAt(0).toUpperCase() + f.slice(1)}</span>
              {f === "description"
                ? <Textarea value={values[f] ?? ""} onChange={e => setValues((v: any) => ({ ...v, [f]: e.target.value }))} />
                : <Input value={values[f] ?? ""} onChange={e => setValues((v: any) => ({ ...v, [f]: e.target.value }))} />}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Gallery Tab ──────────────────────────────────────────────────────────────
const GALLERY_PER_PAGE = 20;

function GalleryTab({ gallery, isLoading, onRefresh }: any) {
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState({ imageUrl: "" });
  const [currentPage, setCurrentPage] = useState(0);

  const [localGallery, setLocalGallery] = useState<any[]>(gallery);
  useEffect(() => { setLocalGallery(gallery); }, [gallery]);

  const createGallery = trpc.admin.createGallery.useMutation({
    onSuccess: () => { toast.success("Gallery photo added!"); setAdding(false); setNewItem({ imageUrl: "" }); onRefresh(); },
    onError: (e) => toast.error(e.message),
  });
  const saveGallery = trpc.admin.saveGallery.useMutation({ onSuccess: () => { toast.success("Saved!"); onRefresh(); }, onError: (e) => toast.error(e.message) });
  const deleteGallery = trpc.admin.deleteGallery.useMutation({ onSuccess: () => { toast.success("Deleted!"); onRefresh(); }, onError: (e) => toast.error(e.message) });
  const toggleVisibility = trpc.admin.toggleGalleryVisibility.useMutation({ onSuccess: () => { toast.success("Updated!"); onRefresh(); }, onError: (e) => toast.error(e.message) });
  const reorderGallery = trpc.admin.reorderGallery.useMutation({
    onSuccess: () => { toast.success("Gallery order updated!"); onRefresh(); },
    onError: (e) => { toast.error(e.message); setLocalGallery(gallery); },
  });

  const handleMove = (globalIndex: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? globalIndex - 1 : globalIndex + 1;
    if (targetIndex < 0 || targetIndex >= localGallery.length) return;
    const newItems = [...localGallery];
    const temp = newItems[globalIndex];
    newItems[globalIndex] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    setLocalGallery(newItems);
    reorderGallery.mutate(newItems.map((item: any) => item.id));
  };

  const totalPages = Math.ceil(localGallery.length / GALLERY_PER_PAGE);
  const pageItems = localGallery.slice(currentPage * GALLERY_PER_PAGE, (currentPage + 1) * GALLERY_PER_PAGE);

  return (
    <section className="admin-section">
      <div className="mb-10 flex flex-col justify-between gap-5 border-b border-white/10 pb-8 sm:flex-row sm:items-end">
        <div>
          <div className="admin-eyebrow text-[#d4af37]">Project gallery</div>
          <h2 className="mt-3 font-cinzel admin-section-title text-white">Gallery</h2>
          <p className="mt-3 max-w-sm text-sm leading-6 text-stone-300">Showcase your finished projects. Click any photo to replace it, or use the arrow buttons to change order.</p>
        </div>
        <Button onClick={() => setAdding(true)} className="admin-gold shrink-0"><Plus className="h-4 w-4" /> Add photo</Button>
      </div>

      {adding && (
        <div className="mb-6 max-w-lg rounded-3xl border-2 border-[#d4af37]/40 bg-[#13161b] p-6 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-cinzel admin-card-title text-2xl font-bold text-white">Add Photo to Gallery</h3>
            <button onClick={() => setAdding(false)}><X className="h-5 w-5 text-stone-400 hover:text-white" /></button>
          </div>
          <div className="mb-4">
            <ImageDropzone
              value={newItem.imageUrl || ""}
              onChange={(url) => setNewItem({ imageUrl: url })}
              className="h-48"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setAdding(false)} className="border-white/10 text-stone-300 hover:bg-white/5">Cancel</Button>
            <Button
              onClick={() => createGallery.mutate({ imageUrl: newItem.imageUrl, title: "", location: "", year: "", sortOrder: localGallery.length + 1 })}
              disabled={createGallery.isPending || !newItem.imageUrl}
              className="admin-gold"
            >
              {createGallery.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add photo
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#d4af37]" /></div>
      ) : (
        <div className="gallery-admin-grid">
          {pageItems.map((item: any, idx: number) => {
            const globalIndex = localGallery.findIndex((it: any) => it.id === item.id);
            const pos = globalIndex !== -1 ? globalIndex : currentPage * GALLERY_PER_PAGE + idx;
            return (
              <GalleryCard
                key={item.id}
                item={item}
                index={pos}
                totalCount={localGallery.length}
                onSave={(data: any) => saveGallery.mutate({ id: item.id, data })}
                onDelete={() => deleteGallery.mutate({ id: item.id })}
                onToggle={(v: number) => toggleVisibility.mutate({ id: item.id, isVisible: v })}
                onMoveUp={() => handleMove(pos, "up")}
                onMoveDown={() => handleMove(pos, "down")}
                isFirst={pos === 0}
                isLast={pos === localGallery.length - 1}
                reordering={reorderGallery.isPending}
              />
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0} className="pagination-btn"><ChevronLeft className="h-4 w-4" /></button>
          <span className="text-sm text-stone-400">Page {currentPage + 1} / {totalPages} · {localGallery.length} total</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage === totalPages - 1} className="pagination-btn"><ChevronRight className="h-4 w-4" /></button>
        </div>
      )}
    </section>
  );
}

function GalleryCard({
  item, index, totalCount, onSave, onDelete, onToggle,
  onMoveUp, onMoveDown, isFirst, isLast, reordering,
}: any) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className={`gallery-admin-card relative ${!item.isVisible ? "opacity-50" : ""}`}>
      <div className="relative">
        <EditableImage
          src={item.imageUrl}
          className="h-44 w-full rounded-t-xl overflow-hidden cursor-pointer"
          onUploaded={(url) => {
            onSave({ imageUrl: url, title: "", location: "", year: "" });
          }}
        />
        <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm text-[#d4af37] border border-[#d4af37]/30 text-[11px] font-mono font-bold px-2 py-0.5 rounded shadow">
          #{index + 1}
        </div>
      </div>
      <div className="p-3 bg-[#13161b]">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5">
            <button
              className={`gallery-action-btn ${!item.isVisible ? "text-amber-400 border-amber-500/40 bg-amber-950/30" : ""}`}
              onClick={() => onToggle(item.isVisible ? 0 : 1)}
              title={item.isVisible ? "Hide from website" : "Unhide (show on website)"}
            >
              {item.isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            </button>
            {!confirmDelete ? (
              <button
                className="gallery-action-btn text-red-400 hover:text-red-300 hover:bg-red-950/40"
                onClick={() => setConfirmDelete(true)}
                title="Delete photo"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            ) : (
              <div className="flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-950/50 px-2 py-0.5 text-xs">
                <span className="text-[11px] text-red-400">Delete?</span>
                <button
                  className="font-bold text-red-400 hover:underline"
                  onClick={onDelete}
                >
                  Yes
                </button>
                <span className="text-red-500/40">/</span>
                <button
                  className="text-stone-300 hover:text-white"
                  onClick={() => setConfirmDelete(false)}
                >
                  No
                </button>
              </div>
            )}
          </div>
          <div className="gallery-reorder-pill">
            <button
              className="gallery-reorder-btn"
              onClick={onMoveUp}
              disabled={isFirst || reordering}
              title={isFirst ? "First item" : "Move earlier"}
            >
              <ArrowUp className="h-3.5 w-3.5 stroke-[2.5]" />
            </button>
            <button
              className="gallery-reorder-btn"
              onClick={onMoveDown}
              disabled={isLast || reordering}
              title={isLast ? "Last item" : "Move later"}
            >
              <ArrowDown className="h-3.5 w-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sections Toggle Tab ──────────────────────────────────────────────────────
const SECTION_LABELS: Record<string, string> = {
  hero: "Hero / Banner",
  about: "Why SV Granites & Global Reach",
  products: "Our Products",
  collections: "Stone Collections",
  finishes: "Surface Finishes",
  craft: "Our Craft",
  gallery: "Photo Gallery",
  facility: "Facility Progression",
  contact: "Inquiry Form & Contact",
};

function SectionsTab({ sections, isLoading, onRefresh }: any) {
  const updateVisibility = trpc.admin.updateSectionVisibility.useMutation({
    onSuccess: () => { toast.success("Section updated!"); onRefresh(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <section className="admin-section">
      <SectionHeading eyebrow="Sections" title="Show or hide sections." description="Control which sections are visible on the public website. Toggle to instantly hide or show any section." />
      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#d4af37]" /></div>
      ) : (
        <div className="grid gap-4">
          {sections.map((section: any) => (
            <div key={section.sectionKey} className="section-toggle-row">
              <div>
                <div className="font-medium text-white">{SECTION_LABELS[section.sectionKey] ?? section.sectionKey}</div>
                <div className="text-xs text-stone-400">Key: {section.sectionKey}</div>
              </div>
              <button
                className={`section-toggle-btn ${section.isVisible ? "section-toggle-on" : "section-toggle-off"}`}
                onClick={() => updateVisibility.mutate({ sectionKey: section.sectionKey, isVisible: section.isVisible ? 0 : 1 })}
                disabled={updateVisibility.isPending}
              >
                {section.isVisible ? <><Eye className="h-4 w-4" /> Visible</> : <><EyeOff className="h-4 w-4" /> Hidden</>}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Enquiries Tab ────────────────────────────────────────────────────────────
function EnquiriesTab({ enquiries, isLoading, onRefresh }: any) {
  const updateEnquiry = trpc.admin.updateEnquiry.useMutation({
    onSuccess: () => { toast.success("Status updated!"); onRefresh(); }
  });

  return (
    <section className="admin-section">
      <SectionHeading eyebrow="Enquiries" title="Conversations worth following up." description="A working inbox for every new project request from the public site." />
      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#d4af37]" /></div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#13161b]">
          {enquiries.length ? enquiries.map((item: any) => (
            <div key={item.id} className="enquiry-row">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-medium text-white">{item.name}</span>
                  <Badge className={item.status === "new" ? "status-new" : "status-progress"}>{item.status}</Badge>
                </div>
                <div className="mt-2 text-sm text-stone-400">{item.projectType} · {item.phone} · {item.email}</div>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-300">{item.message}</p>
              </div>
              <select className="admin-select w-36" value={item.status} onChange={e => updateEnquiry.mutate({ id: item.id, status: e.target.value })}>
                <option value="new">New</option>
                <option value="in-progress">In progress</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          )) : (
            <div className="empty-state">
              <Inbox className="h-7 w-7 text-[#d4af37]" />
              <div><div className="font-cinzel text-2xl font-bold text-white">No enquiries yet.</div><p className="mt-1 text-sm text-stone-400">When a visitor reaches out, it will appear here.</p></div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Stat({ label, value, note, icon: Icon, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className="stat-card cursor-pointer group"
      title={`Go to ${label} tab`}
    >
      <div className="flex items-center justify-between">
        <Icon className="h-5 w-5 text-[#d4af37] transition-transform duration-300 group-hover:scale-110" />
        <ChevronRight className="h-3.5 w-3.5 text-white/20 transition-all duration-300 group-hover:text-[#d4af37] group-hover:translate-x-0.5" />
      </div>
      <div className="mt-5 font-cinzel text-4xl sm:text-5xl font-bold text-white group-hover:text-[#d4af37] transition-colors">{value}</div>
      <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-300">{label}</div>
      <div className="mt-3 text-xs text-stone-500">{note}</div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, description }: any) {
  return (
    <div className="mb-10 flex flex-col justify-between gap-5 border-b border-white/10 pb-8 sm:flex-row sm:items-end">
      <div>
        <div className="admin-eyebrow text-[#d4af37]">{eyebrow}</div>
        <h2 className="mt-3 font-cinzel admin-section-title text-white">{title}</h2>
      </div>
      <p className="max-w-sm text-sm leading-6 text-stone-300">{description}</p>
    </div>
  );
}

function Field({ label, value, onChange }: any) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <Input value={value ?? ""} onChange={e => onChange(e.target.value)} />
    </label>
  );
}

type MultiItem = {
  id: string;
  val: string;
};

function parseToMultiItems(val: string | null | undefined): MultiItem[] {
  if (!val) return [{ id: "m-0", val: "" }];
  const parts = val
    .split(/[\n,]+/)
    .map(s => s.trim())
    .filter(Boolean);
  if (parts.length === 0) return [{ id: "m-0", val: "" }];
  return parts.map((str, idx) => ({
    id: `m-${idx}-${str.slice(0, 8)}`,
    val: str,
  }));
}

function MultiStringField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  itemLabel = "item",
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
  itemLabel?: string;
}) {
  const [items, setItems] = useState<MultiItem[]>(() => parseToMultiItems(value));
  const lastSyncValueRef = useRef<string>(value ?? "");

  // When value changes from parent (e.g. initial server load or reset)
  useEffect(() => {
    const incoming = value ?? "";
    if (incoming !== lastSyncValueRef.current) {
      lastSyncValueRef.current = incoming;
      setItems(parseToMultiItems(incoming));
    }
  }, [value]);

  const updateItem = (id: string, newVal: string) => {
    // If user pasted a comma-separated or newline-separated string, expand into multiple rows
    if (newVal.includes(",") || newVal.includes("\n")) {
      const parts = newVal.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
      if (parts.length > 1) {
        setItems(prev => {
          const idx = prev.findIndex(item => item.id === id);
          if (idx === -1) return prev;
          const expanded: MultiItem[] = parts.map((p, i) => ({
            id: `m-paste-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
            val: p,
          }));
          const next = [...prev.slice(0, idx), ...expanded, ...prev.slice(idx + 1)];
          const joined = next.map(i => i.val.trim()).filter(Boolean).join(", ");
          lastSyncValueRef.current = joined;
          onChange(joined);
          return next;
        });
        return;
      }
    }

    setItems(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, val: newVal } : item);
      const joined = updated
        .map(i => i.val.trim())
        .filter(Boolean)
        .join(", ");
      lastSyncValueRef.current = joined;
      onChange(joined);
      return updated;
    });
  };

  const addItem = () => {
    const newItem: MultiItem = {
      id: `m-new-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      val: "",
    };
    setItems(prev => [...prev, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(prev => {
      const updated = prev.filter(item => item.id !== id);
      const finalItems = updated.length > 0 ? updated : [{ id: `m-fallback-${Date.now()}`, val: "" }];
      const joined = finalItems
        .map(i => i.val.trim())
        .filter(Boolean)
        .join(", ");
      lastSyncValueRef.current = joined;
      onChange(joined);
      return finalItems;
    });
  };

  return (
    <div className="rounded-2xl bg-[#13161b] border border-white/10 p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-300">
            {label}
          </span>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#d4af37] hover:text-[#dec083] bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/30 px-3 py-1 rounded-full transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Add {itemLabel}
          </button>
        </div>

        <div className="space-y-2.5">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <Input
                type={type}
                value={item.val}
                placeholder={placeholder}
                onChange={e => updateItem(item.id, e.target.value)}
                className="bg-white/[0.04] border-white/15 text-white placeholder:text-stone-500 focus:border-[#d4af37] h-10 text-sm"
              />
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="h-10 w-10 shrink-0 flex items-center justify-center rounded-lg bg-red-950/30 border border-red-500/20 text-red-400 hover:bg-red-950/60 hover:text-red-300 transition-colors cursor-pointer"
                  title={`Remove this ${itemLabel}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      <p className="mt-3 text-[11px] text-stone-400">
        Add multiple {itemLabel.toLowerCase()}s. Each will be clickable on the website.
      </p>
    </div>
  );
}
