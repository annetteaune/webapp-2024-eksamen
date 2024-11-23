import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Course,
  CourseFields,
  Lesson,
  ButtonClickEvent,
  InputChangeEvent,
  SelectChangeEvent,
  TextAreaChangeEvent,
} from "@/interfaces/types";
import { isValid } from "@/lib/utils/validation";
import { fetcher } from "@/api/fetcher";
import { generateRandomId } from "@/lib/utils/randomId";

export const useCreate = () => {
  const [success, setSuccess] = useState<boolean>(false);
  const [formError, setFormError] = useState<boolean>(false);
  const [current, setCurrent] = useState<number>(0);
  const [currentLesson, setCurrentLesson] = useState<number>(0);
  const [useRichEditor, setUseRichEditor] = useState(false);
  const [courseFields, setCourseFields] = useState<CourseFields>({
    id: generateRandomId(),
    title: "",
    slug: "",
    description: "",
    category: "",
  });
  const [lessons, setLessons] = useState<Lesson[]>([]);

  const router = useRouter();

  const handleSubmit = async (event: ButtonClickEvent) => {
    event.preventDefault();
    setFormError(false);
    setSuccess(false);

    if (lessons.length > 0 && isValid(lessons) && isValid(courseFields)) {
      try {
        const response = await fetcher("/kurs", {
          method: "POST",
          body: JSON.stringify({
            title: courseFields.title,
            slug: courseFields.slug,
            description: courseFields.description,
            category: courseFields.category.toLowerCase(),
            lessons: lessons.map((lesson) => ({
              title: lesson.title,
              slug: lesson.slug,
              preAmble: lesson.preAmble,
              text: lesson.text.map((t) => ({
                text: t.text,
              })),
            })),
          }),
        });

        if (response.success) {
          setSuccess(true);
          setCurrent(2);
          setTimeout(() => {
            router.push("/kurs");
          }, 3000);
        } else {
          setFormError(true);
        }
      } catch (error) {
        setFormError(true);
        console.error("Failed to create course:", error);
      }
    } else {
      setFormError(true);
    }
  };

  const addTextBox = (): void => {
    const updatedLessonText = lessons.map((lesson, i) => {
      if (currentLesson === i) {
        const text = [{ id: generateRandomId(), text: "" }];
        if (lesson.text.length === 0) {
          text.push({
            id: generateRandomId(),
            text: "",
          });
        }
        return {
          ...lesson,
          text: [...lesson.text, ...text],
        };
      }
      return lesson;
    });
    setLessons(updatedLessonText);
  };

  const removeTextBox = (index: number): void => {
    const removed = lessons[currentLesson].text.filter((_, i) => i !== index);
    const updatedLessonText = lessons.map((lesson, i) => {
      if (currentLesson === i) {
        return {
          ...lesson,
          text: removed,
        };
      }
      return lesson;
    });
    setLessons(updatedLessonText);
  };

  const handleCourseFieldChange = (
    event: InputChangeEvent | SelectChangeEvent
  ): void => {
    const { name, value } = event.target;
    setCourseFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleStep = (index: number): void => {
    setFormError(false);
    switch (index) {
      case 0:
        return setCurrent(0);
      case 1:
        return isValid(courseFields) ? setCurrent(1) : setFormError(true);
      default:
        break;
    }
  };

  const handleLessonFieldChange = (
    event: InputChangeEvent | TextAreaChangeEvent,
    index?: number
  ): void => {
    const { name, value } = event.target;
    let text = lessons[currentLesson]?.text || [];

    if (lessons[currentLesson]?.text?.length === 0) {
      text = [{ id: generateRandomId(), text: "" }];
    } else if (name === "text" && typeof index === "number") {
      text = lessons[currentLesson].text.map((_text, i) => {
        if (i === index) {
          return { id: _text.id, text: value };
        }
        return _text;
      });
    }

    const updatedLessons = lessons.map((lesson, i) => {
      if (i === currentLesson) {
        return { ...lesson, [name]: value, text };
      }
      return lesson;
    });
    setLessons(updatedLessons);
  };

  const changeCurrentLesson = (index: number): void => {
    setCurrentLesson(index);
  };

  const addLesson = (): void => {
    setLessons((prev) => [
      ...prev,
      {
        id: generateRandomId(),
        title: "",
        slug: "",
        preAmble: "",
        text: [],
        courseId: courseFields.id,
      },
    ]);
    setCurrentLesson(lessons.length);
  };

  return {
    success,
    formError,
    current,
    currentLesson,
    useRichEditor,
    courseFields,
    lessons,
    setUseRichEditor,
    handleSubmit,
    addTextBox,
    removeTextBox,
    handleCourseFieldChange,
    handleStep,
    handleLessonFieldChange,
    changeCurrentLesson,
    addLesson,
    setLessons,
  };
};
