"use client";

import { useState, useEffect } from "react";
import {
  categories,
  comments,
  courseCreateSteps,
  courses,
  users,
} from "../data/data";

import { useParams, useRouter } from "next/navigation";
import Courses from "@/components/Courses";

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
        <Courses />
        <p>Siden er tom</p>
      </main>
      <footer className="flex justify-between" data-testid="footer">
        <p>Mikro LMS AS, 2024</p>
        <p>99 00 00 00, mail@lms.no</p>
      </footer>
    </div>
  );
}
