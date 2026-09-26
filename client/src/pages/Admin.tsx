import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle, ArrowUpRight, Check, ChevronLeft, ChevronRight, ExternalLink,
  Eye, EyeOff, Grid3X3, Image as ImageIcon, Inbox, LayoutDashboard, Loader2,
  LogOut, Palette, Plus, Save, Settings2, Sparkles, Star, Trash2, Upload, X, Layers
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
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.secure_url as string;
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
  brandName: "Sri Venkateswara Granites", tagline: "Crafted by Nature. Perfected by Us.",
  heroEyebrow: "INDIAN GRANITE EXPORTER", heroTitle: "Sri Venkateswara Granites.",
  heroCopy: "Premium Indian granite products manufactured and prepared for international markets.",
  aboutTitle: "NATURE CREATES IT. WE PERFECT IT.", aboutCopy: "From raw granite selection to cutting, shaping, polishing, finishing and export packaging, every stage is handled with attention to detail.",
  phone: "9790613468", whatsapp: "9790613468", email: "sales.svgranites@gmail.com",
  address: "NO.951/3,Poovallikuppam Village Kadampathur Block, Post, Mappedu, Chennai, Tamil Nadu 602105", hours: "Mon–Sat · 9:30 AM — 6:30 PM",
  heroImage: "/images/hero-quarry.jpg", heroImage2: "/images/hero-quarry.jpg",
  aboutImage: "/images/craft-cutting.jpg", logoImage: "/images/logo.jpg",
  heroSubtext: "Premium Indian granite products manufactured and prepared for international markets.",
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
            <h1 className="admin-title">Make the stone speak.</h1>
            <p className="admin-subtitle">Everything your public site shows, in one place.</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" target="_blank" rel="noreferrer" className="admin-outline"><ExternalLink className="h-3.5 w-3.5" /> View site</a>
            <Button onClick={() => setActiveTab("brand")} className="admin-gold"><Settings2 className="h-3.5 w-3.5" /> Edit site</Button>
          </div>
        </header>

        <div className="admin-tabs">
          {tabs.map((tab) => { const Icon = tab.icon; return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`admin-tab ${activeTab === tab.id ? "admin-tab-active" : ""}`}>
              <Icon className="h-4 w-4" />{tab.label}
            </button>
          ); })}
        </div>

        {activeTab === "overview" && <Overview content={content} collections={collections} gallery={gallery} products={products} enquiries={enquiries} setActiveTab={setActiveTab} />}

        {activeTab === "brand" && (
          <BrandTab content={content} setField={setField} saving={saveContent.isPending}
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
function Overview({ content, collections, gallery, products, enquiries, setActiveTab }: any) {
  return (
    <section className="admin-section">
      <div className="overview-hero">
        <div>
          <div className="admin-eyebrow">Good morning, studio.</div>
          <h2 className="font-serif text-5xl leading-none tracking-[-0.05em] text-ivory">The showroom is<br /><span className="text-gold">ready for its next story.</span></h2>
          <p className="mt-5 max-w-lg text-sm leading-6 text-ivory/55">A quick pulse on the content that shapes Sri Venkateswara Granites online.</p>
        </div>
        <div className="overview-mark"><img src={content.logoImage} alt="" /><span>SV</span></div>
      </div>
      <div className="overview-grid">
        <Stat label="Products" value={products.length} note="In catalogue" icon={Layers} />
        <Stat label="Active collections" value={collections.length} note="Material stories live" icon={Sparkles} />
        <Stat label="Project features" value={gallery.length} note="Spaces on display" icon={ImageIcon} />
        <Stat label="New enquiries" value={enquiries.filter((e: any) => e.status === "new").length} note="Ready for a reply" icon={Inbox} />
      </div>
      <div className="quick-actions">
        <button onClick={() => setActiveTab("brand")}><Palette /><span><strong>Update brand details</strong><small>Voice, contact, imagery</small></span><ChevronRight /></button>
        <button onClick={() => setActiveTab("products")}><Layers /><span><strong>Manage products</strong><small>Add or remove catalogue items</small></span><ChevronRight /></button>
        <button onClick={() => setActiveTab("collections")}><Sparkles /><span><strong>Refresh a collection</strong><small>Make the library current</small></span><ChevronRight /></button>
        <button onClick={() => setActiveTab("enquiries")}><Inbox /><span><strong>Review enquiries</strong><small>Keep the conversation moving</small></span><ChevronRight /></button>
      </div>
    </section>
  );
}

// ─── Brand Tab ────────────────────────────────────────────────────────────────
function BrandTab({ content, setField, saving, onSave, onImageUploaded }: any) {
  return (
    <section className="admin-section">
      <SectionHeading eyebrow="Brand & contact" title="The details behind the presence." description="Update the voice, contact information, and photography used across the public website." />
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[
          { label: "Hero image", key: "heroImage" },
          { label: "Hero image 2", key: "heroImage2" },
          { label: "About image", key: "aboutImage" },
        ].map(({ label, key }) => (
          <div key={key}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-ink/40">{label}</p>
            <EditableImage src={content[key] || "/images/hero.jpg"} className="h-48 w-full rounded-2xl overflow-hidden cursor-pointer" onUploaded={(url) => { setField(key, url); onImageUploaded(key, url); }} />
          </div>
        ))}
      </div>
      <div className="mb-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-ink/40">Logo</p>
        <EditableImage src={content.logoImage || "/images/logo.jpg"} className="h-24 w-48 rounded-xl overflow-hidden cursor-pointer" onUploaded={(url) => { setField("logoImage", url); onImageUploaded("logoImage", url); }} />
      </div>
      <div className="admin-form-grid">
        <Field label="Brand name" value={content.brandName} onChange={(v: string) => setField("brandName", v)} />
        <Field label="Tagline" value={content.tagline} onChange={(v: string) => setField("tagline", v)} />
        <Field label="Phone" value={content.phone} onChange={(v: string) => setField("phone", v)} />
        <Field label="WhatsApp" value={content.whatsapp} onChange={(v: string) => setField("whatsapp", v)} />
        <Field label="Email" value={content.email} onChange={(v: string) => setField("email", v)} />
        <Field label="Hours" value={content.hours} onChange={(v: string) => setField("hours", v)} />
        <label className="admin-field full"><span>Address</span><Textarea value={content.address ?? ""} onChange={e => setField("address", e.target.value)} /></label>
        <label className="admin-field full"><span>Hero eyebrow</span><Input value={content.heroEyebrow ?? ""} onChange={e => setField("heroEyebrow", e.target.value)} /></label>
        <label className="admin-field full"><span>Hero title</span><Input value={content.heroTitle ?? ""} onChange={e => setField("heroTitle", e.target.value)} /></label>
        <label className="admin-field full"><span>Hero copy</span><Textarea value={content.heroCopy ?? ""} onChange={e => setField("heroCopy", e.target.value)} /></label>
        <label className="admin-field full"><span>Hero subtext</span><Input value={content.heroSubtext ?? ""} onChange={e => setField("heroSubtext", e.target.value)} /></label>
        <label className="admin-field full"><span>About title</span><Input value={content.aboutTitle ?? ""} onChange={e => setField("aboutTitle", e.target.value)} /></label>
        <label className="admin-field full"><span>About copy</span><Textarea value={content.aboutCopy ?? ""} onChange={e => setField("aboutCopy", e.target.value)} /></label>
      </div>
      <div className="mt-8 flex justify-end">
        <Button onClick={onSave} disabled={saving} className="admin-gold">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving…" : "Save brand details"}
        </Button>
      </div>
    </section>
  );
}

// ─── Dynamic Tab (Products / Collections / Finishes) ─────────────────────────
function DynamicTab({
  title, eyebrow, description, items, isLoading, fields, imageKey,
  onRefresh, createMutation, saveMutation, deleteMutation, toggleMutation, newItemDefaults,
}: any) {
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState<any>(newItemDefaults);
  const [currentPage, setCurrentPage] = useState(0);
  const ITEMS_PER_PAGE = 6;

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

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const pageItems = items.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);

  return (
    <section className="admin-section">
      <div className="mb-10 flex flex-col justify-between gap-5 border-b border-black/10 pb-8 sm:flex-row sm:items-end">
        <div>
          <div className="admin-eyebrow text-ink/40">{eyebrow}</div>
          <h2 className="mt-3 font-serif text-5xl leading-none tracking-[-0.05em] text-ink">{title}</h2>
          <p className="mt-3 max-w-sm text-sm leading-6 text-ink/50">{description}</p>
        </div>
        <Button onClick={() => setAdding(true)} className="admin-gold shrink-0"><Plus className="h-4 w-4" /> Add {title.slice(0, -1)}</Button>
      </div>

      {adding && (
        <div className="mb-6 rounded-3xl border-2 border-gold/40 bg-white p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-serif text-2xl text-ink">New {title.slice(0, -1)}</h3>
            <button onClick={() => setAdding(false)} className="text-ink/40 hover:text-ink"><X className="h-5 w-5" /></button>
          </div>
          <div className="mb-4">
            {newItem[imageKey] ? (
              <div className="relative h-40 w-full rounded-xl overflow-hidden">
                <img src={newItem[imageKey]} alt="" className="h-full w-full object-cover" />
                <ImageUploadButton onUploaded={(url) => setNewItem((n: any) => ({ ...n, [imageKey]: url }))} />
              </div>
            ) : (
              <div className="flex h-40 w-full items-center justify-center rounded-xl border-2 border-dashed border-ink/20 bg-stone-50">
                <ImageUploadButton onUploaded={(url) => setNewItem((n: any) => ({ ...n, [imageKey]: url }))}><Upload className="h-5 w-5 mr-2" /> Upload image</ImageUploadButton>
              </div>
            )}
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
            <Button variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
            <Button onClick={() => create.mutate(newItem)} disabled={create.isPending || !newItem[imageKey]} className="admin-gold">
              {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>
      ) : (
        <div className="grid gap-5">
          {pageItems.map((item: any, index: number) => (
            <DynamicItemCard
              key={item.id} item={item} index={currentPage * ITEMS_PER_PAGE + index} fields={fields} imageKey={imageKey}
              onSave={(data: any) => save.mutate({ id: item.id, data })}
              onDelete={() => del.mutate({ id: item.id })}
              onToggleVisibility={toggle ? (v: number) => toggle.mutate({ id: item.id, isVisible: v }) : undefined}
              saving={save.isPending} deleting={del.isPending}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0} className="pagination-btn"><ChevronLeft className="h-4 w-4" /></button>
          <span className="text-sm text-ink/50">{currentPage + 1} / {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage === totalPages - 1} className="pagination-btn"><ChevronRight className="h-4 w-4" /></button>
        </div>
      )}
    </section>
  );
}

function DynamicItemCard({ item, index, fields, imageKey, onSave, onDelete, onToggleVisibility, saving, deleting }: any) {
  const [values, setValues] = useState<any>(() => ({ ...item }));
  const [confirmDelete, setConfirmDelete] = useState(false);
  useEffect(() => { setValues({ ...item }); }, [item.id]);

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
        <div className="editable-number">0{index + 1}</div>
      </div>
      <div className="editable-fields">
        <div className="mb-5 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="admin-eyebrow text-ink/35">Entry {index + 1}</div>
            <h3 className="mt-1 font-serif text-3xl text-ink">{values.name || values.title}</h3>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {onToggleVisibility && (
              <Button variant="outline" size="sm" onClick={() => onToggleVisibility(item.isVisible ? 0 : 1)} title={item.isVisible ? "Hide" : "Show"}>
                {item.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            )}
            {!confirmDelete
              ? <Button variant="outline" size="sm" onClick={() => setConfirmDelete(true)} className="text-red-500 border-red-200 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
              : <div className="flex items-center gap-2"><span className="text-xs text-red-500">Sure?</span><Button size="sm" variant="destructive" onClick={onDelete} disabled={deleting}>{deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Delete"}</Button><Button size="sm" variant="outline" onClick={() => setConfirmDelete(false)}>Cancel</Button></div>
            }
            <Button onClick={() => onSave({ ...values })} disabled={saving} className="admin-gold">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Save
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
  const [newItem, setNewItem] = useState({ title: "", location: "", year: new Date().getFullYear().toString(), imageUrl: "" });
  const [currentPage, setCurrentPage] = useState(0);

  const createGallery = trpc.admin.createGallery.useMutation({
    onSuccess: () => { toast.success("Gallery item added!"); setAdding(false); setNewItem({ title: "", location: "", year: new Date().getFullYear().toString(), imageUrl: "" }); onRefresh(); },
    onError: (e) => toast.error(e.message),
  });
  const saveGallery = trpc.admin.saveGallery.useMutation({ onSuccess: () => { toast.success("Saved!"); onRefresh(); }, onError: (e) => toast.error(e.message) });
  const deleteGallery = trpc.admin.deleteGallery.useMutation({ onSuccess: () => { toast.success("Deleted!"); onRefresh(); }, onError: (e) => toast.error(e.message) });
  const toggleVisibility = trpc.admin.toggleGalleryVisibility.useMutation({ onSuccess: () => { toast.success("Updated!"); onRefresh(); }, onError: (e) => toast.error(e.message) });

  const totalPages = Math.ceil(gallery.length / GALLERY_PER_PAGE);
  const pageItems = gallery.slice(currentPage * GALLERY_PER_PAGE, (currentPage + 1) * GALLERY_PER_PAGE);

  return (
    <section className="admin-section">
      <div className="mb-10 flex flex-col justify-between gap-5 border-b border-black/10 pb-8 sm:flex-row sm:items-end">
        <div>
          <div className="admin-eyebrow text-ink/40">Project gallery</div>
          <h2 className="mt-3 font-serif text-5xl leading-none tracking-[-0.05em] text-ink">Gallery</h2>
          <p className="mt-3 max-w-sm text-sm leading-6 text-ink/50">Showcase your finished projects. Up to 20 per page — additional items go to a new page automatically.</p>
        </div>
        <Button onClick={() => setAdding(true)} className="admin-gold shrink-0"><Plus className="h-4 w-4" /> Add photo</Button>
      </div>

      {adding && (
        <div className="mb-6 rounded-3xl border-2 border-gold/40 bg-white p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-serif text-2xl text-ink">New Gallery Item</h3>
            <button onClick={() => setAdding(false)}><X className="h-5 w-5 text-ink/40" /></button>
          </div>
          <div className="mb-4">
            {newItem.imageUrl ? (
              <div className="relative h-48 w-full rounded-xl overflow-hidden">
                <img src={newItem.imageUrl} alt="" className="h-full w-full object-cover" />
                <ImageUploadButton onUploaded={(url) => setNewItem(n => ({ ...n, imageUrl: url }))} />
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center rounded-xl border-2 border-dashed border-ink/20 bg-stone-50">
                <ImageUploadButton onUploaded={(url) => setNewItem(n => ({ ...n, imageUrl: url }))}><Upload className="h-5 w-5 mr-2" /> Upload photo</ImageUploadButton>
              </div>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="admin-field"><span>Title</span><Input value={newItem.title} onChange={e => setNewItem(n => ({ ...n, title: e.target.value }))} /></label>
            <label className="admin-field"><span>Location</span><Input value={newItem.location} onChange={e => setNewItem(n => ({ ...n, location: e.target.value }))} /></label>
            <label className="admin-field"><span>Year</span><Input value={newItem.year} onChange={e => setNewItem(n => ({ ...n, year: e.target.value }))} /></label>
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
            <Button onClick={() => createGallery.mutate({ ...newItem, sortOrder: gallery.length + 1 })} disabled={createGallery.isPending || !newItem.imageUrl} className="admin-gold">
              {createGallery.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>
      ) : (
        <div className="gallery-admin-grid">
          {pageItems.map((item: any, idx: number) => (
            <GalleryCard key={item.id} item={item} index={currentPage * GALLERY_PER_PAGE + idx}
              onSave={(data: any) => saveGallery.mutate({ id: item.id, data })}
              onDelete={() => deleteGallery.mutate({ id: item.id })}
              onToggle={(v: number) => toggleVisibility.mutate({ id: item.id, isVisible: v })}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0} className="pagination-btn"><ChevronLeft className="h-4 w-4" /></button>
          <span className="text-sm text-ink/50">Page {currentPage + 1} / {totalPages} · {gallery.length} total</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage === totalPages - 1} className="pagination-btn"><ChevronRight className="h-4 w-4" /></button>
        </div>
      )}
    </section>
  );
}

function GalleryCard({ item, index, onSave, onDelete, onToggle }: any) {
  const [values, setValues] = useState({ ...item });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => { setValues({ ...item }); }, [item.id]);

  return (
    <div className={`gallery-admin-card ${!item.isVisible ? "opacity-50" : ""}`}>
      <EditableImage
        src={values.imageUrl}
        className="h-40 w-full rounded-t-xl overflow-hidden cursor-pointer"
        onUploaded={(url) => {
          const updated = { ...values, imageUrl: url };
          setValues(updated);
          onSave(updated);
        }}
      />
      <div className="p-3">
        <p className="text-xs font-semibold text-ink/60 truncate">{item.title || "Untitled"}</p>
        <p className="text-xs text-ink/40 truncate">{item.location} · {item.year}</p>
        <div className="mt-2 flex items-center gap-1">
          <button className="gallery-action-btn" onClick={() => setOpen(o => !o)} title="Edit"><Settings2 className="h-3 w-3" /></button>
          <button className="gallery-action-btn" onClick={() => onToggle(item.isVisible ? 0 : 1)} title={item.isVisible ? "Hide" : "Show"}>
            {item.isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          </button>
          {!confirmDelete
            ? <button className="gallery-action-btn text-red-400" onClick={() => setConfirmDelete(true)}><Trash2 className="h-3 w-3" /></button>
            : <><button className="gallery-action-btn text-red-600 font-bold" onClick={onDelete}>Yes</button><button className="gallery-action-btn" onClick={() => setConfirmDelete(false)}>No</button></>
          }
        </div>
        {open && (
          <div className="mt-3 grid gap-2">
            <Input className="text-xs" placeholder="Title" value={values.title} onChange={e => setValues((v: any) => ({ ...v, title: e.target.value }))} />
            <Input className="text-xs" placeholder="Location" value={values.location} onChange={e => setValues((v: any) => ({ ...v, location: e.target.value }))} />
            <Input className="text-xs" placeholder="Year" value={values.year} onChange={e => setValues((v: any) => ({ ...v, year: e.target.value }))} />
            <Button size="sm" onClick={() => { onSave(values); setOpen(false); }} className="admin-gold w-full"><Check className="h-3 w-3" /> Save</Button>
          </div>
        )}
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
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>
      ) : (
        <div className="grid gap-4">
          {sections.map((section: any) => (
            <div key={section.sectionKey} className="section-toggle-row">
              <div>
                <div className="font-medium text-ink">{SECTION_LABELS[section.sectionKey] ?? section.sectionKey}</div>
                <div className="text-xs text-ink/40">Key: {section.sectionKey}</div>
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
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-black/10 bg-white">
          {enquiries.length ? enquiries.map((item: any) => (
            <div key={item.id} className="enquiry-row">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-medium text-ink">{item.name}</span>
                  <Badge className={item.status === "new" ? "status-new" : "status-progress"}>{item.status}</Badge>
                </div>
                <div className="mt-2 text-sm text-ink/55">{item.projectType} · {item.phone} · {item.email}</div>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/70">{item.message}</p>
              </div>
              <select className="admin-select w-36" value={item.status} onChange={e => updateEnquiry.mutate({ id: item.id, status: e.target.value })}>
                <option value="new">New</option>
                <option value="in-progress">In progress</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          )) : (
            <div className="empty-state">
              <Inbox className="h-7 w-7 text-gold" />
              <div><div className="font-serif text-2xl text-ink">No enquiries yet.</div><p className="mt-1 text-sm text-ink/50">When a visitor reaches out, it will appear here.</p></div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Stat({ label, value, note, icon: Icon }: any) {
  return (
    <div className="stat-card">
      <Icon className="h-5 w-5 text-gold" />
      <div className="mt-7 font-serif text-5xl text-ink">{value}</div>
      <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/55">{label}</div>
      <div className="mt-5 text-xs text-ink/40">{note}</div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, description }: any) {
  return (
    <div className="mb-10 flex flex-col justify-between gap-5 border-b border-black/10 pb-8 sm:flex-row sm:items-end">
      <div>
        <div className="admin-eyebrow text-ink/40">{eyebrow}</div>
        <h2 className="mt-3 font-serif text-5xl leading-none tracking-[-0.05em] text-ink">{title}</h2>
      </div>
      <p className="max-w-sm text-sm leading-6 text-ink/50">{description}</p>
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
