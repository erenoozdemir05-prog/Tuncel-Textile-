import React, { useEffect, useState } from "react";
import {
  adminLogin, adminCreateProduct, adminUpdateProduct, adminDeleteProduct, adminUploadImage,
  fetchProducts, fetchSettings, adminUpdateSettings,
  adminListHero, adminCreateHero, adminUpdateHero, adminDeleteHero, adminReorderHero,
  fetchCms, adminUpdateCms,
  adminListOrders, adminMarkPaid, adminMarkUnpaid, adminUpdateFulfillment,
  adminListFaqs, adminCreateFaq, adminUpdateFaq, adminDeleteFaq,
  adminListCustomRequests, adminUpdateCustomRequest,
  adminListReturns, adminUpdateReturn,
  adminChatSessions, adminChatSession, adminChatReply, adminChatClose,
  adminListGiftCards, adminUpdateGiftCard, adminAnalytics,
} from "@/lib/api";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, ImageIcon, Loader2, LogOut, Pencil, Plus, Save, Trash2, Upload, X } from "lucide-react";

const TOKEN_KEY = "tuncel_admin_token";
const ADMIN_NAME_KEY = "tuncel_admin_name";
const LANGS = ["en", "ru", "lv"];

const EMPTY_PRODUCT = {
  name: "", description: "", price: 0, category: "men", product_type: "tshirt",
  image_url: "", sizes: ["S", "M", "L", "XL"], colors: ["Black"],
  in_stock: true, featured: false, print_name: "",
  stock_count: null, status_label: "in_stock",
};

