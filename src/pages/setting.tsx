import React from "react";
import { Box, Heading, Stack } from "@chakra-ui/react";
import UpdateUsername from "~/components/User/UpdateUsername";
import UpdateEmail from "~/components/User/UpdateEmail";
import UpdatePassword from "~/components/User/UpdatePassword";
import Page from "~/components/Shared/Page";

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
