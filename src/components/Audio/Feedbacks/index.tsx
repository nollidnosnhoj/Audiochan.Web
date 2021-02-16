import { Box, BoxProps, Heading } from "@chakra-ui/react";
import React from "react";

interface AudioFeedbacksProps {
  audioId: number;
}

export default function AudioFeedbacks(props: AudioFeedbacksProps & BoxProps) {
  const { audioId, ...boxProps } = props;

  return (
    <Box {...boxProps}>
      <Heading>Feedbacks Coming Soon</Heading>
    </Box>
  );
}
