import React from "react";
import { Button, Stack } from "@chakra-ui/react";
import { useFormik } from "formik";
import * as yup from "yup";
import TextInput from "../Form/TextInput";
import useUser from "~/lib/contexts/user_context";
import { apiErrorToast, successfulToast } from "~/utils/toast";

export type LoginFormValues = {
  username: string;
  password: string;
};

interface LoginFormProps {
  onSuccess?: () => void;
}

export default function LoginForm(props: LoginFormProps) {
  const { login } = useUser();

  const formik = useFormik<LoginFormValues>({
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await login(values);
        successfulToast({ message: "You have logged in successfully. " });
        if (props.onSuccess) props.onSuccess();
      } catch (err) {
        apiErrorToast(err);
      } finally {
        setSubmitting(false);
      }
    },
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: yup.object().shape({
      username: yup.string().required(),
      password: yup.string().required(),
    }),
  });

  const { handleSubmit, handleChange, values, errors, isSubmitting } = formik;

  return (
    <form onSubmit={handleSubmit}>
      <TextInput
        name="username"
        value={values.username}
        onChange={handleChange}
        error={errors.username}
        label="Username/Email"
        required
      />
      <TextInput
        name="password"
        type="password"
        value={values.password}
        onChange={handleChange}
        error={errors.username}
        label="Password"
        required
      />
      <Button
        marginTop={4}
        width="100%"
        type="submit"
        isLoading={isSubmitting}
        colorScheme="primary"
      >
        Login
      </Button>
    </form>
  );
}
