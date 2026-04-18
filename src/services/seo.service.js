import axios from "axios";
import * as cheerio from "cheerio";

export async function runSeoChecks(url) {
  const response = await axios.get(url);
  const html = response.data;
  const $ = cheerio.load(html);

  const title = $("title").first().text().trim();
  const metaDescription = $('meta[name="description"]').attr("content") || "";
  const h1s = $("h1");
  const canonical = $('link[rel="canonical"]').attr("href") || "";
  const robots = $('meta[name="robots"]').attr("content") || "";
  const ogTitle = $('meta[property="og:title"]').attr("content") || "";
  const ogDescription = $('meta[property="og:description"]').attr("content") || "";
  const ogImage = $('meta[property="og:image"]').attr("content") || "";
  const viewport = $('meta[name="viewport"]').attr("content") || "";
  const images = $("img");
  const imagesMissingAlt = [];

  images.each((_, img) => {
    const alt = $(img).attr("alt");
    const src = $(img).attr("src");

    if (!alt || !alt.trim()) {
      imagesMissingAlt.push(src || "Unknown image");
    }
  });

  const jsonLdCount = $('script[type="application/ld+json"]').length;

  const checks = [
    {
      key: "title",
      label: "Title tag present",
      passed: !!title,
      details: title || "Missing title tag",
    },
    {
      key: "metaDescription",
      label: "Meta description present",
      passed: !!metaDescription,
      details: metaDescription || "Missing meta description",
    },
    {
      key: "singleH1",
      label: "At least one H1",
      passed: h1s.length >= 1,
      details: `${h1s.length} H1 found`,
    },
    {
      key: "canonical",
      label: "Canonical tag present",
      passed: !!canonical,
      details: canonical || "Missing canonical",
    },
    {
      key: "viewport",
      label: "Viewport meta present",
      passed: !!viewport,
      details: viewport || "Missing viewport tag",
    },
    {
      key: "openGraph",
      label: "Open Graph basics present",
      passed: !!ogTitle && !!ogDescription && !!ogImage,
      details: "Checks og:title, og:description, og:image",
    },
    {
      key: "structuredData",
      label: "Structured data detected",
      passed: jsonLdCount > 0,
      details: `${jsonLdCount} JSON-LD block(s) found`,
    },
    {
      key: "altText",
      label: "Images have alt text",
      passed: imagesMissingAlt.length === 0,
      details:
        imagesMissingAlt.length === 0
          ? "All images checked have alt text"
          : `${imagesMissingAlt.length} image(s) missing alt text`,
    },
  ];

  const passedCount = checks.filter((check) => check.passed).length;
  const score = Math.round((passedCount / checks.length) * 100);

  return {
    score,
    title,
    metaDescription,
    h1Count: h1s.length,
    canonical,
    robots,
    openGraph: {
      ogTitle,
      ogDescription,
      ogImage,
    },
    structuredDataCount: jsonLdCount,
    imagesMissingAlt,
    checks,
  };
}