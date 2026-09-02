import { ArrowRight, CheckCircle2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import FAQAccordion from "../components/FAQAccordion";
import Reveal from "../components/Reveal";
import Seo from "../components/Seo";
import { CTASection, CheckList, SectionHeading } from "../components/UI";
import { pathwayGuides } from "../data/pathwayGuides";
import { brand } from "../data/site";
import NotFoundPage from "./NotFoundPage";

export default function PathwayPage({ slug }) {
  const guide = pathwayGuides[slug];
  if (!guide) return <NotFoundPage />;
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${brand.canonical}/` },
      { "@type": "ListItem", position: 2, name: guide.title.replace(/\.$/, ""), item: `${brand.canonical}${guide.path}` },
    ],
  };

  return (
    <>
      <Seo title={`${guide.title.replace(/\.$/, "")} | Nexus Education`} description={guide.description} image={guide.image} structuredData={breadcrumb} />
      <section className="page-hero page-hero-visual pathway-hero">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><span aria-current="page">{guide.title.replace(/\.$/, "")}</span></nav>
          <div className="page-hero-grid">
            <div className="page-hero-copy"><span className="eyebrow">{guide.eyebrow}</span><h1>{guide.title}</h1><p>{guide.description}</p><div className="button-row"><Link className="btn btn-primary" to="/enroll">Start Enrollment <ArrowRight size={17} /></Link><Link className="btn btn-secondary" to="/courses">Explore Courses</Link></div></div>
            <div className="page-hero-image"><img src={guide.image} alt={guide.imageAlt} width="1400" height="1050" fetchPriority="high" decoding="async" /></div>
          </div>
        </div>
      </section>
      <Reveal as="section" className="section container pathway-overview-grid">
        <div><SectionHeading eyebrow="START HERE" title="Build the Plan From Verified Information." /><CheckList items={guide.highlights} /></div>
        <div className="pathway-source-card"><CheckCircle2 size={28} /><span className="mini-label">IMPORTANT</span><h2>Catalogue does not equal availability.</h2><p>Nexus course records support research. Enrollment, eligibility, delivery and current availability still require confirmation.</p></div>
      </Reveal>
      <Reveal as="section" className="section soft-section"><div className="container"><SectionHeading eyebrow="PLANNING STEPS" title="A Clearer Way to Move Forward." /><div className="guide-step-grid">{guide.sections.map(([title, text], index) => <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><h2>{title}</h2><p>{text}</p></article>)}</div></div></Reveal>
      <Reveal as="section" className="section container pathway-faq-grid"><div><SectionHeading eyebrow="COMMON QUESTIONS" title="Answers With the Right Boundaries." /><FAQAccordion items={guide.faqs} /></div><aside className="official-sources-card"><span className="mini-label">OFFICIAL SOURCES</span><h2>Check current requirements.</h2><p>Use the primary sources below for the latest policy and application information.</p>{guide.sources.map(([label, url]) => <a key={url} href={url} target="_blank" rel="noreferrer">{label}<ExternalLink size={16} /></a>)}</aside></Reveal>
      <CTASection title="Turn Research Into a Course Plan." text="Share the record you have and the outcome you need so Nexus can help clarify the next step." />
    </>
  );
}
