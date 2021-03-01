import {
  Badge,
  Box,
  BoxProps,
  Flex,
  Heading,
  Icon,
  Image,
  LinkBox,
  LinkOverlay,
  Stack,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import React, { useMemo, useState } from "react";
import NextImage from "next/image";
import NextLink from "next/link";
import { MdLoop } from "react-icons/md";
import Picture from "~/components/Picture";
import { Audio } from "~/features/audio/types";
import { formatDuration } from "~/utils/time";

interface AudioListItemProps {
  audio: Audio;
  removeArtistName?: boolean;
}

interface AudioListItemPictureProps {
  src: string;
  imageSize: number;
}

const AudioListItemPicture: React.FC<AudioListItemPictureProps & BoxProps> = ({
  src,
  imageSize,
}) => {
  const pictureLink = useMemo(() => {
    if (!src) return "";
    return `https://audiochan.s3.amazonaws.com/${src}`;
  }, [src]);

  if (!pictureLink) {
    return <Image src={pictureLink} height={imageSize} />;
  }

  return <NextImage src={pictureLink} width={imageSize} height={imageSize} />;
};

const AudioListItem: React.FC<AudioListItemProps> = ({
  audio,
  removeArtistName = false,
}) => {
  return (
    <LinkBox
      as="article"
      display="flex"
      marginBottom={4}
      boxShadow="lg"
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
    >
      <AudioListItemPicture
        src={audio.picture}
        imageSize={125}
        borderRightWidth="1px"
      />
      <Flex width="100%" paddingY={2} paddingX={4}>
        <Flex flex="3" alignItems="center">
          <Box>
            <Heading as="h3" size="lg">
              <NextLink href={`/audios/view/${audio.id}`} passHref>
                <LinkOverlay href={``}>{audio.title}</LinkOverlay>
              </NextLink>
            </Heading>
            {!removeArtistName && <Text as="i">{audio.user.username}</Text>}
          </Box>
        </Flex>
        <Flex flex="1" justify="flex-end">
          <Stack direction="column" spacing={1} textAlign="right">
            <Badge>{audio.genre?.name}</Badge>
            <Text fontSize="sm">{formatDuration(audio.duration)}</Text>
            <div>
              {audio.isLoop && (
                <Tooltip label="Loop" fontSize="sm">
                  <span>
                    <Icon as={MdLoop} />
                  </span>
                </Tooltip>
              )}
            </div>
          </Stack>
        </Flex>
      </Flex>
    </LinkBox>
  );
};

export default AudioListItem;
