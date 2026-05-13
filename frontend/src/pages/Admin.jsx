import React, { useEffect, useState } from "react";
import {
  adminLogin, adminCreateProduct, adminUpdateProduct, adminDeleteProduct, adminUploadImage,
  fetchProducts, fetchSettings, adminUpdateSettings,
  adminListHero, adminCreateHero, adminUpdateHero, adminDeleteHero, adminReorderHero,
  fetchCms, adminUpdateCms,
  adminListOrders, adminMarkPaid, adminMarkUnpaid,
} from "@/lib/api";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, ImageIcon, Loader2, LogOut, Pencil, Plus, Save, Trash2, Upload, X } from "lucide-react";

const TOKEN_KEY = "tuncel_admin_token";
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
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState("products");

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

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
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

  return (
    <div data-testid="admin-dashboard" className="mx-auto max-w-[1400px] px-5 sm:px-8">
      <section className="flex flex-wrap items-end justify-between gap-4 border-b border-black/10 py-10">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">Studio</div>
          <h1 className="font-display mt-2 text-6xl uppercase leading-none tracking-[0.02em] sm:text-7xl">Admin</h1>
        </div>
        <button
          data-testid="admin-logout"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 border border-black px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] hover:bg-black hover:text-white"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign Out
        </button>
      </section>

      {/* TABS */}
      <nav className="flex flex-wrap gap-1 border-b border-black/10 py-4">
        {[
          ["products", "Products"],
          ["orders", "Orders"],
          ["hero", "Hero Manager"],
          ["cms", "Global Text"],
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
                  <td>${Number(p.price).toFixed(2)}</td>
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
            <Field label="Price ($)" type="number" value={form.price} onChange={(v) => setForm({ ...form, price: v })} testid="admin-field-price" />
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
        <h3 className="font-display text-xl uppercase tracking-[0.04em]">WhatsApp</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Number (with +country)" value={s.whatsapp_number || ""} onChange={(v) => u("whatsapp_number", v)} />
          <Field label="Default prefilled message" value={s.whatsapp_default_message || ""} onChange={(v) => u("whatsapp_default_message", v)} multiline />
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
                return (
                  <tr key={ref} data-testid={`order-row-${ref}`} className="border-b border-black/5 align-middle">
                    <td className="py-3 font-mono text-xs">{ref?.slice(0, 20)}</td>
                    <td className="text-xs text-neutral-600">{date}</td>
                    <td className="text-xs uppercase tracking-[0.15em]">{isIban ? "IBAN" : "Card"}</td>
                    <td className="text-xs">
                      <div className="font-semibold">{o.customer_name || "—"}</div>
                      <div className="text-neutral-500">{o.customer_email || "—"}</div>
                    </td>
                    <td className="font-semibold">{(o.currency === "eur" ? "€" : "$")}{Number(o.amount).toFixed(2)}</td>
                    <td>{statusBadge(o.payment_status)}</td>
                    <td className="py-3">
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

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
