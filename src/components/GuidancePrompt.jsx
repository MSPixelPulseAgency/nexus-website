import { GraduationCap, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const sessionKey = "nexus-enrollment-prompt-session-closed";
const dismissedUntilKey = "nexus-enrollment-prompt-dismissed-until";
const dismissDays = 14;

export default function GuidancePrompt() {
  const { pathname } = useLocation();
  const isPaymentPage = pathname === "/checkout" || pathname.startsWith("/payment/");
  const [visible, setVisible] = useState(false);
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);

  const finishClose = useCallback(() => {
    setVisible(false);
    window.setTimeout(() => previousFocusRef.current?.focus?.(), 0);
  }, []);

  const closeForSession = useCallback(() => {
    try { window.sessionStorage.setItem(sessionKey, "true"); } catch { /* no-op */ }
    finishClose();
  }, [finishClose]);

  const dismissForTwoWeeks = useCallback(() => {
    try { window.localStorage.setItem(dismissedUntilKey, String(Date.now() + dismissDays * 24 * 60 * 60 * 1000)); } catch { /* no-op */ }
    finishClose();
  }, [finishClose]);

  useEffect(() => {
    if (isPaymentPage) return undefined;
    try {
      const dismissedUntil = Number(window.localStorage.getItem(dismissedUntilKey) || 0);
      if (dismissedUntil > Date.now() || window.sessionStorage.getItem(sessionKey)) return undefined;
    } catch {
      // Storage may be unavailable; the prompt can still be dismissed in memory.
    }
    const timer = window.setTimeout(() => setVisible(true), 10000);
    return () => window.clearTimeout(timer);
  }, [isPaymentPage]);

  useEffect(() => {
    if (!visible || isPaymentPage) return undefined;
    previousFocusRef.current = document.activeElement;
    const closeButton = dialogRef.current?.querySelector("button");
    const focusTimer = window.setTimeout(() => closeButton?.focus(), 30);
    const handleKey = (event) => {
      if (event.key === "Escape") {
        closeForSession();
        return;
      }
      if (event.key !== "Tab") return;
      const controls = [...dialogRef.current.querySelectorAll('a[href], button:not([disabled])')];
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", handleKey);
    return () => { window.clearTimeout(focusTimer); document.removeEventListener("keydown", handleKey); };
  }, [closeForSession, visible, isPaymentPage]);

  if (!visible || isPaymentPage) return null;

  const promptButtonBorder = { border: "2px solid #F98125" };

  return (
    <div className="enrollment-prompt-layer" onMouseDown={(event) => event.target === event.currentTarget && closeForSession()}>
      <aside ref={dialogRef} className="guidance-prompt enrollment-prompt" role="dialog" aria-modal="true" aria-labelledby="enrollment-prompt-title" aria-describedby="enrollment-prompt-description">
        <button className="guidance-prompt-close" type="button" aria-label="Close enrollment reminder for this session" onClick={closeForSession}><X size={18} /></button>
        <span className="guidance-prompt-icon" aria-hidden="true"><GraduationCap size={23} /></span>
        <div><span className="mini-label">YOUR NEXT STEP</span><strong id="enrollment-prompt-title">Ready to Start Learning?</strong><p id="enrollment-prompt-description">Explore course options or begin an enrollment review when you are ready.</p><div><Link className="btn btn-primary" style={{ ...promptButtonBorder, color: "#FFFFFF" }} to="/enroll" onClick={dismissForTwoWeeks}>Enroll Now</Link><button className="btn btn-secondary" style={promptButtonBorder} type="button" onClick={dismissForTwoWeeks}>Got It</button></div></div>
      </aside>
    </div>
  );
}
