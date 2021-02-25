import { Box, BoxProps, Heading, Text } from "@chakra-ui/react";
import React from "react";

interface AudioFeedbacksProps {
  audioId: number;
}

export default function AudioFeedbacks(props: AudioFeedbacksProps & BoxProps) {
  const { audioId, ...boxProps } = props;

  return (
    <Box {...boxProps}>
      <Text as="i">Feedbacks Coming Soon</Text>
    </Box>
  );
}