const EMPTY_SLIDE = {
  image_url: "", mobile_image_url: "", video_url: "",
  kicker: { en: "", ru: "", lv: "" },
  title: { en: "", ru: "", lv: "" },
  subtitle: { en: "", ru: "", lv: "" },
  cta_label: { en: "", ru: "", lv: "" },
  cta_url: "/shop/all",
  blur_enabled: true, overlay_opacity: 0.45, active: true, sort_order: 0,
};

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [adminName, setAdminName] = useState(() => localStorage.getItem(ADMIN_NAME_KEY) || "");
  const [password, setPassword] = useState("");
  const [nameDraft, setNameDraft] = useState("");
  const [tab, setTab] = useState("analytics");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await adminLogin(password);
      localStorage.setItem(TOKEN_KEY, res.token);
      setToken(res.token);
      setPassword("");
      toast.success("Welcome back");
    } catch {
      toast.error("Invalid password");
    }
  };

  const handleSaveName = (e) => {
    e.preventDefault();
    const v = nameDraft.trim();
    if (v.length < 2) { toast.error("Name must be at least 2 characters"); return; }
    localStorage.setItem(ADMIN_NAME_KEY, v);
    setAdminName(v);
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
  };
  const handleChangeName = () => {
    localStorage.removeItem(ADMIN_NAME_KEY);
    setAdminName("");
    setNameDraft("");
  };

  if (!token) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-16 sm:px-8">
        <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">Studio access</div>
        <h1 className="font-display mt-2 text-6xl uppercase leading-none tracking-[0.02em]">Admin</h1>
        <form onSubmit={handleLogin} className="mt-10 space-y-5" data-testid="admin-login-form">
          <div>
            <label className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">Password</label>
            <input
              type="password"
              data-testid="admin-password-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full border border-black/15 px-4 py-3 outline-none focus:border-black"
              autoFocus
            />
          </div>
          <button
            data-testid="admin-login-submit"
            className="inline-flex w-full items-center justify-center bg-black px-6 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-white hover:bg-neutral-800"
          >
            Enter Studio
          </button>
        </form>
      </div>
    );
  }

  if (!adminName) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-16 sm:px-8">
        <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">Studio · Support identity</div>
        <h1 className="font-display mt-2 text-5xl uppercase leading-none tracking-[0.02em]">Enter your support name</h1>
        <p className="mt-4 text-sm leading-relaxed text-neutral-600">This name appears to customers in the live chat (e.g. "Eren joined the chat"). Use your real first name.</p>
        <form onSubmit={handleSaveName} className="mt-8 space-y-4" data-testid="admin-name-form">
          <input
            data-testid="admin-name-input"
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            placeholder="e.g. Eren"
            className="w-full border border-black/15 px-4 py-3 outline-none focus:border-black"
            autoFocus
            maxLength={80}
          />
          <button
            type="submit"
            data-testid="admin-name-submit"
            className="inline-flex w-full items-center justify-center bg-black px-6 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-white hover:bg-neutral-800"
          >
            Continue →
          </button>
        </form>
      </div>
    );
  }

  return (
    <div data-testid="admin-dashboard" className="mx-auto max-w-[1400px] px-5 sm:px-8">
      <section className="flex flex-wrap items-end justify-between gap-4 border-b border-black/10 py-10">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">Studio · Signed in as <strong className="text-black">{adminName}</strong></div>
          <h1 className="font-display mt-2 text-6xl uppercase leading-none tracking-[0.02em] sm:text-7xl">Admin</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            data-testid="admin-change-name"
            onClick={handleChangeName}
            className="inline-flex items-center gap-2 border border-black/20 px-4 py-3 text-[10px] uppercase tracking-[0.2em] hover:bg-black hover:text-white"
          >
            Change name
          </button>
          <button
            data-testid="admin-logout"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 border border-black px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] hover:bg-black hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      </section>

      {/* TABS */}
      <nav className="flex flex-wrap gap-1 border-b border-black/10 py-4">
        {[
          ["analytics", "Analytics"],
          ["products", "Products"],
          ["orders", "Orders"],
          ["hero", "Hero Manager"],
          ["cms", "Global Text"],
          ["faqs", "FAQs"],
          ["custom-requests", "Custom Requests"],
          ["returns", "Returns"],
          ["chat", "Live Chat"],
          ["gift-cards", "Gift Cards"],
          ["settings", "Settings"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            data-testid={`admin-tab-${key}`}
            className={`px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.25em] transition-colors ${
              tab === key ? "bg-black text-white" : "border border-black/15 text-neutral-700 hover:border-black hover:text-black"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="py-10">
        {tab === "products" && <ProductsTab token={token} />}
        {tab === "orders" && <OrdersTab token={token} />}
        {tab === "hero" && <HeroTab token={token} />}
        {tab === "cms" && <CmsTab token={token} />}
        {tab === "faqs" && <FaqTab token={token} />}
        {tab === "custom-requests" && <CustomRequestsTab token={token} />}
        {tab === "returns" && <ReturnsTab token={token} />}
        {tab === "chat" && <ChatTab token={token} adminName={adminName} />}
        {tab === "gift-cards" && <GiftCardsTab token={token} />}
        {tab === "analytics" && <AnalyticsTab token={token} />}
        {tab === "settings" && <SettingsTab token={token} />}
      </div>
    </div>
  );
}

/* ============================================================
   PRODUCTS TAB
============================================================ */
function ProductsTab({ token }) {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setProducts(await fetchProducts()); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const startCreate = () => { setForm(EMPTY_PRODUCT); setEditing("new"); };
  const startEdit = (p) => {
    setForm({
      ...EMPTY_PRODUCT,
      ...p,
      sizes: p.sizes || [], colors: p.colors || [],
      stock_count: p.stock_count ?? null, status_label: p.status_label || "in_stock",
    });
    setEditing(p.id);
  };

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const res = await adminUploadImage(token, file);
      setForm((f) => ({ ...f, image_url: res.url }));
      toast.success("Image uploaded");
    } catch { toast.error("Upload failed"); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock_count: form.stock_count === "" || form.stock_count === null ? null : Number(form.stock_count),
        sizes: typeof form.sizes === "string" ? form.sizes.split(",").map((s) => s.trim()).filter(Boolean) : form.sizes,
        colors: typeof form.colors === "string" ? form.colors.split(",").map((s) => s.trim()).filter(Boolean) : form.colors,
      };
      if (editing === "new") await adminCreateProduct(token, payload);
      else await adminUpdateProduct(token, editing, payload);
      toast.success("Saved");
      setEditing(null);
      load();
    } catch { toast.error("Save failed"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await adminDeleteProduct(token, id);
    toast.success("Deleted");
    load();
  };

  return (
    <>
      <div className="mb-6 flex justify-end">
        <button data-testid="admin-new-product" onClick={startCreate} className="inline-flex items-center gap-2 bg-black px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-white">
          <Plus className="h-3.5 w-3.5" /> New Product
        </button>
      </div>
      {loading ? <p className="text-sm text-neutral-500">Loading…</p> : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="border-b border-black/10 text-left text-[11px] uppercase tracking-[0.25em] text-neutral-500">
                <th className="py-3">Image</th><th>Name</th><th>Cat</th><th>Type</th><th>Price</th><th>Status</th><th>Featured</th><th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} data-testid={`admin-row-${p.id}`} className="border-b border-black/5">
                  <td className="py-3"><img src={p.image_url} alt={p.name} className="h-14 w-14 object-cover" /></td>
                  <td className="font-display text-lg">{p.name}</td>
                  <td className="capitalize">{p.category}</td>
                  <td className="capitalize">{p.product_type}</td>
                  <td>€{Number(p.price).toFixed(2)}</td>
                  <td className="capitalize text-xs">{(p.status_label || "in_stock").replace("_", " ")}{p.status_label === "low_stock" && p.stock_count ? ` · ${p.stock_count}` : ""}</td>
                  <td>{p.featured ? "Yes" : "—"}</td>
                  <td className="flex gap-2 py-3">
                    <button data-testid={`admin-edit-${p.id}`} onClick={() => startEdit(p)} className="inline-flex items-center gap-1 border border-black/20 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] hover:bg-black hover:text-white"><Pencil className="h-3 w-3" /> Edit</button>
                    <button data-testid={`admin-delete-${p.id}`} onClick={() => handleDelete(p.id)} className="inline-flex items-center gap-1 border border-black/20 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white"><Trash2 className="h-3 w-3" /> Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Drawer title={editing === "new" ? "New Product" : "Edit Product"} onClose={() => setEditing(null)} onSave={handleSave}>
          <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} testid="admin-field-name" />
          <Field label="Print name (badge)" value={form.print_name} onChange={(v) => setForm({ ...form, print_name: v })} />
          <Field label="Description" multiline value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
          <div className="grid grid-cols-3 gap-3">
            <Field label="Price (€)" type="number" value={form.price} onChange={(v) => setForm({ ...form, price: v })} testid="admin-field-price" />
            <Select label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })}
              options={[["men", "Men"], ["women", "Women"], ["accessories", "Accessories"]]} />
            <Select label="Type" value={form.product_type} onChange={(v) => setForm({ ...form, product_type: v })}
              options={[["hoodie", "Hoodie"], ["tshirt", "T-Shirt"], ["accessory", "Accessory"]]} />
          </div>
          <Field label="Sizes (comma)" value={Array.isArray(form.sizes) ? form.sizes.join(", ") : form.sizes} onChange={(v) => setForm({ ...form, sizes: v })} />
          <Field label="Colors (comma)" value={Array.isArray(form.colors) ? form.colors.join(", ") : form.colors} onChange={(v) => setForm({ ...form, colors: v })} />

          <div className="grid grid-cols-2 gap-3">
            <Select label="Status label" value={form.status_label} onChange={(v) => setForm({ ...form, status_label: v })}
              options={[["in_stock", "In stock"], ["low_stock", "Low stock"], ["out_of_stock", "Sold out"], ["coming_soon", "Coming soon"]]} />
            <Field label="Stock count (for low stock)" type="number" value={form.stock_count ?? ""} onChange={(v) => setForm({ ...form, stock_count: v })} />
          </div>

          <ImagePicker label="Product image" value={form.image_url} onChange={(v) => setForm({ ...form, image_url: v })} onUpload={handleUpload} uploading={uploading} />

          <div className="flex gap-6 pt-2">
            <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured on home</label>
            <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={form.in_stock} onChange={(e) => setForm({ ...form, in_stock: e.target.checked })} /> Active</label>
          </div>
        </Drawer>
      )}
    </>
  );
}

/* ============================================================
   HERO MANAGER TAB
============================================================ */
function HeroTab({ token }) {
  const [slides, setSlides] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_SLIDE);
  const [activeLang, setActiveLang] = useState("en");
  const [uploadingKey, setUploadingKey] = useState(null);

  const load = async () => setSlides(await adminListHero(token));
  useEffect(() => { load(); }, []);

  const startCreate = () => { setForm(EMPTY_SLIDE); setActiveLang("en"); setEditing("new"); };
  const startEdit = (s) => {
    setForm({
      ...EMPTY_SLIDE, ...s,
      kicker: { en: "", ru: "", lv: "", ...(s.kicker || {}) },
      title: { en: "", ru: "", lv: "", ...(s.title || {}) },
      subtitle: { en: "", ru: "", lv: "", ...(s.subtitle || {}) },
      cta_label: { en: "", ru: "", lv: "", ...(s.cta_label || {}) },
    });
    setActiveLang("en");
    setEditing(s.id);
  };

  const upload = async (file, key) => {
    setUploadingKey(key);
    try {
      const res = await adminUploadImage(token, file);
      setForm((f) => ({ ...f, [key]: res.url }));
      toast.success("Uploaded");
    } catch { toast.error("Upload failed"); }
    finally { setUploadingKey(null); }
  };

  const handleSave = async () => {
    try {
      const payload = { ...form, overlay_opacity: Number(form.overlay_opacity) };
      if (editing === "new") await adminCreateHero(token, payload);
      else await adminUpdateHero(token, editing, payload);
      toast.success("Slide saved");
      setEditing(null);
      load();
    } catch { toast.error("Save failed"); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this slide?")) return;
    await adminDeleteHero(token, id);
    toast.success("Deleted");
    load();
  };

  const move = async (idx, dir) => {
    const next = [...slides];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setSlides(next);
    await adminReorderHero(token, next.map((s) => s.id));
    load();
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl uppercase tracking-[0.04em]">Hero Manager</h2>
          <p className="mt-1 text-sm text-neutral-600">Slides auto-rotate every 7 seconds. Reorder with arrows. Multilingual (EN / RU / LV).</p>
        </div>
        <button data-testid="admin-new-slide" onClick={startCreate} className="inline-flex items-center gap-2 bg-black px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-white">
          <Plus className="h-3.5 w-3.5" /> New Slide
        </button>
      </div>

      {slides.length === 0 ? (
        <div className="border border-dashed border-black/15 p-10 text-center">
          <ImageIcon className="mx-auto h-8 w-8 text-neutral-400" />
          <p className="mt-3 text-sm text-neutral-500">No slides yet. Homepage shows the default hero.</p>
        </div>
      ) : (
        <ul className="divide-y divide-black/10 border-y border-black/10">
          {slides.map((s, i) => (
            <li key={s.id} data-testid={`hero-row-${s.id}`} className="grid grid-cols-[80px_1fr_auto] items-center gap-4 py-4">
              <div className="aspect-[4/3] w-20 overflow-hidden bg-neutral-100">
                {s.image_url && <img src={s.image_url} alt="" className="h-full w-full object-cover" />}
              </div>
              <div>
                <div className="font-display text-xl uppercase tracking-[0.04em]">{s.title?.en || "Untitled"}</div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.25em] text-neutral-500">
                  {s.active ? "Active" : "Hidden"} · order {s.sort_order} · {s.video_url ? "Video" : "Image"}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => move(i, -1)} aria-label="Move up" className="inline-flex h-9 w-9 items-center justify-center border border-black/15 hover:bg-black hover:text-white"><ArrowUp className="h-3.5 w-3.5" /></button>
                <button onClick={() => move(i, 1)} aria-label="Move down" className="inline-flex h-9 w-9 items-center justify-center border border-black/15 hover:bg-black hover:text-white"><ArrowDown className="h-3.5 w-3.5" /></button>
                <button data-testid={`hero-edit-${s.id}`} onClick={() => startEdit(s)} className="inline-flex items-center gap-1 border border-black/20 px-3 py-2 text-[11px] uppercase tracking-[0.2em] hover:bg-black hover:text-white"><Pencil className="h-3 w-3" /> Edit</button>
                <button data-testid={`hero-delete-${s.id}`} onClick={() => remove(s.id)} className="inline-flex items-center gap-1 border border-black/20 px-3 py-2 text-[11px] uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white"><Trash2 className="h-3 w-3" /></button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <Drawer title={editing === "new" ? "New Hero Slide" : "Edit Hero Slide"} onClose={() => setEditing(null)} onSave={handleSave} wide>
          {/* Lang tabs */}
          <div className="flex gap-1">
            {LANGS.map((l) => (
              <button key={l} onClick={() => setActiveLang(l)} data-testid={`hero-lang-${l}`}
                className={`px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] ${activeLang === l ? "bg-black text-white" : "border border-black/15"}`}>{l.toUpperCase()}</button>
            ))}
          </div>
          <Field label={`Kicker (${activeLang})`} value={form.kicker[activeLang]} onChange={(v) => setForm({ ...form, kicker: { ...form.kicker, [activeLang]: v } })} />
          <Field label={`Title (${activeLang}) — first word goes solid, rest outlined`} value={form.title[activeLang]} onChange={(v) => setForm({ ...form, title: { ...form.title, [activeLang]: v } })} />
          <Field label={`Subtitle (${activeLang})`} multiline value={form.subtitle[activeLang]} onChange={(v) => setForm({ ...form, subtitle: { ...form.subtitle, [activeLang]: v } })} />
          <div className="grid grid-cols-2 gap-3">
            <Field label={`CTA label (${activeLang})`} value={form.cta_label[activeLang]} onChange={(v) => setForm({ ...form, cta_label: { ...form.cta_label, [activeLang]: v } })} />
            <Field label="CTA link" value={form.cta_url} onChange={(v) => setForm({ ...form, cta_url: v })} />
          </div>

          <ImagePicker label="Desktop image (1600×900 recommended)" value={form.image_url} onChange={(v) => setForm({ ...form, image_url: v })} onUpload={(f) => upload(f, "image_url")} uploading={uploadingKey === "image_url"} />
          <ImagePicker label="Mobile image (optional)" value={form.mobile_image_url} onChange={(v) => setForm({ ...form, mobile_image_url: v })} onUpload={(f) => upload(f, "mobile_image_url")} uploading={uploadingKey === "mobile_image_url"} />
          <Field label="Video background URL (optional, overrides image)" value={form.video_url} onChange={(v) => setForm({ ...form, video_url: v })} />

          <div className="grid grid-cols-2 gap-3">
            <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={form.blur_enabled} onChange={(e) => setForm({ ...form, blur_enabled: e.target.checked })} /> Blur overlay</label>
            <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active</label>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">Overlay opacity · {Number(form.overlay_opacity).toFixed(2)}</label>
            <input type="range" min={0} max={0.85} step={0.05} value={form.overlay_opacity} onChange={(e) => setForm({ ...form, overlay_opacity: e.target.value })} className="mt-2 w-full" />
          </div>

          {/* Live preview */}
          <div className="mt-4">
            <div className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">Live preview</div>
            <div className="relative mt-2 aspect-[16/7] w-full overflow-hidden bg-black">
              {form.video_url ? (
                <video src={form.video_url} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />
              ) : form.image_url ? (
                <img src={form.image_url} alt="preview" className="absolute inset-0 h-full w-full object-cover" />
              ) : null}
              {form.blur_enabled && <div className="absolute inset-0 backdrop-blur-[1px]" />}
              <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${form.overlay_opacity})` }} />
              <div className="relative z-10 flex h-full flex-col justify-end p-5 text-white">
                <div className="text-[10px] uppercase tracking-[0.3em] text-white/70">{form.kicker[activeLang]}</div>
                <div className="font-display mt-1 text-4xl uppercase tracking-[0.02em] sm:text-6xl">{form.title[activeLang] || "Title"}</div>
                <div className="mt-2 max-w-md text-xs text-white/85">{form.subtitle[activeLang]}</div>
              </div>
            </div>
          </div>
        </Drawer>
      )}
    </>
  );
}

