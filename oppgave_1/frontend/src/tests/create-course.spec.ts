import {
  test,
  expect,
  type Page,
  type Locator,
  type BrowserContext,
} from "@playwright/test";

let page: Page;
let context: BrowserContext;

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
    });

    test("Should show error if any required field are missing", async () => {
      await page.getByTestId("step").nth(1).click();
      const error = await page.getByTestId("form_error");
      await expect(error).toBeVisible();
    });

    test("Should show error if title field is missing", async () => {
      await page.getByTestId("form_slug").fill("test-slug");
      await page.getByTestId("form_description").fill("Test description");
      await page.getByTestId("form_category").selectOption("Code");
      await page.getByTestId("step").nth(1).click();
      const error = await page.getByTestId("form_error");
      await expect(error).toBeVisible();
    });

    test("Should show error if slug field is missing", async () => {
      await page.getByTestId("form_title").fill("Test Title");
      await page.getByTestId("form_description").fill("Test description");
      await page.getByTestId("form_category").selectOption("Code");
      await page.getByTestId("step").nth(1).click();
      const error = await page.getByTestId("form_error");
      await expect(error).toBeVisible();
    });

    test("Should show error if description field is missing", async () => {
      await page.getByTestId("form_title").fill("Test Title");
      await page.getByTestId("form_slug").fill("test-slug");
      await page.getByTestId("form_category").selectOption("Code");
      await page.getByTestId("step").nth(1).click();
      const error = await page.getByTestId("form_error");
      await expect(error).toBeVisible();
    });

    test("Should show error if category field is missing", async () => {
      await page.getByTestId("form_title").fill("Test Title");
      await page.getByTestId("form_slug").fill("test-slug");
      await page.getByTestId("form_description").fill("Test description");
      await page.getByTestId("step").nth(1).click();
      const error = await page.getByTestId("form_error");
      await expect(error).toBeVisible();
    });

    // FEILER men bare noen ganger -  await expect(error).not.toBeVisible();
    test("Should not show error if all fields are provided", async () => {
      await page.getByTestId("form_title").fill("Test Title");
      await page.getByTestId("form_slug").fill("test-slug");
      await page.getByTestId("form_description").fill("Test description");
      await page.getByTestId("form_category").selectOption("Code");
      await page.getByTestId("step").nth(1).click();
      const error = await page.getByTestId("form_error");
      await expect(error).not.toBeVisible();
    });
  });

  test.describe("When at step two", () => {
    test.beforeEach(async () => {
      await page.goto("/ny");
      await expect(page.getByTestId("course_step")).toBeVisible();
      await page.getByTestId("form_title").fill("Test Title");
      await page.getByTestId("form_slug").fill("test-slug");
      await page.getByTestId("form_description").fill("Test description");
      await page.getByTestId("form_category").selectOption("Code");

      const buttons = await page.getByTestId("step").all();
      await buttons[1].click();
    });

    test("Should have disabled submit btn", async () => {
      const submitBtn = page.getByTestId("form_submit");
      await expect(submitBtn).toBeVisible();
      await expect(submitBtn).toBeDisabled();
    });

    // FEILER i beforeeach MEN BARE NOEN GANGER - await expect(page.getByTestId("form_error")).not.toBeVisible();
    test("Should have no errors", async () => {
      await expect(page.getByTestId("form_error")).not.toBeVisible();
    });

    test("Should have no success", async () => {
      await expect(page.getByTestId("form_success")).not.toBeAttached();
    });

    test("Should have test-id lessons", async () => {
      const lessons = page.getByTestId("lessons");
      await expect(lessons).toBeAttached();
      const lessonItems = await lessons.locator("li").all();
      expect(lessonItems.length).toBe(0);
    });

    // Feiler noen ganger
    test("Should have test-id form_lesson_add", async () => {
      const addButton = page.getByTestId("form_lesson_add");
      await expect(addButton).toBeVisible();
    });
  });

  test.describe("When creating multiple lessons", () => {
    test.beforeEach(async () => {
      await page.goto("/ny");
      await expect(page.getByTestId("course_step")).toBeAttached();
      await page.getByTestId("form_title").fill("Test Title");
      await page.getByTestId("form_slug").fill("test-slug");
      await page.getByTestId("form_description").fill("Test description");
      await page.getByTestId("form_category").selectOption("Code");

      const steps = page.getByTestId("steps");
      await expect(steps).toBeAttached();

      await page.getByTestId("step").nth(1).click();

      await expect(page.getByTestId("form_lesson_add")).toBeAttached();
      await page.getByTestId("form_lesson_add").click();
    });

    // FEILER i beforeeach men bare noen ganger - expect.toBeAttached
    test("Should have disabled submit btn if title is missing", async () => {
      await page.getByTestId("form_lesson_slug").fill("lesson-slug");
      await page.getByTestId("form_lesson_preAmble").fill("Test preamble");
      await page.locator("textarea").first().fill("Test content");
      const submitBtn = await page.getByTestId("form_submit");
      await expect(submitBtn).toBeDisabled();
    });
    // FEILER noen ganger
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

    // FEILER i beforeeach men bare noen ganger
    test("Should have enabled submit btn if all fields are added on all lesson", async () => {
      await page.getByTestId("form_lesson_title").fill("Lesson Title");
      await page.getByTestId("form_lesson_slug").fill("lesson-slug");
      await page.getByTestId("form_lesson_preAmble").fill("Test preamble");
      await page.locator("textarea").first().fill("Test content");
      const submitBtn = await page.getByTestId("form_submit");
      await expect(submitBtn).toBeEnabled();
    });

    // FEILER i beforeeach men abre noen ganger expect.toBeAttached— create-course.spec.ts:183
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
      await page.getByTestId("step").nth(1).click();
      await page.getByTestId("form_lesson_add").click();
    });

    // FEILER i beforeeach men bare noen ganger
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
      await page.getByTestId("form_title").fill("Test Course");
      await page.getByTestId("form_slug").fill("test-course");
      await page.getByTestId("form_description").fill("Test description");
      await page.getByTestId("form_category").selectOption("Code");
      await page.getByTestId("step").nth(1).click();
      await page.getByTestId("form_lesson_add").click();
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

    // FEILER men bare noen ganger locator.getByTestId('form_lesson_add').click— create-course.spec.ts:286
    test("Should have show success when submitted", async () => {
      await page.getByTestId("form_submit").click();
      const success = await page.getByTestId("form_success");
      await expect(success).toBeVisible();
      await expect(success).toHaveText("Skjema sendt");
    });

    // FEILER i beforeeach men abre noen ganger
    test("Should show preview of content when submitted", async () => {
      await page.getByTestId("form_submit").click();
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

    // denne testen er skrevet av claude.ai - FEILER i beforeeach men bare noen ganger locator.getByTestId('form_lesson_add').click
    test("Should get response 200 from server", async () => {
      const responsePromise = page.waitForResponse(
        (response) =>
          response.url().includes("/kurs") &&
          response.request().method() === "POST"
      );
      await page.getByTestId("form_submit").click();
      const response = await responsePromise;
      expect(response.status()).toBe(201);
    });

    // denne testen er skrevet av claude.ai - FEILER i beforeeach men bare noen ganger
    test("Should get correct data from server", async () => {
      const responsePromise = page.waitForResponse(
        (response) =>
          response.url().includes("/kurs") &&
          response.request().method() === "POST"
      );
      await page.getByTestId("form_submit").click();

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
