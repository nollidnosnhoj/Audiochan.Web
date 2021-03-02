import { Box, Button, useDisclosure } from "@chakra-ui/react";
import React from "react";
import { useDropzone } from "react-dropzone";
import PictureCropModal from "./PictureCropModal";
import SETTINGS from "~/constants/settings";
import { errorToast } from "~/utils/toast";

interface PictureDropzoneProps {
  name: string;
  onChange: (imageData: string) => void;
  image?: string;
  disabled?: boolean;
}

const PictureDropzone: React.FC<PictureDropzoneProps> = ({
  name,
  image,
  onChange,
  disabled = false,
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
    <Box marginY={4}>
      <input {...getInputProps({ name })} />
      <Button size="sm" onClick={open} disabled={disabled}>
        {image ? "Replace Image" : "Upload Image"}
      </Button>
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
