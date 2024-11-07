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

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  slug: string;
  pre_amble: string;
  order_number: number;
}

export interface LessonText {
  id: string;
  lesson_id: string;
  text: string;
}

export interface Comment {
  id: string;
  user_id: string;
  lesson_id: string;
  comment: string;
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

export interface LessonRow {
  id: string;
  course_id: string;
  title: string;
  slug: string;
  pre_amble: string;
  order_number: number;
}
