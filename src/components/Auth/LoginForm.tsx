import React, { useCallback, useState } from "react";
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  CloseButton,
  Stack,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import * as yup from "yup";
import TextInput from "../Form/TextInput";
import useUser from "~/lib/contexts/user_context";
import { apiErrorToast, successfulToast } from "~/utils/toast";
import { isAxiosError } from "~/utils/axios";
import { ErrorResponse } from "~/lib/types";

export type LoginFormValues = {
  username: string;
  password: string;
};

interface LoginFormProps {
  onSuccess?: () => void;
}

export default function LoginForm(props: LoginFormProps) {
  const { login } = useUser();
  const [error, setError] = useState("");

  const formik = useFormik<LoginFormValues>({
    onSubmit: async (values) => {
      try {
        await login(values);
        successfulToast({ message: "You have logged in successfully. " });
        if (props.onSuccess) props.onSuccess();
      } catch (err) {
        let errorMessage = "An error has occurred.";
        if (isAxiosError<ErrorResponse>(err)) {
          errorMessage = err.response?.data.message ?? errorMessage;
        }
        setError(errorMessage);
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
    <Box>
      {error && (
        <Alert status="error">
          <Box>{error}</Box>
          <CloseButton
            onClick={() => setError("")}
            position="absolute"
            right="8px"
            top="8px"
          />
        </Alert>
      )}
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
    </Box>
  );
}
