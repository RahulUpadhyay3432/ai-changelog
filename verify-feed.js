const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({ headless: true });

  // Mobile
  const mobileCtx = await browser.newContext({
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    viewport: { width: 390, height: 844 },
  });
  const mobile = await mobileCtx.newPage();
  await mobile.goto("https://kapyn.app", { waitUntil: "networkidle", timeout: 30000 });
  await mobile.waitForTimeout(3000);
  await mobile.screenshot({ path: "check-mobile.png" });
  console.log("Mobile screenshot done");

  // Desktop
  const desktopCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desktop = await desktopCtx.newPage();
  await desktop.goto("https://kapyn.app", { waitUntil: "networkidle", timeout: 30000 });
  await desktop.waitForTimeout(3000);
  await desktop.screenshot({ path: "check-desktop.png" });
  console.log("Desktop screenshot done");

  await browser.close();
})();
