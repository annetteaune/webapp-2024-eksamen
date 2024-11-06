import fs from "node:fs/promises";
import { join } from "node:path";
import type { DB } from "./db";
import type { User, Course, Lesson, LessonText, Comment } from "@/types";

export const seed = async (db: DB) => {
  const path = join(process.cwd(), "src", "db", "data.json");
  const file = await fs.readFile(path, "utf-8");
  const { users, courses, lessons, lesson_text, comments } = JSON.parse(
    file
  ) as {
    users: User[];
    courses: Course[];
    lessons: Lesson[];
    lesson_text: LessonText[];
    comments: Comment[];
  };

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email)
    VALUES (?, ?, ?)
  `);

  const insertCourse = db.prepare(`
    INSERT INTO courses (id, title, slug, description, category)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertLesson = db.prepare(`
    INSERT INTO lessons (id, course_id, title, slug, pre_amble, order_number)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertLessonText = db.prepare(`
    INSERT INTO lesson_text (id, lesson_id, text)
    VALUES (?, ?, ?)
  `);

  const insertComment = db.prepare(`
    INSERT INTO comments (id, user_id, lesson_id, comment)
    VALUES (?, ?, ?, ?)
  `);

  db.transaction(() => {
    for (const user of users) {
      insertUser.run(user.id, user.name, user.email);
    }

    for (const course of courses) {
      insertCourse.run(
        course.id,
        course.title,
        course.slug,
        course.description,
        course.category
      );
    }

    for (const lesson of lessons) {
      insertLesson.run(
        lesson.id,
        lesson.course_id,
        lesson.title,
        lesson.slug,
        lesson.pre_amble,
        lesson.order_number
      );
    }

    for (const text of lesson_text) {
      insertLessonText.run(text.id, text.lesson_id, text.text);
    }

    for (const comment of comments) {
      insertComment.run(
        comment.id,
        comment.user_id,
        comment.lesson_id,
        comment.comment
      );
    }
  })();
};
