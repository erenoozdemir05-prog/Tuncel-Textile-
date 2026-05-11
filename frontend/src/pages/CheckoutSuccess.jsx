import React, { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getCheckoutStatus } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const { clear } = useCart();
  const [state, setState] = useState({ phase: "checking", paymentStatus: null, amount: 0 });
  const attemptsRef = useRef(0);
  const clearedRef = useRef(false);

  useEffect(() => {
    if (!sessionId) {
      setState({ phase: "error", paymentStatus: null, amount: 0 });
      return;
    }

    let timer;
    const poll = async () => {
      attemptsRef.current += 1;
      try {
        const data = await getCheckoutStatus(sessionId);
        if (data.payment_status === "paid") {
          if (!clearedRef.current) {
            clear();
            clearedRef.current = true;
          }
          setState({ phase: "paid", paymentStatus: "paid", amount: data.amount_total });
          return;
        }
        if (data.status === "expired" || data.payment_status === "failed") {
          setState({ phase: "failed", paymentStatus: data.payment_status, amount: data.amount_total });
          return;
        }
        if (attemptsRef.current >= 8) {
          setState({ phase: "timeout", paymentStatus: data.payment_status, amount: data.amount_total });
          return;
        }
        timer = setTimeout(poll, 2000);
      } catch (e) {
        if (attemptsRef.current >= 5) {
          setState({ phase: "error", paymentStatus: null, amount: 0 });
          return;
        }
        timer = setTimeout(poll, 2000);
      }
    };
    poll();
    return () => clearTimeout(timer);
  }, [sessionId, clear]);

  return (
    <div data-testid="checkout-success-page" className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-5 py-24 text-center sm:px-8">
      {state.phase === "checking" && (
        <>
          <Loader2 className="h-10 w-10 animate-spin text-black" />
          <h1 className="font-display mt-6 text-5xl uppercase tracking-[0.04em]">Confirming payment</h1>
          <p className="mt-3 text-sm text-neutral-600">Hold on while we verify your order with Stripe…</p>
        </>
      )}

      {state.phase === "paid" && (
        <>
          <CheckCircle2 className="h-12 w-12 text-black" />
          <h1 className="font-display mt-6 text-6xl uppercase tracking-[0.04em] sm:text-7xl">Order confirmed</h1>
          <p className="mt-4 max-w-md text-sm text-neutral-700">
            Thank you. Your prints are on the press. We’ll send a confirmation email shortly.
          </p>
          <div className="mt-3 text-[11px] uppercase tracking-[0.25em] text-neutral-500">
            Total · ${Number(state.amount).toFixed(2)}
          </div>
          <Link
            to="/shop/all"
            data-testid="success-continue-shopping"
            className="mt-10 inline-flex items-center gap-2 bg-black px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-white"
          >
            Continue Shopping
          </Link>
        </>
      )}

      {(state.phase === "failed" || state.phase === "error" || state.phase === "timeout") && (
        <>
          <XCircle className="h-12 w-12 text-black" />
          <h1 className="font-display mt-6 text-6xl uppercase tracking-[0.04em]">
            {state.phase === "timeout" ? "Still processing" : "Something went wrong"}
          </h1>
          <p className="mt-4 max-w-md text-sm text-neutral-700">
            {state.phase === "timeout"
              ? "Your payment is still being processed. You'll receive an email confirmation once it completes."
              : "We couldn't confirm your payment. Please try again or contact support."}
          </p>
          <div className="mt-10 flex gap-3">
            <Link
              to="/cart"
              className="inline-flex items-center gap-2 border border-black px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-black hover:bg-black hover:text-white"
            >
              Back to Cart
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-black px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-white"
            >
              Home
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
