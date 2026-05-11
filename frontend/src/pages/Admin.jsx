import React, { useEffect, useState } from "react";
import {
  adminLogin,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminUploadImage,
  fetchProducts,
} from "@/lib/api";
import { toast } from "sonner";
import { Loader2, LogOut, Pencil, Plus, Save, Trash2, Upload, X } from "lucide-react";

const TOKEN_KEY = "tuncel_admin_token";

const EMPTY = {
  name: "",
  description: "",
  price: 0,
  category: "men",
  product_type: "tshirt",
  image_url: "",
  sizes: ["S", "M", "L", "XL"],
  colors: ["Black"],
  in_stock: true,
  featured: false,
  print_name: "",
};

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [password, setPassword] = useState("");
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null); // null | "new" | productId
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (token) loadProducts();
  }, [token]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } finally {
      setLoading(false);
    }
  };

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

  const startCreate = () => {
    setForm(EMPTY);
    setEditing("new");
  };

  const startEdit = (p) => {
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      product_type: p.product_type,
      image_url: p.image_url,
      sizes: p.sizes || [],
      colors: p.colors || [],
      in_stock: p.in_stock,
      featured: p.featured,
      print_name: p.print_name || "",
    });
    setEditing(p.id);
  };

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const res = await adminUploadImage(token, file);
      setForm((f) => ({ ...f, image_url: res.url }));
      toast.success("Image uploaded");
    } catch (e) {
      console.error(e);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        sizes: typeof form.sizes === "string" ? form.sizes.split(",").map((s) => s.trim()).filter(Boolean) : form.sizes,
        colors: typeof form.colors === "string" ? form.colors.split(",").map((s) => s.trim()).filter(Boolean) : form.colors,
      };
      if (editing === "new") {
        await adminCreateProduct(token, payload);
        toast.success("Product created");
      } else {
        await adminUpdateProduct(token, editing, payload);
        toast.success("Product updated");
      }
      setEditing(null);
      setForm(EMPTY);
      loadProducts();
    } catch (e) {
      console.error(e);
      toast.error("Save failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await adminDeleteProduct(token, id);
      toast.success("Deleted");
      loadProducts();
    } catch {
      toast.error("Delete failed");
    }
  };

  // -------- Login screen --------
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

  // -------- Admin dashboard --------
  return (
    <div data-testid="admin-dashboard" className="mx-auto max-w-[1400px] px-5 sm:px-8">
      <section className="flex flex-wrap items-end justify-between gap-4 border-b border-black/10 py-10">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">Studio</div>
          <h1 className="font-display mt-2 text-6xl uppercase leading-none tracking-[0.02em] sm:text-7xl">
            Admin
          </h1>
        </div>
        <div className="flex gap-3">
          <button
            data-testid="admin-new-product"
            onClick={startCreate}
            className="inline-flex items-center gap-2 bg-black px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-white"
          >
            <Plus className="h-3.5 w-3.5" /> New Product
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

      <section className="py-10">
        {loading ? (
          <p className="text-sm text-neutral-500">Loading…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b border-black/10 text-left text-[11px] uppercase tracking-[0.25em] text-neutral-500">
                  <th className="py-3">Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Featured</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} data-testid={`admin-row-${p.id}`} className="border-b border-black/5 align-middle">
                    <td className="py-3">
                      <img src={p.image_url} alt={p.name} className="h-14 w-14 object-cover" />
                    </td>
                    <td className="font-display text-lg">{p.name}</td>
                    <td className="capitalize">{p.category}</td>
                    <td className="capitalize">{p.product_type}</td>
                    <td>${Number(p.price).toFixed(2)}</td>
                    <td>{p.featured ? "Yes" : "—"}</td>
                    <td className="flex gap-2 py-3">
                      <button
                        data-testid={`admin-edit-${p.id}`}
                        onClick={() => startEdit(p)}
                        className="inline-flex items-center gap-1 border border-black/20 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] hover:bg-black hover:text-white"
                      >
                        <Pencil className="h-3 w-3" /> Edit
                      </button>
                      <button
                        data-testid={`admin-delete-${p.id}`}
                        onClick={() => handleDelete(p.id)}
                        className="inline-flex items-center gap-1 border border-black/20 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white"
                      >
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/60 backdrop-blur-sm">
          <div className="flex w-full max-w-xl flex-col bg-white">
            <div className="flex items-center justify-between border-b border-black/10 px-6 py-4">
              <div className="font-display text-2xl uppercase tracking-[0.04em]">
                {editing === "new" ? "New Product" : "Edit Product"}
              </div>
              <button onClick={() => setEditing(null)} aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
              <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} testid="admin-field-name" />
              <Field label="Print name" value={form.print_name} onChange={(v) => setForm({ ...form, print_name: v })} testid="admin-field-print" />
              <Field label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} multiline testid="admin-field-description" />
              <div className="grid grid-cols-3 gap-3">
                <Field label="Price ($)" type="number" value={form.price} onChange={(v) => setForm({ ...form, price: v })} testid="admin-field-price" />
                <Select
                  label="Category"
                  value={form.category}
                  onChange={(v) => setForm({ ...form, category: v })}
                  options={[["men", "Men"], ["women", "Women"], ["accessories", "Accessories"]]}
                  testid="admin-field-category"
                />
                <Select
                  label="Type"
                  value={form.product_type}
                  onChange={(v) => setForm({ ...form, product_type: v })}
                  options={[["hoodie", "Hoodie"], ["tshirt", "T-Shirt"], ["accessory", "Accessory"]]}
                  testid="admin-field-type"
                />
              </div>
              <Field
                label="Sizes (comma separated)"
                value={Array.isArray(form.sizes) ? form.sizes.join(", ") : form.sizes}
                onChange={(v) => setForm({ ...form, sizes: v })}
                testid="admin-field-sizes"
              />
              <Field
                label="Colors (comma separated)"
                value={Array.isArray(form.colors) ? form.colors.join(", ") : form.colors}
                onChange={(v) => setForm({ ...form, colors: v })}
                testid="admin-field-colors"
              />

              <div>
                <label className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">Image</label>
                <div className="mt-2 flex gap-3">
                  <input
                    type="text"
                    placeholder="Image URL"
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    data-testid="admin-field-image-url"
                    className="flex-1 border border-black/15 px-3 py-2"
                  />
                  <label className="inline-flex cursor-pointer items-center gap-2 border border-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] hover:bg-black hover:text-white">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                    Upload
                    <input
                      data-testid="admin-image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                    />
                  </label>
                </div>
                {form.image_url && (
                  <img src={form.image_url} alt="preview" className="mt-3 h-32 w-32 object-cover" />
                )}
              </div>

              <div className="flex gap-6">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    data-testid="admin-field-featured"
                  />
                  Featured on home
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.in_stock}
                    onChange={(e) => setForm({ ...form, in_stock: e.target.checked })}
                  />
                  In stock
                </label>
              </div>
            </div>

            <div className="border-t border-black/10 p-4">
              <button
                data-testid="admin-save-button"
                onClick={handleSave}
                className="inline-flex w-full items-center justify-center gap-2 bg-black px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-white hover:bg-neutral-800"
              >
                <Save className="h-4 w-4" /> Save Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const Field = ({ label, value, onChange, type = "text", multiline = false, testid }) => (
  <div>
    <label className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">{label}</label>
    {multiline ? (
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid={testid}
        className="mt-2 w-full border border-black/15 px-3 py-2 outline-none focus:border-black"
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid={testid}
        className="mt-2 w-full border border-black/15 px-3 py-2 outline-none focus:border-black"
      />
    )}
  </div>
);

const Select = ({ label, value, onChange, options, testid }) => (
  <div>
    <label className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      data-testid={testid}
      className="mt-2 w-full border border-black/15 bg-white px-3 py-2 outline-none focus:border-black"
    >
      {options.map(([v, l]) => (
        <option key={v} value={v}>{l}</option>
      ))}
    </select>
  </div>
);
