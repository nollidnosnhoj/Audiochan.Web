import React from "react";
import { Box, Heading, Stack } from "@chakra-ui/react";
import UpdateUsername from "~/features/user/components/UpdateUsername";
import UpdateEmail from "~/features/user/components/UpdateEmail";
import UpdatePassword from "~/features/user/components/UpdatePassword";
import Page from "~/components/Page";

export default function SettingPage() {
  return (
    <Page title="Settings" loginRequired>
      <Stack direction="column" spacing={4}>
        <Box>
          <Heading>Account</Heading>
          <UpdateUsername />
          <UpdateEmail />
        </Box>
        <Box>
          <Heading>Password</Heading>
          <UpdatePassword />
        </Box>
      </Stack>
    </Page>
  );
}
