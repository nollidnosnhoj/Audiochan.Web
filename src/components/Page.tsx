import { Box } from "@chakra-ui/react";
import Head from "next/head";
import React, { useMemo } from "react";
import Container from "~/components/Container";
import Header from "~/components/Header";
import useUser from "~/contexts/userContext";
import LoginForm from "~/features/auth/components/LoginForm";

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
  const { user, isLoading } = useUser();

  const notAuthorized = useMemo<boolean>(() => {
    return !user && loginRequired;
  }, [user, loginRequired]);

  const content = useMemo(() => {
    if (isLoading && notAuthorized) return null;
    if (notAuthorized) return <LoginForm />;
    return children;
  }, [isLoading, notAuthorized]);

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <Box boxShadow="md">
        {useHeader && <Header />}
        {beforeContainer}
      </Box>
      <Container pb="3" pt="3" px="5" {...props}>
        {content}
      </Container>
    </>
  );
};

export default Page;
