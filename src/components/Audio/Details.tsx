import {
  Badge,
  Box,
  Flex,
  Heading,
  HStack,
  IconButton,
  Spacer,
  Stack,
  Tag,
  Text,
  useDisclosure,
  VStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import Router from "next/router";
import React, { useEffect, useState } from "react";
import { EditIcon } from "@chakra-ui/icons";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import AudioEdit from "./Edit";
import Link from "../Shared/Link";
import Picture from "../Shared/Picture";
import { useAddAudioPicture, useFavorite } from "~/lib/services/audio";
import { Audio } from "~/lib/types/audio";
import { formatDuration, relativeDate } from "~/utils/time";
import { successfulToast } from "~/utils/toast";
import useUser from "~/lib/contexts/user_context";

interface AudioMetaProps {
  audio: Audio;
}

const AudioDetails: React.FC<AudioMetaProps> = ({ audio }) => {
  const { user: currentUser } = useUser();

  const { isFavorite, favorite, isLoading: isFavoriteLoading } = useFavorite(
    audio.id,
    audio.isFavorited
  );

  const {
    mutateAsync: uploadArtwork,
    isLoading: isAddingArtwork,
  } = useAddAudioPicture(audio.id);

  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const [picture, setPicture] = useState(() => {
    return audio?.picture
      ? `https://audiochan.s3.amazonaws.com/${audio.picture}`
      : "";
  });

  useEffect(() => {
    Router.prefetch(`/users/${audio.user.username}`);
  }, []);

  return (
    <Flex marginBottom={4} width="100%">
      <Box flex="1">
        <Picture
          src={picture}
          size={200}
          isEager
          disabled={isAddingArtwork}
          canReplace={currentUser?.id === audio.user.id}
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
        <Stack direction="row" alignItems="center">
          <Flex>
            <Link href={`/users/${audio.user.username}`}>
              <Text fontSize="sm">{audio.user.username}</Text>
            </Link>
          </Flex>
          <Spacer />
          <HStack justifyContent="flex-end">
            {currentUser && currentUser.id !== audio.user.id && (
              <IconButton
                isRound
                colorScheme="pink"
                variant="ghost"
                size="lg"
                icon={isFavorite ? <AiOutlineHeart /> : <AiFillHeart />}
                aria-label={isFavorite ? "Unfavorite" : "Favorite"}
                onClick={favorite}
                isLoading={isFavoriteLoading}
              />
            )}
            {audio.user.id === currentUser?.id && (
              <IconButton
                isRound
                variant="ghost"
                size="lg"
                icon={<EditIcon />}
                aria-label="Edit"
                onClick={onEditOpen}
              />
            )}
          </HStack>
        </Stack>
        <Stack direction="row">
          <Box>
            <Flex as="header" alignItems="center" marginBottom={4}>
              <Heading as="h1" fontSize="3xl" paddingY="2">
                {audio.title}
              </Heading>
              <Spacer />
              <VStack spacing={2} alignItems="normal" textAlign="right">
                {audio.genre && (
                  <Box>
                    <Badge>{audio.genre?.name}</Badge>
                  </Box>
                )}
                <Box>{formatDuration(audio.duration)}</Box>
              </VStack>
            </Flex>
            <Text fontSize="sm">{audio.description}</Text>
            <Text fontSize="xs" as="i">
              Uploaded {relativeDate(audio.created)}
            </Text>
          </Box>
        </Stack>
      </Box>
      <AudioEdit audio={audio} isOpen={isEditOpen} onClose={onEditClose} />
    </Flex>
  );
};

export default AudioDetails;
