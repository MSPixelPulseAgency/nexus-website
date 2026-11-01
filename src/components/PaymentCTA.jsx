import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function PaymentCTA({ className = "btn btn-secondary" }) {
  const [availability, setAvailability] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      controller.abort();
      setAvailability({ enabled: false });
    }, 8000);
    fetch("/api/payments/config.php", { credentials: "same-origin", cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const config = await response.json();
        if (!response.ok || config.error) throw new Error("Unavailable");
        const ready = config.enabled === true && config.cartEnabled === true && ["test", "live"].includes(config.mode);
        if (!controller.signal.aborted) setAvailability(ready ? config : { enabled: false });
      })
      .catch(() => { if (!controller.signal.aborted) setAvailability({ enabled: false }); })
      .finally(() => window.clearTimeout(timeout));
    return () => { window.clearTimeout(timeout); controller.abort(); };
  }, []);

  if (!availability) return <button className={className} type="button" disabled aria-busy="true">Checking payment availability…</button>;
  if (!availability.enabled || !availability.cartEnabled) return <div className="payment-availability" role="status"><p>Online payments are not available yet. Your selected courses remain in your cart.</p><Link className="text-link" to="/contact">Contact Nexus about payment <ArrowRight size={16} /></Link></div>;
  return <Link className={className} to="/checkout?cart=1">{availability.mode === "test" ? "Try Sandbox Payment" : "Continue to Secure Payment"}<ArrowRight size={17} /></Link>;
}
