import { test, expect } from "@playwright/test";
import { injectMediaRecorderMock } from "./utils/mockMedia";

test.beforeEach(async ({ page, context }) => {
  await page.addInitScript(injectMediaRecorderMock());
  // Мокаем аплоад, чтобы не трогать реальный бек
  await page.route("**/api/media/upload", async (route) => {
    const json = { ok: true, id: "fake-id", path: "u/1/2025/10/f.webm", mime: "audio/webm", bytes: 1234, category: "audio" };
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(json) });
  });
});

test("audio recorder: record, stop, upload shows success", async ({ page }) => {
  await page.goto("/messages/new");
  await page.getByRole("button", { name: "Голос" }).click();

  // Записать
  const recordBtn = page.getByRole("button", { name: "Записать" });
  await recordBtn.click();

  // Остановить
  const stopBtn = page.getByRole("button", { name: "Остановить" });
  await stopBtn.click();

  // Загрузить
  const uploadBtn = page.getByRole("button", { name: "Загрузить" });
  await uploadBtn.click();

  await expect(page.getByText("Готово. Файл сохранён.")).toBeVisible();
});

test("video recorder: record, stop, upload shows success", async ({ page }) => {
  await page.goto("/messages/new");
  await page.getByRole("button", { name: "Видео" }).click();

  await page.getByRole("button", { name: "Записать" }).click();
  await page.getByRole("button", { name: "Остановить" }).click();
  await page.getByRole("button", { name: "Загрузить" }).click();

  await expect(page.getByText("Готово. Файл сохранён.")).toBeVisible();
});
