import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import Router from "next/router";
import React, { useEffect } from "react";
import { relativeDate } from "~/utils/time";
import Link from "../Shared/Link";

interface AudioMetaProps {
  title: string;
  description: string;
  created: string | Date;
  username: string;
}

const AudioDetails: React.FC<AudioMetaProps> = ({
  title,
  description,
  created,
  username,
}) => {
  useEffect(() => {
    Router.prefetch(`/users/${username}`);
  }, []);

  return (
    <Flex marginBottom={4}>
      <Box flex="1">
        <Flex alignItems="center">
          <Link href={`/users/${username}`}>
            <Text fontSize="sm">{username}</Text>
          </Link>
        </Flex>
        <Heading as="h1" fontSize="3xl" paddingY="2">
          {title}
        </Heading>
        <Text fontSize="sm">{description}</Text>
        <Text fontSize="xs" as="i">
          Uploaded {relativeDate(created)}
        </Text>
      </Box>
    </Flex>
  );
};

export default AudioDetails;
