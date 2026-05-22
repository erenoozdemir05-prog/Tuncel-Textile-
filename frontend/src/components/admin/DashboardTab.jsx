import React, { useEffect, useState } from "react";
import axios from "axios";
import { adminAnalytics } from "@/lib/api";
import { toast } from "sonner";
import {
  Package, ShoppingBag, Image as ImageIcon, Gift, MessageCircle,
  Type, HelpCircle, Sparkles, RotateCcw, Settings as SettingsIcon,
  BarChart3, TrendingUp, Euro, AlertCircle, UserPlus, Copy, Trash2,
} from "lucide-react";

const API = process.env.REACT_APP_BACKEND_URL + "/api";

const TILE_DEFS = [
  { key: "products", label: "Products", icon: Package, hint: "Add, edit & delete pieces", color: "#1F4D3D" },
  { key: "orders", label: "Orders", icon: ShoppingBag, hint: "Mark paid, track fulfilment", color: "#0A0A0A" },
  { key: "hero", label: "Hero Manager", icon: ImageIcon, hint: "Homepage hero slides", color: "#C4A56B" },
  { key: "cms", label: "Global Text", icon: Type, hint: "Edit site copy (4 languages)", color: "#0A0A0A" },
  { key: "custom-requests", label: "Custom Requests", icon: Sparkles, hint: "Bespoke client briefs", color: "#1F4D3D" },
  { key: "returns", label: "Returns", icon: RotateCcw, hint: "Returns & refund requests", color: "#0A0A0A" },
  { key: "chat", label: "Live Chat", icon: MessageCircle, hint: "Customer conversations", color: "#1F4D3D" },
  { key: "gift-cards", label: "Gift Cards", icon: Gift, hint: "Issued cards, redemption log", color: "#C4A56B" },
  { key: "faqs", label: "FAQs", icon: HelpCircle, hint: "Customer-facing FAQ entries", color: "#0A0A0A" },
  { key: "analytics", label: "Analytics", icon: BarChart3, hint: "Revenue, orders, top items", color: "#1F4D3D" },
  { key: "settings", label: "Settings", icon: SettingsIcon, hint: "IBAN, integrations, brand", color: "#0A0A0A" },
];

const StatCard = ({ icon: Icon, label, value, sub, color = "#0A0A0A" }) => (
  <div className="relative border border-black/10 bg-white p-6">
    <div className="flex items-start justify-between">
      <div>
        <div className="text-[10px] uppercase tracking-[0.4em] text-black/55">{label}</div>
        <div className="font-display mt-3 text-4xl tracking-tight text-black">{value}</div>
        {sub && <div className="mt-2 text-[11px] text-black/55">{sub}</div>}
      </div>
      <div
        className="grid h-10 w-10 place-items-center rounded-full text-white"
        style={{ background: color }}
      >
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </div>
);

const Tile = ({ def, onClick, badge }) => {
  const Icon = def.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={`dash-tile-${def.key}`}
      className="group relative flex flex-col items-start gap-4 border border-black/10 bg-white p-6 text-left transition-all hover:-translate-y-0.5 hover:border-black hover:shadow-[0_18px_30px_-22px_rgba(0,0,0,0.45)]"
    >
      <div
        className="grid h-12 w-12 place-items-center text-white transition-colors"
        style={{ background: def.color }}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-[12px] font-semibold uppercase tracking-[0.25em] text-black">{def.label}</div>
        <div className="mt-1 text-[11px] text-black/55">{def.hint}</div>
      </div>
      {badge != null && badge > 0 && (
        <span
          className="absolute right-4 top-4 inline-flex h-6 min-w-[24px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white"
          style={{ background: "#1F4D3D" }}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      )}
      <span className="mt-auto inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.35em] text-black/45 transition-colors group-hover:text-[#1F4D3D]">
        OPEN →
      </span>
    </button>
  );
};

