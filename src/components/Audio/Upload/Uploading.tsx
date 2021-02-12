import axios from "axios";
import { Box, Flex, Heading, Progress, Stack, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import Router from "next/router";
import { addAudioPicture, useCreateAudio } from "~/lib/services/audio";
import useUser from "~/lib/contexts/user_context";
import { AudioRequest } from "~/lib/types/audio";
import { objectToFormData } from "~/utils";
import api from "~/utils/api";
import { successfulToast } from "~/utils/toast";

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
  const [error, setError] = useState("");
  const { mutateAsync: createAudio } = useCreateAudio();

  useEffect(() => {
    if (file && user) {
      // Get Pre-Signed Url from Server
      api
        .post<S3PresignedUrl>("upload", { fileName: file.name })
        .then(({ data }) => {
          setStage(1);
          // Upload binary file using the provided upload link
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
              // Get additional audio information from audio element,
              // and send a request to the server to create audio using
              // the provided upload id
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
                    // TODO: Add logging
                    setError(
                      "Unable to create audio. Please contact administrators."
                    );
                  });
              };
            })
            .catch(() => {
              // TODO: Add logging
              setError(
                "Unable to upload audio. Please contact administrators."
              );
            });
        })
        .catch(() => {
          // TODO: Add logging
          setError("Unable to upload audio. Please contact administrators.");
        });
    }
  }, [file]);

  // Once the audio is created (audioId is provided)
  // Upload picture if provided.
  useEffect(() => {
    if (audioId > 0 && picture) {
      addAudioPicture(audioId, picture)
        .catch((err) => {
          // TODO: Add Logging
        })
        .finally(() => {
          setCompleted(true);
        });
    }
  }, [audioId, picture]);

  // Once the state of the uploading process is completed,
  // Push the user into the audio detail page.
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

  if (!file) {
    return <Text>File is required.</Text>;
  }

  if (error) {
    <Flex justify="center" align="center" height="50vh">
      <Heading>{error}</Heading>
    </Flex>;
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
