import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, BookOpen, ChevronDown, GraduationCap, Menu, ShoppingCart, X } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import useCart from "../hooks/useCart";
import { brand } from "../data/site";

const menuGroups = [
  {
    label: "About Us",
    paths: ["/about", "/why-nexus", "/blog", "/reviews", "/brand-guidelines"],
    links: [["About Nexus", "/about"], ["Our Team", "/about/team"], ["Why Nexus", "/why-nexus"], ["Nexus Journal", "/blog"], ["Reviews", "/reviews"], ["Brand Guidelines", "/brand-guidelines"]],
  },
  {
    label: "Courses",
    paths: ["/courses", "/credit-recovery", "/upgrade-courses"],
    links: [["All Courses", "/courses"], ["Grade 9", "/courses/grade-9"], ["Grade 10", "/courses/grade-10"], ["Grade 11", "/courses/grade-11"], ["Grade 12", "/courses/grade-12"], ["Upgrade Courses", "/upgrade-courses"], ["Credit Recovery", "/credit-recovery"]],
  },
  {
    label: "Admissions",
    paths: ["/admissions", "/adult-education", "/mature-students", "/enroll", "/register", "/inquiry"],
    links: [["Admissions", "/admissions"], ["Enroll", "/enroll"], ["Adult Education", "/adult-education"], ["Mature Students", "/mature-students"], ["Start an Inquiry", "/inquiry"], ["LMS Login", brand.lms, true]],
  },
  {
    label: "Student Resources",
    desktopLabel: "Resources",
    paths: ["/resources", "/student-support", "/academic-planning", "/ossd", "/ouac", "/ocas", "/online-learning", "/student-resources"],
    links: [["Official Resource Hub", "/resources"], ["Student Support", "/student-support"], ["Academic Planning", "/academic-planning"], ["OSSD", "/ossd"], ["OUAC", "/ouac"], ["Ontario Colleges", "/ocas"], ["Online Learning", "/online-learning"], ["Official Videos", "/student-resources/videos"]],
  },
];

function GroupLink({ label, to, external = false, mobile = false, onClick }) {
  if (external) {
    return <a href={to} target="_blank" rel="noreferrer" onClick={onClick}>{label}{!mobile && <ArrowUpRight size={15} aria-hidden="true" />}</a>;
  }
  const content = <>{label}{!mobile && <span aria-hidden="true">→</span>}</>;
  return mobile ? <NavLink to={to} onClick={onClick}>{content}</NavLink> : <Link to={to}>{content}</Link>;
}

export function Brand({ footer = false }) {
  if (footer) {
    return (
      <Link className="brand brand-logo brand-footer-lockup" to="/" aria-label="Nexus Education Private School home">
        <img
          className="brand-footer-crest"
          src="/brand/nexus-crest-official-transparent.png"
          alt=""
          width="366"
          height="288"
          loading="lazy"
          decoding="async"
        />
        <span className="brand-footer-wordmark" aria-hidden="true">
          <strong>NEXUS EDUCATION</strong>
          <small>PRIVATE SCHOOL</small>
        </span>
      </Link>
    );
  }

  return (
    <Link className="brand brand-logo brand-lockup" to="/" aria-label="Nexus Education Private School home">
      <img
        className="brand-crest"
        src="/brand/nexus-crest-official-transparent.png"
        alt=""
        width="366"
        height="288"
        fetchPriority="high"
      />
      <span className="brand-wordmark" aria-hidden="true"><strong>NEXUS EDUCATION</strong><small>PRIVATE SCHOOL</small></span>
    </Link>
  );
}