export const DashboardTab = ({ token, onNavigate }) => {
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    adminAnalytics(token)
      .then((d) => alive && setStats(d))
      .catch((e) => alive && setErr(e?.response?.data?.detail || "Could not load analytics"));
    return () => { alive = false; };
  }, [token]);

  const a = stats || {};
  const revenue = a.revenue_total != null ? `€${Number(a.revenue_total).toFixed(0)}` : "—";
  const orders = a.orders_total ?? "—";
  const giftCards = a.gift_cards_issued ?? "—";
  const lowStock = a.low_stock_count ?? 0;
  const pendingChats = a.chat_open_count ?? 0;
  const pendingReturns = a.returns_pending ?? 0;
  const pendingCustom = a.custom_pending ?? 0;

  return (
    <div data-testid="admin-dashboard-tab" className="space-y-10">
      {/* Welcome / status strip */}
      <section>
        <div className="text-[10px] uppercase tracking-[0.45em] text-black/55">
          Studio control panel · {new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
        </div>
        <h2 className="font-display mt-2 text-4xl uppercase leading-none tracking-[0.02em] text-black sm:text-5xl">
          Atelier Dashboard
        </h2>
        {err && (
          <div className="mt-4 inline-flex items-center gap-2 border border-black/10 bg-[#F5F1E8] px-3 py-2 text-[11px] text-black/70">
            <AlertCircle className="h-3.5 w-3.5" /> {err}
          </div>
        )}
      </section>

      {/* KPI strip */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Euro} label="Revenue (paid)" value={revenue} color="#1F4D3D" />
        <StatCard icon={ShoppingBag} label="Total orders" value={orders} color="#0A0A0A" />
        <StatCard icon={Gift} label="Gift cards" value={giftCards} color="#C4A56B" />
        <StatCard
          icon={TrendingUp}
          label="Avg order"
          value={a.avg_order_value != null ? `€${Number(a.avg_order_value).toFixed(0)}` : "—"}
          color="#0A0A0A"
        />
      </section>

      {/* Attention banners */}
      {(pendingChats > 0 || pendingReturns > 0 || pendingCustom > 0 || lowStock > 0) && (
        <section className="grid grid-cols-1 gap-3 border border-black/10 bg-[#F5F1E8] p-4 sm:grid-cols-2 lg:grid-cols-4">
          {pendingChats > 0 && (
            <button
              type="button"
              onClick={() => onNavigate?.("chat")}
              data-testid="dash-attn-chat"
              className="flex items-center justify-between border border-black/10 bg-white px-4 py-3 text-left hover:border-black"
            >
              <span className="text-[11px] uppercase tracking-[0.3em] text-black">Open chats</span>
              <span className="inline-flex h-7 min-w-[28px] items-center justify-center rounded-full bg-[#1F4D3D] px-2 text-[11px] font-bold text-white">{pendingChats}</span>
            </button>
          )}
          {pendingReturns > 0 && (
            <button
              type="button"
              onClick={() => onNavigate?.("returns")}
              data-testid="dash-attn-returns"
              className="flex items-center justify-between border border-black/10 bg-white px-4 py-3 text-left hover:border-black"
            >
              <span className="text-[11px] uppercase tracking-[0.3em] text-black">Pending returns</span>
              <span className="inline-flex h-7 min-w-[28px] items-center justify-center rounded-full bg-[#C4A56B] px-2 text-[11px] font-bold text-white">{pendingReturns}</span>
            </button>
          )}
          {pendingCustom > 0 && (
            <button
              type="button"
              onClick={() => onNavigate?.("custom-requests")}
              data-testid="dash-attn-custom"
              className="flex items-center justify-between border border-black/10 bg-white px-4 py-3 text-left hover:border-black"
            >
              <span className="text-[11px] uppercase tracking-[0.3em] text-black">Custom requests</span>
              <span className="inline-flex h-7 min-w-[28px] items-center justify-center rounded-full bg-[#1F4D3D] px-2 text-[11px] font-bold text-white">{pendingCustom}</span>
            </button>
          )}
          {lowStock > 0 && (
            <button
              type="button"
              onClick={() => onNavigate?.("products")}
              data-testid="dash-attn-stock"
              className="flex items-center justify-between border border-black/10 bg-white px-4 py-3 text-left hover:border-black"
            >
              <span className="text-[11px] uppercase tracking-[0.3em] text-black">Low stock</span>
              <span className="inline-flex h-7 min-w-[28px] items-center justify-center rounded-full bg-black px-2 text-[11px] font-bold text-white">{lowStock}</span>
            </button>
          )}
        </section>
      )}

      {/* Tile grid — cPanel feel */}
      <section>
        <div className="flex items-end justify-between border-b border-black/10 pb-4">
          <div className="text-[10px] uppercase tracking-[0.45em] text-black/55">Manage</div>
          <div className="text-[10px] uppercase tracking-[0.45em] text-black/45">{TILE_DEFS.length} modules</div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {TILE_DEFS.map((def) => {
            const badge =
              def.key === "chat" ? pendingChats :
              def.key === "returns" ? pendingReturns :
              def.key === "custom-requests" ? pendingCustom :
              undefined;
            return <Tile key={def.key} def={def} onClick={() => onNavigate?.(def.key)} badge={badge} />;
          })}
        </div>
      </section>

      {/* Team invite section — single-use, time-limited */}
      <TeamInvitePanel token={token} />
    </div>
  );
};

