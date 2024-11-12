import { useState } from "react";
import { useComments } from "@/hooks/useComments";
import type {
  FormSubmitEvent,
  InputChangeEvent,
  TextAreaChangeEvent,
} from "@/interfaces/types";
import { generateRandomId } from "@/lib/utils/randomId";

interface CommentsProps {
  lessonSlug: string;
}

export default function Comments({ lessonSlug }: CommentsProps) {
  const [success, setSuccess] = useState<boolean>(false);
  const [formError, setFormError] = useState<boolean>(false);
  const [comment, setComment] = useState<string>("");
  const [name, setName] = useState<string>("");

  const { comments, addComment } = useComments(lessonSlug);

  const handleComment = (event: TextAreaChangeEvent) => {
    setComment(event.target.value);
  };

  const handleName = (event: InputChangeEvent) => {
    setName(event.target.value);
  };

  const handleSubmit = async (event: FormSubmitEvent) => {
    event.preventDefault();
    setFormError(false);
    setSuccess(false);

    if (!comment || !name || !lessonSlug) {
      setFormError(true);
      return;
    }

    try {
      await addComment({
        comment,
        createdById: String(generateRandomId()),
        createdByName: name,
        lessonSlug,
      });

      setSuccess(true);
      setComment("");
      setName("");
    } catch (error) {
      setFormError(true);
    }
  };

  return (
    <section data-testid="comments">
      <h4 className="mt-8 mb-4 text-lg font-bold">
        Kommentarer ({comments?.length})
      </h4>
      <form data-testid="comment_form" onSubmit={handleSubmit} noValidate>
        <label className="mb-4 flex flex-col" htmlFor="name">
          <span className="mb-1 text-sm font-semibold">Navn*</span>
          <input
            data-testid="form_name"
            type="text"
            name="name"
            id="name"
            value={name}
            onChange={handleName}
            className="w-full rounded bg-slate-100"
          />
        </label>
        <label className="mb-4 flex flex-col" htmlFor="comment">
          <span className="mb-1 text-sm font-semibold">
            Legg til kommentar*
          </span>
          <textarea
            data-testid="form_textarea"
            name="comment"
            id="comment"
            value={comment}
            onChange={handleComment}
            className="w-full rounded bg-slate-100"
            cols={30}
          />
        </label>
        <button
          className="rounded bg-emerald-600 px-10 py-2 text-center text-base text-white"
          data-testid="form_submit"
          type="submit"
        >
          Legg til kommentar
        </button>
        {formError ? (
          <p className="font-semibold text-red-500" data-testid="form_error">
            Fyll ut alle felter med *
          </p>
        ) : null}
        {success ? (
          <p
            className="font-semibold text-emerald-500"
            data-testid="form_success"
          >
            Kommentar lagt til
          </p>
        ) : null}
      </form>
      <ul className="mt-8" data-testid="comments_list">
        {comments?.length > 0
          ? comments.map((c) => (
              <li
                className="mb-6 rounded border border-slate-200 px-4 py-6"
                key={c.id}
              >
                <h5 data-testid="user_comment_name" className="font-bold">
                  {c.createdBy.name}
                </h5>
                <p data-testid="user_comment">{c.comment}</p>
              </li>
            ))
          : null}
      </ul>
    </section>
  );
}
