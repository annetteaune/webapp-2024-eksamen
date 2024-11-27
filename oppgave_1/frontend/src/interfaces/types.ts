export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Category {
  id: string;
  name: string;
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
  createdAt?: string;
}

export interface LessonText {
  id: string;
  text: string;
}

export interface Lesson {
  id: string;
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
  lessons: Lesson[];
  category: string;
}

export interface CourseFields {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
}

export interface FormFields {
  name: string;
  email: string;
  admin: boolean;
}

// eventhjelpere
export type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;
export type TextAreaChangeEvent = React.ChangeEvent<HTMLTextAreaElement>;
export type SelectChangeEvent = React.ChangeEvent<HTMLSelectElement>;
export type FormSubmitEvent = React.FormEvent<HTMLFormElement>;

export interface ButtonClickEvent extends React.MouseEvent<HTMLButtonElement> {
  preventDefault: () => void;
}
