"use client";

import Course from "@/components/Course";
import Courses from "@/components/Courses";
import Create from "@/components/Create";
import Lesson from "@/components/Lesson";
import SignUp from "@/components/Signup";

export default function All() {
  return (
    <div
      className="mx-auto grid min-h-screen w-full max-w-7xl grid-rows-[auto_minmax(900px,_1fr)_30px]"
      data-testid="layout"
    >
      <nav className="mt-6 mb-12 flex justify-between">
        <h1 className="text-lg font-bold uppercase" data-testid="logo">
          <a href="/">Mikro LMS</a>
        </h1>
        <ul className="flex gap-8" data-testid="nav">
          <li className="text-base font-semibold" data-testid="nav_courses">
            <a href="kurs">Kurs</a>
          </li>
          <li className="text-base font-semibold" data-testid="nav_new">
            <a href="/ny">Nytt kurs</a>
          </li>
        </ul>
      </nav>
      <main className="h-full">
        <SignUp />
        <Courses />
        <Create />
        <Course />
        <Lesson />
        <p>Siden er tom</p>
      </main>
      <footer className="flex justify-between" data-testid="footer">
        <p>Mikro LMS AS, 2024</p>
        <p>99 00 00 00, mail@lms.no</p>
      </footer>
    </div>
  );
}
