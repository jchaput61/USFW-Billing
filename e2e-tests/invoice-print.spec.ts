import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("Print and saved HTML preserve GST, Ship, and company panel color", async ({ page, context }) => {
  await page.addInitScript(() => {
    window.print = () => {
      document.documentElement.setAttribute("data-print-requested", "true");
    };
    window.close = () => {};
  });
  await page.goto("/");
  const app = page.frameLocator('iframe[title="USFW Invoicing Master"]');
  const panel = app.getByTestId("company-information-panel");
  await expect(panel).toHaveCSS("background-color", "rgb(112, 202, 203)");
  const selects = app.getByRole("table").getByRole("combobox");
  await selects.nth(0).selectOption("N");
  await selects.nth(1).selectOption("Y");
  await selects.nth(2).selectOption("Y");
  await selects.nth(3).selectOption("N");
  const formValues = await selects.evaluateAll(elements =>
    elements.map(element => (element as HTMLSelectElement).value),
  );

  const popupPromise = page.waitForEvent("popup");
  await app.getByRole("button", { name: "Print Invoice", exact: true }).click();
  const popup = await popupPromise;
  await expect(popup.locator("html")).toHaveAttribute("data-print-requested", "true");
  await popup.emulateMedia({ media: "print" });
  await expect(popup.getByTestId("company-information-panel")).toHaveCSS("background-color", "rgb(112, 202, 203)");
  await expect(popup.getByTestId("company-information-panel")).toHaveCSS("print-color-adjust", "exact");
  expect(await popup.getByRole("table").getByRole("combobox").evaluateAll(elements =>
    elements.map(element => (element as HTMLSelectElement).value),
  )).toEqual(formValues);

  const downloadPromise = page.waitForEvent("download");
  await app.getByRole("button", { name: "Save HTML", exact: true }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).not.toBeNull();
  const html = await readFile(path!, "utf8");
  const saved = await context.newPage();
  await saved.setContent(html);
  await saved.emulateMedia({ media: "print" });
  await expect(saved.getByTestId("company-information-panel")).toHaveCSS("background-color", "rgb(112, 202, 203)");
  expect(await saved.getByRole("table").getByRole("combobox").evaluateAll(elements =>
    elements.map(element => (element as HTMLSelectElement).value),
  )).toEqual(formValues);
});
