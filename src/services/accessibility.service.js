import puppeteer from "puppeteer";
import axeCore from "axe-core";

export async function runAccessibilityChecks(url) {
  const browser = await puppeteer.launch({
    headless: true,
  });

  try {
    const page = await browser.newPage();

    await page.setViewport({
      width: 1440,
      height: 1024,
      deviceScaleFactor: 1,
    });

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    const screenshotFull = await page.screenshot({
      type: "jpeg",
      quality: 70,
      fullPage: false,
      encoding: "base64",
    });

    const screenshotThumb = await page.screenshot({
      type: "jpeg",
      quality: 45,
      fullPage: false,
      clip: {
        x: 0,
        y: 0,
        width: 900,
        height: 520,
      },
      encoding: "base64",
    });

    await page.addScriptTag({
      content: axeCore.source,
    });

    const results = await page.evaluate(async () => {
      return await axe.run();
    });

    const violations = results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      description: violation.description,
      help: violation.help,
      nodesAffected: violation.nodes.length,
    }));

    const score = Math.max(0, 100 - violations.length * 7);

    return {
      score,
      violationCount: violations.length,
      violations,
      screenshot: {
        mimeType: "image/jpeg",
        data: screenshotFull,
      },
      thumbnail: {
        mimeType: "image/jpeg",
        data: screenshotThumb,
      },
    };
  } finally {
    await browser.close();
  }
}