import React, { useEffect, useMemo } from "react";
import { Box, Flex } from "@chakra-ui/react";
import Router, { useRouter } from "next/router";
import LoginForm from "~/components/Auth/LoginForm";
import Page from "~/components/Shared/Page";
import useUser from "~/lib/contexts/user_context";

export default function LoginPage() {
  const { query } = useRouter();
  const { user } = useUser();

  const redirect = useMemo<string>(() => {
    return decodeURIComponent((query.redirect as string) || "/");
  }, [query]);

  useEffect(() => {
    if (user) {
      Router.push(redirect);
    }
  }, [user]);

  useEffect(() => {
    Router.prefetch(redirect);
  }, [redirect]);

  return (
    <Page title="Login">
      <Flex justify="center">
        <Box width="500px">
          <LoginForm
            onSuccess={() => {
              Router.push(redirect);
            }}
          />
        </Box>
      </Flex>
    </Page>
  );
}
