import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { fetchOrders } from "@/lib/api";
import { LogOut, Package } from "lucide-react";

export default function Account() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/", { replace: true });
      return;
    }
    fetchOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-[1400px] px-5 py-32 text-center sm:px-8">
        <p className="text-[12px] uppercase tracking-[0.25em] text-neutral-500">Loading…</p>
      </div>
    );
  }

  return (
    <div data-testid="account-page" className="mx-auto max-w-[1400px] px-5 sm:px-8">
      <section className="flex flex-wrap items-end justify-between gap-6 border-b border-black/10 py-12">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">Account</div>
          <h1 className="font-display mt-2 text-6xl uppercase leading-none tracking-[0.02em] sm:text-8xl">
            Hi, {user.name?.split(" ")[0] || "there"}
          </h1>
          <div className="mt-3 text-sm text-neutral-600">{user.email}</div>
        </div>
        <button
          data-testid="sign-out-button"
          onClick={handleSignOut}
          className="inline-flex items-center gap-2 border border-black px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] hover:bg-black hover:text-white"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign Out
        </button>
      </section>

      <section className="py-12">
        <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">Order history</div>
        <h2 className="font-display mt-2 text-4xl uppercase tracking-[0.04em] sm:text-5xl">Your Orders</h2>

        {ordersLoading ? (
          <div className="mt-10 space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-24 w-full animate-pulse bg-neutral-100" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-12 border border-dashed border-black/15 p-12 text-center">
            <Package className="mx-auto h-8 w-8 text-neutral-400" />
            <p className="mt-4 font-display text-2xl uppercase tracking-[0.04em] text-neutral-500">
              No orders yet
            </p>
            <Link
              to="/shop/all"
              className="mt-6 inline-flex items-center gap-2 bg-black px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-white"
            >
              Start Shopping →
            </Link>
          </div>
        ) : (
          <div className="mt-8 divide-y divide-black/10 border-y border-black/10">
            {orders.map((o) => (
              <div key={o.session_id} data-testid={`order-row-${o.session_id}`} className="grid grid-cols-1 gap-4 py-6 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">
                    {new Date(o.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                  </div>
                  <div className="font-display mt-1 text-2xl uppercase tracking-[0.04em]">
                    Order · {o.session_id.slice(-8).toUpperCase()}
                  </div>
                  <div className="mt-1 text-sm text-neutral-600">
                    {(o.items || []).reduce((s, i) => s + (i.quantity || 1), 0)} items · {(o.metadata?.items || "").slice(0, 80)}
                  </div>
                </div>
                <div className="text-right font-semibold">€{Number(o.amount).toFixed(2)}</div>
                <span className="inline-flex w-fit bg-black px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-white">
                  Paid
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
