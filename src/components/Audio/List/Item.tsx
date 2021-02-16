import {
  Badge,
  Box,
  Flex,
  Heading,
  Icon,
  LinkBox,
  LinkOverlay,
  Stack,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import React, { useMemo } from "react";
import NextLink from "next/link";
import { MdLoop } from "react-icons/md";
import Picture from "~/components/Shared/Picture";
import { Audio } from "~/lib/types/audio";
import { formatDuration } from "~/utils/time";

interface AudioListItemProps {
  audio: Audio;
  removeArtistName?: boolean;
}

const AudioListItem: React.FC<AudioListItemProps> = ({
  audio,
  removeArtistName = false,
}) => {
  const picture = useMemo(() => {
    return audio?.picture
      ? `https://audiochan.s3.amazonaws.com/${audio.picture}`
      : "";
  }, [audio]);

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
      <Box>
        <Picture src={picture} size={125} borderRightWidth="1px" />
      </Box>
      <Flex width="100%" paddingY={2} paddingX={4}>
        <Box flex="3">
          <Heading as="h3" size="md">
            <NextLink href={`/audios/${audio.id}`} passHref>
              <LinkOverlay href={``}>{audio.title}</LinkOverlay>
            </NextLink>
          </Heading>
          {!removeArtistName && <Text as="i">{audio.user.username}</Text>}
        </Box>
        <Flex flex="1" justify="flex-end">
          <Stack direction="column" spacing={1} textAlign="right">
            <div>
              <Badge>{audio.genre?.name}</Badge>
            </div>
            <div>
              <Text fontSize="sm">{formatDuration(audio.duration)}</Text>
            </div>
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
