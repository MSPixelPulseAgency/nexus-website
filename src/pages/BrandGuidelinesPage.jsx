import { ArrowRight, Award, Check, Download, Globe, Mail, Palette, Printer, ShieldCheck, Type, X } from "lucide-react";
import { Link } from "react-router-dom";
import BrandAssetAccess from "../components/BrandAssetAccess";
import Reveal from "../components/Reveal";
import Seo from "../components/Seo";
import { SectionHeading } from "../components/UI";
import { backgroundRules, brandColours, logoDonts, logoDos, logoVariants, minimumSizes, typeScale } from "../data/brand";
import { brand, images } from "../data/site";

const identityPillars = [
  [Award, "The crest", "A graduate with raised arms, a mortarboard and a laurel wreath: achievement, confidence and growth held together in one mark."],
  [Type, "The wordmark", "NEXUS EDUCATION in confident capitals with PRIVATE SCHOOL set beneath it in tracked Montserrat gold. The letterforms are locked artwork and are never retyped."],
  [Palette, "The palette", "Crest blue and crest gold belong to the logo. Nexus navy, blue and orange carry the wider identity across the website and communications."],
];

const anatomy = [["01", "Crest", "Graduate, cap and wreath"], ["02", "Wordmark", "NEXUS EDUCATION"], ["03", "Descriptor", "PRIVATE SCHOOL"]];

function Swatch({ item }) {
  return (
    <li className={`bk-swatch ${item.light ? "is-light" : ""}`}>
      <div className="bk-swatch-chip" style={{ background: item.hex }} aria-hidden="true"><span>{item.role}</span></div>
      <div className="bk-swatch-body">
        <h3>{item.name}</h3>
        <dl>
          <div><dt>HEX</dt><dd>{item.hex}</dd></div>
          <div><dt>RGB</dt><dd>{item.rgb}</dd></div>
          <div><dt>CMYK</dt><dd>{item.cmyk}</dd></div>
        </dl>
        <p>{item.usage}</p>
      </div>
    </li>
  );
}

