import { useSignup } from "@/hooks/useSignup";

export default function SignUp() {
  const { success, formError, fields, handleSubmit, handleChange } =
    useSignup();

  return (
    <section className="mx-auto max-w-xl" data-testid="sign_up">
      <h2 className="mb-4 text-xl font-bold" data-testid="title">
        Ny bruker
      </h2>
      <form data-testid="form" onSubmit={handleSubmit} noValidate>
        <label className="mb-4 flex flex-col" htmlFor="name">
          <span className="mb-1 font-semibold">Navn*</span>
          <input
            className="rounded"
            data-testid="form_name"
            type="text"
            name="name"
            id="name"
            value={fields?.name}
            onChange={handleChange}
          />
        </label>
        <label className="mb-4 flex flex-col" htmlFor="email">
          <span className="mb-1 font-semibold">Epost*</span>
          <input
            className="rounded"
            data-testid="form_email"
            type="email"
            name="email"
            id="email"
            value={fields?.email}
            onChange={handleChange}
          />
        </label>
        <label className="flex items-center gap-2" htmlFor="admin">
          <input
            className="rounded"
            data-testid="form_admin"
            type="checkbox"
            name="admin"
            id="admin"
            onChange={handleChange}
            checked={fields?.admin}
          />
          <span className="font-semibold">Admin</span>
        </label>
        <button
          className="mt-8 rounded bg-emerald-600 px-10 py-2 text-center text-base text-white"
          data-testid="form_submit"
          type="submit"
        >
          Lag ny bruker
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
            Skjema sendt
          </p>
        ) : null}
      </form>
    </section>
  );
}
