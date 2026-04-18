import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export async function runPageSpeedAudit(url, strategy = "mobile") {
  const endpoint = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

  const response = await axios.get(endpoint, {
    params: {
      url,
      strategy,
      key: process.env.PAGESPEED_API_KEY,
      category: "performance",
    },
    paramsSerializer: (params) => {
      const searchParams = new URLSearchParams();
      searchParams.append("url", params.url);
      searchParams.append("strategy", params.strategy);
      searchParams.append("key", params.key);
      searchParams.append("category", "performance");
      searchParams.append("category", "accessibility");
      searchParams.append("category", "best-practices");
      searchParams.append("category", "seo");
      return searchParams.toString();
    },
  });

  const data = response.data;
  const lighthouse = data.lighthouseResult;
  const categories = lighthouse?.categories || {};
  const audits = lighthouse?.audits || {};

  return {
    strategy,
    performanceScore: Math.round((categories.performance?.score || 0) * 100),
    accessibilityScore: Math.round((categories.accessibility?.score || 0) * 100),
    bestPracticesScore: Math.round((categories["best-practices"]?.score || 0) * 100),
    seoScore: Math.round((categories.seo?.score || 0) * 100),
    metrics: {
      firstContentfulPaint: audits["first-contentful-paint"]?.displayValue || null,
      largestContentfulPaint: audits["largest-contentful-paint"]?.displayValue || null,
      cumulativeLayoutShift: audits["cumulative-layout-shift"]?.displayValue || null,
      speedIndex: audits["speed-index"]?.displayValue || null,
      interactive: audits["interactive"]?.displayValue || null,
      totalBlockingTime: audits["total-blocking-time"]?.displayValue || null,
    },
    opportunities: Object.values(audits)
      .filter((item) => item.details?.type === "opportunity")
      .slice(0, 5)
      .map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        displayValue: item.displayValue || null,
      })),
  };
}