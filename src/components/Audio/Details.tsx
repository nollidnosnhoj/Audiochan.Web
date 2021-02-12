import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import Router from "next/router";
import React, { useEffect, useState } from "react";
import Link from "../Shared/Link";
import Picture from "../Shared/Picture";
import { useAddAudioPicture } from "~/lib/services/audio";
import { Audio } from "~/lib/types/audio";
import { relativeDate } from "~/utils/time";
import { successfulToast } from "~/utils/toast";

interface AudioMetaProps {
  audio: Audio;
}

const AudioDetails: React.FC<AudioMetaProps> = ({ audio }) => {
  const {
    id,
    title,
    description,
    created,
    user,
    picture: audioPicture,
  } = audio;

  const {
    mutateAsync: uploadArtwork,
    isLoading: isAddingArtwork,
  } = useAddAudioPicture(id);

  const [picture, setPicture] = useState(() => {
    return audio?.picture
      ? `https://audiochan.s3.amazonaws.com/${audioPicture}`
      : "";
  });

  useEffect(() => {
    Router.prefetch(`/users/${user.username}`);
  }, []);

  return (
    <Flex marginBottom={4}>
      <Box flex="1">
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
        <Flex alignItems="center">
          <Link href={`/users/${user.username}`}>
            <Text fontSize="sm">{user.username}</Text>
          </Link>
        </Flex>
        <Box as="header">
          <Heading as="h1" fontSize="3xl" paddingY="2">
            {title}
          </Heading>
        </Box>
        <Text fontSize="sm">{description}</Text>
        <Text fontSize="xs" as="i">
          Uploaded {relativeDate(created)}
        </Text>
      </Box>
    </Flex>
  );
};

export default AudioDetails;