export default function BrandGuidelinesPage() {
  const structuredData = [
    { "@context": "https://schema.org", "@type": "WebPage", name: "Nexus Education Private School Brand Guidelines", url: `${brand.canonical}/brand-guidelines`, description: "Visual identity guidelines for Nexus Education Private School: logo system, colour palette, typography and usage rules." },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${brand.canonical}/` }, { "@type": "ListItem", position: 2, name: "Brand Guidelines", item: `${brand.canonical}/brand-guidelines` }] },
  ];

  return (
    <>
      <Seo structuredData={structuredData} />
      <section className="page-hero bk-hero">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Breadcrumb"><ol><li><Link to="/">Home</Link></li><li><span aria-hidden="true">/</span><span aria-current="page">Brand Guidelines</span></li></ol></nav>
          <div className="page-hero-grid bk-hero-grid">
            <div className="page-hero-copy">
              <span className="eyebrow">Brand Guidelines</span>
              <h1>The Nexus Visual Identity.</h1>
              <p>How the Nexus Education Private School logo, colours and typography work together, and how to use them correctly across digital, print and social applications.</p>
              <div className="button-row">
                <a className="btn btn-primary" href="#brand-downloads">Download Brand Assets <Download size={17} aria-hidden="true" /></a>
                <Link className="btn btn-secondary" to="/contact">Contact Nexus <ArrowRight size={17} aria-hidden="true" /></Link>
              </div>
            </div>
            <div className="bk-hero-logo">
              <img src="/brand/guidelines/nexus-logo-primary.svg" alt="Nexus Education Private School primary logo" width="1000" height="589" fetchPriority="high" decoding="async" />
            </div>
          </div>
        </div>
      </section>

      <Reveal as="section" className="section container bk-section">
        <SectionHeading eyebrow="Brand identity" title="Clear, student-focused and future-ready." text="The Nexus identity is built from one crest, one wordmark and a small, disciplined palette. Every application should feel calm, confident and academic." />
        <div className="feature-grid bk-pillars">{identityPillars.map(([Icon, title, text]) => <article className="feature-card" key={title}><span className="icon-bubble"><Icon size={21} aria-hidden="true" /></span><h3>{title}</h3><p>{text}</p></article>)}</div>
      </Reveal>

      <Reveal as="section" className="section soft-section bk-section">
        <div className="container">
          <SectionHeading eyebrow="Primary logo" title="One logo, presented consistently." text="The stacked primary logo is the default expression of the brand. Use it whenever there is room for the full lockup." />
          <div className="bk-primary-grid">
            <figure className="bk-stage is-light"><img src="/brand/guidelines/nexus-logo-primary.svg" alt="Primary logo on white" width="1000" height="589" loading="lazy" decoding="async" /><figcaption>Primary logo on white</figcaption></figure>
            <figure className="bk-stage is-navy"><img src="/brand/guidelines/nexus-logo-dark-background.svg" alt="Dark-background logo on navy" width="1000" height="589" loading="lazy" decoding="async" /><figcaption>Dark-background logo on navy</figcaption></figure>
          </div>
          <ol className="bk-anatomy" aria-label="Logo anatomy">{anatomy.map(([number, title, text]) => <li key={number}><span className="section-number">{number}</span><strong>{title}</strong><small>{text}</small></li>)}</ol>
        </div>
      </Reveal>

      <Reveal as="section" className="section container bk-section">
        <SectionHeading eyebrow="Logo variations" title="Approved versions for every surface." text="Each variant exists for a reason. Choose by background and reproduction method, never by preference." />
        <ul className="bk-variant-grid">{logoVariants.map((variant) => <li className={`bk-variant surface-${variant.surface} ${variant.wide ? "is-wide" : ""} ${variant.mark ? "is-mark" : ""}`} key={variant.id}><div className="bk-variant-stage"><img src={variant.src} alt={variant.alt} loading="lazy" decoding="async" /></div><div className="bk-variant-copy"><h3>{variant.title}</h3><p>{variant.note}</p></div></li>)}</ul>
      </Reveal>

      <Reveal as="section" className="section soft-section bk-section">
        <div className="container">
          <SectionHeading eyebrow="Logo usage" title="Clear space, minimum size and the rules that protect the mark." />
          <div className="bk-usage-grid">
            <article className="bk-usage-card">
              <h3>Clear space</h3>
              <p>Keep a margin of at least <strong>X</strong> on every side, where X equals the height of the crest's graduation cap, about 10% of the logo width. Nothing else may enter this zone.</p>
              <div className="bk-clearspace" aria-hidden="true">
                <div className="bk-clearspace-inner"><img src="/brand/guidelines/nexus-logo-primary.svg" alt="" width="1000" height="589" loading="lazy" decoding="async" /></div>
                <span className="bk-clearspace-x top">X</span><span className="bk-clearspace-x bottom">X</span><span className="bk-clearspace-x left">X</span><span className="bk-clearspace-x right">X</span>
              </div>
            </article>
            <article className="bk-usage-card">
              <h3>Minimum size</h3>
              <p>Below these sizes the wreath loses definition and the descriptor becomes unreadable.</p>
              <table className="bk-size-table"><thead><tr><th scope="col">Version</th><th scope="col">Digital</th><th scope="col">Print</th></tr></thead><tbody>{minimumSizes.map(([name, digital, print]) => <tr key={name}><th scope="row">{name}</th><td>{digital}</td><td>{print}</td></tr>)}</tbody></table>
              <div className="bk-minsize-demo" aria-hidden="true"><img className="bk-min-full" src="/brand/guidelines/nexus-logo-primary.svg" alt="" width="120" height="71" loading="lazy" decoding="async" /><span>120 px</span><img className="bk-min-mark" src="/brand/guidelines/nexus-logo-mark.svg" alt="" width="24" height="18" loading="lazy" decoding="async" /><span>24 px</span></div>
            </article>
          </div>
          <div className="bk-rules-grid">
            <article className="bk-usage-card bk-do"><h3><Check size={20} aria-hidden="true" /> Correct usage</h3><ul className="check-list">{logoDos.map((rule) => <li key={rule}><Check size={17} aria-hidden="true" /><span>{rule}</span></li>)}</ul></article>
            <article className="bk-usage-card bk-dont">
              <h3><X size={20} aria-hidden="true" /> Incorrect usage</h3>
              <ul className="bk-dont-grid">{logoDonts.map((rule) => <li key={rule.id}><div className={`bk-dont-stage ${rule.surface ? `surface-${rule.surface}` : ""}`}><img src="/brand/guidelines/nexus-logo-primary.svg" alt="" style={rule.style} loading="lazy" decoding="async" /><span className="bk-dont-mark" aria-hidden="true"><X size={14} /></span></div><span>{rule.label}</span></li>)}</ul>
            </article>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="section container bk-section">
        <SectionHeading eyebrow="Colour palette" title="Two logo colours, three core colours, quiet neutrals." text="Crest blue and crest gold are reserved for the logo. The website and communications lead with Nexus navy, blue and orange on white." />
        <h3 className="bk-subheading">Primary palette</h3>
        <ul className="bk-swatch-grid">{brandColours.primary.map((item) => <Swatch item={item} key={item.hex} />)}</ul>
        <h3 className="bk-subheading">Supporting palette</h3>
        <ul className="bk-swatch-grid">{brandColours.supporting.map((item) => <Swatch item={item} key={item.hex} />)}</ul>
        <p className="small-note bk-note">CMYK values are approximations for standard coated stock. Confirm with a printed proof before large runs.</p>
      </Reveal>

      <Reveal as="section" className="section soft-section bk-section">
        <div className="container">
          <SectionHeading eyebrow="Typography" title="Manrope carries the voice of the brand." text="Manrope is used for every heading, paragraph and interface label. Weights are limited to Medium, Bold and ExtraBold so the hierarchy stays clean." />
          <div className="bk-type-grid">
            <article className="bk-type-card">
              <span className="mini-label">Type hierarchy</span>
              <ul className="bk-type-scale">{typeScale.map((row) => <li key={row.label}><span className="bk-type-label">{row.label}</span><p style={row.css}>{row.sample}</p><small>{row.spec}</small></li>)}</ul>
            </article>
            <aside className="bk-type-side">
              <div className="bk-type-specimen" aria-hidden="true"><span>Aa</span><small>Manrope</small></div>
              <h3>Type rules</h3>
              <ul className="check-list">
                <li><Check size={17} aria-hidden="true" /><span>Headings: Manrope ExtraBold, tight letter spacing (−2% to −3%), navy.</span></li>
                <li><Check size={17} aria-hidden="true" /><span>Body: Manrope Medium, 16–17 px, line-height 1.65–1.72, ink or muted gray.</span></li>
                <li><Check size={17} aria-hidden="true" /><span>Labels: ExtraBold, uppercase, +9% tracking, used sparingly.</span></li>
                <li><Check size={17} aria-hidden="true" /><span>Logo letterforms are artwork. Never recreate the wordmark with live text.</span></li>
              </ul>
            </aside>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="section container bk-section">
        <SectionHeading eyebrow="Background usage" title="Match the logo version to the background." text="Contrast decides which version to use. When in doubt, choose the primary logo on white or the white logo on navy." />
        <ul className="bk-background-grid">{backgroundRules.map((rule) => <li className={`bk-background surface-${rule.id}`} key={rule.id}><div className="bk-background-stage"><img src={rule.src} alt={rule.alt} loading="lazy" decoding="async" /></div><h3>{rule.title}</h3><p>{rule.text}</p></li>)}
          <li className="bk-background surface-photo"><div className="bk-background-stage" style={{ backgroundImage: `url(${images.campus})` }}><img src="/brand/guidelines/nexus-logo-white.svg" alt="White logo over a darkened photograph" loading="lazy" decoding="async" /></div><h3>Photography</h3><p>White logo over a calm, darkened area of the image.</p></li>
        </ul>
      </Reveal>

      <Reveal as="section" className="section soft-section bk-section">
        <div className="container">
          <SectionHeading eyebrow="Digital and print" title="The right file for the job." />
          <div className="bk-format-grid">
            <article className="bk-format-card"><span className="icon-bubble"><Globe size={21} aria-hidden="true" /></span><h3>Digital and web</h3><ul className="check-list"><li><Check size={17} aria-hidden="true" /><span>Use SVG wherever possible; it stays sharp at every size.</span></li><li><Check size={17} aria-hidden="true" /><span>Use transparent PNG when SVG is not supported, at 2× the displayed size.</span></li><li><Check size={17} aria-hidden="true" /><span>Use the supplied favicon, Apple touch icon and maskable app icon for browsers and devices.</span></li><li><Check size={17} aria-hidden="true" /><span>Social avatars use the logo mark; cover images use the horizontal or white logo.</span></li></ul></article>
            <article className="bk-format-card"><span className="icon-bubble"><Printer size={21} aria-hidden="true" /></span><h3>Print</h3><ul className="check-list"><li><Check size={17} aria-hidden="true" /><span>Supply SVG or the PDF guideline artwork to printers; never a screenshot.</span></li><li><Check size={17} aria-hidden="true" /><span>Full-colour print uses the CMYK approximations; single-colour print uses the black logo.</span></li><li><Check size={17} aria-hidden="true" /><span>Keep the primary logo at least 30 mm wide and the mark at least 8 mm wide.</span></li><li><Check size={17} aria-hidden="true" /><span>JPEG files are for solid-background placements only.</span></li></ul></article>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="section container bk-section" id="brand-downloads">
        <SectionHeading eyebrow="Download brand assets" title="Official files, protected for authorized use." text="Brand assets are provided to partners, vendors and team members who have permission to represent Nexus. Downloads are delivered securely once the access password is confirmed." />
        <BrandAssetAccess />
      </Reveal>

      <Reveal as="section" className="section soft-section bk-section">
        <div className="container bk-permission">
          <ShieldCheck size={28} aria-hidden="true" />
          <div>
            <SectionHeading eyebrow="Permission and contact" title="Using the Nexus brand." text="The Nexus Education Private School name, crest and wordmark are protected brand assets. They may be used only with appropriate authorization and in line with these guidelines. If you need permission, a different format or help with an application, contact Nexus and describe how the brand will appear." />
            <div className="button-row"><Link className="btn btn-primary" to="/contact">Contact Nexus <ArrowRight size={17} aria-hidden="true" /></Link><a className="btn btn-secondary" href={`mailto:${brand.email}?subject=Nexus%20brand%20asset%20request`}><Mail size={17} aria-hidden="true" /> {brand.email}</a></div>
          </div>
        </div>
      </Reveal>
    </>
  );
}
