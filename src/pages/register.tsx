import { Box, Flex } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useMemo } from "react";
import Page from "~/components/Page";
import useUser from "~/contexts/userContext";
import RegisterForm from "~/features/auth/components/RegisterForm";

export default function LoginPage() {
  const router = useRouter();
  const { query } = router;

  const redirect = useMemo(() => {
    return (query.redirect as string) || "/";
  }, [query]);

  const { isLoggedIn } = useUser();

  if (isLoggedIn) {
    router.push(redirect);
    return;
  }

  return (
    <Page title="Login">
      <Flex justify="center" align="center" height="50vh">
        <Box width="550px">
          <RegisterForm onSuccess={() => router.push("/login")} />
        </Box>
      </Flex>
    </Page>
  );
}
