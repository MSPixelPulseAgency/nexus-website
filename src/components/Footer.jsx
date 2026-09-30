import { ArrowUpRight, BriefcaseBusiness, Camera, Mail, MapPin, MessageCircle, MessagesSquare, Phone, Video } from "lucide-react";
import { Link } from "react-router-dom";
import { verifiedSocialLinks } from "../config/socialLinks";
import { brand } from "../data/site";
import { Brand } from "./Header";

const groups = [
  ["Nexus", [["About", "/about"], ["Our Team", "/about/team"], ["Why Nexus", "/why-nexus"], ["Admissions", "/admissions"], ["Contact", "/contact"], ["Brand Guidelines", "/brand-guidelines"]]],
  ["Courses", [["All Courses", "/courses"], ["Grade 9", "/courses/grade-9"], ["Grade 10", "/courses/grade-10"], ["Grade 11", "/courses/grade-11"], ["Grade 12", "/courses/grade-12"], ["Upgrade Courses", "/upgrade-courses"], ["Credit Recovery", "/credit-recovery"]]],
  ["Student Support", [["Academic Planning", "/academic-planning"], ["OSSD", "/ossd"], ["OUAC", "/ouac"], ["OCAS", "/ocas"], ["Adult Education", "/adult-education"], ["Mature Students", "/mature-students"]]],
  ["Resources", [["Official Resource Hub", "/resources"], ["Official Videos", "/student-resources/videos"], ["Online Learning", "/online-learning"], ["Blog", "/blog"], ["Reviews", "/reviews"], ["FAQ", "/faq"], ["Course Cart", "/cart"]]],
];

const socialIcons = { facebook: MessagesSquare, instagram: Camera, linkedin: BriefcaseBusiness, youtube: Video, whatsappNumber: MessageCircle };

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-glow" aria-hidden="true" />
      <div className="container footer-main">
        <div className="footer-about">
          <Brand footer />
          <p>Student-centred elementary learning and Ontario secondary school pathways, built around flexible access and meaningful support.</p>
          <div className="footer-contact"><span><MapPin size={17} /> Toronto, Ontario, Canada</span><a href={`mailto:${brand.email}`}><Mail size={17} /> {brand.email}</a><span className="unverified-contact"><Phone size={17} /> Phone available after verification</span></div>
          {verifiedSocialLinks.length > 0 && <div className="footer-socials">{verifiedSocialLinks.map(({ network, url }) => { const Icon = socialIcons[network]; return <a key={network} href={url} target="_blank" rel="noreferrer" aria-label={`Nexus on ${network}`}><Icon size={20} /></a>; })}</div>}
        </div>
        <div className="footer-links">{groups.map(([heading, links]) => <div key={heading}><h2>{heading}</h2>{links.map(([label, to]) => <Link key={to} to={to}>{label}</Link>)}</div>)}</div>
      </div>
      <div className="container footer-lms"><div><strong>Already enrolled?</strong><span>Continue your learning in the secure Nexus LMS.</span></div><a href={brand.lms} target="_blank" rel="noreferrer">Open LMS <ArrowUpRight size={17} /></a></div>
      <div className="container footer-bottom"><span>© {new Date().getFullYear()} Nexus Education Private School.</span><span className="legal-links"><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><Link to="/accessibility">Accessibility</Link><Link to="/policies">Policies</Link></span><span>Website by <a href="https://mspixelpulse.com" target="_blank" rel="noreferrer">MSPixelPulse Web Solutions</a></span></div>
    </footer>
  );
}
