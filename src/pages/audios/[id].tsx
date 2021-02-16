import React from "react";
import {
  Box,
  Flex,
  useDisclosure,
  Button,
  Stack,
  VStack,
  Wrap,
  WrapItem,
  Tag,
  Heading,
} from "@chakra-ui/react";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { QueryClient } from "react-query";
import { dehydrate } from "react-query/hydration";
import AudioDetails from "~/components/Audio/Details";
import Container from "~/components/Shared/Container";
import Page from "~/components/Shared/Page";
import AudioEdit from "~/components/Audio/Edit";
import useUser from "~/lib/contexts/user_context";
import { fetchAudioById, useAudio } from "~/lib/services/audio";
import { getAccessToken } from "~/utils/cookies";
import AudioFeedbacks from "~/components/Audio/Feedbacks";

const DynamicAudioPlayer = dynamic(() => import("~/components/Audio/Player"), {
  ssr: false,
});

// Fetch the audio detail and render it onto the server.
export const getServerSideProps: GetServerSideProps = async (context) => {
  const queryClient = new QueryClient();
  const id = context.params?.id as string;
  const accessToken = getAccessToken(context);

  try {
    await queryClient.fetchQuery(["audios", id], () =>
      fetchAudioById(id, { accessToken })
    );
    return {
      props: {
        dehydratedState: dehydrate(queryClient),
      },
    };
  } catch (err) {
    return {
      notFound: true,
    };
  }
};

export default function AudioDetailsPage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const { query } = useRouter();
  const id = query.id as string;

  const { data: audio } = useAudio(id, {
    staleTime: 1000,
  });

  if (!audio) return null;

  return (
    <Page
      title={audio.title ?? "Removed"}
      beforeContainer={
        <Container>
          <DynamicAudioPlayer audio={audio} />
        </Container>
      }
    >
      <Box>
        <AudioDetails audio={audio} />
        <Flex>
          <AudioFeedbacks audioId={audio.id} flex="3" />
        </Flex>
      </Box>
    </Page>
  );
}
