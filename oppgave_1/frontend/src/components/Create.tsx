import { isValid } from "@/lib/utils/validation";
import { useCategories } from "@/hooks/useCategories";
import { generateRandomId } from "@/lib/utils/randomId";
import TextEditor from "./TextEditor";
import { useCreate } from "@/hooks/useCreate";

const courseCreateSteps = [
  { id: "1", name: "Kurs" },
  { id: "2", name: "Leksjoner" },
];

export default function Create() {
  const {
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
  } = useCreate();

  const { categories } = useCategories();

  const step: string = courseCreateSteps[current]?.name;

  return (
    <>
      <nav className="mb-8 flex w-full">
        <ul data-testid="steps" className="flex w-full">
          {courseCreateSteps?.map((courseStep, index) => (
            <button
              type="button"
              data-testid="step"
              key={courseStep.name}
              onClick={() => handleStep(index)}
              className={`h-12 w-1/4 border border-slate-200 ${
                step === courseStep.name
                  ? "border-transparent bg-slate-400"
                  : "bg-transparent"
              }`}
            >
              {courseStep.name}
            </button>
          ))}
          <button
            disabled={
              lessons?.length === 0 ||
              !(isValid(lessons) && isValid(courseFields))
            }
            data-testid="form_submit"
            type="button"
            onClick={handleSubmit}
            className="h-12 w-1/4 border border-slate-200 bg-emerald-300 disabled:bg-transparent disabled:opacity-50"
          >
            Publiser
          </button>
        </ul>
      </nav>
      <h2 className="text-xl font-bold" data-testid="title">
        Lag nytt kurs
      </h2>
      <form className="mt-8 max-w-4xl" data-testid="form" noValidate>
        {current === 0 ? (
          <div data-testid="course_step" className="max-w-lg">
            {/* {JSON.stringify(courseFields)} */}
            <label className="mb-4 flex flex-col" htmlFor="title">
              <span className="mb-1 font-semibold">Tittel*</span>
              <input
                className="rounded"
                data-testid="form_title"
                type="text"
                name="title"
                id="title"
                value={courseFields?.title}
                onChange={handleCourseFieldChange}
              />
            </label>
            <label className="mb-4 flex flex-col" htmlFor="slug">
              <span className="mb-1 font-semibold">Slug*</span>
              <input
                className="rounded"
                data-testid="form_slug"
                type="text"
                name="slug"
                id="slug"
                value={courseFields?.slug}
                onChange={handleCourseFieldChange}
              />
            </label>
            <label className="mb-4 flex flex-col" htmlFor="description">
              <span className="mb-1 font-semibold">Beskrivelse*</span>
              <input
                className="rounded"
                data-testid="form_description"
                type="text"
                name="description"
                id="description"
                value={courseFields?.description}
                onChange={handleCourseFieldChange}
              />
            </label>
            <label className="mb-4 flex flex-col" htmlFor="category">
              <span className="mb-1 font-semibold">Kategori*</span>
              <select
                className="rounded"
                data-testid="form_category"
                name="category"
                id="category"
                value={courseFields?.category}
                onChange={handleCourseFieldChange}
              >
                <option disabled value="">
                  Velg kategori
                </option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : null}
        {current === 1 ? (
          <div
            data-testid="lesson_step"
            className="grid w-full grid-cols-[350px_minmax(50%,_1fr)] gap-12"
          >
            <aside className="border-r border-slate-200 pr-6">
              <h3 className="mb-4 text-base font-bold">Leksjoner</h3>
              <ul data-testid="lessons">
                {lessons?.length > 0 &&
                  lessons?.map((lesson, index) => (
                    <li
                      className={`borde mb-4 w-full rounded px-4 py-2 text-base ${
                        index === currentLesson
                          ? "border border-transparent bg-emerald-200"
                          : "border border-slate-300 bg-transparent"
                      }`}
                      key={lesson?.id ?? index}
                    >
                      <button
                        type="button"
                        data-testid="select_lesson_btn"
                        className="w-full max-w-full truncate pr-2 text-left"
                        onClick={() => changeCurrentLesson(index)}
                      >
                        {" "}
                        {lesson?.title || `Leksjon ${index + 1}`}
                      </button>
                    </li>
                  ))}
              </ul>
              <div className="flex">
                <button
                  className="w-full bg-slate-100 px-2 py-2"
                  type="button"
                  onClick={addLesson}
                  data-testid="form_lesson_add"
                >
                  + Ny leksjon
                </button>
              </div>
            </aside>
            {lessons?.length > 0 ? (
              <div className="w-full">
                <label className="mb-4 flex flex-col" htmlFor="title">
                  <span className="mb-1 font-semibold">Tittel*</span>
                  <input
                    className="rounded"
                    data-testid="form_lesson_title"
                    type="text"
                    name="title"
                    id="title"
                    value={lessons[currentLesson]?.title}
                    onChange={handleLessonFieldChange}
                  />
                </label>
                <label className="mb-4 flex flex-col" htmlFor="slug">
                  <span className="mb-1 font-semibold">Slug*</span>
                  <input
                    className="rounded"
                    data-testid="form_lesson_slug"
                    type="text"
                    name="slug"
                    id="slug"
                    value={lessons[currentLesson]?.slug}
                    onChange={handleLessonFieldChange}
                  />
                </label>
                <label className="mb-4 flex flex-col" htmlFor="preAmble">
                  <span className="mb-1 font-semibold">Ingress*</span>
                  <input
                    className="rounded"
                    data-testid="form_lesson_preAmble"
                    type="text"
                    name="preAmble"
                    id="preAmble"
                    value={lessons[currentLesson]?.preAmble}
                    onChange={handleLessonFieldChange}
                  />
                </label>
                {lessons[currentLesson]?.text?.length > 1 ? (
                  lessons[currentLesson]?.text?.map((field, index) => (
                    <div key={field?.id}>
                      <label
                        className="mt-4 flex flex-col"
                        htmlFor={`text-${field?.id}`}
                      >
                        <span className="text-sm font-semibold">Tekst*</span>
                        <div className="mb-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={useRichEditor}
                              onChange={(e) =>
                                setUseRichEditor(e.target.checked)
                              }
                            />
                            <span className="text-sm">
                              Bruk avansert editor
                            </span>
                          </label>
                        </div>
                        {/* Har fått hjelp av claude.ai til implementasjonen av den utbyttbare editoren */}
                        <TextEditor
                          value={field?.text}
                          onChange={(value) => {
                            const updatedLessons = [...lessons];
                            updatedLessons[currentLesson].text[index].text =
                              value;
                            setLessons(updatedLessons);
                          }}
                          useRichText={useRichEditor}
                        />
                      </label>
                      <button
                        className="text-sm font-semibold text-red-400"
                        type="button"
                        onClick={() => removeTextBox(index)}
                      >
                        Fjern
                      </button>
                    </div>
                  ))
                ) : (
                  <label className="mb-4 flex flex-col" htmlFor="text">
                    <span className="mb-1 text-sm font-semibold">Tekst*</span>
                    <div className="mb-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={useRichEditor}
                          onChange={(e) => setUseRichEditor(e.target.checked)}
                        />
                        <span className="text-sm">Bruk avansert editor</span>
                      </label>
                    </div>
                    {/* Har fått hjelp av claude.ai til implementasjonen av den utbyttbare editoren */}
                    <TextEditor
                      value={lessons[currentLesson]?.text?.[0]?.text || ""}
                      onChange={(value) => {
                        const updatedLessons = [...lessons];
                        if (!updatedLessons[currentLesson].text[0]) {
                          updatedLessons[currentLesson].text[0] = {
                            id: generateRandomId(),
                            text: "",
                          };
                        }
                        updatedLessons[currentLesson].text[0].text = value;
                        setLessons(updatedLessons);
                      }}
                      useRichText={useRichEditor}
                    />
                  </label>
                )}
                <button
                  className="mt-6 w-full rounded bg-gray-300 px-4 py-3 font-semibold"
                  type="button"
                  onClick={addTextBox}
                  data-testid="form_lesson_add_text"
                >
                  + Legg til tekstboks
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
        {formError ? (
          <p data-testid="form_error">Fyll ut alle felter med *</p>
        ) : null}
        {success ? (
          <p className="text-emerald-600" data-testid="form_success">
            Skjema sendt
          </p>
        ) : null}
        {current === 2 ? (
          <section data-testid="review">
            <h3 data-testid="review_course" className="mt-4 text-lg font-bold">
              Kurs
            </h3>
            <p data-testid="review_course_title">
              Tittel: {courseFields?.title}
            </p>
            <p data-testid="review_course_slug">Slug: {courseFields?.slug}</p>
            <p data-testid="review_course_description">
              Beskrivelse: {courseFields?.description}
            </p>
            <p data-testid="review_course_category">
              Kategori: {courseFields?.category}
            </p>
            <h3
              data-testid="review_course_lessons"
              className="mt-4 text-lg font-bold"
            >
              Leksjoner ({lessons?.length})
            </h3>
            <ul data-testid="review_lessons" className="list-decimal pl-4">
              {lessons?.length > 0 &&
                lessons.map((lesson, index) => (
                  <li
                    className="mt-2 mb-8 list-item"
                    key={`${lesson?.slug}-${index}`}
                  >
                    <p data-testid="review_lesson_title">
                      Tittel: {lesson?.title}
                    </p>
                    <p data-testid="review_lesson_slug">Slug: {lesson?.slug}</p>
                    <p data-testid="review_lesson_preamble">
                      Ingress: {lesson?.preAmble}
                    </p>
                    <p>Tekster: </p>
                    <ul
                      data-testid="review_lesson_texts"
                      className="list-inside"
                    >
                      {lesson?.text?.length > 0 &&
                        lesson.text.map((text) => (
                          <li
                            data-testid="review_lesson_text"
                            className="mb-1 pl-4"
                            key={text?.id}
                          >
                            {text?.text}
                          </li>
                        ))}
                    </ul>
                  </li>
                ))}
            </ul>
          </section>
        ) : null}
      </form>
    </>
  );
}
