import fs from "node:fs/promises";
import { join } from "node:path";
import type { DB } from "./db";
import type { DatabaseData } from "@/types";

export const seed = async (db: DB) => {
  const path = join(process.cwd(), "src", "db", "data.json");
  const file = await fs.readFile(path, "utf-8");
  const { users, categories, courseCreateSteps, courses, comments } =
    JSON.parse(file) as DatabaseData;

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email)
    VALUES (?, ?, ?)
  `);

  const insertCategory = db.prepare(`
    INSERT INTO categories (id, name)
    VALUES (?, ?)
  `);

  const insertCourseCreateStep = db.prepare(`
    INSERT INTO course_create_steps (id, name)
    VALUES (?, ?)
  `);

  const insertCourse = db.prepare(`
    INSERT INTO courses (id, title, slug, description, category)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertLesson = db.prepare(`
    INSERT INTO lessons (id, course_id, title, slug, preAmble)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertLessonText = db.prepare(`
    INSERT INTO lesson_text (id, lesson_id, text)
    VALUES (?, ?, ?)
  `);

  const insertComment = db.prepare(`
    INSERT INTO comments (id, created_by_id, created_by_name, comment, lesson_slug)
    VALUES (?, ?, ?, ?, ?)
  `);

  db.transaction(() => {
    // brukere
    for (const user of users) {
      insertUser.run(user.id, user.name, user.email);
    }

    // kategorier
    categories.forEach((category: string, index: number) => {
      insertCategory.run(String(index + 1), category);
    });

    // course create steps
    for (const step of courseCreateSteps) {
      insertCourseCreateStep.run(step.id, step.name);
    }

    // kurs
    for (const course of courses) {
      insertCourse.run(
        course.id,
        course.title,
        course.slug,
        course.description,
        course.category
      );

      // legger til leksjoner om de fins
      if (course.lessons && course.lessons.length > 0) {
        for (const lesson of course.lessons) {
          insertLesson.run(
            lesson.id,
            course.id,
            lesson.title,
            lesson.slug,
            lesson.preAmble
          );

          // leksjontext om de fins
          if (lesson.text && lesson.text.length > 0) {
            for (const text of lesson.text) {
              insertLessonText.run(text.id, lesson.id, text.text);
            }
          }
        }
      }
    }

    // kommentarer
    for (const comment of comments) {
      insertComment.run(
        comment.id,
        comment.createdBy.id,
        comment.createdBy.name,
        comment.comment,
        comment.lesson.slug
      );
    }
  })();
};
