// Central brand-system data for the Brand Guidelines page. Colour values match the
// master brand kit (Nexus-Brand-Kit-Claude) and the CSS tokens in src/styles/brand-theme.css.

const rgb = (hex) => hex.match(/[0-9a-f]{2}/gi).map((v) => parseInt(v, 16));
const cmyk = (hex) => {
  const [r, g, b] = rgb(hex).map((v) => v / 255);
  const k = 1 - Math.max(r, g, b);
  if (k === 1) return [0, 0, 0, 100];
  const f = (v) => Math.round(((1 - v - k) / (1 - k)) * 100);
  return [f(r), f(g), f(b), Math.round(k * 100)];
};

const colour = (name, hex, role, usage, light = false) => ({ name, hex, rgb: rgb(hex).join(", "), cmyk: cmyk(hex).join(" / "), role, usage, light });

export const brandColours = {
  primary: [
    colour("Crest Blue", "#111984", "Logo", "The graduate, cap and NEXUS EDUCATION wordmark. Reserved for the logo and formal crest applications."),
    colour("Crest Gold", "#C59728", "Logo", "The laurel wreath and PRIVATE SCHOOL descriptor. Use only as supplied inside the logo artwork."),
    colour("Nexus Navy", "#09264A", "Core", "Headings, dark panels, footer and the dark-background logo treatment."),
    colour("Nexus Blue", "#2081F9", "Core", "Primary actions, links, highlights and the blue background treatment."),
    colour("Nexus Orange", "#F99820", "Accent", "Accents, eyebrow labels, focus rings and warm highlights. Never for body text."),
  ],
  supporting: [
    colour("White", "#FFFFFF", "Neutral", "Default page background and reversed logo colour.", true),
    colour("Cream", "#FFF7ED", "Neutral", "Warm soft surfaces, callouts and the cream logo background.", true),
    colour("Ice", "#F3F8FD", "Neutral", "Cool soft surfaces, cards and subtle section backgrounds.", true),
    colour("Neutral Gray", "#BBBBBB", "Neutral", "Dividers, disabled states and the grayscale logo wreath.", true),
    colour("Ink", "#1C2B3B", "Text", "Body copy on light backgrounds."),
  ],
};

export const typeScale = [
  { label: "Display", sample: "Future-ready learning.", css: { fontSize: "clamp(2.2rem, 5vw, 3.6rem)", fontWeight: 800, lineHeight: 1.06, letterSpacing: "-0.03em" }, spec: "Manrope ExtraBold 800 · 56–64px · line-height 1.06" },
  { label: "Heading 2", sample: "Ontario credit courses, planned clearly.", css: { fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 800, lineHeight: 1.12, letterSpacing: "-0.025em" }, spec: "Manrope ExtraBold 800 · 36–40px · line-height 1.12" },
  { label: "Heading 3", sample: "Student support that answers the real question.", css: { fontSize: "1.25rem", fontWeight: 700, lineHeight: 1.3 }, spec: "Manrope Bold 700 · 20–22px · line-height 1.3" },
  { label: "Body", sample: "Nexus Education Private School combines student-centred elementary learning with Ontario secondary school credit courses, academic pathways and meaningful support.", css: { fontSize: "1.02rem", fontWeight: 500, lineHeight: 1.7 }, spec: "Manrope Medium 500 · 16–17px · line-height 1.65–1.72" },
  { label: "Label", sample: "ADMISSIONS · STUDENT SUPPORT · RESOURCES", css: { fontSize: "0.76rem", fontWeight: 800, letterSpacing: "0.09em", textTransform: "uppercase" }, spec: "Manrope ExtraBold 800 · 12px · tracking +9%" },
];

export const logoVariants = [
  { id: "primary", title: "Primary logo", note: "Full colour, stacked. The default choice for white and light backgrounds.", src: "/brand/guidelines/nexus-logo-primary.svg", alt: "Nexus Education Private School primary logo in crest blue and gold", surface: "light" },
  { id: "horizontal", title: "Horizontal logo", note: "Crest beside the wordmark for headers, letterheads and wide formats.", src: "/brand/guidelines/nexus-logo-horizontal.svg", alt: "Nexus Education Private School horizontal logo", surface: "light", wide: true },
  { id: "dark", title: "Dark background", note: "White graduate and wordmark with the gold wreath, for navy and deep-blue surfaces.", src: "/brand/guidelines/nexus-logo-dark-background.svg", alt: "Nexus Education Private School logo in white and gold on navy", surface: "navy" },
  { id: "white", title: "White / reversed", note: "Single-colour white for photography, bright blue and other saturated backgrounds.", src: "/brand/guidelines/nexus-logo-white.svg", alt: "Nexus Education Private School logo in solid white on blue", surface: "blue" },
  { id: "black", title: "Black", note: "One-colour black for forms, stamps, faxes and single-colour print.", src: "/brand/guidelines/nexus-logo-black.svg", alt: "Nexus Education Private School logo in solid black", surface: "light" },
  { id: "grayscale", title: "Grayscale", note: "Two-tone gray that keeps the crest hierarchy when colour is unavailable.", src: "/brand/guidelines/nexus-logo-grayscale.svg", alt: "Nexus Education Private School logo in two-tone gray", surface: "light" },
  { id: "mark", title: "Logo mark", note: "The crest alone for icons, avatars, favicons and small square spaces.", src: "/brand/guidelines/nexus-logo-mark.svg", alt: "Nexus Education Private School crest logo mark", surface: "cream", mark: true },
];

