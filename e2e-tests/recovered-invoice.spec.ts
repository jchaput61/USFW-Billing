import { test, expect } from "@playwright/test";

test("Save and reload an invoice in the recovered interface", async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem("recovery-test-initialized")) {
      localStorage.setItem("usfw_invoicing_data_v1", "[]");
      localStorage.setItem("usfw_invoice_meta_v1", "{}");
      localStorage.setItem("recovery-test-initialized", "true");
    }
  });
  await page.route("https://api.frankfurter.app/**", route => route.fulfill({
    json: { rates: { CAD: 1.35 } },
  }));
  await page.goto("/");
  const app = page.frameLocator('iframe[title="USFW Invoicing Master"]');
  await expect(app.getByRole("button", { name: "Save Invoice", exact: true })).toBeVisible();
  await expect(app.getByRole("img", { name: "Unlocking Secrets for Women", exact: true })).toBeVisible();
  await app.getByLabel("Company", { exact: true }).fill("Recovery verification company");
  await app.getByLabel("Invoice date", { exact: true }).fill("2026-10-20");
  await app.getByLabel("Invoice number", { exact: true }).fill("2026_901");
  const row = app.getByRole("table").locator("tbody tr").first();
  await row.getByRole("cell").nth(0).getByRole("textbox").fill("2");
  await row.getByRole("cell").nth(1).getByRole("textbox").fill("Recovered invoice item");
  await row.getByRole("cell").nth(3).getByRole("textbox").fill("10");
  await row.getByRole("cell").nth(4).getByRole("textbox").fill("C");
  await row.getByRole("cell").nth(5).getByRole("combobox").selectOption("N");
  await row.getByRole("cell").nth(6).getByRole("combobox").selectOption("N");
  await app.getByRole("button", { name: "Save Invoice", exact: true }).click();
  await expect(app.getByText("Invoice 2026_901 saved successfully!", { exact: true })).toBeVisible();
  await page.reload();
  await app.getByRole("button", { name: "Load Invoice", exact: true }).click();
  await app.getByRole("button", { name: "Invoice #2026_901", exact: true }).click();
  await expect(app.getByLabel("Company", { exact: true })).toHaveValue("Recovery verification company");
  await expect(row.getByRole("cell").nth(1).getByRole("textbox")).toHaveValue("Recovered invoice item");
  await expect(row.getByRole("cell").nth(5).getByRole("combobox")).toHaveValue("N");
  await expect(row.getByRole("cell").nth(6).getByRole("combobox")).toHaveValue("N");
  await app.getByRole("button", { name: "Invoice Database", exact: true }).click();
  await expect(app.getByRole("cell", { name: "Recovery verification company", exact: true }).first()).toBeVisible();
  await expect(app.getByRole("button", { name: "Import JSON", exact: true })).toBeVisible();
});
