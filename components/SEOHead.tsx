import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  schema?: object | object[];
  noIndex?: boolean;
}

/**
 * SEOHead – sets document <title>, meta tags, and structured data
 * for each page dynamically (no external library needed).
 *
 * Usage:
 *   <SEOHead
 *     title="Virtual Science Lab Simulations | CSEEL"
 *     description="Explore 200+ virtual lab simulations for CBSE, ICSE students..."
 *     canonical="https://www.cseel.org/simulations"
 *   />
 */
const SEOHead = ({
  title,
  description,
  keywords,
  canonical,
  ogImage = "https://www.cseel.org/images/og-cover.jpg",
  ogType = "website",
  schema,
  noIndex = false,
}: SEOHeadProps) => {
  useEffect(() => {
    // ── Title
    document.title = title;

    // ── Helper: set/create meta tag
    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement("meta");
        const [attrName, attrValue] = selector.replace("meta[", "").replace("]", "").split('="');
        el.setAttribute(attrName, attrValue.replace('"', ""));
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    const setMetaName = (name: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const setMetaProp = (property: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    // ── Primary
    setMetaName("description", description);
    if (keywords) setMetaName("keywords", keywords);
    setMetaName("robots", noIndex ? "noindex, nofollow" : "index, follow, max-snippet:-1, max-image-preview:large");

    // ── Canonical
    if (canonical) {
      let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", canonical);
    }

    // ── Open Graph
    setMetaProp("og:title", title);
    setMetaProp("og:description", description);
    setMetaProp("og:image", ogImage);
    setMetaProp("og:type", ogType);
    if (canonical) setMetaProp("og:url", canonical);

    // ── Twitter
    setMetaName("twitter:title", title);
    setMetaName("twitter:description", description);
    setMetaName("twitter:image", ogImage);

    // ── Structured Data (JSON-LD)
    if (schema) {
      // Remove old page-level schema scripts
      document.querySelectorAll('script[data-page-schema="true"]').forEach((s) => s.remove());
      const schemas = Array.isArray(schema) ? schema : [schema];
      schemas.forEach((s) => {
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.setAttribute("data-page-schema", "true");
        script.textContent = JSON.stringify(s);
        document.head.appendChild(script);
      });
    }

    // ── Cleanup on unmount (restore to defaults)
    return () => {
      document.title = "CSEEL | Center for Scientific Exploration & Experimental Learning India";
    };
  }, [title, description, keywords, canonical, ogImage, ogType, schema, noIndex]);

  return null;
};

export default SEOHead;
