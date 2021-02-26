import { Box, BoxProps, Image, VStack } from "@chakra-ui/react";
import React from "react";
import NextImage from "next/image";
import { usePictureGradient } from "~/hooks/usePictureGradient";
import PictureDropzone from "./PictureDropzone";

interface PictureProps {
  src: string;
  size: number;
  isEager?: boolean;
  disableNextImage?: boolean;
  canReplace?: boolean;
  onReplace?: (imageData: string) => void;
  disabled?: boolean;
}

const Picture: React.FC<PictureProps & BoxProps> = ({
  src,
  size,
  onReplace,
  canReplace = false,
  isEager = false,
  disableNextImage = false,
  disabled = false,
  children,
  ...props
}) => {
  const [color1, color2] = usePictureGradient();
  return (
    <VStack>
      <Box
        bgGradient={`linear(to-r, ${color1}, ${color2})`}
        boxSize={size}
        {...props}
      >
        {src && !disableNextImage ? (
          <NextImage
            src={src}
            width={size}
            height={size}
            loading={isEager ? "eager" : "lazy"}
          />
        ) : (
          <Image src={src} height={size} />
        )}
      </Box>
      {canReplace && (
        <PictureDropzone
          name="image"
          image={src}
          disabled={disabled}
          onChange={async (file) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
              if (onReplace) {
                onReplace(reader.result as string);
              }
            };
          }}
        />
      )}
    </VStack>
  );
};

export default Picture;
