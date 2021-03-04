import {
  Badge,
  Box,
  BoxProps,
  Flex,
  Heading,
  Stack,
  Text,
} from "@chakra-ui/react";
import React, { memo, useMemo } from "react";
import NextImage from "next/image";
import { Audio } from "~/features/audio/types";
import { formatDuration } from "~/utils/time";
import Link from "~/components/Link";
import Picture from "~/components/Picture";

interface AudioListItemProps {
  listIndex: number;
  audio: Audio;
  removeArtistName?: boolean;
}

const AudioListItem: React.FC<AudioListItemProps> = ({
  audio,
  listIndex,
  removeArtistName = false,
}) => {
  const picture = useMemo(() => {
    return audio?.picture
      ? `https://audiochan.s3.amazonaws.com/${audio.picture}`
      : "";
  }, [audio.picture]);

  return (
    <Box as="article" display="flex" marginBottom={4}>
      <Picture source={picture} imageSize={125} isLazy />
      <Flex width="100%" paddingY={2} marginLeft={8}>
        <Flex flex="3" alignItems="center">
          <Box>
            <Heading as="h3" size="lg">
              <Link href={`/audios/view/${audio.id}`}>{audio.title}</Link>
            </Heading>
            {!removeArtistName && (
              <Link href={`/users/${audio.user.username}`}>
                <Text as="i">{audio.user.username}</Text>
              </Link>
            )}
          </Box>
        </Flex>
        <Flex flex="1" justify="flex-end">
          <Stack direction="column" spacing={1} textAlign="right">
            <Text fontSize="sm">{formatDuration(audio.duration)}</Text>
            <Badge>{audio.genre?.name}</Badge>
          </Stack>
        </Flex>
      </Flex>
    </Box>
  );
};

export default AudioListItem;
