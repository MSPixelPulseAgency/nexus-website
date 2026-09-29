import { ArrowRight, Download, Eye, EyeOff, FileArchive, FileImage, FileText, Lock, LockOpen, ShieldCheck } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { brandDownloads, downloadUrl } from "../data/brand";

const formatIcons = { PDF: FileText, ZIP: FileArchive, SVG: FileImage, PNG: FileImage, JPEG: FileImage };

async function requestJson(url, options = {}) {
  const response = await fetch(url, { credentials: "same-origin", headers: { Accept: "application/json", ...(options.headers || {}) }, ...options });
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) throw new Error("unavailable");
  const data = await response.json();
  return { status: response.status, data };
}

function formatExpiry(timestamp) {
  if (!timestamp) return "";
  return new Date(timestamp * 1000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function BrandAssetAccess() {
  const [status, setStatus] = useState("checking"); // checking | locked | unlocked | unavailable
  const [expiresAt, setExpiresAt] = useState(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const helpId = `${inputId}-help`;
  const inputRef = useRef(null);
  const unlockedRef = useRef(null);

  useEffect(() => {
    let active = true;
    requestJson("/api/brand/session.php")
      .then(({ data }) => {
        if (!active) return;
        if (data.authorized) { setExpiresAt(data.expiresAt); setStatus("unlocked"); }
        else setStatus(data.configured === false ? "unavailable" : "locked");
      })
      .catch(() => active && setStatus("unavailable"));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (status !== "unlocked" || !expiresAt) return undefined;
    const remaining = expiresAt * 1000 - Date.now();
    if (remaining <= 0) { setStatus("locked"); setExpiresAt(null); return undefined; }
    const timer = window.setTimeout(() => { setStatus("locked"); setExpiresAt(null); setError("Your access session has expired. Enter the password again to continue downloading."); }, remaining);
    return () => window.clearTimeout(timer);
  }, [status, expiresAt]);

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!password.trim()) { setError("Enter the access password to continue."); inputRef.current?.focus(); return; }
    setSubmitting(true);
    setError("");
    try {
      const { status: code, data } = await requestJson("/api/brand/unlock.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      if (code === 200 && data.ok) {
        setPassword("");
        setExpiresAt(data.expiresAt);
        setStatus("unlocked");
        window.setTimeout(() => unlockedRef.current?.focus(), 60);
      } else if (code === 503) {
        setStatus("unavailable");
      } else {
        setError(data.message || "That password is not correct. Check it and try again, or contact Nexus for access.");
        window.setTimeout(() => inputRef.current?.focus(), 0);
      }
    } catch {
      setError("We could not reach the download service. Please try again shortly or contact Nexus.");
    } finally {
      setSubmitting(false);
    }
  };

  const onLock = async () => {
    try { await requestJson("/api/brand/logout.php", { method: "POST" }); } catch { /* cookie will expire on its own */ }
    setStatus("locked");
    setExpiresAt(null);
    setError("");
  };

  if (status === "unlocked") {
    return (
      <div className="bk-access is-unlocked">
        <div className="bk-access-status" ref={unlockedRef} tabIndex="-1">
          <span className="bk-access-icon"><LockOpen size={22} aria-hidden="true" /></span>
          <div>
            <strong>Brand assets unlocked</strong>
            <span>Access stays active in this browser until {formatExpiry(expiresAt)}. Files download directly from Nexus.</span>
          </div>
          <button className="btn btn-secondary bk-lock-button" type="button" onClick={onLock}><Lock size={16} aria-hidden="true" /> Lock downloads</button>
        </div>
        <ul className="bk-download-grid" aria-label="Official brand asset downloads">
          {brandDownloads.map((item) => (
            <li className="bk-download-card" key={item.id}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <div className="bk-download-files">
                {item.files.map((file) => {
                  const Icon = formatIcons[file.format] || FileImage;
                  return (
                    <a key={file.key} href={downloadUrl(file.key)} download aria-label={`Download ${item.title} as ${file.format}${file.size ? `, ${file.size}` : ""}`}>
                      <Icon size={17} aria-hidden="true" />
                      <span>{file.format}</span>
                      {file.size && <small>{file.size}</small>}
                      <Download size={15} aria-hidden="true" />
                    </a>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className={`bk-access ${status === "checking" ? "is-checking" : ""}`}>
      <div className="bk-access-intro">
        <span className="bk-access-icon"><Lock size={24} aria-hidden="true" /></span>
        <div>
          <h3>Need to use the Nexus brand?</h3>
          <p id={helpId}>Official brand assets are available to authorized partners, vendors and members of the Nexus team. Enter the access password below, or contact Nexus Education Private School for permission and assistance.</p>
        </div>
      </div>
      {status === "unavailable" ? (
        <div className="form-pending bk-access-pending" role="status">
          <ShieldCheck size={21} aria-hidden="true" />
          <span><strong>Downloads are temporarily unavailable.</strong> The secure download service is not active on this environment yet. Please contact Nexus for the files you need.</span>
        </div>
      ) : (
        <form className="bk-access-form" onSubmit={onSubmit} noValidate>
          <label htmlFor={inputId}>Access password</label>
          <div className="bk-password-field">
            <input
              ref={inputRef}
              id={inputId}
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="off"
              spellCheck="false"
              value={password}
              disabled={status === "checking" || submitting}
              aria-describedby={error ? `${errorId} ${helpId}` : helpId}
              aria-invalid={error ? "true" : undefined}
              onChange={(event) => { setPassword(event.target.value); if (error) setError(""); }}
              placeholder="Enter password"
            />
            <button type="button" className="bk-password-toggle" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} onClick={() => setShowPassword((value) => !value)} disabled={status === "checking"}>
              {showPassword ? <EyeOff size={19} aria-hidden="true" /> : <Eye size={19} aria-hidden="true" />}
            </button>
          </div>
          <p className="bk-access-error" id={errorId} role="alert" aria-live="assertive">{error}</p>
          <div className="bk-access-actions">
            <button className="btn btn-primary" type="submit" disabled={status === "checking" || submitting}>
              {submitting ? "Checking…" : status === "checking" ? "Preparing…" : "Unlock Brand Assets"} <LockOpen size={16} aria-hidden="true" />
            </button>
            <Link className="btn btn-secondary" to="/contact">Contact Nexus <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
        </form>
      )}
      <ul className="bk-access-preview" aria-label="Assets included in the protected package">
        {brandDownloads.map((item) => <li key={item.id}><strong>{item.title}</strong><span>{item.files.map((file) => file.format).join(" / ")}</span></li>)}
      </ul>
    </div>
  );
}
