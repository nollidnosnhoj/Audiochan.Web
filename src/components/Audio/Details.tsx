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
import React, { useEffect, useMemo, useState } from "react";
import { EditIcon } from "@chakra-ui/icons";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import AudioEdit from "./Edit";
import Link from "../Shared/Link";
import Picture from "../Shared/Picture";
import { useAddAudioPicture, useAudioFavorite } from "~/lib/services/audio";
import { Audio } from "~/lib/types/audio";
import { formatDuration, relativeDate } from "~/utils/time";
import { successfulToast } from "~/utils/toast";
import useUser from "~/lib/contexts/user_context";

interface AudioDetailProps {
  audio: Audio;
}

const AudioDetails: React.FC<AudioDetailProps> = ({ audio }) => {
  const { user: currentUser } = useUser();

  const {
    isFavorite,
    onFavorite: favorite,
    isLoading: isFavoriteLoading,
  } = useAudioFavorite(audio.id, audio.isFavorited);

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

  const audioDurationFormatted = useMemo(() => {
    return formatDuration(audio.duration);
  }, [audio.duration]);

  const audioCreatedDateRelative = useMemo(() => {
    return relativeDate(audio.created);
  }, [audio.created]);

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
          <Stack direction="column" spacing="0" fontSize="sm">
            <Link href={`/users/${audio.user.username}`}>
              <Text fontWeight="500">{audio.user.username}</Text>
            </Link>
            <Text>{audioCreatedDateRelative}</Text>
          </Stack>
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
          <Stack direction="column" spacing={2}>
            <Flex as="header" alignItems="center">
              <Heading as="h1" fontSize="2xl">
                {audio.title}
              </Heading>
              <Spacer />
              <VStack spacing={2} alignItems="normal" textAlign="right">
                <Box>
                  {audio.genre && (
                    <Badge fontSize="sm" letterSpacing="1.1" fontWeight="800">
                      {audio.genre.name}
                    </Badge>
                  )}
                </Box>
                <Box>{audioDurationFormatted}</Box>
              </VStack>
            </Flex>
            <Text fontSize="sm">{audio.description}</Text>
            {audio.tags && (
              <Box>
                <Heading as="h2" fontSize="lg">
                  Tags
                </Heading>
                <Wrap marginTop={2}>
                  {audio.tags.map((tag, idx) => (
                    <WrapItem key={idx}>
                      <Tag size="sm">{tag}</Tag>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>
            )}
          </Stack>
        </Stack>
      </Box>
      <AudioEdit audio={audio} isOpen={isEditOpen} onClose={onEditClose} />
    </Flex>
  );
};

export default AudioDetails;
