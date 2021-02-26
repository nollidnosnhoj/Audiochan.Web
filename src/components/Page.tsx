import { Box } from "@chakra-ui/react";
import Head from "next/head";
import Router, { useRouter } from "next/router";
import React, { useEffect, useMemo } from "react";
import Container from "~/components/Container";
import Header from "~/components/Header";
import useUser from "~/contexts/userContext";

interface PageProps {
  title?: string;
  loginRequired?: boolean;
  useHeader?: boolean;
  beforeContainer?: React.ReactNode;
}

const Page: React.FC<PageProps> = ({
  title = "Audiochan",
  loginRequired = false,
  useHeader = true,
  beforeContainer,
  children,
  ...props
}) => {
  const { user } = useUser();
  const { asPath } = useRouter();

  const loginUrl = useMemo<string>(() => {
    return `/login?redirect=${decodeURIComponent(asPath)}`;
  }, [asPath]);

  const notAuthorized = useMemo<boolean>(() => {
    return !user && loginRequired;
  }, [user, loginRequired]);

  useEffect(() => {
    if (notAuthorized) {
      Router.push(loginUrl);
    }
  }, [user, asPath, loginRequired]);

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <Box boxShadow="md">
        {useHeader && <Header />}
        {beforeContainer}
      </Box>
      <Container pb="3" pt="3" {...props}>
        <Box paddingX="5" paddingY="1.5rem">
          {!notAuthorized && children}
        </Box>
      </Container>
    </>
  );
};

export default Page;
