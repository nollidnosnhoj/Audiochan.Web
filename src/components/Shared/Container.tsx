import React from "react";
import { Box, BoxProps } from "@chakra-ui/react";

const Container: React.FC<BoxProps> = (props) => {
  return (
    <Box
      w="full"
      mx="auto"
      maxW="1200px"
      px={{ base: "2", md: "6" }}
      {...props}
    >
      {props.children}
    </Box>
  );
};

export default Container;
