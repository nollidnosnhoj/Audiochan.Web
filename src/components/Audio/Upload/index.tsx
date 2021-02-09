import { Box, Divider, Flex, Icon, Text, VStack } from "@chakra-ui/react";
import React, { useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FaCloudUploadAlt } from "react-icons/fa";
import SETTINGS from "~/constants/settings";
import { EditAudioRequest } from "~/lib/types/audio";
import { formatFileSize } from "~/utils/format";
import { errorToast } from "~/utils/toast";
import AudioUploadDropzone from "./Dropzone";
import AudioUploadForm from "./Form";
import AudioUploading from "./Uploading";

interface AudioUploadProps {
  maxFileSize?: number;
  validContentTypes?: string[];
}

export default function AudioUpload(props: AudioUploadProps) {
  const [file, setFile] = useState<File | undefined>(undefined);
  const [form, setForm] = useState<EditAudioRequest | undefined>(undefined);

  if (file && form) {
    return <AudioUploading file={file} form={form} />;
  }

  return (
    <React.Fragment>
      <AudioUploadDropzone
        files={file ? [file] : []}
        onDropAccepted={(files) => {
          setFile(files[0]);
        }}
      />
      <AudioUploadForm file={file} onSubmit={(values) => setForm(values)} />
    </React.Fragment>
  );
}
