export function buildScores({ mobileData, desktopData, seoData, accessibilityData }) {
  const performance = Math.round(
    mobileData.performanceScore * 0.7 + desktopData.performanceScore * 0.3
  );

  const viewportPassed =
    seoData.checks.find((check) => check.key === "viewport")?.passed || false;

  const mobile = Math.round(
    mobileData.performanceScore * 0.5 +
      (viewportPassed ? 20 : 0) +
      mobileData.accessibilityScore * 0.3
  );

  const seo = seoData.score;

  const accessibility = Math.round(
    mobileData.accessibilityScore * 0.4 + accessibilityData.score * 0.6
  );

  const bestPractices = mobileData.bestPracticesScore;

  const overall = Math.round(
    performance * 0.3 +
      mobile * 0.2 +
      seo * 0.2 +
      accessibility * 0.2 +
      bestPractices * 0.1
  );

  return {
    overall,
    performance,
    mobile,
    seo,
    accessibility,
    bestPractices,
  };
}