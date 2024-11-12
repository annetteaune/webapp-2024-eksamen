import { useLesson } from "@/hooks/useLesson";
import Comments from "./Comments";

interface LessonProps {
  courseSlug: string;
  lessonSlug: string;
}

export default function Lesson({ courseSlug, lessonSlug }: LessonProps) {
  const { lesson, course, isLoading, error } = useLesson(
    courseSlug,
    lessonSlug
  );

  if (isLoading) {
    return <div>Laster inn...</div>;
  }

  if (error || !lesson || !course) {
    return <div>Kunne ikke laste inn leksjon</div>;
  }

  return (
    <div>
      <div className="flex justify-between">
        <h3 data-testid="course_title" className="mb-6 text-base font-bold">
          <a className="underline" href={`/kurs/${course?.slug}`}>
            {course?.title}
          </a>
        </h3>
        <span data-testid="course_category">
          Kategori: <span className="font-bold">{course?.category}</span>
        </span>
      </div>
      <h2 className="text-2xl font-bold" data-testid="lesson_title">
        {lesson?.title}
      </h2>
      <p
        data-testid="lesson_preAmble"
        className="mt-4 font-semibold leading-relaxed"
      >
        {lesson?.preAmble}
      </p>
      {lesson?.text &&
        lesson.text.length > 0 &&
        lesson.text.map((text) => (
          <div
            key={text.id}
            data-testid="lesson_text"
            className="mt-4 prose font-normal"
            // bruker dangerouslysetinnerhtml for å vise formatering ved bruk av rik tekst
            dangerouslySetInnerHTML={{ __html: text.text }}
          />
        ))}
      <Comments lessonSlug={lessonSlug} />
    </div>
  );
}
