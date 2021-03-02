import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  ModalHeader,
  Box,
} from "@chakra-ui/react";
import React, { PropsWithChildren, useEffect, useState } from "react";
import ReactCropper from "react-cropper";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";

interface PictureCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCropped: (croppedData: string) => void;
  file?: File;
}

export default function PictureCropModal({
  isOpen,
  onClose,
  file,
  onCropped,
}: PropsWithChildren<PictureCropModalProps>) {
  const [image, setImage] = useState<string>("");
  const [cropper, setCropper] = useState<Cropper | null>(null);

  /** Load image from File */
  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImage(reader.result as string);
      });
      reader.readAsDataURL(file);
    } else {
      setImage("");
      setCropper(null);
    }
  }, [file, cropper]);

  /** Crop the image and return canvas into Blob */
  const handleCropped = () => {
    if (!cropper) return;

    const canvasData: HTMLCanvasElement = cropper.getCroppedCanvas();

    setImage("");
    onCropped(canvasData.toDataURL());

    /** Close modal */
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader></ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box marginTop={4}>
            <ReactCropper
              src={image}
              aspectRatio={1}
              checkOrientation={false}
              initialAspectRatio={1}
              autoCrop
              onInitialized={(instance) => setCropper(instance)}
              viewMode={3}
              cropBoxMovable={false}
              cropBoxResizable={false}
              dragMode="move"
              wheelZoomRatio={0.4}
            />
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="primary" onClick={handleCropped}>
            Crop
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
