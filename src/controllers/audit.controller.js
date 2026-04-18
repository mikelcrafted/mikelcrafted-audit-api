import { z } from "zod";
import { runPageSpeedAudit } from "../services/pagespeed.service.js";
import { runSeoChecks } from "../services/seo.service.js";
import { runAccessibilityChecks } from "../services/accessibility.service.js";
import { buildScores } from "../utils/scoring.js";

const auditSchema = z.object({
  url: z.string().url(),
});

export async function runAudit(req, res) {
  try {
    console.log("Incoming audit request body:", req.body);

    const parsed = auditSchema.safeParse(req.body);

    if (!parsed.success) {
      console.log("Invalid URL received:", req.body);
      return res.status(400).json({
        error: "Please enter a valid URL.",
      });
    }

    const { url } = parsed.data;
    console.log("Normalized URL:", url);

    console.log("Running PageSpeed mobile...");
    const mobileData = await runPageSpeedAudit(url, "mobile");

    console.log("Running PageSpeed desktop...");
    const desktopData = await runPageSpeedAudit(url, "desktop");

    console.log("Running SEO checks...");
    const seoData = await runSeoChecks(url);

    console.log("Running accessibility checks...");
    const accessibilityData = await runAccessibilityChecks(url);

    console.log("Building scores...");
    const scores = buildScores({
      mobileData,
      desktopData,
      seoData,
      accessibilityData,
    });

    console.log("Audit completed successfully.");

    return res.json({
      brand: "MikeL Crafted",
      tool: "AI Website Audit Tool",
      url,
      createdAt: new Date().toISOString(),
      preview: accessibilityData.screenshot || null,
      thumbnail: accessibilityData.thumbnail || null,
      scores,
      sections: {
        performance: {
          mobile: mobileData,
          desktop: desktopData,
        },
        seo: seoData,
        accessibility: accessibilityData,
      },
    });
  } catch (error) {
    console.error("FULL AUDIT ERROR:");
    console.error(error);

    return res.status(500).json({
      error: error.message || "Audit failed. Please try again.",
    });
  }
}