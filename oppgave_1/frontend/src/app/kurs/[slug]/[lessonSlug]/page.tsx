"use client";
import { useParams } from "next/navigation";
import Course from "@/components/Course";

export default function LessonPage() {
  const params = useParams<{ slug: string; lessonSlug: string }>();

  if (!params?.slug || !params?.lessonSlug) {
    return <div>Leksjon finnes ikke.</div>;
  }

  return <Course courseSlug={params.slug} lessonSlug={params.lessonSlug} />;
}
