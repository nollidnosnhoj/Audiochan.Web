import {
  Box,
  Flex,
  Heading,
  HStack,
  IconButton,
  Spacer,
  Text,
  useDisclosure,
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
import { relativeDate } from "~/utils/time";
import { successfulToast } from "~/utils/toast";
import useUser from "~/lib/contexts/user_context";

interface AudioMetaProps {
  audio: Audio;
}

const AudioDetails: React.FC<AudioMetaProps> = ({ audio }) => {
  const { user: currentUser } = useUser();

  const {
    id,
    title,
    description,
    created,
    user,
    picture: audioPicture,
  } = audio;

  const { isFavorite, favorite, isLoading: isFavoriteLoading } = useFavorite(
    id,
    audio.isFavorited
  );

  const {
    mutateAsync: uploadArtwork,
    isLoading: isAddingArtwork,
  } = useAddAudioPicture(id);

  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const [picture, setPicture] = useState(() => {
    return audio?.picture
      ? `https://audiochan.s3.amazonaws.com/${audioPicture}`
      : "";
  });

  useEffect(() => {
    Router.prefetch(`/users/${user.username}`);
  }, []);

  return (
    <Flex marginBottom={4} width="100%">
      <Box flex="1">
        <Picture
          src={picture}
          size={200}
          isEager
          disabled={isAddingArtwork}
          canReplace={currentUser?.id === user.id}
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
        <HStack alignItems="center">
          <Box>
            <Link href={`/users/${user.username}`}>
              <Text fontSize="sm">{user.username}</Text>
            </Link>
          </Box>
          <Spacer />
          <Flex justifyContent="flex-end">
            <HStack>
              {currentUser && currentUser.id !== user.id && (
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
              {user.id === currentUser?.id && (
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
          </Flex>
        </HStack>
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
      <AudioEdit audio={audio} isOpen={isEditOpen} onClose={onEditClose} />
    </Flex>
  );
};

export default AudioDetails;
