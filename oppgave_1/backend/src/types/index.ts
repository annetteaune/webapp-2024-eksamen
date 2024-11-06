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

export type Result<T> = Success<T> | Failure;

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