export const minimumSizes = [
  ["Primary (stacked) logo", "120 px wide", "30 mm wide"],
  ["Horizontal logo", "160 px wide", "40 mm wide"],
  ["Logo mark", "24 px wide", "8 mm wide"],
];

export const logoDos = [
  "Use the supplied SVG, PNG or JPEG files without redrawing any element.",
  "Keep the crest and wordmark in their approved relationship and proportions.",
  "Choose the variant that gives the strongest contrast on the background.",
  "Respect the clear space and minimum sizes on every application.",
  "Place the logo on white, cream, navy, Nexus blue or a calm, darkened photograph.",
];

export const logoDonts = [
  { id: "stretch", label: "Don't stretch or squash", style: { transform: "scaleX(1.35)" } },
  { id: "rotate", label: "Don't rotate or tilt", style: { transform: "rotate(-12deg)" } },
  { id: "recolour", label: "Don't recolour", style: { filter: "hue-rotate(120deg) saturate(1.6)" } },
  { id: "effects", label: "Don't add shadows or effects", style: { filter: "drop-shadow(6px 8px 4px rgba(0,0,0,0.55))" } },
  { id: "contrast", label: "Don't use low-contrast backgrounds", surface: "busy" },
  { id: "crop", label: "Don't crop or rearrange", style: { clipPath: "inset(0 0 42% 0)", transform: "scale(1.25) translateY(14%)" } },
];

export const backgroundRules = [
  { id: "white", title: "White and light neutrals", text: "Primary full-colour logo.", surface: "light", src: "/brand/guidelines/nexus-logo-primary.svg", alt: "Primary logo on white" },
  { id: "cream", title: "Cream and warm tints", text: "Primary full-colour logo.", surface: "cream", src: "/brand/guidelines/nexus-logo-primary.svg", alt: "Primary logo on cream" },
  { id: "navy", title: "Navy and deep blues", text: "Dark-background version (white and gold).", surface: "navy", src: "/brand/guidelines/nexus-logo-dark-background.svg", alt: "White and gold logo on navy" },
  { id: "blue", title: "Nexus blue and photography", text: "Solid white reversed logo.", surface: "blue", src: "/brand/guidelines/nexus-logo-white.svg", alt: "White logo on Nexus blue" },
];

export const brandDownloads = [
  { id: "guidelines", title: "Brand Guidelines", description: "The complete designed guideline document: logo system, colour, typography, usage and file guidance.", files: [{ key: "brand-guidelines-pdf", format: "PDF", size: "2.8 MB" }] },
  { id: "package", title: "Complete Brand Package", description: "Every logo variant in SVG, PNG and JPEG, plus web icons, the guidelines PDF and the quick reference.", files: [{ key: "brand-package-zip", format: "ZIP", size: "13.0 MB" }] },
  { id: "primary", title: "Primary Logo", description: "Stacked full-colour lockup. Transparent PNG at 2400 px and JPEG on white.", files: [{ key: "logo-primary-svg", format: "SVG", size: "63 KB" }, { key: "logo-primary-png", format: "PNG", size: "226 KB" }, { key: "logo-primary-jpg", format: "JPEG", size: "331 KB" }] },
  { id: "horizontal", title: "Horizontal Logo", description: "Crest beside the wordmark for headers, documents and wide layouts.", files: [{ key: "logo-horizontal-svg", format: "SVG", size: "62 KB" }, { key: "logo-horizontal-png", format: "PNG", size: "124 KB" }] },
  { id: "dark", title: "Dark Background Logo", description: "White graduate and wordmark with the gold wreath for navy and deep-blue surfaces.", files: [{ key: "logo-dark-background-svg", format: "SVG", size: "63 KB" }, { key: "logo-dark-background-png", format: "PNG", size: "199 KB" }] },
  { id: "white", title: "White / Reversed Logo", description: "Single-colour white for saturated colour and photographic backgrounds.", files: [{ key: "logo-white-svg", format: "SVG", size: "63 KB" }, { key: "logo-white-png", format: "PNG", size: "166 KB" }] },
  { id: "mono", title: "Black and Grayscale Logos", description: "One-colour and two-tone gray versions for forms, stamps and single-colour print.", files: [{ key: "logo-black-svg", format: "SVG", size: "63 KB" }, { key: "logo-black-png", format: "PNG", size: "148 KB" }, { key: "logo-grayscale-svg", format: "SVG", size: "63 KB" }] },
  { id: "mark", title: "Logo Mark", description: "The crest alone, in full colour and white, for icons, avatars and compact spaces.", files: [{ key: "logo-mark-svg", format: "SVG", size: "26 KB" }, { key: "logo-mark-png", format: "PNG", size: "233 KB" }, { key: "logo-mark-white-svg", format: "SVG", size: "26 KB" }] },
  { id: "icons", title: "Web & App Icons", description: "Favicon SVG and ICO, PNG favicons from 16 to 512 px, Apple touch icon and maskable app icon.", files: [{ key: "web-icons-zip", format: "ZIP", size: "281 KB" }] },
  { id: "quick", title: "Quick Reference", description: "One-page summary of logos, colours, typography, clear space and the key rules.", files: [{ key: "quick-reference-png", format: "PNG", size: "1004 KB" }] },
];

export const downloadUrl = (key) => `/api/brand/download.php?file=${encodeURIComponent(key)}`;
