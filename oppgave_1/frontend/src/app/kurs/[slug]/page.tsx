"use client";
import { useParams } from "next/navigation";
import Course from "@/components/Course";

export default function CourseDetailPage() {
  const params = useParams<{ slug: string }>();

  if (!params?.slug) {
    return <div>Kurs finnes ikke.</div>;
  }

  return <Course courseSlug={params.slug} />;
}