/* ============================================================
   GLOBAL TEXT TAB
============================================================ */
function CmsTab({ token }) {
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchCms().then((d) => setItems(d.items || [])); }, []);

  const update = (idx, field, lang, val) => {
    const next = [...items];
    if (field === "key" || field === "label") next[idx][field] = val;
    else next[idx].values[lang] = val;
    setItems(next);
  };
  const remove = (idx) => setItems(items.filter((_, i) => i !== idx));
  const add = () => setItems([...items, { key: `new_key_${Date.now()}`, label: "New label", values: { en: "", ru: "", lv: "" } }]);

  const save = async () => {
    setSaving(true);
    try {
      await adminUpdateCms(token, items);
      toast.success("Global text saved");
    } catch { toast.error("Save failed"); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl uppercase tracking-[0.04em]">Global Text</h2>
          <p className="mt-1 text-sm text-neutral-600">Edit reusable strings. Each appears across the site (product details, footers, banners).</p>
        </div>
        <div className="flex gap-2">
          <button onClick={add} className="inline-flex items-center gap-2 border border-black px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.25em] hover:bg-black hover:text-white"><Plus className="h-3.5 w-3.5" /> Add</button>
          <button onClick={save} disabled={saving} data-testid="admin-cms-save" className="inline-flex items-center gap-2 bg-black px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-white disabled:opacity-60"><Save className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save"}</button>
        </div>
      </div>

      <ul className="space-y-4">
        {items.map((it, idx) => (
          <li key={idx} data-testid={`cms-row-${it.key}`} className="border border-black/10 p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_2fr_auto]">
              <Field label="Key" value={it.key} onChange={(v) => update(idx, "key", null, v)} />
              <Field label="Label (admin only)" value={it.label || ""} onChange={(v) => update(idx, "label", null, v)} />
              <button onClick={() => remove(idx)} className="self-end justify-self-end inline-flex h-9 items-center gap-1 border border-black/15 px-3 text-[11px] uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white"><Trash2 className="h-3 w-3" /></button>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {LANGS.map((l) => (
                <Field key={l} label={l.toUpperCase()} value={it.values?.[l] || ""} onChange={(v) => update(idx, "values", l, v)} multiline />
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============================================================
   SETTINGS TAB (whatsapp, socials, IBAN, favicon)
============================================================ */
function SettingsTab({ token }) {
  const [s, setS] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState(null);

  useEffect(() => { fetchSettings().then(setS); }, []);

  if (!s) return <p className="text-sm text-neutral-500">Loading…</p>;

  const u = (path, val) => {
    const [a, b] = path.split(".");
    if (b) setS({ ...s, [a]: { ...(s[a] || {}), [b]: val } });
    else setS({ ...s, [a]: val });
  };

  const upload = async (file, path) => {
    setUploadingKey(path);
    try {
      const res = await adminUploadImage(token, file);
      u(path, res.url);
      toast.success("Uploaded");
    } catch { toast.error("Upload failed"); }
    finally { setUploadingKey(null); }
  };

  const save = async () => {
    setSaving(true);
    try {
      await adminUpdateSettings(token, s);
      toast.success("Settings saved — refresh to see footer/favicon updates");
    } catch { toast.error("Save failed"); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl uppercase tracking-[0.04em]">Settings</h2>
          <p className="mt-1 text-sm text-neutral-600">WhatsApp, social media, IBAN bank transfer, favicon.</p>
        </div>
        <button onClick={save} disabled={saving} data-testid="admin-settings-save" className="inline-flex items-center gap-2 bg-black px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-white disabled:opacity-60"><Save className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save All"}</button>
      </div>

      <section>
        <h3 className="font-display text-xl uppercase tracking-[0.04em]">WhatsApp & Email</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="WhatsApp number (with +country)" value={s.whatsapp_number || ""} onChange={(v) => u("whatsapp_number", v)} />
          <Field label="Contact email" value={s.contact_email || ""} onChange={(v) => u("contact_email", v)} testid="settings-contact-email" />
          <div className="sm:col-span-2">
            <Field label="WhatsApp default prefilled message" value={s.whatsapp_default_message || ""} onChange={(v) => u("whatsapp_default_message", v)} multiline />
          </div>
        </div>
      </section>

      <section>
        <h3 className="font-display text-xl uppercase tracking-[0.04em]">Homepage Category Cards</h3>
        <p className="mt-1 text-xs uppercase tracking-[0.25em] text-neutral-500">The three cards under "Three rooms. One language." Replace images and titles per language.</p>
        <div className="mt-4 space-y-6">
          {(s.category_cards || []).map((card, idx) => (
            <div key={idx} className="border border-black/10 p-5" data-testid={`settings-cat-card-${card.slug || idx}`}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Slug" value={card.slug || ""} onChange={(v) => { const list = [...s.category_cards]; list[idx] = { ...list[idx], slug: v }; u("category_cards", list); }} />
                <Field label="Link (to)" value={card.to || ""} onChange={(v) => { const list = [...s.category_cards]; list[idx] = { ...list[idx], to: v }; u("category_cards", list); }} />
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {["en", "ru", "lv"].map((lng) => (
                  <Field key={lng} label={`Title (${lng})`} value={card.title?.[lng] || ""} onChange={(v) => { const list = [...s.category_cards]; list[idx] = { ...list[idx], title: { ...(list[idx].title || {}), [lng]: v } }; u("category_cards", list); }} />
                ))}
              </div>
              <div className="mt-3">
                <ImagePicker label="Card image"
                  value={card.image_url || ""}
                  onChange={(v) => { const list = [...s.category_cards]; list[idx] = { ...list[idx], image_url: v }; u("category_cards", list); }}
                  onUpload={async (file) => {
                    setUploadingKey(`cat-${idx}`);
                    try { const res = await adminUploadImage(token, file); const list = [...s.category_cards]; list[idx] = { ...list[idx], image_url: res.url }; u("category_cards", list); toast.success("Uploaded"); }
                    catch { toast.error("Upload failed"); }
                    finally { setUploadingKey(null); }
                  }}
                  uploading={uploadingKey === `cat-${idx}`}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-display text-xl uppercase tracking-[0.04em]">Social Media</h3>
        <p className="mt-1 text-xs uppercase tracking-[0.25em] text-neutral-500">Leave blank to hide the icon</p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {["instagram", "facebook", "twitter", "linkedin", "youtube", "tiktok"].map((k) => (
            <Field key={k} label={k} value={s.social?.[k] || ""} onChange={(v) => u(`social.${k}`, v)} />
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-display text-xl uppercase tracking-[0.04em]">IBAN / Bank Transfer</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Bank name" value={s.iban?.bank_name || ""} onChange={(v) => u("iban.bank_name", v)} />
          <Field label="Account holder" value={s.iban?.account_holder || ""} onChange={(v) => u("iban.account_holder", v)} />
          <Field label="IBAN" value={s.iban?.iban || ""} onChange={(v) => u("iban.iban", v)} />
          <Field label="BIC / SWIFT" value={s.iban?.bic || ""} onChange={(v) => u("iban.bic", v)} />
          <Field label="Reference prefix" value={s.iban?.reference_prefix || "TT"} onChange={(v) => u("iban.reference_prefix", v)} />
          <Field label="Instructions for customer" value={s.iban?.instructions || ""} onChange={(v) => u("iban.instructions", v)} multiline />
        </div>
      </section>

      <section>
        <h3 className="font-display text-xl uppercase tracking-[0.04em]">Favicon</h3>
        <p className="mt-1 text-xs uppercase tracking-[0.25em] text-neutral-500">Appears in the browser tab. Square PNG, 64×64 or larger.</p>
        <div className="mt-4">
          <ImagePicker label="Favicon image" value={s.favicon_url || ""} onChange={(v) => u("favicon_url", v)} onUpload={(f) => upload(f, "favicon_url")} uploading={uploadingKey === "favicon_url"} small />
        </div>
      </section>
    </div>
  );
}

/* ============================================================
   ORDERS TAB (Mark as Paid / Unpaid)
============================================================ */
function OrdersTab({ token }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // all | iban | card | paid | pending
  const [expanded, setExpanded] = useState(null); // reference of currently expanded row

  const load = async () => {
    setLoading(true);
    try { setOrders(await adminListOrders(token)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const markPaid = async (ref) => {
    if (!window.confirm(`Mark order ${ref} as PAID? This will send it to fulfillment.`)) return;
    try { await adminMarkPaid(token, ref); toast.success("Marked as paid"); load(); }
    catch { toast.error("Failed"); }
  };
  const markUnpaid = async (ref) => {
    if (!window.confirm(`Revert order ${ref} to AWAITING TRANSFER?`)) return;
    try { await adminMarkUnpaid(token, ref); toast.success("Reverted"); load(); }
    catch { toast.error("Failed"); }
  };
  const saveFulfillment = async (ref, payload) => {
    try {
      await adminUpdateFulfillment(token, ref, payload);
      toast.success("Tracking updated");
      load();
    } catch { toast.error("Update failed"); }
  };

  const filtered = orders.filter((o) => {
    if (filter === "all") return true;
    if (filter === "iban") return o.payment_method === "iban";
    if (filter === "card") return o.payment_method !== "iban";
    if (filter === "paid") return o.payment_status === "paid";
    if (filter === "pending") return o.payment_status === "awaiting_bank_transfer" || o.payment_status === "initiated";
    return true;
  });

  const statusBadge = (s) => {
    const map = {
      paid: "bg-black text-white",
      complete: "bg-black text-white",
      awaiting_bank_transfer: "bg-amber-100 text-amber-900",
      initiated: "bg-neutral-200 text-neutral-700",
      failed: "bg-red-100 text-red-900",
      expired: "bg-neutral-200 text-neutral-700",
    };
    return <span className={`inline-flex px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${map[s] || "bg-neutral-100 text-neutral-700"}`}>{(s || "").replace(/_/g, " ")}</span>;
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl uppercase tracking-[0.04em]">Orders</h2>
          <p className="mt-1 text-sm text-neutral-600">Confirm IBAN bank transfers · review all checkouts.</p>
        </div>
        <div className="flex gap-1">
          {[["all", "All"], ["iban", "IBAN"], ["card", "Card"], ["pending", "Pending"], ["paid", "Paid"]].map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)} data-testid={`orders-filter-${k}`}
              className={`px-3 py-2 text-[11px] uppercase tracking-[0.2em] ${filter === k ? "bg-black text-white" : "border border-black/15 hover:border-black"}`}>{l}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="border border-dashed border-black/15 p-10 text-center text-sm text-neutral-500">No orders match this filter.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-black/10 text-left text-[11px] uppercase tracking-[0.25em] text-neutral-500">
                <th className="py-3">Reference</th><th>Date</th><th>Method</th><th>Customer</th><th>Amount</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const ref = o.reference || o.session_id;
                const isIban = o.payment_method === "iban";
                const isPaid = o.payment_status === "paid";
                const date = o.created_at ? new Date(o.created_at).toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
                const isExpanded = expanded === ref;
                const fStatus = o.fulfillment_status || "pending";
                return (
                  <React.Fragment key={ref}>
                  <tr data-testid={`order-row-${ref}`} className="border-b border-black/5 align-middle">
                    <td className="py-3 font-mono text-xs">{ref?.slice(0, 20)}</td>
                    <td className="text-xs text-neutral-600">{date}</td>
                    <td className="text-xs uppercase tracking-[0.15em]">{isIban ? "IBAN" : "Card"}</td>
                    <td className="text-xs">
                      <div className="font-semibold">{o.customer_name || "—"}</div>
                      <div className="text-neutral-500">{o.customer_email || "—"}</div>
                    </td>
                    <td className="font-semibold">{(o.currency === "eur" ? "€" : "$")}{Number(o.amount).toFixed(2)}</td>
                    <td>
                      {statusBadge(o.payment_status)}
                      <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-neutral-500">{fStatus.replace(/_/g, " ")}</div>
                    </td>
                    <td className="py-3 space-x-2 whitespace-nowrap">
                      {isIban && !isPaid && (
                        <button data-testid={`mark-paid-${ref}`} onClick={() => markPaid(ref)}
                          className="inline-flex items-center gap-1 bg-black px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white hover:bg-neutral-800">
                          Mark Paid
                        </button>
                      )}
                      {isIban && isPaid && (
                        <button data-testid={`mark-unpaid-${ref}`} onClick={() => markUnpaid(ref)}
                          className="inline-flex items-center gap-1 border border-black/20 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] hover:bg-black hover:text-white">
                          Revert
                        </button>
                      )}
                      <button data-testid={`order-toggle-${ref}`} onClick={() => setExpanded(isExpanded ? null : ref)}
                        className="inline-flex items-center gap-1 border border-black/20 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] hover:bg-black hover:text-white">
                        {isExpanded ? "Close" : "Tracking"}
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="border-b border-black/10 bg-neutral-50">
                      <td colSpan={7} className="px-3 py-5">
                        <FulfillmentEditor order={o} onSave={(p) => saveFulfillment(ref, p)} />
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const FULFILLMENT_OPTIONS = ["pending", "processing", "shipped", "out_for_delivery", "delivered", "cancelled"];

function FulfillmentEditor({ order, onSave }) {
  const [form, setForm] = useState({
    fulfillment_status: order.fulfillment_status || "pending",
    tracking_carrier: order.tracking_carrier || "",
    tracking_number: order.tracking_number || "",
    tracking_url: order.tracking_url || "",
    shipping_note: order.shipping_note || "",
  });
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">Fulfillment status</label>
        <select
          data-testid={`ff-status-${order.reference}`}
          value={form.fulfillment_status}
          onChange={(e) => setForm({ ...form, fulfillment_status: e.target.value })}
          className="mt-2 w-full appearance-none border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-black"
        >
          {FULFILLMENT_OPTIONS.map((s) => (<option key={s} value={s}>{s.replace(/_/g, " ")}</option>))}
        </select>
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">Carrier</label>
        <input
          data-testid={`ff-carrier-${order.reference}`}
          value={form.tracking_carrier}
          onChange={(e) => setForm({ ...form, tracking_carrier: e.target.value })}
          placeholder="DPD, Omniva, DHL…"
          className="mt-2 w-full border border-black/15 px-3 py-2 text-sm outline-none focus:border-black"
        />
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">Tracking number</label>
        <input
          data-testid={`ff-tracknum-${order.reference}`}
          value={form.tracking_number}
          onChange={(e) => setForm({ ...form, tracking_number: e.target.value })}
          className="mt-2 w-full border border-black/15 px-3 py-2 font-mono text-sm outline-none focus:border-black"
        />
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">Tracking URL</label>
        <input
          data-testid={`ff-trackurl-${order.reference}`}
          value={form.tracking_url}
          onChange={(e) => setForm({ ...form, tracking_url: e.target.value })}
          placeholder="https://courier.com/track/…"
          className="mt-2 w-full border border-black/15 px-3 py-2 text-sm outline-none focus:border-black"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">Shipping note (shown to customer on /track-order)</label>
        <textarea
          data-testid={`ff-note-${order.reference}`}
          rows={2}
          value={form.shipping_note}
          onChange={(e) => setForm({ ...form, shipping_note: e.target.value })}
          className="mt-2 w-full border border-black/15 px-3 py-2 text-sm outline-none focus:border-black"
        />
      </div>
      <div className="sm:col-span-2">
        <button
          data-testid={`ff-save-${order.reference}`}
          onClick={() => onSave(form)}
          className="inline-flex items-center gap-2 bg-black px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-white hover:bg-neutral-800"
        >
          <Save className="h-3.5 w-3.5" /> Save tracking
        </button>
      </div>
    </div>
  );
}


/* ============================================================
   FAQ TAB
============================================================ */
function FaqTab({ token }) {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ question: { en: "", ru: "", lv: "" }, answer: { en: "", ru: "", lv: "" }, category: "general", active: true, sort_order: 0 });
  const [activeLang, setActiveLang] = useState("en");

  const load = async () => setItems(await adminListFaqs(token));
  useEffect(() => { load(); }, []);

  const start = (it = null) => {
    setForm(it ? {
      ...it,
      question: { en: "", ru: "", lv: "", ...(it.question || {}) },
      answer: { en: "", ru: "", lv: "", ...(it.answer || {}) },
    } : { question: { en: "", ru: "", lv: "" }, answer: { en: "", ru: "", lv: "" }, category: "general", active: true, sort_order: items.length });
    setActiveLang("en");
    setEditing(it ? it.id : "new");
  };

  const save = async () => {
    try {
      if (editing === "new") await adminCreateFaq(token, form);
      else await adminUpdateFaq(token, editing, form);
      toast.success("Saved");
      setEditing(null);
      load();
    } catch { toast.error("Save failed"); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this FAQ?")) return;
    await adminDeleteFaq(token, id);
    toast.success("Deleted");
    load();
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl uppercase tracking-[0.04em]">FAQ</h2>
          <p className="mt-1 text-sm text-neutral-600">Public FAQ shown at /faq. Multilingual.</p>
        </div>
        <button onClick={() => start()} data-testid="admin-new-faq" className="inline-flex items-center gap-2 bg-black px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-white">
          <Plus className="h-3.5 w-3.5" /> New FAQ
        </button>
      </div>
      <ul className="divide-y divide-black/10 border-y border-black/10">
        {items.map((f) => (
          <li key={f.id} data-testid={`faq-row-${f.id}`} className="flex items-center justify-between gap-4 py-4">
            <div className="min-w-0 flex-1">
              <div className="font-display text-lg uppercase tracking-[0.04em] line-clamp-1">{f.question?.en || "—"}</div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-neutral-500">{f.category} · {f.active ? "active" : "hidden"}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => start(f)} className="inline-flex items-center gap-1 border border-black/20 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] hover:bg-black hover:text-white"><Pencil className="h-3 w-3" /> Edit</button>
              <button onClick={() => remove(f.id)} className="inline-flex items-center gap-1 border border-black/20 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white"><Trash2 className="h-3 w-3" /></button>
            </div>
          </li>
        ))}
        {items.length === 0 && <li className="py-10 text-center text-sm text-neutral-500">No FAQs yet.</li>}
      </ul>

      {editing && (
        <Drawer title={editing === "new" ? "New FAQ" : "Edit FAQ"} onClose={() => setEditing(null)} onSave={save}>
          <div className="flex gap-1">
            {LANGS.map((l) => (
              <button key={l} onClick={() => setActiveLang(l)} className={`px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] ${activeLang === l ? "bg-black text-white" : "border border-black/15"}`}>{l.toUpperCase()}</button>
            ))}
          </div>
          <Field label={`Question (${activeLang})`} value={form.question[activeLang]} onChange={(v) => setForm({ ...form, question: { ...form.question, [activeLang]: v } })} />
          <Field label={`Answer (${activeLang})`} multiline value={form.answer[activeLang]} onChange={(v) => setForm({ ...form, answer: { ...form.answer, [activeLang]: v } })} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })}
              options={[["shipping", "Shipping"], ["returns", "Returns"], ["payment", "Payment"], ["custom", "Custom"], ["general", "General"]]} />
            <Field label="Order" type="number" value={form.sort_order} onChange={(v) => setForm({ ...form, sort_order: Number(v) })} />
          </div>
          <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active</label>
        </Drawer>
      )}
    </>
  );
}

/* ============================================================
   CUSTOM REQUESTS TAB
============================================================ */
function CustomRequestsTab({ token }) {
  const [items, setItems] = useState([]);
  const [active, setActive] = useState(null);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("new");

  const load = async () => setItems(await adminListCustomRequests(token));
  useEffect(() => { load(); }, []);

  const open = (req) => {
    setActive(req);
    setNotes(req.admin_notes || "");
    setStatus(req.status || "new");
  };

  const save = async () => {
    await adminUpdateCustomRequest(token, active.id, { status, admin_notes: notes });
    toast.success("Updated");
    setActive(null);
    load();
  };

  const statusBadge = (s) => {
    const cls = { new: "bg-amber-100 text-amber-900", reviewing: "bg-blue-100 text-blue-900", quoted: "bg-neutral-200", accepted: "bg-black text-white", rejected: "bg-red-100 text-red-900", completed: "bg-black text-white" }[s] || "bg-neutral-100";
    return <span className={`inline-flex px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${cls}`}>{s}</span>;
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-3xl uppercase tracking-[0.04em]">Custom Requests</h2>
        <span className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">{items.length} total</span>
      </div>
      {items.length === 0 ? (
        <div className="border border-dashed border-black/15 p-10 text-center text-sm text-neutral-500">No custom requests yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="border-b border-black/10 text-left text-[11px] uppercase tracking-[0.25em] text-neutral-500">
                <th className="py-3">Reference</th><th>Date</th><th>Customer</th><th>Product</th><th>Qty</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id} data-testid={`custom-row-${r.reference}`} className="border-b border-black/5 align-middle">
                  <td className="py-3 font-mono text-xs">{r.reference}</td>
                  <td className="text-xs text-neutral-600">{r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"}</td>
                  <td className="text-xs">
                    <div className="font-semibold">{r.customer_name}</div>
                    <div className="text-neutral-500">{r.email}</div>
                  </td>
                  <td className="capitalize">{r.product_type}</td>
                  <td>{r.quantity}</td>
                  <td>{statusBadge(r.status)}</td>
                  <td className="py-3"><button onClick={() => open(r)} className="inline-flex items-center gap-1 border border-black/20 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] hover:bg-black hover:text-white"><Pencil className="h-3 w-3" /> Open</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {active && (
        <Drawer title={`Request ${active.reference}`} onClose={() => setActive(null)} onSave={save} wide>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Info label="Customer">{active.customer_name}</Info>
            <Info label="Email">{active.email}</Info>
            <Info label="Phone">{active.phone || "—"}</Info>
            <Info label="Preferred">{active.contact_preference || "—"}</Info>
            <Info label="Product">{active.product_type}</Info>
            <Info label="Style">{active.design_style || "—"}</Info>
            <Info label="Placement">{active.print_placement || "—"}</Info>
            <Info label="Color">{active.primary_color || "—"}</Info>
            <Info label="Quantity">{active.quantity}</Info>
            <Info label="Budget">{active.budget_range || "—"}</Info>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">Brief</label>
            <p className="mt-2 whitespace-pre-wrap rounded border border-black/10 bg-neutral-50 p-3 text-sm leading-relaxed">{active.idea_description}</p>
          </div>
          {active.image_urls?.length > 0 && (
            <div>
              <label className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">References</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {active.image_urls.map((u, i) => (<img key={i} src={u} alt={`ref-${i}`} className="h-24 w-24 object-cover" />))}
              </div>
            </div>
          )}
          <Select label="Status" value={status} onChange={setStatus}
            options={[["new", "New"], ["reviewing", "Reviewing"], ["quoted", "Quoted"], ["accepted", "Accepted"], ["rejected", "Rejected"], ["completed", "Completed"]]} />
          <Field label="Admin notes (private)" multiline value={notes} onChange={setNotes} />
          <a href={`mailto:${active.email}?subject=Your Tuncel Textile request ${active.reference}`} className="inline-flex w-fit items-center gap-2 border border-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] hover:bg-black hover:text-white">Reply by email</a>
        </Drawer>
      )}
    </>
  );
}

const Info = ({ label, children }) => (
  <div>
    <div className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">{label}</div>
    <div className="mt-0.5 text-sm text-black">{children}</div>
  </div>
);

/* ============================================================
   RETURNS TAB
============================================================ */
const RETURN_STATUS_OPTIONS = ["pending", "approved", "rejected", "in_transit", "received", "refunded", "exchanged", "cancelled"];

function ReturnsTab({ token }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState(null);
  const [edit, setEdit] = useState({ status: "pending", admin_notes: "" });

  const load = async () => {
    setLoading(true);
    try { setItems(await adminListReturns(token)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openDetail = (r) => {
    setActive(r);
    setEdit({ status: r.status || "pending", admin_notes: r.admin_notes || "" });
  };

  const save = async () => {
    try {
      await adminUpdateReturn(token, active.id, edit);
      toast.success("Return updated");
      setActive(null);
      load();
    } catch { toast.error("Update failed"); }
  };

  const visible = items.filter((r) => filter === "all" || r.status === filter);

  const statusBadge = (s) => {
    const map = {
      pending: "bg-amber-100 text-amber-900",
      approved: "bg-blue-100 text-blue-900",
      rejected: "bg-red-100 text-red-900",
      in_transit: "bg-neutral-200 text-neutral-700",
      received: "bg-purple-100 text-purple-900",
      refunded: "bg-black text-white",
      exchanged: "bg-black text-white",
      cancelled: "bg-neutral-200 text-neutral-500",
    };
    return <span className={`inline-flex px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${map[s] || "bg-neutral-100 text-neutral-700"}`}>{(s || "pending").replace(/_/g, " ")}</span>;
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl uppercase tracking-[0.04em]">Returns & Exchanges</h2>
          <p className="mt-1 text-sm text-neutral-600">Approve, reject and process refunds/exchanges submitted by customers.</p>
        </div>
        <div className="flex flex-wrap gap-1">
          {[["all", "All"], ["pending", "Pending"], ["approved", "Approved"], ["rejected", "Rejected"], ["refunded", "Refunded"], ["exchanged", "Exchanged"]].map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)} data-testid={`returns-filter-${k}`}
              className={`px-3 py-2 text-[11px] uppercase tracking-[0.2em] ${filter === k ? "bg-black text-white" : "border border-black/15 hover:border-black"}`}>{l}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : visible.length === 0 ? (
        <div className="border border-dashed border-black/15 p-10 text-center text-sm text-neutral-500">No returns match this filter.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-black/10 text-left text-[11px] uppercase tracking-[0.25em] text-neutral-500">
                <th className="py-3">Reference</th><th>Date</th><th>Order</th><th>Customer</th><th>Type</th><th>Reason</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.id} data-testid={`return-row-${r.reference}`} className="border-b border-black/5 align-middle">
                  <td className="py-3 font-mono text-xs">{r.reference}</td>
                  <td className="text-xs text-neutral-600">{r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"}</td>
                  <td className="py-3 font-mono text-xs">{r.order_reference}</td>
                  <td className="text-xs">
                    <div className="font-semibold">{r.customer_name || "—"}</div>
                    <div className="text-neutral-500">{r.email}</div>
                  </td>
                  <td className="text-xs uppercase tracking-[0.15em]">{r.return_type}</td>
                  <td className="text-xs">{(r.reason || "").replace(/_/g, " ")}</td>
                  <td>{statusBadge(r.status)}</td>
                  <td className="py-3">
                    <button data-testid={`return-open-${r.reference}`} onClick={() => openDetail(r)}
                      className="inline-flex items-center gap-1 border border-black/20 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] hover:bg-black hover:text-white">
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {active && (
        <Drawer title={`Return · ${active.reference}`} wide onClose={() => setActive(null)} onSave={save}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Info label="Order">{active.order_reference}</Info>
            <Info label="Customer">{active.customer_name || "—"} · {active.email}</Info>
            <Info label="Type">{active.return_type}</Info>
            <Info label="Reason">{(active.reason || "").replace(/_/g, " ")}</Info>
            {active.exchange_size && <Info label="Exchange size">{active.exchange_size}</Info>}
            {active.iban_for_refund && <Info label="Refund IBAN"><span className="font-mono">{active.iban_for_refund}</span></Info>}
          </div>
          <div className="mt-5">
            <div className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">Customer description</div>
            <div className="mt-1 whitespace-pre-wrap text-sm text-neutral-800">{active.description}</div>
          </div>
          {active.image_urls?.length > 0 && (
            <div className="mt-5">
              <div className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">Photos ({active.image_urls.length})</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {active.image_urls.map((u, i) => (
                  <img key={i} src={u} alt={`return-${i}`} className="h-24 w-24 border border-black/10 object-cover" />
                ))}
              </div>
            </div>
          )}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">Status</label>
              <select
                data-testid="return-edit-status"
                value={edit.status}
                onChange={(e) => setEdit({ ...edit, status: e.target.value })}
                className="mt-2 w-full appearance-none border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-black"
              >
                {RETURN_STATUS_OPTIONS.map((s) => (<option key={s} value={s}>{s.replace(/_/g, " ")}</option>))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">Internal admin notes</label>
              <textarea
                data-testid="return-edit-notes"
                rows={3}
                value={edit.admin_notes}
                onChange={(e) => setEdit({ ...edit, admin_notes: e.target.value })}
                className="mt-2 w-full border border-black/15 px-3 py-2 text-sm outline-none focus:border-black"
              />
            </div>
          </div>
        </Drawer>
      )}
    </div>
  );
}


/* ============================================================
   CHAT TAB (admin live chat console)
============================================================ */
function ChatTab({ token, adminName }) {
  const [sessions, setSessions] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [activeData, setActiveData] = useState(null);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [soundOn, setSoundOn] = useState(() => {
    const v = localStorage.getItem("tuncel_admin_chat_sound");
    return v === null ? true : v === "true";
  });
  const scrollRef = React.useRef(null);
  const lastUnreadTotal = React.useRef(0);
  const audioCtxRef = React.useRef(null);

  const playDing = () => {
    if (!soundOn) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!audioCtxRef.current) audioCtxRef.current = new AC();
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch { /* noop */ }
  };

  const requestBrowserNotify = () => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") Notification.requestPermission();
  };

  const browserNotify = (title, body) => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    try {
      const n = new Notification(title, { body, icon: "/favicon.ico", tag: "tuncel-chat" });
      setTimeout(() => n.close(), 7000);
    } catch { /* noop */ }
  };

  const loadSessions = async () => {
    try {
      const list = await adminChatSessions(token);
      // detect new unread arrivals
      const total = list.reduce((s, x) => s + (x.unread_for_admin || 0), 0);
      if (total > lastUnreadTotal.current && lastUnreadTotal.current >= 0) {
        playDing();
        const latest = [...list].sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || ""))[0];
        if (latest) browserNotify(`New message from ${latest.customer_name || "Visitor"}`, "Open Atelier Admin to reply.");
      }
      lastUnreadTotal.current = total;
      setSessions(list);
    } catch { /* ignore */ }
  };

  const loadSession = async (id) => {
    setLoading(true);
    try {
      const d = await adminChatSession(token, id);
      setActiveData(d);
      setActiveId(id);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    loadSessions();
    const t = setInterval(loadSessions, 5000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeId) return undefined;
    const t = setInterval(() => loadSession(activeId), 4000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [activeData?.messages?.length]);

  const reply = async (e) => {
    e?.preventDefault();
    if (!draft.trim() || !activeId) return;
    const body = draft.trim();
    setDraft("");
    try {
      await adminChatReply(token, activeId, body, adminName);
      await loadSession(activeId);
      loadSessions();
    } catch { toast.error("Reply failed"); }
  };

  const closeChat = async () => {
    if (!activeId) return;
    if (!window.confirm("Close this chat session? The customer will see a closed banner and a 'Start new chat' button.")) return;
    try {
      await adminChatClose(token, activeId, adminName);
      toast.success("Chat closed");
      await loadSession(activeId);
      loadSessions();
    } catch { toast.error("Failed"); }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl uppercase tracking-[0.04em]">Live Chat</h2>
          <p className="mt-1 text-sm text-neutral-600">AI replies first · you take over when needed. New-message sound &amp; email alerts.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            data-testid="chat-sound-toggle"
            onClick={() => { const v = !soundOn; setSoundOn(v); localStorage.setItem("tuncel_admin_chat_sound", String(v)); if (v) playDing(); }}
            className={`inline-flex items-center gap-2 border px-3 py-2 text-[10px] uppercase tracking-[0.2em] ${soundOn ? "border-black bg-black text-white" : "border-black/20 text-neutral-600 hover:border-black"}`}
          >
            {soundOn ? "Sound on" : "Sound off"}
          </button>
          <button
            data-testid="chat-notify-permission"
            onClick={requestBrowserNotify}
            className="inline-flex items-center gap-2 border border-black/20 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-neutral-600 hover:border-black"
          >
            Enable browser alerts
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-0 border border-black/10 lg:grid-cols-[300px_1fr]" style={{ minHeight: 560 }}>
        {/* SESSIONS LIST */}
        <div className="border-b border-black/10 lg:border-b-0 lg:border-r">
          <div className="border-b border-black/10 px-4 py-3 text-[11px] uppercase tracking-[0.25em] text-neutral-500">
            Conversations ({sessions.length})
          </div>
          <div className="max-h-[520px] overflow-y-auto">
            {sessions.length === 0 ? (
              <p className="p-6 text-center text-sm text-neutral-500">No chats yet.</p>
            ) : (
              sessions.map((s) => (
                <button
                  key={s.id}
                  data-testid={`chat-session-${s.id}`}
                  onClick={() => loadSession(s.id)}
                  className={`block w-full border-b border-black/5 px-4 py-3 text-left transition-colors ${
                    activeId === s.id ? "bg-black text-white" : "hover:bg-neutral-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-display text-sm uppercase tracking-[0.04em]">{s.customer_name || "Visitor"}</div>
                    {s.unread_for_admin > 0 && (
                      <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-semibold text-white">{s.unread_for_admin}</span>
                    )}
                  </div>
                  <div className={`mt-0.5 text-[10px] uppercase tracking-[0.2em] ${activeId === s.id ? "text-white/60" : "text-neutral-500"}`}>
                    {s.status || "open"} · {s.updated_at ? new Date(s.updated_at).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                  </div>
                  {s.customer_email && (
                    <div className={`mt-1 truncate text-xs ${activeId === s.id ? "text-white/70" : "text-neutral-600"}`}>{s.customer_email}</div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* CHAT PANEL */}
        <div className="flex flex-col">
          {!activeData ? (
            <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-neutral-400">
              Select a conversation on the left.
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-black/10 px-5 py-3">
                <div>
                  <div className="font-display text-lg uppercase tracking-[0.04em]">
                    {activeData.session.customer_name || "Visitor"}
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">
                    {activeData.session.customer_email || "no email"} · {activeData.session.status}
                  </div>
                </div>
                {activeData.session.status === "open" && (
                  <button onClick={closeChat} data-testid="chat-admin-close"
                    className="border border-black/20 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] hover:bg-black hover:text-white">
                    Close chat
                  </button>
                )}
              </div>
              <div ref={scrollRef} className="flex-1 overflow-y-auto bg-neutral-50 p-5" style={{ maxHeight: 440 }} data-testid="chat-admin-messages">
                {loading && activeData.messages.length === 0 ? (
                  <p className="text-center text-xs text-neutral-400">Loading…</p>
                ) : activeData.messages.length === 0 ? (
                  <p className="text-center text-xs text-neutral-400">No messages.</p>
                ) : (
                  activeData.messages.map((m) => {
                    const isAi = m.sender === "ai";
                    const isAdmin = m.sender === "admin";
                    const isSystem = m.sender === "system";
                    if (isSystem) {
                      return (
                        <div key={m.id} className="my-3 text-center" data-testid={`chat-system-${m.id}`}>
                          <span className="inline-block border border-black/10 bg-white px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-neutral-500">{m.body}</span>
                        </div>
                      );
                    }
                    return (
                      <div
                        key={m.id}
                        className={`mb-3 max-w-[75%] px-3 py-2 text-sm leading-relaxed ${
                          isAdmin
                            ? "ml-auto bg-black text-white"
                            : isAi
                            ? "ml-auto border border-purple-200 bg-purple-50 text-black"
                            : "ml-0 bg-white text-black border border-black/10"
                        }`}
                      >
                        {m.body}
                        <div className={`mt-1 text-[9px] uppercase tracking-[0.2em] ${
                          isAdmin ? "text-white/60" : isAi ? "text-purple-700" : "text-neutral-500"
                        }`}>
                          {isAdmin ? `${m.sender_name || "Atelier"} · You` : isAi ? "Atelier AI · auto" : (activeData.session.customer_name || "Customer")} · {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              {activeData.session.status === "open" ? (
                <form onSubmit={reply} className="flex items-center gap-2 border-t border-black/10 p-3">
                  <input
                    data-testid="chat-admin-draft"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Type your reply…"
                    className="flex-1 border border-black/15 px-3 py-2 text-sm outline-none focus:border-black"
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim()}
                    data-testid="chat-admin-send"
                    className="bg-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-white disabled:opacity-40"
                  >
                    Send
                  </button>
                </form>
              ) : (
                <div className="border-t border-black/10 px-5 py-4 text-[11px] uppercase tracking-[0.25em] text-neutral-400">
                  This conversation is closed.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}




/* ============================================================
   GIFT CARDS TAB
============================================================ */
const GIFT_STATUS_OPTIONS = ["pending_payment", "active", "partially_used", "redeemed", "cancelled", "expired"];

function GiftCardsTab({ token }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    try { setItems(await adminListGiftCards(token)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (id, status) => {
    if (!window.confirm(`Set gift card status to "${status}"?`)) return;
    try { await adminUpdateGiftCard(token, id, { status }); toast.success("Updated"); load(); }
    catch { toast.error("Failed"); }
  };

  const visible = items.filter((g) => filter === "all" || g.status === filter);
  const totalIssued = items.filter((g) => g.status !== "pending_payment").reduce((s, g) => s + (g.amount || 0), 0);
  const totalRedeemed = items.filter((g) => g.status !== "pending_payment").reduce((s, g) => s + ((g.amount || 0) - (g.balance || 0)), 0);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl uppercase tracking-[0.04em]">Gift Cards</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Issued: <strong className="text-black">€{totalIssued.toFixed(2)}</strong> · Redeemed: <strong className="text-black">€{totalRedeemed.toFixed(2)}</strong>
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          {[["all", "All"], ["active", "Active"], ["pending_payment", "Pending"], ["partially_used", "Partially used"], ["redeemed", "Redeemed"], ["expired", "Expired"]].map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)} data-testid={`gc-filter-${k}`}
              className={`px-3 py-2 text-[11px] uppercase tracking-[0.2em] ${filter === k ? "bg-black text-white" : "border border-black/15 hover:border-black"}`}>{l}</button>
          ))}
        </div>
      </div>

      {loading ? <p className="text-sm text-neutral-500">Loading…</p>
       : visible.length === 0 ? <div className="border border-dashed border-black/15 p-10 text-center text-sm text-neutral-500">No gift cards.</div>
       : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-black/10 text-left text-[11px] uppercase tracking-[0.25em] text-neutral-500">
                <th className="py-3">Reference</th><th>Code</th><th>Amount</th><th>Balance</th><th>Recipient</th><th>Status</th><th>Expires</th><th></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((g) => (
                <tr key={g.id} data-testid={`gc-row-${g.reference}`} className="border-b border-black/5 align-middle">
                  <td className="py-3 font-mono text-xs">{g.reference}</td>
                  <td className="py-3 font-mono text-xs">{g.code}</td>
                  <td className="font-semibold">€{Number(g.amount).toFixed(2)}</td>
                  <td className="font-semibold">€{Number(g.balance ?? g.amount).toFixed(2)}</td>
                  <td className="text-xs">
                    <div className="font-semibold">{g.recipient_name || g.buyer_name || "—"}</div>
                    <div className="text-neutral-500">{g.recipient_email || g.buyer_email}</div>
                  </td>
                  <td><span className={`inline-flex px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${g.status === "active" ? "bg-emerald-100 text-emerald-900" : g.status === "redeemed" ? "bg-black text-white" : g.status === "cancelled" ? "bg-red-100 text-red-900" : "bg-neutral-100 text-neutral-700"}`}>{g.status.replace(/_/g, " ")}</span></td>
                  <td className="text-xs text-neutral-600">{(g.expires_at || "").slice(0, 10)}</td>
                  <td className="py-3 space-x-1 whitespace-nowrap">
                    {g.status === "pending_payment" && (
                      <button data-testid={`gc-activate-${g.reference}`} onClick={() => setStatus(g.id, "active")}
                        className="inline-flex items-center gap-1 bg-black px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white hover:bg-neutral-800">Activate</button>
                    )}
                    {g.status === "active" && (
                      <button data-testid={`gc-cancel-${g.reference}`} onClick={() => setStatus(g.id, "cancelled")}
                        className="inline-flex items-center gap-1 border border-black/20 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] hover:bg-black hover:text-white">Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   ANALYTICS TAB
============================================================ */
function AnalyticsTab({ token }) {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async (d = days) => {
    setLoading(true);
    try { setData(await adminAnalytics(token, d)); }
    catch { toast.error("Failed to load analytics"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(days); /* eslint-disable-next-line */ }, [days]);

  if (loading && !data) return <p className="text-sm text-neutral-500">Loading analytics…</p>;
  if (!data) return <p className="text-sm text-neutral-500">No data</p>;

  // Build a simple bar chart for daily revenue
  const maxRev = Math.max(1, ...data.daily.map((d) => d.revenue));

  return (
    <div data-testid="analytics-tab">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl uppercase tracking-[0.04em]">Atelier Analytics</h2>
          <p className="mt-1 text-sm text-neutral-600">A snapshot of the last {data.range_days} days.</p>
        </div>
        <div className="flex gap-1">
          {[[7, "7d"], [30, "30d"], [90, "90d"], [365, "1y"]].map(([d, l]) => (
            <button key={d} onClick={() => setDays(d)} data-testid={`analytics-range-${d}`}
              className={`px-4 py-2 text-[11px] uppercase tracking-[0.2em] ${days === d ? "bg-black text-white" : "border border-black/15 hover:border-black"}`}>{l}</button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Kpi label="Revenue" value={`€${data.revenue.toFixed(2)}`} accent />
        <Kpi label="Paid orders" value={data.orders_count} sub={`AOV €${data.aov.toFixed(2)}`} />
        <Kpi label="Returns" value={data.returns_count} sub={`Rate ${data.return_rate_pct}%`} />
        <Kpi label="Custom requests" value={data.custom_requests_count} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Kpi label="AI replies" value={data.chat_ai_replies} sub={`${data.chat_ai_share_pct}% of all`} />
        <Kpi label="Human replies" value={data.chat_human_replies} />
        <Kpi label="Active gift cards" value={data.gift_cards_active} />
        <Kpi label="Gift card revenue" value={`€${data.gift_cards_revenue.toFixed(2)}`} />
      </div>

      {/* Daily revenue chart */}
      <section className="mt-10">
        <div className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">Daily revenue</div>
        <div className="mt-3 flex items-end gap-1.5 border-b border-black/10 pb-3" style={{ minHeight: 180 }}>
          {data.daily.length === 0 ? (
            <p className="py-12 text-sm text-neutral-400">No paid orders yet in this period.</p>
          ) : data.daily.map((d) => (
            <div key={d.date} className="flex flex-1 flex-col items-center gap-1" title={`${d.date} · €${d.revenue.toFixed(2)} · ${d.orders} orders`}>
              <div className="w-full bg-black" style={{ height: `${(d.revenue / maxRev) * 160}px`, minHeight: 2 }} />
              <div className="text-[8px] uppercase tracking-[0.18em] text-neutral-400">{d.date.slice(5)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Top products */}
      <section className="mt-10">
        <div className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">Top products</div>
        {data.top_products.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-400">No product sales yet.</p>
        ) : (
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="border-b border-black/10 text-left text-[11px] uppercase tracking-[0.25em] text-neutral-500">
                <th className="py-2">#</th><th>Product</th><th>Units</th><th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data.top_products.map((p, i) => (
                <tr key={p.product_id} className="border-b border-black/5">
                  <td className="py-2 font-mono text-xs text-neutral-500">{i + 1}</td>
                  <td className="font-display text-base uppercase tracking-[0.02em]">{p.name}</td>
                  <td>{p.units}</td>
                  <td className="font-semibold">€{p.revenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

const Kpi = ({ label, value, sub = null, accent = false }) => (
  <div className={`border p-5 ${accent ? "border-black bg-black text-white" : "border-black/15"}`}>
    <div className={`text-[10px] uppercase tracking-[0.25em] ${accent ? "text-white/60" : "text-neutral-500"}`}>{label}</div>
    <div className="font-display mt-1 text-4xl uppercase tracking-[0.04em]">{value}</div>
    {sub && <div className={`mt-1 text-[10px] uppercase tracking-[0.2em] ${accent ? "text-white/60" : "text-neutral-500"}`}>{sub}</div>}
  </div>
);



/* ============================================================
   SHARED UI HELPERS
============================================================ */
const Drawer = ({ title, onClose, onSave, children, wide = false }) => (
  <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/60 backdrop-blur-sm">
    <div className={`flex w-full flex-col bg-white ${wide ? "max-w-3xl" : "max-w-xl"}`}>
      <div className="flex items-center justify-between border-b border-black/10 px-6 py-4">
        <div className="font-display text-2xl uppercase tracking-[0.04em]">{title}</div>
        <button onClick={onClose} aria-label="Close"><X className="h-5 w-5" /></button>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">{children}</div>
      <div className="border-t border-black/10 p-4">
        <button data-testid="admin-save-button" onClick={onSave} className="inline-flex w-full items-center justify-center gap-2 bg-black px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-white hover:bg-neutral-800">
          <Save className="h-4 w-4" /> Save
        </button>
      </div>
    </div>
  </div>
);

const Field = ({ label, value, onChange, type = "text", multiline = false, testid }) => (
  <div>
    <label className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">{label}</label>
    {multiline ? (
      <textarea rows={3} value={value || ""} onChange={(e) => onChange(e.target.value)} data-testid={testid} className="mt-2 w-full border border-black/15 px-3 py-2 outline-none focus:border-black" />
    ) : (
      <input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} data-testid={testid} className="mt-2 w-full border border-black/15 px-3 py-2 outline-none focus:border-black" />
    )}
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div>
    <label className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full border border-black/15 bg-white px-3 py-2 outline-none focus:border-black">
      {options.map(([v, l]) => (<option key={v} value={v}>{l}</option>))}
    </select>
  </div>
);

const ImagePicker = ({ label, value, onChange, onUpload, uploading, small = false }) => (
  <div>
    <label className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">{label}</label>
    <div className="mt-2 flex gap-3">
      <input type="text" placeholder="https://… or upload" value={value || ""} onChange={(e) => onChange(e.target.value)} className="flex-1 border border-black/15 px-3 py-2" />
      <label className="inline-flex cursor-pointer items-center gap-2 border border-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] hover:bg-black hover:text-white">
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} Upload
        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
      </label>
    </div>
    {value && <img src={value} alt="preview" className={small ? "mt-3 h-16 w-16 object-contain" : "mt-3 h-32 w-32 object-cover"} />}
  </div>
);
