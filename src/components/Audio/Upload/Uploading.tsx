import axios from "axios";
import {
  Box,
  Button,
  Flex,
  Heading,
  Progress,
  Spinner,
  Stack,
  VStack,
} from "@chakra-ui/react";
import React, { useCallback, useEffect, useState } from "react";
import Router from "next/router";
import NextLink from "next/link";
import request from "~/lib/request";
import {
  addAudioPicture,
  useAddAudioPicture,
  useCreateAudio,
} from "~/lib/services/audio";
import { objectToFormData } from "~/utils";
import { apiErrorToast, errorToast, successfulToast } from "~/utils/toast";
import useUser from "~/lib/contexts/user_context";
import { AudioRequest } from "~/lib/types/audio";

interface AudioUploadingProps {
  file: File;
  form?: AudioRequest;
  picture?: string;
}

type S3PresignedUrl = {
  uploadId: string;
  url: string;
};

const STAGE_MESSAGES = [
  "Getting Upload URL",
  "Uploading Audio",
  "Creating Audio Record",
  "Uploading Picture",
];

export default function AudioUploading(props: AudioUploadingProps) {
  const { file, form, picture } = props;
  const { user } = useUser();
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [audioId, setAudioId] = useState(0);
  const [completed, setCompleted] = useState(false);
  const { mutateAsync: createAudio } = useCreateAudio();

  useEffect(() => {
    if (file && user) {
      request<S3PresignedUrl>("upload", {
        method: "post",
        data: { fileName: file.name },
      })
        .then(({ data }) => {
          setStage(1);
          const { url, uploadId } = data;
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
                  fileSize: file.size,
                  ...form,
                };

                createAudio(objectToFormData(body))
                  .then(({ id }) => {
                    setAudioId(id);
                    if (picture) {
                      setStage(3);
                    } else {
                      setCompleted(true);
                    }
                  })
                  .catch((err) => {
                    apiErrorToast(err);
                  });
              };
            })
            .catch(() => {
              errorToast({
                message: "Unable to upload audio.",
              });
            });
        })
        .catch(() => {
          errorToast({ message: "Unable to receive upload Url." });
        });
    }
  }, [file]);

  useEffect(() => {
    if (audioId > 0 && picture) {
      addAudioPicture(audioId, picture)
        .then(() => {
          setCompleted(true);
        })
        .catch((err) => apiErrorToast(err));
    }
  }, [audioId, picture]);

  useEffect(() => {
    if (completed && audioId > 0) {
      Router.push(`audios/${audioId}`).then(() => {
        successfulToast({
          title: "Audio uploaded",
          message: "You have successfully uploaded your audio.",
        });
      });
    }
  }, [completed, audioId]);

  if (!file || !user) {
    return null;
  }

  return (
    <Flex justify="center" align="center" height="50vh">
      <Stack direction="column" spacing={8}>
        <Heading>
          {!completed ? STAGE_MESSAGES[stage] : `Audio Uploaded!`}
        </Heading>
        <Box justifyContent="center" alignItems="center">
          {!completed && (
            <Progress
              hasStripe
              value={progress}
              isAnimated
              isIndeterminate={stage !== 1}
            />
          )}
        </Box>
      </Stack>
    </Flex>
  );
}
