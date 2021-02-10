import { Button } from "@chakra-ui/react";
import * as yup from "yup";
import { useFormik } from "formik";
import TextInput from "~/components/Form/TextInput";
import useUser from "~/lib/contexts/user_context";
import request from "~/lib/request";
import { apiErrorToast } from "~/utils/toast";
import React from "react";
import { validationMessages } from "~/utils";

export default function UpdateEmail() {
  const { user, updateUser } = useUser();

  const formik = useFormik<{ email: string }>({
    initialValues: { email: user?.email ?? "" },
    validationSchema: yup.object().shape({
      email: yup
        .string()
        .required(validationMessages.required("Email"))
        .email("Email is invalid"),
    }),
    onSubmit: async (values: { email: string }, { setSubmitting }) => {
      const { email } = values;
      if (email.trim() === user?.email) return;

      try {
        await request("me/change-email", { method: "patch", data: email });
        if (user) {
          updateUser({ ...user, email: email.trim() });
        }
      } catch (err) {
        apiErrorToast(err);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const { errors, values, handleSubmit, handleChange, isSubmitting } = formik;

  return (
    <form onSubmit={handleSubmit}>
      <TextInput
        name="email"
        value={values.email}
        onChange={handleChange}
        error={errors.email}
        label="Change Email"
        required
      />
      <Button
        type="submit"
        isLoading={isSubmitting}
        disabled={isSubmitting}
        loadingText="Submitting..."
      >
        Update Email
      </Button>
    </form>
  );
}
