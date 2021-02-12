import React from "react";
import { Button } from "@chakra-ui/react";
import * as yup from "yup";
import { useFormik } from "formik";
import TextInput from "~/components/Form/TextInput";
import useUser from "~/lib/contexts/user_context";
import { usernameRule } from "~/lib/validationSchemas";
import api from "~/utils/api";
import { apiErrorToast } from "~/utils/toast";

export default function UpdateUsername() {
  const { user, updateUser } = useUser();

  const formik = useFormik<{ username: string }>({
    initialValues: { username: user?.username ?? "" },
    validationSchema: yup.object().shape({
      username: usernameRule("Username").notOneOf(
        [user?.username],
        "Username cannot be the same."
      ),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      const { username } = values;
      if (username.toLowerCase() === user?.username) return;

      try {
        await api.patch("me/change-username", { username });
        if (user) {
          updateUser({ ...user, username: username });
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
        name="username"
        value={values.username}
        onChange={handleChange}
        error={errors.username}
        label="Change Username"
        required
      />
      <Button
        type="submit"
        isLoading={isSubmitting}
        disabled={isSubmitting}
        loadingText="Submitting..."
      >
        Update Username
      </Button>
    </form>
  );
}
