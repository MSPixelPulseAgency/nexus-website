import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, LockKeyhole, RefreshCw } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import Seo from "../components/Seo";
import useCart from "../hooks/useCart";
import { formatTuition } from "../data/tuition";
import "../styles/payments.css";

async function api(endpoint, { signal, body, requestId } = {}) {
  const query = requestId ? `?request=${encodeURIComponent(requestId)}` : "";
  const response = await fetch(`/api/payments/${endpoint}.php${query}`, {
    method: body === undefined ? "GET" : "POST", credentials: "same-origin", cache: "no-store", signal,
    ...(body === undefined ? {} : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.error) throw new Error(data.error || "Online payments are not available. Please contact Nexus.");
  return data;
}

export default function CheckoutPage({ view = "checkout" }) {
  const { search } = useLocation();
  const { items } = useCart();
  const cartMode = view === "checkout" && new URLSearchParams(search).get("cart") === "1";
  const cartCodes = JSON.stringify(items.map((item) => item.code).sort());
  const requestedId = new URLSearchParams(search).get("request");
  const [token] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get("token"));
  const [state, setState] = useState({ loading: true, quote: null, error: "" });
  const [attempt, setAttempt] = useState(0);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    // A payment link is a bearer credential: remove it from the visible URL immediately.
    if (window.location.hash) window.history.replaceState(window.history.state, "", window.location.pathname);
    const controller = new AbortController();
    let timer;
    let polls = 0;
    let authorized = false;
    let expectedId = requestedId;
    const load = async () => {
      try {
        const config = await api("config", { signal: controller.signal });
        if (cartMode) {
          if (!items.length) throw new Error("Your course cart is empty. Choose a course before checkout.");
          if (!config.enabled || !config.cartEnabled) throw new Error("Online checkout is not available yet. Your selections are saved in the course cart. Contact Nexus to arrange the next step.");
          const quote = await api("cart", { signal: controller.signal, body: { codes: JSON.parse(cartCodes) } });
          if (!Array.isArray(quote.items) || !Number.isSafeInteger(quote.amount)) throw new Error("Payment details are unavailable. Please contact Nexus.");
          if (!controller.signal.aborted) setState({ loading: false, quote, error: "" });
          return;
        }
        // Existing authorized sessions can still check receipts during a checkout pause.
        if (token && !authorized) {
          if (!config.enabled) throw new Error("Online payments are not available yet. Please contact Nexus to continue.");
          const access = await api("access", { signal: controller.signal, body: { token } });
          expectedId = access.requestId;
          window.history.replaceState(window.history.state, "", `${window.location.pathname}?request=${encodeURIComponent(expectedId)}`);
          authorized = true;
        }
        const quote = await api("quote", { signal: controller.signal, requestId: expectedId });
        if (!Array.isArray(quote.items) || !Number.isSafeInteger(quote.amount)) throw new Error("Payment details are unavailable. Please contact Nexus.");
        if (controller.signal.aborted) return;
        setState({ loading: false, quote, error: "" });
        if (view === "success" && quote.status === "pending" && polls++ < 10) timer = window.setTimeout(load, 3000);
      } catch (error) {
        if (!controller.signal.aborted) setState({ loading: false, quote: null, error: error.message });
      }
    };
    load();
    return () => { controller.abort(); window.clearTimeout(timer); };
  }, [token, view, attempt, requestedId, cartMode, cartCodes, items.length]);

  const pay = async () => {
    if (paying) return;
    setPaying(true);
    try {
      const { url } = await api("checkout", { body: { requestId: state.quote.requestId } });
      if (typeof url !== "string" || !url.startsWith("https://checkout.stripe.com/")) throw new Error("Checkout could not be opened. Please contact Nexus.");
      window.location.assign(url);
    } catch (error) {
      setState((current) => ({ ...current, error: error.message }));
      setPaying(false);
    }
  };

  const { quote } = state;
  const paid = quote?.status === "paid";
  const closed = ["expired", "failed"].includes(quote?.status) || (quote && (quote.expires * 1000 <= Date.now()
    || (quote.checkoutExpires !== null && quote.checkoutExpires * 1000 <= Date.now() + 60000)));
  const title = paid ? (quote.mode === "test" ? "Test payment confirmed." : "Payment confirmed.") : view === "success" ? "Checking your payment." : view === "cancel" ? "Return to your payment." : "Your Nexus payment.";

  return (
    <>
      <Seo title="Secure Tuition Payment | Nexus Education" description="Review course tuition and continue to Stripe-hosted checkout, or check your payment status." noIndex />
      <section className="page-hero is-compact"><div className="container"><div className="page-hero-copy"><span className="eyebrow"><LockKeyhole size={16} /> NEXUS PAYMENTS</span><h1>{title}</h1><p>Review your course tuition. Course availability and enrollment approval are confirmed separately by the school.</p></div></div></section>
      <section className="section container payment-view">
        <div className="form-card payment-card" aria-busy={state.loading || paying}>
          {state.loading && <p role="status">Loading your payment request…</p>}
          {state.error && <div className="payment-notice" role="alert"><strong>Payment needs attention</strong><p>{state.error}</p><p>Return to your course cart or contact Nexus for assistance. Do not send card details by email.</p></div>}
          {quote && <>
            {quote.mode === "test" && <p className="payment-test"><strong>Test mode</strong> — use test payment details only. No real tuition payment is taken.</p>}
            <h2>{paid ? <><CheckCircle2 size={24} aria-hidden="true" /> {quote.mode === "test" ? "Test payment received" : "Payment received"}</> : "Your tuition summary"}</h2>
            <p>Reference: <strong>{quote.reference}</strong></p>
            <ul className="payment-items">{quote.items.map((item) => <li key={item.code}><span><strong>{item.code}</strong> · {item.label}</span><strong>{formatTuition(item.amount)}</strong></li>)}</ul>
            <div className="payment-total"><span>Total (CAD)</span><strong>{formatTuition(quote.amount)}</strong></div>
            {paid ? <p role="status">{quote.mode === "test" ? "Your sandbox payment is confirmed. No money moved and no student was enrolled." : "Your payment is confirmed. Nexus will confirm the next enrollment steps separately."} Keep your reference for any questions.</p>
              : closed ? <p role="status">This payment request is no longer available. Contact Nexus for assistance before attempting another payment.</p>
              : view === "success" ? <div role="status"><p>We are waiting for secure confirmation. A return to this page does not confirm payment.</p><p>If you completed payment, please keep your reference and check again shortly. Contact Nexus if confirmation is delayed.</p></div>
              : <><p>{view === "cancel" ? "You returned from Checkout. Your course selections are still available. Review this request before continuing." : "Continue to Stripe to enter your card details securely. Eligible wallets appear when supported by your device and Stripe."}</p><button className="btn btn-primary" type="button" onClick={pay} disabled={paying}>{paying ? "Opening secure checkout…" : "Continue to Stripe"}<ArrowRight size={18} /></button></>}
          </>}
          <div className="payment-actions"><button type="button" className="btn btn-outline" disabled={state.loading || paying} onClick={() => { setState((current) => ({ ...current, loading: true, error: "" })); setAttempt((current) => current + 1); }}><RefreshCw size={16} /> Check again</button><Link className="text-link" to="/enroll">Return to registration</Link><Link className="text-link" to="/cart">Return to course cart</Link><Link className="text-link" to="/contact">Contact Nexus</Link></div>
          <p className="payment-footnote">Payment does not automatically enroll a student or grant access to the learning platform.</p>
        </div>
      </section>
    </>
  );
}