const TeamInvitePanel = ({ token }) => {
  const [invites, setInvites] = useState([]);
  const [creating, setCreating] = useState(false);
  const [email, setEmail] = useState("");

  const load = React.useCallback(() => {
    axios
      .get(`${API}/admin/invites`, { headers: { "X-Admin-Token": token } })
      .then((r) => setInvites(r.data || []))
      .catch(() => {});
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const createInvite = async () => {
    setCreating(true);
    try {
      const r = await axios.post(
        `${API}/admin/invites`,
        { email: email || null, ttl_hours: 48 },
        { headers: { "X-Admin-Token": token } }
      );
      const fullUrl = window.location.origin + `/invite/${r.data.token}`;
      navigator.clipboard?.writeText(fullUrl).catch(() => {});
      toast.success("Invite link copied to clipboard");
      setEmail("");
      load();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Could not create invite");
    } finally {
      setCreating(false);
    }
  };

  const revoke = async (id) => {
    if (!window.confirm("Revoke this invite?")) return;
    try {
      await axios.delete(`${API}/admin/invites/${id}`, { headers: { "X-Admin-Token": token } });
      toast.success("Invite revoked");
      load();
    } catch {
      toast.error("Could not revoke");
    }
  };

  const copyUrl = (inviteToken) => {
    const url = window.location.origin + `/invite/${inviteToken}`;
    navigator.clipboard?.writeText(url);
    toast.success("Copied");
  };

  return (
    <section data-testid="admin-invite-panel">
      <div className="flex items-end justify-between border-b border-black/10 pb-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.45em] text-black/55">Team</div>
          <div className="font-display mt-1 text-2xl uppercase tracking-[0.04em] text-black">Invite members</div>
        </div>
        <div className="text-[10px] uppercase tracking-[0.45em] text-black/45">Single-use · 48h</div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_2fr]">
        {/* Create form */}
        <div className="border border-black/10 bg-white p-5">
          <label className="text-[11px] uppercase tracking-[0.3em] text-black/60">Optional email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="member@email.com"
            data-testid="invite-email-input"
            className="mt-2 w-full border border-black/15 bg-[#F7F9FB] px-3 py-2.5 text-sm outline-none focus:border-black"
          />
          <button
            type="button"
            onClick={createInvite}
            disabled={creating}
            data-testid="invite-create-btn"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 bg-black px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-[#1A1A1A] disabled:opacity-50"
          >
            <UserPlus className="h-3.5 w-3.5" />
            {creating ? "Creating…" : "Create invite link"}
          </button>
          <p className="mt-3 text-[10px] uppercase tracking-[0.25em] text-black/45">
            Link is single-use. Copies to clipboard.
          </p>
        </div>

        {/* Invite list */}
        <div className="border border-black/10 bg-white">
          {invites.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-black/45">No invites yet</div>
          ) : (
            <ul className="divide-y divide-black/10">
              {invites.map((inv) => {
                const expired = new Date(inv.expires_at) < new Date();
                const status = inv.used ? (inv.accepted_user_id ? "ACCEPTED" : "REVOKED") : expired ? "EXPIRED" : "ACTIVE";
                const color =
                  status === "ACTIVE" ? "#1F4D3D" : status === "ACCEPTED" ? "#0A0A0A" : "#9A9590";
                return (
                  <li key={inv.id} className="flex items-center justify-between gap-3 px-5 py-4">
                    <div className="min-w-0">
                      <div className="text-[11px] uppercase tracking-[0.3em] text-black/85 truncate">
                        {inv.email || "— (no email)"}
                      </div>
                      <div className="mt-1 text-[10px] uppercase tracking-[0.25em] text-black/50">
                        by {inv.invited_by} · expires {new Date(inv.expires_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className="px-2 py-1 text-[9px] uppercase tracking-[0.3em] text-white"
                        style={{ background: color }}
                      >
                        {status}
                      </span>
                      {status === "ACTIVE" && (
                        <>
                          <button
                            type="button"
                            onClick={() => copyUrl(inv.token)}
                            aria-label="Copy invite link"
                            className="grid h-8 w-8 place-items-center border border-black/15 hover:border-black"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => revoke(inv.id)}
                            aria-label="Revoke invite"
                            className="grid h-8 w-8 place-items-center border border-black/15 hover:border-black"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};

export default DashboardTab;
