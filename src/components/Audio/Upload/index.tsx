import { Box, Flex, Icon, Text, VStack } from "@chakra-ui/react";
import React, { useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FaCloudUploadAlt } from "react-icons/fa";
import SETTINGS from "~/constants/settings";
import { formatFileSize } from "~/utils/format";
import { errorToast } from "~/utils/toast";
import AudioUploading from "./Uploading";

interface AudioUploadProps {
  maxFileSize?: number;
  validContentTypes?: string[];
}

export default function AudioUpload(props: AudioUploadProps) {
  const {
    maxFileSize = SETTINGS.UPLOAD.AUDIO.maxSize,
    validContentTypes = SETTINGS.UPLOAD.AUDIO.accept,
  } = props;

  const [file, setFile] = useState<File | null>(null);

  const { getRootProps, getInputProps, isDragReject } = useDropzone({
    multiple: false,
    maxSize: maxFileSize,
    accept: validContentTypes,
    onDropAccepted: ([drop]) => {
      setFile(drop);
    },
    onDropRejected: (fileRejections) => {
      fileRejections.forEach((fileRejection) => {
        fileRejection.errors.forEach((err) => {
          errorToast({
            title: "Invalid Audio",
            message: err.message,
          });
        });
      });
    },
  });

  const borderColor = useMemo<string>(() => {
    if (isDragReject) return "red.500";
    return "gray.500";
  }, [isDragReject]);

  if (!file) {
    return (
      <Flex
        {...getRootProps()}
        justify="center"
        align="center"
        height="50vh"
        borderRadius={4}
        borderWidth={2}
        borderStyle="dashed"
        borderColor={borderColor}
        cursor="pointer"
      >
        <Box>
          <input {...getInputProps()} />
          <VStack align="center" spacing={2}>
            <Icon as={FaCloudUploadAlt} boxSize={50} />
            <Text>Drop in an audio file or click to upload.</Text>
            <Box textAlign="center" fontSize="xs" textColor="gray.500">
              <Text>
                Maximum file size:{" "}
                {formatFileSize(SETTINGS.UPLOAD.AUDIO.maxSize)}
              </Text>
              <Text>We only accept .mp3 file. (for now)</Text>
            </Box>
          </VStack>
        </Box>
      </Flex>
    );
  }

  return <AudioUploading file={file} />;
}
