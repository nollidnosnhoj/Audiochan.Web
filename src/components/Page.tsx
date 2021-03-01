import { Box } from "@chakra-ui/react";
import Head from "next/head";
import React from "react";
import Container from "~/components/Container";
import Header from "~/components/Header";

interface PageProps {
  title?: string;
  useHeader?: boolean;
  beforeContainer?: React.ReactNode;
}

const Page: React.FC<PageProps> = ({
  title = "Audiochan",
  useHeader = true,
  beforeContainer,
  children,
  ...props
}) => {
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
        {children}
      </Container>
    </>
  );
};

export default Page;
