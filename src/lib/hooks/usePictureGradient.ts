import { useColorModeValue } from "@chakra-ui/react";

export function usePictureGradient(): [string, string] {
  const color1 = useColorModeValue("gray.500", "gray.900");
  const color2 = useColorModeValue("gray.400", "gray.800");
  return [color1, color2];
}