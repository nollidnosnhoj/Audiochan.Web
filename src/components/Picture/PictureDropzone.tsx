import { Box, chakra, Tooltip, useDisclosure } from "@chakra-ui/react";
import React from "react";
import { useDropzone } from "react-dropzone";
import PictureCropModal from "./PictureCropModal";
import SETTINGS from "~/constants/settings";
import { errorToast } from "~/utils/toast";

interface PictureDropzoneProps {
  image?: string;
  onChange: (imageData: string) => void;
  disabled?: boolean;
}

const PictureDropzone: React.FC<PictureDropzoneProps> = ({
  image,
  onChange,
  disabled = false,
  children,
}) => {
  const {
    isOpen: isImageCropModalOpen,
    onOpen: openImageCropModal,
    onClose: closeImageCropModal,
  } = useDisclosure();
  const { open, getInputProps, acceptedFiles } = useDropzone({
    accept: SETTINGS.UPLOAD.IMAGE.accept,
    maxSize: SETTINGS.UPLOAD.IMAGE.maxSize,
    multiple: false,
    onDropAccepted: () => {
      /** open crop modal */
      openImageCropModal();
    },
    onDropRejected: ([fileRejection]) => {
      /** Display error toasts */
      fileRejection.errors.forEach((err) => {
        errorToast({
          title: "Invalid Image",
          message: err.message,
        });
      });
    },
  });

  return (
    <Box>
      <input {...getInputProps()} />
      <Tooltip label={image ? "Replace Image" : "Upload Image"}>
        <chakra.span
          onClick={() => {
            if (!disabled) open();
          }}
          cursor="pointer"
        >
          {children}
        </chakra.span>
      </Tooltip>
      <PictureCropModal
        file={acceptedFiles[0]}
        isOpen={isImageCropModalOpen}
        onClose={closeImageCropModal}
        onCropped={(croppedFile) => {
          onChange(croppedFile);
        }}
      />
    </Box>
  );
};

export default PictureDropzone;
