import React from "react";
import { Button, Flex, Text } from "@chakra-ui/react";
import * as yup from "yup";
import { useFormik } from "formik";
import InputCheckbox from "../Form/Checkbox";
import TextInput from "../Form/TextInput";
import { passwordRule, usernameRule } from "~/lib/validationSchemas";
import { validationMessages } from "~/utils";
import api from "~/utils/api";
import { apiErrorToast, successfulToast } from "~/utils/toast";

type RegisterFormInputs = {
  username: string;
  password: string;
  email: string;
  confirmPassword: string;
};

const schema: yup.SchemaOf<RegisterFormInputs> = yup
  .object()
  .shape({
    username: usernameRule("Username"),
    password: passwordRule("Password"),
    email: yup
      .string()
      .required(validationMessages.required("Email"))
      .email()
      .defined(),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password")], "Password does not match.")
      .defined(),
  })
  .defined();

export default function RegisterForm() {
  const formik = useFormik<RegisterFormInputs>({
    initialValues: {
      username: "",
      password: "",
      email: "",
      confirmPassword: "",
    },
    validationSchema: schema,
    onSubmit: async (values, { setSubmitting }) => {
      const registrationRequest = {
        username: values.username,
        password: values.password,
        email: values.email,
      };

      try {
        await api.post("auth/register", registrationRequest);
        successfulToast({
          title: "Thank you for registering.",
          message: "You can now login to your account.",
        });
      } catch (err) {
        apiErrorToast(err);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const { values, errors, handleChange, handleSubmit, isSubmitting } = formik;

  return (
    <form onSubmit={handleSubmit}>
      <TextInput
        name="username"
        value={values.username}
        onChange={handleChange}
        error={errors.username}
        label="Username"
        required
      />
      <TextInput
        name="email"
        value={values.email}
        onChange={handleChange}
        error={errors.email}
        label="Email"
        required
      />
      <TextInput
        name="password"
        type="password"
        value={values.password}
        onChange={handleChange}
        error={errors.password}
        label="Password"
        required
      />
      <TextInput
        name="confirmPassword"
        type="password"
        value={values.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
        label="Confirm Password"
        required
      />
      <Text fontSize="sm">
        By registering, you agree to our terms and service.
      </Text>
      <Flex justify="flex-end">
        <Button
          marginTop={4}
          width="100%"
          type="submit"
          isLoading={isSubmitting}
          colorScheme="primary"
        >
          Register
        </Button>
      </Flex>
    </form>
  );
}
