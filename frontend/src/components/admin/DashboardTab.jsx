import React, { useEffect, useState } from "react";
import { adminAnalytics } from "@/lib/api";
import {
  Package, ShoppingBag, Image as ImageIcon, Gift, MessageCircle,
  Type, HelpCircle, Sparkles, RotateCcw, Settings as SettingsIcon,
  BarChart3, TrendingUp, Users, Euro, AlertCircle,
} from "lucide-react";

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
    </div>
  );
};

export default DashboardTab;
