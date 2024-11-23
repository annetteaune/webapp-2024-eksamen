import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FormFields,
  FormSubmitEvent,
  InputChangeEvent,
} from "@/interfaces/types";
import { fetcher } from "@/api/fetcher";

export const useSignup = () => {
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState(false);
  const [fields, setFields] = useState<FormFields>({
    name: "",
    email: "",
    admin: false,
  });
  const router = useRouter();

  const formIsValid = Object.values(fields).filter((val) => val?.length === 0);

  const handleSubmit = async (event: FormSubmitEvent) => {
    event.preventDefault();
    setFormError(false);
    setSuccess(false);

    if (!fields.name || !fields.email) {
      setFormError(true);
      return;
    }

    if (formIsValid.length === 0) {
      setSuccess(true);
      try {
        const response = await fetcher("/brukere", {
          method: "POST",
          body: JSON.stringify({
            name: fields.name,
            email: fields.email,
          }),
        });

        if (response.success) {
          setTimeout(() => {
            router.push("/kurs");
          }, 1000);
        }
      } catch (error) {
        console.error("Failed to create user:", error);
        setFormError(true);
      }
    }
  };

  const handleChange = (event: InputChangeEvent) => {
    const { name, value } = event.target;
    setFields((prev) => ({ ...prev, [name]: value }));
  };

  return {
    success,
    formError,
    fields,
    handleSubmit,
    handleChange,
  };
};
