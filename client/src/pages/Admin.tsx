import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle, ArrowDown, ArrowUp, ArrowUpRight, ArrowRight, Calendar, Check, ChevronDown, ChevronLeft, ChevronRight, Copy, ExternalLink,
  Eye, EyeOff, FileSpreadsheet, Filter, Grid3X3, HelpCircle, Image as ImageIcon, Inbox, LayoutDashboard, Loader2,
  LogOut, Mail, MessageSquare, Palette, Phone, Plus, RefreshCw, Save, Search, Sparkles, Star, Trash2, Upload, X, Layers
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
  googleSheetUrl: "",
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
          <EnquiriesTab
            enquiries={enquiries}
            isLoading={enquiriesQuery.isLoading}
            onRefresh={enquiriesQuery.refetch}
            content={content}
            setField={setField}
            onSaveContent={() => saveContent.mutate(content)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────────
function Overview({ content, collections, gallery, products, finishes, sections, enquiries, setActiveTab }: any) {
  const newEnquiriesCount = enquiries.filter((e: any) => e.status === "new").length;

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

      {/* Prominent Golden Alert Banner for New Enquiries */}
      {newEnquiriesCount > 0 && (
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#d4af37]/60 bg-gradient-to-r from-[#d4af37]/20 via-[#d4af37]/10 to-[#13161b] p-5 shadow-[0_0_30px_rgba(212,175,55,0.18)]">
          <div className="flex items-center gap-3.5">
            <span className="relative flex h-3.5 w-3.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4af37] opacity-80"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#d4af37]"></span>
            </span>
            <div>
              <div className="font-semibold text-white text-base flex items-center gap-2">
                <span>{newEnquiriesCount} New Customer {newEnquiriesCount === 1 ? "Enquiry" : "Enquiries"} Received</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#d4af37] text-black px-2 py-0.5 rounded-full shadow-sm">Action Needed</span>
              </div>
              <div className="text-xs text-stone-300 mt-1">
                New submissions from your website and Google Sheets are waiting for your review.
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveTab("enquiries")}
            className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-[#d4af37] px-4 py-2.5 text-xs font-bold text-black hover:bg-[#dec083] transition-all shadow-md hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] shrink-0"
          >
            Review Enquiries <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="overview-grid">
        <Stat label="Products" value={products.length} note="In catalogue" icon={Layers} onClick={() => setActiveTab("products")} />
        <Stat label="Collections" value={collections.length} note="Stone varieties" icon={Sparkles} onClick={() => setActiveTab("collections")} />
        <Stat label="Finishes" value={finishes.length} note="Surface textures" icon={Star} onClick={() => setActiveTab("finishes")} />
        <Stat label="Gallery" value={gallery.length} note="Photos on display" icon={ImageIcon} onClick={() => setActiveTab("gallery")} />
        <Stat label="Sections" value={sections.length} note="Website sections" icon={Grid3X3} onClick={() => setActiveTab("sections")} />
        <Stat
          label="Enquiries"
          value={enquiries.length}
          note={newEnquiriesCount > 0 ? `${newEnquiriesCount} new to review` : "All caught up"}
          icon={Inbox}
          onClick={() => setActiveTab("enquiries")}
          isHighlighted={newEnquiriesCount > 0}
          highlightBadge={newEnquiriesCount > 0 ? `${newEnquiriesCount} NEW` : undefined}
        />
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
          <label className="admin-field full">
            <span>Google Sheet URL or Webhook Link (Optional)</span>
            <Input
              placeholder="e.g. https://docs.google.com/spreadsheets/d/.../edit or Google Apps Script URL"
              value={content.googleSheetUrl ?? ""}
              onChange={e => setField("googleSheetUrl", e.target.value)}
            />
            <span className="text-[11px] text-stone-400 font-normal normal-case -mt-1">
              Used in the Enquiries tab to sync client enquiries directly from your Google Sheet into the Admin Dashboard.
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

// ─── Status Filter Dropdown Component ──────────────────────────────────────────
function StatusFilterDropdown({
  value,
  onChange,
  totalCount,
  newCount,
}: {
  value: string;
  onChange: (val: string) => void;
  totalCount: number;
  newCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const toggle = () => {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setDropUp(spaceBelow < 200);
    }
    setOpen(!open);
  };

  const options = [
    { id: "all", label: `All Statuses (${totalCount})`, dot: "bg-stone-400" },
    { id: "new", label: `New (${newCount})`, dot: "bg-[#d4af37]", textClass: "text-[#d4af37]" },
    { id: "in-progress", label: "In Progress", dot: "bg-blue-400", textClass: "text-blue-300" },
    { id: "closed", label: "Closed", dot: "bg-stone-500", textClass: "text-stone-300" },
  ];

  const current = options.find((o) => o.id === value) || options[0];

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        type="button"
        onClick={toggle}
        className={`cursor-pointer inline-flex items-center gap-2 rounded-xl bg-[#14171d] hover:bg-[#1a1e26] border px-3 py-1.5 text-xs font-medium text-stone-200 transition-all shadow-sm ${
          open ? "border-[#d4af37] ring-2 ring-[#d4af37]/20" : "border-white/10 hover:border-[#d4af37]/40"
        }`}
      >
        <span className={`h-2 w-2 rounded-full ${current.dot}`}></span>
        <span className="font-semibold text-white">{current.label}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-stone-400 transition-transform ${open ? "rotate-180 text-[#d4af37]" : ""}`} />
      </button>

      {open && (
        <div
          className={`absolute right-0 z-50 w-48 rounded-xl border border-[#d4af37]/40 bg-[#161a22] p-1.5 shadow-2xl shadow-black/90 backdrop-blur-md animate-in fade-in-0 zoom-in-95 ${
            dropUp ? "bottom-full mb-1.5" : "top-full mt-1.5"
          }`}
        >
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-500">
            Filter Status
          </div>
          {options.map((opt) => {
            const isSelected = opt.id === value;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id);
                  setOpen(false);
                }}
                className={`cursor-pointer w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                  isSelected
                    ? "bg-[#d4af37]/20 text-[#d4af37] font-bold"
                    : "text-stone-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${opt.dot}`}></span>
                  <span className={opt.textClass || "text-stone-200"}>{opt.label}</span>
                </div>
                {isSelected && <Check className="h-3.5 w-3.5 text-[#d4af37] stroke-[3]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Individual Enquiry Status Dropdown ─────────────────────────────────────────
function EnquiryStatusDropdown({
  status,
  onChange,
  disabled,
}: {
  status: string;
  onChange: (newStatus: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const toggle = () => {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setDropUp(spaceBelow < 170);
    }
    setOpen(!open);
  };

  const statusConfigs: Record<string, { label: string; dot: string; textColor: string }> = {
    new: { label: "New", dot: "bg-[#d4af37]", textColor: "text-[#d4af37]" },
    "in-progress": { label: "In Progress", dot: "bg-blue-400", textColor: "text-blue-300" },
    closed: { label: "Closed", dot: "bg-stone-400", textColor: "text-stone-300" },
  };

  const current = statusConfigs[status] || statusConfigs.new;

  const options = [
    { id: "new", label: "New", dot: "bg-[#d4af37]", textColor: "text-[#d4af37]" },
    { id: "in-progress", label: "In Progress", dot: "bg-blue-400", textColor: "text-blue-300" },
    { id: "closed", label: "Closed", dot: "bg-stone-400", textColor: "text-stone-300" },
  ];

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={toggle}
        className={`cursor-pointer inline-flex items-center justify-between gap-2 rounded-xl bg-[#14171d] hover:bg-[#1a1e26] border px-3 py-1.5 text-xs font-medium transition-all shadow-sm w-36 ${
          open ? "border-[#d4af37] ring-2 ring-[#d4af37]/20" : "border-white/15 hover:border-[#d4af37]/50"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <span className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${current.dot}`}></span>
          <span className="font-semibold text-white">{current.label}</span>
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-stone-400 transition-transform ${open ? "rotate-180 text-[#d4af37]" : ""}`} />
      </button>

      {open && (
        <div
          className={`absolute right-0 z-50 w-36 rounded-xl border border-[#d4af37]/40 bg-[#161a22] p-1.5 shadow-2xl shadow-black/90 backdrop-blur-md animate-in fade-in-0 zoom-in-95 ${
            dropUp ? "bottom-full mb-1.5" : "top-full mt-1.5"
          }`}
        >
          {options.map((opt) => {
            const isSelected = opt.id === status;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id);
                  setOpen(false);
                }}
                className={`cursor-pointer w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                  isSelected
                    ? "bg-[#d4af37]/20 text-[#d4af37] font-bold"
                    : "text-stone-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${opt.dot}`}></span>
                  <span className={opt.textColor}>{opt.label}</span>
                </div>
                {isSelected && <Check className="h-3.5 w-3.5 text-[#d4af37] stroke-[3]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Enquiries Tab ────────────────────────────────────────────────────────────
function EnquiriesTab({ enquiries, isLoading, onRefresh, content, setField, onSaveContent }: any) {
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showScriptModal, setShowScriptModal] = useState<boolean>(false);
  const [sheetInputUrl, setSheetInputUrl] = useState<string>(content?.googleSheetUrl || "");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState<boolean>(false);

  const updateEnquiry = trpc.admin.updateEnquiry.useMutation({
    onSuccess: () => { toast.success("Status updated!"); onRefresh(); },
    onError: (e) => toast.error(e.message),
  });

  const deleteEnquiry = trpc.admin.deleteEnquiry.useMutation({
    onSuccess: (res: any) => {
      if (res?.sheetResult?.syncedToSheet) {
        toast.success("Enquiry deleted from website and Google Sheet!");
      } else if (res?.sheetResult?.reason === "script_not_updated") {
        toast.success("Enquiry deleted from website! (Note: Update your Google Apps Script using the 'Setup Guide' to delete rows from Google Sheet as well)");
      } else {
        toast.success("Enquiry deleted!");
      }
      setSelectedIds((prev) => prev.filter((id) => id !== res?.deletedId));
      onRefresh();
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteEnquiriesBulk = trpc.admin.deleteEnquiriesBulk.useMutation({
    onSuccess: (res: any) => {
      if (res?.sheetSuccessCount > 0) {
        toast.success(`Deleted ${res.count} enquiries from website and Google Sheet!`);
      } else {
        toast.success(`Deleted ${res.count} enquiries!`);
      }
      setSelectedIds([]);
      setShowBulkDeleteModal(false);
      onRefresh();
    },
    onError: (e) => toast.error(e.message || "Failed to delete enquiries"),
  });

  const syncSheet = trpc.admin.syncFromGoogleSheet.useMutation({
    onSuccess: (data) => {
      toast.success(`Google Sheet Synced! ${data.count} enquiries processed (${data.added} new, ${data.updated} updated).`);
      onRefresh();
    },
    onError: (e) => toast.error(e.message || "Failed to sync from Google Sheet"),
  });

  const handleFetchFromSheet = () => {
    syncSheet.mutate({ sheetUrl: sheetInputUrl.trim() || content?.googleSheetUrl || undefined });
  };

  const handleDelete = (item: any) => {
    if (window.confirm(`Delete enquiry from "${item.name}"?\n\nThis will permanently delete it from the website and update your Google Sheet.`)) {
      deleteEnquiry.mutate({ id: item.id });
    }
  };

  // Filter inquiries based on Date, Status, and Search
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((item: any) => {
      // 1. Status Filter
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }

      // 2. Search Filter
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.name?.toLowerCase().includes(q);
        const matchesEmail = item.email?.toLowerCase().includes(q);
        const matchesPhone = item.phone?.toLowerCase().includes(q);
        const matchesType = item.projectType?.toLowerCase().includes(q);
        const matchesMsg = item.message?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesType && !matchesMsg) {
          return false;
        }
      }

      // 3. Date Filter
      if (dateFilter !== "all") {
        const itemDate = new Date(item.createdAt);
        const now = new Date();

        if (dateFilter === "today") {
          const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          if (itemDate < startOfToday) return false;
        } else if (dateFilter === "yesterday") {
          const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
          const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          if (itemDate < startOfYesterday || itemDate >= endOfYesterday) return false;
        } else if (dateFilter === "7days") {
          const past7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (itemDate < past7) return false;
        } else if (dateFilter === "30days") {
          const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (itemDate < past30) return false;
        } else if (dateFilter === "month") {
          if (itemDate.getMonth() !== now.getMonth() || itemDate.getFullYear() !== now.getFullYear()) {
            return false;
          }
        } else if (dateFilter === "custom") {
          if (startDate) {
            const start = new Date(startDate);
            if (itemDate < start) return false;
          }
          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            if (itemDate > end) return false;
          }
        }
      }

      return true;
    });
  }, [enquiries, statusFilter, searchQuery, dateFilter, startDate, endDate]);

  const newCount = enquiries.filter((e: any) => e.status === "new").length;
  const isFiltered = statusFilter !== "all" || searchQuery !== "" || dateFilter !== "all";

  // Filter-aware selection logic
  const filteredIds = useMemo(() => filteredEnquiries.map((e: any) => e.id), [filteredEnquiries]);
  const isAllFilteredSelected = filteredIds.length > 0 && filteredIds.every((id: number) => selectedIds.includes(id));
  const isSomeFilteredSelected = filteredIds.some((id: number) => selectedIds.includes(id)) && !isAllFilteredSelected;

  const handleToggleSelectAll = () => {
    if (isAllFilteredSelected) {
      // Deselect filtered enquiries
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      // Select ONLY the enquiries matching current filter
      setSelectedIds(filteredIds);
    }
  };

  const handleToggleRow = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const appsScriptCode = `// Sri Venkateswara Granites - Two-Way Google Apps Script
function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) {
    return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
  }
  var headers = rows[0].map(function(h) { return String(h).toLowerCase().trim(); });
  var result = [];
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    if (!row || row.join("").trim() === "") continue;
    var item = {};
    for (var j = 0; j < headers.length; j++) {
      item[headers[j]] = row[j];
    }
    result.push(item);
  }
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = {};
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    data = e.parameter || {};
  }

  // DELETE ACTION: Removes the row from Google Sheet
  if (data.action === "delete") {
    var rows = sheet.getDataRange().getValues();
    for (var i = rows.length - 1; i >= 1; i--) {
      var row = rows[i];
      var rowEmail = String(row[2] || "").toLowerCase().trim();
      var rowPhone = String(row[3] || "").replace(/\\D/g, "");
      var targetEmail = String(data.email || "").toLowerCase().trim();
      var targetPhone = String(data.phone || "").replace(/\\D/g, "");

      if ((targetEmail && rowEmail === targetEmail) || (targetPhone && rowPhone === targetPhone)) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ status: "success", action: "deleted" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // READ ACTION (via POST)
  if (data.action === "read" || data.action === "fetch") {
    return doGet(e);
  }

  // DEFAULT: Append new enquiry from website
  var timestamp = data.timestamp || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  sheet.appendRow([
    timestamp,
    data.name || "",
    data.email || "",
    data.phone || "",
    data.projectType || "",
    data.message || "",
    data.status || "new"
  ]);

  return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}`;

  return (
    <section className="admin-section">
      <SectionHeading
        eyebrow="Enquiries & CRM"
        title="Conversations worth following up."
        description="A working inbox for every new project request from your website and Google Sheet."
      />

      {/* Google Sheets Synchronisation Control Bar */}
      <div className="mb-6 rounded-2xl border border-white/10 bg-[#13161b] p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-sm">Google Sheets Integration</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Active
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                All website submissions are automatically logged to Google Sheets. You can also fetch updates made directly in your sheet.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleFetchFromSheet}
              disabled={syncSheet.isPending}
              className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-[#d4af37] px-4 py-2.5 text-xs font-bold text-black hover:bg-[#dec083] transition-all shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${syncSheet.isPending ? "animate-spin" : ""}`} />
              {syncSheet.isPending ? "Syncing..." : "Fetch from Google Sheet"}
            </button>
            <button
              onClick={() => setShowScriptModal(true)}
              className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs font-medium text-stone-300 hover:bg-white/10 transition-colors"
            >
              <HelpCircle className="h-3.5 w-3.5 text-[#d4af37]" />
              Setup Guide & Script
            </button>
          </div>
        </div>

        {/* Optional Google Sheet Link override */}
        <div className="mt-4 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center gap-3">
          <span className="text-xs text-stone-400 shrink-0">Google Sheet URL:</span>
          <Input
            value={sheetInputUrl}
            onChange={(e) => {
              setSheetInputUrl(e.target.value);
              setField?.("googleSheetUrl", e.target.value);
            }}
            placeholder="Paste your Google Sheet link (e.g. https://docs.google.com/spreadsheets/d/.../edit)"
            className="bg-black/30 border-white/10 text-xs h-9 text-stone-200"
          />
          {onSaveContent && (
            <button
              onClick={onSaveContent}
              className="cursor-pointer shrink-0 text-xs bg-white/10 hover:bg-white/15 px-3 py-2 rounded-lg text-white font-medium transition-colors"
            >
              Save Link
            </button>
          )}
        </div>
      </div>

      {/* Filter Options Bar: Date, Status, Search */}
      <div className="mb-6 rounded-2xl border border-white/10 bg-[#13161b] p-4 space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          
          {/* Search box */}
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, phone, email, project..."
              className="pl-9 bg-black/30 border-white/10 text-xs h-9 text-white placeholder:text-stone-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white text-xs cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Date Filter presets */}
          <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
            <span className="text-xs text-stone-400 mr-1 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-[#d4af37]" /> Date:
            </span>
            {[
              { id: "all", label: "All Time" },
              { id: "today", label: "Today" },
              { id: "yesterday", label: "Yesterday" },
              { id: "7days", label: "Last 7 Days" },
              { id: "30days", label: "Last 30 Days" },
              { id: "month", label: "This Month" },
              { id: "custom", label: "Custom Range" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setDateFilter(p.id)}
                className={`cursor-pointer px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  dateFilter === p.id
                    ? "bg-[#d4af37] text-black font-semibold shadow-sm"
                    : "bg-white/5 hover:bg-white/10 text-stone-300"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom Status Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5 text-[#d4af37]" /> Status:
            </span>
            <StatusFilterDropdown
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              totalCount={enquiries.length}
              newCount={newCount}
            />
          </div>
        </div>

        {/* Custom Date Range Picker inputs when 'custom' is active */}
        {dateFilter === "custom" && (
          <div className="pt-3 border-t border-white/5 flex flex-wrap items-center gap-3">
            <span className="text-xs text-stone-300 font-medium">Custom Range:</span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-stone-400">From:</span>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-black/40 border-white/10 text-xs h-8 w-36 text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-stone-400">To:</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-black/40 border-white/10 text-xs h-8 w-36 text-white"
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => { setStartDate(""); setEndDate(""); }}
                className="cursor-pointer text-[11px] text-stone-400 hover:text-white underline ml-2"
              >
                Clear dates
              </button>
            )}
          </div>
        )}

        {/* Results summary bar with Select All */}
        <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-400">
          <div className="flex items-center gap-3">
            {filteredEnquiries.length > 0 && (
              <button
                type="button"
                onClick={handleToggleSelectAll}
                className="cursor-pointer inline-flex items-center gap-2 text-xs font-semibold text-stone-300 hover:text-white transition-colors"
                title={isAllFilteredSelected ? "Deselect all in current filter" : "Select all in current filter"}
              >
                <span
                  className={`h-4 w-4 rounded border flex items-center justify-center transition-all ${
                    isAllFilteredSelected
                      ? "bg-[#d4af37] border-[#d4af37] text-black shadow-sm"
                      : isSomeFilteredSelected
                      ? "bg-[#d4af37]/30 border-[#d4af37] text-white"
                      : "border-white/30 bg-white/5 hover:border-[#d4af37]/60"
                  }`}
                >
                  {isAllFilteredSelected ? (
                    <Check className="h-3 w-3 stroke-[3]" />
                  ) : isSomeFilteredSelected ? (
                    <span className="h-0.5 w-2 bg-[#d4af37]"></span>
                  ) : null}
                </span>
                <span>
                  Select All ({filteredEnquiries.length}
                  {isFiltered ? " filtered" : ""})
                </span>
              </button>
            )}
            {filteredEnquiries.length > 0 && <span className="text-stone-600">|</span>}
            <div>
              Showing <span className="text-white font-semibold">{filteredEnquiries.length}</span> of {enquiries.length} enquiries
              {newCount > 0 && (
                <span className="ml-2 text-[#d4af37] font-semibold">({newCount} pending review)</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {selectedIds.length > 0 && (
              <span className="text-[#d4af37] font-semibold text-xs bg-[#d4af37]/15 px-2.5 py-0.5 rounded-full border border-[#d4af37]/30">
                {selectedIds.length} selected
              </span>
            )}
            {isFiltered && (
              <button
                onClick={() => {
                  setDateFilter("all");
                  setStartDate("");
                  setEndDate("");
                  setStatusFilter("all");
                  setSearchQuery("");
                }}
                className="cursor-pointer text-xs text-[#d4af37] hover:underline"
              >
                Reset all filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Action Bar when enquiries are selected */}
      {selectedIds.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#d4af37]/40 bg-[#d4af37]/10 p-3.5 px-5 shadow-lg shadow-black/40 animate-in fade-in-0 slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#d4af37] text-xs font-bold text-black shadow">
              {selectedIds.length}
            </span>
            <div>
              <span className="text-sm font-bold text-white">
                {selectedIds.length} Enquiry{selectedIds.length > 1 ? "ies" : ""} Selected
              </span>
              {isFiltered && (
                <span className="ml-2 text-[11px] font-semibold text-[#dec083]">
                  (from current filter)
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="cursor-pointer px-3 py-1.5 rounded-xl text-xs font-medium text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              Deselect All
            </button>
            <button
              type="button"
              onClick={() => setShowBulkDeleteModal(true)}
              className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs px-4 py-2 shadow-md shadow-red-950/50 transition-all hover:scale-[1.02]"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Selected ({selectedIds.length})
            </button>
          </div>
        </div>
      )}

      {/* Enquiries List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#d4af37]" />
        </div>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-[#13161b]">
          {filteredEnquiries.length ? (
            filteredEnquiries.map((item: any) => {
              const isNew = item.status === "new";
              const isSelected = selectedIds.includes(item.id);
              const formattedDate = item.createdAt
                ? new Date(item.createdAt).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Recent";

              const cleanPhone = item.phone ? item.phone.replace(/\\D/g, "") : "";

              return (
                <div
                  key={item.id}
                  className={`enquiry-row transition-colors ${
                    isSelected
                      ? "bg-[#d4af37]/[0.08] border-l-4 border-l-[#d4af37]"
                      : isNew
                      ? "border-l-4 border-l-[#d4af37] bg-[#d4af37]/[0.03]"
                      : ""
                  }`}
                >
                  {/* Row Checkbox */}
                  <div className="pt-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleRow(item.id)}
                      className={`cursor-pointer h-5 w-5 rounded-md border flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-[#d4af37] border-[#d4af37] text-black shadow-sm"
                          : "border-white/20 bg-white/5 hover:border-[#d4af37]/60 hover:bg-[#d4af37]/10 text-transparent"
                      }`}
                      title={isSelected ? "Deselect enquiry" : "Select enquiry"}
                    >
                      <Check className={`h-3.5 w-3.5 stroke-[3] ${isSelected ? "opacity-100" : "opacity-0"}`} />
                    </button>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-semibold text-white text-base">{item.name}</span>
                      {isNew ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40 shadow-sm animate-pulse">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#d4af37]"></span> NEW
                        </span>
                      ) : (
                        <Badge className={item.status === "in-progress" ? "bg-blue-500/20 text-blue-300 border-blue-500/30" : "bg-stone-500/20 text-stone-300 border-stone-500/30"}>
                          {item.status === "in-progress" ? "In progress" : "Closed"}
                        </Badge>
                      )}
                      <span className="text-xs text-stone-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-stone-500" />
                        {formattedDate}
                      </span>
                    </div>

                    <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-stone-300">
                      <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded-md font-medium text-stone-200">
                        {item.projectType || "General Requirement"}
                      </span>
                      {item.phone && (
                        <a
                          href={`tel:${item.phone}`}
                          className="hover:text-[#d4af37] transition-colors flex items-center gap-1 text-stone-300"
                          title="Call phone"
                        >
                          <Phone className="h-3 w-3 text-[#d4af37]" /> {item.phone}
                        </a>
                      )}
                      {cleanPhone && (
                        <a
                          href={`https://wa.me/${cleanPhone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-emerald-400 text-stone-400 transition-colors flex items-center gap-1"
                          title="Chat on WhatsApp"
                        >
                          <MessageSquare className="h-3 w-3 text-emerald-400" /> WhatsApp
                        </a>
                      )}
                      {item.email && (
                        <a
                          href={`mailto:${item.email}`}
                          className="hover:text-[#d4af37] transition-colors flex items-center gap-1 text-stone-300"
                          title="Send Email"
                        >
                          <Mail className="h-3 w-3 text-[#d4af37]" /> {item.email}
                        </a>
                      )}
                    </div>

                    <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-300 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                      {item.message}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                    {/* Custom Luxury Status Dropdown */}
                    <EnquiryStatusDropdown
                      status={item.status}
                      onChange={(newStatus) => updateEnquiry.mutate({ id: item.id, status: newStatus })}
                      disabled={updateEnquiry.isPending}
                    />

                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      disabled={deleteEnquiry.isPending}
                      className="cursor-pointer h-9 w-9 flex items-center justify-center rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 hover:bg-red-950/60 hover:text-red-300 transition-colors"
                      title="Delete enquiry and update Google Sheet"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-state py-16">
              <Inbox className="h-8 w-8 text-[#d4af37]" />
              <div>
                <div className="font-cinzel text-2xl font-bold text-white">
                  {isFiltered ? "No enquiries match your filter." : "No enquiries yet."}
                </div>
                <p className="mt-1 text-sm text-stone-400">
                  {isFiltered
                    ? "Try adjusting your date range or search keywords."
                    : "When a visitor submits an enquiry or you sync from Google Sheets, it will appear here."}
                </p>
              </div>
              {isFiltered && (
                <button
                  onClick={() => {
                    setDateFilter("all");
                    setStartDate("");
                    setEndDate("");
                    setStatusFilter("all");
                    setSearchQuery("");
                  }}
                  className="mt-3 cursor-pointer text-xs font-semibold text-[#d4af37] underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in-0">
          <div className="relative w-full max-w-md rounded-2xl border border-red-500/30 bg-[#161a22] p-6 shadow-2xl shadow-black/90">
            <div className="flex items-center gap-3 text-red-400 mb-3">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete {selectedIds.length} Enquiries?</h3>
                <p className="text-xs text-stone-400">Batch deletion confirmation</p>
              </div>
            </div>
            
            <p className="text-xs text-stone-300 leading-relaxed mt-2">
              Are you sure you want to permanently delete these <span className="text-white font-bold">{selectedIds.length}</span> selected enquiries?
            </p>
            
            <div className="my-3 rounded-xl bg-black/40 border border-white/5 p-3 text-[11px] text-stone-400 space-y-1">
              <div className="flex items-center gap-1.5 text-stone-300">
                <Check className="h-3.5 w-3.5 text-emerald-400" /> Removed from Website Database
              </div>
              <div className="flex items-center gap-1.5 text-stone-300">
                <Check className="h-3.5 w-3.5 text-emerald-400" /> Synced & Removed from Google Sheet
              </div>
            </div>

            <p className="text-[11px] text-red-400/80">
              Warning: This action cannot be undone.
            </p>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={deleteEnquiriesBulk.isPending}
                onClick={() => setShowBulkDeleteModal(false)}
                className="cursor-pointer px-4 py-2 rounded-xl text-xs font-medium text-stone-300 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteEnquiriesBulk.isPending}
                onClick={() => deleteEnquiriesBulk.mutate({ ids: selectedIds })}
                className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs px-4 py-2 shadow-lg shadow-red-950/50 transition-colors disabled:opacity-50"
              >
                {deleteEnquiriesBulk.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Deleting {selectedIds.length}...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    Yes, Delete ({selectedIds.length})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Apps Script Modal */}
      {showScriptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#13161b] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="h-5 w-5 text-[#d4af37]" />
                <h3 className="font-cinzel text-lg font-bold text-white">Google Sheet Apps Script Setup</h3>
              </div>
              <button
                onClick={() => setShowScriptModal(false)}
                className="cursor-pointer rounded-lg p-1.5 text-stone-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs text-stone-300 leading-relaxed">
              <p>
                To enable <strong>two-way sync</strong> (reading enquiries from your sheet and deleting rows back in the sheet):
              </p>
              <ol className="list-decimal pl-5 space-y-1.5 text-stone-300">
                <li>Open your Google Sheet where client enquiries are stored.</li>
                <li>Click <strong>Extensions</strong> → <strong>Apps Script</strong>.</li>
                <li>Replace all existing code in the editor with the script below.</li>
                <li>Click <strong>Deploy</strong> → <strong>Manage deployments</strong> → <strong>Edit</strong> → choose <strong>New version</strong>.</li>
                <li>Ensure access is set to <strong>"Anyone"</strong> and click <strong>Deploy</strong>.</li>
              </ol>

              <div className="relative">
                <pre className="max-h-64 overflow-x-auto rounded-xl bg-black/60 p-4 font-mono text-[11px] text-[#dec083] border border-white/10">
                  {appsScriptCode}
                </pre>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(appsScriptCode);
                    toast.success("Apps Script code copied to clipboard!");
                  }}
                  className="absolute top-3 right-3 cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-[#d4af37] px-3 py-1.5 text-[11px] font-bold text-black hover:bg-[#dec083] shadow"
                >
                  <Copy className="h-3 w-3" /> Copy Code
                </button>
              </div>

              <div className="p-3 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/20 text-[11px] text-stone-300">
                <strong>Alternative (Direct Read):</strong> You can also share your Google Sheet with "Anyone with the link can view", copy the sheet link from the browser bar, and paste it in the Google Sheet URL box above!
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowScriptModal(false)}
                className="cursor-pointer rounded-xl bg-white/10 hover:bg-white/15 px-4 py-2 text-xs font-semibold text-white transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Stat({ label, value, note, icon: Icon, onClick, isHighlighted, highlightBadge }: any) {
  return (
    <div
      onClick={onClick}
      className={`stat-card cursor-pointer group transition-all duration-300 ${
        isHighlighted
          ? "border-[#d4af37] bg-gradient-to-b from-[#d4af37]/15 to-[#13161b] shadow-[0_0_25px_rgba(212,175,55,0.22)] ring-1 ring-[#d4af37]/50"
          : ""
      }`}
      title={`Go to ${label} tab`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-[#d4af37] transition-transform duration-300 group-hover:scale-110" />
          {isHighlighted && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4af37] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d4af37]"></span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {highlightBadge && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#d4af37] text-black px-2 py-0.5 rounded-full animate-pulse shadow-sm">
              {highlightBadge}
            </span>
          )}
          <ChevronRight className="h-3.5 w-3.5 text-white/20 transition-all duration-300 group-hover:text-[#d4af37] group-hover:translate-x-0.5" />
        </div>
      </div>
      <div className="mt-5 font-cinzel text-4xl sm:text-5xl font-bold text-white group-hover:text-[#d4af37] transition-colors">{value}</div>
      <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-300">{label}</div>
      <div className={`mt-3 text-xs ${isHighlighted ? "text-[#d4af37] font-semibold" : "text-stone-500"}`}>{note}</div>
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
