import React, { useMemo, useState } from "react";
import {
  Box,
  Flex,
  useDisclosure,
  Button,
  Text,
  Image,
} from "@chakra-ui/react";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { QueryClient } from "react-query";
import { dehydrate } from "react-query/hydration";
import AudioDetails from "~/components/Audio/Details";
import Container from "~/components/Shared/Container";
import Page from "~/components/Shared/Page";
import Picture from "~/components/Shared/Picture";
import AudioEdit from "~/components/Audio/Edit";
import useUser from "~/lib/contexts/user_context";
import {
  fetchAudioById,
  useAddAudioPicture,
  useAudio,
} from "~/lib/services/audio";
import { getAccessToken } from "~/utils/cookies";
import PictureDropzone from "~/components/Shared/Picture/PictureDropzone";
import { successfulToast } from "~/utils/toast";

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
  const { user } = useUser();
  const { query } = useRouter();
  const id = query.id as string;

  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const { data: audio } = useAudio(id, {
    staleTime: 1000,
  });

  if (!audio) {
    return (
      <Page title="Audio was not found.">
        <Text>Audio was not found.</Text>
      </Page>
    );
  }

  const [picture, setPicture] = useState(() => {
    return audio?.picture
      ? `https://audiochan.s3.amazonaws.com/${audio.picture}`
      : "";
  });

  const {
    mutateAsync: uploadArtwork,
    isLoading: isAddingArtwork,
  } = useAddAudioPicture(audio.id);

  return (
    <Page
      title={audio.title ?? "Removed"}
      beforeContainer={
        <Container>
          <DynamicAudioPlayer
            uploadId={audio.uploadId}
            isLoop={audio.isLoop}
            duration={audio.duration}
          />
        </Container>
      }
    >
      <Flex>
        <Box flex="2">
          <Flex>
            <Box flex="1" marginRight={4}>
              <Picture
                src={picture}
                size={200}
                isEager
                disabled={isAddingArtwork}
                canReplace={user?.id === audio?.user?.id}
                onReplace={(data) => {
                  uploadArtwork(data).then(({ data }) => {
                    setPicture(data.image);
                    successfulToast({
                      title: "Image successfully uploaded.",
                      message: "Image may take a couple minutes to update.",
                    });
                  });
                }}
              />
            </Box>
            <Box flex="3">
              <AudioDetails
                title={audio.title ?? ""}
                description={audio.description ?? ""}
                username={audio.user?.username ?? "ERROR"}
                created={audio.created ?? ""}
              />
            </Box>
          </Flex>
        </Box>
        <Box flex="1">
          {user && user.id === audio.user?.id && (
            <Button width="100%" onClick={onEditOpen} colorScheme="primary">
              Edit
            </Button>
          )}
        </Box>
      </Flex>
      <AudioEdit audio={audio} isOpen={isEditOpen} onClose={onEditClose} />
    </Page>
  );
}
