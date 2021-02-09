import axios from "axios";
import { Box, Button, Progress, Stack, VStack } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import NextLink from "next/link";
import request from "~/lib/request";
import { useCreateAudio } from "~/lib/services/audio";
import { objectToFormData } from "~/utils";
import { apiErrorToast } from "~/utils/toast";
import useUser from "~/lib/contexts/user_context";

interface AudioUploadingProps {
  file: File;
}

type S3PresignedUrl = {
  id: string;
  url: string;
};

export default function AudioUploading(props: AudioUploadingProps) {
  const { file } = props;
  const { user } = useUser();
  const [presignedUrl, setPresignedUrl] = useState<S3PresignedUrl | undefined>(
    undefined
  );
  const [progress, setProgress] = useState(0);
  const [uploaded, setUploaded] = useState(false);
  const [audioId, setAudioId] = useState(0);
  const { mutateAsync: uploadAudio } = useCreateAudio();

  useEffect(() => {
    if (file && user) {
      request<S3PresignedUrl>("upload", {
        method: "post",
        data: { fileName: file.name },
      })
        .then(({ data }) => {
          setPresignedUrl(data);
        })
        .catch((err) => apiErrorToast(err));
    }
  }, [file, user]);

  useEffect(() => {
    if (presignedUrl && user) {
      axios
        .put(presignedUrl.url, file, {
          headers: {
            "Content-Type": file.type,
            "Content-Disposition": `inline; filename='${file.name}'`,
            "x-amz-meta-userId": `${user.id}`,
          },
          onUploadProgress: (evt) => {
            const currentProgress = (evt.loaded / evt.total) * 100;
            setProgress(currentProgress);
          },
        })
        .then(() => {
          setUploaded(true);
          var audio = new Audio();
          audio.src = window.URL.createObjectURL(file);
          audio.onloadedmetadata = () => {
            const body = {
              uploadId: presignedUrl.id,
              fileName: file.name,
              duration: Math.round(audio.duration),
            };

            var formData = objectToFormData(body);

            uploadAudio(formData)
              .then(({ id }) => setAudioId(id))
              .catch((err) => apiErrorToast(err));
          };
        })
        .catch((err) => console.log(err.response.data));
    }
  }, [presignedUrl]);

  return (
    <Stack direction="column" spacing={4}>
      <Progress
        hasStripe
        value={progress}
        isAnimated
        isIndeterminate={uploaded && audioId === 0}
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
