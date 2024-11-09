export type Success<T> = {
  success: true;
  data: T;
};

export type Failure = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface CourseCreateStep {
  id: string;
  name: string;
}

export interface LessonText {
  id: string;
  text: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  slug: string;
  preAmble: string;
  text: LessonText[];
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  lessons: Lesson[];
}

export interface Comment {
  id: string;
  createdBy: {
    id: string;
    name: string;
  };
  comment: string;
  lesson: {
    slug: string;
  };
  createdAt: string;
}

export interface DatabaseData {
  users: User[];
  categories: string[];
  courseCreateSteps: CourseCreateStep[];
  courses: Course[];
  comments: Comment[];
}
// her har jeg fått hjelp fra claude.ai
export type Result<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: {
        message: string;
        code: string;
      };
    };

// her har jeg fått hjelp fra claude.ai
export const ResultHandler = {
  success: <T>(data: T): Result<T> => ({
    success: true,
    data,
  }),
  failure: (message: unknown, code: string): Result<never> => ({
    success: false,
    error: {
      message: message instanceof Error ? message.message : String(message),
      code,
    },
  }),
};

// typer for å hente leksjoner tilhørende kurs
// her har jeg fått hjelp fra claude.ai
export interface CourseRow {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
}
// claude.ai
export interface LessonRow {
  id: string;
  course_id: string;
  title: string;
  slug: string;
  pre_amble: string;
  order_number: number;
}
// claude.ai
export interface LessonText {
  id: string;
  text: string;
}
// claude.ai
// For creating new lesson text without requiring an id
export interface CreateLessonTextDTO {
  text: string;
}
// claude.ai
// For creating new lessons
export interface CreateLessonDTO {
  title: string;
  slug: string;
  preAmble: string;
  text: CreateLessonTextDTO[];
}
// claude.ai
// For creating new courses
export interface CreateCourseDTO {
  title: string;
  slug: string;
  description: string;
  category: string;
  lessons?: CreateLessonDTO[];
}
