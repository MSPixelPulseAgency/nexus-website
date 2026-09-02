import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { brand, staticMeta } from "../data/site";

function setMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
}

function removeMeta(selector) {
  document.head.querySelector(selector)?.remove();
}

export default function Seo({ title, description, image, structuredData }) {
  const { pathname } = useLocation();
  const fallback = staticMeta[pathname] || staticMeta["/"];
  const resolvedTitle = title || fallback[0];
  const resolvedDescription = description || fallback[1];
  const canonicalUrl = `${brand.canonical}${pathname === "/" ? "/" : pathname}`;
  const socialImage = image || brand.socialImage;
  const usesDefaultSocialImage = socialImage === brand.socialImage;
  const socialImageAlt = `${resolvedTitle} — ${brand.name}`;

  useEffect(() => {
    document.title = resolvedTitle;
    setMeta('meta[name="description"]', { name: "description", content: resolvedDescription });
    setMeta('meta[property="og:title"]', { property: "og:title", content: resolvedTitle });
    setMeta('meta[property="og:description"]', { property: "og:description", content: resolvedDescription });
    setMeta('meta[property="og:site_name"]', { property: "og:site_name", content: brand.name });
    setMeta('meta[property="og:locale"]', { property: "og:locale", content: "en_CA" });
    setMeta('meta[property="og:type"]', { property: "og:type", content: "website" });
    setMeta('meta[property="og:url"]', { property: "og:url", content: canonicalUrl });
    setMeta('meta[property="og:image"]', { property: "og:image", content: socialImage });
    setMeta('meta[property="og:image:secure_url"]', { property: "og:image:secure_url", content: socialImage });
    setMeta('meta[property="og:image:alt"]', { property: "og:image:alt", content: socialImageAlt });
    if (usesDefaultSocialImage) {
      setMeta('meta[property="og:image:width"]', { property: "og:image:width", content: "1200" });
      setMeta('meta[property="og:image:height"]', { property: "og:image:height", content: "630" });
      setMeta('meta[property="og:image:type"]', { property: "og:image:type", content: "image/png" });
    } else {
      removeMeta('meta[property="og:image:width"]');
      removeMeta('meta[property="og:image:height"]');
      removeMeta('meta[property="og:image:type"]');
    }
    setMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    setMeta('meta[name="twitter:title"]', { name: "twitter:title", content: resolvedTitle });
    setMeta('meta[name="twitter:description"]', { name: "twitter:description", content: resolvedDescription });
    setMeta('meta[name="twitter:image"]', { name: "twitter:image", content: socialImage });
    setMeta('meta[name="twitter:image:alt"]', { name: "twitter:image:alt", content: socialImageAlt });
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
    document.head.querySelectorAll('script[data-nexus-schema="true"]').forEach((script) => script.remove());
    const schemas = Array.isArray(structuredData) ? structuredData : structuredData ? [structuredData] : [];
    schemas.forEach((schema) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.nexusSchema = "true";
      script.textContent = JSON.stringify(schema).replace(/</g, "\\u003c");
      document.head.appendChild(script);
    });
    return () => document.head.querySelectorAll('script[data-nexus-schema="true"]').forEach((script) => script.remove());
  }, [canonicalUrl, resolvedDescription, resolvedTitle, socialImage, socialImageAlt, structuredData, usesDefaultSocialImage]);
  return null;
}
