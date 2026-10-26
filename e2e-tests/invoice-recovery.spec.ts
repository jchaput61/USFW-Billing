import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("create, save, reload and export an invoice with the displayed GST and Ship values", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Invoice Editor", exact: true })).toBeVisible();
  await expect(page.getByRole("img", { name: "Unlocking Secrets for Women", exact: true })).toBeVisible();
  await page.getByLabel("Invoice number", { exact: true }).fill("2026_901");
  await page.getByLabel("Invoice date", { exact: true }).fill("2026-06-30");
  await page.getByLabel("Company", { exact: true }).fill("Recovery test client");
  await page.getByLabel("Quantity row 1", { exact: true }).fill("2");
  await page.getByLabel("Description row 1", { exact: true }).fill("Consulting");
  await page.getByLabel("Unit price row 1", { exact: true }).fill("100");
  await page.getByLabel("GST row 1", { exact: true }).selectOption("N");
  await page.getByLabel("Ship row 1", { exact: true }).selectOption("Y");
  await page.getByLabel("Company", { exact: true }).click();
  await expect(page.getByTestId("invoice-total")).toHaveText("$ 240.00");
  await page.getByRole("button", { name: "Save Invoice", exact: true }).click();
  await expect(page.getByText("Invoice 2026_901 saved successfully!", { exact: true })).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Save HTML", exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("usfw_invoice_2026_901.html");
  const html = await readFile((await download.path())!, "utf8");
  const exported = await page.evaluate(content => {
    const document = new DOMParser().parseFromString(content, "text/html");
    return {
      gst: document.querySelector<HTMLSelectElement>('[aria-label="GST row 1"]')?.value,
      ship: document.querySelector<HTMLSelectElement>('[aria-label="Ship row 1"]')?.value,
      logo: document.querySelector("img")?.getAttribute("src"),
      styles: document.querySelector("style")?.textContent,
    };
  }, html);
  expect(exported.gst).toBe("N");
  expect(exported.ship).toBe("Y");
  expect(exported.logo).toMatch(/^data:image\/jpeg;base64,/);
  expect(exported.styles).toContain("#70CACB");

  await page.reload();
  await page.getByRole("button", { name: "Load Invoice", exact: true }).click();
  await page.getByRole("button", { name: "Invoice #2026_901", exact: true }).click();
  await expect(page.getByLabel("Company", { exact: true })).toHaveValue("Recovery test client");
  await expect(page.getByLabel("GST row 1", { exact: true })).toHaveValue("N");
  await expect(page.getByLabel("Ship row 1", { exact: true })).toHaveValue("Y");
  await expect(page.getByTestId("invoice-total")).toHaveText("$ 240.00");
});

test("import and export the original JSON backup format", async ({ page }) => {
  const row = ["2026_902", "2026-06-30", "Backup test client", "", "", "", "", "", "", "", "", "", "", 1, "ea", "Backup service", "", 50, "C", "N", "N"];
  const backup = { rows: [row], invoiceMeta: { "2026_902": { exchangeDate: "2026-06-30", liveRate: 1.4178, bankFee: 0.035, ftxFee: 0.025 } } };
  await page.goto("/");
  await page.getByRole("button", { name: "Invoice Database", exact: true }).click();
  page.on("dialog", dialog => dialog.accept());
  await page.locator('input[type="file"]').setInputFiles({ name: "backup.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(backup)) });
  await expect(page.getByText("Backup imported successfully!", { exact: true })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Backup test client", exact: true })).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON", exact: true }).click();
  const download = await downloadPromise;
  expect(JSON.parse(await readFile((await download.path())!, "utf8"))).toEqual(backup);
  await page.getByRole("button", { name: "Load", exact: true }).click();
  await expect(page.getByLabel("Invoice number", { exact: true })).toHaveValue("2026_902");
  await expect(page.getByLabel("Company", { exact: true })).toHaveValue("Backup test client");
  await expect(page.getByTestId("invoice-total")).toHaveText("$ 50.00");
});
