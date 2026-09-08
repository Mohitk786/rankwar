import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const TEST_DOMAIN = process.argv[2] ?? `e2e-test-${Date.now()}.com`;
const TARGET_AMOUNT = Number(process.argv[3] ?? 42);

async function main() {
  console.log("Creating checkout session for", TEST_DOMAIN, "target amount", TARGET_AMOUNT);
  const checkoutRes = await fetch(`${BASE}/api/checkout`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      input: `https://${TEST_DOMAIN}`,
      categorySlug: "developer-tools",
      targetAmount: TARGET_AMOUNT,
      tosAgreed: true,
    }),
  });
  const checkoutData = await checkoutRes.json();
  if (!checkoutRes.ok) {
    console.error("Checkout creation failed:", checkoutData);
    process.exit(1);
  }
  console.log("Checkout URL:", checkoutData.url);

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(checkoutData.url, { waitUntil: "domcontentloaded" });

  await page.waitForSelector('input[name="email"], #email', { timeout: 20000 });
  await page.fill('input[name="email"], #email', "e2e-test@example.com");

  // Stripe test card, any future expiry / any CVC / any ZIP.
  const cardFrame = () => page.frameLocator('iframe[title="Secure payment input frame"]').first();
  try {
    await cardFrame().locator('input[name="number"]').fill("4242424242424242", { timeout: 10000 });
    await cardFrame().locator('input[name="expiry"]').fill("12/34");
    await cardFrame().locator('input[name="cvc"]').fill("123");
  } catch {
    // Newer Checkout Elements sometimes lay out fields as separate top-level inputs instead of the combined frame.
    await page.fill('input[name="cardNumber"]', "4242424242424242");
    await page.fill('input[name="cardExpiry"]', "12/34");
    await page.fill('input[name="cardCvc"]', "123");
  }

  const nameField = page.locator('input[name="billingName"]');
  if (await nameField.count()) await nameField.fill("E2E Test");

  const countrySelect = page.locator('select[name="billingCountry"]');
  if (await countrySelect.count()) await countrySelect.selectOption("US");

  const manualLink = page.getByText("Enter address manually");
  if (await manualLink.count()) await manualLink.click();

  const line1Field = page.locator('input[name="billingAddressLine1"]');
  if (await line1Field.count()) await line1Field.fill("123 Test St");

  const cityField = page.locator('input[name="billingLocality"]');
  if (await cityField.count()) await cityField.fill("San Francisco");

  const stateSelect = page.locator('select[name="billingAdministrativeArea"]');
  if (await stateSelect.count()) await stateSelect.selectOption("CA");

  const zipField = page.locator('input[name="billingPostalCode"]');
  if (await zipField.count()) await zipField.fill("94107");

  await page.screenshot({ path: "/tmp/checkout-before-submit.png", fullPage: true });

  const submitButton = page.locator('button[type="submit"]').first();
  await submitButton.click();

  await page.waitForURL(/\/success/, { timeout: 30000 });
  console.log("Reached success page:", page.url());
  await page.waitForTimeout(4000);
  await page.screenshot({ path: "/tmp/checkout-success.png", fullPage: true });

  const bodyText = await page.textContent("body");
  console.log("Success page text snippet:", bodyText?.slice(0, 300));

  await browser.close();

  const sessionId = new URL(page.url()).searchParams.get("session_id");
  console.log("SESSION_ID=" + sessionId);
  console.log("TEST_DOMAIN=" + TEST_DOMAIN);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
