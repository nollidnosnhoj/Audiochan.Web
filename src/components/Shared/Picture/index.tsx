import { Flex, FlexProps, Image } from "@chakra-ui/react";
import React, { useMemo } from "react";
import NextImage from "next/image";
import { usePictureGradient } from "~/lib/hooks/usePictureGradient";

interface PictureProps {
  src: string;
  size: number;
  isEager?: boolean;
  disableNextImage?: boolean;
}

const Picture: React.FC<PictureProps & FlexProps> = ({
  src,
  size,
  isEager = false,
  disableNextImage = false,
  children,
  ...props
}) => {
  const [color1, color2] = usePictureGradient();
  const isBlob = useMemo<boolean>(() => src.startsWith("blob:"), [src]);
  return (
    <Flex
      bgGradient={`linear(to-r, ${color1}, ${color2})`}
      boxSize={size}
      {...props}
    >
      {src && !disableNextImage && !isBlob ? (
        <NextImage
          src={src}
          width={size}
          height={size}
          loading={isEager ? "eager" : "lazy"}
        />
      ) : (
        <Image src={src} height={size} />
      )}
    </Flex>
  );
};

export default Picture;
