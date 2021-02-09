import axios from "axios";
import {
  Box,
  Button,
  Heading,
  Progress,
  Stack,
  VStack,
} from "@chakra-ui/react";
import React, { useCallback, useEffect, useState } from "react";
import NextLink from "next/link";
import request from "~/lib/request";
import { useCreateAudio } from "~/lib/services/audio";
import { objectToFormData } from "~/utils";
import { apiErrorToast } from "~/utils/toast";
import useUser from "~/lib/contexts/user_context";
import { EditAudioRequest } from "~/lib/types/audio";

interface AudioUploadingProps {
  file: File;
  form?: EditAudioRequest;
}

type S3PresignedUrl = {
  uploadId: string;
  url: string;
};

const STAGE_MESSAGES = [
  "Getting Upload URL...",
  "Uploading Audio...",
  "Creating Audio Record...",
  "Finished Uploading!",
];

export default function AudioUploading(props: AudioUploadingProps) {
  const { file, form } = props;
  const { user } = useUser();
  const [uploadData, setUploadData] = useState<S3PresignedUrl | undefined>(
    undefined
  );
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [audioId, setAudioId] = useState(0);
  const { mutateAsync: uploadAudio } = useCreateAudio();

  if (!file || !user) {
    return null;
  }

  useEffect(() => {
    if (file) {
      setAudioId(0);
      request<S3PresignedUrl>("upload", {
        method: "post",
        data: { fileName: file.name },
      })
        .then(({ data }) => {
          setUploadData(data);
        })
        .catch((err) => {
          apiErrorToast(err);
        });
    }
  }, [file]);

  useEffect(() => {
    if (uploadData) {
      const { url, uploadId } = uploadData;
      setStage(1);
      axios
        .put(url, file, {
          headers: {
            "Content-Type": file.type,
            "x-amz-meta-userId": `${user.id}`,
          },
          onUploadProgress: (evt) => {
            const currentProgress = (evt.loaded / evt.total) * 100;
            setProgress(currentProgress);
          },
        })
        .then(() => {
          setStage(2);
          var audio = new Audio();
          audio.src = window.URL.createObjectURL(file);
          audio.onloadedmetadata = () => {
            const body = {
              uploadId: uploadId,
              fileName: file.name,
              duration: Math.round(audio.duration),
              ...form,
            };

            console.log(body);

            var formData = objectToFormData(body);

            uploadAudio(formData)
              .then(({ id }) => {
                setStage(3);
                setAudioId(id);
              })
              .catch((err) => {
                apiErrorToast(err);
              });
          };
        })
        .catch((err) => {
          apiErrorToast(err);
        });
    }
  }, [uploadData]);

  return (
    <Stack direction="column" spacing={4}>
      <Heading>{STAGE_MESSAGES[stage]}</Heading>
      <Progress
        hasStripe
        value={progress}
        isAnimated={stage !== 3}
        isIndeterminate={stage !== 1}
      />
      {audioId > 0 && (
        <Box>
          <NextLink href={`audios/${audioId}`} passHref>
            <Button>Go to audio</Button>
          </NextLink>
        </Box>
      )}
    </Stack>
  );
}
