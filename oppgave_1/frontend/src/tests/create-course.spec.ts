import {
  test,
  expect,
  type Page,
  type Locator,
  type BrowserContext,
} from "@playwright/test";
import { waitForPageReady } from "./helpers";

let page: Page;
let context: BrowserContext;

/*TODO: Flaky tests
      Har brukt 2 dager på å forsøke å feilrette i flaky tester. Enkelte tester feiler, men bare noen ganger, men ingen tester
      feiler om --trace on-flagget er på, så feilretting er veldig vanskelig. Om de ulike testblokkene kjøres med .only, feiler heller ingen per blokk,
      untatt den aller siste - som foreøvrig bestandig passerer når ALLE kjøres. 
      Ellers er det 1-3 tester som flagges som flaky per testrunde når alle blokkene kjøres. Lar stå som det er, og kommer tilbake til det om jeg får tid før innlevering.  */

test.describe("Oppgave 1 Create", () => {
  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    await page.goto("/");
  });

  test.describe("When showing create page", () => {
    test.beforeEach(async () => {
      await page.goto("/ny");
    });

    test("Should have test-id steps", async () => {
      const steps = await page.getByTestId("steps");
      await expect(steps).toBeVisible();
    });

    test("Should have test-id form_submit", async () => {
      const submitButton = await page.getByTestId("form_submit");
      await expect(submitButton).toBeVisible();
    });

    test("Should have test-id title", async () => {
      const title = await page.getByTestId("title");
      await expect(title).toBeVisible();
    });

    test("Should have test-id form", async () => {
      const form = await page.getByTestId("form");
      await expect(form).toBeVisible();
    });

    test("Should have test-id course_step", async () => {
      const courseStep = await page.getByTestId("course_step");
      await expect(courseStep).toBeVisible();
    });

    test("Should have test-id form_title", async () => {
      const formTitle = await page.getByTestId("form_title");
      await expect(formTitle).toBeVisible();
    });

    test("Should have test-id form_slug", async () => {
      const formSlug = await page.getByTestId("form_slug");
      await expect(formSlug).toBeVisible();
    });

    test("Should have test-id form_description", async () => {
      const formDescription = await page.getByTestId("form_description");
      await expect(formDescription).toBeVisible();
    });

    test("Should have test-id form_category", async () => {
      const formCategory = await page.getByTestId("form_category");
      await expect(formCategory).toBeVisible();
    });
  });
  test.describe("When stepping from first to second step", () => {
    test.beforeEach(async () => {
      await page.goto("/ny");
      await waitForPageReady(page);
    });

    test("Should show error if any required field are missing", async () => {
      await page.click('button:has-text("Leksjoner")');
      const error = await page.getByTestId("form_error");
      await expect(error).toBeVisible();
    });

    test("Should show error if title field is missing", async () => {
      await page.getByTestId("form_slug").fill("test-slug");
      await page.getByTestId("form_description").fill("Test description");
      await page.getByTestId("form_category").selectOption("Code");
      await page.click('button:has-text("Leksjoner")');
      const error = await page.getByTestId("form_error");
      await expect(error).toBeVisible();
    });

    test("Should show error if slug field is missing", async () => {
      await page.getByTestId("form_title").fill("Test Title");
      await page.getByTestId("form_description").fill("Test description");
      await page.getByTestId("form_category").selectOption("Code");
      await page.click('button:has-text("Leksjoner")');
      const error = await page.getByTestId("form_error");
      await expect(error).toBeVisible();
    });

    test("Should show error if description field is missing", async () => {
      await page.getByTestId("form_title").fill("Test Title");
      await page.getByTestId("form_slug").fill("test-slug");
      await page.getByTestId("form_category").selectOption("Code");
      await page.click('button:has-text("Leksjoner")');
      const error = await page.getByTestId("form_error");
      await expect(error).toBeVisible();
    });

    test("Should show error if category field is missing", async () => {
      await page.getByTestId("form_title").fill("Test Title");
      await page.getByTestId("form_slug").fill("test-slug");
      await page.getByTestId("form_description").fill("Test description");
      await page.click('button:has-text("Leksjoner")');
      const error = await page.getByTestId("form_error");
      await expect(error).toBeVisible();
    });

    test("Should not show error if all fields are provided", async () => {
      await page.getByTestId("form_title").fill("Test Title");
      await page.getByTestId("form_slug").fill("test-slug");
      await page.getByTestId("form_description").fill("Test description");
      await page.getByTestId("form_category").selectOption("Code");
      await page.click('button:has-text("Leksjoner")');
      await expect(page.getByTestId("form_error")).not.toBeVisible();
    });
  });

  test.describe("When at step two", () => {
    test.beforeEach(async () => {
      await page.goto("/ny");
      await waitForPageReady(page);
      await expect(page.getByTestId("course_step")).toBeVisible();
      await page.getByTestId("form_title").fill("Test Title");
      await page.getByTestId("form_slug").fill("test-slug");
      await page.getByTestId("form_description").fill("Test description");
      await page.getByTestId("form_category").selectOption("Code");

      await page.click('button:has-text("Leksjoner")');
    });

    test("Should have disabled submit btn", async () => {
      const submitBtn = page.getByTestId("form_submit");
      await expect(submitBtn).toBeVisible();
      await expect(submitBtn).toBeDisabled();
    });

    test("Should have no errors", async () => {
      await expect(page.getByTestId("form_error")).not.toBeVisible();
    });

    test("Should have no success", async () => {
      await expect(page.getByTestId("form_success")).not.toBeAttached();
    });

    test("Should have test-id lessons", async () => {
      await page.click('button:has-text("+ Ny leksjon")');
      const lessons = page.getByTestId("lessons");
      await expect(lessons).toBeVisible();
    });

    test("Should have test-id form_lesson_add", async () => {
      const addButton = page.getByTestId("form_lesson_add");
      await expect(addButton).toBeVisible();
    });
  });

  test.describe("When creating multiple lessons", () => {
    test.beforeEach(async () => {
      await page.goto("/ny");
      await waitForPageReady(page);

      await page.getByTestId("form_title").fill("Test Title");
      await page.getByTestId("form_slug").fill("test-slug");
      await page.getByTestId("form_description").fill("Test description");
      await page.getByTestId("form_category").selectOption("Code");

      await page.click('button:has-text("Leksjoner")');
      await waitForPageReady(page);
      await page.click('button:has-text("+ Ny leksjon")');
    });

    test("Should have disabled submit btn if title is missing", async () => {
      await page.getByTestId("form_lesson_slug").fill("lesson-slug");
      await page.getByTestId("form_lesson_preAmble").fill("Test preamble");
      await page.locator("textarea").first().fill("Test content");
      const submitBtn = await page.getByTestId("form_submit");
      await expect(submitBtn).toBeDisabled();
    });

    test("Should have disabled submit btn if preAmble is missing", async () => {
      await page.getByTestId("form_lesson_title").fill("Lesson Title");
      await page.getByTestId("form_lesson_slug").fill("lesson-slug");
      await page.locator("textarea").first().fill("Test content");
      const submitBtn = await page.getByTestId("form_submit");
      await expect(submitBtn).toBeDisabled();
    });

    test("Should have disabled submit btn if slug is missing", async () => {
      await page.getByTestId("form_lesson_title").fill("Lesson Title");
      await page.getByTestId("form_lesson_preAmble").fill("Test preamble");
      await page.locator("textarea").first().fill("Test content");
      const submitBtn = await page.getByTestId("form_submit");
      await expect(submitBtn).toBeDisabled();
    });

    test("Should have disabled submit btn if text is missing", async () => {
      await page.getByTestId("form_lesson_title").fill("Lesson Title");
      await page.getByTestId("form_lesson_slug").fill("lesson-slug");
      await page.getByTestId("form_lesson_preAmble").fill("Test preamble");
      const submitBtn = await page.getByTestId("form_submit");
      await expect(submitBtn).toBeDisabled();
    });

    test("Should have disabled submit btn if all fields are added on last lesson", async () => {
      await page.getByTestId("form_lesson_add").click();
      await page.getByTestId("form_lesson_add").click();
      await page.getByTestId("select_lesson_btn").nth(1).click();
      await page.getByTestId("form_lesson_title").fill("Last Lesson");
      await page.getByTestId("form_lesson_slug").fill("last-lesson");
      await page
        .getByTestId("form_lesson_preAmble")
        .fill("Last lesson preamble");
      await page.locator("textarea").first().fill("Last lesson content");
      const submitBtn = await page.getByTestId("form_submit");
      await expect(submitBtn).toBeDisabled();
    });

    test("Should have enabled submit btn if all fields are added on all lesson", async () => {
      await page.getByTestId("form_lesson_title").fill("Lesson Title");
      await page.getByTestId("form_lesson_slug").fill("lesson-slug");
      await page.getByTestId("form_lesson_preAmble").fill("Test preamble");
      await page.locator("textarea").first().fill("Test content");
      const submitBtn = await page.getByTestId("form_submit");
      await expect(submitBtn).toBeEnabled();
    });

    test("Should disable publish button if new lesson is added", async () => {
      await page.getByTestId("form_lesson_title").fill("Lesson 1");
      await page.getByTestId("form_lesson_slug").fill("lesson-1");
      await page.getByTestId("form_lesson_preAmble").fill("Test preamble 1");
      await page.locator("textarea").first().fill("Test content 1");

      await page.getByTestId("form_lesson_add").click();
      const submitBtn = await page.getByTestId("form_submit");
      await expect(submitBtn).toBeDisabled();
    });
  });

  test.describe("When creating multiple lessons with multiple textboxes", () => {
    test.beforeEach(async () => {
      await page.goto("/ny");
      await page.getByTestId("form_title").fill("Test Title");
      await page.getByTestId("form_slug").fill("test-slug");
      await page.getByTestId("form_description").fill("Test description");
      await page.getByTestId("form_category").selectOption("Code");
      await page.click('button:has-text("Leksjoner")');
      await waitForPageReady(page);
      await page.click('button:has-text("+ Ny leksjon")');
    });

    test("Should have enabled publish button if all text fields are valid", async () => {
      await page.getByTestId("form_lesson_title").fill("Lesson 1");
      await page.getByTestId("form_lesson_slug").fill("lesson-1");
      await page.getByTestId("form_lesson_preAmble").fill("Test preamble 1");
      await page.locator("textarea").first().fill("Test content 1");
      await page.getByTestId("form_lesson_add_text").click();
      await page.locator("textarea").nth(1).fill("Additional content");
      const submitBtn = await page.getByTestId("form_submit");
      await expect(submitBtn).toBeEnabled();
    });
  });

  test.describe("When created new course", () => {
    test.beforeEach(async () => {
      await page.goto("/ny");
      await waitForPageReady(page);
      await page.getByTestId("form_title").fill("Test Course");
      await page.getByTestId("form_slug").fill("test-course");
      await page.getByTestId("form_description").fill("Test description");
      await page.getByTestId("form_category").selectOption("Code");
      await page.click('button:has-text("Leksjoner")');
      await waitForPageReady(page);
      await page.click('button:has-text("+ Ny leksjon")');
      await waitForPageReady(page);
      await page.getByTestId("form_lesson_title").fill("Test Lesson");
      await page.getByTestId("form_lesson_slug").fill("test-lesson");
      await page.getByTestId("form_lesson_preAmble").fill("Test preamble");
      await page.locator("textarea").first().fill("Test content");
    });

    test.afterEach(async () => {
      await fetch(`http://localhost:3999/kurs/test-course`, {
        method: "DELETE",
      });
    });

    test("Should have show success when submitted", async () => {
      await page.click('button:has-text("Publiser")');
      await waitForPageReady(page);
      const success = await page.getByTestId("form_success");
      await expect(success).toBeVisible();
      await expect(success).toHaveText("Skjema sendt");
    });

    test("Should show preview of content when submitted", async () => {
      await page.getByTestId("form_submit").click();
      await waitForPageReady(page);
      await expect(page.getByTestId("review")).toBeVisible();
      await expect(page.getByTestId("review_course")).toBeVisible();
      await expect(page.getByTestId("review_course_title")).toContainText(
        "Test Course"
      );
      await expect(page.getByTestId("review_course_slug")).toContainText(
        "test-course"
      );
      await expect(page.getByTestId("review_course_description")).toContainText(
        "Test description"
      );
      await expect(page.getByTestId("review_course_category")).toContainText(
        "Code"
      );
      await expect(page.getByTestId("review_course_lessons")).toBeVisible();
      await expect(page.getByTestId("review_lessons")).toBeVisible();
      await expect(page.getByTestId("review_lesson_title")).toContainText(
        "Test Lesson"
      );
      await expect(page.getByTestId("review_lesson_slug")).toContainText(
        "test-lesson"
      );
      await expect(page.getByTestId("review_lesson_preamble")).toContainText(
        "Test preamble"
      );
      await expect(page.getByTestId("review_lesson_text")).toContainText(
        "Test content"
      );
    });

    // denne testen er skrevet av claude.ai
    test("Should get response 200 from server", async () => {
      const responsePromise = page.waitForResponse(
        (response) =>
          response.url().includes("/kurs") &&
          response.request().method() === "POST"
      );
      await page.click('button:has-text("Publiser")');
      await waitForPageReady(page);
      const response = await responsePromise;
      expect(response.status()).toBe(201);
    });

    // denne testen er (hovedsakelig) skrevet av claude.ai
    test("Should get correct data from server", async () => {
      const responsePromise = page.waitForResponse(
        (response) =>
          response.url().includes("/kurs") &&
          response.request().method() === "POST"
      );

      await page.click('button:has-text("Publiser")');
      await waitForPageReady(page);
      const response = await responsePromise;
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toEqual(
        expect.objectContaining({
          title: "Test Course",
          slug: "test-course",
          description: "Test description",
          category: "code",
          lessons: expect.arrayContaining([
            expect.objectContaining({
              title: "Test Lesson",
              slug: "test-lesson",
              preAmble: "Test preamble",
              text: expect.arrayContaining([
                expect.objectContaining({
                  text: "Test content",
                }),
              ]),
            }),
          ]),
        })
      );
    });
  });
});