function CartLink({ mobile = false, onClick }) {
  const { count } = useCart();
  return <Link className={`cart-link ${mobile ? "is-mobile" : ""}`} to="/cart" onClick={onClick} aria-label={`Course cart with ${count} course${count === 1 ? "" : "s"}`}><ShoppingCart size={mobile ? 22 : 19} /><span className="cart-label">Cart</span><span className="cart-badge" aria-hidden="true">{count}</span></Link>;
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState("");
  const [mobileGroup, setMobileGroup] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const menuButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const closeTimerRef = useRef(null);

  const closeMobile = () => {
    setOpen(false);
    setMobileGroup("");
  };

  useEffect(() => {
    closeMobile();
    setDesktopOpen("");
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    const focusTimer = window.setTimeout(() => closeButtonRef.current?.focus(), 40);
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        closeMobile();
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => () => window.clearTimeout(closeTimerRef.current), []);

  const openDesktopGroup = (label) => {
    window.clearTimeout(closeTimerRef.current);
    setDesktopOpen(label);
  };

  const scheduleDesktopClose = () => {
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => setDesktopOpen(""), 170);
  };

  const activeGroup = (group) => group.paths.some((path) => location.pathname === path || location.pathname.startsWith(`${path}/`));

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <nav className="nav-shell container" aria-label="Primary navigation">
        <div className="mobile-header-grid">
          <button ref={menuButtonRef} className="menu-toggle" type="button" aria-label="Open navigation" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(true)}><Menu size={23} /></button>
          <Brand />
          <CartLink mobile />
        </div>
        <div className="desktop-brand"><Brand /></div>
        <div className="desktop-nav">
          <NavLink end to="/">Home</NavLink>
          {menuGroups.map((group) => {
            const isOpen = desktopOpen === group.label;
            const menuId = `desktop-${group.label.replace(/\s/g, "-").toLowerCase()}`;
            return <div
              className={`nav-dropdown ${activeGroup(group) ? "is-active" : ""}`}
              key={group.label}
              onMouseEnter={() => openDesktopGroup(group.label)}
              onMouseLeave={scheduleDesktopClose}
              onFocusCapture={() => openDesktopGroup(group.label)}
              onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) scheduleDesktopClose(); }}
              onKeyDown={(event) => { if (event.key === "Escape") { setDesktopOpen(""); event.currentTarget.querySelector("button")?.focus(); } }}
            >
              <button type="button" aria-expanded={isOpen} aria-controls={menuId} onClick={() => setDesktopOpen((value) => value === group.label ? "" : group.label)}>{group.desktopLabel || group.label}<ChevronDown size={15} /></button>
              {isOpen && <div className="dropdown-panel" id={menuId}><div className="dropdown-intro"><span className="icon-bubble"><BookOpen size={20} /></span><div><strong>{group.label}</strong><small>Clear links for students and families.</small></div></div>{group.links.map(([label, to, external]) => <GroupLink key={to} label={label} to={to} external={external} />)}</div>}
            </div>;
          })}
          <NavLink to="/contact">Contact</NavLink>
        </div>
        <div className="desktop-nav-actions"><CartLink /><Link className="btn btn-primary nav-cta" to="/enroll">Enroll Now</Link></div>
      </nav>
      <div className={`mobile-menu-overlay ${open ? "is-open" : ""}`} aria-hidden={!open} onMouseDown={(event) => event.target === event.currentTarget && closeMobile()}>
        <div className="mobile-menu-sheet" id="mobile-menu" role="dialog" aria-modal="true" aria-label="Mobile navigation">
          <div className="mobile-menu-head"><Brand /><button ref={closeButtonRef} type="button" aria-label="Close navigation" onClick={() => { closeMobile(); menuButtonRef.current?.focus(); }}><X size={24} /></button></div>
          <div className="mobile-menu-scroll">
            <NavLink end to="/" onClick={closeMobile}>Home</NavLink>
            {menuGroups.map((group) => { const groupOpen = mobileGroup === group.label; return <div className={`mobile-menu-group ${activeGroup(group) ? "is-active" : ""}`} key={group.label}><button type="button" aria-expanded={groupOpen} onClick={() => setMobileGroup((value) => value === group.label ? "" : group.label)}>{group.label}<ChevronDown size={20} /></button><div className={`mobile-menu-subnav ${groupOpen ? "is-open" : ""}`} aria-hidden={!groupOpen}><div>{group.links.map(([label, to, external]) => <GroupLink key={to} label={label} to={to} external={external} mobile onClick={closeMobile} />)}</div></div></div>; })}
            <NavLink to="/contact" onClick={closeMobile}>Contact</NavLink>
          </div>
          <div className="mobile-menu-actions"><Link className="btn btn-primary" to="/enroll" onClick={closeMobile}><GraduationCap size={17} /> Enroll Now</Link></div>
        </div>
      </div>
    </header>
  );
}
